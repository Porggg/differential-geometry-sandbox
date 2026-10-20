// Small vector / matrix toolkit. Vectors are plain number arrays (length 2 or 3).

export type Vec = number[];
export type Mat = number[][];

export const add = (a: Vec, b: Vec): Vec => a.map((x, i) => x + b[i]);
export const sub = (a: Vec, b: Vec): Vec => a.map((x, i) => x - b[i]);
export const scale = (a: Vec, s: number): Vec => a.map((x) => x * s);
export const dot = (a: Vec, b: Vec): number => a.reduce((s, x, i) => s + x * b[i], 0);
export const norm = (a: Vec): number => Math.sqrt(dot(a, a));
export const dist = (a: Vec, b: Vec): number => norm(sub(a, b));
export const neg = (a: Vec): Vec => a.map((x) => -x);

export function cross(a: Vec, b: Vec): Vec {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

export function normalize(a: Vec): Vec {
  const n = norm(a);
  if (n < 1e-14) throw new Error('cannot normalize the zero vector');
  return scale(a, 1 / n);
}

export const triple = (a: Vec, b: Vec, c: Vec): number => dot(a, cross(b, c));

/** Linear combination Σ c_i v_i. */
export function lincomb(cs: number[], vs: Vec[]): Vec {
  const out = new Array(vs[0].length).fill(0);
  cs.forEach((c, i) => vs[i].forEach((x, j) => (out[j] += c * x)));
  return out;
}

export const identity = (n = 3): Mat =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));

export const transpose = (m: Mat): Mat => m[0].map((_, j) => m.map((row) => row[j]));

export function matmul(a: Mat, b: Mat): Mat {
  return a.map((row) => b[0].map((_, j) => row.reduce((s, x, k) => s + x * b[k][j], 0)));
}

export const matvec = (m: Mat, v: Vec): Vec => m.map((row) => dot(row, v));

export function det3(m: Mat): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

export function det(m: Mat): number {
  if (m.length === 1) return m[0][0];
  if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  if (m.length === 3) return det3(m);
  throw new Error('det: unsupported size');
}

/** Max |a_ij - b_ij|. */
export const matDiff = (a: Mat, b: Mat): number =>
  Math.max(...a.map((row, i) => Math.max(...row.map((x, j) => Math.abs(x - b[i][j])))));

export const vecDiff = (a: Vec, b: Vec): number => Math.max(...a.map((x, i) => Math.abs(x - b[i])));

/** Rotation matrix about a unit axis by angle (Rodrigues). */
export function rotationMatrix(axis: Vec, angle: number): Mat {
  const [x, y, z] = normalize(axis);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const k = 1 - c;
  return [
    [c + x * x * k, x * y * k - z * s, x * z * k + y * s],
    [y * x * k + z * s, c + y * y * k, y * z * k - x * s],
    [z * x * k - y * s, z * y * k + x * s, c + z * z * k],
  ];
}

/** Reflection in the plane through 0 orthogonal to n. */
export function reflectionMatrix(n: Vec): Mat {
  const u = normalize(n);
  return identity(3).map((row, i) => row.map((x, j) => x - 2 * u[i] * u[j]));
}

export const isFiniteVec = (v: Vec): boolean => v.every((x) => Number.isFinite(x));

/** Format a number for display: up to `digits` decimals, trimmed. */
export function fmt(x: number, digits = 4): string {
  if (!Number.isFinite(x)) return x > 0 ? '\\infty' : x < 0 ? '-\\infty' : '\\text{undef}';
  if (Math.abs(x) < 0.5 * Math.pow(10, -digits)) return '0';
  const s = x.toFixed(digits);
  return s.replace(/\.?0+$/, '');
}

export const fmtVec = (v: Vec, digits = 3): string => `(${v.map((x) => fmt(x, digits)).join(', ')})`;
