// 1-forms (§1.5) and differential forms (§1.6). Forms are not drawn: they live in the Algebra and Course views.

import { register } from '../core/registry';
import type { ComputeCtx, FormValue, ObjectType, ParamValue, Value } from '../core/types';
import { parse, resolve, tex } from '../math/expr';
import { DEGREE_NAMES, addForms, d, evalOneForm, form, formTex, negForm, wedge } from '../math/forms';
import { fmt } from '../math/vec';
import { P, XYZ, arr, getVector, lbl, nameOf, str, texNum, texVec } from './common';

const formOrFunction = (ctx: ComputeCtx, name: ParamValue | undefined): FormValue => {
  const v = ctx.get(str(name));
  if (v.kind === 'form') return v;
  if (v.kind === 'function' && v.dim === 3) return form(0, [v.expr]);
  throw new Error(`${str(name)} is not a differential form (or a function on R³)`);
};

const compileComps = (parts: string[], ctx: ComputeCtx) => {
  const env = { vars: XYZ, numbers: ctx.numbers, functions: ctx.functions, points: ctx.points };
  return parts.map((s) => resolve(parse(s), env));
};

const formAlgebra = (o: { name: string }, v: Value | undefined, head?: string) =>
  `${head ?? nameOf(o as any)} = ${v?.kind === 'form' ? formTex(v) : '?'}`;

const oneForm: ObjectType = {
  type: 'oneForm',
  label: '1-form φ = Σ fᵢ dxᵢ',
  group: 'forms',
  description: 'A 1-form φ: a real-valued function on tangent vectors, linear at each point. Every 1-form is φ = f₁dx + f₂dy + f₃dz.',
  bookRef: '1.5.1',
  names: ['phi', 'psi', 'eta', 'xi', 'phi1', 'psi1'],
  dims: [3],
  params: () => [P.vec('comps', 'Euclidean coordinate functions (f₁, f₂, f₃): φ = f₁ dx + f₂ dy + f₃ dz', 3, XYZ)],
  defaults: () => ({ comps: '(x^2, 0, -y)' }),
  compute: (p, ctx) => {
    const parts = arr(p.comps);
    if (parts.length !== 3) throw new Error('a 1-form needs 3 coefficient functions');
    return form(1, compileComps(parts, ctx));
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => formAlgebra(o, v),
  course: (o, v) =>
    v.kind === 'form'
      ? `A 1-form ([[1.5.1]]) is a real-valued function on tangent vectors that is linear at each point: $\\phi(av + bw) = a\\phi(v) + b\\phi(w)$. ` +
        `By [[1.5.4]] every 1-form is $\\phi = \\sum f_i\\, dx_i$, where $f_i = \\phi(U_i)$ are its Euclidean coordinate functions, and then $\\phi(v_p) = \\sum f_i(p) v_i$.\n\n` +
        `$$${nameOf(o)} = ${formTex(v)}$$\n\nUse **Evaluate φ(vₚ)** to evaluate it on a tangent vector of the scene, **d** to take its exterior derivative ([[1.6.3]]).`
      : '',
  command: { name: 'OneForm', args: ['comps'] },
};

const twoForm: ObjectType = {
  type: 'twoForm',
  label: '2-form f dx dy + g dx dz + h dy dz',
  group: 'forms',
  description: 'A 2-form f dx dy + g dx dz + h dy dz (§1.6).',
  bookRef: 'n.pforms',
  names: ['eta', 'mu', 'nu', 'eta1'],
  dims: [3],
  params: () => [P.vec('comps', 'Coefficients (f, g, h) of dx dy, dx dz, dy dz', 3, XYZ)],
  defaults: () => ({ comps: '(y, 0, x)' }),
  compute: (p, ctx) => {
    const parts = arr(p.comps);
    if (parts.length !== 3) throw new Error('a 2-form needs 3 coefficients');
    return form(2, compileComps(parts, ctx));
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => formAlgebra(o, v),
  course: (o, v) =>
    v.kind === 'form'
      ? `A 2-form on $\\mathbf{R}^3$ is an expression $f\\,dx\\,dy + g\\,dx\\,dz + h\\,dy\\,dz$ (§1.6). Products of $dx_i$'s obey the alternation rule $dx_i\\,dx_j = -dx_j\\,dx_i$, so $dx_i\\,dx_i = 0$.\n\n$$${nameOf(o)} = ${formTex(v)}$$`
      : '',
  command: { name: 'TwoForm', args: ['comps'] },
};

const threeForm: ObjectType = {
  type: 'threeForm',
  label: '3-form f dx dy dz',
  group: 'forms',
  description: 'A 3-form f dx dy dz (§1.6).',
  bookRef: 'n.pforms',
  names: ['omega3', 'mu3', 'nu3'],
  dims: [3],
  params: () => [P.expr('f', 'Coefficient f of dx dy dz', XYZ)],
  defaults: () => ({ f: 'x*y*z' }),
  compute: (p, ctx) => form(3, compileComps([str(p.f)], ctx)),
  caption: (o) => nameOf(o),
  algebra: (o, v) => formAlgebra(o, v),
  course: (o, v) => (v.kind === 'form' ? `A 3-form on $\\mathbf{R}^3$ is an expression $f\\,dx\\,dy\\,dz$ (§1.6); all $p$-forms with $p > 3$ are zero.\n\n$$${nameOf(o)} = ${formTex(v)}$$` : ''),
  command: { name: 'ThreeForm', args: ['f'] },
};

const differential: ObjectType = {
  type: 'differential',
  label: 'Differential df',
  group: 'forms',
  description: 'The 1-form df with df(vₚ) = vₚ[f]; df = Σ ∂f/∂xᵢ dxᵢ.',
  bookRef: '1.5.2',
  names: ['df', 'dg', 'dh', 'df1'],
  dims: [3],
  params: () => [P.ref('f', 'Function f on R³', ['function'], { filter: (v) => v.kind === 'function' && v.dim === 3 })],
  defaults: (_d, ctx) => ({ f: ctx.find(['function'], (v) => v.kind === 'function' && v.dim === 3)[0] ?? '' }),
  compute: (p, ctx) => {
    const f = ctx.get(str(p.f));
    if (f.kind !== 'function' || f.dim !== 3) throw new Error('choose a function on R³');
    return d(form(0, [f.expr]));
  },
  caption: (o, cx) => `d${lbl(cx, o.params.f)}`,
  algebra: (o, v, cx) => formAlgebra(o, v, `d${lbl(cx, o.params.f)}`),
  course: (o, v, cx) => {
    if (v.kind !== 'form') return '';
    const f = lbl(cx, o.params.f);
    const fv = cx.get(str(o.params.f));
    return (
      `Definition [[1.5.2]]: $d${f}(v_p) = v_p[${f}]$. By [[1.5.5]], $d${f} = \\sum \\frac{\\partial ${f}}{\\partial x_i} dx_i$.\n\n` +
      (fv?.kind === 'function' ? `With $${f} = ${tex(fv.expr)}$:\n\n` : '') +
      `$$d${f} = ${formTex(v)}$$`
    );
  },
  command: { name: 'Differential', args: ['f'] },
};

const exteriorDerivative: ObjectType = {
  type: 'exteriorDerivative',
  label: 'Exterior derivative dφ',
  group: 'forms',
  description: 'The exterior derivative: d of a p-form is a (p+1)-form obtained by applying d to its coefficient functions.',
  bookRef: '1.6.3',
  names: ['dphi', 'dpsi', 'deta', 'dphi1'],
  dims: [3],
  params: () => [P.ref('phi', 'Form φ (or function)', ['form', 'function'])],
  defaults: (_d, ctx) => ({ phi: ctx.find(['form'])[0] ?? '' }),
  compute: (p, ctx) => d(formOrFunction(ctx, p.phi)),
  caption: (o, cx) => `d${lbl(cx, o.params.phi)}`,
  algebra: (o, v, cx) => formAlgebra(o, v, `d${lbl(cx, o.params.phi)}`),
  course: (o, v, cx) => {
    if (v.kind !== 'form') return '';
    const n = lbl(cx, o.params.phi);
    let s = `$d${n}$ is a ${DEGREE_NAMES[v.degree]}. `;
    if (v.degree === 2)
      s += `For a 1-form $\\phi = \\sum f_i dx_i$, Definition [[1.6.3]] gives $d\\phi = \\sum df_i \\wedge dx_i$, i.e.\n\n$$d\\phi = \\left(\\frac{\\partial f_2}{\\partial x} - \\frac{\\partial f_1}{\\partial y}\\right) dx\\,dy + \\left(\\frac{\\partial f_3}{\\partial x} - \\frac{\\partial f_1}{\\partial z}\\right) dx\\,dz + \\left(\\frac{\\partial f_3}{\\partial y} - \\frac{\\partial f_2}{\\partial z}\\right) dy\\,dz.$$\n\n`;
    if (v.degree === 1) s += `For a function, $d$ is the differential of [[1.5.2]].\n\n`;
    if (v.degree === 3) s += `For a 2-form one applies $d$ to the coefficient functions and uses the alternation rule (§1.6).\n\n`;
    s += `$$d${n} = ${formTex(v)}$$`;
    if (v.comps.every((c) => tex(c) === '0')) s += `\n\nIt is zero — compare Exercise 1.6 ($d(d\\phi) = 0$).`;
    return s;
  },
  command: { name: 'd', args: ['phi'] },
};

const wedgeType: ObjectType = {
  type: 'wedge',
  label: 'Wedge product φ ∧ ψ',
  group: 'forms',
  description: 'The wedge product of forms, using the alternation rule dxᵢ ∧ dxⱼ = −dxⱼ ∧ dxᵢ. A function acts as a 0-form.',
  bookRef: '1.6.1',
  names: ['w', 'w1', 'w2', 'w3'],
  dims: [3],
  params: () => [P.ref('phi', 'First form φ', ['form', 'function']), P.ref('psi', 'Second form ψ', ['form', 'function'])],
  defaults: (_d, ctx) => {
    const fs = ctx.find(['form']);
    return { phi: fs[1] ?? fs[0] ?? '', psi: fs[0] ?? '' };
  },
  compute: (p, ctx) => wedge(formOrFunction(ctx, p.phi), formOrFunction(ctx, p.psi)),
  caption: (o, cx) => `${lbl(cx, o.params.phi)} \\wedge ${lbl(cx, o.params.psi)}`,
  algebra: (o, v, cx) => formAlgebra(o, v, `${lbl(cx, o.params.phi)} \\wedge ${lbl(cx, o.params.psi)}`),
  course: (o, v, cx) =>
    v.kind === 'form'
      ? `The wedge product of a $p$-form and a $q$-form is a $(p+q)$-form, zero when $p + q > 3$ (§1.6, [[1.6.1]]). For 1-forms, $\\phi \\wedge \\psi = -\\psi \\wedge \\phi$ ([[1.6.2]]).\n\n` +
        `$$${lbl(cx, o.params.phi)} \\wedge ${lbl(cx, o.params.psi)} = ${formTex(v)}$$`
      : '',
  command: { name: 'Wedge', args: ['phi', 'psi'] },
};

const evaluateForm: ObjectType = {
  type: 'evaluateForm',
  label: 'Evaluate φ(vₚ)',
  group: 'forms',
  description: 'The number φ(vₚ) = Σ fᵢ(p) vᵢ.',
  bookRef: '1.5.4',
  names: ['phiv', 'psiv', 'phiw'],
  dims: [3],
  params: () => [P.ref('phi', '1-form φ', ['form'], { filter: (v) => v.kind === 'form' && v.degree === 1 }), P.ref('v', 'Tangent vector vₚ', ['vector'])],
  defaults: (_d, ctx) => ({ phi: ctx.find(['form'], (v) => v.kind === 'form' && v.degree === 1)[0] ?? '', v: ctx.find(['vector'])[0] ?? '' }),
  compute: (p, ctx): Value => {
    const phi = ctx.get(str(p.phi));
    if (phi.kind !== 'form' || phi.degree !== 1) throw new Error('choose a 1-form');
    const v = getVector(ctx, p.v);
    if (v.p.length !== 3) throw new Error('choose a tangent vector to R³');
    return { kind: 'number', value: evalOneForm(phi, v.p, v.v, ctx.numbers) };
  },
  caption: (o, cx) => `${lbl(cx, o.params.phi)}(${lbl(cx, o.params.v)})`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.phi)}(${lbl(cx, o.params.v)}) = ${v?.kind === 'number' ? texNum(v.value) : '?'}`,
  course: (o, v, cx) => {
    const vv = cx.get(str(o.params.v));
    const phi = cx.get(str(o.params.phi));
    if (v.kind !== 'number' || vv?.kind !== 'vector' || phi?.kind !== 'form') return '';
    return (
      `With $${lbl(cx, o.params.phi)} = ${formTex(phi)}$ and $${lbl(cx, o.params.v)} = ${texVec(vv.v)}_{${texVec(vv.p)}}$, Lemma [[1.5.4]] gives ` +
      `$\\phi(v_p) = \\sum f_i(p)\\, v_i$ (since $dx_i(v_p) = v_i$, [[1.5.3]]):\n\n$$${lbl(cx, o.params.phi)}(${lbl(cx, o.params.v)}) = ${fmt(v.value, 6)}$$`
    );
  },
  command: { name: 'Evaluate', args: ['phi', 'v'] },
};

const formSum: ObjectType = {
  type: 'formSum',
  label: 'Sum of forms φ + ψ',
  group: 'forms',
  description: 'Forms of the same degree are added by adding corresponding coefficient functions (§1.6).',
  bookRef: 'n.pforms',
  names: ['sum', 'sum1', 'sum2'],
  dims: [3],
  params: () => [
    P.ref('phi', 'φ', ['form', 'function']),
    P.select('op', 'Operation', [
      { value: '+', label: 'φ + ψ' },
      { value: '-', label: 'φ − ψ' },
    ]),
    P.ref('psi', 'ψ (same degree)', ['form', 'function']),
  ],
  defaults: (_d, ctx) => {
    const fs = ctx.find(['form']);
    return { phi: fs[1] ?? fs[0] ?? '', op: '+', psi: fs[0] ?? '' };
  },
  compute: (p, ctx) => {
    const b = formOrFunction(ctx, p.psi);
    return addForms(formOrFunction(ctx, p.phi), p.op === '-' ? negForm(b) : b);
  },
  caption: (o, cx) => `${lbl(cx, o.params.phi)} ${o.params.op === '-' ? '-' : '+'} ${lbl(cx, o.params.psi)}`,
  algebra: (o, v, cx) => formAlgebra(o, v, `${lbl(cx, o.params.phi)} ${o.params.op === '-' ? '-' : '+'} ${lbl(cx, o.params.psi)}`),
  course: (o, v, cx) =>
    v.kind === 'form'
      ? `Forms of the same degree are added coefficientwise: $\\sum f_i\\,dx_i + \\sum g_i\\,dx_i = \\sum (f_i + g_i)\\,dx_i$ (§1.6).\n\n$$${lbl(cx, o.params.phi)} ${o.params.op === '-' ? '-' : '+'} ${lbl(cx, o.params.psi)} = ${formTex(v)}$$`
      : '',
  command: { name: 'FormSum', args: ['phi', 'psi'] },
};

register(oneForm, twoForm, threeForm, differential, exteriorDerivative, wedgeType, formSum, evaluateForm);
