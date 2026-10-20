// Isometries of R^3 (Chapter 3): translations, orthogonal transformations, F = T C, tangent maps,
// orientation, frames, images of curves and congruence.

import { register } from '../core/registry';
import type { ComputeCtx, CurveValue, IsometryValue, ObjectType, Value } from '../core/types';
import { linspace } from '../math/numeric';
import { addNodes, mulNodes, num } from '../math/expr';
import {
  add, det3, fmt, identity, matDiff, matmul, matvec, neg, reflectionMatrix, rotationMatrix, scale, sub, transpose, type Mat, type Vec,
} from '../math/vec';
import { COLORS, P, curveFromNodes, getCurve, getIsometry, lbl, matrixParam, nameOf, numMat, numVec, numericCurve, str, texMat, texVec, texVecAt } from './common';
import { frenetAt } from './frenet';

const iso = (C: Mat, a: Vec, extra?: IsometryValue['extra']): IsometryValue => ({ kind: 'isometry', C, a, extra });

const sgn = (C: Mat) => (det3(C) > 0 ? 1 : -1);

function isoCourse(name: string, v: IsometryValue): string {
  const s = sgn(v.C);
  return (
    `$${name}(\\mathbf{p}) = \\mathbf{a} + C\\mathbf{p}$, i.e. $${name} = TC$ with translation $T$ by $\\mathbf{a} = ${texVec(v.a)}$ and orthogonal part ([[3.1.7]])\n\n` +
    `$$C = ${texMat(v.C, 4)},\\qquad \\det C = ${fmt(det3(v.C), 4)}$$\n\n` +
    `Sign ([[3.3.3]]): $\\operatorname{sgn} ${name} = \\det C = ${s > 0 ? '+1' : '-1'}$ — ${s > 0 ? '**orientation-preserving**' : '**orientation-reversing**'}.\n\n` +
    `Tangent map ([[3.2.1]]): $${name}_*(\\mathbf{v}_{\\mathbf{p}}) = (C\\mathbf{v})_{${name}(\\mathbf{p})}$ — use **Image under isometry** on a tangent vector, frame or curve.`
  );
}

const isoAlgebra = (o: { name: string }, v: Value | undefined, head?: string) =>
  `${head ?? nameOf(o as any)} = T_{\\mathbf{a}}C,\\ \\mathbf{a} = ${v?.kind === 'isometry' ? `${texVec(v.a)},\\ \\operatorname{sgn} = ${sgn(v.C) > 0 ? '+1' : '-1'}` : '?'}`;

const translation: ObjectType = {
  type: 'translation',
  label: 'Translation by a',
  group: 'isometries',
  description: 'T(p) = p + a.',
  bookRef: '3.1.2',
  names: ['T', 'T1', 'T2', 'S'],
  dims: [3],
  params: () => [P.vec('a', 'Translation vector a', 3)],
  defaults: () => ({ a: '(1, 2, 0)' }),
  compute: (p, ctx) => iso(identity(3), numVec(p.a, ctx, 3)),
  caption: (o) => nameOf(o),
  algebra: (o, v) => `${nameOf(o)}(\\mathbf{p}) = \\mathbf{p} + ${v?.kind === 'isometry' ? texVec(v.a) : '?'}`,
  course: (o, v) =>
    v.kind === 'isometry'
      ? `Translation by $\\mathbf{a} = ${texVec(v.a)}$: $${nameOf(o)}(\\mathbf{p}) = \\mathbf{p} + \\mathbf{a}$ ([[3.1.2]]). It is an isometry since $d(T\\mathbf{p}, T\\mathbf{q}) = \\lVert \\mathbf{p} - \\mathbf{q} \\rVert$. ` +
        `Translations commute and $T^{-1}$ is translation by $-\\mathbf{a}$ ([[3.1.4]]). Orthogonal part: $I$; sign $+1$ ([[3.3.4]]).`
      : '',
  defaultColor: COLORS.isometry,
  command: { name: 'Translation', args: ['a'] },
};

const rotation: ObjectType = {
  type: 'rotation',
  label: 'Rotation about an axis',
  group: 'isometries',
  description: 'The orthogonal transformation rotating R³ by angle ϑ about an axis through the origin.',
  bookRef: '3.1.2',
  names: ['C', 'C1', 'C2', 'R'],
  dims: [3],
  params: () => [P.vec('axis', 'Axis direction', 3), P.expr('angle', 'Angle ϑ (radians)')],
  defaults: () => ({ axis: '(0, 0, 1)', angle: 'pi/4' }),
  compute: (p, ctx) => iso(rotationMatrix(numVec(p.axis, ctx, 3), ctx.num(str(p.angle))), [0, 0, 0]),
  caption: (o) => nameOf(o),
  algebra: (o, v) => isoAlgebra(o, v),
  course: (o, v) =>
    v.kind === 'isometry'
      ? `A rotation is an orthogonal transformation ($\\det C = +1$). Example [[3.1.2]] (2): rotation about the $z$ axis is $C(\\mathbf{p}) = (p_1\\cos\\vartheta - p_2\\sin\\vartheta,\\ p_1\\sin\\vartheta + p_2\\cos\\vartheta,\\ p_3)$. ` +
        `Orthogonal transformations are isometries ([[3.1.5]]).\n\n` +
        isoCourse(nameOf(o), v)
      : '',
  defaultColor: COLORS.isometry,
  command: { name: 'Rotation', args: ['axis', 'angle'] },
};

const reflection: ObjectType = {
  type: 'reflection',
  label: 'Reflection in a plane',
  group: 'isometries',
  description: 'Reflection in the plane through the origin orthogonal to n (an orientation-reversing orthogonal transformation).',
  bookRef: '3.3.4',
  names: ['R', 'R1', 'R2'],
  dims: [3],
  params: () => [P.vec('n', 'Normal n of the plane', 3)],
  defaults: () => ({ n: '(0, 0, 1)' }),
  presets: () => [
    { label: 'In the xy plane: (x, y, z) ↦ (x, y, −z)', params: { n: '(0, 0, 1)' } },
    { label: 'In the yz plane: (x, y, z) ↦ (−x, y, z)', params: { n: '(1, 0, 0)' } },
    { label: 'In the xz plane', params: { n: '(0, 1, 0)' } },
  ],
  compute: (p, ctx) => iso(reflectionMatrix(numVec(p.n, ctx, 3)), [0, 0, 0]),
  caption: (o) => nameOf(o),
  algebra: (o, v) => isoAlgebra(o, v),
  course: (o, v) => (v.kind === 'isometry' ? `Reflection: $C = I - 2\\,\\mathbf{n}\\,{}^t\\mathbf{n}$ for a unit normal $\\mathbf{n}$ (compare [[3.3.4]] (3), reflection in the $yz$ plane).\n\n` + isoCourse(nameOf(o), v) : ''),
  defaultColor: COLORS.isometry,
  command: { name: 'Reflection', args: ['n'] },
};

const orthogonal: ObjectType = {
  type: 'orthogonal',
  label: 'Orthogonal transformation (matrix)',
  group: 'isometries',
  description: 'A linear transformation C with ᵗC C = I, given by its matrix.',
  bookRef: '3.1.5',
  names: ['C', 'C1', 'C2', 'Q'],
  dims: [3],
  params: () => [{ key: 'C', label: 'Matrix C (rows separated by ;)', kind: 'matrix', vars: [] }],
  defaults: () => ({ C: '0, -1, 0; 1, 0, 0; 0, 0, 1' }),
  compute: (p, ctx) => {
    const C = numMat(matrixParam(p.C), ctx);
    const err = matDiff(matmul(transpose(C), C), identity(3));
    if (err > 1e-6) throw new Error(`C is not orthogonal (ᵗC C ≠ I, error ${fmt(err)}), so it is not an isometry`);
    return iso(C, [0, 0, 0]);
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => isoAlgebra(o, v),
  course: (o, v) =>
    v.kind === 'isometry'
      ? `An orthogonal transformation is a linear $C\\colon \\mathbf{R}^3 \\to \\mathbf{R}^3$ preserving dot products: $C\\mathbf{p} \\bullet C\\mathbf{q} = \\mathbf{p}\\bullet\\mathbf{q}$, i.e. its matrix satisfies ${'{}^t'}C\\,C = I$. By [[3.1.5]] it is an isometry.\n\n` +
        isoCourse(nameOf(o), v)
      : '',
  defaultColor: COLORS.isometry,
  command: { name: 'Orthogonal', args: ['C'] },
};

const isometry: ObjectType = {
  type: 'isometry',
  label: 'Isometry F = T C',
  group: 'isometries',
  description: 'F(p) = a + C(p): an orthogonal transformation C followed by the translation T by a (Theorem 3.1.7).',
  bookRef: '3.1.7',
  names: ['F', 'G', 'H', 'F1', 'G1'],
  dims: [3],
  params: () => [P.vec('a', 'Translation vector a', 3), P.ref('C', 'Orthogonal part C (an isometry fixing 0)', ['isometry'])],
  defaults: (_d, ctx) => ({ a: '(1, 1, 0)', C: ctx.find(['isometry'], (v) => v.kind === 'isometry' && v.a.every((x) => Math.abs(x) < 1e-12))[0] ?? '' }),
  compute: (p, ctx) => {
    const C = getIsometry(ctx, p.C);
    if (C.a.some((x) => Math.abs(x) > 1e-12)) throw new Error(`${str(p.C)} moves the origin; use its orthogonal part`);
    return iso(C.C, numVec(p.a, ctx, 3));
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => isoAlgebra(o, v),
  course: (o, v) => (v.kind === 'isometry' ? `Theorem [[3.1.7]]: every isometry is uniquely $F = TC$, $C$ orthogonal, $T$ a translation.\n\n` + isoCourse(nameOf(o), v) : ''),
  defaultColor: COLORS.isometry,
  command: { name: 'Isometry', args: ['a', 'C'] },
};

const composition: ObjectType = {
  type: 'composition',
  label: 'Composite G F',
  group: 'isometries',
  description: '(GF)(p) = G(F(p)). Composites of isometries are isometries (Lemma 3.1.3).',
  bookRef: '3.1.3',
  names: ['GF', 'H', 'H1'],
  dims: [3],
  params: () => [P.ref('F', 'First F', ['isometry']), P.ref('G', 'Then G', ['isometry'])],
  defaults: (_d, ctx) => {
    const is = ctx.find(['isometry']);
    return { F: is[1] ?? is[0] ?? '', G: is[0] ?? '' };
  },
  compute: (p, ctx) => {
    const F = getIsometry(ctx, p.F);
    const G = getIsometry(ctx, p.G);
    return iso(matmul(G.C, F.C), add(matvec(G.C, F.a), G.a));
  },
  caption: (o, cx) => `${lbl(cx, o.params.G)}${lbl(cx, o.params.F)}`,
  algebra: (o, v, cx) => isoAlgebra(o, v, `${lbl(cx, o.params.G)}${lbl(cx, o.params.F)}`),
  course: (o, v, cx) =>
    v.kind === 'isometry' ? `Lemma [[3.1.3]]: $GF$ is an isometry. Its orthogonal part is the product of the orthogonal parts, so $\\operatorname{sgn}(GF) = \\operatorname{sgn} G\\, \\operatorname{sgn} F$.\n\n` + isoCourse(`${lbl(cx, o.params.G)}${lbl(cx, o.params.F)}`, v) : '',
  defaultColor: COLORS.isometry,
  command: { name: 'Compose', args: ['F', 'G'] },
};

const inverse: ObjectType = {
  type: 'inverse',
  label: 'Inverse F⁻¹',
  group: 'isometries',
  description: 'F⁻¹(p) = ᵗC(p − a).',
  bookRef: 'n.inverseIso',
  names: ['Finv', 'Ginv', 'Hinv'],
  dims: [3],
  params: () => [P.ref('F', 'Isometry F', ['isometry'])],
  defaults: (_d, ctx) => ({ F: ctx.find(['isometry'])[0] ?? '' }),
  compute: (p, ctx) => {
    const F = getIsometry(ctx, p.F);
    const Ct = transpose(F.C);
    return iso(Ct, neg(matvec(Ct, F.a)));
  },
  caption: (o, cx) => `${lbl(cx, o.params.F)}^{-1}`,
  algebra: (o, v, cx) => isoAlgebra(o, v, `${lbl(cx, o.params.F)}^{-1}`),
  course: (o, v, cx) => (v.kind === 'isometry' ? `If $F = TC$ then $F^{-1} = C^{-1}T^{-1}$ with $C^{-1} = {}^tC$ (§3.1).\n\n` + isoCourse(`${lbl(cx, o.params.F)}^{-1}`, v) : ''),
  defaultColor: COLORS.isometry,
  command: { name: 'Inverse', args: ['F'] },
};

/** Image of a curve under p ↦ a + Cp (symbolic when possible). */
export function isoCurve(F: IsometryValue, c: CurveValue, ctx: ComputeCtx): CurveValue {
  if (c.dim !== 3) throw new Error('isometries act on R³');
  if (c.exprs) {
    const nodes = [0, 1, 2].map((i) => addNodes([num(F.a[i]), ...[0, 1, 2].map((j) => mulNodes(num(F.C[i][j]), c.exprs![j]))]));
    return curveFromNodes(nodes, c.param, c.a, c.b, ctx);
  }
  return numericCurve(3, c.param, c.a, c.b, (t) => add(F.a, matvec(F.C, c.f(t))));
}

const image: ObjectType = {
  type: 'isoImage',
  label: 'Image under an isometry',
  group: 'isometries',
  description: 'F(p) for a point, F*(v) for a tangent vector or frame (Theorem 3.2.1), F(α) for a curve.',
  bookRef: '3.2.1',
  names: ['Fx', 'Fx1', 'Fx2', 'Fx3'],
  dims: [3],
  params: () => [P.ref('F', 'Isometry F', ['isometry']), P.ref('X', 'Object (point, tangent vector, frame, curve)', ['point', 'vector', 'frame', 'curve', 'vectors'])],
  defaults: (_d, ctx) => ({ F: ctx.find(['isometry'])[0] ?? '', X: ctx.find(['curve', 'frame', 'vector', 'point'])[0] ?? '' }),
  compute: (p, ctx): Value => {
    const F = getIsometry(ctx, p.F);
    const X = ctx.get(str(p.X));
    const Fp = (q: Vec) => add(F.a, matvec(F.C, q));
    switch (X.kind) {
      case 'point':
        return { kind: 'point', p: Fp(X.p) };
      case 'vector':
        return { kind: 'vector', p: Fp(X.p), v: matvec(F.C, X.v) };
      case 'frame':
        return { kind: 'frame', p: Fp(X.p), e: X.e.map((e) => matvec(F.C, e)) as [Vec, Vec, Vec], labels: X.labels.map((l) => `\\bar{${l}}`) as [string, string, string] };
      case 'vectors':
        return { kind: 'vectors', items: X.items.map((it) => ({ ...it, p: Fp(it.p), v: matvec(F.C, it.v) })), dashed: X.dashed };
      case 'curve':
        return isoCurve(F, X, ctx);
    }
    throw new Error('choose a point, tangent vector, frame or curve');
  },
  caption: (o, cx) => {
    const X = cx.get(str(o.params.X));
    const star = X && (X.kind === 'vector' || X.kind === 'frame' || X.kind === 'vectors');
    return `${lbl(cx, o.params.F)}${star ? '_*' : ''}(${lbl(cx, o.params.X)})`;
  },
  algebra: (o, v, cx) => {
    const X = cx.get(str(o.params.X));
    const star = X && (X.kind === 'vector' || X.kind === 'frame' || X.kind === 'vectors');
    const head = `${lbl(cx, o.params.F)}${star ? '_*' : ''}(${lbl(cx, o.params.X)})`;
    if (v?.kind === 'point') return `${head} = ${texVec(v.p)}`;
    if (v?.kind === 'vector') return `${head} = ${texVecAt(v.v, v.p)}`;
    return head;
  },
  course: (o, v, cx) => {
    const F = lbl(cx, o.params.F);
    const X = lbl(cx, o.params.X);
    if (v.kind === 'curve')
      return `The image curve $\\bar\\beta = ${F}(${X})$ ([[1.7.2]]). Theorem [[3.4.2]]: if $${X}$ is unit-speed with $\\kappa > 0$, then $\\bar\\kappa = \\kappa$, $\\bar\\tau = (\\operatorname{sgn} ${F})\\,\\tau$, $\\bar T = ${F}_*(T)$, $\\bar N = ${F}_*(N)$, $\\bar B = (\\operatorname{sgn} ${F})\\, ${F}_*(B)$. Compare their **Frenet frames** and **κ, τ plots**.`;
    if (v.kind === 'vector' || v.kind === 'frame' || v.kind === 'vectors')
      return `Theorem [[3.2.1]]: $${F}_*(\\mathbf{v}_{\\mathbf{p}}) = (C\\mathbf{v})_{${F}(\\mathbf{p})}$ — rotate the vector part by the orthogonal part $C$ and move the point of application to $${F}(\\mathbf{p})$. ` +
        `Isometries preserve dot products of tangent vectors ([[3.2.2]]), so they carry frames to frames; cross products: $${F}_*(\\mathbf{v}\\times\\mathbf{w}) = (\\operatorname{sgn} ${F})\\, ${F}_*\\mathbf{v} \\times ${F}_*\\mathbf{w}$ ([[3.3.6]]).`;
    return `$${F}(${X})$, the image point.`;
  },
  defaultColor: '#953800',
  command: { name: 'ApplyIsometry', args: ['F', 'X'] },
};

const fromFrames: ObjectType = {
  type: 'isoFromFrames',
  label: 'Isometry carrying a frame to a frame',
  group: 'isometries',
  description: 'The unique isometry F with F*(eᵢ) = fᵢ (Theorem 3.2.3).',
  bookRef: '3.2.3',
  names: ['F', 'F1', 'F2'],
  dims: [3],
  params: () => [P.ref('e', 'Frame e₁, e₂, e₃ at p', ['frame']), P.ref('f', 'Frame f₁, f₂, f₃ at q', ['frame'])],
  defaults: (_d, ctx) => {
    const fs = ctx.find(['frame']);
    return { e: fs[1] ?? fs[0] ?? '', f: fs[0] ?? '' };
  },
  compute: (p, ctx) => {
    const e = ctx.get(str(p.e));
    const f = ctx.get(str(p.f));
    if (e.kind !== 'frame' || f.kind !== 'frame') throw new Error('choose two frames');
    // C = ᵗB A where A, B are the attitude matrices (rows = frame vectors)
    const C = matmul(transpose(f.e), e.e);
    const a = sub(f.p, matvec(C, e.p));
    return iso(C, a);
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => isoAlgebra(o, v),
  course: (o, v, cx) =>
    v.kind === 'isometry'
      ? `Theorem [[3.2.3]]: given frames $\\mathbf{e}_i$ at $\\mathbf{p}$ and $\\mathbf{f}_i$ at $\\mathbf{q}$ there is a unique isometry $F$ with $F_*(\\mathbf{e}_i) = \\mathbf{f}_i$. ` +
        `With attitude matrices $A$ (of $${lbl(cx, o.params.e)}$) and $B$ (of $${lbl(cx, o.params.f)}$): $C = {}^tB\\,A$ and $F = TC$ where $T$ is translation by $\\mathbf{q} - C(\\mathbf{p})$.\n\n` +
        isoCourse(nameOf(o), v)
      : '',
  defaultColor: COLORS.isometry,
  command: { name: 'IsometryFromFrames', args: ['e', 'f'] },
};

const congruence: ObjectType = {
  type: 'congruence',
  label: 'Congruence test of two curves',
  group: 'isometries',
  description: 'Compares speed, curvature and torsion of α and β (Theorem 3.5.3, Corollary 3.5.6); if they agree, builds the isometry F with β = F(α).',
  bookRef: '3.5.3',
  names: ['Fc', 'Fc1', 'Fc2'],
  dims: [3],
  params: () => [P.ref('alpha', 'Curve α', ['curve']), P.ref('beta', 'Curve β (same interval)', ['curve']), P.expr('t0', 'Match the Frenet frames at t₀ =')],
  defaults: (_d, ctx) => {
    const cs = ctx.find(['curve']);
    return { alpha: cs[1] ?? cs[0] ?? '', beta: cs[0] ?? '', t0: '0' };
  },
  compute: (p, ctx): Value => {
    const A = getCurve(ctx, p.alpha);
    const B = getCurve(ctx, p.beta);
    const t0 = ctx.num(str(p.t0));
    const lo = Math.max(A.a, B.a);
    const hi = Math.min(A.b, B.b);
    if (!(hi > lo)) throw new Error('the curves have no common parameter interval');
    let dv = 0;
    let dk = 0;
    let dtPlus = 0;
    let dtMinus = 0;
    for (const t of linspace(lo, hi, 60)) {
      const fa = frenetAt(A, t);
      const fb = frenetAt(B, t);
      dv = Math.max(dv, Math.abs(fa.v - fb.v));
      dk = Math.max(dk, Math.abs(fa.kappa - fb.kappa));
      dtPlus = Math.max(dtPlus, Math.abs(fa.tau - fb.tau));
      dtMinus = Math.max(dtMinus, Math.abs(fa.tau + fb.tau));
    }
    const eps = 1e-5;
    const sign = dtPlus < eps ? 1 : dtMinus < eps ? -1 : 0;
    const facts: [string, string][] = [
      ['\\max|v_\\alpha - v_\\beta|', fmt(dv, 7)],
      ['\\max|\\kappa_\\alpha - \\kappa_\\beta|', fmt(dk, 7)],
      ['\\max|\\tau_\\alpha - \\tau_\\beta|', fmt(dtPlus, 7)],
      ['\\max|\\tau_\\alpha + \\tau_\\beta|', fmt(dtMinus, 7)],
    ];
    if (dv > eps || dk > eps || sign === 0) {
      return { kind: 'info', extra: { facts, congruent: false } };
    }
    // F carries T, N, B of α at t0 to T, N, sgn·B of β at t0 (Theorem 3.4.2 / proof of 3.5.3).
    const fa = frenetAt(A, t0);
    const fb = frenetAt(B, t0);
    const Ea = [fa.T, fa.N, fa.B];
    const Eb = [fb.T, fb.N, scale(fb.B, sign)];
    const C = matmul(transpose(Eb), Ea);
    const a = sub(B.f(t0), matvec(C, A.f(t0)));
    return iso(C, a, { facts, congruent: true, sign });
  },
  caption: (o) => nameOf(o),
  algebra: (o, v, cx) =>
    v?.kind === 'isometry'
      ? `${lbl(cx, o.params.beta)} = ${nameOf(o)}(${lbl(cx, o.params.alpha)}),\\ \\operatorname{sgn} ${nameOf(o)} = ${sgn(v.C) > 0 ? '+1' : '-1'}`
      : v?.kind === 'info'
        ? `${lbl(cx, o.params.alpha)},\\ ${lbl(cx, o.params.beta)} \\text{ are not congruent}`
        : '?',
  course: (o, v, cx) => {
    const a = lbl(cx, o.params.alpha);
    const b = lbl(cx, o.params.beta);
    const facts = (v.extra?.facts ?? []) as [string, string][];
    let s =
      `Definition [[3.5.1]]: $${a}, ${b}\\colon I \\to \\mathbf{R}^3$ are congruent if $${b} = F(${a})$ for some isometry $F$. ` +
      `Theorem [[3.5.3]] (unit speed) and Corollary [[3.5.6]] (arbitrary speed): if $v_\\alpha = v_\\beta$, $\\kappa_\\alpha = \\kappa_\\beta > 0$ and $\\tau_\\alpha = \\pm\\tau_\\beta$, they are congruent.\n\n` +
      `Sampled comparison on the common interval: $$${facts.map(([k, x]) => `${k} = ${x}`).join(',\\quad ')}$$\n\n`;
    if (v.kind === 'isometry') {
      s +=
        `**Congruent.** As in the proof of [[3.5.3]], $F$ is the isometry carrying the Frenet frame of $${a}$ at $t_0$ to ` +
        `${v.extra?.sign === 1 ? `that of $${b}$` : `$T, N, -B$ of $${b}$ (since $\\tau_\\beta = -\\tau_\\alpha$, $F$ must reverse orientation, [[3.4.2]])`}. ` +
        `Use **Image under an isometry** with $F$ and $${a}$: the image lies exactly on $${b}$.\n\n` +
        isoCourse(nameOf(o), v);
    } else s += `**Not congruent** (at least one of the conditions fails), so no isometry is built.`;
    return s;
  },
  defaultColor: COLORS.isometry,
  command: { name: 'Congruence', args: ['alpha', 'beta', 't0'] },
};

register(translation, rotation, reflection, orthogonal, isometry, composition, inverse, image, fromFrames, congruence);
