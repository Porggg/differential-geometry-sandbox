// Fully written entries (statement, proof following the book's structure, notes, scene, live checks).
// Wording is ours; structure, notation and numbering follow O'Neill.

import type { Scene } from '../core/scene';
import type { CurveValue, FormValue } from '../core/types';
import { formAt } from '../math/forms';
import { add, matvec, norm, scale, sub, type Vec } from '../math/vec';
import { frenetAt } from '../objects/frenet';
import type { Entry } from './types';

// ---------------------------------------------------------------------------------------------
// helpers for live checks

const curve = (s: Scene, n: string): CurveValue => {
  const v = s.value(n);
  if (!v || v.kind !== 'curve') throw new Error(`${n} undefined`);
  return v;
};
const num = (s: Scene, n: string): number => {
  const v = s.value(n);
  if (!v || v.kind !== 'number') throw new Error(`${n} undefined`);
  return v.value;
};
const vec = (s: Scene, n: string): { p: Vec; v: Vec } => {
  const v = s.value(n);
  if (!v || v.kind !== 'vector') throw new Error(`${n} undefined`);
  return v;
};
const frame = (s: Scene, n: string) => {
  const v = s.value(n);
  if (!v || v.kind !== 'frame') throw new Error(`${n} undefined`);
  return v;
};
const iso = (s: Scene, n: string) => {
  const v = s.value(n);
  if (!v || v.kind !== 'isometry') throw new Error(`${n} undefined`);
  return v;
};
const point = (s: Scene, n: string): Vec => {
  const v = s.value(n);
  if (!v || v.kind !== 'point') throw new Error(`${n} undefined`);
  return v.p;
};
const form = (s: Scene, n: string): FormValue => {
  const v = s.value(n);
  if (!v || v.kind !== 'form') throw new Error(`${n} undefined`);
  return v;
};

/** Derivatives of the Frenet frame at t by central differences. */
function frenetResiduals(c: CurveValue, t: number): [number, number, number] {
  const h = 1e-4;
  const F = frenetAt(c, t);
  const P = frenetAt(c, t + h);
  const M = frenetAt(c, t - h);
  const d = (a: Vec, b: Vec) => scale(sub(a, b), 1 / (2 * h));
  const kv = F.kappa * F.v;
  const tv = F.tau * F.v;
  return [
    norm(sub(d(P.T, M.T), scale(F.N, kv))),
    norm(sub(d(P.N, M.N), add(scale(F.T, -kv), scale(F.B, tv)))),
    norm(sub(d(P.B, M.B), scale(F.N, -tv))),
  ];
}

const HELIX_SLIDERS = (b: Parameters<NonNullable<Entry['scene']>['build']>[0]) => {
  b.slider('a', 2, 0.2, 4, 0.01);
  b.slider('b', 1, -3, 3, 0.01);
  b.add('slider', 'c', { value: 'sqrt(a^2 + b^2)', min: 0, max: 10, step: 0.01 });
  b.add('curve', 'beta', { comps: '(a*cos(s/c), a*sin(s/c), b*s/c)', param: 's', a: '-4*pi', b: '4*pi', ticks: 0, dim: 3 });
  b.slider('s0', 1, -12, 12, 0.01);
};

export const ENTRIES: Partial<Entry>[] = [
  // ===========================================================================================
  {
    id: '1.2.1',
    statement:
      'A **tangent vector** $\\mathbf{v}_\\mathbf{p}$ to $\\mathbf{R}^3$ is made of two points of $\\mathbf{R}^3$: its **vector part** $\\mathbf{v}$ and its **point of application** $\\mathbf{p}$.',
    notes:
      'We always picture $\\mathbf{v}_\\mathbf{p}$ as the arrow that starts at the point $\\mathbf{p}$ and ends at the point $\\mathbf{p} + \\mathbf{v}$. ' +
      'With the book\'s numbers, $\\mathbf{p} = (1, 1, 3)$ and $\\mathbf{v} = (2, 3, 2)$, the arrow goes from $(1, 1, 3)$ to $(3, 4, 5)$ (Fig. 1.1).\n\n' +
      'Two tangent vectors are **equal**, $\\mathbf{v}_\\mathbf{p} = \\mathbf{w}_\\mathbf{q}$, exactly when $\\mathbf{v} = \\mathbf{w}$ **and** $\\mathbf{p} = \\mathbf{q}$. ' +
      'Tangent vectors with the same vector part but different points of application are called **parallel** (§1.2): in the scene, $\\mathbf{w}_\\mathbf{q}$ is parallel to $\\mathbf{v}_\\mathbf{p}$ but is a different tangent vector.\n\n' +
      '(The word "tangent" only acquires its geometric meaning in Chapter 4, for surfaces.)\n\n' +
      'The book works in $\\mathbf{R}^3$; the definition makes sense in any $\\mathbf{R}^n$, so the 2D view shows the same situation in $\\mathbf{R}^2$.',
    tryThis: [
      'With the **Move** tool, drag the point $\\mathbf{p}$ (in the 3D or the 2D view): the arrow $\\mathbf{v}_\\mathbf{p}$ follows, its vector part does not change.',
      'In the Algebra view, edit the vector part of $\\mathbf{v}$ — the end point $\\mathbf{p} + \\mathbf{v}$ moves accordingly.',
    ],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(1, 1, 3)' });
        b.add('tangentVector', 'v', { v: '(2, 3, 2)', p: 'p' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('point', 'q', { coords: '(-1, -2, 0)' }, { color: '#57606a' });
        b.add('tangentVector', 'w', { v: '(2, 3, 2)', p: 'q' }, { color: '#8250df', caption: '\\mathbf{w}_\\mathbf{q}' });
        // the same in R² (2D view)
        b.add('point', 'p2', { coords: '(1, 1)' }, { caption: '\\mathbf{p}' });
        b.add('tangentVector', 'v2', { v: '(2, 1.5)', p: 'p2' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('point', 'q2', { coords: '(-2, -1)' }, { color: '#57606a', caption: '\\mathbf{q}' });
        b.add('tangentVector', 'w2', { v: '(2, 1.5)', p: 'q2' }, { color: '#8250df', caption: '\\mathbf{w}_\\mathbf{q}' });
      },
      select: 'v',
    },
  },
  // ===========================================================================================
  {
    id: '1.4.2',
    statement:
      '**(1) Straight line.** For points $\\mathbf{p}$ and $\\mathbf{q} \\neq 0$, the curve $\\alpha(t) = \\mathbf{p} + t\\mathbf{q} = (p_1 + tq_1,\\ p_2 + tq_2,\\ p_3 + tq_3)$, $t \\in \\mathbf{R}$, ' +
      'is the straight line through $\\mathbf{p} = \\alpha(0)$ in the $\\mathbf{q}$ direction (its coordinate functions are linear in the sense $t \\mapsto at + b$).\n\n' +
      '**(2) Helix.** $t \\mapsto (a\\cos t, a\\sin t, 0)$ goes around the circle of radius $a > 0$ in the $xy$ plane. Letting it rise (or fall) at a constant rate gives the helix ' +
      '$$\\alpha(t) = (a\\cos t,\\ a\\sin t,\\ bt), \\qquad a > 0,\\ b \\neq 0.$$\n\n' +
      '**(3)** The curve $\\alpha(t) = \\left(1 + \\cos t,\\ \\sin t,\\ 2\\sin\\frac{t}{2}\\right)$ runs along the intersection of the cylinder over the circle of center $(1, 0, 0)$ and radius $1$ in the $xy$ plane with the sphere of radius $2$ centered at the origin (Fig. 1.8).\n\n' +
      '**(4)** The curve $\\alpha(t) = (e^t,\\ e^{-t},\\ \\sqrt{2}\\,t)$ rises at a constant rate like the helix, but lies above the hyperbola $xy = 1$ of the $xy$ plane instead of a circle.\n\n' +
      '**(5)** The *3-curve* $\\alpha(t) = (3t - t^3,\\ 3t^2,\\ 3t + t^3)$.',
    notes:
      'When the coordinate functions are simple, a few computed points already give a reasonable picture of the curve — here the sandbox samples hundreds of them. ' +
      'These curves come back in Chapter 2 to test the results on curvature and torsion: the helix in [[2.3.3]], the 3-curve in [[2.4.4]], and (4) is a cylindrical helix ([[2.4.5]]).\n\n' +
      'The surfaces of (3) and (4) are drawn as level surfaces ([[1.1.3]]): the cylinder $(x-1)^2 + y^2 = 1$, the sphere $x^2 + y^2 + z^2 = 4$ and the hyperbolic cylinder $xy = 1$. They are hidden at first — click their colored dots in the Algebra view to show them.\n\n' +
      'The **2D view** shows the plane curves the book refers to: the circle $(a\\cos t, a\\sin t)$ of the $xy$ plane that the helix (2) rises above, the circle of center $(1, 0)$ and radius $1$ over which the cylinder of (3) stands, and the hyperbola $xy = 1$ above which (4) lies — with the plane curve $(e^t, e^{-t})$ running along it.',
    tryThis: [
      'Change the sliders $a$ and $b$ of the helix; with $b = 0$ it collapses to a circle.',
      'Show the cylinder `cyl` and the sphere `sph`: the curve $\\alpha_{(3)}$ lies on both.',
      'Select a curve and read its velocity, acceleration, speed and length in the Course view.',
    ],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('a', 1.5, 0.2, 3, 0.01);
        b.slider('b', 0.3, -1, 1, 0.01);
        b.add('curve', 'alpha', { comps: '(1 + 2*t, -1 + t, 0.5 + t)', param: 't', a: '-2', b: '2', dim: 3 }, { color: '#57606a', caption: '\\alpha_{(1)}' });
        b.add('curve', 'beta', { comps: '(a*cos(t), a*sin(t), b*t)', param: 't', a: '-4*pi', b: '4*pi', dim: 3 }, { color: '#0969da', caption: '\\alpha_{(2)}' });
        b.add('curve', 'gamma', { comps: '(1 + cos(t), sin(t), 2*sin(t/2))', param: 't', a: '0', b: '4*pi', dim: 3 }, { color: '#cf222e', caption: '\\alpha_{(3)}' });
        b.add('curve', 'delta', { comps: '(exp(t), exp(-t), sqrt(2)*t)', param: 't', a: '-1.3', b: '1.3', dim: 3 }, { color: '#1a7f37', caption: '\\alpha_{(4)}' });
        b.add('curve', 'sigma', { comps: '(3*t - t^3, 3*t^2, 3*t + t^3)', param: 't', a: '-1', b: '1', dim: 3 }, { color: '#8250df', caption: '\\alpha_{(5)}' });
        b.add('function', 'cyl', { expr: '(x - 1)^2 + y^2', levels: '1', box: 2.2, res: 40, dim: 3 }, { visible: false, color: '#cf222e', label: false });
        b.add('function', 'sph', { expr: 'x^2 + y^2 + z^2', levels: '4', box: 2.2, res: 40, dim: 3 }, { visible: false, color: '#bf8700', label: false });
        b.add('function', 'hyp', { expr: 'x*y', levels: '1', box: 3.5, res: 40, dim: 3 }, { visible: false, color: '#1a7f37', label: false });
        // plane curves mentioned in the example (2D view)
        b.add('curve', 'circ', { comps: '(a*cos(t), a*sin(t))', param: 't', a: '0', b: '2*pi', dim: 2 }, { color: '#0969da', caption: '(a\\cos t, a\\sin t)' });
        b.add('curve', 'circ1', { comps: '(1 + cos(t), sin(t))', param: 't', a: '0', b: '2*pi', dim: 2 }, { color: '#cf222e', caption: '(1+\\cos t, \\sin t)' });
        b.add('function', 'xy', { expr: 'x*y', levels: '1', box: 3.5, res: 120, dim: 2 }, { color: '#8c959f', caption: 'xy' });
        b.add('curve', 'hyp2', { comps: '(exp(t), exp(-t))', param: 't', a: '-1.3', b: '1.3', dim: 2 }, { color: '#1a7f37', caption: '(e^t, e^{-t})' });
      },
    },
  },
  // ===========================================================================================
  {
    id: '1.5.6',
    statement: 'Let $fg$ be the product of differentiable functions $f$ and $g$ on $\\mathbf{R}^3$. Then $$d(fg) = g\\,df + f\\,dg.$$',
    proof:
      'By Corollary [[1.5.5]],\n\n' +
      '$$\\begin{aligned} d(fg) &= \\sum_i \\frac{\\partial (fg)}{\\partial x_i}\\, dx_i = \\sum_i \\left( \\frac{\\partial f}{\\partial x_i}\\, g + f\\, \\frac{\\partial g}{\\partial x_i} \\right) dx_i \\\\ ' +
      '&= g \\Big( \\sum_i \\frac{\\partial f}{\\partial x_i}\\, dx_i \\Big) + f \\Big( \\sum_i \\frac{\\partial g}{\\partial x_i}\\, dx_i \\Big) \\\\ &= g\\,df + f\\,dg. \\qquad ∎ \\end{aligned}$$',
    notes:
      'This is the Leibniz rule for $d$; together with $d(f + g) = df + dg$ and [[1.5.7]] it is usually faster than the formula of [[1.5.5]] for computing differentials. ' +
      'The statement is an identity between 1-forms, so there is nothing to draw: the sandbox builds both sides symbolically (Algebra view) and compares them.',
    tryThis: [
      'Edit $f$ or $g$ in the Algebra view (e.g. $f = e^{x}\\cos z$): both sides change but stay equal.',
      'Select `lhs` and `rhs` to read the two 1-forms in the Course view.',
    ],
    scene: {
      views: [],
      build: (b) => {
        b.add('function', 'f', { expr: 'x^2*y', levels: '', box: 2, res: 30, dim: 3 });
        b.add('function', 'g', { expr: 'sin(z) + x', levels: '', box: 2, res: 30, dim: 3 });
        b.add('function', 'h', { expr: 'f*g', levels: '', box: 2, res: 30, dim: 3 }, { caption: 'fg' });
        b.add('differential', 'df', { f: 'f' });
        b.add('differential', 'dg', { f: 'g' });
        b.add('differential', 'lhs', { f: 'h' }, { caption: 'd(fg)' });
        b.add('wedge', 'gdf', { phi: 'g', psi: 'df' }, { caption: 'g\\,df' });
        b.add('wedge', 'fdg', { phi: 'f', psi: 'dg' }, { caption: 'f\\,dg' });
        b.add('formSum', 'rhs', { phi: 'gdf', psi: 'fdg' }, { caption: 'g\\,df + f\\,dg' });
      },
      select: 'lhs',
    },
    checks: [
      {
        label: '\\max_{\\mathbf{p}} \\lVert d(fg) - (g\\,df + f\\,dg) \\rVert \\text{ (random points)}',
        value: (s) => {
          const l = form(s, 'lhs');
          const r = form(s, 'rhs');
          let m = 0;
          for (const p of [[0.3, -1.2, 0.7], [1.1, 0.4, -0.5], [-0.8, 2, 1.3], [0.05, 0.6, -2]]) {
            const a = formAt(l, p, s.allNumbers());
            const c = formAt(r, p, s.allNumbers());
            m = Math.max(m, ...a.map((x, i) => Math.abs(x - c[i])));
          }
          return m;
        },
      },
    ],
  },
  // ===========================================================================================
  {
    id: '2.3.2',
    statement:
      'If $\\beta\\colon I \\to \\mathbf{R}^3$ is a unit-speed curve with curvature $\\kappa > 0$ and torsion $\\tau$, then\n\n' +
      '$$\\begin{alignedat}{3} T\' &={} & & \\kappa N, & & \\\\ N\' &={} & -\\kappa T & & & + \\tau B, \\\\ B\' &={} & & -\\tau N. & & \\end{alignedat}$$',
    proof:
      'The first and third formulas are, in essence, the definitions of curvature ($T\' = \\kappa N$) and of torsion ($B\' = -\\tau N$) given just before the theorem. ' +
      'For the second, write $N\'$ in terms of $T, N, B$ by orthonormal expansion ([[2.1.5]]):\n\n' +
      '$$N\' = (N\' \\bullet T)\\,T + (N\' \\bullet N)\\,N + (N\' \\bullet B)\\,B.$$\n\n' +
      'The three coefficients are easy to find. Differentiating $N \\bullet T = 0$ gives $N\' \\bullet T + N \\bullet T\' = 0$, hence\n\n' +
      '$$N\' \\bullet T = -N \\bullet T\' = -N \\bullet \\kappa N = -\\kappa.$$\n\n' +
      'As always $N\' \\bullet N = 0$, because $N$ is a unit vector field. Finally (differentiating $N \\bullet B = 0$ in the same way)\n\n' +
      '$$N\' \\bullet B = -N \\bullet B\' = -N \\bullet (-\\tau N) = \\tau. \\qquad ∎$$',
    notes:
      'The Frenet formulas express the derivatives of the frame $T, N, B$ **in terms of the frame itself**; the coefficient matrix\n\n' +
      '$$\\begin{pmatrix} 0 & \\kappa & 0 \\\\ -\\kappa & 0 & \\tau \\\\ 0 & -\\tau & 0 \\end{pmatrix}$$\n\n' +
      'is skew-symmetric. Geometrically: $\\kappa$ measures how fast $T$ turns (bending), $\\tau$ how fast $B$ turns (twisting out of the osculating plane).\n\n' +
      'The scene uses the unit-speed helix of [[2.3.3]]; the live check differentiates the computed frame numerically and compares with the right-hand sides.',
    tryThis: [
      'Press ▶ on the slider $s_0$: the Frenet frame travels along the helix.',
      'Change $a$ and $b$: the residuals stay at $0$, while $\\kappa = a/c^2$ and $\\tau = b/c^2$ (2D view) change.',
      'Replace the curve by any unit-speed curve with $\\kappa > 0$ — or by any regular curve: the Frenet frame object uses the arbitrary-speed formulas ([[2.4.3]]) and the check uses [[2.4.1]].',
    ],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        HELIX_SLIDERS(b);
        b.add('frenetFrame', 'TNB', { curve: 'beta', t0: 's0', along: false, n: 12 });
        b.add('pointOnCurve', 'P0', { curve: 'beta', t0: 's0' }, { label: false, color: '#24292f' });
        b.add('curvaturePlot', 'plot', { curve: 'beta', kappa: true, tau: true, speed: true, ratio: false, marker: 's0' });
      },
      select: 'TNB',
    },
    checks: [
      { label: "\\lVert T' - \\kappa N \\rVert \\text{ at } s_0", value: (s) => frenetResiduals(curve(s, 'beta'), num(s, 's0'))[0] },
      { label: "\\lVert N' + \\kappa T - \\tau B \\rVert", value: (s) => frenetResiduals(curve(s, 'beta'), num(s, 's0'))[1] },
      { label: "\\lVert B' + \\tau N \\rVert", value: (s) => frenetResiduals(curve(s, 'beta'), num(s, 's0'))[2] },
      { label: "\\lVert \\beta'(s_0) \\rVert \\text{ (unit speed)}", value: (s) => norm(curve(s, 'beta').d1(num(s, 's0'))), expect: 1 },
    ],
  },
  // ===========================================================================================
  {
    id: '2.3.3',
    statement:
      'Frenet frame, curvature and torsion of the unit-speed helix $$\\beta(s) = \\left(a\\cos\\frac{s}{c},\\ a\\sin\\frac{s}{c},\\ \\frac{bs}{c}\\right), \\qquad c = (a^2 + b^2)^{1/2},\\ a > 0.$$',
    proof:
      'First, $$T(s) = \\beta\'(s) = \\left(-\\frac{a}{c}\\sin\\frac{s}{c},\\ \\frac{a}{c}\\cos\\frac{s}{c},\\ \\frac{b}{c}\\right),$$ ' +
      'which has length $(a^2 + b^2)^{1/2}/c = 1$. Hence $$T\'(s) = \\left(-\\frac{a}{c^2}\\cos\\frac{s}{c},\\ -\\frac{a}{c^2}\\sin\\frac{s}{c},\\ 0\\right),$$ so\n\n' +
      '$$\\kappa(s) = \\lVert T\'(s) \\rVert = \\frac{a}{c^2} = \\frac{a}{a^2 + b^2} > 0.$$\n\n' +
      'Since $T\' = \\kappa N$, $$N(s) = \\left(-\\cos\\frac{s}{c},\\ -\\sin\\frac{s}{c},\\ 0\\right).$$ ' +
      'Whatever the values of $a$ and $b$, $N$ points straight in toward the axis of the cylinder on which $\\beta$ lies (Fig. 2.8).\n\n' +
      'The definition of the cross product applied to $B = T \\times N$ gives $$B(s) = \\left(\\frac{b}{c}\\sin\\frac{s}{c},\\ -\\frac{b}{c}\\cos\\frac{s}{c},\\ \\frac{a}{c}\\right).$$ ' +
      'It remains to find the torsion: $$B\'(s) = \\left(\\frac{b}{c^2}\\cos\\frac{s}{c},\\ \\frac{b}{c^2}\\sin\\frac{s}{c},\\ 0\\right),$$ and $B\' = -\\tau N$ by definition; comparing with $N$,\n\n' +
      '$$\\tau(s) = \\frac{b}{c^2} = \\frac{b}{a^2 + b^2}.$$\n\nSo the torsion of the helix is constant too.',
    notes:
      'If $b = 0$ the helix reduces to a circle of radius $a$: then $\\kappa = 1/a$ (smaller circles bend more) and $\\tau = 0$. ' +
      'The helix is very special — in general neither $\\kappa$ nor $\\tau$ is constant. Conversely, by [[3.5.5]], constant nonzero $\\kappa$ and $\\tau$ characterize helices up to congruence.\n\n' +
      'The scene shows the cylinder $x^2 + y^2 = a^2$ (a level surface) on which the helix lies.',
    tryThis: [
      'Animate $s_0$ and watch $N$: it always points horizontally toward the $z$ axis.',
      'Make $b$ negative: the helix becomes left-handed and $\\tau < 0$.',
      'Set $b = 0$: circle of radius $a$, $\\tau = 0$, $\\kappa = 1/a$.',
    ],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        HELIX_SLIDERS(b);
        b.add('frenetFrame', 'TNB', { curve: 'beta', t0: 's0', along: false, n: 12 });
        b.add('function', 'cyl', { expr: 'x^2 + y^2', levels: 'a^2', box: 4.2, res: 36, dim: 3 }, { color: '#8c959f', label: false, opacity: 0.25 });
        b.add('curvaturePlot', 'plot', { curve: 'beta', kappa: true, tau: true, speed: false, ratio: false, marker: 's0' });
      },
      select: 'TNB',
    },
    checks: [
      { label: '\\kappa(s_0) - a/c^2', value: (s) => frenetAt(curve(s, 'beta'), num(s, 's0')).kappa - num(s, 'a') / num(s, 'c') ** 2 },
      { label: '\\tau(s_0) - b/c^2', value: (s) => frenetAt(curve(s, 'beta'), num(s, 's0')).tau - num(s, 'b') / num(s, 'c') ** 2 },
      {
        label: 'N(s_0) - (-\\cos\\frac{s_0}{c}, -\\sin\\frac{s_0}{c}, 0)',
        value: (s) => {
          const s0 = num(s, 's0');
          const c = num(s, 'c');
          return norm(sub(frenetAt(curve(s, 'beta'), s0).N, [-Math.cos(s0 / c), -Math.sin(s0 / c), 0]));
        },
      },
    ],
  },
  // ===========================================================================================
  {
    id: '2.4.3',
    statement:
      'Let $\\alpha$ be a regular curve in $\\mathbf{R}^3$. Then\n\n' +
      '$$\\begin{aligned} T &= \\alpha\'/\\lVert \\alpha\' \\rVert, \\\\ N &= B \\times T, \\\\ B &= \\alpha\' \\times \\alpha\'\' / \\lVert \\alpha\' \\times \\alpha\'\' \\rVert, \\\\ ' +
      '\\kappa &= \\lVert \\alpha\' \\times \\alpha\'\' \\rVert / \\lVert \\alpha\' \\rVert^3, \\\\ \\tau &= (\\alpha\' \\times \\alpha\'\') \\bullet \\alpha\'\'\' / \\lVert \\alpha\' \\times \\alpha\'\' \\rVert^2. \\end{aligned}$$',
    proof:
      'Since $v = \\lVert \\alpha\' \\rVert > 0$, the formula $T = \\alpha\'/\\lVert \\alpha\' \\rVert$ is the same as $\\alpha\' = vT$. By the preceding lemma ([[2.4.2]]),\n\n' +
      '$$\\begin{aligned} \\alpha\' \\times \\alpha\'\' &= (vT) \\times \\left(\\frac{dv}{dt}T + \\kappa v^2 N\\right) \\\\ &= v\\frac{dv}{dt}\\, T \\times T + \\kappa v^3\\, T \\times N = \\kappa v^3 B, \\end{aligned}$$\n\n' +
      'because $T \\times T = 0$. Taking norms,\n\n' +
      '$$\\lVert \\alpha\' \\times \\alpha\'\' \\rVert = \\lVert \\kappa v^3 B \\rVert = \\kappa v^3,$$\n\n' +
      'since $\\lVert B \\rVert = 1$, $\\kappa \\ge 0$ and $v > 0$. (So for regular curves, $\\lVert \\alpha\' \\times \\alpha\'\' \\rVert > 0$ is equivalent to $\\kappa > 0$; then $\\alpha\'$ and $\\alpha\'\'$ are linearly independent and span the osculating plane, like $T$ and $N$.) Consequently\n\n' +
      '$$B = \\frac{\\alpha\' \\times \\alpha\'\'}{\\kappa v^3} = \\frac{\\alpha\' \\times \\alpha\'\'}{\\lVert \\alpha\' \\times \\alpha\'\' \\rVert}.$$\n\n' +
      '$N = B \\times T$ holds for every Frenet frame field (an exercise of §2.3), so only the torsion formula is left. ' +
      'To compute $(\\alpha\' \\times \\alpha\'\') \\bullet \\alpha\'\'\'$, express everything in terms of $T, N, B$. We know $\\alpha\' \\times \\alpha\'\' = \\kappa v^3 B$, and $T \\bullet B = N \\bullet B = 0$, so **only the $B$ component of $\\alpha\'\'\'$ matters**. Using [[2.4.1]],\n\n' +
      '$$\\alpha\'\'\' = \\left(\\frac{dv}{dt}T + \\kappa v^2 N\\right)\' = \\kappa v^2 N\' + \\cdots = \\kappa v^3 \\tau B + \\cdots$$\n\n' +
      'Therefore $(\\alpha\' \\times \\alpha\'\') \\bullet \\alpha\'\'\' = \\kappa^2 v^6 \\tau$, and since $\\lVert \\alpha\' \\times \\alpha\'\' \\rVert = \\kappa v^3$ this is the stated formula for $\\tau$. $\\quad ∎$',
    notes:
      'These are the formulas the sandbox uses for every **Frenet frame** object. The triple product could also be written $\\alpha\' \\bullet \\alpha\'\' \\times \\alpha\'\'\'$, but $\\alpha\' \\times \\alpha\'\'$ is needed anyway.\n\n' +
      'The scene shows the 3-curve of [[2.4.4]], $\\alpha(t) = (3t - t^3, 3t^2, 3t + t^3)$, with $\\alpha\'(t_0)$, $\\alpha\'\'(t_0)$ and $\\alpha\' \\times \\alpha\'\'$ — which is a positive multiple of $B$. In the book one finds $\\kappa = \\tau = \\dfrac{1}{3(1 + t^2)^2}$.',
    tryThis: [
      "Animate $t_0$: $\\alpha' \\times \\alpha''$ stays along $B$, and $\\alpha'$, $\\alpha''$ stay in the osculating plane spanned by $T, N$.",
      'Look at the 2D view: $\\kappa$ and $\\tau$ coincide for this curve (it is a cylindrical helix, [[2.4.6]]).',
      'Edit the curve (e.g. $(t, t^2, t^3)$, the twisted cubic) and compare.',
    ],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('t0', 0.4, -1.2, 1.2, 0.01);
        b.add('curve', 'alpha', { comps: '(3*t - t^3, 3*t^2, 3*t + t^3)', param: 't', a: '-1.2', b: '1.2', ticks: 0, dim: 3 });
        b.add('velocity', 'vel', { curve: 'alpha', t0: 't0' }, { color: '#cf222e' });
        b.add('acceleration', 'acc', { curve: 'alpha', t0: 't0' }, { color: '#bf3989', visible: true });
        b.add('cross', 'vxa', { v: 'vel', w: 'acc' }, { color: '#8250df', visible: false, caption: "\\alpha' \\times \\alpha''" });
        b.add('frenetFrame', 'TNB', { curve: 'alpha', t0: 't0', along: false, n: 12 });
        b.add('osculatingPlane', 'Pi', { curve: 'alpha', t0: 't0', size: 1.5 }, { visible: false });
        b.add('curvaturePlot', 'plot', { curve: 'alpha', kappa: true, tau: true, speed: false, ratio: false, marker: 't0' });
      },
      select: 'TNB',
    },
    checks: [
      { label: '\\kappa(t_0) - \\frac{1}{3(1+t_0^2)^2}', value: (s) => { const t = num(s, 't0'); return frenetAt(curve(s, 'alpha'), t).kappa - 1 / (3 * (1 + t * t) ** 2); } },
      { label: '\\tau(t_0) - \\frac{1}{3(1+t_0^2)^2}', value: (s) => { const t = num(s, 't0'); return frenetAt(curve(s, 'alpha'), t).tau - 1 / (3 * (1 + t * t) ** 2); } },
      {
        label: "\\lVert \\alpha' \\times \\alpha'' - \\kappa v^3 B \\rVert",
        value: (s) => {
          const t = num(s, 't0');
          const c = curve(s, 'alpha');
          const F = frenetAt(c, t);
          const cr = vec(s, 'vxa').v;
          return norm(sub(cr, scale(F.B, F.kappa * F.v ** 3)));
        },
      },
    ],
  },
  // ===========================================================================================
  {
    id: '3.1.7',
    statement: 'If $F$ is an isometry of $\\mathbf{R}^3$, then there exist a unique translation $T$ and a unique orthogonal transformation $C$ such that $$F = TC.$$',
    proof:
      'Let $T$ be the translation by $F(\\mathbf{0})$. By Lemma [[3.1.4]], $T^{-1}$ is the translation by $-F(\\mathbf{0})$. The composite $T^{-1}F$ is an isometry by Lemma [[3.1.3]], and\n\n' +
      '$$(T^{-1}F)(\\mathbf{0}) = T^{-1}(F(\\mathbf{0})) = F(\\mathbf{0}) - F(\\mathbf{0}) = \\mathbf{0}.$$\n\n' +
      'So by Lemma [[3.1.6]], $T^{-1}F$ is an orthogonal transformation; call it $C$. Applying $T$ on the left of $T^{-1}F = C$ gives $F = TC$.\n\n' +
      '*Uniqueness.* Suppose also $F = \\bar{T}\\bar{C}$, with $\\bar T$ a translation and $\\bar C$ orthogonal; we show $\\bar T = T$ and $\\bar C = C$. From $TC = \\bar T \\bar C$ we get $C = T^{-1}\\bar T \\bar C$. ' +
      'Being linear, $C$ and $\\bar C$ both fix the origin, hence $(T^{-1}\\bar T)(\\mathbf{0}) = \\mathbf{0}$. But $T^{-1}\\bar T$ is a translation, and a translation fixing a point is the identity: $T^{-1}\\bar T = I$, so $\\bar T = T$. ' +
      'Then $TC = T\\bar C$, and applying $T^{-1}$ gives $C = \\bar C$. $\\quad ∎$',
    notes:
      'In words: every isometry of $\\mathbf{R}^3$ is, in exactly one way, an orthogonal transformation **followed by** a translation. $C$ is the **orthogonal part** and $T$ the **translation part** of $F$; the proof shows that $T$ is the translation by $F(\\mathbf{0})$.\n\n' +
      'In the scene, $F$ is built as a composite (rotation $C$ about the $z$ axis, then translation $T$ by $\\mathbf{a}$). The helix segment $\\gamma$, its image $C(\\gamma)$ (orthogonal part only: it rotates about the origin) and its image $F(\\gamma)$ are drawn; the frame $\\mathbf{e}$ at $\\mathbf{p}$ is carried along by $C_*$ and $F_*$ ([[3.2.1]]).',
    tryThis: [
      'Animate the angle $\\vartheta$: $C(\\gamma)$ turns about the $z$ axis, and $F(\\gamma)$ is the same shape shifted by $\\mathbf{a} = F(\\mathbf{0})$.',
      'Replace the rotation by a **Reflection** (orientation-reversing): the decomposition still holds, with $\\det C = -1$.',
      "Select $F$ to read its orthogonal part, translation part and sign in the Course view.",
    ],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('theta', 1.2, -3.14, 3.14, 0.01);
        b.add('rotation', 'C', { axis: '(0, 0, 1)', angle: 'theta' });
        b.add('translation', 'T', { a: '(-1, 2.5, 1)' });
        b.add('composition', 'F', { F: 'C', G: 'T' }, { caption: 'F = TC' });
        b.add('point', 'o', { coords: '(0, 0, 0)' }, { caption: '\\mathbf{0}', color: '#24292f' });
        b.add('isoImage', 'Fo', { F: 'F', X: 'o' }, { caption: 'F(\\mathbf{0})', color: '#953800' });
        b.add('curve', 'gamma', { comps: '(2 + 0.4*cos(4*t), 0.4*sin(4*t), 0.25*t)', param: 't', a: '0', b: '2*pi', dim: 3 }, { color: '#0969da' });
        b.add('isoImage', 'Cg', { F: 'C', X: 'gamma' }, { color: '#8c959f', caption: 'C(\\gamma)' });
        b.add('isoImage', 'Fg', { F: 'F', X: 'gamma' }, { color: '#cf222e', caption: 'F(\\gamma)' });
        b.add('frame', 'e', { p: '(2, 0, 0)', e1: '(1, 0, 0)', e2: '(0, 1, 0)', e3: '(0, 0, 1)', lab: 'e' }, { label: false });
        b.add('isoImage', 'Fe', { F: 'F', X: 'e' }, { label: false });
      },
      select: 'F',
    },
    checks: [
      {
        label: '\\lVert F(\\mathbf{0}) - \\mathbf{a} \\rVert \\text{ (translation part = translation by } F(\\mathbf{0}))',
        value: (s) => norm(sub(point(s, 'Fo'), iso(s, 'T').a)),
      },
      {
        label: '\\lVert F(\\mathbf{p}) - (F(\\mathbf{0}) + C\\mathbf{p}) \\rVert \\text{ at } \\mathbf{p} = (1,2,3)',
        value: (s) => {
          const F = iso(s, 'F');
          const C = iso(s, 'C');
          const p = [1, 2, 3];
          return norm(sub(add(F.a, matvec(F.C, p)), add(point(s, 'Fo'), matvec(C.C, p))));
        },
      },
    ],
  },
  // ===========================================================================================
  {
    id: '3.2.3',
    statement:
      'Given any two frames on $\\mathbf{R}^3$, say $\\mathbf{e}_1, \\mathbf{e}_2, \\mathbf{e}_3$ at the point $\\mathbf{p}$ and $\\mathbf{f}_1, \\mathbf{f}_2, \\mathbf{f}_3$ at the point $\\mathbf{q}$, ' +
      'there is a unique isometry $F$ of $\\mathbf{R}^3$ such that $F_*(\\mathbf{e}_i) = \\mathbf{f}_i$ for $1 \\le i \\le 3$.',
    proof:
      '*Existence.* Let $\\hat{\\mathbf{e}}_i$ and $\\hat{\\mathbf{f}}_i$ be the points of $\\mathbf{R}^3$ canonically corresponding to the vectors of the two frames. ' +
      'Let $C$ be the unique linear transformation of $\\mathbf{R}^3$ with $C(\\hat{\\mathbf{e}}_i) = \\hat{\\mathbf{f}}_i$ for $1 \\le i \\le 3$; it is orthogonal (it carries an orthonormal basis to an orthonormal basis). ' +
      'Let $T$ be the translation by the point $\\mathbf{q} - C(\\mathbf{p})$. We claim that $F = TC$ carries the $\\mathbf{e}$ frame to the $\\mathbf{f}$ frame. First,\n\n' +
      '$$F(\\mathbf{p}) = T(C(\\mathbf{p})) = \\mathbf{q} - C(\\mathbf{p}) + C(\\mathbf{p}) = \\mathbf{q}.$$\n\n' +
      'Then Theorem [[3.2.1]] gives\n\n' +
      '$$F_*(\\mathbf{e}_i) = C(\\hat{\\mathbf{e}}_i)_{F(\\mathbf{p})} = (\\hat{\\mathbf{f}}_i)_{F(\\mathbf{p})} = (\\hat{\\mathbf{f}}_i)_{\\mathbf{q}} = \\mathbf{f}_i \\qquad (1 \\le i \\le 3).$$\n\n' +
      '*Uniqueness.* By Theorem [[3.2.1]], this $C$ is the **only** possible orthogonal part of an isometry with $F_*(\\mathbf{e}_i) = \\mathbf{f}_i$. ' +
      'The translation part is then determined too, since it must carry $C(\\mathbf{p})$ to $\\mathbf{q}$. Hence $F = TC$ is unique. $\\quad ∎$\n\n' +
      '**Computing $F$.** Let $A$ be the attitude matrix of the $\\mathbf{e}$ frame (row $i$ = Euclidean coordinates $a_{i1}, a_{i2}, a_{i3}$ of $\\mathbf{e}_i$) and $B$ that of the $\\mathbf{f}$ frame. Then (the matrix of) $C$ is ${}^tB A$. ' +
      'It suffices to check ${}^tBA(\\mathbf{e}_i) = \\mathbf{f}_i$, since this characterizes $C$. For $i = 1$, in column-vector notation,\n\n' +
      '$${}^tBA \\begin{pmatrix} a_{11} \\\\ a_{12} \\\\ a_{13} \\end{pmatrix} = {}^tB \\begin{pmatrix} 1 \\\\ 0 \\\\ 0 \\end{pmatrix} = \\begin{pmatrix} b_{11} \\\\ b_{12} \\\\ b_{13} \\end{pmatrix},$$\n\n' +
      'because $A$ is orthogonal; that is, ${}^tBA(\\mathbf{e}_1) = \\mathbf{f}_1$. The cases $i = 2, 3$ are the same. So $C = {}^tBA$, and $T$ is the translation by $\\mathbf{q} - C(\\mathbf{p})$.',
    notes:
      'Two *points* determine a translation ([[3.1.4]]); two *frames* determine an isometry. Since $F_*$ preserves the triple product up to $\\det C$ ([[3.3.2]]), $F$ is orientation-reversing exactly when the two frames have opposite orientations.\n\n' +
      'The scene uses the frames of Exercise 3 of §3.2: $\\mathbf{e}_1 = (2,2,1)/3$, $\\mathbf{e}_2 = (-2,1,2)/3$, $\\mathbf{e}_3 = (1,-2,2)/3$ at $\\mathbf{p} = (0,1,0)$, and $\\mathbf{f}_1 = (1,0,1)/\\sqrt2$, $\\mathbf{f}_2 = (0,1,0)$, $\\mathbf{f}_3 = (1,0,-1)/\\sqrt2$ at $\\mathbf{q} = (3,-1,1)$. ' +
      'The $\\mathbf{f}$ frame is negatively oriented, so $F$ reverses orientation: watch the small helix $\\gamma$ wound around $\\mathbf{e}_3$ — its image $F(\\gamma)$ winds the other way.',
    tryThis: [
      'Swap $\\mathbf{f}_1$ and $\\mathbf{f}_3$ in the frame `f` (Algebra view): the new frame is positively oriented and $F$ becomes a rotation followed by a translation ($\\operatorname{sgn} F = +1$).',
      'Select `F` to see $C = {}^tBA$ and $\\mathbf{a} = \\mathbf{q} - C(\\mathbf{p})$.',
    ],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(0, 1, 0)' });
        b.add('point', 'q', { coords: '(3, -1, 1)' });
        b.add('frame', 'e', { p: 'p', e1: '(2, 2, 1)/3', e2: '(-2, 1, 2)/3', e3: '(1, -2, 2)/3', lab: 'e' });
        b.add('frame', 'f', { p: 'q', e1: '(1, 0, 1)/sqrt(2)', e2: '(0, 1, 0)', e3: '(1, 0, -1)/sqrt(2)', lab: 'f' });
        b.add('isoFromFrames', 'F', { e: 'e', f: 'f' });
        b.add('isoImage', 'Fe', { F: 'F', X: 'e' }, { visible: false });
        b.add(
          'curve',
          'gamma',
          {
            comps:
              '(0.5*cos(t)*2/3 + 0.5*sin(t)*(-2)/3 + 0.06*t*1/3, 1 + 0.5*cos(t)*2/3 + 0.5*sin(t)*1/3 + 0.06*t*(-2)/3, 0.5*cos(t)*1/3 + 0.5*sin(t)*2/3 + 0.06*t*2/3)',
            param: 't',
            a: '0',
            b: '4*pi',
            dim: 3,
          },
          { color: '#0969da' },
        );
        b.add('isoImage', 'Fg', { F: 'F', X: 'gamma' }, { color: '#cf222e', caption: 'F(\\gamma)' });
      },
      select: 'F',
    },
    checks: [
      { label: '\\lVert F(\\mathbf{p}) - \\mathbf{q} \\rVert', value: (s) => { const F = iso(s, 'F'); return norm(sub(add(F.a, matvec(F.C, point(s, 'p'))), point(s, 'q'))); } },
      {
        label: '\\max_i \\lVert F_*(\\mathbf{e}_i) - \\mathbf{f}_i \\rVert',
        value: (s) => {
          const F = iso(s, 'F');
          const e = frame(s, 'e');
          const f = frame(s, 'f');
          return Math.max(...e.e.map((x, i) => norm(sub(matvec(F.C, x), f.e[i]))));
        },
      },
    ],
  },
];
