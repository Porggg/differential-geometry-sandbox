# Differential Geometry Sandbox

An interactive, GeoGebra-style sandbox for the objects of **B. O'Neill, _Elementary Differential Geometry_ (revised 2nd ed.)**, Chapters 1–3:
points and tangent vectors, vector fields, curves, the Frenet apparatus, 1-forms and differential forms, mappings,
frames and frame fields, connection forms, isometries and congruence of curves.

- **Book mode** (default) — the course reads like the book: a title page and a table of contents with every numbered item
  of Chapters 1–3 and its page, then section pages typeset like the book (chapter openings, run-in labels such as
  "3.2 Theorem (Frenet formulas).", proofs with the book's structure, page numbers in the margin, cross-references by number).
  Each item with a figure has a plate in the text; clicking it shows the figure beside the page, with its sliders and a
  live check of the result. ← / → turn the pages. Links: `#entry=2.3.2`, `#section=2.3`, `#contents`.
- **Sandbox mode** — the construction tools around the same figure: toolbar, Algebra view, command bar, 2D and 3D views.
  The Course view also shows the full details of the selected object, including objects that cannot be drawn.
- **Toolbar** — creates objects in the active graphics view (2D or 3D).
- **Algebra view** — the construction, grouped by view: definitions, values, sliders (drag, type a value, ▶ animates), inline editing.
- **Move tool** — drag free points, and drag α(t₀), velocities or Frenet frames along their curve.
- **Command bar** — e.g. `alpha(t) = (cos(t), sin(t), t)`, `V = x*y*U1 - z*U3`, `phi = x^2 dx - y dz`, `Frenet(alpha, 1)`.

Live site: <https://porggg.github.io/differential-geometry-sandbox/>

## Development

```bash
npm install
npm run dev        # http://localhost:5173/differential-geometry-sandbox/
npm test           # math, scene graph, every entry's figure and live checks
npm run typecheck
npm run build      # static site in dist/
```

## Deployment (GitHub Pages)

The workflow `.github/workflows/deploy.yml` builds and deploys on every push to `main`.
Once, in the repository settings: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The base path is set in `vite.config.ts` (`/differential-geometry-sandbox/`); change it if the repository is renamed.

## Code map

| Path | Contents |
| --- | --- |
| `src/math/` | expression parsing/compilation (math.js → native JS), symbolic derivatives, LaTeX printer, forms, level sets |
| `src/core/` | object model, dependency graph (`scene.ts`), command parser |
| `src/objects/` | one file per toolbar group: the object types and their Course-view details |
| `src/render/` | 3D view (three.js) and 2D view (canvas) |
| `src/content/` | table of contents (`toc.ts`), entries (`ch1.ts`, `ch2.ts`, `ch3.ts`, `entries.ts`, `notions.ts`), check helpers |
| `src/ui/` | panels: the book (`course.ts`), figure caption (`figure.ts`), algebra, toolbar, forms |

Content: `src/content/ch1.ts`, `ch2.ts`, `ch3.ts` (plus `entries.ts`, `notions.ts`) hold every entry of Chapters 1–3 —
statement, proof (same structure as the book, our wording), explanation, figure (`scene`) and live `checks`.
`npm test` builds every figure and runs every check. Write TeX inside the `md` raw template and never write a dollar sign
directly followed by an opening brace (a test enforces it).
