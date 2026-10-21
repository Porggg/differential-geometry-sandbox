// Frame fields (§2.6), connection forms (§2.7), dual forms and structural equations (§2.8).

import { register } from '../core/registry';
import type { ComputeCtx, FormValue, FrameFieldValue, ObjectType, Value } from '../core/types';
import { addNodes, derivative, mulNodes, parse, resolve } from '../math/expr';
import { form, formAt, formTex, negForm } from '../math/forms';
import { dot, fmt, sub, type Vec } from '../math/vec';
import { P, XYZ, arr, compileNodes, getFrameField, getVector, lbl, nameOf, pointOf, str, texMat, texNodeMat, texVec } from './common';

const PRESETS: Record<string, { comps: string[]; labels: [string, string, string]; bookTex: string }> = {
  natural: {
    comps: ['(1, 0, 0)', '(0, 1, 0)', '(0, 0, 1)'],
    labels: ['U_1', 'U_2', 'U_3'],
    bookTex: 'U_1, U_2, U_3 \\text{ (natural frame field)}',
  },
  cylindrical: {
    comps: ['(x/sqrt(x^2+y^2), y/sqrt(x^2+y^2), 0)', '(-y/sqrt(x^2+y^2), x/sqrt(x^2+y^2), 0)', '(0, 0, 1)'],
    labels: ['E_1', 'E_2', 'E_3'],
    bookTex: 'E_1 = \\cos\\vartheta\\, U_1 + \\sin\\vartheta\\, U_2,\\quad E_2 = -\\sin\\vartheta\\, U_1 + \\cos\\vartheta\\, U_2,\\quad E_3 = U_3',
  },
  spherical: {
    comps: [
      '(x/sqrt(x^2+y^2+z^2), y/sqrt(x^2+y^2+z^2), z/sqrt(x^2+y^2+z^2))',
      '(-y/sqrt(x^2+y^2), x/sqrt(x^2+y^2), 0)',
      '(-z*x/(sqrt(x^2+y^2+z^2)*sqrt(x^2+y^2)), -z*y/(sqrt(x^2+y^2+z^2)*sqrt(x^2+y^2)), sqrt(x^2+y^2)/sqrt(x^2+y^2+z^2))',
    ],
    labels: ['F_1', 'F_2', 'F_3'],
    bookTex:
      'F_1 = \\cos\\varphi(\\cos\\vartheta\\, U_1 + \\sin\\vartheta\\, U_2) + \\sin\\varphi\\, U_3,\\quad F_2 = -\\sin\\vartheta\\, U_1 + \\cos\\vartheta\\, U_2,\\quad F_3 = -\\sin\\varphi(\\cos\\vartheta\\, U_1 + \\sin\\vartheta\\, U_2) + \\cos\\varphi\\, U_3',
  },
};

const BOOK_CONNECTION: Record<string, string> = {
  natural: '\\omega_{ij} = 0 \\text{ for all } i, j',
  cylindrical: '\\omega_{12} = d\\vartheta,\\quad \\omega_{13} = 0,\\quad \\omega_{23} = 0',
  spherical: '\\omega_{12} = \\cos\\varphi\\, d\\vartheta,\\quad \\omega_{13} = d\\varphi,\\quad \\omega_{23} = \\sin\\varphi\\, d\\vartheta',
};

const BOOK_DUAL: Record<string, string> = {
  natural: '\\theta_i = dx_i',
  cylindrical: '\\theta_1 = dr,\\quad \\theta_2 = r\\, d\\vartheta,\\quad \\theta_3 = dz',
  spherical: '\\theta_1 = d\\rho,\\quad \\theta_2 = \\rho\\cos\\varphi\\, d\\vartheta,\\quad \\theta_3 = \\rho\\, d\\varphi',
};

const frameField: ObjectType = {
  type: 'frameField',
  label: 'Frame field E₁, E₂, E₃',
  group: 'frames',
  description: 'Vector fields E₁, E₂, E₃ with Eᵢ • Eⱼ = δᵢⱼ at every point: natural, cylindrical, spherical, or your own.',
  bookRef: '2.6.1',
  names: ['E', 'Fs', 'E1f', 'E2f'],
  dims: [3],
  params: () => [
    P.select('preset', 'Frame field', [
      { value: 'cylindrical', label: 'Cylindrical (Example 2.6.2 (1))' },
      { value: 'spherical', label: 'Spherical (Example 2.6.2 (2))' },
      { value: 'natural', label: 'Natural U₁, U₂, U₃' },
      { value: 'custom', label: 'Custom' },
    ]),
    P.vec('E1', 'E₁ (Euclidean coordinates in x, y, z)', 3, XYZ, { when: (p) => p.preset === 'custom' }),
    P.vec('E2', 'E₂', 3, XYZ, { when: (p) => p.preset === 'custom' }),
    P.vec('E3', 'E₃', 3, XYZ, { when: (p) => p.preset === 'custom' }),
    P.expr('box', 'Draw at sample points of [−R, R]³, R ='),
    P.int('n', 'Sample points per axis', 1, 7),
  ],
  defaults: () => ({ preset: 'cylindrical', E1: '(cos(z), sin(z), 0)', E2: '(-sin(z), cos(z), 0)', E3: '(0, 0, 1)', box: 2, n: 3 }),
  compute: (p, ctx): FrameFieldValue => {
    const preset = str(p.preset, 'cylindrical');
    const pr = PRESETS[preset];
    const comps = pr ? pr.comps : [str(p.E1), str(p.E2), str(p.E3)];
    const env = { vars: XYZ, numbers: ctx.numbers, functions: ctx.functions, points: ctx.points };
    const A = comps.map((c) => {
      const parts = arr(c);
      if (parts.length !== 3) throw new Error('each Eᵢ needs 3 coordinates');
      return parts.map((s) => resolve(parse(s), env));
    });
    const rows = A.map((r) => compileNodes(r, XYZ, ctx));
    const E = (x: Vec) => rows.map((r) => r(x)) as [Vec, Vec, Vec];
    // check orthonormality at a few sample points
    const warnings: string[] = [];
    for (const q of [[0.7, 0.3, 0.5], [-1.1, 0.4, -0.2], [0.2, -0.9, 1.3]]) {
      const e = E(q);
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
          const v = dot(e[i], e[j]) - (i === j ? 1 : 0);
          if (Number.isFinite(v) && Math.abs(v) > 1e-6 && warnings.length === 0) {
            warnings.push(`Not a frame field: E${i + 1} • E${j + 1} = ${fmt(dot(e[i], e[j]))} at ${texVec(q)} (need δᵢⱼ).`);
          }
        }
    }
    return {
      kind: 'framefield',
      A,
      E,
      box: ctx.num(str(p.box, '2')),
      n: Number(p.n ?? 3),
      labels: pr ? pr.labels : ['E_1', 'E_2', 'E_3'],
      bookTex: pr?.bookTex,
      extra: { warnings, preset },
    };
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => {
    if (v?.kind !== 'framefield') return nameOf(o);
    const pre = str(o.params.preset);
    const name = pre === 'custom' ? 'frame field' : `${pre} frame field`;
    return `${nameOf(o)}: \\text{${name}}`;
  },
  course: (o, v) => {
    if (v.kind !== 'framefield') return '';
    const pre = str(o.params.preset);
    return (
      `Definition [[2.6.1]]: vector fields $E_1, E_2, E_3$ form a frame field when $E_i \\bullet E_j = \\delta_{ij}$; at each point they give a frame.\n\n` +
      (v.bookTex ? `In the book's notation ([[2.6.2]]): $$${v.bookTex}$$ ` : '') +
      (pre === 'cylindrical' || pre === 'spherical' ? `(defined on $\\mathbf{R}^3$ minus the $z$ axis).\n\n` : '\n\n') +
      `Attitude matrix ([[2.7.3]]), row $i$ = Euclidean coordinates of $${v.labels[0][0]}_i$: $$A = ${texNodeMat(v.A)}$$\n\n` +
      `By [[2.6.3]], any vector field is $V = \\sum f_i E_i$ with $f_i = V \\bullet E_i$. Use **Connection forms** and **Dual 1-forms** to study how the frame field turns.`
    );
  },
  defaultColor: '#bf8700',
  command: { name: 'FrameField', args: ['preset'] },
};

const frameFieldAt: ObjectType = {
  type: 'frameFieldAt',
  label: 'Frame field at a point',
  group: 'frames',
  description: 'The frame E₁(p), E₂(p), E₃(p) given by a frame field at one point.',
  bookRef: '2.6.1',
  names: ['Ep', 'Eq', 'Ep1'],
  dims: [3],
  params: () => [P.ref('field', 'Frame field', ['framefield']), P.vec('p', 'Point p', 3, [], { help: 'Coordinates or the name of a point.' })],
  defaults: (_d, ctx) => ({ field: ctx.find(['framefield'])[0] ?? '', p: ctx.find(['point'])[0] ?? '(1, 1, 1)' }),
  compute: (p, ctx): Value => {
    const F = getFrameField(ctx, p.field);
    const at = pointOf(ctx, p.p, 3);
    const e = F.E(at);
    if (e.some((x) => x.some((c) => !Number.isFinite(c)))) throw new Error(`the frame field is not defined at ${texVec(at)}`);
    return { kind: 'frame', p: at, e, labels: F.labels };
  },
  caption: (o, cx) => `${lbl(cx, o.params.field)}(\\mathbf{p})`,
  algebra: (o, v, cx) => `${lbl(cx, o.params.field)} \\text{ at } ${v?.kind === 'frame' ? texVec(v.p) : '?'}`,
  course: (_o, v) =>
    v.kind === 'frame'
      ? `At $\\mathbf{p} = ${texVec(v.p)}$: ${v.e.map((e, i) => `$${v.labels[i]} = ${texVec(e, 4)}$`).join(', ')}. Attitude matrix: $$${texMat(v.e, 4)}$$`
      : '',
  defaultColor: '#bf8700',
  command: { name: 'FrameAt', args: ['field', 'p'] },
};

/** Connection forms ω_ij = Σ_k (da_ik) a_jk (Theorem 2.7.3). Returns ω12, ω13, ω23. */
export function connectionForms(A: FrameFieldValue['A']): FormValue[][] {
  const om: FormValue[][] = [[], [], []];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      if (i === j) {
        om[i][j] = form(1, [parse('0'), parse('0'), parse('0')]);
        continue;
      }
      if (j < i) continue;
      const comps = XYZ.map((x) => addNodes([0, 1, 2].map((k) => mulNodes(derivative(A[i][k], x), A[j][k]))));
      om[i][j] = form(1, comps);
    }
  for (let i = 0; i < 3; i++) for (let j = 0; j < i; j++) om[i][j] = negForm(om[j][i]);
  return om;
}

export function dualForms(A: FrameFieldValue['A']): FormValue[] {
  return A.map((row) => form(1, row));
}

const connection: ObjectType = {
  type: 'connectionForms',
  label: 'Connection forms ωᵢⱼ',
  group: 'frames',
  description: 'The 1-forms ωᵢⱼ(v) = ∇ᵥEᵢ • Eⱼ(p): how the frame field turns. ω = (dA) ᵗA.',
  bookRef: '2.7.1',
  names: ['omega', 'omega1', 'omega2'],
  dims: [3],
  params: () => [P.ref('field', 'Frame field', ['framefield']), P.ref('v', 'Evaluate on tangent vector v (optional)', ['vector'], { optional: true })],
  defaults: (_d, ctx) => ({ field: ctx.find(['framefield'])[0] ?? '', v: '' }),
  compute: (p, ctx): Value => {
    const F = getFrameField(ctx, p.field);
    const om = connectionForms(F.A);
    const extra: Record<string, unknown> = { om, preset: F.extra?.preset };
    if (str(p.v)) {
      const v = getVector(ctx, p.v);
      extra.v = v;
      extra.values = [[0, 1], [0, 2], [1, 2]].map(([i, j]) => formAt(om[i][j], v.p, ctx.numbers).reduce((s, c, k) => s + c * v.v[k], 0));
      // definition: ω_ij(v) = ∇_v E_i • E_j(p), by finite differences
      const h = 1e-5;
      const Ep = F.E(v.p.map((x, k) => x + h * v.v[k]));
      const Em = F.E(v.p.map((x, k) => x - h * v.v[k]));
      const E0 = F.E(v.p);
      extra.defValues = [[0, 1], [0, 2], [1, 2]].map(([i, j]) => dot(sub(Ep[i], Em[i]).map((x) => x / (2 * h)), E0[j]));
    }
    return { kind: 'forms', forms: [[0, 1], [0, 2], [1, 2]].map(([i, j]) => ({ label: `\\omega_{${i + 1}${j + 1}}`, form: om[i][j] })), extra };
  },
  caption: (o, cx) => `\\omega_{ij} \\text{ of } ${lbl(cx, o.params.field)}`,
  algebra: (o, v, cx) => {
    if (v?.kind !== 'forms') return `\\omega_{ij}`;
    return `\\omega_{ij} \\text{ of } ${lbl(cx, o.params.field)}:\\ ` + v.forms.map((f) => `${f.label} = ${formTex(f.form)}`).join(',\\ ');
  },
  course: (o, v, cx) => {
    if (v.kind !== 'forms') return '';
    const pre = v.extra?.preset as string;
    const om = v.extra?.om as FormValue[][];
    let s =
      `Lemma [[2.7.1]]: $\\omega_{ij}(\\mathbf{v}) = \\nabla_{\\mathbf{v}} E_i \\bullet E_j(\\mathbf{p})$ defines 1-forms with $\\omega_{ij} = -\\omega_{ji}$ (so $\\omega_{ii} = 0$). ` +
      `Theorem [[2.7.2]] (connection equations): $\\nabla_V E_i = \\sum_j \\omega_{ij}(V) E_j$. Theorem [[2.7.3]]: $\\omega_{ij} = \\sum_k (da_{ik}) a_{jk}$, i.e. $\\omega = dA\\,{}^tA$.\n\n` +
      (BOOK_CONNECTION[pre] ? `In the book's coordinates: $$${BOOK_CONNECTION[pre]}$$\n\nComputed in $x, y, z$ from the attitude matrix:\n\n` : 'Computed from the attitude matrix:\n\n') +
      v.forms.map((f) => `$$${f.label} = ${formTex(f.form)}$$`).join('\n\n') +
      `\n\nMatrix form: $$\\omega = \\begin{pmatrix} 0 & \\omega_{12} & \\omega_{13} \\\\ -\\omega_{12} & 0 & \\omega_{23} \\\\ -\\omega_{13} & -\\omega_{23} & 0 \\end{pmatrix}$$`;
    if (v.extra?.values && v.extra.v) {
      const vals = v.extra.values as number[];
      const defs = v.extra.defValues as number[];
      const vv = v.extra.v as { p: Vec; v: Vec };
      s +=
        `\n\n**Evaluated on** $\\mathbf{v} = ${texVec(vv.v)}_{${texVec(vv.p)}}$ (${lbl(cx, o.params.v)}): formula vs. definition $\\nabla_{\\mathbf{v}}E_i \\bullet E_j$:\n\n` +
        `$$${['12', '13', '23'].map((ij, k) => `\\omega_{${ij}}(\\mathbf{v}) = ${fmt(vals[k], 6)}\\ \\text{vs}\\ ${fmt(defs[k], 6)}`).join(',\\qquad ')}$$`;
    }
    void om;
    return s;
  },
  command: { name: 'ConnectionForms', args: ['field', 'v'] },
};

const dual: ObjectType = {
  type: 'dualForms',
  label: 'Dual 1-forms θᵢ (+ structural equations)',
  group: 'frames',
  description: 'The dual 1-forms θᵢ(v) = v • Eᵢ(p), and a check of Cartan’s structural equations at a point.',
  bookRef: '2.8.1',
  names: ['theta', 'theta1', 'theta2'],
  dims: [3],
  params: () => [P.ref('field', 'Frame field', ['framefield']), P.vec('p', 'Check the structural equations at p', 3, [], { help: 'Coordinates or the name of a point.' })],
  defaults: (_d, ctx) => ({ field: ctx.find(['framefield'])[0] ?? '', p: '(1, 0.5, 0.7)' }),
  compute: (p, ctx): Value => {
    const F = getFrameField(ctx, p.field);
    const th = dualForms(F.A);
    const at = pointOf(ctx, p.p, 3);
    const check = structuralCheck(F, th, at, ctx);
    return { kind: 'forms', forms: th.map((f, i) => ({ label: `\\theta_${i + 1}`, form: f })), extra: { check, at, preset: F.extra?.preset } };
  },
  caption: (o, cx) => `\\theta_i \\text{ of } ${lbl(cx, o.params.field)}`,
  algebra: (o, v, cx) => (v?.kind === 'forms' ? `\\theta_i \\text{ of } ${lbl(cx, o.params.field)}:\\ ` + v.forms.map((f) => `${f.label} = ${formTex(f.form)}`).join(',\\ ') : '\\theta_i'),
  course: (_o, v) => {
    if (v.kind !== 'forms') return '';
    const pre = v.extra?.preset as string;
    const c = v.extra?.check as { first: number[]; second: number[] };
    const at = v.extra?.at as Vec;
    const ok = (r: number) => (r < 1e-6 ? '\\checkmark' : '\\times');
    return (
      `Definition [[2.8.1]]: $\\theta_i(\\mathbf{v}) = \\mathbf{v} \\bullet E_i(\\mathbf{p})$. Since $E_i = \\sum a_{ij} U_j$, $\\theta_i = \\sum a_{ij}\\, dx_j$ (§2.8), and by [[2.8.2]] every 1-form is $\\phi = \\sum \\phi(E_i)\\theta_i$.\n\n` +
      (BOOK_DUAL[pre] ? `In the book's coordinates: $$${BOOK_DUAL[pre]}$$\n\n` : '') +
      v.forms.map((f) => `$$${f.label} = ${formTex(f.form)}$$`).join('\n\n') +
      `\n\n**Cartan structural equations** ([[2.8.3]]) — checked numerically at $\\mathbf{p} = ${texVec(at)}$ (largest coefficient of the difference of the two sides):\n\n` +
      `$$d\\theta_i = \\sum_j \\omega_{ij} \\wedge \\theta_j:\\quad ${c.first.map((r, i) => `i=${i + 1}:\\ ${fmt(r, 8)}\\ ${ok(r)}`).join(',\\quad ')}$$\n\n` +
      `$$d\\omega_{ij} = \\sum_k \\omega_{ik} \\wedge \\omega_{kj}:\\quad ${c.second.map((r, k) => `${['12', '13', '23'][k]}:\\ ${fmt(r, 8)}\\ ${ok(r)}`).join(',\\quad ')}$$`
    );
  },
  command: { name: 'DualForms', args: ['field', 'p'] },
};

function structuralCheck(F: FrameFieldValue, th: FormValue[], at: Vec, ctx: ComputeCtx): { first: number[]; second: number[] } {
  // Numerical check at one point: components of the 1-forms are compiled, d is taken by central differences.
  const om = connectionForms(F.A);
  const comp = (f: FormValue) => compileNodes(f.comps, XYZ, ctx);
  const h = 1e-5;
  const dOne = (f: FormValue): Vec => {
    const g = comp(f);
    const D = (k: number) => {
      const a = at.slice();
      const b = at.slice();
      a[k] += h;
      b[k] -= h;
      const ga = g(a);
      const gb = g(b);
      return ga.map((x, i) => (x - gb[i]) / (2 * h)); // ∂/∂x_k of (f1, f2, f3)
    };
    const [Dx, Dy, Dz] = [D(0), D(1), D(2)];
    return [Dx[1] - Dy[0], Dx[2] - Dz[0], Dy[2] - Dz[1]];
  };
  const wedgeAt = (a: Vec, b: Vec): Vec => [a[0] * b[1] - a[1] * b[0], a[0] * b[2] - a[2] * b[0], a[1] * b[2] - a[2] * b[1]];
  const val = (f: FormValue) => comp(f)(at);
  const omv = om.map((row) => row.map(val));
  const thv = th.map(val);
  const diff = (a: Vec, b: Vec) => Math.max(...a.map((x, i) => Math.abs(x - b[i])));
  const add3 = (vs: Vec[]) => vs.reduce((a, b) => a.map((x, i) => x + b[i]));
  const first = [0, 1, 2].map((i) => diff(dOne(th[i]), add3([0, 1, 2].map((j) => wedgeAt(omv[i][j], thv[j])))));
  const second = [[0, 1], [0, 2], [1, 2]].map(([i, j]) => diff(dOne(om[i][j]), add3([0, 1, 2].map((k) => wedgeAt(omv[i][k], omv[k][j])))));
  return { first, second };
}

register(frameField, frameFieldAt, connection, dual);
