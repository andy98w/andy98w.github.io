// Bounded decoded-frame cache: never retain the entire 4K sequence in memory.
export class FrameJourney {
  constructor(host, segments) {
    this.segments = segments;
    this.count = segments.reduce((sum, segment) => sum + segment.count, 0);
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'journey-video';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.context = this.canvas.getContext('2d', { alpha: false });
    if (!this.context) throw new Error('Canvas unavailable');
    this.cache = new Map();
    this.pending = new Map();
    this.failed = new Set();
    this.target = 0;
    this.displayed = -1;
    this.paused = false;
    this.disposed = false;
    this.canvas.style.visibility = 'hidden';
    host.append(this.canvas);
    this.holds = new Map([[0, 'courtyard-detail'], [18, 'detail-18'], [37, 'detail-37'], [74, 'detail-74'], [95, 'detail-95'], [110, 'doorway-approach'], [125, 'doorway-125'], [140, 'doorway-140-faithful'], [153, 'doorway-153'], [165, 'doorway-165-faithful'], [178, 'doorway-178'], [190, 'doorway-190-faithful'], [210, 'threshold'], [220, 'doorway-220'], [230, 'doorway-230'], [247, 'entrance-inside'], [265, 'detail-265'], [284, 'workshop-left-detail'], [307, 'detail-307'], [330, 'desk-approach'], [343, 'detail-343'], [355, 'detail-355'], [380, 'overhead-transition'], [401, 'detail-401'], [422, 'desk']]);
    this.still = document.createElement('img');
    this.still.className = 'journey-still';
    this.still.alt = '';
    this.still.setAttribute('aria-hidden', 'true');
    host.append(this.still);
    this.still.addEventListener('load', () => this.settleStill());
    this.resize();
  }
  settleStill() {
    clearTimeout(this.stillTimer);
    const name = this.holds.get(this.target);
    if (!name || this.displayed !== this.target || this.disposed) {
      this.still.classList.remove('is-visible');
      return;
    }
    if (this.still.dataset.name !== name) {
      this.still.classList.remove('is-visible');
      this.still.dataset.name = name;
      this.still.src = `/assets/hold-stills/${name}.webp?v=reconstruction-1`;
    }
    if (this.still.complete && this.still.naturalWidth) {
      this.stillTimer = setTimeout(() => {
        if (this.holds.get(this.target) === name && this.displayed === this.target)
          this.still.classList.add('is-visible');
      }, 60);
    }
  }
  url(index) {
    for (const segment of this.segments) {
      if (index < segment.count) return `${segment.path}/${String(index).padStart(3, '0')}.jpg`;
      index -= segment.count;
    }
  }
  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const ratio = Math.min(1, 3840 / (innerWidth * dpr), 2160 / (innerHeight * dpr));
    this.canvas.width = Math.round(innerWidth * dpr * ratio);
    this.canvas.height = Math.round(innerHeight * dpr * ratio);
    this.displayed = -1;
    this.draw();
  }
  setProgress(value) {
    clearTimeout(this.snapTimer);
    if (this.paused || this.disposed || document.hidden) return;
    const previous = this.target;
    this.target = Math.round(Math.max(0, Math.min(1, value)) * (this.count - 1));
    if (previous !== this.target) {
      clearTimeout(this.stillTimer);
      this.still.classList.remove('is-visible');
    }
    if (this.paused || this.disposed || document.hidden) return;
    this.draw();
    this.pump();
    // Only settle within eighteen source frames; never pull the camera across a room.
    const nearest = [...this.holds.keys()].sort((a, b) => Math.abs(a - this.target) - Math.abs(b - this.target))[0];
    if (Math.abs(nearest - this.target) <= 18 && nearest !== this.target) {
      this.snapTimer = setTimeout(() => this.stepToHold(nearest), 180);
    }
  }
  stepToHold(index) {
    if (this.paused || this.disposed || document.hidden) return;
    if (this.displayed === this.target) this.target += Math.sign(index - this.target);
    this.draw();
    this.pump();
    if (this.failed.has(this.target)) return;
    if (this.target !== index || this.displayed !== index)
      this.snapTimer = setTimeout(() => this.stepToHold(index), 24);
    else this.settleStill();
  }
  draw() {
    const available = [...this.cache.keys()].sort((a, b) => Math.abs(a - this.target) - Math.abs(b - this.target))[0];
    const bitmap = this.cache.get(available);
    if (!bitmap || this.displayed === available || this.paused) return;
    const scale = Math.max(this.canvas.width / bitmap.width, this.canvas.height / bitmap.height);
    const w = bitmap.width * scale, h = bitmap.height * scale;
    this.context.drawImage(bitmap, (this.canvas.width - w) / 2, (this.canvas.height - h) / 2, w, h);
    this.displayed = available;
    this.canvas.dataset.frame = String(available);
    this.canvas.dataset.cached = String(this.cache.size);
    this.canvas.style.visibility = '';
    this.settleStill();
  }
  pump() {
    if (this.paused || this.disposed || document.hidden) return;
    const wanted = [this.target, this.target + 1, this.target - 1, this.target + 2]
      .filter(index => index >= 0 && index < this.count);
    for (const [index, controller] of this.pending) {
      if (Math.abs(index - this.target) > 244) controller.abort();
    }
    for (const index of wanted) {
      if (this.pending.size >= 2) break;
      if (this.cache.has(index) || this.pending.has(index) || this.failed.has(index)) continue;
      const controller = new AbortController();
      this.pending.set(index, controller);
      fetch(this.url(index), { signal: controller.signal })
        .then(response => { if (!response.ok) throw new Error('Frame unavailable'); return response.blob(); })
        .then(blob => createImageBitmap(blob))
        .then(bitmap => {
          if (this.disposed || controller.signal.aborted || Math.abs(index - this.target) > 24) {
            bitmap.close(); return;
          }
          this.cache.set(index, bitmap);
          const farthest = [...this.cache.keys()].sort((a, b) => Math.abs(b - this.target) - Math.abs(a - this.target));
          while (this.cache.size > 4) {
            const victim = farthest.shift();
            this.cache.get(victim).close(); this.cache.delete(victim);
          }
          this.draw();
        })
        .catch(error => { if (error.name !== 'AbortError') this.failed.add(index); })
        .finally(() => { this.pending.delete(index); this.pump(); });
    }
  }
  dispose() {
    this.disposed = true;
    clearTimeout(this.snapTimer);
    clearTimeout(this.stillTimer);
    this.still.remove();
    for (const controller of this.pending.values()) controller.abort();
    for (const bitmap of this.cache.values()) bitmap.close();
    this.cache.clear();
    this.canvas.remove();
  }
}
