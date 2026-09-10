# Andy Wu — personal website

A sunlit inventor’s villa, built as a static portfolio for GitHub Pages.

## Develop

Node.js 22.12+ is recommended.

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

Publish the contents of `dist/` to GitHub Pages. Both the homepage and the previous privacy page (`privacy.html`) are included. This change has not been pushed or deployed.

## Content

Edit `src/projects.json` for project descriptions, links, tags, images, ownership, status, and detail panels. Each project panel defines an architecture diagram, explanation, three engineering decisions, and a result or tradeoff. KubeVista also includes an operational case study with direct links to its architecture, live-run record, failure test, and teardown audit. `npm run build` regenerates the professional summary, project, and experience sections in `index.html` before building. Experience and generated summary markup are in `src/render-content.mjs`. General page copy is in `index.html`; styles are in `styles.css`.

The visible name is Andy Wu. Oracle employment is listed as September 2024–present based on Andy's supplied résumé and recognition. Other experience and project facts come from the supplied September 2026 résumé and public repositories. KubeVista is a validated snapshot demo, not a currently running AWS cluster.

## Cinematic journey

The live background uses `src/frame-journey.js` to draw a 423-frame sequence from enhanced 3840×2160 sources: courtyard (145 frames), retained stable approach (36 frames), and the approved replacement entrance plus desk move (242 frames). The hallucinated portion of the original workshop is excluded. Frame 284 holds the workshop view behind every project. After the project list, a dedicated transition moves to frame 422, the top-down desk view, for About and Contact.

Frames are requested around the current scroll position, with two in-flight requests and at most four retained decoded bitmaps. Old bitmaps are explicitly closed. Canvas resolution follows the display up to 4K and device pixel ratio 2. The nearest available frame remains visible while the target loads. Reduced motion uses a static poster; the pause control freezes the scene. Individual high-quality JPEG frames increase bandwidth compared with video; the whole sequence is not preloaded, but traversing it can transfer substantial data. This is an experimental local playback strategy, not yet a production bandwidth optimization.

## Validation

Production build and JavaScript syntax checks passed. Static checks verified local image/font references, unique IDs, navigation anchors, seven project dialogs, display-name consistency, and preservation of the privacy page. All seven architecture SVGs pass XML validation and include accessible titles and descriptions. Homepage assets returned HTTP 200 from the development server. Scene geometry checks and 2,001 camera-path samples pass through the front and side openings without wall collisions. Local browser checks passed for forward and reverse frame navigation, pause/resume, home and Projects anchor jumps, and the final desk frame. No console errors were observed. Continuous FPS, slow-network performance, and mobile/reduced-motion browser coverage remain unmeasured.

See `ASSETS.md` for image sources and licenses.

Project copy was revised using Andy’s PORTFOLIO_PROJECTS.md: three featured projects, four compact cards, and earlier work/coursework links. Illuma remains based on the previously supplied résumé. targetbot is not presented because the notes report no source history.
