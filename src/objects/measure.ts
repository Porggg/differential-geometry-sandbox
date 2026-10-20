// Dot product, norm, distance, angle, cross product, frames (§2.1).

import { register } from '../core/registry';
import type { ComputeCtx, ObjectType, ParamValue, Value } from '../core/types';
import { cross, det3, dist, dot, fmt, norm, scale, sub, type Vec } from '../math/vec';
import { COLORS, P, arr, getVector, lbl, linCombTex, nameOf, numVec, pointOf, str, texMat, texNum, texPointParam, texVec, texVecAt } from './common';

/** A vector-ish operand: tangent vector (or a point, viewed as a vector). */
function operand(ctx: ComputeCtx, n: ParamValue | undefined): { v: Vec; p: Vec; isPoint: boolean } {
  const v = ctx.get(str(n));
  if (v.kind === 'vector') return { v: v.v, p: v.p, isPoint: false };
  if (v.kind === 'point') return { v: v.p, p: v.p.map(() => 0), isPoint: true };
  throw new Error(`${str(n)} is not a tangent vector or a point`);
}

const samePointWarning = (a: Vec, b: Vec): string[] =>
  a.some((x, i) => Math.abs(x - b[i]) > 1e-9)
    ? ['The two tangent vectors have different points of application; the book defines this product only for vectors at the same point (it is computed here from the vector parts).']
    : [];

const vecRef = (key: string, label: string) => P.ref(key, label, ['vector', 'point']);

const dotProduct: ObjectType = {
  type: 'dot',
  label: 'Dot product v • w',
  group: 'measure',
  description: 'v • w = v₁w₁ + v₂w₂ + v₃w₃ (tangent vectors at the same point, or points).',
  bookRef: '2.1.3',
  names: ['dvw', 'd1', 'd2', 'd3'],
  dims: [2, 3],
  params: () => [vecRef('v', 'v'), vecRef('w', 'w')],
  defaults: (_d, ctx) => {
    const vs = ctx.find(['vector']);
    return { v: vs[1] ?? vs[0] ?? '', w: vs[0] ?? '' };
  },
  compute: (p, ctx): Value => {
    const a = operand(ctx, p.v);
    const b = operand(ctx, p.w);
    if (a.v.length !== b.v.length) throw new Error('dimensions differ');
    return { kind: 'number', value: dot(a.v, b.v), extra: { warnings: a.isPoint || b.isPoint ? [] : samePointWarning(a.p, b.p) } };
  },
  caption: (o, cx) => `${lbl(cx, o.params.v)} \\bullet ${lbl(cx, o.params.w)}`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.v)} \\bullet ${lbl(cx, o.params.w)} = ${v?.kind === 'number' ? texNum(v.value) : '?'}`,
  course: (o, v, cx) => {
    const a = cx.get(str(o.params.v));
    const b = cx.get(str(o.params.w));
    const va = a?.kind === 'vector' ? a.v : a?.kind === 'point' ? a.p : null;
    const vb = b?.kind === 'vector' ? b.v : b?.kind === 'point' ? b.p : null;
    if (v.kind !== 'number' || !va || !vb) return '';
    return (
      `Definitions [[2.1.1]] and [[2.1.3]]: $\\mathbf{v} \\bullet \\mathbf{w} = \\sum v_i w_i$.\n\n` +
      `$$${lbl(cx, o.params.v)} \\bullet ${lbl(cx, o.params.w)} = ${va.map((x, i) => `(${fmt(x)})(${fmt(vb[i])})`).join(' + ')} = ${fmt(v.value, 6)}$$\n\n` +
      (Math.abs(v.value) < 1e-9 ? 'The vectors are **orthogonal**.' : `Angle: $\\cos\\vartheta = \\dfrac{\\mathbf{v}\\bullet\\mathbf{w}}{\\lVert\\mathbf{v}\\rVert\\lVert\\mathbf{w}\\rVert} = ${fmt(v.value / (norm(va) * norm(vb)), 5)}$.`)
    );
  },
  command: { name: 'Dot', args: ['v', 'w'] },
};

const normType: ObjectType = {
  type: 'norm',
  label: 'Norm ‖v‖',
  group: 'measure',
  description: '‖v‖ = (v • v)^{1/2}.',
  bookRef: '2.1.1',
  names: ['nv', 'nw', 'n1'],
  dims: [2, 3],
  params: () => [vecRef('v', 'v')],
  defaults: (_d, ctx) => ({ v: ctx.find(['vector'])[0] ?? '' }),
  compute: (p, ctx) => ({ kind: 'number', value: norm(operand(ctx, p.v).v) }),
  caption: (o, cx) => `\\lVert ${lbl(cx, o.params.v)} \\rVert`,
  algebra: (o, v, cx) => `\\lVert ${lbl(cx, o.params.v)} \\rVert = ${v?.kind === 'number' ? texNum(v.value) : '?'}`,
  course: (o, v, cx) => (v.kind === 'number' ? `The norm is $\\lVert \\mathbf{v} \\rVert = (\\mathbf{v} \\bullet \\mathbf{v})^{1/2}$ (§2.1). $\\lVert ${lbl(cx, o.params.v)} \\rVert = ${fmt(v.value, 6)}$.` : ''),
  command: { name: 'Norm', args: ['v'] },
};

const distance: ObjectType = {
  type: 'distance',
  label: 'Distance d(p, q)',
  group: 'measure',
  description: 'The Euclidean distance d(p, q) = ‖p − q‖. The segment pq is drawn.',
  bookRef: '2.1.2',
  names: ['dpq', 'dist1', 'dist2'],
  dims: [2, 3],
  params: () => [P.ref('p', 'Point p', ['point']), P.ref('q', 'Point q', ['point'])],
  defaults: (_d, ctx) => {
    const ps = ctx.find(['point']);
    return { p: ps[1] ?? ps[0] ?? '', q: ps[0] ?? '' };
  },
  compute: (p, ctx): Value => {
    const a = pointOf(ctx, p.p, 3);
    const b = pointOf(ctx, p.q, 3);
    return { kind: 'segment', p: a, q: b, extra: { d: dist(a, b) } };
  },
  caption: (o, cx) => `d(${lbl(cx, o.params.p)}, ${lbl(cx, o.params.q)})`,
  algebra: (o, v, cx) => `d(${lbl(cx, o.params.p)}, ${lbl(cx, o.params.q)}) = ${v?.kind === 'segment' ? texNum(v.extra!.d as number) : '?'}`,
  course: (o, v, cx) =>
    v.kind === 'segment'
      ? `Definition [[2.1.2]]: $d(\\mathbf{p}, \\mathbf{q}) = \\lVert \\mathbf{p} - \\mathbf{q} \\rVert = \\left(\\sum (p_i - q_i)^2\\right)^{1/2}$.\n\n` +
        `$$d(${lbl(cx, o.params.p)}, ${lbl(cx, o.params.q)}) = \\lVert ${texVec(sub(v.p, v.q))} \\rVert = ${fmt(v.extra!.d as number, 6)}$$\n\nIsometries are exactly the mappings that preserve it ([[3.1.1]]).`
      : '',
  defaultColor: '#57606a',
  command: { name: 'Distance', args: ['p', 'q'] },
};

const angle: ObjectType = {
  type: 'angle',
  label: 'Angle between v and w',
  group: 'measure',
  description: 'The angle ϑ (0 ≤ ϑ ≤ π) with v • w = ‖v‖‖w‖ cos ϑ.',
  bookRef: 'n.angle',
  names: ['theta', 'theta1', 'theta2'],
  dims: [2, 3],
  params: () => [vecRef('v', 'v'), vecRef('w', 'w')],
  defaults: (_d, ctx) => {
    const vs = ctx.find(['vector']);
    return { v: vs[1] ?? vs[0] ?? '', w: vs[0] ?? '' };
  },
  compute: (p, ctx): Value => {
    const a = operand(ctx, p.v).v;
    const b = operand(ctx, p.w).v;
    const c = dot(a, b) / (norm(a) * norm(b));
    if (!Number.isFinite(c)) throw new Error('the angle is not defined for a zero vector');
    return { kind: 'number', value: Math.acos(Math.max(-1, Math.min(1, c))) };
  },
  caption: (o) => nameOf(o),
  algebra: (o, v, cx) => `\\angle(${lbl(cx, o.params.v)}, ${lbl(cx, o.params.w)}) = ${v?.kind === 'number' ? `${texNum(v.value)} = ${fmt((v.value * 180) / Math.PI, 2)}^\\circ` : '?'}`,
  course: (_o, v) =>
    v.kind === 'number'
      ? `By the Schwarz inequality $|\\mathbf{v}\\bullet\\mathbf{w}| \\le \\lVert\\mathbf{v}\\rVert\\lVert\\mathbf{w}\\rVert$, so there is a unique $\\vartheta \\in [0, \\pi]$ with $\\mathbf{v}\\bullet\\mathbf{w} = \\lVert\\mathbf{v}\\rVert\\lVert\\mathbf{w}\\rVert\\cos\\vartheta$ — the angle from $\\mathbf{v}$ to $\\mathbf{w}$ (§2.1). ` +
        `Here $\\vartheta = ${fmt(v.value, 5)}$ rad $= ${fmt((v.value * 180) / Math.PI, 3)}^\\circ$.`
      : '',
  command: { name: 'Angle', args: ['v', 'w'] },
};

const crossProduct: ObjectType = {
  type: 'cross',
  label: 'Cross product v × w',
  group: 'measure',
  description: 'The tangent vector v × w at p, orthogonal to v and w, of length ‖v‖‖w‖ sin ϑ.',
  bookRef: '2.1.7',
  names: ['vxw', 'cr1', 'cr2'],
  dims: [3],
  params: () => [P.ref('v', 'v', ['vector']), P.ref('w', 'w', ['vector'])],
  defaults: (_d, ctx) => {
    const vs = ctx.find(['vector']);
    return { v: vs[1] ?? vs[0] ?? '', w: vs[0] ?? '' };
  },
  compute: (p, ctx): Value => {
    const a = getVector(ctx, p.v);
    const b = getVector(ctx, p.w);
    if (a.v.length !== 3 || b.v.length !== 3) throw new Error('the cross product is defined for tangent vectors to R³');
    return { kind: 'vector', p: a.p, v: cross(a.v, b.v), extra: { warnings: samePointWarning(a.p, b.p) } };
  },
  caption: (o, cx) => `${lbl(cx, o.params.v)} \\times ${lbl(cx, o.params.w)}`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.v)} \\times ${lbl(cx, o.params.w)} = ${v?.kind === 'vector' ? texVecAt(v.v, v.p) : '?'}`,
  course: (o, v, cx) => {
    const a = cx.get(str(o.params.v));
    const b = cx.get(str(o.params.w));
    if (v.kind !== 'vector' || a?.kind !== 'vector' || b?.kind !== 'vector') return '';
    return (
      `Definition [[2.1.7]]: $\\mathbf{v} \\times \\mathbf{w} = \\begin{vmatrix} U_1(\\mathbf{p}) & U_2(\\mathbf{p}) & U_3(\\mathbf{p}) \\\\ v_1 & v_2 & v_3 \\\\ w_1 & w_2 & w_3 \\end{vmatrix}$ (expanded along the first row).\n\n` +
      `$$${lbl(cx, o.params.v)} \\times ${lbl(cx, o.params.w)} = ${texVecAt(v.v, v.p, 4)}$$\n\n` +
      `Lemma [[2.1.8]]: it is orthogonal to both ($${fmt(dot(v.v, a.v), 6)}$ and $${fmt(dot(v.v, b.v), 6)}$) and ` +
      `$\\lVert \\mathbf{v}\\times\\mathbf{w} \\rVert^2 = (\\mathbf{v}\\bullet\\mathbf{v})(\\mathbf{w}\\bullet\\mathbf{w}) - (\\mathbf{v}\\bullet\\mathbf{w})^2$: ` +
      `$${fmt(dot(v.v, v.v), 5)} = ${fmt(dot(a.v, a.v) * dot(b.v, b.v) - dot(a.v, b.v) ** 2, 5)}$.`
    );
  },
  defaultColor: '#8250df',
  command: { name: 'Cross', args: ['v', 'w'] },
};

const tripleProduct: ObjectType = {
  type: 'triple',
  label: 'Triple product u • v × w',
  group: 'measure',
  description: 'u • v × w = det of the coordinates of u, v, w.',
  bookRef: 'n.triple',
  names: ['tp', 'tp1', 'tp2'],
  dims: [3],
  params: () => [P.ref('u', 'u', ['vector']), P.ref('v', 'v', ['vector']), P.ref('w', 'w', ['vector'])],
  defaults: (_d, ctx) => {
    const vs = ctx.find(['vector']);
    return { u: vs[2] ?? vs[0] ?? '', v: vs[1] ?? vs[0] ?? '', w: vs[0] ?? '' };
  },
  compute: (p, ctx): Value => {
    const [a, b, c] = [p.u, p.v, p.w].map((n) => getVector(ctx, n).v);
    return { kind: 'number', value: det3([a, b, c]) };
  },
  caption: (o, cx) => `${lbl(cx, o.params.u)} \\bullet ${lbl(cx, o.params.v)} \\times ${lbl(cx, o.params.w)}`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.u)} \\bullet ${lbl(cx, o.params.v)} \\times ${lbl(cx, o.params.w)} = ${v?.kind === 'number' ? texNum(v.value) : '?'}`,
  course: (_o, v) =>
    v.kind === 'number'
      ? `The triple scalar product $\\mathbf{u} \\bullet \\mathbf{v} \\times \\mathbf{w}$ is the determinant whose rows are the Euclidean coordinates of $\\mathbf{u}, \\mathbf{v}, \\mathbf{w}$ (§2.1); its absolute value is the volume of the parallelepiped they span. ` +
        `Value: $${fmt(v.value, 6)}$. For a frame it is $\\pm 1$, the orientation sign ([[3.3.1]]).`
      : '',
  command: { name: 'Triple', args: ['u', 'v', 'w'] },
};

const frame: ObjectType = {
  type: 'frame',
  label: 'Frame e₁, e₂, e₃ at p',
  group: 'measure',
  description: 'Three mutually orthogonal unit vectors at a point p.',
  bookRef: '2.1.4',
  names: ['e', 'f', 'e1', 'f1'],
  dims: [3],
  params: () => [
    P.vec('p', 'Point p', 3, [], { help: 'Coordinates or the name of a point.' }),
    P.vec('e1', 'e₁', 3),
    P.vec('e2', 'e₂', 3),
    P.vec('e3', 'e₃', 3),
    P.select('lab', 'Labels', [
      { value: 'e', label: 'e₁, e₂, e₃' },
      { value: 'f', label: 'f₁, f₂, f₃' },
    ]),
  ],
  defaults: (_d, ctx) => ({
    p: ctx.find(['point'])[0] ?? '(0, 0, 0)',
    e1: '(1, 2, 1)/sqrt(6)',
    e2: '(-2, 0, 2)/sqrt(8)',
    e3: '(1, -1, 1)/sqrt(3)',
    lab: 'e',
  }),
  presets: () => [
    { label: 'e₁ = (1,2,1)/√6, e₂ = (−2,0,2)/√8, e₃ = (1,−1,1)/√3', params: { e1: '(1, 2, 1)/sqrt(6)', e2: '(-2, 0, 2)/sqrt(8)', e3: '(1, -1, 1)/sqrt(3)' } },
    { label: 'Natural frame U₁, U₂, U₃', params: { e1: '(1, 0, 0)', e2: '(0, 1, 0)', e3: '(0, 0, 1)' } },
    { label: 'Rotated by angle a about z', params: { e1: '(cos(a), sin(a), 0)', e2: '(-sin(a), cos(a), 0)', e3: '(0, 0, 1)' } },
  ],
  compute: (p, ctx): Value => {
    const at = pointOf(ctx, p.p, 3);
    const e = (['e1', 'e2', 'e3'] as const).map((k) => frameVec(p[k], ctx)) as [Vec, Vec, Vec];
    const warnings: string[] = [];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const d = dot(e[i], e[j]) - (i === j ? 1 : 0);
        if (Math.abs(d) > 1e-6) {
          warnings.push(`Not a frame: e${i + 1} • e${j + 1} = ${fmt(dot(e[i], e[j]))} ≠ ${i === j ? 1 : 0} (a frame needs eᵢ • eⱼ = δᵢⱼ).`);
          i = j = 3;
        }
      }
    const l = str(p.lab, 'e');
    return { kind: 'frame', p: at, e, labels: [`${l}_1`, `${l}_2`, `${l}_3`], extra: { warnings } };
  },
  caption: (o) => `${str(o.params.lab, 'e')}_i`,
  algebra: (o, v, cx) => `${str(o.params.lab, 'e')}_1, ${str(o.params.lab, 'e')}_2, ${str(o.params.lab, 'e')}_3 \\text{ at } ${v?.kind === 'frame' ? texVec(v.p) : texPointParam(o.params.p, cx)}`,
  course: (o, v) => {
    if (v.kind !== 'frame') return '';
    const l = str(o.params.lab, 'e');
    const eps = det3(v.e);
    return (
      `Definition [[2.1.4]]: a frame at $\\mathbf{p}$ is a set of three mutually orthogonal unit vectors tangent at $\\mathbf{p}$: $\\mathbf{${l}}_i \\bullet \\mathbf{${l}}_j = \\delta_{ij}$.\n\n` +
      v.e.map((x, i) => `$\\mathbf{${l}}_${i + 1} = ${texVec(x, 4)}_{\\mathbf{p}}$`).join(', ') +
      `, at $\\mathbf{p} = ${texVec(v.p)}$.\n\n` +
      `**Attitude matrix** ([[2.1.6]]), rows = Euclidean coordinates of the $\\mathbf{${l}}_i$: $$A = ${texMat(v.e, 4)}$$ ` +
      `It is orthogonal: $A\\,{}^tA = I$.\n\n` +
      `Orientation ([[3.3.1]], Remark 3.3.1): $\\mathbf{${l}}_1 \\bullet \\mathbf{${l}}_2 \\times \\mathbf{${l}}_3 = \\det A = ${fmt(eps, 5)}$ — ` +
      (eps > 0 ? '**positively oriented**' : '**negatively oriented**') +
      `.\n\nAny tangent vector at $\\mathbf{p}$ has the orthonormal expansion $\\mathbf{v} = \\sum (\\mathbf{v} \\bullet \\mathbf{${l}}_i)\\,\\mathbf{${l}}_i$ ([[2.1.5]]).`
    );
  },
  defaultColor: COLORS.frame,
  command: { name: 'Frame', args: ['p', 'e1', 'e2', 'e3'] },
};

/** Frame vectors may be written "(1,2,1)/sqrt(6)": a tuple followed by a scalar factor. */
function frameVec(v: ParamValue | undefined, ctx: ComputeCtx): Vec {
  const s = str(v).trim();
  const m = /^(\(.*\))\s*([*/])\s*(.+)$/.exec(s);
  if (m && arr(m[1]).length === 3) {
    const base = numVec(m[1], ctx, 3);
    const k = ctx.num(m[3]);
    return scale(base, m[2] === '*' ? k : 1 / k);
  }
  return numVec(v, ctx, 3, 'frame vector');
}

const orthonormalExpansion: ObjectType = {
  type: 'orthonormalExpansion',
  label: 'Orthonormal expansion of v',
  group: 'measure',
  description: 'The components (v • eᵢ) eᵢ of a tangent vector v with respect to a frame (Theorem 2.1.5).',
  bookRef: '2.1.5',
  names: ['exp1', 'exp2', 'exp3'],
  dims: [3],
  params: () => [P.ref('v', 'Tangent vector v', ['vector']), P.ref('frame', 'Frame e₁, e₂, e₃ (at the same point)', ['frame'])],
  defaults: (_d, ctx) => ({ v: ctx.find(['vector'])[0] ?? '', frame: ctx.find(['frame'])[0] ?? '' }),
  compute: (p, ctx): Value => {
    const v = getVector(ctx, p.v);
    const F = ctx.get(str(p.frame));
    if (F.kind !== 'frame') throw new Error('choose a frame');
    const cs = F.e.map((e) => dot(v.v, e));
    return {
      kind: 'vectors',
      dashed: true,
      items: F.e.map((e, i) => ({ p: v.p, v: scale(e, cs[i]), label: `(\\mathbf{v}\\bullet ${F.labels[i]})${F.labels[i]}` })),
      extra: { cs, labels: F.labels, warnings: samePointWarning(v.p, F.p) },
    };
  },
  caption: (o, cx) => `\\sum (${lbl(cx, o.params.v)} \\bullet e_i) e_i`,
  algebra: (o, v, cx) => {
    if (v?.kind !== 'vectors') return '?';
    const cs = v.extra!.cs as number[];
    const ls = v.extra!.labels as string[];
    return `${lbl(cx, o.params.v)} = ${linCombTex(cs, ls, 3)}`;
  },
  course: (o, v, cx) => {
    if (v.kind !== 'vectors') return '';
    const cs = v.extra!.cs as number[];
    const ls = v.extra!.labels as string[];
    return (
      `Theorem [[2.1.5]]: for a frame $\\mathbf{e}_1, \\mathbf{e}_2, \\mathbf{e}_3$ at $\\mathbf{p}$ and any $\\mathbf{v} \\in T_{\\mathbf{p}}(\\mathbf{R}^3)$, ` +
      `$\\mathbf{v} = \\sum (\\mathbf{v} \\bullet \\mathbf{e}_i)\\,\\mathbf{e}_i$. The coordinates are just three dot products — no linear system to solve.\n\n` +
      `$$${lbl(cx, o.params.v)} = ${linCombTex(cs, ls)}$$\n\n` +
      `The dashed arrows are the three components $(\\mathbf{v} \\bullet \\mathbf{e}_i)\\mathbf{e}_i$; they add up to $\\mathbf{v}$ (Fig. 2.3 of the book).`
    );
  },
  defaultColor: '#bf8700',
  command: { name: 'Expand', args: ['v', 'frame'] },
};

register(dotProduct, normType, distance, angle, crossProduct, tripleProduct, frame, orthonormalExpansion);
