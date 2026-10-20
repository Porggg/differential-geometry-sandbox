# Differential Geometry Sandbox

An interactive, GeoGebra-style sandbox for the objects of **B. O'Neill, _Elementary Differential Geometry_ (revised 2nd ed.)**, Chapters 1–3:
points and tangent vectors, vector fields, curves, the Frenet apparatus, 1-forms and differential forms, mappings,
frames and frame fields, connection forms, isometries and congruence of curves.

- **Contents** — every numbered item of Chapters 1–3 (definitions, theorems, lemmas, corollaries, examples, remarks) with its page.
  Clicking an entry loads its figure and shows the statement, the proof (same structure as the book), an explanation and live numerical checks.
- **Toolbar** — creates objects in the active graphics view (2D or 3D).
- **Algebra view** — the construction: definitions, values, sliders (▶ animates), inline editing.
- **Course view** — full details of the selected object (formulas, values, links to the book), including objects that cannot be drawn.
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
| `src/content/` | table of contents (`toc.ts`), written entries (`entries.ts`, `notions.ts`) |
| `src/ui/` | panels: contents, algebra, course, toolbar, forms |

Adding an entry: add an object to `ENTRIES` in `src/content/entries.ts` with `statement`, `proof`, `notes`, `scene` and `checks`;
`npm test` builds its figure and runs its checks.
