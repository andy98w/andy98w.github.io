import { FrameJourney } from './frame-journey.js';
// Experimental direct video compositor. Enabled only through ?renderer=video.
export class VideoJourney extends FrameJourney {
  constructor(host, segments) {
    super(host, segments);
    this.canvas.remove();
    this.video = document.createElement('video');
    this.video.className = 'journey-video';
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.preload = 'auto';
    this.video.setAttribute('aria-hidden', 'true');
    this.video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
    this.canvas = this.video; // Shared pause/visibility contract.
    host.insertBefore(this.video, this.still);
    this.video.addEventListener('loadeddata', () => this.pump());
    this.video.addEventListener('seeked', () => {
      this.displayed = Math.round(this.video.currentTime * 24);
      this.video.dataset.frame = String(this.displayed);
      this.settleStill();
      if (this.target !== this.displayed) this.pump();
    });
    this.video.src = '/assets/journey-test-4k.mp4';
  }
  resize() {}
  draw() {}
  planWarming() {} // Native video buffering handles moving frames.
  pump() {
    if (!this.video || this.paused || this.disposed || document.hidden || this.video.readyState < 2 || this.video.seeking) return;
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
