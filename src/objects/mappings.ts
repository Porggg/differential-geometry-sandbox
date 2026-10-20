// Mappings F: R^n -> R^m (§1.7). The sandbox draws the cases R²→R² (2D view) and R³→R³ (3D view).

import { register } from '../core/registry';
import type { MappingValue, ObjectType, Value } from '../core/types';
import { derivative, parse, resolve, substitute, tex } from '../math/expr';
import { det, fmt, matvec } from '../math/vec';
import {
  COLORS, P, arr, compileNodes, coordVars, curveFromNodes, getCurve, getMapping, getVector, lbl, nameOf, numericCurve, pointOf, str,
  texMat, texNodeMat, texNodes, texParts, texVec, texVecAt,
} from './common';

const NOTE = 'In the book a mapping F: Rⁿ → Rᵐ is defined for any n and m. The sandbox draws R² → R² in the 2D view and R³ → R³ in the 3D view.';

const mapping: ObjectType = {
  type: 'mapping',
  label: 'Mapping F',
  group: 'mappings',
  description: 'A mapping F = (f₁, …, fₘ): Rⁿ → Rᵐ given by its Euclidean coordinate functions. Drawn as the image of a coordinate grid.',
  bookRef: '1.7.1',
  names: ['F', 'G', 'H', 'F1', 'G1'],
  dims: [2, 3],
  note: NOTE,
  params: (dim) => [
    P.vec('comps', `Euclidean coordinate functions (f₁, …, f${dim === 2 ? '₂' : '₃'}) in ${coordVars(dim).join(', ')}`, dim, coordVars(dim)),
    P.expr('box', 'Image of the grid in [−R, R]ⁿ, R ='),
    P.int('lines', 'Grid lines per direction', 2, 30),
    P.bool('showDomain', 'Also draw the original grid (faint)'),
    { key: 'dim', label: 'dim', kind: 'int', min: 2, max: 3, when: () => false },
  ],
  defaults: (dim) =>
    dim === 2
      ? { comps: '(x^2 - y^2, 2*x*y)', box: 1.5, lines: 13, showDomain: true, dim }
      : { comps: '(x - y, x^2 + y^2, z/2 + x)', box: 1, lines: 5, showDomain: false, dim },
  presets: (dim) =>
    dim === 2
      ? [
          { label: 'Polar coordinates (r, θ) ↦ (r cos θ, r sin θ)', params: { comps: '(x*cos(y), x*sin(y))', box: 3, lines: 13 } },
          { label: 'Complex square z ↦ z²', params: { comps: '(x^2 - y^2, 2*x*y)', box: 1.5, lines: 13 } },
          { label: 'Linear (2x + y, x + y)', params: { comps: '(2*x + y, x + y)', box: 1.5, lines: 9 } },
        ]
      : [
          { label: 'Example 1.7.3 (1): (x − y, x² + y², z)', params: { comps: '(x - y, x^2 + y^2, z)', box: 1, lines: 5 } },
          { label: 'Rotation about the z axis by θ = 0.6', params: { comps: '(x*cos(0.6) - y*sin(0.6), x*sin(0.6) + y*cos(0.6), z)', box: 1, lines: 5 } },
          { label: 'Shear (x + z, y, z)', params: { comps: '(x + z, y, z)', box: 1, lines: 5 } },
        ],
  compute: (p, ctx): MappingValue => {
    const dim = Number(p.dim ?? arr(p.comps).length);
    const vars = coordVars(dim);
    const parts = arr(p.comps);
    if (parts.length !== dim) throw new Error(`the sandbox draws mappings R^${dim} → R^${dim}: give ${dim} coordinate functions`);
    const env = { vars, numbers: ctx.numbers, functions: ctx.functions };
    const exprs = parts.map((s) => resolve(parse(s), env));
    const f = compileNodes(exprs, vars, ctx);
    const jac = exprs.map((e) => vars.map((x) => derivative(e, x)));
    return { kind: 'mapping', n: dim, m: dim, vars, exprs, f, jac, box: ctx.num(str(p.box, '1')), lines: Number(p.lines ?? 5), showDomain: !!p.showDomain };
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => {
    const vars = coordVars(Number(o.params.dim ?? 3));
    return `${nameOf(o)}(${vars.join(', ')}) = ${v?.kind === 'mapping' ? texNodes(v.exprs) : texParts(arr(o.params.comps))}`;
  },
  course: (o, v) => {
    if (v.kind !== 'mapping') return '';
    const n = nameOf(o);
    let detTex = '';
    try {
      if (v.n === 2) detTex = tex(parse(`(${v.jac[0][0].toString()})*(${v.jac[1][1].toString()}) - (${v.jac[0][1].toString()})*(${v.jac[1][0].toString()})`));
    } catch {
      /* ignore */
    }
    return (
      `> ${NOTE}\n\n` +
      `A mapping $${n}\\colon \\mathbf{R}^${v.n} \\to \\mathbf{R}^${v.m}$ ([[1.7.1]]) is differentiable when its Euclidean coordinate functions are:\n\n` +
      `$$${n} = ${texNodes(v.exprs)}$$\n\n` +
      `Its tangent map $${n}_*$ ([[1.7.4]]) is computed by the **Jacobian matrix** ([[1.7.8]]):\n\n` +
      `$$J = \\left(\\frac{\\partial f_i}{\\partial x_j}\\right) = ${texNodeMat(v.jac)}$$\n\n` +
      (detTex ? `$\\det J = ${detTex}$. ` : '') +
      `$${n}$ is **regular** ([[1.7.9]]) when $${n}_{*p}$ is one-to-one at every $p$, i.e. $\\det J(p) \\ne 0$; then by the inverse function theorem ([[1.7.10]]) it is a local diffeomorphism.\n\n` +
      `Drawn: the image under $${n}$ of the coordinate grid of $[-${fmt(v.box)}, ${fmt(v.box)}]^${v.n}$ (${v.lines} lines per direction).`
    );
  },
  defaultColor: COLORS.mapping,
  command: { name: 'Mapping', args: ['comps'] },
};

const tangentMap: ObjectType = {
  type: 'tangentMap',
  label: 'Tangent map F*(vₚ)',
  group: 'mappings',
  description: 'F*(vₚ) is the initial velocity of the curve t ↦ F(p + tv), a tangent vector at F(p).',
  bookRef: '1.7.4',
  names: ['Fv', 'Fw', 'Fv1'],
  dims: [2, 3],
  note: NOTE,
  params: () => [P.ref('F', 'Mapping F', ['mapping']), P.ref('v', 'Tangent vector vₚ', ['vector'])],
  defaults: (_d, ctx) => ({ F: ctx.find(['mapping'])[0] ?? '', v: ctx.find(['vector'])[0] ?? '' }),
  compute: (p, ctx): Value => {
    const F = getMapping(ctx, p.F);
    const v = getVector(ctx, p.v);
    if (v.p.length !== F.n) throw new Error(`vₚ must be tangent to R^${F.n}`);
    const J = F.jac.map((row) => compileNodes(row, F.vars, ctx)(v.p));
    return { kind: 'vector', p: F.f(v.p), v: matvec(J, v.v), extra: { J } };
  },
  caption: (o, cx) => `${lbl(cx, o.params.F)}_*(${lbl(cx, o.params.v)})`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.F)}_*(${lbl(cx, o.params.v)}) = ${v?.kind === 'vector' ? texVecAt(v.v, v.p) : '?'}`,
  course: (o, v, cx) => {
    const vv = cx.get(str(o.params.v));
    if (v.kind !== 'vector' || vv?.kind !== 'vector') return '';
    const J = v.extra?.J as number[][];
    const F = lbl(cx, o.params.F);
    return (
      `Definition [[1.7.4]]: $${F}_*(v_p)$ is the initial velocity of the curve $t \\mapsto ${F}(p + tv)$. ` +
      `By [[1.7.5]] it equals $\\left(v[f_1], \\dots, v[f_m]\\right)_{${F}(p)}$, i.e. the Jacobian matrix at $p$ times $v$ ([[1.7.8]]):\n\n` +
      `$$${F}_*(${lbl(cx, o.params.v)}) = ${texMat(J)} ${texMat(vv.v.map((x) => [x]))} = ${texVecAt(v.v, v.p)}$$\n\n` +
      `$\\det J(p) = ${fmt(det(J), 5)}$` +
      (Math.abs(det(J)) < 1e-9 ? ` — $${F}_{*p}$ is **not** one-to-one at this point.` : ` — $${F}_{*p}$ is one-to-one here ([[1.7.9]]).`)
    );
  },
  defaultColor: COLORS.derived,
  command: { name: 'TangentMap', args: ['F', 'v'] },
};

const imageCurve: ObjectType = {
  type: 'imageCurve',
  label: 'Image curve F(α)',
  group: 'mappings',
  description: 'The image β = F(α) of a curve under a mapping.',
  bookRef: '1.7.2',
  names: ['beta', 'beta1', 'gamma1'],
  dims: [2, 3],
  params: () => [P.ref('F', 'Mapping F', ['mapping']), P.ref('curve', 'Curve α', ['curve'])],
  defaults: (_d, ctx) => ({ F: ctx.find(['mapping'])[0] ?? '', curve: ctx.find(['curve'])[0] ?? '' }),
  compute: (p, ctx) => {
    const F = getMapping(ctx, p.F);
    const c = getCurve(ctx, p.curve);
    if (c.dim !== F.n) throw new Error(`α must be a curve in R^${F.n}`);
    if (c.exprs) {
      const map: Record<string, any> = {};
      F.vars.forEach((x, i) => (map[x] = c.exprs![i]));
      return curveFromNodes(F.exprs.map((e) => substitute(e, map)), c.param, c.a, c.b, ctx);
    }
    return numericCurve(F.m, c.param, c.a, c.b, (t) => F.f(c.f(t)));
  },
  caption: (o, cx) => `${lbl(cx, o.params.F)}(${lbl(cx, o.params.curve)})`,
  algebra: (o, v, cx) => `${nameOf(o)} = ${lbl(cx, o.params.F)}(${lbl(cx, o.params.curve)})${v?.kind === 'curve' && v.exprs ? ` = ${texNodes(v.exprs)}` : ''}`,
  course: (o, _v, cx) =>
    `Definition [[1.7.2]]: the image of the curve $${lbl(cx, o.params.curve)}$ under $${lbl(cx, o.params.F)}$ is the composite curve $${lbl(cx, o.params.F)}(${lbl(cx, o.params.curve)})$. ` +
    `Corollary [[1.7.7]]: its velocity is $\\beta' = ${lbl(cx, o.params.F)}_*(${lbl(cx, o.params.curve)}')$ — try it with **Velocity** and **Tangent map**.`,
  defaultColor: '#bf3989',
  command: { name: 'Image', args: ['F', 'curve'] },
};

const imagePoint: ObjectType = {
  type: 'imagePoint',
  label: 'Image point F(p)',
  group: 'mappings',
  description: 'The point F(p).',
  bookRef: '1.7.1',
  names: ['Fp', 'Fq', 'Fp1'],
  dims: [2, 3],
  params: (dim) => [P.ref('F', 'Mapping F', ['mapping']), P.vec('p', 'Point p', dim, [], { help: 'Coordinates or the name of a point.' })],
  defaults: (_d, ctx) => ({ F: ctx.find(['mapping'])[0] ?? '', p: ctx.find(['point'])[0] ?? '(0.5, 0.5)' }),
  compute: (p, ctx) => {
    const F = getMapping(ctx, p.F);
    return { kind: 'point', p: F.f(pointOf(ctx, p.p, F.n)) };
  },
  caption: (o, cx) => `${lbl(cx, o.params.F)}(${/^[A-Za-z]/.test(str(o.params.p)) ? lbl(cx, o.params.p) : 'p'})`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.F)}(${/^[A-Za-z]/.test(str(o.params.p)) ? lbl(cx, o.params.p) : texParts(arr(o.params.p))}) = ${v?.kind === 'point' ? texVec(v.p) : '?'}`,
  defaultColor: '#bf3989',
  command: { name: 'ImagePoint', args: ['F', 'p'] },
};

register(mapping, tangentMap, imageCurve, imagePoint);
