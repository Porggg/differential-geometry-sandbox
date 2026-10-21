// Helpers shared by object types.

import { derivative, nameTex, resolve, compileNode, parse, scalar, splitTuple, tex, texOfSource, type Node } from '../math/expr';
import { diffVec } from '../math/numeric';
import { fmt, type Vec, type Mat } from '../math/vec';
import type {
  ComputeCtx, CourseCtx, CurveValue, FieldValue, FrameValue, FunctionValue, IsometryValue, MappingValue,
  ObjData, ParamSpec, ParamValue, PointValue, Value, ValueKind, VectorValue, FormValue, FrameFieldValue,
} from '../core/types';

export const COLORS = {
  point: '#1f6feb',
  vector: '#d1242f',
  curve: '#0969da',
  field: '#8250df',
  function: '#2da44e',
  frenetT: '#d1242f',
  frenetN: '#1a7f37',
  frenetB: '#0550ae',
  frame: '#bf8700',
  derived: '#cf222e',
  mapping: '#6e7781',
  plane: '#57606a',
  isometry: '#953800',
  plot: '#bc4c00',
};

export const XYZ = ['x', 'y', 'z'];
export const XY = ['x', 'y'];
export const coordVars = (dim: number): string[] => (dim === 2 ? XY : XYZ);

// ---------------------------------------------------------------------------------------------
// Param specs

export const P = {
  expr: (key: string, label: string, vars: string[] = [], extra: Partial<ParamSpec> = {}): ParamSpec => ({ key, label, kind: 'expr', vars, ...extra }),
  vec: (key: string, label: string, size: number, vars: string[] = [], extra: Partial<ParamSpec> = {}): ParamSpec => ({ key, label, kind: 'vec', size, vars, ...extra }),
  ref: (key: string, label: string, accepts: ValueKind[], extra: Partial<ParamSpec> = {}): ParamSpec => ({ key, label, kind: 'ref', accepts, ...extra }),
  select: (key: string, label: string, options: { value: string; label: string }[], extra: Partial<ParamSpec> = {}): ParamSpec => ({ key, label, kind: 'select', options, ...extra }),
  bool: (key: string, label: string, extra: Partial<ParamSpec> = {}): ParamSpec => ({ key, label, kind: 'bool', ...extra }),
  int: (key: string, label: string, min: number, max: number, extra: Partial<ParamSpec> = {}): ParamSpec => ({ key, label, kind: 'int', min, max, ...extra }),
};

export const str = (v: ParamValue | undefined, d = ''): string => (v === undefined ? d : Array.isArray(v) ? v.join(', ') : String(v));
/** Components of a tuple parameter. Accepts "(a, b, c)", and a tuple times / divided by a scalar: "(a, b)/k", "k*(a, b)". */
export function arr(v: ParamValue | undefined): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v !== 'string') return [];
  const s = v.trim();
  const match = (from: number, dir: 1 | -1): number => {
    let depth = 0;
    for (let i = from; i >= 0 && i < s.length; i += dir) {
      if (s[i] === '(') depth += dir;
      if (s[i] === ')') depth -= dir;
      if (depth === 0) return i;
    }
    return -1;
  };
  if (s.startsWith('(')) {
    const close = match(0, 1);
    const rest = close > 0 ? /^\s*([*/])\s*(.+)$/.exec(s.slice(close + 1)) : null;
    if (rest) {
      const parts = splitTuple(s.slice(0, close + 1));
      if (parts.length >= 2) return parts.map((x) => `(${x})${rest[1]}(${rest[2]})`);
    }
  }
  if (s.endsWith(')')) {
    const open = match(s.length - 1, -1);
    const pre = open > 0 ? /^(.+?)\s*\*\s*$/.exec(s.slice(0, open)) : null;
    if (pre) {
      const parts = splitTuple(s.slice(open));
      if (parts.length >= 2) return parts.map((x) => `(${pre[1]})*(${x})`);
    }
  }
  return splitTuple(s);
}

// ---------------------------------------------------------------------------------------------
// Evaluation helpers

export function numVec(v: ParamValue | undefined, ctx: ComputeCtx, size: number, what = 'vector'): Vec {
  const parts = arr(v);
  if (parts.length !== size) throw new Error(`${what} needs ${size} components, got ${parts.length}`);
  return parts.map((s) => ctx.num(s));
}

/** Compile vector-valued expression components in the given variables. */
export function compileVec(parts: string[], vars: string[], ctx: ComputeCtx): { nodes: Node[]; f: (x: Vec) => Vec } {
  const env = { vars, numbers: ctx.numbers, functions: ctx.functions, points: ctx.points };
  const comps = parts.map((s) => scalar(s, env));
  return { nodes: comps.map((c) => c.node), f: (x: Vec) => comps.map((c) => c.f(x)) };
}

export function compileNodes(nodes: Node[], vars: string[], ctx: ComputeCtx): (x: Vec) => Vec {
  const fs = nodes.map((n) => compileNode(n, vars));
  return (x: Vec) => fs.map((f) => f(x, ctx.numbers));
}

/** Build a curve value from symbolic components (exact derivatives when math.js can differentiate). */
export function curveFromNodes(nodes: Node[], param: string, a: number, b: number, ctx: ComputeCtx, extra: Partial<CurveValue> = {}): CurveValue {
  const vars = [param];
  const f0 = compileNodes(nodes, vars, ctx);
  const f = (t: number) => f0([t]);
  let d1: (t: number) => Vec;
  let d2: (t: number) => Vec;
  let d3: (t: number) => Vec;
  try {
    const n1 = nodes.map((n) => derivative(n, param));
    const n2 = n1.map((n) => derivative(n, param));
    const n3 = n2.map((n) => derivative(n, param));
    const g1 = compileNodes(n1, vars, ctx);
    const g2 = compileNodes(n2, vars, ctx);
    const g3 = compileNodes(n3, vars, ctx);
    d1 = (t) => g1([t]);
    d2 = (t) => g2([t]);
    d3 = (t) => g3([t]);
  } catch {
    d1 = (t) => diffVec(f, t, 1e-4);
    d2 = (t) => diffVec(d1, t, 1e-3);
    d3 = (t) => diffVec(d2, t, 1e-3);
  }
  return { kind: 'curve', dim: nodes.length, param, a, b, f, d1, d2, d3, exprs: nodes, ...extra };
}

export function curveFromStrings(parts: string[], param: string, a: number, b: number, ctx: ComputeCtx): CurveValue {
  const env = { vars: [param], numbers: ctx.numbers, functions: ctx.functions, points: ctx.points };
  const nodes = parts.map((s) => resolve(parse(s), env));
  return curveFromNodes(nodes, param, a, b, ctx);
}

/** Curve given only numerically (derivatives by finite differences). */
export function numericCurve(dim: number, param: string, a: number, b: number, f: (t: number) => Vec, extra: Partial<CurveValue> = {}): CurveValue {
  const d1 = (t: number) => diffVec(f, t, 1e-4);
  const d2 = (t: number) => diffVec(d1, t, 1e-3);
  const d3 = (t: number) => diffVec(d2, t, 1e-3);
  return { kind: 'curve', dim, param, a, b, f, d1, d2, d3, ...extra };
}

// ---------------------------------------------------------------------------------------------
// Typed getters

function expect<K extends ValueKind>(ctx: ComputeCtx, name: string | ParamValue | undefined, kinds: K[], what: string): Extract<Value, { kind: K }> {
  const n = str(name);
  if (!n) throw new Error(`choose a ${what}`);
  const v = ctx.get(n);
  if (!(kinds as string[]).includes(v.kind)) throw new Error(`${n} is not a ${what}`);
  return v as Extract<Value, { kind: K }>;
}

export const getCurve = (ctx: ComputeCtx, n: ParamValue | undefined): CurveValue => expect(ctx, n, ['curve'], 'curve');
export const getPoint = (ctx: ComputeCtx, n: ParamValue | undefined): PointValue => expect(ctx, n, ['point'], 'point');
export const getVector = (ctx: ComputeCtx, n: ParamValue | undefined): VectorValue => expect(ctx, n, ['vector'], 'tangent vector');
export const getField = (ctx: ComputeCtx, n: ParamValue | undefined): FieldValue => expect(ctx, n, ['field'], 'vector field');
export const getFunction = (ctx: ComputeCtx, n: ParamValue | undefined): FunctionValue => expect(ctx, n, ['function'], 'function');
export const getForm = (ctx: ComputeCtx, n: ParamValue | undefined): FormValue => expect(ctx, n, ['form'], 'differential form');
export const getMapping = (ctx: ComputeCtx, n: ParamValue | undefined): MappingValue => expect(ctx, n, ['mapping'], 'mapping');
export const getIsometry = (ctx: ComputeCtx, n: ParamValue | undefined): IsometryValue => expect(ctx, n, ['isometry'], 'isometry');
export const getFrame = (ctx: ComputeCtx, n: ParamValue | undefined): FrameValue => expect(ctx, n, ['frame'], 'frame');
export const getFrameField = (ctx: ComputeCtx, n: ParamValue | undefined): FrameFieldValue => expect(ctx, n, ['framefield'], 'frame field');

/** A point given either as a reference to a point object or as coordinates. */
export function pointOf(ctx: ComputeCtx, v: ParamValue | undefined, dim: number): Vec {
  const s = str(v).trim();
  if (/^[A-Za-z][A-Za-z0-9_]*$/.test(s)) {
    const val = ctx.get(s);
    if (val.kind === 'point') return val.p;
    if (val.kind === 'vector') return val.p;
    throw new Error(`${s} is not a point`);
  }
  return numVec(v, ctx, dim, 'point');
}

// ---------------------------------------------------------------------------------------------
// TeX helpers

export const texNum = (x: number, d = 4): string => fmt(x, d);
export const texVec = (v: Vec, d = 3): string => `\\left(${v.map((x) => fmt(x, d)).join(',\\ ')}\\right)`;
export const texVecAt = (v: Vec, p: Vec, d = 3): string => `${texVec(v, d)}_{${texVec(p, 2)}}`;
export const texNodes = (ns: Node[]): string => `\\left(${ns.map(tex).join(',\\ ')}\\right)`;
export const texParts = (parts: string[]): string => `\\left(${parts.map(texOfSource).join(',\\ ')}\\right)`;

export function texMat(m: (string | number)[][], d = 3): string {
  const rows = m.map((r) => r.map((x) => (typeof x === 'number' ? fmt(x, d) : x)).join(' & '));
  return `\\begin{pmatrix} ${rows.join(' \\\\ ')} \\end{pmatrix}`;
}

export const texNodeMat = (m: Node[][]): string => texMat(m.map((r) => r.map(tex)));

/** TeX for a "point-ish" param: name or coordinates. */
export function texPointParam(v: ParamValue | undefined, cx: CourseCtx): string {
  const s = str(v).trim();
  if (/^[A-Za-z][A-Za-z0-9_]*$/.test(s)) return cx.label(s);
  return texParts(arr(v));
}

export const lbl = (cx: CourseCtx, v: ParamValue | undefined): string => {
  const s = str(v);
  return s ? cx.label(s) : '?';
};

export const exprTex = (v: ParamValue | undefined): string => texOfSource(str(v));

/** "2\,U_1 - U_3" from numeric coefficients and TeX basis symbols (zero terms omitted). */
export function linCombTex(cs: number[], basis: string[], d = 4): string {
  const terms: string[] = [];
  cs.forEach((c, i) => {
    const s = fmt(c, d);
    if (s === '0') return;
    const coef = s === '1' ? '' : s === '-1' ? '-' : `${s}\\,`;
    terms.push(`${coef}${basis[i]}`);
  });
  if (!terms.length) return '0';
  return terms.map((t, i) => (i === 0 ? t : t.startsWith('-') ? `- ${t.slice(1)}` : `+ ${t}`)).join(' ');
}
export { nameTex, tex };

/** Points and tangent vectors are bold in the book: p, v. */
export function boldName(obj: ObjData): string {
  return obj.style?.caption || `\\boldsymbol{${nameTex(obj.name)}}`;
}

/** Displayed name: the caption when one is set (e.g. a 2D copy "p2" shown as p), else the name. */
export function nameOf(obj: ObjData): string {
  return obj.style?.caption || nameTex(obj.name);
}

/** Matrix params are stored as "a, b, c; d, e, f; g, h, i". */
export function matrixParam(v: ParamValue | undefined): string[][] {
  const rows = str(v).split(';').map((r) => splitTuple(r));
  if (rows.length !== 3 || rows.some((r) => r.length !== 3)) throw new Error('the matrix needs 3 rows of 3 entries (rows separated by ;)');
  return rows;
}

export function numMat(rows: string[][], ctx: ComputeCtx): Mat {
  return rows.map((r) => r.map((s) => ctx.num(s)));
}

/** Book link markdown for an entry id. */
export const bookLink = (id: string, text?: string): string => `[[${id}${text ? '|' + text : ''}]]`;
