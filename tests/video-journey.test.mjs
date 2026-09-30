import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VideoJourney } from '../src/video-journey.js';
globalThis.document = { hidden: false };
function player() {
  const video = { src: '', currentTime: 0, readyState: 2, seeking: false, dataset: {}, style: {}, getAttribute() { return this.src; } };
  return Object.assign(Object.create(VideoJourney.prototype), {
    video, source: '/optimized.mp4', target: 284, displayed: -1,
    paused: false, disposed: false, settleStill() {},
  });
}
test('paused and hidden visits do not attach the video source', () => {
  const j = player(); j.paused = true; j.pump(); assert.equal(j.video.src, '');
  j.paused = false; document.hidden = true; j.pump(); assert.equal(j.video.src, '');
  document.hidden = false; j.pump(); assert.equal(j.video.src, '/optimized.mp4');
});
test('an outstanding seek is not restarted; next pump uses the latest scroll target', () => {
  const j = player(); j.video.src = j.source; j.video.seeking = true;
  j.pump(); assert.equal(j.video.currentTime, 0);
  j.target = 37; j.video.seeking = false; j.pump();
  assert.equal(j.video.currentTime, 37 / 24);
});
test('zero and final frame are valid and exact holds settle', () => {
  const j = player(); j.video.src = j.source; let settled = 0; j.settleStill = () => settled++;
  for (const frame of [0, 284, 422]) {
    j.target = frame; j.video.currentTime = frame / 24; j.pump();
    assert.equal(j.displayed, frame); assert.equal(j.video.dataset.frame, String(frame));
  }
  assert.equal(settled, 3);
});
test('loading and disposed renderers do not seek', () => {
  const j = player(); j.video.src = j.source; j.video.readyState = 1; j.pump();
  assert.equal(j.video.currentTime, 0); j.video.readyState = 2; j.disposed = true; j.pump();
  assert.equal(j.video.currentTime, 0);
});
