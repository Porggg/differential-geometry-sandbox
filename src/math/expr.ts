// Expression layer: parsing (math.js), validation, fast numeric compilation to native JS,
// symbolic differentiation/substitution, and a LaTeX printer that follows the book's notation.

import { create, all, type MathNode } from 'mathjs';

export const math = create(all, {});
export type Node = MathNode;

// ---------------------------------------------------------------------------------------------
// Parsing

const FUNCS_1 = [
  'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
  'asinh', 'acosh', 'atanh', 'exp', 'log', 'log10', 'log2', 'sqrt', 'cbrt', 'abs', 'sign',
  'floor', 'ceil', 'round',
];
const FUNCS_N = ['atan2', 'min', 'max', 'pow', 'hypot', 'mod'];
export const BUILTIN_FUNCS = new Set([...FUNCS_1, ...FUNCS_N]);
export const CONSTANTS = new Set(['pi', 'e']);

const GREEK = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon', 'zeta', 'eta', 'theta', 'vartheta',
  'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi',
  'varphi', 'chi', 'psi', 'omega', 'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma',
  'Upsilon', 'Phi', 'Psi', 'Omega',
];
const GREEK_SET = new Set(GREEK);

const UNICODE: [RegExp, string][] = [
  [/π/g, 'pi'], [/[·×⋅]/g, '*'], [/−/g, '-'], [/²/g, '^2'], [/³/g, '^3'], [/√/g, 'sqrt'],
  [/α/g, 'alpha'], [/β/g, 'beta'], [/γ/g, 'gamma'], [/δ/g, 'delta'], [/θ/g, 'theta'],
  [/ϑ/g, 'theta'], [/φ/g, 'phi'], [/ψ/g, 'psi'], [/ω/g, 'omega'], [/κ/g, 'kappa'], [/τ/g, 'tau'],
  [/λ/g, 'lambda'], [/μ/g, 'mu'], [/ρ/g, 'rho'], [/σ/g, 'sigma'],
];

/** Normalise user input: unicode, `ln`, `arcsin`, and function application without parentheses (`cos t`). */
export function preprocess(src: string): string {
  let s = src.trim();
  for (const [re, rep] of UNICODE) s = s.replace(re, rep);
  s = s.replace(/\bln\b/g, 'log').replace(/\barc(sin|cos|tan)\b/g, 'a$1');
  const fnAlt = FUNCS_1.join('|');
  // `cos t`, `sin 2t`, `cos s/c`  ->  cos(t), sin(2t), cos(s/c)
  const re = new RegExp(`\\b(${fnAlt})\\s+((?:[0-9.]+\\s*)?[A-Za-z_][A-Za-z0-9_]*(?:\\s*/\\s*[A-Za-z0-9_.]+)?|[0-9.]+)`, 'g');
  s = s.replace(re, '$1($2)');
  return s;
}

const parseCache = new Map<string, Node>();

export function parse(src: string): Node {
  const key = src;
  const hit = parseCache.get(key);
  if (hit) return hit;
  const pre = preprocess(src);
  if (pre === '') throw new Error('empty expression');
  let node: Node;
  try {
    node = math.parse(pre);
  } catch (e) {
    throw new Error(`cannot parse “${src}”: ${(e as Error).message}`);
  }
  if (parseCache.size > 5000) parseCache.clear();
  parseCache.set(key, node);
  return node;
}

/** Split a tuple string "(a, b, c)" (or "[a,b,c]" or "a, b, c") at top-level commas. */
export function splitTuple(src: string): string[] {
  let s = src.trim();
  const wraps = (open: string, close: string) => {
    if (!(s.startsWith(open) && s.endsWith(close))) return false;
    let depth = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '(' || c === '[') depth++;
      else if (c === ')' || c === ']') depth--;
      if (depth === 0 && i < s.length - 1) return false;
    }
    return true;
  };
  if (wraps('(', ')') || wraps('[', ']')) s = s.slice(1, -1);
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
  parts.push(cur.trim());
  return parts.filter((p, i) => p !== '' || i < parts.length - 1);
}

export const joinTuple = (parts: string[]): string => `(${parts.join(', ')})`;

// ---------------------------------------------------------------------------------------------
// Symbols, substitution

/** Free symbol names (not function names) occurring in a node. */
export function symbolsOf(node: Node): Set<string> {
  const out = new Set<string>();
  node.traverse((n: any, path: string, parent: any) => {
    if (n.type === 'SymbolNode' && !(parent && parent.type === 'FunctionNode' && path === 'fn')) {
      out.add(n.name);
    }
  });
  return out;
}

/** Names called as functions in a node. */
export function calledFunctionsOf(node: Node): Set<string> {
  const out = new Set<string>();
  node.traverse((n: any) => {
    if (n.type === 'FunctionNode') out.add(n.fn.name ?? n.name);
  });
  return out;
}

export function substitute(node: Node, map: Record<string, Node>): Node {
  return node.transform((n: any, path: string, parent: any) => {
    if (n.type === 'SymbolNode' && map[n.name] && !(parent && parent.type === 'FunctionNode' && path === 'fn')) {
      return new math.ParenthesisNode(map[n.name].cloneDeep());
    }
    return n;
  });
}

export const sym = (name: string): Node => new math.SymbolNode(name);
export const num = (x: number): Node => new math.ConstantNode(x);

/** Coordinate aliases: x1,x2,x3 -> x,y,z. */
export const COORD_ALIASES: Record<string, string> = { x1: 'x', x2: 'y', x3: 'z' };

export interface UserFunction {
  vars: string[];
  node: Node;
}

export interface ExprEnv {
  /** Free variables of the expression, in order (e.g. ['t'] or ['x','y','z']). */
  vars: string[];
  /** Scene numbers usable as constants (sliders and computed numbers). */
  numbers: Record<string, number>;
  /** Scene scalar functions that get inlined (O'Neill writes fg for the product of functions). */
  functions?: Record<string, UserFunction>;
}

/** Inline user functions, apply coordinate aliases, and check that every symbol is known. */
export function resolve(node: Node, env: ExprEnv): Node {
  const fns = env.functions ?? {};
  const varSet = new Set(env.vars);
  let out = node.transform((n: any, path: string, parent: any) => {
    if (n.type === 'SymbolNode' && !(parent && parent.type === 'FunctionNode' && path === 'fn')) {
      if (!varSet.has(n.name) && COORD_ALIASES[n.name] && varSet.has(COORD_ALIASES[n.name])) {
        return new math.SymbolNode(COORD_ALIASES[n.name]);
      }
      const f = fns[n.name];
      if (f && !varSet.has(n.name) && !(n.name in env.numbers)) {
        if (!f.vars.every((v) => varSet.has(v))) {
          throw new Error(`${n.name} is a function of (${f.vars.join(', ')}); call it with arguments, e.g. ${n.name}(${f.vars.join(', ')})`);
        }
        return new math.ParenthesisNode(f.node.cloneDeep());
      }
    }
    if (n.type === 'FunctionNode') {
      const name = n.fn.name ?? n.name;
      const f = fns[name];
      if (f) {
        if (n.args.length !== f.vars.length) throw new Error(`${name} expects ${f.vars.length} argument(s)`);
        const map: Record<string, Node> = {};
        f.vars.forEach((v, i) => (map[v] = resolve(n.args[i], env)));
        return new math.ParenthesisNode(substitute(f.node, map));
      }
    }
    return n;
  });
  // validation
  for (const s of symbolsOf(out)) {
    if (varSet.has(s) || CONSTANTS.has(s) || s in env.numbers) continue;
    throw new Error(`unknown symbol “${s}”` + (env.vars.length ? ` (variables here: ${env.vars.join(', ')})` : ''));
  }
  for (const f of calledFunctionsOf(out)) {
    if (!BUILTIN_FUNCS.has(f)) throw new Error(`unknown function “${f}”`);
  }
  // reject things we cannot compile (matrices, assignments, units…)
  out.traverse((n: any) => {
    const ok = ['SymbolNode', 'ConstantNode', 'OperatorNode', 'FunctionNode', 'ParenthesisNode', 'ConditionalNode'];
    if (!ok.includes(n.type)) throw new Error(`unsupported syntax (${n.type})`);
    if (n.type === 'ConstantNode' && typeof n.value !== 'number') throw new Error('only numeric constants are allowed');
  });
  out = stripParens(out);
  return out;
}

export function stripParens(node: Node): Node {
  return node.transform((n: any) => (n.type === 'ParenthesisNode' ? stripParens(n.content) : n));
}

// ---------------------------------------------------------------------------------------------
// Numeric compilation (node -> native JS function)

export type CompiledFn = (v: number[], P: Record<string, number>) => number;

const JS_FUNCS: Record<string, string> = {
  sin: 'Math.sin', cos: 'Math.cos', tan: 'Math.tan', asin: 'Math.asin', acos: 'Math.acos',
  atan: 'Math.atan', sinh: 'Math.sinh', cosh: 'Math.cosh', tanh: 'Math.tanh', asinh: 'Math.asinh',
  acosh: 'Math.acosh', atanh: 'Math.atanh', exp: 'Math.exp', log10: 'Math.log10', log2: 'Math.log2',
  sqrt: 'Math.sqrt', cbrt: 'Math.cbrt', abs: 'Math.abs', sign: 'Math.sign', floor: 'Math.floor',
  ceil: 'Math.ceil', round: 'Math.round', atan2: 'Math.atan2', min: 'Math.min', max: 'Math.max',
  pow: 'Math.pow', hypot: 'Math.hypot',
};

function toJS(n: any, vars: string[]): string {
  switch (n.type) {
    case 'ConstantNode':
      return `(${Number(n.value)})`;
    case 'SymbolNode': {
      const i = vars.indexOf(n.name);
      if (i >= 0) return `v[${i}]`;
      if (n.name === 'pi') return 'Math.PI';
      if (n.name === 'e') return 'Math.E';
      return `P[${JSON.stringify(n.name)}]`;
    }
    case 'ParenthesisNode':
      return toJS(n.content, vars);
    case 'OperatorNode': {
      const a = n.args.map((x: any) => toJS(x, vars));
      if (n.args.length === 1) {
        if (n.op === '-') return `(-${a[0]})`;
        if (n.op === '+') return a[0];
        if (n.op === '!') throw new Error('factorial not supported');
      }
      switch (n.op) {
        case '+': return `(${a[0]}+${a[1]})`;
        case '-': return `(${a[0]}-${a[1]})`;
        case '*': return `(${a[0]}*${a[1]})`;
        case '/': return `(${a[0]}/${a[1]})`;
        case '^': return `Math.pow(${a[0]},${a[1]})`;
        case '%': case 'mod': return `(${a[0]}%${a[1]})`;
        case '<': return `(${a[0]}<${a[1]}?1:0)`;
        case '>': return `(${a[0]}>${a[1]}?1:0)`;
        case '<=': return `(${a[0]}<=${a[1]}?1:0)`;
        case '>=': return `(${a[0]}>=${a[1]}?1:0)`;
        case '==': return `(${a[0]}===${a[1]}?1:0)`;
      }
      throw new Error(`operator ${n.op} not supported`);
    }
    case 'FunctionNode': {
      const name = n.fn.name ?? n.name;
      const a = n.args.map((x: any) => toJS(x, vars));
      if (name === 'log') return a.length === 2 ? `(Math.log(${a[0]})/Math.log(${a[1]}))` : `Math.log(${a[0]})`;
      if (name === 'sec') return `(1/Math.cos(${a[0]}))`;
      if (name === 'csc') return `(1/Math.sin(${a[0]}))`;
      if (name === 'cot') return `(1/Math.tan(${a[0]}))`;
      if (name === 'mod') return `(${a[0]}%${a[1]})`;
      const js = JS_FUNCS[name];
      if (!js) throw new Error(`unknown function “${name}”`);
      return `${js}(${a.join(',')})`;
    }
    case 'ConditionalNode':
      return `(${toJS(n.condition, vars)}?${toJS(n.trueExpr, vars)}:${toJS(n.falseExpr, vars)})`;
  }
  throw new Error(`unsupported syntax (${n.type})`);
}

const compileCache = new Map<string, CompiledFn>();

/** Compile a *resolved* node into a fast function of the variables (values passed as an array). */
export function compileNode(node: Node, vars: string[]): CompiledFn {
  const key = vars.join(',') + '|' + node.toString();
  const hit = compileCache.get(key);
  if (hit) return hit;
  const body = toJS(node, vars);
  // eslint-disable-next-line no-new-func
  const fn = new Function('v', 'P', `return ${body};`) as CompiledFn;
  if (compileCache.size > 5000) compileCache.clear();
  compileCache.set(key, fn);
  return fn;
}

/** Parse + resolve + compile a scalar expression; returns the resolved node and the bound evaluator. */
export function scalar(src: string | Node, env: ExprEnv): { node: Node; f: (v: number[]) => number } {
  const node = resolve(typeof src === 'string' ? parse(src) : src, env);
  const c = compileNode(node, env.vars);
  const P = env.numbers;
  return { node, f: (v: number[]) => c(v, P) };
}

/** Evaluate a constant expression (no free variables) to a number. */
export function evalConst(src: string, numbers: Record<string, number>, functions?: Record<string, UserFunction>): number {
  const { f } = scalar(src, { vars: [], numbers, functions });
  const x = f([]);
  if (!Number.isFinite(x)) throw new Error(`“${src}” does not evaluate to a finite number`);
  return x;
}

// ---------------------------------------------------------------------------------------------
// Symbolic calculus

const derivCache = new Map<string, Node>();

/** ∂node/∂v, simplified when cheap. Throws if math.js cannot differentiate. */
export function derivative(node: Node, v: string): Node {
  const key = v + '|' + node.toString();
  const hit = derivCache.get(key);
  if (hit) return hit;
  let d: Node = math.derivative(node, v, { simplify: false });
  d = simplify(d);
  if (derivCache.size > 5000) derivCache.clear();
  derivCache.set(key, d);
  return d;
}

export function nodeSize(node: Node): number {
  let n = 0;
  node.traverse(() => n++);
  return n;
}

/** Full simplification for small expressions; only cheap local rules for big ones (math.simplify can take seconds). */
export function simplify(node: Node): Node {
  try {
    const s = nodeSize(node) <= 45 ? math.simplify(node, {}, { exactFractions: false }) : math.simplifyCore(node);
    return stripParens(s);
  } catch {
    return node;
  }
}

/** Build a node from a string without resolution (used for generated formulas). */
export const P = (s: string): Node => math.parse(s);

export const isZeroNode = (n: Node): boolean => {
  const s = stripParens(n) as any;
  return s.type === 'ConstantNode' && Number(s.value) === 0;
};

export function addNodes(nodes: Node[]): Node {
  const nz = nodes.filter((n) => !isZeroNode(n));
  if (nz.length === 0) return num(0);
  return simplify(nz.reduce((a, b) => new math.OperatorNode('+', 'add', [a, b])));
}

export function mulNodes(a: Node, b: Node): Node {
  if (isZeroNode(a) || isZeroNode(b)) return num(0);
  return new math.OperatorNode('*', 'multiply', [a, b]);
}

export const subNodes = (a: Node, b: Node): Node => new math.OperatorNode('-', 'subtract', [a, b]);

// ---------------------------------------------------------------------------------------------
// LaTeX

/** TeX for an object / variable name: greek letters, numeric subscripts. */
export function nameTex(name: string): string {
  const m = /^([A-Za-z]+?)_?([0-9]+)?$/.exec(name);
  if (!m) {
    const [head, ...rest] = name.split('_');
    return `${nameTex(head)}_{${rest.join('\\_')}}`;
  }
  const [, base, digits] = m;
  let b: string;
  if (GREEK_SET.has(base)) b = base === 'phi' ? '\\phi' : `\\${base}`;
  else if (base.length === 1) b = base;
  else b = `\\mathrm{${base}}`;
  if (!digits) return b;
  return digits.length === 1 ? `${b}_${digits}` : `${b}_{${digits}}`;
}

const TEX_FUNCS: Record<string, string> = {
  sin: '\\sin', cos: '\\cos', tan: '\\tan', sec: '\\sec', csc: '\\csc', cot: '\\cot',
  asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan', sinh: '\\sinh', cosh: '\\cosh',
  tanh: '\\tanh', log: '\\ln', exp: '\\exp',
};

function prec(n: any): number {
  if (n.type === 'OperatorNode') {
    if (n.args.length === 1) return 3;
    if (n.op === '+' || n.op === '-') return 1;
    if (n.op === '*') return 2;
    if (n.op === '/') return 5; // rendered as \frac: atomic
    if (n.op === '^') return 4;
    return 0;
  }
  if (n.type === 'ConstantNode') return Number(n.value) < 0 ? 3 : 6;
  if (n.type === 'ParenthesisNode') return prec(n.content);
  return 6;
}

function numTex(x: number): string {
  if (Number.isInteger(x)) return String(x);
  const s = Number(x.toPrecision(6)).toString();
  return s.includes('e') ? x.toExponential(3).replace(/e([+-]\d+)/, '\\times 10^{$1}') : s;
}

function isSimpleArg(n: any): boolean {
  n = n.type === 'ParenthesisNode' ? n.content : n;
  if (n.type === 'SymbolNode' || (n.type === 'ConstantNode' && Number(n.value) >= 0)) return true;
  if (n.type === 'OperatorNode' && n.op === '*' && n.args.length === 2) {
    return n.args[0].type === 'ConstantNode' && n.args[1].type === 'SymbolNode';
  }
  if (n.type === 'OperatorNode' && n.op === '/' && n.args.length === 2) {
    return n.args.every((a: any) => a.type === 'SymbolNode' || a.type === 'ConstantNode');
  }
  return false;
}

function wrap(s: string): string {
  return `\\left(${s}\\right)`;
}

function flattenMul(n: any): any[] {
  n = n.type === 'ParenthesisNode' && n.content.type === 'OperatorNode' && n.content.op === '*' ? n.content : n;
  if (n.type === 'OperatorNode' && n.op === '*' && n.args.length === 2) return [...flattenMul(n.args[0]), ...flattenMul(n.args[1])];
  return [n];
}

export function tex(node: Node): string {
  return texOf(node as any);
}

function texOf(n: any): string {
  switch (n.type) {
    case 'ConstantNode':
      return numTex(Number(n.value));
    case 'SymbolNode':
      return n.name === 'pi' ? '\\pi' : nameTex(n.name);
    case 'ParenthesisNode':
      return texOf(n.content);
    case 'ConditionalNode':
      return `\\begin{cases} ${texOf(n.trueExpr)} & ${texOf(n.condition)} \\\\ ${texOf(n.falseExpr)} & \\text{otherwise}\\end{cases}`;
    case 'FunctionNode': {
      const name = n.fn.name ?? n.name;
      const args = n.args;
      if (name === 'sqrt') return `\\sqrt{${texOf(args[0])}}`;
      if (name === 'cbrt') return `\\sqrt[3]{${texOf(args[0])}}`;
      if (name === 'abs') return `\\left|${texOf(args[0])}\\right|`;
      if (name === 'exp') return `e^{${texOf(args[0])}}`;
      const f = TEX_FUNCS[name];
      if (f && args.length === 1) {
        return isSimpleArg(args[0]) ? `${f} ${texOf(args[0])}` : `${f}${wrap(texOf(args[0]))}`;
      }
      const fn = f ?? (BUILTIN_FUNCS.has(name) ? `\\operatorname{${name}}` : nameTex(name));
      return `${fn}${wrap(args.map(texOf).join(', '))}`;
    }
    case 'OperatorNode': {
      const a = n.args;
      if (a.length === 1) {
        const inner = texOf(a[0]);
        const op = n.op === '-' ? '-' : n.op === '+' ? '+' : n.op;
        return prec(a[0]) <= 2 ? `${op}${wrap(inner)}` : `${op}${inner}`;
      }
      switch (n.op) {
        case '+': {
          const r = a[1];
          const rStripped = r.type === 'ParenthesisNode' ? r.content : r;
          if (rStripped.type === 'OperatorNode' && rStripped.op === '-' && rStripped.args.length === 1) {
            const inner = rStripped.args[0];
            return `${texOf(a[0])} - ${prec(inner) <= 1 ? wrap(texOf(inner)) : texOf(inner)}`;
          }
          if (rStripped.type === 'ConstantNode' && Number(rStripped.value) < 0) {
            return `${texOf(a[0])} - ${numTex(-Number(rStripped.value))}`;
          }
          return `${texOf(a[0])} + ${texOf(r)}`;
        }
        case '-': {
          const rt = prec(a[1]) <= 1 ? wrap(texOf(a[1])) : texOf(a[1]);
          return `${texOf(a[0])} - ${rt}`;
        }
        case '*': {
          const fs = flattenMul(n);
          let out = '';
          fs.forEach((f: any, i: number) => {
            let t = texOf(f);
            const p = prec(f);
            if (p <= 1 || (i > 0 && p === 3)) t = wrap(t);
            if (i > 0) {
              const prevNum = /[0-9]$/.test(out);
              const startsNum = /^[0-9]/.test(t);
              out += prevNum && startsNum ? ' \\cdot ' : startsNum ? ' \\cdot ' : ' ';
            }
            out += t;
          });
          return out;
        }
        case '/':
          return `\\frac{${texOf(a[0])}}{${texOf(a[1])}}`;
        case '^': {
          const base = a[0].type === 'ParenthesisNode' ? a[0].content : a[0];
          const bname = base.type === 'FunctionNode' ? base.fn.name ?? base.name : '';
          if (TEX_FUNCS[bname] && base.args.length === 1) {
            const arg = base.args[0];
            const at = isSimpleArg(arg) ? ` ${texOf(arg)}` : wrap(texOf(arg));
            return `${TEX_FUNCS[bname]}^{${texOf(a[1])}}${at}`;
          }
          const bt = prec(base) < 6 ? wrap(texOf(base)) : texOf(base);
          return `${bt}^{${texOf(a[1])}}`;
        }
        default:
          return `${texOf(a[0])} ${n.op} ${texOf(a[1])}`;
      }
    }
  }
  return (n as Node).toTex();
}

/** TeX of an expression string (best effort: falls back to the raw text). */
export function texOfSource(src: string): string {
  try {
    return tex(parse(src));
  } catch {
    return `\\text{${src.replace(/[{}\\]/g, '')}}`;
  }
}

export const texTuple = (parts: string[]): string => `\\left(${parts.join(',\\ ')}\\right)`;
