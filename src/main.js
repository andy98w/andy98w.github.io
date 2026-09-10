import { journeyProgress } from './journey-progress.js';
// Native dialogs provide keyboard focus trapping, Escape, and screen-reader semantics.
let opener;
for (const button of document.querySelectorAll("[data-project]")) {
  button.addEventListener("click", () => {
    const dialog = document.querySelector(`#detail-${button.dataset.project}`);
    if (!dialog) return;
    opener = button;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add("dialog-open");
  });
}
for (const dialog of document.querySelectorAll(".project-dialog")) {
  dialog
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    opener?.focus({ preventScroll: true });
  });
}


const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const toggle = document.querySelector('.motion-toggle');
const host = document.querySelector('.world-host');
const initialHash = location.hash;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
let journey;
let paused = false;
try { paused = sessionStorage.getItem('andy-motion-paused') === 'true'; } catch {}
let stops = [[0, 0], [1, 1]];
let frame = 0;
function updateCamera() {
  if (!journey || paused || reduced.matches) return;
  if (!frame) frame = requestAnimationFrame(() => {
    frame = 0;
    journey.setProgress(journeyProgress(scrollY, stops));
  });
}
function measure() {
  const work = document.querySelector('#projects').getBoundingClientRect();
  const about = document.querySelector('#about').getBoundingClientRect();
  const workshop = 284 / 422; // Matches Andy’s selected workshop screenshot (desk frame 103).
  const arrive = Math.max(1, work.top + scrollY - innerHeight * .75);
  const leave = Math.max(arrive + 1, work.bottom + scrollY);
  const desk = Math.max(leave + 1, about.top + scrollY - innerHeight * .35);
  stops = [[0, 0], [arrive, workshop], [leave, workshop], [desk, 1]];
  updateCamera();
}
function scrollToSection(target, { animate = false } = {}) {
  const top = target.getBoundingClientRect().top + scrollY - 105;
  const destination = Math.max(0, top);
  scrollTo({
    top: destination,
    behavior: animate && !paused && !reduced.matches ? 'smooth' : 'instant',
  });
}
function settleInitialHash() {
  if (!initialHash || initialHash === '#home') return;
  const target = document.getElementById(initialHash.slice(1));
  if (!target) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    scrollToSection(target);
    updateCamera();
  }));
}
function keepInitialHashSettled() {
  if (!initialHash || initialHash === '#home') return;
  for (const delay of [80, 320, 900]) {
    setTimeout(settleInitialHash, delay);
  }
}
function syncPause() {
  const quiet = paused || reduced.matches;
  toggle.setAttribute('aria-pressed', String(quiet));
  toggle.querySelector('.motion-label').textContent = reduced.matches ? 'Reduced motion' : paused ? 'Play motion' : 'Pause motion';
  toggle.querySelector('.motion-icon').textContent = quiet ? '▷' : 'Ⅱ';
  toggle.disabled = reduced.matches;
  document.documentElement.classList.toggle('motion-paused', quiet);
  if (journey) {
    journey.paused = quiet;
    if (reduced.matches) journey.canvas.style.visibility = 'hidden';
    else if (journey.displayed >= 0) journey.canvas.style.visibility = '';
  }
  if (!quiet) updateCamera();
}
document.body.classList.add('world-ready', 'film-journey');
import('./frame-journey.js').then(({ FrameJourney }) => {
  journey = new FrameJourney(host, [
    { path: '/assets/journey-frames/courtyard', count: 145 },
    { path: '/assets/journey-frames/approach', count: 36 },
    { path: '/assets/journey-frames/desk', count: 242 },
  ]);
  syncPause(); measure(); keepInitialHashSettled();
}).catch(error => { console.warn('Keeping villa poster', error); toggle.hidden = true; });
toggle.addEventListener('click', () => {
  paused = !paused;
  try { sessionStorage.setItem('andy-motion-paused', String(paused)); } catch {}
  syncPause();
});
reduced.addEventListener('change', () => { syncPause(); measure(); });
addEventListener('scroll', updateCamera, { passive: true });
addEventListener('resize', () => { journey?.resize(); measure(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCamera(); });
new ResizeObserver(measure).observe(document.querySelector('main'));
for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener('click', event => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    scrollToSection(target, { animate: true });
    history.replaceState(null, '', link.getAttribute('href'));
  });
}
syncPause();
requestAnimationFrame(measure);
addEventListener('load', keepInitialHashSettled, { once: true });
