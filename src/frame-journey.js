// Bounded decoded-frame cache: never retain the entire 4K sequence in memory.
export class FrameJourney {
  constructor(host, segments) {
    this.segments = segments;
    this.assetVersion = 'delivery-1080-v1';
    this.count = segments.reduce((sum, segment) => sum + segment.count, 0);
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'journey-video';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.context = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!this.context) throw new Error('Canvas unavailable');
    this.context.imageSmoothingQuality = 'medium';
    this.cache = new Map();
    this.pending = new Map();
    this.direction = 1;
    this.cacheLimit = innerWidth < 768 ? 8 : 16;
    this.drawRequest = 0;
    this.warmed = new Set();
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
      this.still.src = this.stillUrl(name);
    }
    if (this.still.complete && this.still.naturalWidth) {
      this.stillTimer = setTimeout(() => {
        if (this.holds.get(this.target) === name && this.displayed === this.target)
          this.still.classList.add('is-visible');
      }, 60);
    }
  }
  stillUrl(name) {
    return `/assets/hold-stills/${name}.webp?v=reconstruction-1`;
  }
  stopWarming() {
    clearTimeout(this.warmTimer);
    clearTimeout(this.nearStillTimer);
    this.warmController?.abort();
    this.warmController = null;
    this.nearStillController?.abort();
    this.warmTimer = null;
    this.nearStillName = null;
  }
  canWarm() {
    const connection = globalThis.navigator?.connection;
    return !this.disposed && !this.paused && !document.hidden &&
      !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType);
  }
  async warmUrl(url, signal) {
    if (this.warmed.has(url) || signal.aborted) return;
    const response = await fetch(url, { signal, cache: 'force-cache', priority: 'low' });
    if (!response.ok) return;
    await response.arrayBuffer(); // Fill HTTP cache without retaining decoded images.
    if (signal.aborted || this.disposed) return;
    this.warmed.add(url);
    if (this.warmed.size > 96) this.warmed.delete(this.warmed.values().next().value);
  }
  planWarming(nearest) {
    if (!this.canWarm()) return;
    const name = this.holds.get(nearest);
    if (name && this.nearStillName !== name) {
      clearTimeout(this.nearStillTimer);
      this.nearStillController?.abort();
      this.nearStillName = name;
      this.nearStillTimer = setTimeout(() => {
        if (!this.canWarm()) return;
        this.nearStillController = new AbortController();
        this.warmUrl(this.stillUrl(name), this.nearStillController.signal).catch(() => {});
      }, 100);
    }
    if (!this.warmTimer && !this.warmController) this.warmTimer = setTimeout(() => this.warmStretch(), 900);
  }
  async warmStretch() {
    this.warmTimer = null;
    if (!this.canWarm()) return;
    if (this.pending.size) {
      this.warmTimer = setTimeout(() => this.warmStretch(), 300);
      return;
    }
    const controller = new AbortController();
    this.warmController = controller;
    const origin = this.target, direction = this.direction;
    try {
      // One speculative request at a time; resume motion cancels this work.
      for (let step = 1; step <= 32; step++) {
        const index = origin + step * direction;
        if (!this.canWarm() || controller.signal.aborted || index < 0 || index >= this.count) break;
        if (this.cache.has(index) || this.pending.has(index)) continue;
        await this.warmUrl(this.url(index), controller.signal);
      }
    } catch { /* Speculative failures must not affect the visible sequence. */ }
    finally { if (this.warmController === controller) this.warmController = null; }
  }
  url(index) {
    for (const segment of this.segments) {
      if (index < segment.count) return `${segment.path}/${String(index).padStart(3, '0')}.jpg?v=${this.assetVersion}`;
      index -= segment.count;
    }
  }
  resize() {
    // The delivery frames are 1080p. Capping the backing store avoids painting a
    // 4K canvas on Retina screens when the source cannot add more detail.
    const dpr = Math.min(devicePixelRatio || 1, 1.25);
    const ratio = Math.min(1, 1920 / (innerWidth * dpr), 1080 / (innerHeight * dpr));
    this.canvas.width = Math.round(innerWidth * dpr * ratio);
    this.canvas.height = Math.round(innerHeight * dpr * ratio);
    this.displayed = -1;
    this.draw();
  }
  setProgress(value) {
    clearTimeout(this.snapTimer);
    cancelAnimationFrame(this.snapRequest);
    this.settleTarget = null;
    if (this.paused || this.disposed || document.hidden) return;
    const previous = this.target;
    this.target = Math.round(Math.max(0, Math.min(1, value)) * (this.count - 1));
    if (previous !== this.target) {
      this.stopWarming();
      this.direction = Math.sign(this.target - previous);
      clearTimeout(this.stillTimer);
      this.still.classList.remove('is-visible');
    }
    if (this.paused || this.disposed || document.hidden) return;
    this.scheduleDraw();
    this.pump();
    // Only settle within eighteen source frames; never pull the camera across a room.
    const nearest = [...this.holds.keys()].sort((a, b) => Math.abs(a - this.target) - Math.abs(b - this.target))[0];
    this.planWarming(nearest);
    if (Math.abs(nearest - this.target) <= 18 && nearest !== this.target) {
      this.snapTimer = setTimeout(() => this.stepToHold(nearest), 100);
    }
  }
  stepToHold(index) {
    if (this.paused || this.disposed || document.hidden) return;
    const origin = this.target;
    const started = performance.now();
    this.settleTarget = index;
    this.direction = Math.sign(index - origin) || this.direction;
    // Request the destination now; intermediate downloads cannot gate arrival.
    this.pump();
    const advance = (now) => {
      this.snapRequest = 0;
      if (this.paused || this.disposed || document.hidden) {
        this.settleTarget = null;
        return;
      }
      const progress = Math.min(1, (now - started) / 160);
      const eased = 1 - (1 - progress) ** 3;
      this.target = Math.round(origin + (index - origin) * eased);
      this.draw();
      this.pump();
      if (progress < 1) this.snapRequest = requestAnimationFrame(advance);
      else {
        this.settleTarget = null;
        this.settleStill();
      }
    };
    this.snapRequest = requestAnimationFrame(advance);
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
  scheduleDraw() {
    if (this.drawRequest || this.disposed) return;
    this.drawRequest = requestAnimationFrame(() => {
      this.drawRequest = 0;
      if (!this.disposed) this.draw();
    });
  }
  wantedFrames() {
    const direction = this.direction;
    const ahead = this.cacheLimit - 4;
    return [...new Set([this.settleTarget, this.target, this.target + direction, this.target - direction,
      ...Array.from({ length: ahead - 1 }, (_, i) => this.target + direction * (i + 2)),
      this.target - direction * 2])].filter(index => index != null && index >= 0 && index < this.count);
    }
  pump() {
    if (this.paused || this.disposed || document.hidden) return;
    const wanted = this.wantedFrames();
    // Keep nearby requests alive across scroll ticks. Reserve capacity for the
    // visible destination only when all four slots are occupied by older work.
    const urgent = this.settleTarget ?? this.target;
    if (!this.cache.has(urgent) && !this.pending.has(urgent) &&
        !this.failed.has(urgent) && this.pending.size >= 4) {
      const victim = [...this.pending.keys()]
        .sort((a, b) => Math.abs(b - urgent) - Math.abs(a - urgent))[0];
      this.pending.get(victim).abort();
      this.pending.delete(victim);
    }
    for (const index of wanted) {
      if (this.pending.size >= 4) break;
      if (this.cache.has(index) || this.pending.has(index) || this.failed.has(index)) continue;
      const controller = new AbortController();
      this.pending.set(index, controller);
      fetch(this.url(index), { signal: controller.signal, cache: 'force-cache',
        priority: index === urgent ? 'high' : 'low' })
        .then(response => { if (!response.ok) throw new Error('Frame unavailable'); return response.blob(); })
        .then(blob => {
          // Scroll jumps can make downloaded frames obsolete before decoding.
          if (this.disposed || controller.signal.aborted || Math.abs(index - this.target) > this.cacheLimit && index !== this.settleTarget) return null;
          return createImageBitmap(blob);
        })
        .then(bitmap => {
          if (!bitmap) return;
          if (this.disposed || controller.signal.aborted || (Math.abs(index - this.target) > this.cacheLimit && index !== this.settleTarget)) {
            bitmap.close(); return;
          }
          this.cache.set(index, bitmap);
          const currentWanted = this.wantedFrames();
          const farthest = [...this.cache.keys()].sort((a, b) =>
            Number(currentWanted.includes(a)) - Number(currentWanted.includes(b)) ||
            Math.abs(b - this.target) - Math.abs(a - this.target));
          while (this.cache.size > this.cacheLimit) {
            const victim = farthest.shift();
            this.cache.get(victim).close(); this.cache.delete(victim);
          }
          this.scheduleDraw();
        })
        .catch(error => { if (error.name !== 'AbortError') this.failed.add(index); })
        .finally(() => {
          // An aborted request may finish after a newer request for this index.
          if (this.pending.get(index) === controller) this.pending.delete(index);
          this.pump();
        });
    }
  }
  dispose() {
    this.disposed = true;
    this.stopWarming();
    cancelAnimationFrame(this.drawRequest);
    cancelAnimationFrame(this.snapRequest);
    clearTimeout(this.snapTimer);
    clearTimeout(this.stillTimer);
    this.still.remove();
    for (const controller of this.pending.values()) controller.abort();
    for (const bitmap of this.cache.values()) bitmap.close();
    this.cache.clear();
    this.canvas.remove();
  }
}
