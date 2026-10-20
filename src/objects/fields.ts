// Functions on R^n, vector fields, directional and covariant derivatives (§1.1–1.3, §2.5).

import { register } from '../core/registry';
import type { FieldValue, FunctionValue, ObjectType, Value } from '../core/types';
import { addNodes, derivative, mulNodes, resolve, parse, scalar, splitTuple, tex, texOfSource } from '../math/expr';
import { fmt } from '../math/vec';
import {
  COLORS, P, arr, compileNodes, coordVars, getField, getFunction, getVector, lbl, nameOf, str, texNum, texParts, texVec, texVecAt,
} from './common';

const fn: ObjectType = {
  type: 'function',
  label: 'Function f (level sets)',
  group: 'fields',
  description: 'A differentiable real-valued function f on R³ (or R²). Drawn through its level sets f = c.',
  bookRef: '1.1.3',
  names: ['f', 'g', 'h', 'k', 'f1', 'g1'],
  dims: [2, 3],
  params: (dim) => [
    P.expr('expr', `f(${coordVars(dim).join(', ')}) =`, coordVars(dim)),
    { key: 'levels', label: 'Level values c (comma separated, empty = none)', kind: 'vec', vars: [], size: 0, optional: true },
    P.expr('box', 'Draw in the box [−R, R]ⁿ, R ='),
    P.int('res', 'Resolution', 8, 80),
    { key: 'dim', label: 'dim', kind: 'int', min: 2, max: 3, when: () => false },
  ],
  defaults: (dim) => ({ expr: dim === 2 ? 'x^2 + y^2' : 'x^2 + y^2 - z', levels: '1', box: 2, res: dim === 2 ? 80 : 36, dim }),
  compute: (p, ctx): Value => {
    const dim = Number(p.dim ?? 3);
    const vars = coordVars(dim);
    const { node, f } = scalar(str(p.expr), { vars, numbers: ctx.numbers, functions: ctx.functions });
    const levels = str(p.levels).trim() === '' ? [] : splitTuple(str(p.levels)).map((s) => ctx.num(s));
    return { kind: 'function', dim, vars, f, expr: node, levels, box: ctx.num(str(p.box, '2')), res: Number(p.res ?? 36) };
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => `${nameOf(o)} = ${v && v.kind === 'function' ? tex(v.expr) : texOfSource(str(o.params.expr))}`,
  course: (o, v) => {
    if (v.kind !== 'function') return '';
    const n = nameOf(o);
    const partials = v.vars.map((x) => {
      try {
        return `\\dfrac{\\partial ${n}}{\\partial ${x}} = ${tex(derivative(v.expr, x))}`;
      } catch {
        return `\\dfrac{\\partial ${n}}{\\partial ${x}}`;
      }
    });
    return (
      `A real-valued function on $\\mathbf{R}^${v.dim}$, differentiable in the sense of [[1.1.3]] ` +
      `(all partial derivatives of all orders exist and are continuous):\n\n$$${n} = ${tex(v.expr)}$$\n\n` +
      `Partial derivatives:\n\n$$${partials.join(',\\qquad ')}$$\n\n` +
      (v.levels.length
        ? `Drawn: the level ${v.dim === 3 ? 'surfaces' : 'curves'} $${n} = c$ for $c \\in \\{${v.levels.map((c) => fmt(c)).join(', ')}\\}$ inside $[-${fmt(v.box)}, ${fmt(v.box)}]^${v.dim}$.`
        : 'No level set is drawn (add level values to see some).') +
      (v.dim === 3 ? `\n\nIts differential is the 1-form $d${n} = \\sum \\frac{\\partial ${n}}{\\partial x_i} dx_i$ ([[1.5.2]], [[1.5.5]]).` : '')
    );
  },
  defaultColor: COLORS.function,
  command: { name: 'Function', args: ['expr'] },
};

const vectorField: ObjectType = {
  type: 'vectorField',
  label: 'Vector field V',
  group: 'fields',
  description: 'A vector field V = Σ vᵢ Uᵢ: one tangent vector at each point. Drawn on a grid of sample points.',
  bookRef: '1.2.3',
  names: ['V', 'W', 'Y', 'Z', 'V1', 'W1'],
  dims: [2, 3],
  params: (dim) => [
    P.vec('comps', 'Euclidean coordinate functions (v₁, v₂' + (dim === 3 ? ', v₃)' : ')'), dim, coordVars(dim)),
    P.expr('box', 'Sample in the box [−R, R]ⁿ, R ='),
    P.int('n', 'Sample points per axis', 2, 15),
    P.expr('scale', 'Arrow length factor'),
    { key: 'dim', label: 'dim', kind: 'int', min: 2, max: 3, when: () => false },
  ],
  defaults: (dim) => ({ comps: dim === 2 ? '(-y, x)' : '(x*y, -z, 1)', box: 2, n: dim === 2 ? 9 : 5, scale: 0.3, dim }),
  compute: (p, ctx): FieldValue => {
    const dim = Number(p.dim ?? arr(p.comps).length);
    const vars = coordVars(dim);
    const parts = arr(p.comps);
    if (parts.length !== dim) throw new Error(`a vector field on R^${dim} needs ${dim} components`);
    const env = { vars, numbers: ctx.numbers, functions: ctx.functions };
    const nodes = parts.map((s) => resolve(parse(s), env));
    const f = compileNodes(nodes, vars, ctx);
    return { kind: 'field', dim, f, exprs: nodes, box: ctx.num(str(p.box, '2')), n: Number(p.n ?? 5), scale: ctx.num(str(p.scale, '0.3')) };
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => {
    const n = nameOf(o);
    if (v && v.kind === 'field') return `${n} = ${fieldTex(v)}`;
    return `${n} = ${texParts(arr(o.params.comps))}`;
  },
  course: (o, v) => {
    if (v.kind !== 'field') return '';
    const n = nameOf(o);
    return (
      `A vector field assigns to each point $p$ a tangent vector $${n}(p)$ at $p$ ([[1.2.3]]). ` +
      `By [[1.2.5]], $${n} = \\sum v_i U_i$ with Euclidean coordinate functions\n\n` +
      `$$${v.exprs.map((e, i) => `v_${i + 1} = ${tex(e)}`).join(',\\qquad ')}$$\n\n` +
      `so $$${n} = ${fieldTex(v)}.$$\n\n` +
      `Drawn: $${n}(p)$ at ${v.n}${v.dim === 3 ? `×${v.n}×${v.n}` : `×${v.n}`} sample points of $[-${fmt(v.box)}, ${fmt(v.box)}]^${v.dim}$, ` +
      `with arrows scaled by ${fmt(v.scale)} (arrows are tangent vectors $v_p$, from $p$ to $p + ${fmt(v.scale)}\\,v$).`
    );
  },
  defaultColor: COLORS.field,
  command: { name: 'VectorField', args: ['comps'] },
};

/** "v₁ U₁ + v₂ U₂ + v₃ U₃" with zero terms omitted. */
export function fieldTex(v: FieldValue): string {
  const terms: string[] = [];
  v.exprs.forEach((e, i) => {
    const t = tex(e);
    if (t === '0') return;
    const coef = t === '1' ? '' : t === '-1' ? '-' : /[+-]/.test(t.replace(/^-/, '')) ? `\\left(${t}\\right)` : t;
    terms.push(`${coef}\\,U_${i + 1}`);
  });
  if (!terms.length) return '0';
  return terms.map((t, i) => (i === 0 ? t : t.startsWith('-') ? `- ${t.slice(1)}` : `+ ${t}`)).join(' ');
}

const directionalDerivative: ObjectType = {
  type: 'directionalDerivative',
  label: 'Directional derivative vₚ[f]',
  group: 'fields',
  description: 'The derivative of f with respect to the tangent vector vₚ: the number d/dt f(p + tv) at t = 0.',
  bookRef: '1.3.1',
  names: ['Dvf', 'Dwf', 'Dvg'],
  dims: [2, 3],
  params: () => [P.ref('v', 'Tangent vector vₚ', ['vector']), P.ref('f', 'Function f', ['function'])],
  defaults: (_d, ctx) => ({ v: ctx.find(['vector'])[0] ?? '', f: ctx.find(['function'])[0] ?? '' }),
  compute: (p, ctx) => {
    const v = getVector(ctx, p.v);
    const f = getFunction(ctx, p.f);
    if (v.p.length !== f.dim) throw new Error('the vector and the function live in different dimensions');
    // Lemma 1.3.2: v_p[f] = Σ v_i ∂f/∂x_i (p)
    let value: number;
    try {
      const grads = f.vars.map((x) => compileNodes([derivative(f.expr, x)], f.vars, ctx));
      value = grads.reduce((s, g, i) => s + g(v.p)[0] * v.v[i], 0);
    } catch {
      const h = 1e-5;
      const at = (t: number) => f.f(v.p.map((x, i) => x + t * v.v[i]));
      value = (at(h) - at(-h)) / (2 * h);
    }
    return { kind: 'number', value };
  },
  caption: (o, cx) => `${lbl(cx, o.params.v)}[${lbl(cx, o.params.f)}]`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.v)}[${lbl(cx, o.params.f)}] = ${v && v.kind === 'number' ? texNum(v.value) : '?'}`,
  course: (o, v, cx) => {
    const vec = cx.get(str(o.params.v));
    const f = cx.get(str(o.params.f));
    if (v.kind !== 'number' || vec?.kind !== 'vector' || f?.kind !== 'function') return '';
    const F = lbl(cx, o.params.f);
    const V = lbl(cx, o.params.v);
    const grads = f.vars.map((x) => {
      try {
        return tex(derivative(f.expr, x));
      } catch {
        return '?';
      }
    });
    return (
      `By definition ([[1.3.1]]) $${V}[${F}] = \\dfrac{d}{dt}\\Big|_{t=0} ${F}(p + t v)$ with $v = ${texVec(vec.v)}$, $p = ${texVec(vec.p)}$.\n\n` +
      `By [[1.3.2]], $${V}[${F}] = \\sum_i v_i \\dfrac{\\partial ${F}}{\\partial x_i}(p)$, where\n\n` +
      `$$${f.vars.map((x, i) => `\\frac{\\partial ${F}}{\\partial ${x}} = ${grads[i]}`).join(',\\quad ')}$$\n\n` +
      `Value: $${V}[${F}] = ${fmt(v.value, 6)}$.`
    );
  },
  command: { name: 'DirectionalDerivative', args: ['v', 'f'] },
};

const fieldOnFunction: ObjectType = {
  type: 'fieldOnFunction',
  label: 'V[f] (vector field applied to f)',
  group: 'fields',
  description: 'The function V[f] whose value at p is V(p)[f].',
  bookRef: '1.3.4',
  names: ['Vf', 'Wf', 'Vg'],
  dims: [2, 3],
  params: () => [
    P.ref('V', 'Vector field V', ['field']),
    P.ref('f', 'Function f', ['function']),
    { key: 'levels', label: 'Level values to draw (optional)', kind: 'vec', size: 0, vars: [], optional: true },
  ],
  defaults: (_d, ctx) => ({ V: ctx.find(['field'])[0] ?? '', f: ctx.find(['function'])[0] ?? '', levels: '' }),
  compute: (p, ctx): FunctionValue => {
    const V = getField(ctx, p.V);
    const f = getFunction(ctx, p.f);
    if (V.dim !== f.dim) throw new Error('V and f live in different dimensions');
    const expr = addNodes(f.vars.map((x, i) => mulNodes(V.exprs[i], derivative(f.expr, x))));
    const { f: fun } = scalar(expr, { vars: f.vars, numbers: ctx.numbers, functions: ctx.functions });
    const levels = str(p.levels).trim() === '' ? [] : splitTuple(str(p.levels)).map((s) => ctx.num(s));
    return { kind: 'function', dim: f.dim, vars: f.vars, f: fun, expr, levels, box: f.box, res: f.res };
  },
  caption: (o, cx) => `${lbl(cx, o.params.V)}[${lbl(cx, o.params.f)}]`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.V)}[${lbl(cx, o.params.f)}] = ${v && v.kind === 'function' ? tex(v.expr) : '?'}`,
  course: (o, v, cx) =>
    v.kind === 'function'
      ? `The vector field $${lbl(cx, o.params.V)}$ applied to $${lbl(cx, o.params.f)}$ is the function whose value at each point $p$ is ` +
        `$${lbl(cx, o.params.V)}(p)[${lbl(cx, o.params.f)}]$ (§1.3, pointwise principle). With $V = \\sum v_i U_i$ (by [[1.3.2]]):\n\n` +
        `$$${lbl(cx, o.params.V)}[${lbl(cx, o.params.f)}] = \\sum_i v_i \\frac{\\partial ${lbl(cx, o.params.f)}}{\\partial x_i} = ${tex(v.expr)}$$\n\n` +
        `See [[1.3.4]] for its linearity properties.`
      : '',
  defaultColor: COLORS.function,
  command: { name: 'Apply', args: ['V', 'f'] },
};

const covariantDerivative: ObjectType = {
  type: 'covariantDerivative',
  label: 'Covariant derivative ∇ᵥW',
  group: 'fields',
  description: 'The rate of change of the vector field W in the direction v: ∇ᵥW = d/dt W(p + tv) at t = 0. With a vector field V, gives the vector field ∇_V W.',
  bookRef: '2.5.1',
  names: ['DvW', 'DVW', 'DwW'],
  dims: [3],
  params: () => [P.ref('v', 'Tangent vector v (or vector field V)', ['vector', 'field']), P.ref('W', 'Vector field W', ['field'])],
  defaults: (_d, ctx) => ({ v: ctx.find(['vector'])[0] ?? ctx.find(['field'])[1] ?? '', W: ctx.find(['field'])[0] ?? '' }),
  compute: (p, ctx): Value => {
    const W = getField(ctx, p.W);
    const vv = ctx.get(str(p.v));
    const vars = coordVars(W.dim);
    // Lemma 2.5.2: ∇_v W = Σ v[w_i] U_i(p)
    const grads = W.exprs.map((w) => vars.map((x) => derivative(w, x)));
    if (vv.kind === 'vector') {
      const g = grads.map((row) => compileNodes(row, vars, ctx));
      const out = g.map((gi) => gi(vv.p).reduce((s, d, j) => s + d * vv.v[j], 0));
      return { kind: 'vector', p: vv.p, v: out };
    }
    if (vv.kind === 'field') {
      const exprs = grads.map((row) => addNodes(row.map((d, j) => mulNodes(vv.exprs[j], d))));
      const f = compileNodes(exprs, vars, ctx);
      return { kind: 'field', dim: W.dim, f, exprs, box: W.box, n: W.n, scale: W.scale };
    }
    throw new Error('v must be a tangent vector or a vector field');
  },
  caption: (o, cx) => `\\nabla_{${lbl(cx, o.params.v)}} ${lbl(cx, o.params.W)}`,
  algebra: (o, v, cx) => {
    const head = `\\nabla_{${lbl(cx, o.params.v)}} ${lbl(cx, o.params.W)}`;
    if (v?.kind === 'vector') return `${head} = ${texVecAt(v.v, v.p)}`;
    if (v?.kind === 'field') return `${head} = ${fieldTex(v)}`;
    return head;
  },
  course: (o, v, cx) => {
    const W = cx.get(str(o.params.W));
    if (!W || W.kind !== 'field') return '';
    const Wl = lbl(cx, o.params.W);
    const vl = lbl(cx, o.params.v);
    let s =
      `Definition [[2.5.1]]: $\\nabla_v W = \\dfrac{d}{dt}\\Big|_{t=0} W(p + tv)$. ` +
      `By [[2.5.2]], if $W = \\sum w_i U_i$ then $\\nabla_v W = \\sum v[w_i]\\, U_i(p)$: one differentiates the Euclidean coordinate functions of $W$ in the direction $v$.\n\n` +
      `Here $${Wl} = ${fieldTex(W)}$.`;
    if (v.kind === 'vector') s += `\n\n$$\\nabla_{${vl}} ${Wl} = ${texVecAt(v.v, v.p)}$$`;
    if (v.kind === 'field') s += `\n\n$$\\nabla_{${vl}} ${Wl} = ${fieldTex(v)}$$\n\n(Corollary [[2.5.4]] lists its properties.)`;
    return s;
  },
  defaultColor: COLORS.derived,
  command: { name: 'CovariantDerivative', args: ['v', 'W'] },
};

register(fn, vectorField, directionalDerivative, fieldOnFunction, covariantDerivative);
