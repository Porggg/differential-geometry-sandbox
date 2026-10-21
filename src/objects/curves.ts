// Curves (§1.4), arc length and reparametrization (§2.2), vector fields on curves.

import { register } from '../core/registry';
import type { CurveValue, ObjectType, Value, VectorsValue } from '../core/types';
import { derivative, parse, resolve, substitute, tex, texOfSource } from '../math/expr';
import { cumulative, integrate, interp, linspace } from '../math/numeric';
import { fmt, norm, type Vec } from '../math/vec';
import {
  COLORS, P, arr, compileVec, curveFromNodes, curveFromStrings, exprTex, getCurve, lbl, nameOf, numericCurve, str, texNodes, texNum,
  texParts, texVec, texVecAt,
} from './common';
import { frenetAt } from './frenet';

const PARAMS = [
  { value: 't', label: 't' },
  { value: 's', label: 's' },
  { value: 'u', label: 'u' },
];

const curve: ObjectType = {
  type: 'curve',
  label: 'Curve α(t)',
  group: 'curves',
  description: 'A curve α: I → R³ given by its Euclidean coordinate functions (α₁, α₂, α₃).',
  bookRef: '1.4.1',
  names: ['alpha', 'beta', 'gamma', 'delta', 'sigma', 'alpha1', 'beta1'],
  dims: [2, 3],
  params: (dim) => [
    P.vec('comps', dim === 3 ? 'Coordinate functions (α₁, α₂, α₃)' : 'Coordinate functions (α₁, α₂)', dim, ['t', 's', 'u']),
    P.select('param', 'Parameter', PARAMS),
    P.expr('a', 'Draw for parameter from'),
    P.expr('b', 'to'),
    P.int('ticks', 'Mark points at equally spaced parameter values (0 = none)', 0, 60),
    { key: 'dim', label: 'dim', kind: 'int', min: 2, max: 3, when: () => false },
  ],
  defaults: (dim) =>
    dim === 2
      ? { comps: '(cos(t), sin(t))', param: 't', a: '0', b: '2*pi', ticks: 0, dim }
      : { comps: '(cos(t), sin(t), t/3)', param: 't', a: '-2*pi', b: '2*pi', ticks: 0, dim },
  presets: (dim) =>
    dim === 2
      ? [
          { label: 'Circle', params: { comps: '(1.5*cos(t), 1.5*sin(t))', param: 't', a: '0', b: '2*pi' } },
          { label: 'Parabola', params: { comps: '(t, t^2)', param: 't', a: '-2', b: '2' } },
          { label: 'Ellipse', params: { comps: '(2*cos(t), sin(t))', param: 't', a: '0', b: '2*pi' } },
        ]
      : [
          { label: 'Straight line p + tq (Ex. 1.4.2 (1))', params: { comps: '(1 + 2*t, 1 - t, 2*t)', param: 't', a: '-2', b: '2' } },
          { label: 'Helix (a cos t, a sin t, bt) (Ex. 1.4.2 (2))', params: { comps: '(2*cos(t), 2*sin(t), t/2)', param: 't', a: '-2*pi', b: '2*pi' } },
          { label: 'Viviani curve (Ex. 1.4.2 (3))', params: { comps: '(1 + cos(t), sin(t), 2*sin(t/2))', param: 't', a: '0', b: '4*pi' } },
          { label: '(eᵗ, e⁻ᵗ, √2 t) (Ex. 1.4.2 (4))', params: { comps: '(exp(t), exp(-t), sqrt(2)*t)', param: 't', a: '-1.5', b: '1.5' } },
          { label: '3-curve (3t − t³, 3t², 3t + t³) (Ex. 1.4.2 (5))', params: { comps: '(3*t - t^3, 3*t^2, 3*t + t^3)', param: 't', a: '-1', b: '1' } },
          { label: 'Unit-speed helix, a = 2, b = 1 (Ex. 2.3.3)', params: { comps: '(2*cos(s/sqrt(5)), 2*sin(s/sqrt(5)), s/sqrt(5))', param: 's', a: '-4*pi', b: '4*pi' } },
          { label: 'Circle of radius 2', params: { comps: '(2*cos(t), 2*sin(t), 0)', param: 't', a: '0', b: '2*pi' } },
        ],
  compute: (p, ctx) => {
    const param = str(p.param, 't');
    const parts = arr(p.comps);
    if (parts.length < 2 || parts.length > 3) throw new Error('a curve needs 2 or 3 coordinate functions');
    const a = ctx.num(str(p.a, '0'));
    const b = ctx.num(str(p.b, '1'));
    if (!(b > a)) throw new Error('the parameter interval must satisfy a < b');
    const c = curveFromStrings(parts, param, a, b, ctx);
    c.ticks = Number(p.ticks ?? 0);
    return c;
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => {
    const t = str(o.params.param, 't');
    const comps = v?.kind === 'curve' && v.exprs ? texNodes(v.exprs) : texParts(arr(o.params.comps));
    return `${nameOf(o)}(${t}) = ${comps}`;
  },
  course: (o, v) => {
    if (v.kind !== 'curve') return '';
    const n = nameOf(o);
    const t = v.param;
    let s =
      `A curve in $\\mathbf{R}^${v.dim}$ is a differentiable function $${n}\\colon I \\to \\mathbf{R}^${v.dim}$ from an open interval ([[1.4.1]]). ` +
      `It is drawn here for $${exprTex(o.params.a)} \\le ${t} \\le ${exprTex(o.params.b)}$.\n\n`;
    if (v.exprs) {
      const d1 = safe(() => v.exprs!.map((e) => derivative(e, t)));
      const d2 = d1 && safe(() => d1.map((e) => derivative(e, t)));
      s += `$$${n}(${t}) = ${texNodes(v.exprs)}$$\n\n`;
      if (d1) s += `Velocity ([[1.4.3]]): $$${n}'(${t}) = ${texNodes(d1)}_{${n}(${t})}$$\n\n`;
      if (d2) s += `Acceleration (§2.2): $$${n}''(${t}) = ${texNodes(d2)}$$\n\n`;
    }
    s += `Speed (§2.2): $v(${t}) = \\lVert ${n}'(${t}) \\rVert$. `;
    const len = integrate((u) => norm(v.d1(u)), v.a, v.b, 600);
    s += `Length of the drawn segment: $L = \\int_{${fmt(v.a, 3)}}^{${fmt(v.b, 3)}} \\lVert ${n}'(${t})\\rVert\\, d${t} \\approx ${fmt(len, 5)}$.`;
    const speeds = linspace(v.a, v.b, 41).map((u) => norm(v.d1(u)));
    const unit = speeds.every((x) => Math.abs(x - 1) < 1e-6);
    const regular = speeds.every((x) => x > 1e-9);
    s += `\n\n${unit ? `**Unit-speed** on the drawn interval ($\\lVert ${n}' \\rVert = 1$).` : regular ? `Regular on the drawn interval ($${n}' \\neq 0$), speed between $${fmt(Math.min(...speeds))}$ and $${fmt(Math.max(...speeds))}$.` : `**Not regular**: the velocity vanishes somewhere on the drawn interval.`}`;
    return s;
  },
  defaultColor: COLORS.curve,
  command: { name: 'Curve', args: ['comps', 'param', 'a', 'b'] },
};

function safe<T>(f: () => T): T | undefined {
  try {
    return f();
  } catch {
    return undefined;
  }
}

const curveRef = (label = 'Curve α') => P.ref('curve', label, ['curve']);
const t0Param = (label = 'Parameter value t₀') => P.expr('t0', label);

function t0Defaults(ctx: { find: (k: any[]) => string[]; hasNumber: (n: string) => boolean }) {
  return { curve: ctx.find(['curve'])[0] ?? '', t0: ctx.hasNumber('t0') ? 't0' : '1' };
}

const pointOnCurve: ObjectType = {
  type: 'pointOnCurve',
  label: 'Point α(t₀) on a curve',
  group: 'curves',
  description: 'The point of the curve at a parameter value (use a slider to move it).',
  bookRef: '1.4.1',
  names: ['P0', 'P1', 'P2'],
  dims: [2, 3],
  params: () => [curveRef(), t0Param()],
  defaults: (_d, ctx) => t0Defaults(ctx),
  compute: (p, ctx) => {
    const c = getCurve(ctx, p.curve);
    return { kind: 'point', p: c.f(ctx.num(str(p.t0))) };
  },
  caption: (o, cx) => `${lbl(cx, o.params.curve)}(${exprTex(o.params.t0)})`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.curve)}(${exprTex(o.params.t0)}) = ${v?.kind === 'point' ? texVec(v.p) : '?'}`,
  defaultColor: COLORS.point,
  command: { name: 'PointOnCurve', args: ['curve', 't0'] },
};

const velocity: ObjectType = {
  type: 'velocity',
  label: "Velocity α'(t₀)",
  group: 'curves',
  description: "The velocity vector α'(t₀) = (dα₁/dt, dα₂/dt, dα₃/dt) at the point α(t₀).",
  bookRef: '1.4.3',
  names: ['vel', 'vel1', 'vel2'],
  dims: [2, 3],
  params: () => [curveRef(), t0Param()],
  defaults: (_d, ctx) => t0Defaults(ctx),
  compute: (p, ctx) => {
    const c = getCurve(ctx, p.curve);
    const t = ctx.num(str(p.t0));
    return { kind: 'vector', p: c.f(t), v: c.d1(t), extra: { facts: [['\\text{speed}', fmt(norm(c.d1(t)), 5)]] } };
  },
  caption: (o, cx) => `${lbl(cx, o.params.curve)}'(${exprTex(o.params.t0)})`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.curve)}'(${exprTex(o.params.t0)}) = ${v?.kind === 'vector' ? texVecAt(v.v, v.p) : '?'}`,
  course: (o, v, cx) => {
    if (v.kind !== 'vector') return '';
    const n = lbl(cx, o.params.curve);
    return (
      `Definition [[1.4.3]]: the velocity vector of $${n}$ at $t$ is $${n}'(t) = \\left(\\frac{d${n}_1}{dt}(t), \\frac{d${n}_2}{dt}(t), \\frac{d${n}_3}{dt}(t)\\right)_{${n}(t)}$, ` +
      `a tangent vector at the point $${n}(t)$.\n\n` +
      `$$${n}'(${exprTex(o.params.t0)}) = ${texVecAt(v.v, v.p, 4)},\\qquad \\text{speed } \\lVert ${n}'\\rVert = ${fmt(norm(v.v), 5)}$$`
    );
  },
  defaultColor: COLORS.vector,
  command: { name: 'Velocity', args: ['curve', 't0'] },
};

const acceleration: ObjectType = {
  type: 'acceleration',
  label: "Acceleration α''(t₀)",
  group: 'curves',
  description: "The acceleration α'' = (α')' at α(t₀).",
  names: ['acc', 'acc1', 'acc2'],
  dims: [2, 3],
  params: () => [curveRef(), t0Param()],
  defaults: (_d, ctx) => t0Defaults(ctx),
  compute: (p, ctx) => {
    const c = getCurve(ctx, p.curve);
    const t = ctx.num(str(p.t0));
    return { kind: 'vector', p: c.f(t), v: c.d2(t) };
  },
  caption: (o, cx) => `${lbl(cx, o.params.curve)}''(${exprTex(o.params.t0)})`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.curve)}''(${exprTex(o.params.t0)}) = ${v?.kind === 'vector' ? texVecAt(v.v, v.p) : '?'}`,
  course: (o, v, cx) =>
    v.kind === 'vector'
      ? `The acceleration of $${lbl(cx, o.params.curve)}$ is the derivative of its velocity, $${lbl(cx, o.params.curve)}'' = (${lbl(cx, o.params.curve)}')'$ (§2.2, after [[2.2.2]]). ` +
        `$$${lbl(cx, o.params.curve)}''(${exprTex(o.params.t0)}) = ${texVecAt(v.v, v.p, 4)}$$ See [[2.2.3]]: a nonconstant curve is a straight line iff its acceleration is zero.`
      : '',
  defaultColor: '#bf3989',
  command: { name: 'Acceleration', args: ['curve', 't0'] },
};

const reparametrization: ObjectType = {
  type: 'reparametrization',
  label: 'Reparametrization α(h(s))',
  group: 'curves',
  description: 'The curve β = α(h): J → R³, where h: J → I is a differentiable function.',
  bookRef: '1.4.4',
  names: ['beta', 'beta1', 'beta2', 'gamma'],
  dims: [2, 3],
  params: () => [curveRef(), P.expr('h', 'h(s) =', ['s']), P.expr('c', 'Draw for s from'), P.expr('d', 'to')],
  defaults: (_d, ctx) => ({ curve: ctx.find(['curve'])[0] ?? '', h: 's^2', c: '-2', d: '2' }),
  compute: (p, ctx) => {
    const c = getCurve(ctx, p.curve);
    const env = { vars: ['s'], numbers: ctx.numbers, functions: ctx.functions, points: ctx.points };
    const h = resolve(parse(str(p.h)), env);
    const a = ctx.num(str(p.c, '0'));
    const b = ctx.num(str(p.d, '1'));
    if (!(b > a)) throw new Error('need c < d');
    if (c.exprs) {
      const nodes = c.exprs.map((e) => substitute(e, { [c.param]: h }));
      return curveFromNodes(nodes, 's', a, b, ctx);
    }
    const hf = compileVec([str(p.h)], ['s'], ctx).f;
    return numericCurve(c.dim, 's', a, b, (s) => c.f(hf([s])[0]));
  },
  caption: (o) => nameOf(o),
  algebra: (o, _v, cx) => `${nameOf(o)}(s) = ${lbl(cx, o.params.curve)}\\big(${exprTex(o.params.h)}\\big)`,
  course: (o, v, cx) => {
    if (v.kind !== 'curve') return '';
    const n = nameOf(o);
    const a = lbl(cx, o.params.curve);
    let hp = '?';
    try {
      hp = tex(derivative(parse(str(o.params.h)), 's'));
    } catch {
      /* ignore */
    }
    return (
      `Definition [[1.4.4]]: $${n} = ${a}(h)$ with $h(s) = ${exprTex(o.params.h)}$, so $${n}(s) = ${a}(h(s))$` +
      (v.exprs ? ` $= ${texNodes(v.exprs)}$` : '') +
      `.\n\nLemma [[1.4.5]]: $${n}'(s) = h'(s)\\, ${a}'(h(s))$, here with $h'(s) = ${hp}$. ` +
      `The route is the same as that of $${a}$, but it is traversed at a different rate (and possibly backwards, or only partly).`
    );
  },
  defaultColor: '#9a6700',
  command: { name: 'Reparametrize', args: ['curve', 'h', 'c', 'd'] },
};

const arcLength: ObjectType = {
  type: 'arcLength',
  label: 'Arc length',
  group: 'curves',
  description: 'The length ∫ₐᵇ ‖α\'(t)‖ dt of a segment of a curve (the segment is highlighted).',
  bookRef: 'n.arclength',
  names: ['L', 'L1', 'L2', 'len'],
  dims: [2, 3],
  params: () => [curveRef(), P.expr('a', 'From t ='), P.expr('b', 'to t =')],
  defaults: (_d, ctx) => ({ curve: ctx.find(['curve'])[0] ?? '', a: '0', b: '2*pi' }),
  compute: (p, ctx): Value => {
    const c = getCurve(ctx, p.curve);
    const a = ctx.num(str(p.a));
    const b = ctx.num(str(p.b));
    const L = integrate((t) => norm(c.d1(t)), a, b, 1000);
    return { kind: 'number', value: L, extra: { highlight: { curve: str(p.curve), a, b } } };
  },
  caption: (o) => nameOf(o),
  algebra: (o, v, cx) =>
    `${nameOf(o)} = \\int_{${exprTex(o.params.a)}}^{${exprTex(o.params.b)}} \\lVert ${lbl(cx, o.params.curve)}'\\rVert\\,dt = ${v?.kind === 'number' ? texNum(v.value) : '?'}`,
  course: (o, v, cx) =>
    v.kind === 'number'
      ? `The arc length of $${lbl(cx, o.params.curve)}$ from $t=a$ to $t=b$ is obtained by integrating its speed (§2.2):\n\n` +
        `$$L = \\int_a^b \\lVert ${lbl(cx, o.params.curve)}'(t) \\rVert\\, dt = ${fmt(v.value, 6)}$$\n\n` +
        `(numerical integration). See [[2.2.1]] for the arc length function and unit-speed reparametrizations.`
      : '',
  defaultColor: '#bc4c00',
  command: { name: 'ArcLength', args: ['curve', 'a', 'b'] },
};

const unitSpeed: ObjectType = {
  type: 'unitSpeed',
  label: 'Unit-speed reparametrization',
  group: 'curves',
  description: 'β(s) = α(t(s)) where t(s) inverts the arc length function s(t) = ∫ₐᵗ ‖α\'‖ (Theorem 2.2.1).',
  bookRef: '2.2.1',
  names: ['beta', 'beta1', 'beta2', 'gamma'],
  dims: [2, 3],
  params: () => [curveRef('Regular curve α'), P.expr('base', 'Based at t = a ='), P.int('ticks', 'Marks at equally spaced s (0 = none)', 0, 60)],
  defaults: (_d, ctx) => ({ curve: ctx.find(['curve'])[0] ?? '', base: '0', ticks: 0 }),
  compute: (p, ctx): CurveValue => {
    const c = getCurve(ctx, p.curve);
    const base = ctx.num(str(p.base, '0'));
    const lo = Math.min(c.a, base);
    const hi = Math.max(c.b, base);
    const speed = (t: number) => norm(c.d1(t));
    const tab = cumulative(speed, lo, hi, 3000);
    const s0 = interp(tab.t, tab.s, base);
    const ss = tab.s.map((x) => x - s0);
    for (let i = 1; i < ss.length; i++) if (!(ss[i] > ss[i - 1])) throw new Error('α is not regular (its speed vanishes), so it has no unit-speed reparametrization');
    const tOf = (s: number) => interp(ss, tab.t, s);
    const sa = interp(tab.t, ss, c.a);
    const sb = interp(tab.t, ss, c.b);
    const f = (s: number) => c.f(tOf(s));
    // exact chain rule for the first derivative: β'(s) = α'(t)/v(t)
    const cv = numericCurve(c.dim, 's', sa, sb, f);
    cv.d1 = (s: number) => {
      const t = tOf(s);
      const d = c.d1(t);
      const v = norm(d);
      return d.map((x) => x / v);
    };
    cv.ticks = Number(p.ticks ?? 0);
    cv.extra = { facts: [['s \\text{ range}', `[${fmt(sa)}, ${fmt(sb)}]`]], tOf };
    return cv;
  },
  caption: (o) => nameOf(o),
  algebra: (o, _v, cx) => `${nameOf(o)}(s) = ${lbl(cx, o.params.curve)}(t(s)),\\ \\lVert ${nameOf(o)}' \\rVert = 1`,
  course: (o, v, cx) =>
    v.kind === 'curve'
      ? `Theorem [[2.2.1]]: a regular curve has a unit-speed reparametrization. With the arc length function ` +
        `$s(t) = \\int_{${exprTex(o.params.base)}}^t \\lVert ${lbl(cx, o.params.curve)}'(u) \\rVert du$ (increasing, since $${lbl(cx, o.params.curve)}$ is regular) ` +
        `and its inverse $t = t(s)$, the curve $${nameOf(o)}(s) = ${lbl(cx, o.params.curve)}(t(s))$ has unit speed.\n\n` +
        `Computed numerically (table of $s(t)$ inverted by interpolation). Here $s$ runs over $[${fmt(v.a)}, ${fmt(v.b)}]$. ` +
        `Turn on the marks of both curves to see that equal steps in $s$ give equally spaced points, unlike equal steps in $t$.`
      : '',
  defaultColor: '#9a6700',
  command: { name: 'UnitSpeed', args: ['curve', 'base'] },
};

const curveField: ObjectType = {
  type: 'curveField',
  label: 'Vector field on a curve',
  group: 'curves',
  description: 'A vector field Y on α: a tangent vector Y(t) at each point α(t). Drawn at sample parameter values.',
  bookRef: '2.2.2',
  names: ['Y', 'Z', 'Y1', 'Z1'],
  dims: [2, 3],
  params: () => [
    curveRef(),
    P.select('mode', 'Field', [
      { value: 'custom', label: 'Y(t) given by coordinates' },
      { value: 'velocity', label: "Velocity α'" },
      { value: 'acceleration', label: "Acceleration α''" },
      { value: 'frenet', label: 'Y = a T + b N + c B (Frenet frame, R³)' },
      { value: 'restriction', label: 'Restriction W(α(t)) of a vector field W' },
    ]),
    P.ref('W', 'Vector field W', ['field'], { when: (p) => p.mode === 'restriction' }),
    P.vec('comps', 'Y(t) = (y₁, y₂, y₃) in the curve parameter', 3, ['t', 's', 'u'], { when: (p) => p.mode === 'custom' }),
    P.vec('fcomps', 'Coefficients (a, b, c) of T, N, B', 3, ['t', 's', 'u'], { when: (p) => p.mode === 'frenet' }),
    P.int('n', 'Number of arrows', 2, 80),
    P.expr('scale', 'Arrow length factor'),
  ],
  defaults: (_d, ctx) => ({ curve: ctx.find(['curve'])[0] ?? '', mode: 'velocity', comps: '(0, 0, 1)', fcomps: '(1, 0, 0)', n: 16, scale: 1 }),
  compute: (p, ctx): VectorsValue => {
    const c = getCurve(ctx, p.curve);
    const n = Number(p.n ?? 16);
    const sc = ctx.num(str(p.scale, '1'));
    let Y: (t: number) => Vec;
    if (p.mode === 'velocity') Y = c.d1;
    else if (p.mode === 'acceleration') Y = c.d2;
    else if (p.mode === 'restriction') {
      const W = ctx.get(str(p.W));
      if (W.kind !== 'field' || W.dim !== c.dim) throw new Error('choose a vector field in the same dimension as the curve');
      Y = (t) => W.f(c.f(t));
    } else if (p.mode === 'frenet') {
      const g = compileVec(arr(p.fcomps), [c.param], ctx).f;
      Y = (t) => {
        const F = frenetAt(c, t);
        const [a, b, cc] = g([t]);
        return [0, 1, 2].map((i) => a * F.T[i] + b * F.N[i] + cc * F.B[i]);
      };
    } else {
      const parts = arr(p.comps);
      if (parts.length !== c.dim) throw new Error(`Y needs ${c.dim} components`);
      const g = compileVec(parts, [c.param], ctx).f;
      Y = (t) => g([t]);
    }
    const items = linspace(c.a, c.b, n).flatMap((t) => {
      try {
        return [{ p: c.f(t), v: Y(t).map((x) => x * sc) }];
      } catch {
        return [];
      }
    });
    return { kind: 'vectors', items };
  },
  caption: (o) => nameOf(o),
  algebra: (o, _v, cx) => {
    const a = lbl(cx, o.params.curve);
    if (o.params.mode === 'velocity') return `${nameOf(o)} = ${a}'`;
    if (o.params.mode === 'acceleration') return `${nameOf(o)} = ${a}''`;
    if (o.params.mode === 'restriction') return `${nameOf(o)}(t) = ${lbl(cx, o.params.W)}(${a}(t))`;
    if (o.params.mode === 'frenet') {
      const [x, y, z] = arr(o.params.fcomps).map((e) => texOfSource(e));
      return `${nameOf(o)} = ${x}\\,T + ${y}\\,N + ${z}\\,B \\text{ on } ${a}`;
    }
    return `${nameOf(o)}(t) = ${texParts(arr(o.params.comps))}_{${a}(t)}`;
  },
  course: (o, _v, cx) =>
    `Definition [[2.2.2]]: a vector field $Y$ on a curve $${lbl(cx, o.params.curve)}\\colon I \\to \\mathbf{R}^3$ assigns to each $t \\in I$ a tangent vector $Y(t)$ at the point $${lbl(cx, o.params.curve)}(t)$. ` +
    `Writing $Y(t) = (y_1(t), y_2(t), y_3(t))_{${lbl(cx, o.params.curve)}(t)}$, it is differentiated coordinatewise: $Y' = (y_1', y_2', y_3')$.` +
    (o.params.mode === 'velocity' ? `\n\nHere $Y = ${lbl(cx, o.params.curve)}'$, the velocity, which is the basic example.` : ''),
  defaultColor: '#cf222e',
  command: { name: 'CurveField', args: ['curve', 'mode', 'comps'] },
};

const graph: ObjectType = {
  type: 'graph',
  label: 'Graph of g(t) (2D)',
  group: 'curves',
  description: 'The graph of a real function of one variable, drawn in the 2D view.',
  names: ['g', 'g1', 'g2', 'h1'],
  dims: [2],
  params: () => [P.expr('expr', 'g(t) =', ['t']), P.expr('a', 'From t ='), P.expr('b', 'to t =')],
  defaults: () => ({ expr: 'sin(t)', a: '-5', b: '5' }),
  compute: (p, ctx): Value => {
    const g = compileVec([str(p.expr)], ['t'], ctx).f;
    return { kind: 'plot', a: ctx.num(str(p.a)), b: ctx.num(str(p.b)), series: [{ f: (t) => g([t])[0], label: '' }] };
  },
  caption: (o) => nameOf(o),
  algebra: (o) => `${nameOf(o)}(t) = ${texOfSource(str(o.params.expr))}`,
  defaultColor: COLORS.plot,
  command: { name: 'Graph', args: ['expr', 'a', 'b'] },
};

register(curve, pointOnCurve, velocity, acceleration, reparametrization, arcLength, unitSpeed, curveField, graph);
