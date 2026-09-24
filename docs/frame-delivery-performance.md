# Frame delivery investigation — September 23, 2026

The previous scheduler canceled a pending request whenever all four slots were
occupied and the exact scroll target was not loading. Continuous scrolling could
therefore cancel useful downloads before any frame arrived. Nearby work now
finishes; requests are canceled only after a jump exceeding four decoded-cache
windows. The four-request limit, decoded-memory bound, source images, canvas
resolution, and enhanced stopping images are unchanged.

## Browser observations

Local comparison page, Codex in-app browser on the development Mac. Each pass:
five seconds of buffering, eight seconds forward through 423 frames, four seconds
reverse, then a hold. Frame error is the absolute difference between requested and
reported displayed source index. Displayed changes are not FPS. Animation interval
measures requestAnimationFrame callbacks, not guaranteed compositor presentation.

| Renderer / source | Display changes | Median frame error | p95 frame error | Animation p95 |
| --- | ---: | ---: | ---: | ---: |
| Previous scheduler, localhost JPEGs | 844 | 1 | 1 | 8.6 ms |
| Experimental 4K video, localhost | 498 | 3 | 6 | 8.6 ms |
| Previous scheduler, production CDN JPEGs | 40 | 191 | 381 | 8.5 ms |
| Revised scheduler, production CDN JPEGs | 258 | 9 | 90 | 8.4 ms |
| Revised scheduler, repeat CDN pass | 307 | 4 | 26 | 8.8 ms |

The first production-CDN baseline counted 797 aborted fetches. The revised pass
counted zero. Repeat-pass counters were cumulative and included disposal/hold
work, so they are not reported as a fresh cancellation benchmark. Runs did not
use isolated cold caches or network throttling; these are diagnostic observations,
not a controlled percentage-speedup claim. The page fetched production JPEGs
cross-origin; this is not a full-page production UX or mobile benchmark.

The 4K prototype was not selected: locally it tracked less closely than JPEGs.
Fast uncached scrolling can still outrun network delivery. No zero-lag claim.

## Regression coverage

`node --test tests/frame-journey.test.mjs` covers continuous-scroll starvation,
large jumps, request identity races, settle timing, reversal/end bounds, pause,
new scroll interruption, and disposal. `npm run build` also passes.
