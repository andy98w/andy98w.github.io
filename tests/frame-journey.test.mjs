import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FrameJourney } from '../src/frame-journey.js';

globalThis.document = { hidden: false };
let raf = new Map(), nextId = 0;
globalThis.requestAnimationFrame = fn => { raf.set(++nextId, fn); return nextId; };
globalThis.cancelAnimationFrame = id => raf.delete(id);
const tick = time => { const callbacks = [...raf.values()]; raf.clear(); callbacks.forEach(fn => fn(time)); };
function journey() {
  return Object.assign(Object.create(FrameJourney.prototype), {
    target: 50, displayed: 49, count: 423, direction: 1, cacheLimit: 16,
    cache: new Map(), pending: new Map(), failed: new Set(),
    paused: false, disposed: false, draw() {}, settleStill() {},
    url: index => String(index), scheduleDraw() {},
  });
}
test('settling reaches the hold on schedule even when no intermediate frame arrives', () => {
  raf.clear(); const j = journey(); const requested = []; j.pump = () => requested.push(j.wantedFrames()[0]);
  const start = performance.now(); j.stepToHold(37);
  assert.equal(requested[0], 37);
  tick(start + 200);
  assert.equal(j.target, 37); assert.equal(j.settleTarget, null); assert.equal(raf.size, 0);
});
test('pause stops settling without changing the target', () => {
  raf.clear(); const j = journey(); j.pump = () => {}; j.stepToHold(37); j.paused = true;
  tick(performance.now() + 200); assert.equal(j.target, 50); assert.equal(raf.size, 0);
});
test('new scroll input cancels a pending settle animation', () => {
  raf.clear(); const j = journey(); j.pump = () => {}; j.stopWarming = () => {};
  j.still = {classList:{remove(){}}}; j.holds = new Map([[0, 'first']]); j.planWarming = () => {};
  j.stepToHold(37); j.setProgress(0.8); tick(performance.now() + 200);
  assert.equal(j.target, Math.round(422 * 0.8)); assert.equal(j.settleTarget, null);
});
test('nearby in-flight requests survive when the target is already loading', () => {
  const j = journey(); for (const i of [49,50,51,52]) j.pending.set(i,new AbortController());
  j.pump(); assert.equal([...j.pending.values()].some(c => c.signal.aborted), false);
});
test('a distant jump frees only one slot and prioritizes the destination', () => {
  const j = journey(); const old = [1,2,3,4].map(i => { const c=new AbortController(); j.pending.set(i,c); return c; });
  const requests=[]; globalThis.fetch = (url,options) => { requests.push({url,options}); return new Promise(()=>{}); };
  j.pump(); assert.equal(old.filter(c=>c.signal.aborted).length,1);
  assert.equal(requests[0].url,'50'); assert.equal(requests[0].options.priority,'high'); assert.equal(j.pending.size,4);
});
test('late completion cannot delete a newer request for the same frame', async () => {
  const j = journey(); let reject; globalThis.fetch = () => new Promise((_,r) => { reject ??= r; });
  j.pump(); const newer = new AbortController(); j.pending.set(50,newer);
  j.paused=true; reject(Object.assign(new Error('aborted'),{name:'AbortError'}));
  await new Promise(resolve=>setImmediate(resolve)); assert.equal(j.pending.get(50),newer);
});
test('prefetch indices stay unique and within the sequence on reverse and endpoints', () => {
  const j=journey(); for (const target of [0,1,200,422]) for(const direction of [-1,1]) {
    j.target=target;j.direction=direction; const wanted=j.wantedFrames();
    assert.equal(wanted[0],target); assert.equal(new Set(wanted).size,wanted.length);
    assert.ok(wanted.every(i=>i>=0 && i<423));
  }
});
test('disposing cancels settling, aborts requests, and releases decoded bitmaps', () => {
  raf.clear();const j=journey();j.pump=()=>{};j.stopWarming=()=>{};
  j.still={remove(){}};j.canvas={remove(){}};
  let closed=0;j.cache.set(50,{close(){closed++;}});
  const controller=new AbortController();j.pending.set(51,controller);
  j.stepToHold(37);j.dispose();tick(performance.now()+200);
  assert.equal(j.target,50);assert.equal(closed,1);assert.equal(j.cache.size,0);
  assert.ok(controller.signal.aborted);assert.equal(raf.size,0);
});
