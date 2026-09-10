# Asset provenance

- `villa.webp`: Original generated artwork based on the user-approved sunlit medieval inventor villa mockup. Built-in image generation; interface text was removed in an edit. Generated master is delivered separately as `outputs/villa-background.png` in the task workspace. Prompt: remove all text, controls, and banner lettering; extend the courtyard over the former lower UI strip; preserve architecture, quiet left wall, greenery, brass instruments, composition, and daylight.
- `kubevista-dashboard.webp`: Screenshot of the actual public KubeVista frontend running locally in its supplied representative demo mode. Source: https://github.com/andy98w/Kubernetes-Dashboard . The demo is not represented as live production telemetry.
- `illuma-homepage.webp`: Screenshot of https://www.illuma.me/ taken during this build.
- `illuma-logo.png`: https://www.illuma.me/illuma-logo.png . Owner's product branding.
- `ledgly-dashboard.webp`: Original screenshot in https://github.com/andy98w/Ledgly, `apps/web/public/screenshots/light/dashboard.png`.
- `ledgly-logo.webp`: Original logo from the same repository, `apps/web/public/logo.png`.
- `filmvault.webp`: Original image from https://github.com/andy98w/FilmVault, `Images/filmvault.png`.
- `filmvault-demo.mp4` and `filmvault-demo.jpg`: Short FilmVault walkthrough recorded and supplied by Andy, resized for inline web playback with a locally extracted poster frame.
- `kubernetes.svg`: Kubernetes project logo from https://raw.githubusercontent.com/kubernetes/kubernetes/master/logo/logo.svg . Used to identify the technology, not represented as an original KubeVista logo.
- `oracle.png`: Oracle official favicon, https://www.oracle.com/asset/web/favicons/favicon-192.png . Used to identify the employer.
- `academis-logo.png`: Original Academis mark created with built-in image generation for this portfolio. Its ink, fern, muted green, and rust palette is drawn from the application's interface (`#15211D`, `#2F6654`, `#65706A`, and `#C86A3A`). Prompt direction: a compact, text-free academic retrieval mark built from two document forms and one search node; transparent background; restrained editorial character.
- `sizzle-logo.png`: Original Sizzle mark created with built-in image generation for this portfolio, then export-cleaned for transparency. Its evergreen, teal, seafoam, and counter-tan palette is drawn from the application's interface (`#273E3A`, `#4E897C`, `#9BC3B8`, and `#D4A76A`). Prompt direction: a compact, text-free skillet with ingredients following a physical motion path; transparent background; playful but not cartoonish.
- `summit-logo.jpg`: Cropped project-index treatment of the tutoring center's real logo from https://summittutoringcenter.com/stc-logo.jpg . Used for the website Andy built for the business; the underlying business mark remains Summit Tutoring Center's branding.
- `cooking-pot.svg`, `book-open.svg`: Lucide icons (ISC license), https://github.com/lucide-icons/lucide . Retained generic project-category symbols; no longer used as the primary Sizzle or Academis marks.
- `storefront.svg`, `calendar-days.svg`, `bug.svg`, `network.svg`, `maze.svg`, `gamepad.svg`, `archive-box.svg`: Small line icons drawn for the portfolio's project index and distributed under the repository license.
- `andy-graduation.jpg`, `andy-profile.jpg`, `berkeley-graduation.jpg`, `cat-cream.jpg`, `cat-orange.jpg`, `gundam-painting.jpg`: Personal photos supplied by Andy. Delivery copies are resized JPEGs with source metadata removed; the original files remain outside the repository.
- `estp.svg`: ESTP personality illustration downloaded and supplied by Andy. It accompanies his MBTI result; illustration rights remain with the original creator.
- `tiktok-ucla-cal.mp4`, `tiktok-gpa-sat.mp4`, `tiktok-perfect-stats.mp4`: Eight-second, silent excerpts from three college-admissions videos created and supplied by Andy. The delivery copies are 540 pixels wide, H.264 encoded, and stripped of source metadata.
- `tiktok-ucla-cal.jpg`, `tiktok-gpa-sat.jpg`, `tiktok-perfect-stats.jpg`: Poster frames extracted from those supplied videos.
- `favicon.svg`: Typographic A monogram for this portfolio.
- `cormorant-garamond-latin-500-normal.woff2`: Cormorant Garamond via Fontsource, SIL Open Font License.
- `dm-sans-latin-400-normal.woff2`: DM Sans via Fontsource, SIL Open Font License.

Company and product trademarks belong to their respective owners. Project images are used to showcase Andy's own work.

- `villa-rear.webp`: Built-in image generation edit of the approved villa, removing close foreground architecture and reconstructing the courtyard and landscape behind it.
- `villa-foreground.webp`: Built-in image generation edit extracting the original foreground wall, arch, foliage, ledge, and potted tree onto transparency. Original framing preserved for layered camera motion.

## Hybrid scene materials

The opening uses the original `villa-rear.webp` and `villa-foreground.webp` on camera-aligned 3D planes, with a short camera move and a blend into the connected model. These are not texture projections calibrated to the modeled facade.

Nine 2048×2048 scanned material maps (color, OpenGL normal, roughness) are from Poly Haven, CC0: https://polyhaven.com/a/plastered_stone_wall , https://polyhaven.com/a/oak_wood_planks , https://polyhaven.com/a/clay_plaster . Retrieved using the public API, converted from JPEG to WebP at unchanged dimensions for delivery. License: https://polyhaven.com/license .

## Approved cinematic opening

`villa-journey.mp4` comes from Runway task `e817c6e2-8240-4d02-8c2b-5bece70b04f4`, generated from the original villa artwork and approved by Andy. Source: 1920×1080, 24 fps, approximately six seconds, silent. Locally re-encoded as H.264 with every frame independently seekable. `villa-journey-poster.jpg` is its first frame. No additional generations were submitted for this integration.

The approved upscale, Runway task `46b41f87-dd81-4120-965b-1d897638295f`, is 3840×2160 at 24 fps. `villa-journey-4k.mp4` uses CRF 18 H.264 and six-frame keyframe intervals to balance detail and scroll seeking; the matching 4K poster is its first frame. The 4K encode is retained as an asset; desktop playback now uses `villa-journey-smooth.mp4`, a 2560×1440 all-keyframe CRF 19 derivative for faster random seeking. Phone-width screens and data-saver connections retain 1080p. This is AI-upscaled footage, not native 4K capture.

## Workshop entrance

Runway task `2ebac072-630d-4c32-8f2c-ccb119ef117f` generated the authorized six-second 1080p entrance clip, anchored by the courtyard final frame and the approved workshop concept. `villa-workshop-journey.mp4` joins the enhanced courtyard to this entrance in a 1440p all-keyframe encode; workshop pixels are scaled from 1080p, not AI-upscaled. `villa-workshop-mobile.mp4` is the 1080p version. Both are 24 fps, silent, and finish inside the workshop. No extra paid generation or upscaling was submitted for integration.

## Continuity trim

The live `villa-workshop-trimmed.mp4` and `villa-workshop-trimmed-mobile.mp4` retain the courtyard and only 1.5 seconds of the entrance source. The remaining generated interior transition is excluded. Scroll playback holds the final retained frame outside the doorway. Apply this same trim when integrating the pending workshop upscale into frame playback.

## Full enhanced frame sequence

`journey-frames/courtyard` reuses the enhanced courtyard. `journey-frames/approach` retains only the first 36 frames of the previously enhanced original workshop. `journey-frames/desk` comes from task `9940d489-6761-4b7d-ae65-0b869ada2d68`, enhancing the approved replacement entrance and desk clips. All 423 source JPEGs are 3840×2160. Live playback now uses these frames; historical MP4 variants are retained but not loaded.

## Project architecture diagrams

`architecture-*.svg` are original system diagrams drawn for this portfolio from the corresponding repositories and project documentation. They summarize implemented request paths and explicitly labeled deployment tradeoffs; they are not vendor reference diagrams.
