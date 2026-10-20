// Notions defined in the running text (not numbered in the book).

import type { Entry } from './types';

export const NOTIONS: Partial<Entry>[] = [
  {
    id: 'n.curvature',
    statement:
      'Let $\\beta\\colon I \\to \\mathbf{R}^3$ be a **unit-speed** curve, $\\lVert \\beta\'(s) \\rVert = 1$.\n\n' +
      '- $T = \\beta\'$ is the **unit tangent** vector field on $\\beta$. Since $T \\bullet T = 1$, differentiating gives $2T\' \\bullet T = 0$: the **curvature vector field** $T\'$ is always normal to $\\beta$.\n' +
      '- The **curvature function** is $\\kappa(s) = \\lVert T\'(s) \\rVert \\ge 0$; the larger $\\kappa$, the sharper $\\beta$ turns.\n' +
      '- Assuming $\\kappa > 0$, the **principal normal** is $N = T\'/\\kappa$ (the direction in which $\\beta$ turns), and the **binormal** is $B = T \\times N$.\n' +
      '- $B\'$ is a multiple of $N$ (by orthonormal expansion: $B\' \\bullet B = 0$ and $B\' \\bullet T = -B \\bullet T\' = -B \\bullet \\kappa N = 0$). The **torsion** $\\tau$ is the function with $B\' = -\\tau N$ (the minus sign is traditional). Unlike $\\kappa$, it can take any sign.\n\n' +
      '$T, N, B, \\kappa, \\tau$ together form the **Frenet apparatus** of $\\beta$; for an arbitrary regular curve it is defined through a unit-speed reparametrization (§2.4).',
    notes:
      'By [[2.3.1]], $T, N, B$ is a frame at each point — the **Frenet frame field** — which, unlike $U_1, U_2, U_3$, is full of information about the curve. ' +
      'The Frenet formulas ([[2.3.2]]) express $T\', N\', B\'$ in terms of $T, N, B$.',
    tryThis: ['Use the **Frenet frame** tool on any curve in R³ and animate its parameter.'],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('t0', 0.6, -3, 3, 0.01);
        b.add('curve', 'beta', { comps: '(cos(t), sin(t), t^2/4)', param: 't', a: '-3', b: '3', ticks: 0, dim: 3 });
        b.add('frenetFrame', 'TNB', { curve: 'beta', t0: 't0', along: false, n: 12 });
        b.add('curvaturePlot', 'plot', { curve: 'beta', kappa: true, tau: true, speed: true, ratio: false, marker: 't0' });
      },
      select: 'TNB',
    },
  },
];
