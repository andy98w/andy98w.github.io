# Scroll video delivery — September 29, 2026

The live JPEG route totaled 82,057,651 bytes across 423 images. It is now replaced
by short-GOP H.264 with six-frame keyframe spacing, no B-frames, and fast-start
metadata. Desktop keeps 1920×1080 delivery; screens below 768 px and Save-Data
connections use 1280×720. All 423 source frames remain. Existing high-resolution
stopping images are unchanged. The JPEG renderer remains an automatic media-error
fallback and can be selected with `?renderer=frames`.

| Moving asset | Bytes | Reduction from full JPEG route |
| --- | ---: | ---: |
| Desktop 1080p | 19,922,755 | 75.7% |
| Mobile 720p | 12,750,031 | 84.5% |

These are whole-route payload comparisons, not total page weight or guaranteed
per-visit savings. A short visit may download only some of the JPEG sequence.
Video is lossy, and the mobile moving image has lower resolution. Sharp stopping
images retain their original quality.

## Controlled local browser diagnostic

Codex in-app browser on the development Mac. A local range-capable server limits
moving assets to 10 Mbps shared bandwidth, adds 100 ms before each response, and
sets no-store. Five seconds of initial buffering, eight seconds forward through
the route, four seconds backward, then a 1.5-second workshop hold. Stopping images
are loaded from unthrottled localhost in all runs. This isolates moving-frame
delivery; it does not model all page/network traffic or real mobile hardware.

| Renderer | Display changes | Median frame error | p95 frame error | RAF p95 | RAF >50ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| JPEG sequence | 10 | 155 | 394 | 9.0 ms | 0 |
| 1080p video | 322 | 19 | 45 | 8.9 ms | 0 |
| 720p video | 829 | 1 | 1 | 9.2 ms | 0 |

All runs arrived at frame 284 and showed the enhanced still. Frame error compares
the requested index to seek-completion/currentTime reporting, not compositor
presentation. Display changes are not FPS. Results are individual diagnostic runs,
not a statistically controlled percentage-speedup claim. The 1080p route still
outruns a 10 Mbps connection during this deliberately fast cold traversal.

Reproduce with `python3 scripts/benchmark-server.py`, `npm run dev`, and the local
`/performance-test.html?slow=1&resolution=1080` or `resolution=720` page. Reload
between runs and confirm the reported video resolution. The benchmark uses port
5179 for throttled assets. An early 1080p attempt served stale Vite module code and
was discarded; the reported runs used a fresh uncached source server.

## Validation

`npm test`: 15 scheduler/video tests. `npm run build`: passes.
Video loads only on the first active motion update; initial paused and
reduced-motion visits do not attach a source. Pending seeks finish before the
latest requested target is applied, preventing repeated seek cancellation.
Media errors switch once to the existing JPEG renderer.

Full-page browser checks passed at 1440×900 and 390×844: Projects deep links reach
frame 284 with the sharp still; About reaches frame 422; pause freezes the frame
across navigation and resume catches up; reloading an initially paused visit leaves
the video source unset; a fresh mobile load selects the 720p asset. A separate local
server returning 404 for both videos verified automatic fallback to a JPEG canvas
at frame 284. Full-page media checks used a range-capable HTTP server.
