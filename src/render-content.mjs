import fs from "node:fs";
const projects = JSON.parse(
  fs.readFileSync(new URL("./projects.json", import.meta.url)),
);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const projectMeta = (p, expanded = false) =>
  `<div class="project-meta">${p.dates ? `<span class="project-dates">${esc(p.dates)}</span>` : ""}${p.withoutAi ? '<span class="original-build-badge">Originally built without AI</span>' : ""}</div>${expanded && p.dateNote ? `<p class="project-note">${esc(p.dateNote)}</p>` : ""}`;
const tags = (p) =>
  `<ul class="tags" aria-label="Technologies">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
const icon = (p) =>
  `<img class="project-icon ${p.id}" src="/assets/${p.icon}" alt="" width="40" height="40" loading="lazy" />`;
const ownership = (p) => {
  if (!p.ownership) return "";
  return `<dl class="project-ownership"><div><dt>Role</dt><dd>${esc(p.ownership.role)}</dd></div><div><dt>Owned</dt><dd>${esc(p.ownership.scope)}</dd></div><div><dt>Status</dt><dd>${esc(p.ownership.status)}</dd></div></dl>`;
};
const caseStudy = (study) => {
  if (!study) return "";
  return `<section class="case-study"><div class="case-study-heading"><h3>${esc(study.title)}</h3><p>${esc(study.intro)}</p></div><ol class="case-study-steps">${study.steps.map((step) => `<li><strong>${esc(step.title)}</strong><span>${esc(step.text)}</span></li>`).join("")}</ol><nav class="evidence-links" aria-label="KubeVista project evidence">${study.links.map((link) => `<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} <span aria-hidden="true">↗</span></a>`).join("")}</nav></section>`;
};
const architecture = (p) => {
  if (!p.architecture) return p.bullets?.length ? `<section class="architecture-section"><h3>What I changed</h3><ul>${p.bullets.map((bullet) => `<li>${esc(bullet)}</li>`).join("")}</ul></section>` : "";
  const a = p.architecture;
  if (p.detailLayout === "notes" || p.detailLayout === "flow") {
    const flow = p.detailLayout === "flow"
      ? `<ol class="project-flow" aria-label="Textbook-to-answer flow">${p.flow.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>`
      : "";
    return `<section class="architecture-section engineering-notes" aria-labelledby="notes-${p.id}"><h3 id="notes-${p.id}">${p.detailLayout === "flow" ? "From textbook to answer" : "Behind the project"}</h3>${flow}<p>${esc(a.how)}</p><h3>Engineering choices</h3><ul>${a.decisions.map((decision) => `<li>${esc(decision)}</li>`).join("")}</ul><p class="project-outcome"><span>${esc(a.outcomeLabel || "Result")}</span>${esc(a.outcome)}</p></section>`;
  }
  return `<section class="architecture-section" aria-labelledby="architecture-${p.id}"><div class="architecture-heading"><p class="section-note">System map</p><h3 id="architecture-${p.id}">Architecture</h3></div><figure class="architecture-figure"><img src="/assets/${a.diagram}" alt="${esc(a.alt)}" width="900" height="360" loading="lazy" /><figcaption>${esc(a.caption)}</figcaption></figure><div class="architecture-copy"><div class="how-it-works"><h3>How it works</h3><p>${esc(a.how)}</p></div><div class="engineering-decisions"><h3>Engineering decisions</h3><ol>${a.decisions.map((decision) => `<li>${esc(decision)}</li>`).join("")}</ol></div></div><p class="project-outcome"><span>${esc(a.outcomeLabel || "Result")}</span>${esc(a.outcome)}</p>${caseStudy(a.caseStudy)}</section>`;
};
const featured = projects
  .filter((p) => p.featured)
  .map(
    (p, i) =>
      `<article class="project-feature project-${p.id}"><button class="project-visual" data-project="${p.id}" aria-label="Read about ${p.name}"><div class="project-image-wrap"><img src="/assets/${p.image}" alt="${esc(p.alt)}" width="1280" height="800" loading="lazy" /></div><span class="visual-open" aria-hidden="true">Project details ↗</span></button><div class="project-description"><div class="project-kicker">${icon(p)}<span>${esc(p.category)}</span></div><h3><button data-project="${p.id}">${p.name}</button></h3>${projectMeta(p)}<p>${esc(p.summary)}</p>${tags(p)}<div class="project-actions"><button class="text-link" data-project="${p.id}">${p.video ? "Watch demo" : "Details"} <span aria-hidden="true">↗</span></button>${p.liveUrl ? `<a class="project-live-link" href="${p.liveUrl}" target="_blank" rel="noopener noreferrer">${p.liveAction || "Visit site"}</a>` : ""}<a class="${p.linkType === "live" ? "project-live-link" : "project-source-link"}" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.action}</a></div></div></article>`,
  )
  .join("");
const small = `<div class="more-heading"><h3>A few more things I built.</h3></div><div class="project-grid">${projects
  .filter((p) => !p.featured)
  .map(
    (p) =>
      `<article class="project-small"><div class="small-top">${icon(p)}<span>${esc(p.category)}</span></div><h3><button data-project="${p.id}">${p.name}</button></h3>${projectMeta(p)}<p>${esc(p.summary)}</p>${tags(p)}<div class="project-actions"><button class="text-link" data-project="${p.id}">${p.video ? "Watch demo" : "Details"} <span aria-hidden="true">↗</span></button>${p.liveUrl ? `<a class="project-live-link" href="${p.liveUrl}" target="_blank" rel="noopener noreferrer">${p.liveAction || "Visit site"}</a>` : ""}<a class="${p.linkType === "live" ? "project-live-link" : "project-source-link"}" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.action}</a></div></article>`,
  )
  .join("")}</div>`;
const earlier = [
  ['Ants', 'Ants', 'CS 61A · Python inheritance, composition, and game-unit behavior', 'bug.svg'],
  ['Ngordnet', 'Ngordnet', 'CS 61B · WordNet traversal, set intersections, and NGram ranking', 'network.svg'],
  ['MazeGame', 'MazeGame', 'CS 61B · Seeded worlds, save/load, and deterministic replay', 'maze.svg'],
  ['SuperSpaceGames', 'SuperSpaceGames', 'iOS games and physics experiments', 'gamepad.svg'],
  ['Past-Projects', 'Past projects', 'More experiments on GitHub', 'archive-box.svg'],
];
const archive = `<details class="project-archive" open><summary><span>Earlier projects & coursework</span><span class="archive-plus" aria-hidden="true">+</span></summary><p class="archive-context">AnimalCalendar, Ants, Ngordnet, MazeGame, and the original FilmVault predate my use of AI coding tools. The Berkeley projects build on course-provided frameworks.</p><div class="archive-list">${earlier.map(([repo,name,description,asset]) => `<a href="https://github.com/andy98w/${repo}" target="_blank" rel="noopener noreferrer"><img class="archive-icon" src="/assets/${asset}" alt="" width="28" height="28" loading="lazy" /><span>${esc(name)}${["Ants", "Ngordnet", "MazeGame"].includes(repo) ? '<span class="original-build-badge">Originally built without AI</span>' : ""}${["Ants", "Ngordnet", "MazeGame"].includes(repo) ? `<span class="project-dates">${repo === "Ants" ? "Fall 2022" : "Spring 2023"}</span>` : ""}${repo === "SuperSpaceGames" ? '<span class="project-dates">Oct 2020–Jan 2021</span>' : ""}</span><span>${esc(description)}</span><span aria-hidden="true">↗</span></a>`).join('')}</div></details>`;
const dialogs = projects
  .map(
    (p) =>
      `<dialog class="project-dialog" id="detail-${p.id}" aria-labelledby="title-${p.id}"><div class="dialog-top">${icon(p)}<span>${p.name}</span><button class="dialog-close" aria-label="Close ${p.name} details">×</button></div>${p.image ? `<img class="dialog-image" src="/assets/${p.image}" alt="${esc(p.alt)}" width="1280" height="800" loading="lazy" />` : ""}${p.video ? `<video class="dialog-video" controls playsinline preload="metadata" poster="/assets/${p.poster}" aria-label="${esc(p.videoAlt)}"><source src="/assets/${p.video}" type="video/mp4" /></video>` : ""}<div class="dialog-body"><p class="section-note">${esc(p.category)}</p><h2 id="title-${p.id}">${p.name}</h2>${projectMeta(p, true)}<p class="dialog-intro">${esc(p.detail)}</p>${tags(p)}${ownership(p)}${architecture(p)}${p.note ? `<p class="project-note">${esc(p.note)}</p>` : ""}<div class="dialog-actions">${p.liveUrl ? `<a class="button button-primary" href="${p.liveUrl}" target="_blank" rel="noopener noreferrer">${p.liveAction || "Visit site"} <span aria-hidden="true">↗</span></a><a class="dialog-source-link" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.action}</a>` : `<a class="button button-primary" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.action} <span aria-hidden="true">↗</span></a>`}</div></div></dialog>`,
  )
  .join("");
const experience = `<div class="experience-item"><div class="company-icon"><img src="/assets/oracle.png" alt="Oracle" width="44" height="44" loading="lazy" /></div><div><div class="experience-heading"><h3>Oracle</h3><time datetime="2024-09">September 2024–present</time></div><p>Software Engineer · OCI</p><p class="experience-detail">I work across Kubernetes platform services, workload identity, infrastructure generation, and backend APIs. My contributions include an Elasticsearch-to-OpenSearch migration and work carried from implementation through rollout and operational support.</p><p class="experience-recognition">Recognized with Oracle Platinum and SaaS Engineering &amp; OAL Gold awards.</p></div></div><div class="experience-item"><div class="company-icon berkeley" aria-hidden="true">Cal</div><div><h3>University of California, Berkeley</h3><p>B.S. Computer Science · 2024</p></div></div>`;
const file = new URL("../index.html", import.meta.url);
let html = fs.readFileSync(file, "utf8");
html = html.replace(
  /(<section class="work section-shell" id="projects" aria-labelledby="work-title">)(?:<aside class="professional-summary"[\s\S]*?<\/aside>)?/,
  "$1",
);
html = html.replace(
  /<!-- PROJECTS_START -->[\s\S]*?<!-- PROJECTS_END -->|<div id="project-content"><\/div>/,
  `<!-- PROJECTS_START -->${featured}${small}${archive}${dialogs}<!-- PROJECTS_END -->`,
);
html = html.replace(
  /<!-- EXPERIENCE_START -->[\s\S]*?<!-- EXPERIENCE_END -->|<div id="experience"><\/div>/,
  `<!-- EXPERIENCE_START --><div class="experience">${experience}</div><!-- EXPERIENCE_END -->`,
);
fs.writeFileSync(file, html);
