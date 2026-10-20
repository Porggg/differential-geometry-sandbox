// Level sets: marching tetrahedra (surfaces f = c in R^3) and marching squares (curves f = c in R^2).

export interface Mesh {
  positions: Float32Array;
}

// Cube corners and a decomposition of the cube into 6 tetrahedra sharing the diagonal 0–6.
const CORNERS = [
  [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
  [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
];
const TETS = [
  [0, 5, 1, 6], [0, 1, 2, 6], [0, 2, 3, 6], [0, 3, 7, 6], [0, 7, 4, 6], [0, 4, 5, 6],
];

/**
 * Triangulate { f = level } inside the box [-R, R]^3 (or custom bounds) with `res` cells per axis.
 */
export function isosurface(
  f: (x: number, y: number, z: number) => number,
  level: number,
  bounds: [number, number],
  res: number,
): Mesh {
  const [lo, hi] = bounds;
  const n = res;
  const h = (hi - lo) / n;
  const N = n + 1;
  const vals = new Float64Array(N * N * N);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      for (let k = 0; k < N; k++) {
        const v = f(lo + i * h, lo + j * h, lo + k * h) - level;
        vals[(i * N + j) * N + k] = Number.isFinite(v) ? v : NaN;
      }
  const out: number[] = [];
  const p = [0, 0, 0, 0].map(() => [0, 0, 0]);
  const v = [0, 0, 0, 0];
  const lerp = (a: number, b: number): number[] => {
    const t = v[a] / (v[a] - v[b]);
    return [p[a][0] + t * (p[b][0] - p[a][0]), p[a][1] + t * (p[b][1] - p[a][1]), p[a][2] + t * (p[b][2] - p[a][2])];
  };
  const tri = (a: number[], b: number[], c: number[]) => out.push(...a, ...b, ...c);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < n; k++) {
        for (const tet of TETS) {
          let mask = 0;
          let bad = false;
          for (let q = 0; q < 4; q++) {
            const c = CORNERS[tet[q]];
            const ii = i + c[0];
            const jj = j + c[1];
            const kk = k + c[2];
            const val = vals[(ii * N + jj) * N + kk];
            if (Number.isNaN(val)) bad = true;
            v[q] = val;
            p[q][0] = lo + ii * h;
            p[q][1] = lo + jj * h;
            p[q][2] = lo + kk * h;
            if (val < 0) mask |= 1 << q;
          }
          if (bad || mask === 0 || mask === 15) continue;
          // number of negative corners
          const neg = [0, 1, 2, 3].filter((q) => mask & (1 << q));
          const pos = [0, 1, 2, 3].filter((q) => !(mask & (1 << q)));
          if (neg.length === 1 || neg.length === 3) {
            const [a] = neg.length === 1 ? neg : pos;
            const others = neg.length === 1 ? pos : neg;
            tri(lerp(a, others[0]), lerp(a, others[1]), lerp(a, others[2]));
          } else {
            const [a, b] = neg;
            const [c, d] = pos;
            const p1 = lerp(a, c);
            const p2 = lerp(a, d);
            const p3 = lerp(b, d);
            const p4 = lerp(b, c);
            tri(p1, p2, p3);
            tri(p1, p3, p4);
          }
        }
      }
  return { positions: new Float32Array(out) };
}

/** Level curve segments of f(x, y) = level in [lo, hi]^2. Returns flat [x1,y1,x2,y2,...]. */
export function contour(
  f: (x: number, y: number) => number,
  level: number,
  bounds: [number, number, number, number],
  res: number,
): number[] {
  const [x0, x1, y0, y1] = bounds;
  const hx = (x1 - x0) / res;
  const hy = (y1 - y0) / res;
  const N = res + 1;
  const vals = new Float64Array(N * N);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) vals[i * N + j] = f(x0 + i * hx, y0 + j * hy) - level;
  const segs: number[] = [];
  for (let i = 0; i < res; i++)
    for (let j = 0; j < res; j++) {
      const c = [
        [i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1],
      ];
      const v = c.map(([a, b]) => vals[a * N + b]);
      if (v.some((x) => !Number.isFinite(x))) continue;
      const pts: number[][] = [];
      for (let e = 0; e < 4; e++) {
        const a = e;
        const b = (e + 1) % 4;
        if (v[a] < 0 !== v[b] < 0) {
          const t = v[a] / (v[a] - v[b]);
          pts.push([
            x0 + (c[a][0] + t * (c[b][0] - c[a][0])) * hx,
            y0 + (c[a][1] + t * (c[b][1] - c[a][1])) * hy,
          ]);
        }
      }
      if (pts.length === 2) segs.push(...pts[0], ...pts[1]);
      else if (pts.length === 4) segs.push(...pts[0], ...pts[1], ...pts[2], ...pts[3]);
    }
  return segs;
}
