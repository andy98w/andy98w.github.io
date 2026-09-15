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

Publish the contents of `dist/` to GitHub Pages. Both the homepage and the previous privacy page (`privacy.html`) are included. The repository also includes Vercel configuration for frame-asset caching.

## Content

Edit `src/projects.json` for project descriptions, links, tags, images, ownership, status, and detail panels. Each project panel defines an architecture diagram, explanation, three engineering decisions, and a result or tradeoff. KubeVista also includes an operational case study with direct links to its architecture, live-run record, failure test, and teardown audit. `npm run build` regenerates the professional summary, project, and experience sections in `index.html` before building. Experience and generated summary markup are in `src/render-content.mjs`. General page copy is in `index.html`; styles are in `styles.css`.

The visible name is Andy Wu. Oracle employment is listed as September 2024–present based on Andy's supplied résumé and recognition. Other experience and project facts come from the supplied September 2026 résumé and public repositories. KubeVista is a validated snapshot demo, not a currently running AWS cluster.

## Cinematic journey

The live background uses `src/frame-journey.js` to draw a 423-frame sequence from enhanced 3840×2160 sources: courtyard (145 frames), retained stable approach (36 frames), and the approved replacement entrance plus desk move (242 frames). The hallucinated portion of the original workshop is excluded. Frame 284 holds the workshop view behind every project. After the project list, a dedicated transition moves to frame 422, the top-down desk view, for About and Contact.

Frames are requested around the current scroll position, with two in-flight requests and at most four retained decoded bitmaps. Old bitmaps are explicitly closed. Canvas resolution follows the display up to 4K and device pixel ratio 2. The nearest available frame remains visible while the target loads. Reduced motion uses a static poster; the pause control freezes the scene. Individual high-quality JPEG frames increase bandwidth compared with video; the whole sequence is not preloaded, but traversing it can transfer substantial data. This is an experimental local playback strategy, not yet a production bandwidth optimization.

## Validation

Production build and JavaScript syntax checks passed. Static checks verified local image/font references, unique IDs, navigation anchors, eight project dialogs, display-name consistency, and preservation of the privacy page. All seven architecture SVGs pass XML validation and include accessible titles and descriptions. Homepage assets returned HTTP 200 from the development server. Scene geometry checks and 2,001 camera-path samples pass through the front and side openings without wall collisions. Local browser checks passed for forward and reverse frame navigation, pause/resume, home and Projects anchor jumps, and the final desk frame. No console errors were observed. Continuous FPS, slow-network performance, and mobile/reduced-motion browser coverage remain unmeasured.

See `ASSETS.md` for image sources and licenses.

Project copy was revised using Andy’s PORTFOLIO_PROJECTS.md: three featured projects, five compact cards, and earlier work/coursework links. Project details include the September 14 engineering updates; deployed work, feature branches, and controlled measurements are identified separately. targetbot is not presented because the notes report no source history.

## Project overview — September 14, 2026

### [KubeVista](https://github.com/andy98w/Kubernetes-Dashboard)

A Kubernetes console for investigating failed workloads, reviewing a fix, and checking recovery. Built around an EKS platform I deployed on AWS.

I built the Go API, React console, and AWS platform around them. The console connects Deployments, ReplicaSets, Pods, and events so an investigation can lead into a reviewed restart, scale, or rollback. Recovery checks look at the rollout—not just whether Kubernetes accepted the request.

**Status:** Incident and blue-green release labs merged; AWS environment retired.

### [Illuma](https://www.illuma.me/)

A college admissions platform for researching schools, reviewing essays, and building a college list.

I founded Illuma to bring college research, planning, and essay feedback into one workspace. I built the platform and its typed AI tools, then traced a slow streaming workflow to database writes that were making the model wait on progress updates.

**Status:** Live product.

### [Ledgly](https://github.com/andy98w/Ledgly)

A shared ledger that helps club treasurers match payment emails to dues. Fewer spreadsheet detective stories.

A club ledger should not create a second payment because someone clicked twice. I built the financial model and reconciliation workflow, then added idempotent writes, concurrency-safe allocations, durable email jobs, and recovery tests for the less cooperative days.

**Status:** Reliability changes deployed; background workers separately controlled.

### [Sizzle](https://github.com/andy98w/Sizzle/tree/codex/cooking-performance)

Recipes with an interactive kitchen counter. The ingredients have actual physics.

A dish or a few ingredients become a saved recipe and an illustrated cooking view. I built the generation pipeline and physics counter, then separated frame-by-frame movement from React rendering so the playful part does not keep rerendering the app.

**Status:** Performance and accessibility upgrade tested on a feature branch.

### [Academis](https://github.com/andy98w/Academis/tree/codex/retrieval-provenance)

An AP study workspace that brings textbook retrieval, tutoring, quizzes, and graphs together.

I built Academis around course documents so tutoring has something concrete to refer to. The latest work tracks where each passage came from, keeps retrieval within the selected course and document version, and declines to answer when usable evidence is missing.

**Status:** Versioned retrieval and abstention tested on a feature branch.

### [FilmVault](https://github.com/andy98w/FilmVault)

Films, television, ratings, and saved collections—with live catalog data from TMDB.

TMDB owns the movie catalog; FilmVault owns your ratings and collection. I revisited this earlier project to handle upstream outages and stop loading an entire collection just to show its first page. The updated client searches and sorts on the server, with bounded cursor pages.

**Status:** Catalog resilience and pagination merged; not currently deployed.

### [AnimalCalendar](https://github.com/andy98w/AnimalCalendar/tree/codex/offline-conflicts)

An animal-themed calendar with offline drafts and a plan for when two edits disagree.

One of my earlier projects, revisited at the point where calendars get awkward: no connection, another tab, or an event edited elsewhere. Drafts stay in the browser until they can sync, and conflicting edits stay available for review instead of silently replacing newer data.

**Status:** Offline editing and conflict handling tested on a feature branch.

### [Summit Tutoring Center](https://github.com/andy98w/summitwebsite)

A working website for a tutoring center, with schedules the staff can update themselves.

I built this for a tutoring business owned by family friends. It covers classes, staff, counseling, and inquiries, and fits the hosting setup they already had.

**Status:** Live client website.
