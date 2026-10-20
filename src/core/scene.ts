// The construction: named objects, their dependency graph, and incremental recomputation.

import { BUILTIN_FUNCS, CONSTANTS, calledFunctionsOf, evalConst, parse, splitTuple, symbolsOf, type UserFunction } from '../math/expr';
import { getType, hasType } from './registry';
import type { ComputeCtx, CourseCtx, ObjData, ParamValue, Value, ValueKind } from './types';

export interface SceneObj {
  data: ObjData;
  deps: string[];
  value?: Value;
  error?: string;
}

export type SceneEvent =
  | { type: 'structure' }
  | { type: 'values'; names: Set<string> }
  | { type: 'style'; name: string };

export const RESERVED = new Set([
  'x', 'y', 'z', 't', 's', 'x1', 'x2', 'x3', 'pi', 'e', 'i', 'd', 'dx', 'dy', 'dz', 'dx1', 'dx2', 'dx3',
  'U1', 'U2', 'U3', 'true', 'false', 'in', 'to', 'and', 'or', 'not', 'mod',
  ...BUILTIN_FUNCS,
]);

export const NAME_RE = /^[A-Za-z][A-Za-z0-9_]*$/;

export function validateName(name: string): string | null {
  if (!NAME_RE.test(name)) return 'names start with a letter and contain only letters, digits and _';
  if (RESERVED.has(name)) return `“${name}” is reserved (coordinate, constant or function name)`;
  return null;
}

export class Scene {
  objs = new Map<string, SceneObj>();
  order: string[] = [];
  private listeners = new Set<(e: SceneEvent) => void>();
  private numbers: Record<string, number> = {};
  private functions: Record<string, UserFunction> = {};
  private batching = 0;
  private pendingStructure = false;
  private pendingValues = new Set<string>();

  on(fn: (e: SceneEvent) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(e: SceneEvent): void {
    if (this.batching > 0) {
      if (e.type === 'structure') this.pendingStructure = true;
      if (e.type === 'values') e.names.forEach((n) => this.pendingValues.add(n));
      if (e.type === 'style') this.pendingValues.add(e.name);
      return;
    }
    this.listeners.forEach((l) => l(e));
  }

  /** Group several mutations into one notification. */
  batch<T>(fn: () => T): T {
    this.batching++;
    try {
      return fn();
    } finally {
      this.batching--;
      if (this.batching === 0) {
        if (this.pendingStructure) {
          this.pendingStructure = false;
          this.pendingValues.clear();
          this.emit({ type: 'structure' });
        } else if (this.pendingValues.size) {
          const names = new Set(this.pendingValues);
          this.pendingValues.clear();
          this.emit({ type: 'values', names });
        }
      }
    }
  }

  has(name: string): boolean {
    return this.objs.has(name);
  }

  get(name: string): SceneObj | undefined {
    return this.objs.get(name);
  }

  value(name: string): Value | undefined {
    return this.objs.get(name)?.value;
  }

  list(): SceneObj[] {
    return this.order.map((n) => this.objs.get(n)!);
  }

  /** Names of objects whose value has one of the given kinds (most recent first). */
  find(kinds: ValueKind[], filter?: (v: Value) => boolean): string[] {
    return this.order
      .filter((n) => {
        const v = this.objs.get(n)!.value;
        return v && kinds.includes(v.kind) && (!filter || filter(v));
      })
      .reverse();
  }

  freshName(candidates: string[]): string {
    for (const c of candidates) if (!this.objs.has(c) && !RESERVED.has(c)) return c;
    const base = candidates[0].replace(/\d+$/, '');
    for (let i = 1; ; i++) {
      const n = `${base}${i}`;
      if (!this.objs.has(n) && !RESERVED.has(n)) return n;
    }
  }

  // -------------------------------------------------------------------------------------------
  // Mutations

  add(data: ObjData): void {
    const err = validateName(data.name);
    if (err) throw new Error(err);
    if (this.objs.has(data.name)) throw new Error(`an object named “${data.name}” already exists`);
    if (!hasType(data.type)) throw new Error(`unknown object type “${data.type}”`);
    this.objs.set(data.name, { data, deps: [] });
    this.order.push(data.name);
    this.refreshDeps();
    this.recompute(new Set([data.name, ...this.erroredNames()]));
    this.emit({ type: 'structure' });
  }

  addMany(datas: ObjData[]): void {
    this.batch(() => {
      for (const d of datas) {
        const err = validateName(d.name);
        if (err) throw new Error(`${d.name}: ${err}`);
        if (this.objs.has(d.name)) throw new Error(`an object named “${d.name}” already exists`);
        this.objs.set(d.name, { data: d, deps: [] });
        this.order.push(d.name);
      }
      this.refreshDeps();
      this.recompute();
      this.emit({ type: 'structure' });
    });
  }

  /** Replace params (and/or style) of an object. */
  update(name: string, patch: { params?: Record<string, ParamValue>; style?: Partial<ObjData['style']>; aux?: boolean }): void {
    const o = this.objs.get(name);
    if (!o) throw new Error(`no object named “${name}”`);
    if (patch.style) o.data = { ...o.data, style: { ...o.data.style, ...patch.style } };
    if (patch.aux !== undefined) o.data = { ...o.data, aux: patch.aux };
    if (patch.params) {
      o.data = { ...o.data, params: { ...o.data.params, ...patch.params } };
      const before = o.deps.join(',');
      this.refreshDeps();
      if (before !== o.deps.join(',')) {
        this.recompute();
        this.emit({ type: 'structure' });
        return;
      }
      const changed = this.recompute(new Set([name]));
      this.emit({ type: 'values', names: changed });
    } else {
      this.emit({ type: 'style', name });
    }
  }

  /** Fast path for sliders: set a numeric param and recompute dependents. */
  setNumber(name: string, key: string, value: number): void {
    const o = this.objs.get(name);
    if (!o) return;
    o.data.params[key] = value;
    const changed = this.recompute(new Set([name]));
    this.emit({ type: 'values', names: changed });
  }

  /** Objects that (transitively) depend on `name`. */
  dependents(name: string): string[] {
    const out = new Set<string>();
    const visit = (n: string) => {
      for (const m of this.order) {
        if (!out.has(m) && this.objs.get(m)!.deps.includes(n)) {
          out.add(m);
          visit(m);
        }
      }
    };
    visit(name);
    return this.order.filter((n) => out.has(n));
  }

  /** Remove an object and everything that depends on it. Returns the removed names. */
  remove(name: string): string[] {
    if (!this.objs.has(name)) return [];
    const gone = [name, ...this.dependents(name)];
    for (const n of gone) this.objs.delete(n);
    this.order = this.order.filter((n) => !gone.includes(n));
    this.refreshDeps();
    this.recompute();
    this.emit({ type: 'structure' });
    return gone;
  }

  rename(oldName: string, newName: string): void {
    if (oldName === newName) return;
    const err = validateName(newName);
    if (err) throw new Error(err);
    if (this.objs.has(newName)) throw new Error(`an object named “${newName}” already exists`);
    const o = this.objs.get(oldName);
    if (!o) return;
    const re = new RegExp(`\\b${oldName}\\b`, 'g');
    const fix = (v: ParamValue): ParamValue => {
      if (typeof v === 'string') return v === oldName ? newName : v.replace(re, newName);
      if (Array.isArray(v)) return v.map((x) => (x === oldName ? newName : x.replace(re, newName)));
      return v;
    };
    for (const n of this.order) {
      const d = this.objs.get(n)!.data;
      const params: Record<string, ParamValue> = {};
      for (const [k, v] of Object.entries(d.params)) params[k] = fix(v);
      this.objs.get(n)!.data = { ...d, params };
    }
    o.data = { ...o.data, name: newName };
    this.objs.delete(oldName);
    this.objs.set(newName, o);
    this.order = this.order.map((n) => (n === oldName ? newName : n));
    this.refreshDeps();
    this.recompute();
    this.emit({ type: 'structure' });
  }

  clear(): void {
    this.objs.clear();
    this.order = [];
    this.numbers = {};
    this.functions = {};
    this.emit({ type: 'structure' });
  }

  load(datas: ObjData[]): void {
    this.batch(() => {
      this.objs.clear();
      this.order = [];
      for (const d of datas) {
        if (!hasType(d.type) || this.objs.has(d.name)) continue;
        this.objs.set(d.name, { data: structuredClone(d), deps: [] });
        this.order.push(d.name);
      }
      this.refreshDeps();
      this.recompute();
      this.emit({ type: 'structure' });
    });
  }

  serialize(): ObjData[] {
    return this.order.map((n) => structuredClone(this.objs.get(n)!.data));
  }

  // -------------------------------------------------------------------------------------------
  // Dependencies and computation

  private erroredNames(): string[] {
    return this.order.filter((n) => this.objs.get(n)!.error);
  }

  /** Recompute the dependency list of every object from its params. */
  private refreshDeps(): void {
    for (const n of this.order) {
      const o = this.objs.get(n)!;
      o.deps = this.depsOf(o.data);
    }
  }

  depsOf(data: ObjData): string[] {
    const out = new Set<string>();
    let specs;
    try {
      specs = getType(data.type).params(Number(data.params.dim ?? 3));
    } catch {
      return [];
    }
    const scanExpr = (src: string) => {
      if (typeof src !== 'string' || src.trim() === '') return;
      try {
        const node = parse(src);
        for (const s of symbolsOf(node)) if (this.objs.has(s) && s !== data.name) out.add(s);
        for (const f of calledFunctionsOf(node)) if (this.objs.has(f) && f !== data.name) out.add(f);
      } catch {
        /* reported at compute time */
      }
    };
    for (const spec of specs) {
      const v = data.params[spec.key];
      if (v === undefined) continue;
      if (spec.kind === 'ref') {
        if (typeof v === 'string' && v && this.objs.has(v)) out.add(v);
      } else if (spec.kind === 'expr' || spec.kind === 'text') {
        if (spec.kind === 'expr') scanExpr(String(v));
      } else if (spec.kind === 'vec') {
        (Array.isArray(v) ? v : splitTuple(String(v))).forEach(scanExpr);
      } else if (spec.kind === 'matrix') {
        (Array.isArray(v) ? v : String(v).split(/[;,]/)).forEach(scanExpr);
      }
    }
    return [...out];
  }

  /** Topological order of all objects (dependencies first). Objects in a cycle get an error. */
  private topo(): string[] {
    const state = new Map<string, number>(); // 1 = visiting, 2 = done
    const out: string[] = [];
    for (const o of this.objs.values()) if (o.error?.startsWith('circular')) o.error = undefined;
    const visit = (n: string, stack: string[]) => {
      const s = state.get(n);
      if (s === 2) return;
      if (s === 1) {
        const cyc = stack.slice(stack.indexOf(n));
        for (const c of cyc) {
          const o = this.objs.get(c);
          if (o) o.error = `circular definition: ${[...cyc, n].join(' → ')}`;
        }
        return;
      }
      state.set(n, 1);
      for (const d of this.objs.get(n)!.deps) if (this.objs.has(d)) visit(d, [...stack, n]);
      state.set(n, 2);
      out.push(n);
    };
    for (const n of this.order) visit(n, []);
    return out;
  }

  /** Recompute `changed` (or everything) and all dependents. Returns the set of recomputed names. */
  recompute(changed?: Set<string>): Set<string> {
    const order = this.topo();
    let dirty: Set<string>;
    if (!changed) dirty = new Set(order);
    else {
      dirty = new Set(changed);
      for (const n of order) if (this.objs.get(n)!.deps.some((d) => dirty.has(d))) dirty.add(n);
    }
    // rebuild numbers/functions from clean objects
    if (!changed) {
      this.numbers = {};
      this.functions = {};
    }
    for (const n of order) {
      const o = this.objs.get(n)!;
      if (!dirty.has(n)) continue;
      if (o.error?.startsWith('circular')) {
        o.value = undefined;
        delete this.numbers[n];
        delete this.functions[n];
        continue;
      }
      try {
        const brokenDep = o.deps.find((d) => this.objs.get(d)?.error || !this.objs.get(d)?.value);
        if (brokenDep) throw new Error(`depends on ${brokenDep}, which is undefined`);
        o.value = getType(o.data.type).compute(o.data.params, this.ctxFor(o));
        o.error = undefined;
      } catch (e) {
        o.value = undefined;
        o.error = (e as Error).message || String(e);
      }
      delete this.numbers[n];
      delete this.functions[n];
      const v = o.value;
      if (v?.kind === 'number' && Number.isFinite(v.value)) this.numbers[n] = v.value;
      if (v?.kind === 'function') this.functions[n] = { vars: v.vars, node: v.expr };
    }
    return dirty;
  }

  private ctxFor(o: SceneObj): ComputeCtx {
    const deps = new Set(o.deps);
    // Only expose numbers/functions that are declared dependencies (keeps the graph honest).
    const numbers: Record<string, number> = {};
    const functions: Record<string, UserFunction> = {};
    for (const d of deps) {
      if (d in this.numbers) numbers[d] = this.numbers[d];
      if (d in this.functions) functions[d] = this.functions[d];
    }
    return {
      get: (name: string) => {
        const x = this.objs.get(name);
        if (!x) throw new Error(`no object named “${name}”`);
        if (!x.value) throw new Error(`${name} is undefined`);
        return x.value;
      },
      numbers,
      functions,
      num: (src: string | number) => (typeof src === 'number' ? src : evalConst(String(src), numbers, functions)),
    };
  }

  courseCtx(): CourseCtx {
    return {
      get: (name) => this.objs.get(name)?.value,
      label: (name) => this.captionOf(name),
    };
  }

  captionOf(name: string): string {
    const o = this.objs.get(name);
    if (!o) return name;
    if (o.data.style.caption) return o.data.style.caption;
    try {
      return getType(o.data.type).caption(o.data, this.courseCtx());
    } catch {
      return name;
    }
  }

  /** Numbers currently defined in the scene (for UI evaluation). */
  allNumbers(): Record<string, number> {
    return { ...this.numbers };
  }

  isConstantName(s: string): boolean {
    return CONSTANTS.has(s);
  }
}
