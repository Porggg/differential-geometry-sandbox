// Numerical helpers: differentiation, integration, arc-length tables, root finding.

import type { Vec } from './vec';

/** Central difference derivative of a vector-valued function. */
export function diffVec(f: (t: number) => Vec, t: number, h = 1e-4): Vec {
  const a = f(t + h);
  const b = f(t - h);
  return a.map((x, i) => (x - b[i]) / (2 * h));
}

export function diffScalar(f: (t: number) => number, t: number, h = 1e-5): number {
  return (f(t + h) - f(t - h)) / (2 * h);
}

/** Composite Simpson rule. */
export function integrate(f: (t: number) => number, a: number, b: number, n = 400): number {
  if (a === b) return 0;
  if (n % 2) n++;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}

/** Cumulative integral table of f over [a, b] with n steps (trapezoid on a fine grid + Simpson pairs). */
export function cumulative(f: (t: number) => number, a: number, b: number, n = 2000): { t: number[]; s: number[] } {
  const ts: number[] = [];
  const ss: number[] = [];
  const h = (b - a) / n;
  let acc = 0;
  let prev = f(a);
  ts.push(a);
  ss.push(0);
  for (let i = 1; i <= n; i++) {
    const t = a + i * h;
    const mid = f(t - h / 2);
    const cur = f(t);
    acc += (h / 6) * (prev + 4 * mid + cur);
    ts.push(t);
    ss.push(acc);
    prev = cur;
  }
  return { t: ts, s: ss };
}

/** Linear interpolation of y over a monotone x table. */
export function interp(xs: number[], ys: number[], x: number): number {
  const n = xs.length;
  if (x <= xs[0]) return ys[0] + ((ys[1] - ys[0]) / (xs[1] - xs[0])) * (x - xs[0]);
  if (x >= xs[n - 1]) return ys[n - 1] + ((ys[n - 1] - ys[n - 2]) / (xs[n - 1] - xs[n - 2])) * (x - xs[n - 1]);
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  const u = (x - xs[lo]) / (xs[hi] - xs[lo]);
  return ys[lo] + u * (ys[hi] - ys[lo]);
}

/** Sample t ↦ f(t) on [a, b], returning max |f|. */
export function maxAbsOn(f: (t: number) => number, a: number, b: number, n = 200): number {
  let m = 0;
  for (let i = 0; i <= n; i++) {
    const v = Math.abs(f(a + ((b - a) * i) / n));
    if (Number.isFinite(v)) m = Math.max(m, v);
    else return Infinity;
  }
  return m;
}

export function linspace(a: number, b: number, n: number): number[] {
  if (n <= 1) return [a];
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}
