// Helpers for writing entries: raw Markdown/TeX strings and accessors used by live checks.

import type { Scene } from '../core/scene';
import type { CurveValue, FieldValue, FormValue, FrameFieldValue, FunctionValue, IsometryValue, MappingValue, Value } from '../core/types';
import { compileNode, derivative } from '../math/expr';
import { formAt } from '../math/forms';
import { add, matvec, norm, scale, sub, type Vec } from '../math/vec';
import { frenetAt } from '../objects/frenet';

/** Raw template: write TeX with single backslashes (never write a dollar sign directly followed by a brace). */
export const md = String.raw;

function get<K extends Value['kind']>(s: Scene, n: string, kind: K): Extract<Value, { kind: K }> {
  const v = s.value(n);
  if (!v || v.kind !== kind) throw new Error(`${n} is undefined`);
  return v as Extract<Value, { kind: K }>;
}

export const num = (s: Scene, n: string): number => get(s, n, 'number').value;
export const point = (s: Scene, n: string): Vec => get(s, n, 'point').p;
export const vec = (s: Scene, n: string): { p: Vec; v: Vec } => get(s, n, 'vector');
export const curve = (s: Scene, n: string): CurveValue => get(s, n, 'curve');
export const field = (s: Scene, n: string): FieldValue => get(s, n, 'field');
export const fn = (s: Scene, n: string): FunctionValue => get(s, n, 'function');
export const form = (s: Scene, n: string): FormValue => get(s, n, 'form');
export const frame = (s: Scene, n: string) => get(s, n, 'frame');
export const iso = (s: Scene, n: string): IsometryValue => get(s, n, 'isometry');
export const mapping = (s: Scene, n: string): MappingValue => get(s, n, 'mapping');
export const framefield = (s: Scene, n: string): FrameFieldValue => get(s, n, 'framefield');
export const vectors = (s: Scene, n: string) => get(s, n, 'vectors');

/** Max |difference| between two vectors. */
export const diff = (a: Vec, b: Vec): number => Math.max(...a.map((x, i) => Math.abs(x - b[i])));

/** Sample points used to compare fields / forms / functions. */
export const SAMPLES: Vec[] = [
  [0.3, -1.2, 0.7],
  [1.1, 0.4, -0.5],
  [-0.8, 1.7, 1.3],
  [0.45, 0.6, -1.9],
];

/** Max difference between two forms of the same degree at the sample points. */
export function formDiff(s: Scene, a: FormValue, b: FormValue): number {
  const N = s.allNumbers();
  let m = 0;
  for (const p of SAMPLES) {
    const x = formAt(a, p, N);
    const y = formAt(b, p, N);
    m = Math.max(m, ...x.map((v, i) => Math.abs(v - y[i])));
  }
  return m;
}

/** Max difference between two functions at the sample points. */
export function fnDiff(a: FunctionValue, b: FunctionValue): number {
  return Math.max(...SAMPLES.map((p) => Math.abs(a.f(p.slice(0, a.dim)) - b.f(p.slice(0, b.dim)))));
}

/** Max difference between two vector fields at the sample points. */
export function fieldDiff(a: FieldValue, b: FieldValue): number {
  return Math.max(...SAMPLES.map((p) => diff(a.f(p.slice(0, a.dim)), b.f(p.slice(0, b.dim)))));
}

/** v_p[f] by the definition: derivative at 0 of t ↦ f(p + t v). */
export function dirDerivDef(f: FunctionValue, p: Vec, v: Vec): number {
  const h = 1e-5;
  const g = (t: number) => f.f(p.map((x, i) => x + t * v[i]));
  return (g(h) - g(-h)) / (2 * h);
}

/** v_p[f] by Lemma 1.3.2: Σ v_i ∂f/∂x_i(p). */
export function dirDerivFormula(s: Scene, f: FunctionValue, p: Vec, v: Vec): number {
  const N = s.allNumbers();
  return f.vars.reduce((acc, x, i) => acc + compileNode(derivative(f.expr, x), f.vars)(p, N) * v[i], 0);
}

/** Residuals of the arbitrary-speed Frenet formulas at t (finite differences). */
export function frenetResiduals(c: CurveValue, t: number): [number, number, number] {
  const h = 1e-4;
  const F = frenetAt(c, t);
  const P = frenetAt(c, t + h);
  const M = frenetAt(c, t - h);
  const d = (a: Vec, b: Vec) => scale(sub(a, b), 1 / (2 * h));
  const kv = F.kappa * F.v;
  const tv = F.tau * F.v;
  return [
    norm(sub(d(P.T, M.T), scale(F.N, kv))),
    norm(sub(d(P.N, M.N), add(scale(F.T, -kv), scale(F.B, tv)))),
    norm(sub(d(P.B, M.B), scale(F.N, -tv))),
  ];
}

/** ∇_v W at p by the definition: derivative at 0 of t ↦ W(p + t v) (finite differences). */
export function covDef(W: FieldValue, p: Vec, v: Vec): Vec {
  const h = 1e-5;
  const a = W.f(p.map((x, i) => x + h * v[i]));
  const b = W.f(p.map((x, i) => x - h * v[i]));
  return a.map((x, i) => (x - b[i]) / (2 * h));
}

/** F(p) = a + C p for an isometry value. */
export const applyIso = (F: IsometryValue, p: Vec): Vec => add(F.a, matvec(F.C, p));

export { frenetAt, norm, sub, add, scale, matvec };
