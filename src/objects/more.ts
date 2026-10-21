// Additional object types used by the book entries: linear combinations of points / tangent vectors,
// V(p), straight lines, restrictions of functions to lines and curves, the Frenet approximation,
// the decomposition of the acceleration, curves with prescribed curvature and torsion, Eᵢ of a frame field.

import { register } from '../core/registry';
import type { CurveValue, FieldValue, ObjectType, Value } from '../core/types';
import { addNodes, derivative, mulNodes, num, parse, resolve, simplify, substitute, symbolsOf, tex, math } from '../math/expr';
import { add, fmt, norm, scale, type Vec } from '../math/vec';
import {
  COLORS, P, boldName, compileNodes, curveFromNodes, exprTex, getCurve, getField, getFrameField, getFunction, getVector, lbl, nameOf,
  numVec, numericCurve, pointOf, str, texNum, texVec, texVecAt, XYZ,
} from './common';
import { fieldTex } from './fields';
import { frenetAt } from './frenet';

// ---------------------------------------------------------------------------------------------
// Linear combinations: p + q, 2p, (p + q)/2, v + w, p + v …

const combination: ObjectType = {
  type: 'combination',
  label: 'Combination of points / vectors',
  group: 'basic',
  description:
    'A point or tangent vector given by an expression in other points and tangent vectors, e.g. p + q, 2*p, v + w, p + v (the end point of v at p).',
  bookRef: '1.1.1',
  names: ['r', 's1', 'u', 'm', 'r1'],
  dims: [2, 3],
  params: () => [P.expr('expr', 'Expression (e.g. p + q, 2*v - w, (p + q)/2)')],
  defaults: (_d, ctx) => {
    const ps = ctx.find(['point']);
    return { expr: ps.length >= 2 ? `${ps[1]} + ${ps[0]}` : ps.length ? `2*${ps[0]}` : 'p + q' };
  },
  compute: (p, ctx): Value => {
    const node = parse(str(p.expr));
    const syms = [...symbolsOf(node)].filter((s) => !(s in ctx.numbers) && s !== 'pi' && s !== 'e');
    const pts: string[] = [];
    const vecs: string[] = [];
    const comps: Record<string, Vec> = {};
    let at: Vec | null = null;
    for (const s of syms) {
      const v = ctx.get(s);
      if (v.kind === 'point') {
        pts.push(s);
        comps[s] = v.p;
      } else if (v.kind === 'vector') {
        vecs.push(s);
        comps[s] = v.v;
        if (at && at.some((x, i) => Math.abs(x - v.p[i]) > 1e-9) && !pts.length) {
          throw new Error('tangent vectors at different points cannot be added (the book adds vₚ + wₚ only at the same point p)');
        }
        at = v.p;
      } else throw new Error(`${s} is neither a point nor a tangent vector`);
    }
    const dims = new Set(Object.values(comps).map((c) => c.length));
    if (dims.size !== 1) throw new Error('all points and vectors must live in the same Rⁿ');
    const dim = [...dims][0];
    const out = Array.from({ length: dim }, (_, i) => {
      const map: Record<string, ReturnType<typeof num>> = {};
      for (const s of syms) map[s] = num(comps[s][i]);
      const e = resolve(substitute(node, map), { vars: [], numbers: ctx.numbers, functions: ctx.functions, points: ctx.points });
      const x = Number(e.evaluate({ ...ctx.numbers }));
      if (!Number.isFinite(x)) throw new Error('the expression does not give a finite value');
      return x;
    });
    if (pts.length) return { kind: 'point', p: out };
    if (!at) throw new Error('use at least one point or tangent vector');
    return { kind: 'vector', p: at, v: out };
  },
  caption: (o) => boldName(o),
  algebra: (o, v) =>
    `${boldName(o)} = ${exprTex(o.params.expr)}${v?.kind === 'point' ? ` = ${texVec(v.p)}` : v?.kind === 'vector' ? ` = ${texVecAt(v.v, v.p)}` : ''}`,
  course: (o, v) =>
    v.kind === 'point'
      ? `Points of $\\mathbf{R}^${v.p.length}$ are added and multiplied by numbers coordinatewise ([[1.1.1]]): $(p_1, p_2, p_3) + (q_1, q_2, q_3) = (p_1 + q_1, p_2 + q_2, p_3 + q_3)$, $a\\mathbf{p} = (ap_1, ap_2, ap_3)$. ` +
        `(A tangent vector in the expression contributes its vector part, so $\\mathbf{p} + \\mathbf{v}$ is the end point of the arrow $\\mathbf{v}_\\mathbf{p}$.)\n\n$$${boldName(o)} = ${exprTex(o.params.expr)} = ${texVec(v.p, 4)}$$`
      : v.kind === 'vector'
        ? `In the tangent space $T_\\mathbf{p}(\\mathbf{R}^3)$ the operations are those of the vector parts ([[1.2.2]]): $\\mathbf{v}_\\mathbf{p} + \\mathbf{w}_\\mathbf{p} = (\\mathbf{v} + \\mathbf{w})_\\mathbf{p}$, $c(\\mathbf{v}_\\mathbf{p}) = (c\\mathbf{v})_\\mathbf{p}$.\n\n$$${boldName(o)} = ${exprTex(o.params.expr)} = ${texVecAt(v.v, v.p, 4)}$$`
        : '',
  defaultColor: '#1a7f37',
  command: { name: 'Combine', args: ['expr'] },
};

// ---------------------------------------------------------------------------------------------
// V(p)

const fieldAt: ObjectType = {
  type: 'fieldAt',
  label: 'Value V(p) of a vector field',
  group: 'fields',
  description: 'The tangent vector V(p) that a vector field assigns to the point p.',
  bookRef: '1.2.3',
  names: ['Vp', 'Wp', 'Vq'],
  dims: [2, 3],
  params: (dim) => [P.ref('V', 'Vector field V', ['field']), P.vec('p', 'Point p', dim, [], { help: 'Coordinates or the name of a point.' })],
  defaults: (dim, ctx) => ({ V: ctx.find(['field'])[0] ?? '', p: ctx.find(['point'], (v) => v.kind === 'point' && v.p.length === dim)[0] ?? (dim === 2 ? '(1, 1)' : '(1, 1, 1)') }),
  compute: (p, ctx): Value => {
    const V = getField(ctx, p.V);
    const at = pointOf(ctx, p.p, V.dim);
    const v = V.f(at);
    if (!v.every(Number.isFinite)) throw new Error(`V is not defined at ${texVec(at)}`);
    return { kind: 'vector', p: at, v };
  },
  caption: (o, cx) => `${lbl(cx, o.params.V)}(${/^[A-Za-z]/.test(str(o.params.p)) ? lbl(cx, o.params.p) : '\\mathbf{p}'})`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.V)}(${/^[A-Za-z]/.test(str(o.params.p)) ? lbl(cx, o.params.p) : '\\mathbf{p}'}) = ${v?.kind === 'vector' ? texVecAt(v.v, v.p) : '?'}`,
  course: (o, v, cx) => {
    const V = cx.get(str(o.params.V));
    if (v.kind !== 'vector' || V?.kind !== 'field') return '';
    return (
      `$${lbl(cx, o.params.V)} = ${fieldTex(V)}$ assigns to $\\mathbf{p} = ${texVec(v.p)}$ the tangent vector\n\n` +
      `$$${lbl(cx, o.params.V)}(\\mathbf{p}) = ${v.v.map((x, i) => `${fmt(x)}\\,U_${i + 1}(\\mathbf{p})`).join(' + ').replace(/\+ -/g, '- ')} = ${texVecAt(v.v, v.p)}$$\n\n` +
      `(Lemma [[1.2.5]]: the coefficients are the values at $\\mathbf{p}$ of the Euclidean coordinate functions $v_i$.)`
    );
  },
  defaultColor: COLORS.field,
  command: { name: 'FieldAt', args: ['V', 'p'] },
};

// ---------------------------------------------------------------------------------------------
// Straight line p + t q (Example 1.4.2 (1))

const straightLine: ObjectType = {
  type: 'straightLine',
  label: 'Straight line p + t q',
  group: 'curves',
  description: 'The straight line α(t) = p + t q through p = α(0) in the q direction (q may be a tangent vector: its vector part is used).',
  bookRef: '1.4.2',
  names: ['ell', 'ell1', 'ell2', 'lam'],
  dims: [2, 3],
  params: (dim) => [
    P.vec('p', 'Point p', dim, [], { help: 'Coordinates or the name of a point (or tangent vector: its point of application).' }),
    P.vec('q', 'Direction q', dim, [], { help: 'Coordinates or the name of a tangent vector (its vector part).' }),
    P.expr('a', 'Draw for t from'),
    P.expr('b', 'to'),
    { key: 'dim', label: 'dim', kind: 'int', min: 2, max: 3, when: () => false },
  ],
  defaults: (dim, ctx) => {
    const vs = ctx.find(['vector'], (v) => v.kind === 'vector' && v.p.length === dim);
    return { p: vs[0] ?? (dim === 2 ? '(0, 0)' : '(1, 0, 0)'), q: vs[0] ?? (dim === 2 ? '(1, 1)' : '(1, 1, 1)'), a: '-2', b: '2', dim };
  },
  compute: (p, ctx): CurveValue => {
    const dim = Number(p.dim ?? 3);
    const P0 = pointOf(ctx, p.p, dim);
    const qs = str(p.q).trim();
    let q: Vec;
    if (/^[A-Za-z][A-Za-z0-9_]*$/.test(qs)) {
      const v = ctx.get(qs);
      if (v.kind === 'vector') q = v.v;
      else if (v.kind === 'point') q = v.p;
      else throw new Error(`${qs} is not a vector`);
    } else q = numVec(p.q, ctx, dim, 'direction');
    if (norm(q) < 1e-12) throw new Error('the direction q must be nonzero');
    const nodes = P0.map((x, i) => math.parse(`${x} + (${q[i]})*t`));
    return curveFromNodes(nodes, 't', ctx.num(str(p.a, '-2')), ctx.num(str(p.b, '2')), ctx);
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => `${nameOf(o)}(t) = ${v?.kind === 'curve' ? texVec(v.f(0)) : '\\mathbf{p}'} + t\\,${v?.kind === 'curve' ? texVec(v.d1(0)) : '\\mathbf{q}'}`,
  course: (o, v) =>
    v.kind === 'curve'
      ? `Example [[1.4.2]] (1): $${nameOf(o)}(t) = \\mathbf{p} + t\\mathbf{q} = (p_1 + tq_1, p_2 + tq_2, p_3 + tq_3)$ is the straight line through $\\mathbf{p} = ${nameOf(o)}(0) = ${texVec(v.f(0))}$ in the $\\mathbf{q} = ${texVec(v.d1(0))}$ direction. ` +
        `Its velocity is constant, $${nameOf(o)}' = \\mathbf{q}$, and its acceleration is zero ([[2.2.3]]).`
      : '',
  defaultColor: '#57606a',
  command: { name: 'Line', args: ['p', 'q'] },
};

// ---------------------------------------------------------------------------------------------
// Restriction of a function to a line: t ↦ f(p + t v)   (Definition 1.3.1)

const lineRestriction: ObjectType = {
  type: 'lineRestriction',
  label: 'Graph of t ↦ f(p + t v) (2D)',
  group: 'fields',
  description: 'The function f along the line through p in the direction v, and its tangent line at t = 0: the slope is vₚ[f].',
  bookRef: '1.3.1',
  names: ['gv', 'gv1', 'gw'],
  dims: [2, 3],
  params: () => [P.ref('f', 'Function f', ['function']), P.ref('v', 'Tangent vector vₚ', ['vector']), P.expr('a', 'From t ='), P.expr('b', 'to t =')],
  defaults: (_d, ctx) => ({ f: ctx.find(['function'])[0] ?? '', v: ctx.find(['vector'])[0] ?? '', a: '-2', b: '2' }),
  compute: (p, ctx): Value => {
    const f = getFunction(ctx, p.f);
    const v = getVector(ctx, p.v);
    if (v.p.length !== f.dim) throw new Error('vₚ and f live in different dimensions');
    const g = (t: number) => f.f(v.p.map((x, i) => x + t * v.v[i]));
    const grads = f.vars.map((x) => compileNodes([derivative(f.expr, x)], f.vars, ctx));
    const slope = grads.reduce((s, gr, i) => s + gr(v.p)[0] * v.v[i], 0);
    const g0 = g(0);
    return {
      kind: 'plot',
      a: ctx.num(str(p.a, '-2')),
      b: ctx.num(str(p.b, '2')),
      marker: 0,
      series: [
        { label: `t \\mapsto f(\\mathbf{p} + t\\mathbf{v})`, f: g, color: '#2da44e' },
        { label: `\\text{slope } \\mathbf{v}_\\mathbf{p}[f] = ${fmt(slope)}`, f: (t) => g0 + slope * t, color: '#cf222e' },
      ],
      extra: { slope },
    };
  },
  caption: (o, cx) => `${lbl(cx, o.params.f)}(\\mathbf{p} + t\\mathbf{v})`,
  algebra: (o, v, cx) => `t \\mapsto ${lbl(cx, o.params.f)}(\\mathbf{p} + t\\,${lbl(cx, o.params.v)})${v?.kind === 'plot' ? `,\\ \\text{slope at } 0 = ${texNum(v.extra!.slope as number)}` : ''}`,
  course: (o, v, cx) =>
    v.kind === 'plot'
      ? `Graph (2D view) of $t \\mapsto ${lbl(cx, o.params.f)}(\\mathbf{p} + t\\mathbf{v})$, the values of $${lbl(cx, o.params.f)}$ along the straight line through $\\mathbf{p}$ in the direction $\\mathbf{v}$. ` +
        `By Definition [[1.3.1]], its derivative at $t = 0$ is $\\mathbf{v}_\\mathbf{p}[${lbl(cx, o.params.f)}] = ${fmt(v.extra!.slope as number, 6)}$ — the slope of the red tangent line.`
      : '',
  defaultColor: '#2da44e',
  command: { name: 'AlongLine', args: ['f', 'v'] },
};

// ---------------------------------------------------------------------------------------------
// t ↦ f(α(t))   (Lemma 1.4.6)

const curveRestriction: ObjectType = {
  type: 'curveRestriction',
  label: 'Graph of t ↦ f(α(t)) (2D)',
  group: 'curves',
  description: "The function f along a curve α, and its tangent line at t₀: the slope is α'(t₀)[f] (Lemma 1.4.6).",
  bookRef: '1.4.6',
  names: ['fa', 'fa1', 'ga'],
  dims: [2, 3],
  params: () => [P.ref('f', 'Function f', ['function']), P.ref('curve', 'Curve α', ['curve']), P.expr('t0', 'Tangent line at t₀ =')],
  defaults: (_d, ctx) => ({ f: ctx.find(['function'])[0] ?? '', curve: ctx.find(['curve'])[0] ?? '', t0: ctx.hasNumber('t0') ? 't0' : '0' }),
  compute: (p, ctx): Value => {
    const f = getFunction(ctx, p.f);
    const c = getCurve(ctx, p.curve);
    if (c.dim !== f.dim) throw new Error('α and f live in different dimensions');
    const t0 = ctx.num(str(p.t0));
    const g = (t: number) => f.f(c.f(t));
    const grads = f.vars.map((x) => compileNodes([derivative(f.expr, x)], f.vars, ctx));
    const at = c.f(t0);
    const vel = c.d1(t0);
    const slope = grads.reduce((s, gr, i) => s + gr(at)[0] * vel[i], 0);
    const g0 = g(t0);
    return {
      kind: 'plot',
      a: c.a,
      b: c.b,
      marker: t0,
      series: [
        { label: `t \\mapsto f(\\alpha(t))`, f: g, color: '#2da44e' },
        { label: `\\text{slope } \\alpha'(t_0)[f] = ${fmt(slope)}`, f: (t) => g0 + slope * (t - t0), color: '#cf222e' },
      ],
      extra: { slope },
    };
  },
  caption: (o, cx) => `${lbl(cx, o.params.f)}(${lbl(cx, o.params.curve)}(t))`,
  algebra: (o, v, cx) => `t \\mapsto ${lbl(cx, o.params.f)}(${lbl(cx, o.params.curve)}(t))${v?.kind === 'plot' ? `,\\ \\text{slope at } t_0 = ${texNum(v.extra!.slope as number)}` : ''}`,
  course: (o, v, cx) =>
    v.kind === 'plot'
      ? `Graph (2D view) of the composite function $t \\mapsto ${lbl(cx, o.params.f)}(${lbl(cx, o.params.curve)}(t))$. Lemma [[1.4.6]]: its derivative is $${lbl(cx, o.params.curve)}'(t)[${lbl(cx, o.params.f)}]$; at $t_0$ the slope is $${fmt(v.extra!.slope as number, 6)}$.`
      : '',
  defaultColor: '#2da44e',
  command: { name: 'AlongCurve', args: ['f', 'curve', 't0'] },
};

// ---------------------------------------------------------------------------------------------
// Frenet approximation (after Remark 2.3.4)

const curve3 = (label = 'Curve β (in R³)') => P.ref('curve', label, ['curve'], { filter: (v) => v.kind === 'curve' && v.dim === 3 });

const frenetApprox: ObjectType = {
  type: 'frenetApprox',
  label: 'Frenet approximation near t₀',
  group: 'frenet',
  description: 'β̂(s) = β(t₀) + s T₀ + κ₀ s²/2 N₀ + κ₀τ₀ s³/6 B₀, the cubic approximation of the curve near β(t₀) (s = arc length from t₀).',
  bookRef: '2.3.4',
  names: ['bhat', 'bhat1', 'bhat2'],
  dims: [3],
  params: () => [curve3(), P.expr('t0', 'At t₀ ='), P.expr('h', 'Draw for |s| ≤')],
  defaults: (_d, ctx) => ({ curve: ctx.find(['curve'], (v) => v.kind === 'curve' && v.dim === 3)[0] ?? '', t0: ctx.hasNumber('t0') ? 't0' : '0', h: 1.5 }),
  compute: (p, ctx): CurveValue => {
    const c = getCurve(ctx, p.curve);
    const t0 = ctx.num(str(p.t0));
    const F = frenetAt(c, t0);
    const P0 = c.f(t0);
    const h = ctx.num(str(p.h, '1.5'));
    const nodes = [0, 1, 2].map((i) =>
      math.parse(`${P0[i]} + (${F.T[i]})*s + (${(F.kappa * F.N[i]) / 2})*s^2 + (${(F.kappa * F.tau * F.B[i]) / 6})*s^3`),
    );
    return curveFromNodes(nodes, 's', -h, h, ctx, { extra: { kappa: F.kappa, tau: F.tau, facts: [['\\kappa_0', fmt(F.kappa)], ['\\tau_0', fmt(F.tau)]] } });
  },
  caption: () => '\\hat\\beta',
  algebra: (_o, v, cx) => `\\hat\\beta(s) = \\beta(t_0) + sT_0 + \\kappa_0\\frac{s^2}{2}N_0 + \\kappa_0\\tau_0\\frac{s^3}{6}B_0${v?.kind === 'curve' ? '' : ''}${cx ? '' : ''}`,
  course: (_o, v) =>
    v.kind === 'curve'
      ? `**Frenet approximation** (§2.3, after [[2.3.4]]). Taylor's formula and the Frenet formulas give, for a unit-speed curve near $s = 0$,\n\n` +
        `$$\\hat\\beta(s) = \\beta(0) + sT_0 + \\kappa_0\\frac{s^2}{2}N_0 + \\kappa_0\\tau_0\\frac{s^3}{6}B_0,$$\n\n` +
        `with $\\kappa_0 = ${fmt(v.extra!.kappa as number, 5)}$, $\\tau_0 = ${fmt(v.extra!.tau as number, 5)}$ here. ` +
        `The $T$ term is the tangent line; the $\\kappa_0$ term bends the curve toward $N_0$ inside the osculating plane (a parabola); the $\\kappa_0\\tau_0$ term makes it leave that plane. ` +
        `(For an arbitrary-speed curve, $s$ is arc length measured from $t_0$.)`
      : '',
  defaultColor: '#bc4c00',
  command: { name: 'FrenetApprox', args: ['curve', 't0'] },
};

// ---------------------------------------------------------------------------------------------
// α'' = (dv/dt) T + κ v² N   (Lemma 2.4.2)

const accDecomposition: ObjectType = {
  type: 'accDecomposition',
  label: "Components of α'' along T and N",
  group: 'frenet',
  description: "The tangential component (dv/dt) T and the normal component κv² N of the acceleration (Lemma 2.4.2).",
  bookRef: '2.4.2',
  names: ['acomp', 'acomp1'],
  dims: [3],
  params: () => [curve3('Curve α'), P.expr('t0', 'At t₀ =')],
  defaults: (_d, ctx) => ({ curve: ctx.find(['curve'], (v) => v.kind === 'curve' && v.dim === 3)[0] ?? '', t0: ctx.hasNumber('t0') ? 't0' : '0' }),
  compute: (p, ctx): Value => {
    const c = getCurve(ctx, p.curve);
    const t = ctx.num(str(p.t0));
    const F = frenetAt(c, t);
    const h = 1e-5;
    const dv = (norm(c.d1(t + h)) - norm(c.d1(t - h))) / (2 * h);
    const at = c.f(t);
    return {
      kind: 'vectors',
      dashed: true,
      items: [
        { p: at, v: scale(F.T, dv), label: '\\frac{dv}{dt}T', color: '#d1242f' },
        { p: at, v: scale(F.N, F.kappa * F.v * F.v), label: '\\kappa v^2 N', color: '#1a7f37' },
      ],
      extra: { dv, kv2: F.kappa * F.v * F.v, facts: [['dv/dt', fmt(dv, 5)], ['\\kappa v^2', fmt(F.kappa * F.v * F.v, 5)]] },
    };
  },
  caption: () => `\\frac{dv}{dt}T,\\ \\kappa v^2 N`,
  algebra: (o, v, cx) =>
    `${lbl(cx, o.params.curve)}''(${exprTex(o.params.t0)}) = ${v?.kind === 'vectors' ? `${fmt(v.extra!.dv as number)}\\,T + ${fmt(v.extra!.kv2 as number)}\\,N` : '\\frac{dv}{dt}T + \\kappa v^2N'}`,
  course: (o, v, cx) =>
    v.kind === 'vectors'
      ? `Lemma [[2.4.2]]: $${lbl(cx, o.params.curve)}' = vT$ and $${lbl(cx, o.params.curve)}'' = \\dfrac{dv}{dt}T + \\kappa v^2 N$. ` +
        `The **tangential component** $\\frac{dv}{dt}T$ measures the change of speed, the **normal component** $\\kappa v^2N$ the change of direction (Fig. 2.15). ` +
        `Here $\\frac{dv}{dt} = ${fmt(v.extra!.dv as number, 5)}$ and $\\kappa v^2 = ${fmt(v.extra!.kv2 as number, 5)}$.`
      : '',
  defaultColor: '#bf3989',
  command: { name: 'AccelerationParts', args: ['curve', 't0'] },
};

// ---------------------------------------------------------------------------------------------
// A unit-speed curve with prescribed curvature and torsion (Remark 3.5.8): integrate the Frenet equations.

const curveFromKT: ObjectType = {
  type: 'curveFromKT',
  label: 'Curve with given κ(s), τ(s)',
  group: 'frenet',
  description:
    'The unit-speed curve with curvature κ(s) > 0 and torsion τ(s) (R³), or with signed curvature κ̃(s) (R²), obtained by solving the Frenet equations numerically (Remark 3.5.8).',
  bookRef: '3.5.8',
  names: ['gamma', 'gamma1', 'sigma1'],
  dims: [2, 3],
  params: (dim) => [
    P.expr('kappa', dim === 2 ? 'Signed curvature κ̃(s) =' : 'κ(s) =', ['s']),
    P.expr('tau', 'τ(s) =', ['s'], { when: () => dim === 3 }),
    P.expr('L', 'For 0 ≤ s ≤ L, L ='),
    P.vec('p0', 'Initial point β(0)', dim),
    { key: 'dim', label: 'dim', kind: 'int', min: 2, max: 3, when: () => false },
  ],
  defaults: (dim) => (dim === 2 ? { kappa: 's', tau: '0', L: '8', p0: '(0, 0)', dim } : { kappa: '1', tau: '0.3', L: '12', p0: '(0, 0, 0)', dim }),
  compute: (p, ctx): CurveValue => {
    const dim = Number(p.dim ?? 3);
    const env = { vars: ['s'], numbers: ctx.numbers, functions: ctx.functions, points: ctx.points };
    const k = compileNodes([resolve(parse(str(p.kappa)), env)], ['s'], ctx);
    const L = ctx.num(str(p.L, '10'));
    if (!(L > 0)) throw new Error('L must be positive');
    const p0 = numVec(p.p0, ctx, dim, 'initial point');
    const n = 2000;
    const h = L / n;
    const kap = (s: number) => k([s])[0];
    const dk = (s: number) => (kap(s + 1e-4) - kap(s - 1e-4)) / 2e-4;
    const idx = (s: number) => {
      const u = Math.min(n, Math.max(0, s / h));
      const i = Math.min(n - 1, Math.floor(u));
      return { i, w: u - i };
    };
    if (dim === 2) {
      // plane curve: angle θ with θ' = κ̃, and β' = (cos θ, sin θ)
      const th: number[] = [0];
      const pts: Vec[] = [p0];
      let theta = 0;
      let pos = p0.slice();
      for (let i = 0; i < n; i++) {
        const s = i * h;
        const t1 = theta + (h / 6) * (kap(s) + 4 * kap(s + h / 2) + kap(s + h));
        const tm = theta + (h / 24) * (5 * kap(s) + 8 * kap(s + h / 2) - kap(s + h));
        pos = [pos[0] + (h / 6) * (Math.cos(theta) + 4 * Math.cos(tm) + Math.cos(t1)), pos[1] + (h / 6) * (Math.sin(theta) + 4 * Math.sin(tm) + Math.sin(t1))];
        theta = t1;
        if (!Number.isFinite(theta)) throw new Error('κ̃ could not be integrated');
        th.push(theta);
        pts.push(pos);
      }
      const thetaAt = (s: number) => {
        const { i, w } = idx(s);
        return th[i] + w * (th[i + 1] - th[i]);
      };
      const c = numericCurve(2, 's', 0, L, (s) => {
        const { i, w } = idx(s);
        return pts[i].map((x, j) => x + w * (pts[i + 1][j] - x));
      });
      c.d1 = (s) => [Math.cos(thetaAt(s)), Math.sin(thetaAt(s))];
      c.d2 = (s) => [-kap(s) * Math.sin(thetaAt(s)), kap(s) * Math.cos(thetaAt(s))];
      return c;
    }
    const tf = compileNodes([resolve(parse(str(p.tau, '0')), env)], ['s'], ctx);
    const tau = (s: number) => tf([s])[0];
    // state: position, T, N, B
    let y: Vec = [...p0, 1, 0, 0, 0, 1, 0, 0, 0, 1];
    const rhs = (s: number, Y: Vec): Vec => {
      const ka = kap(s);
      const ta = tau(s);
      const T = Y.slice(3, 6);
      const N = Y.slice(6, 9);
      const B = Y.slice(9, 12);
      return [...T, ...scale(N, ka), ...add(scale(T, -ka), scale(B, ta)), ...scale(N, -ta)];
    };
    const states: Vec[] = [y];
    for (let i = 0; i < n; i++) {
      const s = i * h;
      const k1 = rhs(s, y);
      const k2 = rhs(s + h / 2, add(y, scale(k1, h / 2)));
      const k3 = rhs(s + h / 2, add(y, scale(k2, h / 2)));
      const k4 = rhs(s + h, add(y, scale(k3, h)));
      y = y.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
      if (!y.every(Number.isFinite)) throw new Error('the Frenet equations could not be integrated (check κ and τ)');
      states.push(y);
    }
    const at = (s: number, from: number): Vec => {
      const { i, w } = idx(s);
      return [0, 1, 2].map((j) => states[i][from + j] + w * (states[i + 1][from + j] - states[i][from + j]));
    };
    const unit = (v: Vec) => scale(v, 1 / (norm(v) || 1));
    const c = numericCurve(3, 's', 0, L, (s) => at(s, 0));
    // derivatives from the integrated Frenet frame (first: T, second: κN, third: κ'N + κ(−κT + τB))
    c.d1 = (s) => unit(at(s, 3));
    c.d2 = (s) => scale(unit(at(s, 6)), kap(s));
    c.d3 = (s) => {
      const T = unit(at(s, 3));
      const N = unit(at(s, 6));
      const B = unit(at(s, 9));
      return add(scale(N, dk(s)), scale(add(scale(T, -kap(s)), scale(B, tau(s))), kap(s)));
    };
    return c;
  },
  caption: (o) => nameOf(o),
  algebra: (o) =>
    Number(o.params.dim ?? 3) === 2
      ? `${nameOf(o)}:\\ \\tilde\\kappa(s) = ${exprTex(o.params.kappa)}`
      : `${nameOf(o)}:\\ \\kappa(s) = ${exprTex(o.params.kappa)},\\ \\tau(s) = ${exprTex(o.params.tau)}`,
  course: (o) =>
    Number(o.params.dim ?? 3) === 2
      ? `A plane curve with prescribed **signed curvature** $\\tilde\\kappa(s) = ${exprTex(o.params.kappa)}$ (Remark [[3.5.8]], Exercises 7–10 of §3.5): with $\\vartheta(s) = \\int_0^s \\tilde\\kappa$, the unit-speed curve is $\\beta(s) = \\beta(0) + \\int_0^s (\\cos\\vartheta, \\sin\\vartheta)$. In the plane, $\\tilde\\kappa$ need not be positive — its sign says whether the curve turns left or right.`
      : `Remark [[3.5.8]] (existence theorem): for any functions $\\kappa > 0$ and $\\tau$ there is a unit-speed curve with exactly this curvature and torsion; by [[3.5.3]] it is unique up to congruence. ` +
        `It is obtained by solving the Frenet equations $\\beta' = T$, $T' = \\kappa N$, $N' = -\\kappa T + \\tau B$, $B' = -\\tau N$ — here numerically (Runge–Kutta), starting at $\\beta(0)$ with $T, N, B = U_1, U_2, U_3$.\n\n` +
        `$$\\kappa(s) = ${exprTex(o.params.kappa)},\\qquad \\tau(s) = ${exprTex(o.params.tau)}$$\n\nCheck it with **Plot κ, τ**: the computed curvature and torsion of this curve reproduce the given functions.`,
  defaultColor: '#0969da',
  command: { name: 'CurveKT', args: ['kappa', 'tau', 'L'] },
};

// ---------------------------------------------------------------------------------------------
// Eᵢ of a frame field, as a vector field

const frameFieldVector: ObjectType = {
  type: 'frameFieldVector',
  label: 'Eᵢ of a frame field (as a vector field)',
  group: 'frames',
  description: 'One of the three vector fields E₁, E₂, E₃ of a frame field, e.g. to take covariant derivatives ∇ᵥEᵢ.',
  bookRef: '2.6.1',
  names: ['E1', 'E2', 'E3', 'F1'],
  dims: [3],
  params: () => [
    P.ref('field', 'Frame field', ['framefield']),
    P.select('i', 'Which', [
      { value: '1', label: 'E₁' },
      { value: '2', label: 'E₂' },
      { value: '3', label: 'E₃' },
    ]),
    P.expr('box', 'Sample in the box [−R, R]³, R ='),
    P.int('n', 'Sample points per axis', 2, 9),
  ],
  defaults: (_d, ctx) => ({ field: ctx.find(['framefield'])[0] ?? '', i: '1', box: 2, n: 4 }),
  compute: (p, ctx): FieldValue => {
    const F = getFrameField(ctx, p.field);
    const i = Number(p.i ?? 1) - 1;
    const exprs = F.A[i];
    return { kind: 'field', dim: 3, exprs, f: compileNodes(exprs, XYZ, ctx), box: ctx.num(str(p.box, '2')), n: Number(p.n ?? 4), scale: 0.5 };
  },
  caption: (o, cx) => {
    const F = cx.get(str(o.params.field));
    const l = F?.kind === 'framefield' ? F.labels[Number(o.params.i ?? 1) - 1] : `E_${o.params.i}`;
    return l;
  },
  algebra: (o, v, cx) => {
    const F = cx.get(str(o.params.field));
    const l = F?.kind === 'framefield' ? F.labels[Number(o.params.i ?? 1) - 1] : `E_${o.params.i}`;
    return `${l} = ${v?.kind === 'field' ? fieldTex(v) : '?'}`;
  },
  course: (_o, v) => (v.kind === 'field' ? `A member of a frame field ([[2.6.1]]), as a vector field: $$${fieldTex(v)}$$ Its Euclidean coordinate functions form a row of the attitude matrix.` : ''),
  defaultColor: '#bf8700',
  command: { name: 'FrameFieldMember', args: ['field', 'i'] },
};

// ---------------------------------------------------------------------------------------------
// φ(V): a 1-form evaluated on a vector field is a function (§1.5)

const formOnField: ObjectType = {
  type: 'formOnField',
  label: 'Function φ(V) (1-form on a vector field)',
  group: 'forms',
  description: 'The function whose value at p is φ(V(p)); if φ = Σ fᵢ dxᵢ and V = Σ vᵢ Uᵢ, then φ(V) = Σ fᵢ vᵢ.',
  bookRef: '1.5.1',
  names: ['phiV', 'psiV', 'phiW'],
  dims: [3],
  params: () => [P.ref('phi', '1-form φ', ['form'], { filter: (v) => v.kind === 'form' && v.degree === 1 }), P.ref('V', 'Vector field V', ['field'], { filter: (v) => v.kind === 'field' && v.dim === 3 })],
  defaults: (_d, ctx) => ({ phi: ctx.find(['form'], (v) => v.kind === 'form' && v.degree === 1)[0] ?? '', V: ctx.find(['field'])[0] ?? '' }),
  compute: (p, ctx): Value => {
    const phi = ctx.get(str(p.phi));
    if (phi.kind !== 'form' || phi.degree !== 1) throw new Error('choose a 1-form');
    const V = getField(ctx, p.V);
    const expr = simplify(addNodes(phi.comps.map((c, i) => mulNodes(c, V.exprs[i]))));
    const env = { vars: XYZ, numbers: ctx.numbers, functions: ctx.functions, points: ctx.points };
    const node = resolve(expr, env);
    const f = compileNodes([node], XYZ, ctx);
    return { kind: 'function', dim: 3, vars: XYZ, f: (x) => f(x)[0], expr: node, levels: [], box: 2, res: 30 };
  },
  caption: (o, cx) => `${lbl(cx, o.params.phi)}(${lbl(cx, o.params.V)})`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.phi)}(${lbl(cx, o.params.V)}) = ${v?.kind === 'function' ? tex(v.expr) : '?'}`,
  course: (o, v, cx) =>
    v.kind === 'function'
      ? `A 1-form evaluated on a vector field gives the function whose value at $\\mathbf{p}$ is $${lbl(cx, o.params.phi)}(${lbl(cx, o.params.V)}(\\mathbf{p}))$ (§1.5). ` +
        `If $\\phi = \\sum f_i\\,dx_i$ and $V = \\sum v_iU_i$, then $\\phi(V) = \\sum f_iv_i$ (Exercise 2 of §1.5):\n\n$$${lbl(cx, o.params.phi)}(${lbl(cx, o.params.V)}) = ${tex(v.expr)}$$\n\n` +
        `It is linear in both: $\\phi(fV + gW) = f\\phi(V) + g\\phi(W)$ and $(f\\phi + g\\psi)(V) = f\\phi(V) + g\\psi(V)$.`
      : '',
  defaultColor: '#2da44e',
  command: { name: 'FormOnField', args: ['phi', 'V'] },
};

register(formOnField, combination, fieldAt, straightLine, lineRestriction, curveRestriction, frenetApprox, accDecomposition, curveFromKT, frameFieldVector);
