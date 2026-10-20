import { describe, expect, it } from 'vitest';
import '../src/objects';
import { derivative, parse, preprocess, scalar, splitTuple, tex } from '../src/math/expr';
import { d, evalOneForm, form, formAt, wedge } from '../src/math/forms';
import { Scene } from '../src/core/scene';
import { frenetAt } from '../src/objects/frenet';
import { connectionForms, dualForms } from '../src/objects/framefields';
import type { CurveValue, FormValue, FrameFieldValue } from '../src/core/types';

const N = {};

describe('expressions', () => {
  it('preprocesses book-style input', () => {
    expect(preprocess('cos t')).toBe('cos(t)');
    expect(preprocess('sin 2t + π')).toBe('sin(2t) + pi');
    expect(preprocess('ln x')).toBe('log(x)');
  });
  it('splits tuples at top level', () => {
    expect(splitTuple('(cos(t), atan2(y, x), 3)')).toEqual(['cos(t)', 'atan2(y, x)', '3']);
    expect(splitTuple('(1, 2)')).toEqual(['1', '2']);
  });
  it('compiles to fast functions', () => {
    const { f } = scalar('a*cos(t)^2 + x1', { vars: ['t', 'x'], numbers: { a: 2 } });
    expect(f([0, 3])).toBeCloseTo(5);
  });
  it('differentiates symbolically', () => {
    const dd = derivative(parse('x^2*y'), 'x');
    const { f } = scalar(dd, { vars: ['x', 'y'], numbers: N });
    expect(f([3, 2])).toBeCloseTo(12);
  });
  it('prints TeX like the book', () => {
    expect(tex(parse('cos(t)'))).toBe('\\cos t');
    expect(tex(parse('a*cos(s/c)'))).toBe('a \\cos \\frac{s}{c}');
    expect(tex(parse('alpha2'))).toBe('\\alpha_2');
  });
  it('rejects unknown symbols', () => {
    expect(() => scalar('q*t', { vars: ['t'], numbers: N })).toThrow(/unknown symbol/);
  });
});

function sceneWith(defs: [string, string, Record<string, unknown>][]): Scene {
  const s = new Scene();
  s.addMany(defs.map(([name, type, params]) => ({ name, type, params: params as any, style: { color: '#000', visible: true, label: true } })));
  return s;
}

describe('Frenet apparatus (Theorem 2.4.3)', () => {
  it('unit-speed helix: κ = a/c², τ = b/c² (Example 2.3.3)', () => {
    const s = sceneWith([
      ['a', 'slider', { value: 2, min: 0, max: 5, step: 0.1 }],
      ['b', 'slider', { value: 1, min: -3, max: 3, step: 0.1 }],
      ['c', 'slider', { value: 'sqrt(a^2+b^2)', min: 0, max: 5, step: 0.1 }],
      ['beta', 'curve', { comps: '(a*cos(s/c), a*sin(s/c), b*s/c)', param: 's', a: '-10', b: '10', dim: 3 }],
    ]);
    const c = s.value('beta') as CurveValue;
    for (const t of [-3, 0.2, 4]) {
      const F = frenetAt(c, t);
      expect(F.kappa).toBeCloseTo(2 / 5, 8);
      expect(F.tau).toBeCloseTo(1 / 5, 8);
      expect(F.v).toBeCloseTo(1, 10);
    }
  });
  it('3-curve: κ = τ = 1/(3(1+t²)²) (Example 2.4.4)', () => {
    const s = sceneWith([['alpha', 'curve', { comps: '(3*t - t^3, 3*t^2, 3*t + t^3)', param: 't', a: '-1', b: '1', dim: 3 }]]);
    const c = s.value('alpha') as CurveValue;
    for (const t of [-0.7, 0, 0.5]) {
      const F = frenetAt(c, t);
      const k = 1 / (3 * (1 + t * t) ** 2);
      expect(F.kappa).toBeCloseTo(k, 9);
      expect(F.tau).toBeCloseTo(k, 9);
    }
  });
});

describe('differential forms (§1.5–1.6)', () => {
  const at = [0.4, -1.3, 0.8];
  it('d(df) = 0', () => {
    const f = form(0, [parse('x^2*sin(y)*z + exp(x*z)')]);
    expect(formAt(d(d(f)), at, N).every((x) => Math.abs(x) < 1e-9)).toBe(true);
  });
  it('d(dφ) = 0 for a 1-form', () => {
    const phi = form(1, [parse('x*y'), parse('z^2'), parse('sin(x*y*z)')]);
    expect(Math.abs(formAt(d(d(phi)), at, N)[0])).toBeLessThan(1e-9);
  });
  it('φ ∧ ψ = −ψ ∧ φ (Lemma 1.6.2) and Example 1.6.1 (1)', () => {
    const phi = form(1, [parse('x'), parse('-y'), parse('0')]);
    const psi = form(1, [parse('z'), parse('0'), parse('x')]);
    const a = formAt(wedge(phi, psi), at, N);
    const b = formAt(wedge(psi, phi), at, N);
    a.forEach((x, i) => expect(x).toBeCloseTo(-b[i]));
    // book: φ ∧ ψ = yz dx dy + x² dx dz − xy dy dz
    const [x, y, z] = at;
    expect(a[0]).toBeCloseTo(y * z);
    expect(a[1]).toBeCloseTo(x * x);
    expect(a[2]).toBeCloseTo(-x * y);
  });
  it('evaluates 1-forms on tangent vectors (Lemma 1.5.4)', () => {
    const phi = form(1, [parse('x'), parse('y^2'), parse('1')]);
    expect(evalOneForm(phi, [2, 3, 0], [1, 1, 1], N)).toBeCloseTo(2 + 9 + 1);
  });
});

describe('frame fields (§2.6–2.8)', () => {
  const frameField = (preset: string): FrameFieldValue => {
    const s = sceneWith([['E', 'frameField', { preset, box: 2, n: 3 }]]);
    return s.value('E') as FrameFieldValue;
  };
  it('cylindrical: ω12 = dϑ, ω13 = ω23 = 0', () => {
    const om = connectionForms(frameField('cylindrical').A);
    const p = [1.2, -0.7, 0.3];
    const [x, y] = p;
    const r2 = x * x + y * y;
    const w12 = formAt(om[0][1], p, N);
    expect(w12[0]).toBeCloseTo(-y / r2, 8);
    expect(w12[1]).toBeCloseTo(x / r2, 8);
    expect(w12[2]).toBeCloseTo(0, 8);
    expect(formAt(om[0][2], p, N).every((c) => Math.abs(c) < 1e-9)).toBe(true);
  });
  it('spherical: Cartan structural equations hold (Theorem 2.8.3)', () => {
    const F = frameField('spherical');
    const om = connectionForms(F.A);
    const th = dualForms(F.A);
    const p = [0.9, 0.4, -0.6];
    const sum = (fs: FormValue[]) => fs.map((f) => formAt(f, p, N)).reduce((a, b) => a.map((x, i) => x + b[i]));
    for (let i = 0; i < 3; i++) {
      const lhs = formAt(d(th[i]), p, N);
      const rhs = sum([0, 1, 2].map((j) => wedge(om[i][j], th[j])));
      lhs.forEach((x, k) => expect(x).toBeCloseTo(rhs[k], 7));
    }
    const lhs = formAt(d(om[0][1]), p, N);
    const rhs = sum([0, 1, 2].map((k) => wedge(om[0][k], om[k][1])));
    lhs.forEach((x, k) => expect(x).toBeCloseTo(rhs[k], 7));
  });
});

describe('scene graph', () => {
  it('recomputes dependents and renames references', () => {
    const s = sceneWith([
      ['a', 'slider', { value: 1, min: 0, max: 2, step: 0.1 }],
      ['p', 'point', { coords: '(a, 2*a, 0)' }],
      ['v', 'tangentVector', { v: '(1, 0, 0)', p: 'p' }],
    ]);
    expect((s.value('v') as any).p).toEqual([1, 2, 0]);
    s.setNumber('a', 'value', 3);
    expect((s.value('v') as any).p).toEqual([3, 6, 0]);
    s.rename('a', 'k');
    expect(s.get('p')!.data.params.coords).toBe('(k, 2*k, 0)');
    expect((s.value('v') as any).p).toEqual([3, 6, 0]);
    expect(s.remove('k')).toEqual(['k', 'p', 'v']);
  });
  it('reports errors without throwing', () => {
    const s = sceneWith([['p', 'point', { coords: '(q, 1, 1)' }]]);
    expect(s.get('p')!.error).toMatch(/unknown symbol/);
  });
});
