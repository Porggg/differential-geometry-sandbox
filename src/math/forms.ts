// Differential forms on R^3 (Section 1.6). Components are symbolic in x, y, z.
//   0-form: [f]
//   1-form: [f1, f2, f3]        meaning f1 dx + f2 dy + f3 dz
//   2-form: [f12, f13, f23]     meaning f12 dx dy + f13 dx dz + f23 dy dz   (the book's order)
//   3-form: [f]                 meaning f dx dy dz

import type { FormValue } from '../core/types';
import { addNodes, derivative, mulNodes, num, simplify, subNodes, tex, isZeroNode, type Node, math } from './expr';

const X = ['x', 'y', 'z'];

export const form = (degree: 0 | 1 | 2 | 3, comps: Node[]): FormValue => ({
  kind: 'form',
  degree,
  comps: comps.map((c) => simplify(c)),
});

export const zeroForm = (degree: 0 | 1 | 2 | 3): FormValue =>
  form(degree, Array.from({ length: degree === 1 || degree === 2 ? 3 : 1 }, () => num(0)));

/** Exterior derivative d (Definition 1.5.2 for 0-forms, 1.6.3 for 1-forms, and its extension). */
export function d(phi: FormValue): FormValue {
  const c = phi.comps;
  const D = (n: Node, v: string) => derivative(n, v);
  switch (phi.degree) {
    case 0:
      return form(1, X.map((v) => D(c[0], v)));
    case 1:
      return form(2, [
        subNodes(D(c[1], 'x'), D(c[0], 'y')),
        subNodes(D(c[2], 'x'), D(c[0], 'z')),
        subNodes(D(c[2], 'y'), D(c[1], 'z')),
      ]);
    case 2:
      return form(3, [addNodes([D(c[0], 'z'), new math.OperatorNode('-', 'unaryMinus', [D(c[1], 'y')]), D(c[2], 'x')])]);
    case 3:
      return zeroForm(3);
  }
}

/** Wedge product φ ∧ ψ, using the alternation rule dx_i dx_j = -dx_j dx_i. */
export function wedge(phi: FormValue, psi: FormValue): FormValue {
  const p = phi.degree;
  const q = psi.degree;
  if (p + q > 3) return zeroForm(3);
  const a = phi.comps;
  const b = psi.comps;
  const m = mulNodes;
  if (p === 0) return form(q, b.map((x) => m(a[0], x)));
  if (q === 0) return form(p, a.map((x) => m(x, b[0])));
  if (p === 1 && q === 1) {
    return form(2, [
      subNodes(m(a[0], b[1]), m(a[1], b[0])),
      subNodes(m(a[0], b[2]), m(a[2], b[0])),
      subNodes(m(a[1], b[2]), m(a[2], b[1])),
    ]);
  }
  // 1 ∧ 2 (or 2 ∧ 1, equal since (-1)^{2} = 1)
  const [one, two] = p === 1 ? [a, b] : [b, a];
  return form(3, [addNodes([m(one[0], two[2]), new math.OperatorNode('-', 'unaryMinus', [m(one[1], two[1])]), m(one[2], two[0])])]);
}

export function addForms(phi: FormValue, psi: FormValue): FormValue {
  if (phi.degree !== psi.degree) throw new Error('cannot add forms of different degrees');
  return form(phi.degree, phi.comps.map((c, i) => addNodes([c, psi.comps[i]])));
}

export function negForm(phi: FormValue): FormValue {
  return form(phi.degree, phi.comps.map((c) => new math.OperatorNode('-', 'unaryMinus', [c])));
}

const BASIS: Record<number, string[]> = {
  0: [''],
  1: ['dx', 'dy', 'dz'],
  2: ['dx\\,dy', 'dx\\,dz', 'dy\\,dz'],
  3: ['dx\\,dy\\,dz'],
};

/** TeX of a form, e.g. "x^2 dx - y\,dz". */
export function formTex(phi: FormValue, wedgeSymbol = false): string {
  const basis = BASIS[phi.degree].map((b) => (wedgeSymbol ? b.replace(/\\,/g, '\\wedge ') : b));
  if (phi.degree === 0) return tex(phi.comps[0]);
  const terms: string[] = [];
  phi.comps.forEach((c, i) => {
    if (isZeroNode(c)) return;
    const s = stripC(c);
    let coef = tex(s);
    const n = s as any;
    const isConst = n.type === 'ConstantNode';
    if (isConst && Number(n.value) === 1) coef = '';
    else if (isConst && Number(n.value) === -1) coef = '-';
    else if (n.type === 'OperatorNode' && (n.op === '+' || (n.op === '-' && n.args.length === 2))) coef = `\\left(${coef}\\right)`;
    terms.push(`${coef}\\,${basis[i]}`);
  });
  if (terms.length === 0) return '0';
  return terms.map((t, i) => (i > 0 && !t.startsWith('-') ? `+ ${t}` : i > 0 ? `- ${t.slice(1)}` : t)).join(' ');
}

const stripC = (n: Node): Node => ((n as any).type === 'ParenthesisNode' ? stripC((n as any).content) : n);

/** Evaluate a 1-form on a tangent vector v_p: φ(v_p) = Σ f_i(p) v_i (Lemma 1.5.4). */
export function evalOneForm(phi: FormValue, p: number[], v: number[], numbers: Record<string, number>): number {
  if (phi.degree !== 1) throw new Error('only 1-forms are evaluated on tangent vectors');
  const scope: Record<string, number> = { ...numbers, x: p[0], y: p[1], z: p[2] };
  return phi.comps.reduce((s, c, i) => s + Number(c.evaluate(scope)) * v[i], 0);
}

/** Numeric components of a form at a point. */
export function formAt(phi: FormValue, p: number[], numbers: Record<string, number>): number[] {
  const scope: Record<string, number> = { ...numbers, x: p[0], y: p[1], z: p[2] };
  return phi.comps.map((c) => Number(c.evaluate(scope)));
}

export const DEGREE_NAMES = ['0-form (function)', '1-form', '2-form', '3-form'];
