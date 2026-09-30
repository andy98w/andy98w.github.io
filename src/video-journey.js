import { FrameJourney } from './frame-journey.js';
// Short-GOP video keeps the scroll route compact and seeks close to each target.
export class VideoJourney extends FrameJourney {
  constructor(host, segments, source, onError) {
    super(host, segments);
    this.canvas.remove();
    this.video = document.createElement('video');
    this.video.className = 'journey-video';
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.preload = 'auto';
    this.source = source || (innerWidth < 768 || navigator.connection?.saveData
      ? '/assets/journey-scrub-720-v2.mp4' : '/assets/journey-scrub-1080-v2.mp4');
    this.onError = onError;
    this.video.setAttribute('aria-hidden', 'true');
    this.video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
    this.video.style.visibility = 'hidden';
    this.canvas = this.video; // Shared pause/visibility contract.
    host.insertBefore(this.video, this.still);
    this.video.addEventListener('loadeddata', () => {
      if (this.disposed) return;
      if (!this.paused) this.video.style.visibility = '';
      this.pump();
    });
    this.video.addEventListener('error', () => {
      if (!this.disposed) this.onError?.();
    }, { once: true });
    this.video.addEventListener('seeked', () => {
      this.displayed = Math.round(this.video.currentTime * 24);
      this.video.dataset.frame = String(this.displayed);
      this.settleStill();
      if (this.target !== this.displayed) this.pump();
    });
    // Attach the source on the first motion update, so reduced-motion and
    // paused visits do not download a video they will never display.
  }
  resize() {}
  draw() {}
  planWarming() {} // Native video buffering handles moving frames.
  pump() {
    if (!this.video || this.paused || this.disposed || document.hidden) return;
    if (!this.video.getAttribute('src')) {
      this.video.src = this.source;
      return;
    }
    if (this.video.readyState < 2 || this.video.seeking) return;
    this.video.style.visibility = '';
    if (Math.abs(this.video.currentTime - this.target / 24) < .001) {
      this.displayed = this.target;
      this.video.dataset.frame = String(this.target);
      this.settleStill();
    } else this.video.currentTime = this.target / 24;
  }
  dispose() {
    super.dispose();
    this.video.pause();
    this.video.removeAttribute('src');
    this.video.load();
  }
}
