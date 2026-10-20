// Command bar: turns a line like `alpha(t) = (cos(t), sin(t), t)` or `Frenet(alpha, t0)` into an object definition.

import { derivative, isZeroNode, math, parse, simplify, splitTuple, substitute, symbolsOf, num } from '../math/expr';
import { allTypes, getType } from './registry';
import type { Scene } from './scene';
import type { ObjData, ParamValue } from './types';

export interface ParsedCommand {
  /** Existing object to redefine, or a new definition. */
  data: Omit<ObjData, 'style'> & { style?: ObjData['style'] };
  dim: number;
  redefine: boolean;
}

/** Split at top-level commas without stripping outer parentheses. */
export function splitTop(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const c of s) {
    if (c === '(' || c === '[') depth++;
    if (c === ')' || c === ']') depth--;
    if (c === ',' && depth === 0) {
      parts.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  if (cur.trim() || parts.length) parts.push(cur.trim());
  return parts;
}

const isTuple = (s: string) => /^\(.*\)$/s.test(s.trim()) && splitTuple(s).length >= 2;

/** Coefficients of a linear expression in the given basis symbols (e.g. U1,U2,U3 or dx,dy,dz). */
function linearCoefficients(src: string, basis: string[][]): string[] | null {
  let node;
  try {
    node = parse(src);
  } catch {
    return null;
  }
  const syms = symbolsOf(node);
  const flat = basis.flat();
  if (!flat.some((b) => syms.has(b))) return null;
  // normalise aliases to the first name of each basis element
  const map: Record<string, any> = {};
  basis.forEach((names) => names.slice(1).forEach((n) => (map[n] = math.parse(names[0]))));
  node = substitute(node, map);
  const coefs = basis.map((names) => simplify(derivative(node, names[0])));
  const zero: Record<string, any> = {};
  basis.forEach((names) => (zero[names[0]] = num(0)));
  const rest = simplify(substitute(node, zero));
  if (!isZeroNode(rest)) throw new Error('every term must contain exactly one basis element');
  for (const c of coefs) for (const b of flat) if (symbolsOf(c).has(b)) throw new Error('the expression is not linear in the basis elements');
  return coefs.map((c) => c.toString());
}

export function parseCommand(line: string, scene: Scene, activeDim: number): ParsedCommand {
  const src = line.trim();
  if (!src) throw new Error('empty command');
  let name: string | null = null;
  let vars: string[] | null = null;
  let rhs = src;
  const asg = /^([A-Za-z][A-Za-z0-9_]*)\s*(?:\(([^()]*)\))?\s*=(?!=)\s*([\s\S]+)$/.exec(src);
  if (asg) {
    name = asg[1];
    vars = asg[2] !== undefined ? asg[2].split(',').map((s) => s.trim()).filter(Boolean) : null;
    rhs = asg[3].trim();
  }
  const existing = name ? scene.get(name) : undefined;

  const make = (type: string, params: Record<string, ParamValue>, dim: number): ParsedCommand => {
    const t = getType(type);
    if (!t.dims.includes(dim as 2 | 3)) dim = t.dims[0];
    const ctx = { find: (k: any, f?: any) => scene.find(k, f), hasNumber: (n: string) => scene.value(n)?.kind === 'number' };
    const full = { ...t.defaults(dim, ctx), ...params };
    if (t.dims.length > 1) full.dim = dim;
    if (existing && existing.data.type !== type) throw new Error(`${name} already exists as a ${getType(existing.data.type).label}; delete it first or choose another name`);
    const n = name ?? scene.freshName(t.names);
    return { data: { name: n, type, params: existing ? { ...existing.data.params, ...params } : full }, dim, redefine: !!existing };
  };

  // Typed command: Name(args)
  const call = /^([A-Za-z][A-Za-z0-9_]*)\s*\(([\s\S]*)\)$/.exec(rhs);
  if (call && (vars === null || vars.length === 0)) {
    const t = allTypes().find((x) => x.command && x.command.name.toLowerCase() === call[1].toLowerCase());
    if (t && t.command) {
      const args = splitTop(call[2]);
      const params: Record<string, ParamValue> = {};
      let dim = activeDim;
      t.command.args.forEach((key, i) => {
        if (i >= args.length || args[i] === '') return;
        const spec = t.params(3).find((s) => s.key === key);
        let v: ParamValue = args[i];
        if (spec?.kind === 'bool') v = /^(true|1|yes)$/i.test(args[i]);
        if (spec?.kind === 'int') v = Number(args[i]);
        if (spec?.kind === 'vec' && isTuple(args[i])) dim = splitTuple(args[i]).length === 2 ? 2 : dim;
        params[key] = v;
      });
      return make(t.type, params, dim);
    }
  }

  // name(t) = (..)  -> curve ; name(x,y[,z]) = expr -> function / field / mapping
  if (vars && vars.length) {
    if (vars.length === 1) {
      if (!isTuple(rhs)) {
        return make('graph', { expr: rhs.replace(new RegExp(`\\b${vars[0]}\\b`, 'g'), 't') }, 2);
      }
      const comps = splitTuple(rhs);
      return make('curve', { comps: `(${comps.join(', ')})`, param: vars[0], a: '-2*pi', b: '2*pi' }, comps.length);
    }
    const dim = vars.length === 2 ? 2 : 3;
    if (isTuple(rhs)) {
      const comps = splitTuple(rhs);
      const type = /^[FGHM]/.test(name ?? '') ? 'mapping' : 'vectorField';
      return make(type, { comps: `(${comps.join(', ')})` }, dim);
    }
    return make('function', { expr: rhs }, dim);
  }

  // name = (a, b[, c]) -> point
  if (isTuple(rhs)) {
    const comps = splitTuple(rhs);
    return make('point', { coords: `(${comps.join(', ')})` }, comps.length === 2 ? 2 : 3);
  }

  // book notation: V = f U1 + g U2 + h U3  /  phi = f dx + g dy + h dz
  const field = linearCoefficients(rhs, [['U1'], ['U2'], ['U3']]);
  if (field) return make('vectorField', { comps: `(${field.join(', ')})` }, 3);
  const oneForm = linearCoefficients(rhs, [['dx', 'dx1'], ['dy', 'dx2'], ['dz', 'dx3']]);
  if (oneForm) return make('oneForm', { comps: `(${oneForm.join(', ')})` }, 3);

  // scalar
  let node;
  try {
    node = parse(rhs);
  } catch (e) {
    throw new Error((e as Error).message);
  }
  const syms = [...symbolsOf(node)];
  const coord = syms.filter((s) => ['x', 'y', 'z', 'x1', 'x2', 'x3'].includes(s));
  if (coord.length) {
    const dim = coord.some((s) => s === 'z' || s === 'x3') ? 3 : activeDim;
    return make('function', { expr: rhs }, dim);
  }
  if (/^-?\d+(\.\d+)?$/.test(rhs)) {
    const v = Number(rhs);
    const span = Math.max(5, Math.ceil(Math.abs(v) * 2));
    return make('slider', existing ? { value: v } : { value: v, min: -span, max: span, step: 0.01 }, activeDim);
  }
  return make('slider', { value: rhs }, activeDim);
}

/** Help text for the command bar. */
export function commandHelp(): { name: string; signature: string; label: string }[] {
  return allTypes()
    .filter((t) => t.command)
    .map((t) => ({ name: t.command!.name, signature: `${t.command!.name}(${t.command!.args.join(', ')})`, label: t.label }));
}
