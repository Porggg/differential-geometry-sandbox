// The Frenet apparatus (§2.3 unit speed, §2.4 arbitrary speed).

import { register } from '../core/registry';
import type { CurveValue, ObjectType, Value } from '../core/types';
import { linspace } from '../math/numeric';
import { cross, dot, fmt, norm, normalize, scale, sub, add, type Vec } from '../math/vec';
import { COLORS, P, arr, exprTex, getCurve, lbl, str, texVec } from './common';

export interface Frenet {
  T: Vec;
  N: Vec;
  B: Vec;
  kappa: number;
  tau: number;
  v: number;
}

/** Frenet apparatus of an arbitrary-speed regular curve (Theorem 2.4.3). */
export function frenetAt(c: CurveValue, t: number): Frenet {
  if (c.dim !== 3) throw new Error('the Frenet apparatus is defined for curves in R³');
  const d1 = c.d1(t);
  const d2 = c.d2(t);
  const d3 = c.d3(t);
  const v = norm(d1);
  if (v < 1e-10) throw new Error(`the curve is not regular at t = ${fmt(t)} (velocity is zero)`);
  const T = scale(d1, 1 / v);
  const c12 = cross(d1, d2);
  const n12 = norm(c12);
  const kappa = n12 / (v * v * v);
  if (kappa < 1e-8) throw new Error(`κ = 0 at t = ${fmt(t)}: N and B are not defined (the book assumes κ > 0)`);
  const B = scale(c12, 1 / n12);
  const N = cross(B, T);
  const tau = dot(c12, d3) / (n12 * n12);
  return { T, N, B, kappa, tau, v };
}

/** Signed curvature of a plane curve: (x'y'' − y'x'')/v³ (§3.5, Exercise 8). */
export function signedCurvature2(c: CurveValue, t: number): number {
  const d1 = c.d1(t);
  const d2 = c.d2(t);
  const v = Math.hypot(d1[0], d1[1]);
  return (d1[0] * d2[1] - d1[1] * d2[0]) / (v * v * v);
}

/** Curvature only (no κ > 0 requirement). */
export function curvatureAt(c: CurveValue, t: number): number {
  const d1 = c.d1(t);
  const v = norm(d1);
  if (c.dim === 2) {
    const d2 = c.d2(t);
    return Math.abs(d1[0] * d2[1] - d1[1] * d2[0]) / (v * v * v);
  }
  return norm(cross(d1, c.d2(t))) / (v * v * v);
}

const curve3 = (label = 'Curve α (in R³)') => P.ref('curve', label, ['curve'], { filter: (v) => v.kind === 'curve' && v.dim === 3 });

const frenetFrame: ObjectType = {
  type: 'frenetFrame',
  label: 'Frenet frame T, N, B',
  group: 'frenet',
  description: 'The Frenet frame field T, N, B of a regular curve with κ > 0, at t₀ or along the whole curve.',
  bookRef: '2.3.1',
  names: ['TNB', 'TNB1', 'TNB2'],
  dims: [3],
  params: () => [
    curve3(),
    P.expr('t0', 'At t₀ ='),
    P.bool('along', 'Draw along the whole curve instead'),
    P.int('n', 'Number of frames along the curve', 2, 80, { when: (p) => !!p.along }),
  ],
  defaults: (_d, ctx) => ({ curve: ctx.find(['curve'], (v) => v.kind === 'curve' && v.dim === 3)[0] ?? '', t0: ctx.hasNumber('t0') ? 't0' : '1', along: false, n: 12 }),
  compute: (p, ctx): Value => {
    const c = getCurve(ctx, p.curve);
    if (p.along) {
      const frames = linspace(c.a, c.b, Number(p.n ?? 12)).flatMap((t) => {
        try {
          const F = frenetAt(c, t);
          return [{ p: c.f(t), e: [F.T, F.N, F.B] as [Vec, Vec, Vec] }];
        } catch {
          return [];
        }
      });
      return { kind: 'frames', frames, labels: ['T', 'N', 'B'] };
    }
    const t = ctx.num(str(p.t0));
    const F = frenetAt(c, t);
    return {
      kind: 'frame',
      p: c.f(t),
      e: [F.T, F.N, F.B],
      labels: ['T', 'N', 'B'],
      extra: { frenet: F, t, facts: [['\\kappa', fmt(F.kappa, 5)], ['\\tau', fmt(F.tau, 5)], ['v', fmt(F.v, 5)]] },
    };
  },
  caption: (o, cx) => (o.params.along ? `T, N, B \\text{ on } ${lbl(cx, o.params.curve)}` : `T, N, B \\text{ at } ${exprTex(o.params.t0)}`),
  algebra: (o, v, cx) => {
    const a = lbl(cx, o.params.curve);
    if (v?.kind === 'frame' && v.extra?.frenet) {
      const F = v.extra.frenet as Frenet;
      return `T, N, B \\text{ of } ${a} \\text{ at } ${exprTex(o.params.t0)}:\\ \\kappa = ${fmt(F.kappa)},\\ \\tau = ${fmt(F.tau)}`;
    }
    return `T, N, B \\text{ of } ${a}`;
  },
  course: (o, v, cx) => {
    const a = lbl(cx, o.params.curve);
    const c = cx.get(str(o.params.curve));
    let s =
      `For a unit-speed curve $\\beta$ with $\\kappa > 0$ ([[2.3.1]]): $T = \\beta'$ (unit tangent), $\\kappa = \\lVert T' \\rVert$ (curvature), ` +
      `$N = T'/\\kappa$ (principal normal), $B = T \\times N$ (binormal), and the torsion $\\tau$ is defined by $B' = -\\tau N$.\n\n` +
      `For an arbitrary-speed regular curve the Frenet apparatus is that of a unit-speed reparametrization (§2.4), and Theorem [[2.4.3]] gives\n\n` +
      `$$T = \\frac{${a}'}{\\lVert ${a}' \\rVert},\\quad B = \\frac{${a}' \\times ${a}''}{\\lVert ${a}' \\times ${a}'' \\rVert},\\quad N = B \\times T,$$ ` +
      `$$\\kappa = \\frac{\\lVert ${a}' \\times ${a}'' \\rVert}{\\lVert ${a}' \\rVert^3},\\quad \\tau = \\frac{${a}' \\times ${a}'' \\bullet ${a}'''}{\\lVert ${a}' \\times ${a}'' \\rVert^2}.$$`;
    if (v.kind === 'frame' && v.extra?.frenet && c?.kind === 'curve') {
      const F = v.extra.frenet as Frenet;
      const t = v.extra.t as number;
      s +=
        `\n\nAt $t_0 = ${fmt(t, 4)}$, point $${a}(t_0) = ${texVec(v.p)}$:\n\n` +
        `$$T = ${texVec(F.T)},\\quad N = ${texVec(F.N)},\\quad B = ${texVec(F.B)}$$\n\n` +
        `$$\\kappa = ${fmt(F.kappa, 6)},\\qquad \\tau = ${fmt(F.tau, 6)},\\qquad v = \\lVert ${a}' \\rVert = ${fmt(F.v, 6)}$$\n\n` +
        frenetCheck(c, t);
    }
    return s;
  },
  defaultColor: COLORS.frenetT,
  command: { name: 'Frenet', args: ['curve', 't0'] },
};

/** Numerical check of the Frenet formulas (Lemma 2.4.1 form: T' = κvN, N' = −κvT + τvB, B' = −τvN). */
function frenetCheck(c: CurveValue, t: number): string {
  const h = 1e-4;
  try {
    const Fp = frenetAt(c, t + h);
    const Fm = frenetAt(c, t - h);
    const F = frenetAt(c, t);
    const d = (a: Vec, b: Vec) => scale(sub(a, b), 1 / (2 * h));
    const Tp = d(Fp.T, Fm.T);
    const Np = d(Fp.N, Fm.N);
    const Bp = d(Fp.B, Fm.B);
    const kv = F.kappa * F.v;
    const tv = F.tau * F.v;
    const r1 = norm(sub(Tp, scale(F.N, kv)));
    const r2 = norm(sub(Np, add(scale(F.T, -kv), scale(F.B, tv))));
    const r3 = norm(sub(Bp, scale(F.N, -tv)));
    const ok = (r: number) => (r < 1e-4 ? '\\checkmark' : '\\times');
    return (
      `**Live check** of the Frenet formulas in the arbitrary-speed form ([[2.4.1]]) — derivatives computed numerically:\n\n` +
      `$$\\begin{aligned} \\lVert T' - \\kappa v N \\rVert &= ${fmt(r1, 7)}\\ ${ok(r1)} \\\\ \\lVert N' + \\kappa v T - \\tau v B \\rVert &= ${fmt(r2, 7)}\\ ${ok(r2)} \\\\ \\lVert B' + \\tau v N \\rVert &= ${fmt(r3, 7)}\\ ${ok(r3)} \\end{aligned}$$`
    );
  } catch (e) {
    return `(Frenet formulas check unavailable near $t_0$: ${(e as Error).message})`;
  }
}

const curvaturePlot: ObjectType = {
  type: 'curvaturePlot',
  label: 'Plot κ, τ, speed (2D)',
  group: 'frenet',
  description: 'Graphs of the curvature κ(t), torsion τ(t) and speed v(t) of a curve, drawn in the 2D view.',
  bookRef: 'n.curvature',
  names: ['plot', 'plot1', 'plot2'],
  dims: [2, 3],
  params: () => [
    P.ref('curve', 'Curve α', ['curve']),
    P.bool('kappa', 'Curvature κ'),
    P.bool('tau', 'Torsion τ'),
    P.bool('speed', 'Speed v'),
    P.bool('ratio', 'Ratio τ/κ (Theorem 2.4.6)'),
    P.bool('Tu', 'T • u for a unit vector u (Definition 2.4.5)'),
    P.vec('u', 'u =', 3, [], { when: (p) => !!p.Tu }),
    P.expr('marker', 'Marker at t = (optional)', [], { optional: true }),
  ],
  defaults: (_d, ctx) => ({ curve: ctx.find(['curve'])[0] ?? '', kappa: true, tau: true, speed: false, ratio: false, marker: ctx.hasNumber('t0') ? 't0' : '' }),
  compute: (p, ctx): Value => {
    const c = getCurve(ctx, p.curve);
    const series = [];
    const safe = (f: (t: number) => number) => (t: number) => {
      try {
        return f(t);
      } catch {
        return NaN;
      }
    };
    if (p.kappa && c.dim === 2) series.push({ label: '\\tilde\\kappa', color: '#1a7f37', f: safe((t) => signedCurvature2(c, t)) });
    else if (p.kappa) series.push({ label: '\\kappa', color: '#1a7f37', f: safe((t) => curvatureAt(c, t)) });
    if (p.tau && c.dim === 3) series.push({ label: '\\tau', color: '#0550ae', f: safe((t) => frenetAt(c, t).tau) });
    if (p.speed) series.push({ label: 'v', color: '#9a6700', f: safe((t) => norm(c.d1(t))) });
    if (p.ratio && c.dim === 3) series.push({ label: '\\tau/\\kappa', color: '#8250df', f: safe((t) => { const F = frenetAt(c, t); return F.tau / F.kappa; }) });
    if (p.Tu && c.dim === 3) {
      const u = normalize(arr(p.u).map((s) => ctx.num(s)));
      series.push({ label: 'T \\bullet u', color: '#bf3989', f: safe((t) => dot(normalize(c.d1(t)), u)) });
    }
    const m = str(p.marker).trim();
    return { kind: 'plot', a: c.a, b: c.b, series, marker: m ? ctx.num(m) : undefined };
  },
  caption: (o, cx) => `\\kappa, \\tau \\text{ of } ${lbl(cx, o.params.curve)}`,
  algebra: (o, _v, cx) => {
    const q = [o.params.kappa && '\\kappa', o.params.tau && '\\tau', o.params.speed && 'v', o.params.ratio && '\\tau/\\kappa', o.params.Tu && 'T \\bullet u'].filter(Boolean);
    return `\\text{plot of } ${q.join(', ')} \\text{ for } ${lbl(cx, o.params.curve)}`;
  },
  course: (o, _v, cx) =>
    `Graphs (in the 2D view, horizontal axis = curve parameter) of the curvature, torsion and speed of $${lbl(cx, o.params.curve)}$, computed with [[2.4.3]]. ` +
    `A helix has constant $\\kappa$ and $\\tau$ ([[2.3.3]], [[3.5.5]]); a cylindrical helix has constant $\\tau/\\kappa$ ([[2.4.6]]); a plane curve has $\\tau = 0$ ([[2.3.5]]).`,
  defaultColor: COLORS.plot,
  command: { name: 'PlotCurvature', args: ['curve'] },
};

const osculatingPlane: ObjectType = {
  type: 'osculatingPlane',
  label: 'Osculating plane',
  group: 'frenet',
  description: 'The plane through α(t₀) spanned by T and N (orthogonal to B).',
  bookRef: 'n.osculating',
  names: ['Pi', 'Pi1', 'Pi2'],
  dims: [3],
  params: () => [curve3(), P.expr('t0', 'At t₀ ='), P.expr('size', 'Half-size of the drawn square')],
  defaults: (_d, ctx) => ({ curve: ctx.find(['curve'], (v) => v.kind === 'curve' && v.dim === 3)[0] ?? '', t0: ctx.hasNumber('t0') ? 't0' : '1', size: 1.5 }),
  compute: (p, ctx): Value => {
    const c = getCurve(ctx, p.curve);
    const t = ctx.num(str(p.t0));
    const F = frenetAt(c, t);
    return { kind: 'plane', p: c.f(t), u: F.T, v: F.N, size: ctx.num(str(p.size, '1.5')) };
  },
  caption: (o, cx) => `\\text{osc. plane of } ${lbl(cx, o.params.curve)}`,
  algebra: (o, _v, cx) => `\\text{osculating plane of } ${lbl(cx, o.params.curve)} \\text{ at } ${exprTex(o.params.t0)}`,
  course: (o, v, cx) =>
    v.kind === 'plane'
      ? `The osculating plane of $${lbl(cx, o.params.curve)}$ at $t_0$ is the plane through $${lbl(cx, o.params.curve)}(t_0)$ orthogonal to $B(t_0)$, i.e. spanned by $T$ and $N$ (§2.3, discussion after [[2.3.4]]). ` +
        `Near $t_0$ the curve stays close to it; it is the torsion that makes the curve twist out of it ([[2.3.5]]).`
      : '',
  defaultColor: COLORS.plane,
  command: { name: 'OsculatingPlane', args: ['curve', 't0'] },
};

const osculatingCircle: ObjectType = {
  type: 'osculatingCircle',
  label: 'Osculating circle',
  group: 'frenet',
  description: 'The circle in the osculating plane with center α(t₀) + N/κ and radius 1/κ.',
  bookRef: 'n.osculating',
  names: ['C0', 'C1', 'C2'],
  dims: [3],
  params: () => [curve3(), P.expr('t0', 'At t₀ =')],
  defaults: (_d, ctx) => ({ curve: ctx.find(['curve'], (v) => v.kind === 'curve' && v.dim === 3)[0] ?? '', t0: ctx.hasNumber('t0') ? 't0' : '1' }),
  compute: (p, ctx): Value => {
    const c = getCurve(ctx, p.curve);
    const t = ctx.num(str(p.t0));
    const F = frenetAt(c, t);
    const r = 1 / F.kappa;
    const center = add(c.f(t), scale(F.N, r));
    return { kind: 'circle', c: center, r, u: F.T, v: F.N, extra: { facts: [['\\text{center}', texVec(center)], ['\\text{radius } 1/\\kappa', fmt(r)]] } };
  },
  caption: (o, cx) => `\\text{osc. circle of } ${lbl(cx, o.params.curve)}`,
  algebra: (o, v, cx) => `\\text{osculating circle of } ${lbl(cx, o.params.curve)}${v?.kind === 'circle' ? `:\\ r = ${fmt(v.r)}` : ''}`,
  course: (o, v, cx) =>
    v.kind === 'circle'
      ? `The osculating circle (Exercise 6 of §2.3) lies in the osculating plane, has center $${lbl(cx, o.params.curve)}(t_0) + \\frac{1}{\\kappa} N(t_0) = ${texVec(v.c)}$ ` +
        `(the center of curvature) and radius $1/\\kappa = ${fmt(v.r, 5)}$. It is the circle that best approximates the curve at $t_0$; compare [[2.3.6]].`
      : '',
  defaultColor: '#8250df',
  command: { name: 'OsculatingCircle', args: ['curve', 't0'] },
};

register(frenetFrame, curvaturePlot, osculatingPlane, osculatingCircle);
