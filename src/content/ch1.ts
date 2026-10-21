// Chapter 1 — Calculus on Euclidean Space. (1.2.1, 1.4.2 and 1.5.6 are in entries.ts.)
// Wording is ours; structure, notation and numbering follow O'Neill.

import type { Entry } from './types';
import { formAt, negForm, zeroForm } from '../math/forms';

const negate = negForm;
const zero2 = zeroForm(2);
import { curve, diff, dirDerivDef, dirDerivFormula, fn, fnDiff, form, formDiff, md, num, point, vec } from './helpers';

export const CH1: Partial<Entry>[] = [
  // ===========================================================================================
  // §1.1 Euclidean Space
  {
    id: '1.1.1',
    statement: md`**Euclidean 3-space** $\mathbf{R}^3$ is the set of all ordered triples of real numbers. Such a triple $\mathbf{p} = (p_1, p_2, p_3)$ is called a **point** of $\mathbf{R}^3$.`,
    notes: md`Instead of saying that three numbers *describe the position* of a point, the definition says that they *are* the point.

$\mathbf{R}^3$ is naturally a vector space over the real numbers: for points $\mathbf{p} = (p_1, p_2, p_3)$ and $\mathbf{q} = (q_1, q_2, q_3)$ and a number $a$,
$$\mathbf{p} + \mathbf{q} = (p_1 + q_1,\ p_2 + q_2,\ p_3 + q_3), \qquad a\mathbf{p} = (ap_1,\ ap_2,\ ap_3).$$
These operations satisfy the axioms of a vector space. The point $\mathbf{0} = (0, 0, 0)$ is the **origin** of $\mathbf{R}^3$.

Nothing is special about the number 3: **Euclidean $n$-space** $\mathbf{R}^n$ consists of the $n$-tuples $(p_1, \dots, p_n)$, and the results of Chapter 1 hold in any dimension — in particular in the **Euclidean plane** $\mathbf{R}^2$, shown in the 2D view.`,
    tryThis: [
      md`Drag $\mathbf{p}$ or $\mathbf{q}$ with the **Move** tool (in either view): the sum $\mathbf{p} + \mathbf{q}$ follows.`,
      md`Move the slider $a$: the point $a\mathbf{p}$ slides along the line through $\mathbf{0}$ and $\mathbf{p}$ (negative $a$ reverses it).`,
    ],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('a', 1.5, -2, 2, 0.01);
        b.add('point', 'o', { coords: '(0, 0, 0)' }, { color: '#24292f', caption: '\\mathbf{0}' });
        b.add('point', 'p', { coords: '(1, 2, 1)' });
        b.add('point', 'q', { coords: '(2, -1, 1.5)' }, { color: '#8250df' });
        b.add('combination', 'pq', { expr: 'p + q' }, { caption: '\\mathbf{p}+\\mathbf{q}' });
        b.add('combination', 'ap', { expr: 'a*p' }, { color: '#bf8700', caption: 'a\\mathbf{p}' });
        b.add('point', 'p2', { coords: '(1, 2)' }, { caption: '\\mathbf{p}' });
        b.add('point', 'q2', { coords: '(2, -1)' }, { color: '#8250df', caption: '\\mathbf{q}' });
        b.add('combination', 'pq2', { expr: 'p2 + q2' }, { caption: '\\mathbf{p}+\\mathbf{q}' });
        b.add('combination', 'ap2', { expr: 'a*p2' }, { color: '#bf8700', caption: 'a\\mathbf{p}' });
      },
      select: 'pq',
    },
  },
  {
    id: '1.1.2',
    statement: md`Let $x$, $y$ and $z$ be the real-valued functions on $\mathbf{R}^3$ such that, for each point $\mathbf{p} = (p_1, p_2, p_3)$,
$$x(\mathbf{p}) = p_1, \qquad y(\mathbf{p}) = p_2, \qquad z(\mathbf{p}) = p_3.$$
They are called the **natural coordinate functions** of $\mathbf{R}^3$. In index notation one writes $x_1 = x$, $x_2 = y$, $x_3 = z$.`,
    notes: md`So the value of the function $x_i$ at $\mathbf{p}$ is the number $p_i$, and every point satisfies the identity
$$\mathbf{p} = (p_1, p_2, p_3) = (x_1(\mathbf{p}), x_2(\mathbf{p}), x_3(\mathbf{p})).$$
The book insists on the difference between the *numbers* $p_1, p_2, p_3$ and the *functions* $x_1, x_2, x_3$: confusing them is harmless on the real line but leads to real ambiguities in higher dimensions. It is the same distinction as between a function $f$ and its value $f(\mathbf{p})$.

In the sandbox, the coordinate functions can be applied to any point in an expression: \`x(p)\`, \`y(p)\`, \`z(p)\` (or \`x1(p)\`, …). The three numbers of the figure are defined that way.`,
    tryThis: [md`Drag $\mathbf{p}$: the three numbers $x(\mathbf{p}), y(\mathbf{p}), z(\mathbf{p})$ in the Algebra view follow.`, md`Create a point with coordinates \`(x(p), y(p), 0)\`: it is the projection of $\mathbf{p}$ on the $xy$ plane.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(1.5, 2, 1)' });
        b.add('slider', 'xp', { value: 'x(p)', min: -5, max: 5, step: 0.01 }, { caption: 'x(\\mathbf{p})' });
        b.add('slider', 'yp', { value: 'y(p)', min: -5, max: 5, step: 0.01 }, { caption: 'y(\\mathbf{p})' });
        b.add('slider', 'zp', { value: 'z(p)', min: -5, max: 5, step: 0.01 }, { caption: 'z(\\mathbf{p})' });
        b.add('point', 'p0', { coords: '(x(p), y(p), 0)' }, { color: '#8c959f', caption: '(x(\\mathbf{p}), y(\\mathbf{p}), 0)' });
      },
      select: 'p',
    },
    checks: [{ label: md`\lVert (x(\mathbf{p}), y(\mathbf{p}), z(\mathbf{p})) - \mathbf{p} \rVert`, value: (s) => diff([num(s, 'xp'), num(s, 'yp'), num(s, 'zp')], point(s, 'p')) }],
  },
  {
    id: '1.1.3',
    statement: md`A real-valued function $f$ on $\mathbf{R}^3$ is **differentiable** (or infinitely differentiable, or smooth, or of class $C^\infty$) provided all partial derivatives of $f$, of all orders, exist and are continuous.`,
    notes: md`Differentiable functions are added and multiplied pointwise, and the results are again differentiable:
$$(f + g)(\mathbf{p}) = f(\mathbf{p}) + g(\mathbf{p}), \qquad (fg)(\mathbf{p}) = f(\mathbf{p})\,g(\mathbf{p}).$$
**Convention.** From now on "function" means "real-valued function", and functions are assumed differentiable unless the question is explicitly raised.

Differentiation is a *local* operation: to compute $\partial f/\partial x$ at $\mathbf{p}$ one only needs $f$ near $\mathbf{p}$. So $f$ may be defined only on an **open set** $\mathcal{O}$ of $\mathbf{R}^3$ (a set containing, with each of its points, all points sufficiently near it). For example $yz\log x$ is differentiable on the open set $\{p_1 > 0\}$. The results of this chapter remain valid on open sets, and in $\mathbf{R}^n$ for any $n$.

The figure uses the functions $f = x^2y$ and $g = y\sin z$ of Exercise 1. A function on $\mathbf{R}^3$ cannot be graphed in 3D; it is drawn through a **level surface** $f = c$ (one value $c$, adjustable). The Course view of $f$ lists its partial derivatives.`,
    tryThis: [md`Drag $\mathbf{p}$ and compare $(fg)(\mathbf{p})$ with $f(\mathbf{p})\,g(\mathbf{p})$ in the Algebra view.`, md`Move the slider $c$: the level surface $x^2y = c$ changes.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('c', 1, -3, 3, 0.01);
        b.add('function', 'f', { expr: 'x^2*y', levels: 'c', box: 2.5, res: 40, dim: 3 }, { color: '#2da44e' });
        b.add('function', 'g', { expr: 'y*sin(z)', levels: '', box: 2.5, res: 30, dim: 3 });
        b.add('function', 'fg', { expr: 'f*g', levels: '', box: 2.5, res: 30, dim: 3 }, { caption: 'fg' });
        b.add('point', 'p', { coords: '(1, 1.5, 0.5)' });
        b.add('slider', 'fp', { value: 'f(x(p), y(p), z(p))', min: -10, max: 10, step: 0.01 }, { caption: 'f(\\mathbf{p})' });
        b.add('slider', 'gp', { value: 'g(x(p), y(p), z(p))', min: -10, max: 10, step: 0.01 }, { caption: 'g(\\mathbf{p})' });
        b.add('slider', 'fgp', { value: 'fg(x(p), y(p), z(p))', min: -10, max: 10, step: 0.01 }, { caption: '(fg)(\\mathbf{p})' });
      },
      select: 'f',
    },
    checks: [{ label: md`(fg)(\mathbf{p}) - f(\mathbf{p})\,g(\mathbf{p})`, value: (s) => num(s, 'fgp') - num(s, 'fp') * num(s, 'gp') }],
  },

  // ===========================================================================================
  // §1.2 Tangent Vectors
  {
    id: '1.2.2',
    statement: md`Let $\mathbf{p}$ be a point of $\mathbf{R}^3$. The set $T_\mathbf{p}(\mathbf{R}^3)$ of all tangent vectors that have $\mathbf{p}$ as point of application is called the **tangent space** of $\mathbf{R}^3$ at $\mathbf{p}$.`,
    notes: md`$\mathbf{R}^3$ has a *different* tangent space at each of its points (Fig. 1.3).

All tangent vectors in $T_\mathbf{p}(\mathbf{R}^3)$ have the same point of application, so the vector operations of $\mathbf{R}^3$ can be borrowed:
$$\mathbf{v}_\mathbf{p} + \mathbf{w}_\mathbf{p} = (\mathbf{v} + \mathbf{w})_\mathbf{p}, \qquad c(\mathbf{v}_\mathbf{p}) = (c\mathbf{v})_\mathbf{p}.$$
This is the usual **parallelogram law**, and multiplying by $c$ stretches the arrow by the factor $c$, reversing it if $c < 0$ (Fig. 1.4). With these operations $T_\mathbf{p}(\mathbf{R}^3)$ is a vector space, and $\mathbf{v} \mapsto \mathbf{v}_\mathbf{p}$ is a linear isomorphism from $\mathbf{R}^3$ onto $T_\mathbf{p}(\mathbf{R}^3)$.

Tangent vectors at different points are *not* added (the sandbox refuses $\mathbf{v}_\mathbf{p} + \mathbf{w}_\mathbf{q}$ when $\mathbf{p} \ne \mathbf{q}$).`,
    tryThis: [md`Edit $\mathbf{v}$ or $\mathbf{w}$: the sum stays the diagonal of the parallelogram.`, md`Move the slider $c$ through negative values: $c\,\mathbf{u}_\mathbf{p}$ flips.`],
    scene: {
      views: ['2d', '3d'],
      build: (b) => {
        b.slider('c', 2, -2, 3, 0.01);
        b.add('point', 'p', { coords: '(0.5, 0.5)' });
        b.add('tangentVector', 'v', { v: '(2, 0.3)', p: 'p' }, { color: '#cf222e', caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('tangentVector', 'w', { v: '(1, 2)', p: 'p' }, { color: '#0969da', caption: '\\mathbf{w}_\\mathbf{p}' });
        b.add('combination', 'vw', { expr: 'v + w' }, { color: '#1a7f37', caption: '\\mathbf{v}_\\mathbf{p}+\\mathbf{w}_\\mathbf{p}' });
        b.add('tangentVector', 'u', { v: '(0.6, -0.6)', p: 'p' }, { color: '#57606a', caption: '\\mathbf{u}_\\mathbf{p}' });
        b.add('combination', 'cu', { expr: 'c*u' }, { color: '#bf8700', caption: 'c\\,\\mathbf{u}_\\mathbf{p}' });
        b.add('point', 'p3', { coords: '(1, 1, 1)' }, { caption: '\\mathbf{p}' });
        b.add('tangentVector', 'v3', { v: '(2, 0, 0.5)', p: 'p3' }, { color: '#cf222e', caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('tangentVector', 'w3', { v: '(0, 2, 1)', p: 'p3' }, { color: '#0969da', caption: '\\mathbf{w}_\\mathbf{p}' });
        b.add('combination', 'vw3', { expr: 'v3 + w3' }, { color: '#1a7f37', caption: '\\mathbf{v}_\\mathbf{p}+\\mathbf{w}_\\mathbf{p}' });
      },
      select: 'vw',
    },
    checks: [{ label: md`(\mathbf{v}_\mathbf{p} + \mathbf{w}_\mathbf{p}) - (\mathbf{v} + \mathbf{w})_\mathbf{p}`, value: (s) => diff(vec(s, 'vw').v, vec(s, 'v').v.map((x, i) => x + vec(s, 'w').v[i])) }],
  },
  {
    id: '1.2.3',
    statement: md`A **vector field** $V$ on $\mathbf{R}^3$ is a function that assigns to each point $\mathbf{p}$ of $\mathbf{R}^3$ a tangent vector $V(\mathbf{p})$ to $\mathbf{R}^3$ at $\mathbf{p}$.`,
    notes: md`Roughly speaking, a vector field is a big collection of arrows, one at each point — like a force field in physics (the gravitational field of the earth assigns to each point a force directed at the center of the earth).

Vector fields are combined by the **pointwise principle**: an operation that can be performed on the *values* at each point extends to the fields themselves. So
$$(V + W)(\mathbf{p}) = V(\mathbf{p}) + W(\mathbf{p}), \qquad (fV)(\mathbf{p}) = f(\mathbf{p})\,V(\mathbf{p})$$
for a function $f$ (the values lie in the same tangent space $T_\mathbf{p}(\mathbf{R}^3)$, where they can be added).

The figure shows the field $V$ whose value at each point is the unit vector pointing to the origin (a "central force" field), sampled at a grid of points, and its value $V(\mathbf{p})$ at one point; the 2D view shows the same in the plane.`,
    tryThis: [md`Drag $\mathbf{p}$: $V(\mathbf{p})$ always points to the origin.`, md`Edit $V$ in the Algebra view, e.g. $(-y, x, 0)$ (a rotation field).`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('vectorField', 'V', { comps: '(-x, -y, -z)/sqrt(x^2+y^2+z^2)', box: 2, n: 5, scale: 0.4, dim: 3 });
        b.add('point', 'p', { coords: '(1.5, 1, 1)' });
        b.add('fieldAt', 'Vp', { V: 'V', p: 'p' }, { color: '#cf222e' });
        b.add('vectorField', 'V2', { comps: '(-x, -y)/sqrt(x^2+y^2)', box: 2, n: 9, scale: 0.3, dim: 2 }, { caption: 'V' });
        b.add('point', 'p2', { coords: '(1.5, 1)' }, { caption: '\\mathbf{p}' });
        b.add('fieldAt', 'V2p', { V: 'V2', p: 'p2' }, { color: '#cf222e', caption: 'V(\\mathbf{p})' });
      },
      select: 'V',
    },
  },
  {
    id: '1.2.4',
    statement: md`Let $U_1$, $U_2$, $U_3$ be the vector fields on $\mathbf{R}^3$ such that, for each point $\mathbf{p}$,
$$U_1(\mathbf{p}) = (1, 0, 0)_\mathbf{p}, \qquad U_2(\mathbf{p}) = (0, 1, 0)_\mathbf{p}, \qquad U_3(\mathbf{p}) = (0, 0, 1)_\mathbf{p}.$$
Collectively, $U_1, U_2, U_3$ is called the **natural frame field** on $\mathbf{R}^3$.`,
    notes: md`$U_i$ is the unit vector field in the positive $x_i$ direction (Fig. 1.5). These three fields serve as a "basis" for all vector fields ([[1.2.5]]).

The figure draws $U_1$ (red), $U_2$ (green), $U_3$ (blue) at a grid of points, and the frame $U_1(\mathbf{p}), U_2(\mathbf{p}), U_3(\mathbf{p})$ at the movable point $\mathbf{p}$.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frameField', 'U', { preset: 'natural', box: 2, n: 3 }, { caption: 'U_i' });
        b.add('point', 'p', { coords: '(1, 1.5, 1)' });
        b.add('naturalFrame', 'Up', { p: 'p' });
      },
      select: 'Up',
    },
  },
  {
    id: '1.2.5',
    statement: md`If $V$ is a vector field on $\mathbf{R}^3$, there are three uniquely determined real-valued functions $v_1, v_2, v_3$ on $\mathbf{R}^3$ such that
$$V = v_1U_1 + v_2U_2 + v_3U_3.$$
The functions $v_1, v_2, v_3$ are called the **Euclidean coordinate functions** of $V$.`,
    proof: md`By definition, $V$ assigns to each point $\mathbf{p}$ a tangent vector $V(\mathbf{p})$ at $\mathbf{p}$. Its vector part depends on $\mathbf{p}$, so we write it $(v_1(\mathbf{p}), v_2(\mathbf{p}), v_3(\mathbf{p}))$ — this *defines* $v_1, v_2, v_3$ as real-valued functions on $\mathbf{R}^3$. Then

$$\begin{aligned} V(\mathbf{p}) &= (v_1(\mathbf{p}), v_2(\mathbf{p}), v_3(\mathbf{p}))_\mathbf{p} \\ &= v_1(\mathbf{p})(1, 0, 0)_\mathbf{p} + v_2(\mathbf{p})(0, 1, 0)_\mathbf{p} + v_3(\mathbf{p})(0, 0, 1)_\mathbf{p} \\ &= v_1(\mathbf{p})U_1(\mathbf{p}) + v_2(\mathbf{p})U_2(\mathbf{p}) + v_3(\mathbf{p})U_3(\mathbf{p}) \end{aligned}$$

for every point $\mathbf{p}$ (Fig. 1.6). By the pointwise principle, this says that the vector fields $V$ and $\sum v_iU_i$ have the same value at each point; hence $V = \sum v_iU_i$. $\quad ∎$`,
    notes: md`Conventions used from now on: $\sum v_iU_i$ means the sum over $i = 1, 2, 3$, and the identity $(a_1, a_2, a_3)_\mathbf{p} = \sum a_iU_i(\mathbf{p})$ will be used constantly.

Computations with vector fields are done on the Euclidean coordinate functions:
$$\sum v_iU_i + \sum w_iU_i = \sum (v_i + w_i)U_i, \qquad f\left(\sum v_iU_i\right) = \sum (fv_i)U_i.$$
A vector field is **differentiable** when its Euclidean coordinate functions are; "vector field" means differentiable vector field from now on.

In the figure (Fig. 1.6), $V(\mathbf{p})$ is decomposed into $v_1(\mathbf{p})U_1(\mathbf{p})$, $v_2(\mathbf{p})U_2(\mathbf{p})$, $v_3(\mathbf{p})U_3(\mathbf{p})$ (dashed).`,
    tryThis: [md`Drag $\mathbf{p}$ and watch the three components change: they are the values of $v_1 = xy$, $v_2 = z$, $v_3 = -x$ at $\mathbf{p}$.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('vectorField', 'V', { comps: '(x*y, z, -x)', box: 2, n: 4, scale: 0.25, dim: 3 }, { visible: false });
        b.add('point', 'p', { coords: '(1, 1.5, 1)' });
        b.add('fieldAt', 'Vp', { V: 'V', p: 'p' }, { color: '#cf222e' });
        b.add('naturalFrame', 'Up', { p: 'p' }, { visible: false });
        b.add('orthonormalExpansion', 'comp', { v: 'Vp', frame: 'Up' }, { caption: 'v_i(\\mathbf{p})U_i(\\mathbf{p})' });
      },
      select: 'comp',
    },
    checks: [
      {
        label: md`V(\mathbf{p}) - \left(v_1(\mathbf{p}), v_2(\mathbf{p}), v_3(\mathbf{p})\right)_\mathbf{p}`,
        value: (s) => {
          const p = point(s, 'p');
          return diff(vec(s, 'Vp').v, [p[0] * p[1], p[2], -p[0]]);
        },
      },
    ],
  },

  // ===========================================================================================
  // §1.3 Directional Derivatives
  {
    id: '1.3.1',
    statement: md`Let $f$ be a differentiable real-valued function on $\mathbf{R}^3$, and let $\mathbf{v}_\mathbf{p}$ be a tangent vector to $\mathbf{R}^3$. Then the number
$$\mathbf{v}_\mathbf{p}[f] = \frac{d}{dt}\big(f(\mathbf{p} + t\mathbf{v})\big)\Big|_{t=0}$$
is called the **derivative of $f$ with respect to $\mathbf{v}_\mathbf{p}$**.`,
    notes: md`Each tangent vector $\mathbf{v}_\mathbf{p}$ determines the straight line $t \mapsto \mathbf{p} + t\mathbf{v}$, and $t \mapsto f(\mathbf{p} + t\mathbf{v})$ is an ordinary function on the real line; its derivative at $t = 0$ is the initial rate of change of $f$ as $\mathbf{p}$ moves in the $\mathbf{v}$ direction. Elementary calculus requires $\mathbf{v}$ to be a unit vector; the book does not, but still calls $\mathbf{v}_\mathbf{p}[f]$ a **directional derivative**.

**The book's example.** $f = x^2yz$, $\mathbf{p} = (1, 1, 0)$, $\mathbf{v} = (1, 0, -3)$. The line is $\mathbf{p} + t\mathbf{v} = (1 + t, 1, -3t)$ and
$$f(\mathbf{p} + t\mathbf{v}) = (1 + t)^2 \cdot 1 \cdot (-3t) = -3t - 6t^2 - 3t^3, \qquad \frac{d}{dt}\big(f(\mathbf{p} + t\mathbf{v})\big) = -3 - 12t - 9t^2,$$
so $\mathbf{v}_\mathbf{p}[f] = -3$: $f$ is initially decreasing as $\mathbf{p}$ moves in the $\mathbf{v}$ direction.

The 3D view shows $\mathbf{p}$, $\mathbf{v}_\mathbf{p}$ and the line; the 2D view graphs $t \mapsto f(\mathbf{p} + t\mathbf{v})$ with its tangent line at $t = 0$, whose slope is $\mathbf{v}_\mathbf{p}[f]$.`,
    tryThis: [md`Edit $\mathbf{v}$ (e.g. double it): the slope doubles — $\mathbf{v}_\mathbf{p}[f]$ is linear in $\mathbf{v}_\mathbf{p}$ ([[1.3.3]]).`, md`Drag $\mathbf{p}$ and watch the graph and its slope change.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('function', 'f', { expr: 'x^2*y*z', levels: '', box: 2, res: 30, dim: 3 });
        b.add('point', 'p', { coords: '(1, 1, 0)' });
        b.add('tangentVector', 'v', { v: '(1, 0, -3)', p: 'p' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('straightLine', 'ell', { p: 'p', q: 'v', a: '-0.8', b: '0.8', dim: 3 }, { caption: '\\mathbf{p} + t\\mathbf{v}', color: '#8c959f' });
        b.add('directionalDerivative', 'Dvf', { v: 'v', f: 'f' });
        b.add('lineRestriction', 'g', { f: 'f', v: 'v', a: '-1.5', b: '1' });
      },
      select: 'Dvf',
    },
    checks: [
      { label: md`\mathbf{v}_\mathbf{p}[f] - \frac{d}{dt}f(\mathbf{p}+t\mathbf{v})\big|_0 \text{ (numerical)}`, value: (s) => num(s, 'Dvf') - dirDerivDef(fn(s, 'f'), vec(s, 'v').p, vec(s, 'v').v) },
    ],
  },
  {
    id: '1.3.2',
    statement: md`If $\mathbf{v}_\mathbf{p} = (v_1, v_2, v_3)_\mathbf{p}$ is a tangent vector to $\mathbf{R}^3$, then
$$\mathbf{v}_\mathbf{p}[f] = \sum v_i \frac{\partial f}{\partial x_i}(\mathbf{p}).$$`,
    proof: md`Let $\mathbf{p} = (p_1, p_2, p_3)$; then $\mathbf{p} + t\mathbf{v} = (p_1 + tv_1,\ p_2 + tv_2,\ p_3 + tv_3)$. We use the chain rule to differentiate, at $t = 0$, the function
$$f(\mathbf{p} + t\mathbf{v}) = f(p_1 + tv_1,\ p_2 + tv_2,\ p_3 + tv_3).$$
Since $\dfrac{d}{dt}(p_i + tv_i) = v_i$, we obtain
$$\mathbf{v}_\mathbf{p}[f] = \frac{d}{dt}\big(f(\mathbf{p} + t\mathbf{v})\big)\Big|_{t=0} = \sum \frac{\partial f}{\partial x_i}(\mathbf{p})\,v_i. \qquad ∎$$`,
    notes: md`**The example of [[1.3.1]] again.** For $f = x^2yz$,
$$\frac{\partial f}{\partial x} = 2xyz, \qquad \frac{\partial f}{\partial y} = x^2z, \qquad \frac{\partial f}{\partial z} = x^2y,$$
so at $\mathbf{p} = (1, 1, 0)$ these are $0, 0, 1$, and with $\mathbf{v} = (1, 0, -3)$ the lemma gives $\mathbf{v}_\mathbf{p}[f] = 0 + 0 + (-3)\cdot 1 = -3$, as before.

The sandbox computes every directional derivative with this formula (symbolic partial derivatives); the live check compares it with the definition.`,
    tryThis: [md`Edit $f$ (e.g. $e^x\cos y$, Exercise 1(c)) and check that definition and formula still agree.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('function', 'f', { expr: 'x^2*y*z', levels: '', box: 2, res: 30, dim: 3 });
        b.add('point', 'p', { coords: '(1, 1, 0)' });
        b.add('tangentVector', 'v', { v: '(1, 0, -3)', p: 'p' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('directionalDerivative', 'Dvf', { v: 'v', f: 'f' });
        b.add('lineRestriction', 'g', { f: 'f', v: 'v', a: '-1.5', b: '1' });
      },
      select: 'Dvf',
    },
    checks: [
      {
        label: md`\sum v_i \tfrac{\partial f}{\partial x_i}(\mathbf{p}) - \tfrac{d}{dt}f(\mathbf{p}+t\mathbf{v})\big|_0`,
        value: (s) => dirDerivFormula(s, fn(s, 'f'), vec(s, 'v').p, vec(s, 'v').v) - dirDerivDef(fn(s, 'f'), vec(s, 'v').p, vec(s, 'v').v),
      },
    ],
  },
  {
    id: '1.3.3',
    statement: md`Let $f$ and $g$ be functions on $\mathbf{R}^3$, $\mathbf{v}_\mathbf{p}$ and $\mathbf{w}_\mathbf{p}$ tangent vectors, $a$ and $b$ numbers. Then

1. $(a\mathbf{v}_\mathbf{p} + b\mathbf{w}_\mathbf{p})[f] = a\,\mathbf{v}_\mathbf{p}[f] + b\,\mathbf{w}_\mathbf{p}[f]$.
2. $\mathbf{v}_\mathbf{p}[af + bg] = a\,\mathbf{v}_\mathbf{p}[f] + b\,\mathbf{v}_\mathbf{p}[g]$.
3. $\mathbf{v}_\mathbf{p}[fg] = \mathbf{v}_\mathbf{p}[f] \cdot g(\mathbf{p}) + f(\mathbf{p}) \cdot \mathbf{v}_\mathbf{p}[g]$.`.replace(/^(\d)\. /gm, '- ($1) '),
    proof: md`All three follow easily from Lemma [[1.3.2]]. We prove (3). By the lemma, if $\mathbf{v} = (v_1, v_2, v_3)$,
$$\mathbf{v}_\mathbf{p}[fg] = \sum v_i \frac{\partial (fg)}{\partial x_i}(\mathbf{p}).$$
But $\dfrac{\partial(fg)}{\partial x_i} = \dfrac{\partial f}{\partial x_i}\cdot g + f \cdot \dfrac{\partial g}{\partial x_i}$. Hence
$$\begin{aligned} \mathbf{v}_\mathbf{p}[fg] &= \sum v_i \left(\frac{\partial f}{\partial x_i}(\mathbf{p}) \cdot g(\mathbf{p}) + f(\mathbf{p}) \cdot \frac{\partial g}{\partial x_i}(\mathbf{p})\right) \\ &= \left(\sum v_i \frac{\partial f}{\partial x_i}(\mathbf{p})\right) g(\mathbf{p}) + f(\mathbf{p}) \left(\sum v_i \frac{\partial g}{\partial x_i}(\mathbf{p})\right) \\ &= \mathbf{v}_\mathbf{p}[f] \cdot g(\mathbf{p}) + f(\mathbf{p}) \cdot \mathbf{v}_\mathbf{p}[g]. \qquad ∎ \end{aligned}$$`,
    notes: md`(1) and (2) say that $\mathbf{v}_\mathbf{p}[f]$ is **linear** in $\mathbf{v}_\mathbf{p}$ and in $f$; (3) is the usual **Leibniz rule** for the derivative of a product. In the book's words, whatever form differentiation takes, it will always have suitable linear and Leibnizian properties.

The figure shows $\mathbf{v}_\mathbf{p}$, $\mathbf{w}_\mathbf{p}$ and $a\mathbf{v}_\mathbf{p} + b\mathbf{w}_\mathbf{p}$; the live checks evaluate both sides of (1), (2), (3).`,
    tryThis: [md`Move $a$ and $b$, drag $\mathbf{p}$, edit $f$ or $g$: the three identities keep holding.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('a', 2, -3, 3, 0.01);
        b.slider('b', -1, -3, 3, 0.01);
        b.add('function', 'f', { expr: 'x^2*y + z', levels: '', box: 2, res: 30, dim: 3 });
        b.add('function', 'g', { expr: 'y*sin(z) + x', levels: '', box: 2, res: 30, dim: 3 });
        b.add('function', 'h', { expr: 'a*f + b*g', levels: '', box: 2, res: 30, dim: 3 }, { caption: 'af + bg' });
        b.add('function', 'fg', { expr: 'f*g', levels: '', box: 2, res: 30, dim: 3 }, { caption: 'fg' });
        b.add('point', 'p', { coords: '(1, -0.5, 0.8)' });
        b.add('tangentVector', 'v', { v: '(1, 0.5, 0)', p: 'p' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('tangentVector', 'w', { v: '(0, 0.5, 1)', p: 'p' }, { color: '#0969da', caption: '\\mathbf{w}_\\mathbf{p}' });
        b.add('combination', 'u', { expr: 'a*v + b*w' }, { color: '#1a7f37', caption: 'a\\mathbf{v}_\\mathbf{p} + b\\mathbf{w}_\\mathbf{p}' });
        b.add('directionalDerivative', 'vf', { v: 'v', f: 'f' }, { caption: '\\mathbf{v}_\\mathbf{p}[f]' });
        b.add('directionalDerivative', 'wf', { v: 'w', f: 'f' }, { caption: '\\mathbf{w}_\\mathbf{p}[f]' });
        b.add('directionalDerivative', 'uf', { v: 'u', f: 'f' }, { caption: '(a\\mathbf{v}_\\mathbf{p} + b\\mathbf{w}_\\mathbf{p})[f]' });
        b.add('directionalDerivative', 'vg', { v: 'v', f: 'g' }, { caption: '\\mathbf{v}_\\mathbf{p}[g]' });
        b.add('directionalDerivative', 'vh', { v: 'v', f: 'h' }, { caption: '\\mathbf{v}_\\mathbf{p}[af + bg]' });
        b.add('directionalDerivative', 'vfg', { v: 'v', f: 'fg' }, { caption: '\\mathbf{v}_\\mathbf{p}[fg]' });
        b.add('slider', 'fp', { value: 'f(x(p), y(p), z(p))', min: -10, max: 10, step: 0.01 }, { caption: 'f(\\mathbf{p})' });
        b.add('slider', 'gp', { value: 'g(x(p), y(p), z(p))', min: -10, max: 10, step: 0.01 }, { caption: 'g(\\mathbf{p})' });
      },
      select: 'u',
    },
    checks: [
      { label: md`(1)\ (a\mathbf{v}_\mathbf{p} + b\mathbf{w}_\mathbf{p})[f] - a\mathbf{v}_\mathbf{p}[f] - b\mathbf{w}_\mathbf{p}[f]`, value: (s) => num(s, 'uf') - num(s, 'a') * num(s, 'vf') - num(s, 'b') * num(s, 'wf') },
      { label: md`(2)\ \mathbf{v}_\mathbf{p}[af + bg] - a\mathbf{v}_\mathbf{p}[f] - b\mathbf{v}_\mathbf{p}[g]`, value: (s) => num(s, 'vh') - num(s, 'a') * num(s, 'vf') - num(s, 'b') * num(s, 'vg') },
      { label: md`(3)\ \mathbf{v}_\mathbf{p}[fg] - \mathbf{v}_\mathbf{p}[f]g(\mathbf{p}) - f(\mathbf{p})\mathbf{v}_\mathbf{p}[g]`, value: (s) => num(s, 'vfg') - num(s, 'vf') * num(s, 'gp') - num(s, 'fp') * num(s, 'vg') },
    ],
  },
  {
    id: '1.3.4',
    statement: md`If $V$ and $W$ are vector fields on $\mathbf{R}^3$ and $f$, $g$, $h$ are real-valued functions, then

- (1) $(fV + gW)[h] = fV[h] + gW[h]$.
- (2) $V[af + bg] = aV[f] + bV[g]$, for all real numbers $a$ and $b$.
- (3) $V[fg] = V[f] \cdot g + f \cdot V[g]$.`,
    proof: md`By the pointwise principle, these follow from Theorem [[1.3.3]] once the parentheses are placed carefully. For example, for (3): by definition the value of the function $V[fg]$ at $\mathbf{p}$ is $V(\mathbf{p})[fg]$, and by Theorem [[1.3.3]] this is
$$\begin{aligned} V(\mathbf{p})[f] \cdot g(\mathbf{p}) + f(\mathbf{p}) \cdot V(\mathbf{p})[g] &= V[f](\mathbf{p}) \cdot g(\mathbf{p}) + f(\mathbf{p}) \cdot V[g](\mathbf{p}) \\ &= \big(V[f] \cdot g + f \cdot V[g]\big)(\mathbf{p}). \qquad ∎ \end{aligned}$$`,
    notes: md`**The operation of a vector field on a function** (defined just before, by the pointwise principle): $V[f]$ is the function whose value at $\mathbf{p}$ is $V(\mathbf{p})[f]$ — just as the derivative function $df/dx$ collects the derivatives at each point. In particular, for the natural frame field, $U_i[f] = \partial f/\partial x_i$: for instance $U_1(\mathbf{p})[f] = \frac{d}{dt}f(p_1 + t, p_2, p_3)\big|_{t=0} = \frac{\partial f}{\partial x_1}(\mathbf{p})$.

In (1) the "scalars" are *functions* ($fV$ is just multiplication); in (2) they must be *numbers*, because $V[f]$ is differentiation.

**The book's example.** $V = xU_1 - y^2U_3$, $f = x^2y + z^3$:
$$V[f] = xU_1[x^2y] + xU_1[z^3] - y^2U_3[x^2y] - y^2U_3[z^3] = x(2xy) + 0 - 0 - y^2(3z^2) = 2x^2y - 3y^2z^2.$$
The figure shows $V$; the functions are in the Algebra view and the checks compare both sides of (3) and the book's result at sample points.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('vectorField', 'V', { comps: '(x, 0, -y^2)', box: 1.5, n: 4, scale: 0.35, dim: 3 });
        b.add('function', 'f', { expr: 'x^2*y + z^3', levels: '', box: 2, res: 30, dim: 3 });
        b.add('function', 'g', { expr: 'x*y', levels: '', box: 2, res: 30, dim: 3 });
        b.add('fieldOnFunction', 'Vf', { V: 'V', f: 'f', levels: '' });
        b.add('fieldOnFunction', 'Vg', { V: 'V', f: 'g', levels: '' });
        b.add('function', 'fg', { expr: 'f*g', levels: '', box: 2, res: 30, dim: 3 }, { caption: 'fg' });
        b.add('fieldOnFunction', 'Vfg', { V: 'V', f: 'fg', levels: '' });
        b.add('function', 'rhs', { expr: 'Vf*g + f*Vg', levels: '', box: 2, res: 30, dim: 3 }, { caption: 'V[f]g + fV[g]' });
        b.add('function', 'book', { expr: '2*x^2*y - 3*y^2*z^2', levels: '', box: 2, res: 30, dim: 3 }, { caption: '2x^2y - 3y^2z^2' });
      },
      select: 'Vf',
    },
    checks: [
      { label: md`V[f] - (2x^2y - 3y^2z^2) \text{ (book's example)}`, value: (s) => fnDiff(fn(s, 'Vf'), fn(s, 'book')) },
      { label: md`(3)\ V[fg] - (V[f]g + fV[g])`, value: (s) => fnDiff(fn(s, 'Vfg'), fn(s, 'rhs')) },
    ],
  },
  {
    id: '1.3.5',
    statement: md`Since the subscript notation $\mathbf{v}_\mathbf{p}$ is somewhat cumbersome, from now on the point of application is often omitted from the notation. This causes no confusion: $\mathbf{v}$ and $\mathbf{w}$ always denote tangent vectors, $\mathbf{p}$ and $\mathbf{q}$ points of $\mathbf{R}^3$. When the point of application matters (as in Definition [[1.3.1]]), it is indicated either by $\mathbf{v}_\mathbf{p}$ or by the phrase "a tangent vector $\mathbf{v}$ to $\mathbf{R}^3$ at $\mathbf{p}$".`,
    notes: md`The sandbox follows the same habit: tangent vectors are named $\mathbf{v}$, $\mathbf{w}$, … in the Algebra view, and their point of application is shown as a subscript of the vector part, e.g. $(2, 3, 2)_{(1, 1, 3)}$.`,
  },

  // ===========================================================================================
  // §1.4 Curves in R³
  {
    id: '1.4.1',
    statement: md`A **curve** in $\mathbf{R}^3$ is a differentiable function $\alpha\colon I \to \mathbf{R}^3$ from an open interval $I$ into $\mathbf{R}^3$.`,
    notes: md`Here an open interval may be $a < t < b$, a half-line $a < t$ or $t < b$, or the whole real line. Picture $\alpha$ as a trip taken by a moving point: at each time $t$ it is at
$$\alpha(t) = (\alpha_1(t), \alpha_2(t), \alpha_3(t)),$$
and the real-valued functions $\alpha_1, \alpha_2, \alpha_3$ are its **Euclidean coordinate functions**; $\alpha$ is differentiable when they are.

In the 3D view, $\alpha(t) = (\sqrt t, t\sqrt t, 1 - t)$ on $I\colon 0 < t < 4$ (an example of §1.4), with the moving point $\alpha(t_0)$.

**Curves in the plane** (remarks at the end of §1.4). If $f$ is a function on $\mathbf{R}^2$ whose partial derivatives never vanish together on $C\colon f = a$, the set $C$ splits into one or more "Curves" (capital C), each the route of many regular curves, its **parametrizations**. The 2D view shows the circle $x^2 + y^2 = r^2$ with its periodic parametrization $(r\cos t, r\sin t)$, and the hyperbola $x^2 - y^2 = r^2$, whose branch $x > 0$ is parametrized by the one-to-one curve $(r\cosh t, r\sinh t)$ (Fig. 1.12).`,
    tryThis: [md`Animate $t_0$ (▶) or drag the point $\alpha(t_0)$ along the curve with the **Move** tool.`, md`Change $r$: both level curves and their parametrizations follow.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('t0', 1, 0, 4, 0.01);
        b.add('curve', 'alpha', { comps: '(sqrt(t), t*sqrt(t), 1 - t)', param: 't', a: '0', b: '4', ticks: 0, dim: 3 });
        b.add('pointOnCurve', 'P0', { curve: 'alpha', t0: 't0' });
        b.slider('r', 1, 0.2, 2, 0.01);
        b.add('function', 'circ', { expr: 'x^2 + y^2', levels: 'r^2', box: 3, res: 120, dim: 2 }, { color: '#8c959f', caption: 'x^2+y^2' });
        b.add('curve', 'c1', { comps: '(r*cos(t), r*sin(t))', param: 't', a: '0', b: '2*pi', dim: 2 }, { color: '#0969da', caption: '(r\\cos t, r\\sin t)' });
        b.add('function', 'hyp', { expr: 'x^2 - y^2', levels: 'r^2', box: 3, res: 120, dim: 2 }, { color: '#d0d7de', caption: 'x^2-y^2' });
        b.add('curve', 'c2', { comps: '(r*cosh(t), r*sinh(t))', param: 't', a: '-1.6', b: '1.6', dim: 2 }, { color: '#cf222e', caption: '(r\\cosh t, r\\sinh t)' });
      },
      select: 'P0',
    },
  },
  {
    id: '1.4.3',
    statement: md`Let $\alpha\colon I \to \mathbf{R}^3$ be a curve with $\alpha = (\alpha_1, \alpha_2, \alpha_3)$. For each number $t$ in $I$, the **velocity vector** of $\alpha$ at $t$ is the tangent vector
$$\alpha'(t) = \left(\frac{d\alpha_1}{dt}(t), \frac{d\alpha_2}{dt}(t), \frac{d\alpha_3}{dt}(t)\right)_{\alpha(t)}$$
at the point $\alpha(t)$ in $\mathbf{R}^3$.`,
    notes: md`**Geometric meaning** (Fig. 1.10). The formula $\frac{df}{dt}(t) = \lim_{\Delta t \to 0} \frac{f(t + \Delta t) - f(t)}{\Delta t}$ still makes sense for a curve:
$$\frac{1}{\Delta t}\big(\alpha(t + \Delta t) - \alpha(t)\big)$$
is the vector from $\alpha(t)$ to $\alpha(t + \Delta t)$ scaled by $1/\Delta t$. As $\Delta t \to 0$ it tends to $\left(\frac{d\alpha_1}{dt}, \frac{d\alpha_2}{dt}, \frac{d\alpha_3}{dt}\right)$, tangent to the curve at $\alpha(t)$ — which must therefore be its point of application.

With $(v_1, v_2, v_3)_\mathbf{p} = \sum v_iU_i(\mathbf{p})$: $\alpha'(t) = \sum \frac{d\alpha_i}{dt}(t)\,U_i(\alpha(t))$.

**Examples.** The straight line $\alpha(t) = \mathbf{p} + t\mathbf{q}$ has $\alpha'(t) = (q_1, q_2, q_3)_{\alpha(t)} = \mathbf{q}_{\alpha(t)}$: all its velocities are parallel. The helix $\alpha(t) = (a\cos t, a\sin t, bt)$ has $\alpha'(t) = (-a\sin t, a\cos t, b)_{\alpha(t)}$: the constant $z$ coordinate shows that it rises constantly.

The figure shows the helix, its velocity at $t_0$, and the difference quotient for a step $\Delta t$ (dashed chord): shrink $\Delta t$ and watch it approach $\alpha'(t_0)$. The 2D view does the same for a plane curve.`,
    tryThis: [md`Slide $\Delta t$ toward $0$ (dt in the Algebra view).`, md`Animate $t_0$: the velocity's $z$ component stays equal to $b$.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('a', 2, 0.2, 3, 0.01);
        b.slider('b', 0.5, -1, 1, 0.01);
        b.slider('t0', 0.8, -6, 6, 0.01);
        b.slider('dt', 1.2, 0.01, 2, 0.01, { caption: '\\Delta t' });
        b.add('curve', 'alpha', { comps: '(a*cos(t), a*sin(t), b*t)', param: 't', a: '-2*pi', b: '2*pi', dim: 3 });
        b.add('pointOnCurve', 'P0', { curve: 'alpha', t0: 't0' }, { caption: '\\alpha(t_0)' });
        b.add('pointOnCurve', 'P1', { curve: 'alpha', t0: 't0 + dt' }, { color: '#8c959f', caption: '\\alpha(t_0+\\Delta t)' });
        b.add('tangentVector', 'q', { v: '((x(P1) - x(P0))/dt, (y(P1) - y(P0))/dt, (z(P1) - z(P0))/dt)', p: 'P0' }, { color: '#8250df', caption: '\\frac{1}{\\Delta t}(\\alpha(t_0+\\Delta t) - \\alpha(t_0))' });
        b.add('velocity', 'vel', { curve: 'alpha', t0: 't0' });
        b.add('curve', 'beta', { comps: '(t, t^2/2 - 1)', param: 't', a: '-2.5', b: '2.5', dim: 2 }, { caption: '\\beta' });
        b.add('pointOnCurve', 'Q0', { curve: 'beta', t0: 't0/3' }, { caption: '\\beta(t_0/3)' });
        b.add('pointOnCurve', 'Q1', { curve: 'beta', t0: 't0/3 + dt' }, { color: '#8c959f', caption: '\\beta(t_0/3+\\Delta t)' });
        b.add('tangentVector', 'q2', { v: '((x(Q1) - x(Q0))/dt, (y(Q1) - y(Q0))/dt)', p: 'Q0' }, { color: '#8250df', caption: '\\frac{\\Delta\\beta}{\\Delta t}' });
        b.add('velocity', 'vel2', { curve: 'beta', t0: 't0/3' });
      },
      select: 'vel',
    },
    checks: [
      {
        label: md`\alpha'(t_0) - (-a\sin t_0,\ a\cos t_0,\ b)`,
        value: (s) => {
          const t = num(s, 't0');
          const a = num(s, 'a');
          return diff(vec(s, 'vel').v, [-a * Math.sin(t), a * Math.cos(t), num(s, 'b')]);
        },
      },
    ],
  },
  {
    id: '1.4.4',
    statement: md`Let $\alpha\colon I \to \mathbf{R}^3$ be a curve. If $h\colon J \to I$ is a differentiable function on an open interval $J$, then the composite function
$$\beta = \alpha(h)\colon J \to \mathbf{R}^3$$
is a curve called a **reparametrization** of $\alpha$ by $h$.`,
    notes: md`For each $s$ in $J$, the new curve is at the point $\beta(s) = \alpha(h(s))$ that $\alpha$ reaches at time $h(s)$ (Fig. 1.11): $\beta$ is a different trip over (at least part of) the route of $\alpha$. Its coordinates are obtained by substituting $t = h(s)$ in $\alpha_1(t), \alpha_2(t), \alpha_3(t)$.

**The book's example.** $\alpha(t) = (\sqrt t, t\sqrt t, 1 - t)$ on $I\colon 0 < t < 4$ and $h(s) = s^2$ on $J\colon 0 < s < 2$ give
$$\beta(s) = \alpha(h(s)) = \alpha(s^2) = (s, s^3, 1 - s^2).$$
The marks on each curve are at equally spaced values of its own parameter: same route, different trips. The 2D view shows the circle $\alpha(t) = (\cos t, \sin t)$ reparametrized by $h(s) = s^2$ (it speeds up).`,
    tryThis: [md`Animate $s_0$: $\beta(s_0)$ and $\alpha(h(s_0))$ are the same point.`, md`Try $h(s) = 4 - s^2$: $\beta$ runs backwards.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('s0', 1, 0, 2, 0.01);
        b.add('curve', 'alpha', { comps: '(sqrt(t), t*sqrt(t), 1 - t)', param: 't', a: '0', b: '4', ticks: 16, dim: 3 });
        b.add('reparametrization', 'beta', { curve: 'alpha', h: 's^2', c: '0', d: '2' }, { color: '#9a6700' });
        b.add('pointOnCurve', 'B0', { curve: 'beta', t0: 's0' }, { caption: '\\beta(s_0)' });
        b.add('pointOnCurve', 'A0', { curve: 'alpha', t0: 's0^2' }, { color: '#8250df', caption: '\\alpha(h(s_0))', label: false });
        b.add('curve', 'alpha2', { comps: '(cos(t), sin(t))', param: 't', a: '0', b: '2*pi', ticks: 16, dim: 2 }, { caption: '\\alpha' });
        b.add('reparametrization', 'beta2', { curve: 'alpha2', h: 's^2', c: '0', d: 'sqrt(2*pi)' }, { color: '#9a6700', caption: '\\beta' });
        b.add('pointOnCurve', 'B2', { curve: 'beta2', t0: 's0' }, { caption: '\\beta(s_0)' });
      },
      select: 'beta',
    },
    checks: [{ label: md`\beta(s_0) - \alpha(h(s_0))`, value: (s) => diff(point(s, 'B0'), point(s, 'A0')) }],
  },
  {
    id: '1.4.5',
    statement: md`If $\beta$ is the reparametrization of $\alpha$ by $h$, then
$$\beta'(s) = \frac{dh}{ds}(s)\,\alpha'(h(s)).$$`,
    proof: md`If $\alpha = (\alpha_1, \alpha_2, \alpha_3)$, then $\beta(s) = \alpha(h(s)) = (\alpha_1(h(s)), \alpha_2(h(s)), \alpha_3(h(s)))$. In prime notation the chain rule for real-valued functions reads $(g(f))' = g'(f)\cdot f'$; here
$$\alpha_i(h)'(s) = \alpha_i'(h(s)) \cdot h'(s).$$
By the definition of velocity this gives
$$\begin{aligned} \beta'(s) = \alpha(h)'(s) &= \big(\alpha_1'(h(s))\cdot h'(s),\ \alpha_2'(h(s))\cdot h'(s),\ \alpha_3'(h(s))\cdot h'(s)\big) \\ &= h'(s)\,\alpha'(h(s)). \qquad ∎ \end{aligned}$$`,
    notes: md`So to get the velocity of a reparametrization: first reparametrize $\alpha'$ by $h$, then multiply by the derivative of $h$. Both velocities sit at the same point $\beta(s) = \alpha(h(s))$ and are parallel; their ratio is $h'(s)$ (here $h = s^2$, so $h'(s_0) = 2s_0$).`,
    tryThis: [md`Animate $s_0$: $\beta'(s_0)$ is shorter than $\alpha'(h(s_0))$ when $h'(s_0) = 2s_0 < 1$, longer afterwards.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('s0', 0.8, 0.05, 1.95, 0.01);
        b.add('curve', 'alpha', { comps: '(sqrt(t), t*sqrt(t), 1 - t)', param: 't', a: '0', b: '4', dim: 3 });
        b.add('reparametrization', 'beta', { curve: 'alpha', h: 's^2', c: '0', d: '2' }, { color: '#9a6700' });
        b.add('velocity', 'vb', { curve: 'beta', t0: 's0' }, { caption: "\\beta'(s_0)" });
        b.add('velocity', 'va', { curve: 'alpha', t0: 's0^2' }, { color: '#8250df', caption: "\\alpha'(h(s_0))" });
        b.add('curve', 'alpha2', { comps: '(cos(t), sin(t))', param: 't', a: '0', b: '2*pi', dim: 2 }, { caption: '\\alpha' });
        b.add('reparametrization', 'beta2', { curve: 'alpha2', h: 's^2', c: '0', d: 'sqrt(2*pi)' }, { color: '#9a6700', caption: '\\beta' });
        b.add('velocity', 'vb2', { curve: 'beta2', t0: 's0' }, { caption: "\\beta'(s_0)" });
        b.add('velocity', 'va2', { curve: 'alpha2', t0: 's0^2' }, { color: '#8250df', caption: "\\alpha'(h(s_0))" });
      },
      select: 'vb',
    },
    checks: [
      { label: md`\beta'(s_0) - h'(s_0)\,\alpha'(h(s_0))`, value: (s) => diff(vec(s, 'vb').v, vec(s, 'va').v.map((x) => 2 * num(s, 's0') * x)) },
      { label: md`\text{same in } \mathbf{R}^2`, value: (s) => diff(vec(s, 'vb2').v, vec(s, 'va2').v.map((x) => 2 * num(s, 's0') * x)) },
    ],
  },
  {
    id: '1.4.6',
    statement: md`Let $\alpha$ be a curve in $\mathbf{R}^3$ and let $f$ be a differentiable function on $\mathbf{R}^3$. Then
$$\alpha'(t)[f] = \frac{d(f(\alpha))}{dt}(t).$$`,
    proof: md`Since $\alpha' = \left(\dfrac{d\alpha_1}{dt}, \dfrac{d\alpha_2}{dt}, \dfrac{d\alpha_3}{dt}\right)_\alpha$, Lemma [[1.3.2]] gives
$$\alpha'(t)[f] = \sum \frac{\partial f}{\partial x_i}(\alpha(t))\,\frac{d\alpha_i}{dt}(t).$$
But the composite function $f(\alpha)$ may be written $f(\alpha_1, \alpha_2, \alpha_3)$, and the chain rule gives exactly the same result for its derivative. $\quad ∎$`,
    notes: md`By definition, $\alpha'(t)[f]$ is the rate of change of $f$ along the straight line through $\alpha(t)$ in the $\alpha'(t)$ direction (the tangent line to $\alpha$ if $\alpha'(t) \ne 0$). The lemma says it equals the rate of change of $f$ along the curve itself. (Exercise 6: in Definition [[1.3.1]] the line $t \mapsto \mathbf{p} + t\mathbf{v}$ can be replaced by any curve with initial velocity $\mathbf{v}_\mathbf{p}$.)

**More vocabulary** (end of §1.4). A curve is **one-to-one** if $\alpha(t) = \alpha(t_1)$ only for $t = t_1$; **periodic** if $\alpha(t + p) = \alpha(t)$ for some $p > 0$ and all $t$ (the smallest such $p$ is the **period**); and — most important for calculus — **regular** if all its velocity vectors are nonzero. A regular curve has no corners or cusps.

The 2D view graphs $t \mapsto f(\alpha(t))$; the slope of its tangent line at $t_0$ is the number $\alpha'(t_0)[f]$ shown in the Algebra view.`,
    tryThis: [md`Animate $t_0$: the tangent line slides along the graph, its slope is always $\alpha'(t_0)[f]$.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('t0', 1, -6, 6, 0.01);
        b.add('function', 'f', { expr: 'x*y + z', levels: '', box: 2, res: 30, dim: 3 });
        b.add('curve', 'alpha', { comps: '(cos(t), sin(t), t/4)', param: 't', a: '-6', b: '6', dim: 3 });
        b.add('velocity', 'vel', { curve: 'alpha', t0: 't0' });
        b.add('directionalDerivative', 'Df', { v: 'vel', f: 'f' }, { caption: "\\alpha'(t_0)[f]" });
        b.add('curveRestriction', 'fa', { f: 'f', curve: 'alpha', t0: 't0' });
      },
      select: 'Df',
    },
    checks: [
      {
        label: md`\alpha'(t_0)[f] - \frac{d}{dt}f(\alpha(t))\big|_{t_0} \text{ (numerical)}`,
        value: (s) => {
          const c = curve(s, 'alpha');
          const f = fn(s, 'f');
          const t = num(s, 't0');
          const h = 1e-5;
          return num(s, 'Df') - (f.f(c.f(t + h)) - f.f(c.f(t - h))) / (2 * h);
        },
      },
    ],
  },

  // ===========================================================================================
  // §1.5 1-Forms
  {
    id: '1.5.1',
    statement: md`A **1-form** $\phi$ on $\mathbf{R}^3$ is a real-valued function on the set of all tangent vectors to $\mathbf{R}^3$ such that $\phi$ is linear at each point, that is,
$$\phi(a\mathbf{v} + b\mathbf{w}) = a\phi(\mathbf{v}) + b\phi(\mathbf{w})$$
for any numbers $a$, $b$ and tangent vectors $\mathbf{v}$, $\mathbf{w}$ at the same point of $\mathbf{R}^3$.`,
    notes: md`This makes rigorous the formal expression $df = \frac{\partial f}{\partial x}dx + \frac{\partial f}{\partial y}dy + \frac{\partial f}{\partial z}dz$ of elementary calculus.

For every tangent vector $\mathbf{v}$, $\phi$ gives a number $\phi(\mathbf{v})$, and at each point $\mathbf{p}$ the restriction $\phi_\mathbf{p}\colon T_\mathbf{p}(\mathbf{R}^3) \to \mathbf{R}$ is linear — an element of the **dual space** of $T_\mathbf{p}(\mathbf{R}^3)$. In this sense 1-forms are dual to vector fields.

Operations, pointwise: $(\phi + \psi)(\mathbf{v}) = \phi(\mathbf{v}) + \psi(\mathbf{v})$ and $(f\phi)(\mathbf{v}_\mathbf{p}) = f(\mathbf{p})\phi(\mathbf{v}_\mathbf{p})$. A 1-form can also be **evaluated on a vector field** $V$: $\phi(V)$ is the function whose value at $\mathbf{p}$ is $\phi(V(\mathbf{p}))$ — a 1-form is a machine converting vector fields into functions. It is linear in both: $\phi(fV + gW) = f\phi(V) + g\phi(W)$, $(f\phi + g\psi)(V) = f\phi(V) + g\psi(V)$. A 1-form is **differentiable** if $\phi(V)$ is whenever $V$ is (always assumed).

Forms are not drawn: the figure shows tangent vectors $\mathbf{v}, \mathbf{w}$ at $\mathbf{p}$ and $a\mathbf{v} + b\mathbf{w}$; the values $\phi(\cdot)$ are in the Algebra view. The form is $\phi = x^2dx - y^2dz$ of Exercise 3, and $\phi(V)$ for $V = xU_1 + yU_2 + zU_3$ is the function $x^3 - y^2z$.`,
    tryThis: [md`Move $a$, $b$ or drag $\mathbf{p}$: linearity holds at every point.`, md`Edit $\phi$ (e.g. $z\,dy - y\,dz$, Exercise 1(b)).`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('a', 2, -3, 3, 0.01);
        b.slider('b', 1, -3, 3, 0.01);
        b.add('oneForm', 'phi', { comps: '(x^2, 0, -y^2)' });
        b.add('point', 'p', { coords: '(1, -1, 0.5)' });
        b.add('tangentVector', 'v', { v: '(1, 2, -1)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('tangentVector', 'w', { v: '(0, 1, 1)', p: 'p' }, { color: '#0969da', caption: '\\mathbf{w}' });
        b.add('combination', 'u', { expr: 'a*v + b*w' }, { color: '#1a7f37', caption: 'a\\mathbf{v} + b\\mathbf{w}' });
        b.add('evaluateForm', 'phv', { phi: 'phi', v: 'v' });
        b.add('evaluateForm', 'phw', { phi: 'phi', v: 'w' });
        b.add('evaluateForm', 'phu', { phi: 'phi', v: 'u' });
        b.add('vectorField', 'V', { comps: '(x, y, z)', box: 1.5, n: 3, scale: 0.3, dim: 3 }, { visible: false });
        b.add('formOnField', 'phV', { phi: 'phi', V: 'V' });
        b.add('function', 'ex3', { expr: 'x^3 - y^2*z', levels: '', box: 2, res: 30, dim: 3 }, { caption: 'x^3 - y^2z' });
      },
      select: 'phu',
    },
    checks: [
      { label: md`\phi(a\mathbf{v} + b\mathbf{w}) - a\phi(\mathbf{v}) - b\phi(\mathbf{w})`, value: (s) => num(s, 'phu') - num(s, 'a') * num(s, 'phv') - num(s, 'b') * num(s, 'phw') },
      { label: md`\phi(V) - (x^3 - y^2z)`, value: (s) => fnDiff(fn(s, 'phV'), fn(s, 'ex3')) },
    ],
  },
  {
    id: '1.5.2',
    statement: md`If $f$ is a differentiable real-valued function on $\mathbf{R}^3$, the **differential** $df$ of $f$ is the 1-form such that
$$df(\mathbf{v}_\mathbf{p}) = \mathbf{v}_\mathbf{p}[f] \quad \text{for all tangent vectors } \mathbf{v}_\mathbf{p}.$$`,
    notes: md`$df$ is indeed a 1-form: it is a real-valued function on tangent vectors, linear at each point by (1) of Theorem [[1.3.3]]. It knows all rates of change of $f$ in all directions — no wonder differentials are fundamental. The next results ([[1.5.4]], [[1.5.5]]) show that this abstract definition gives back the familiar formula.`,
    tryThis: [md`Edit $\mathbf{v}$ or drag $\mathbf{p}$: $df(\mathbf{v}_\mathbf{p})$ and $\mathbf{v}_\mathbf{p}[f]$ stay equal.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('function', 'f', { expr: 'x*y^2 - y*z^2', levels: '', box: 2, res: 30, dim: 3 });
        b.add('differential', 'df', { f: 'f' });
        b.add('point', 'p', { coords: '(0, -2, 1)' });
        b.add('tangentVector', 'v', { v: '(1, 2, -3)', p: 'p' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('evaluateForm', 'dfv', { phi: 'df', v: 'v' });
        b.add('directionalDerivative', 'vf', { v: 'v', f: 'f' });
      },
      select: 'df',
    },
    checks: [{ label: md`df(\mathbf{v}_\mathbf{p}) - \mathbf{v}_\mathbf{p}[f]`, value: (s) => num(s, 'dfv') - num(s, 'vf') }],
  },
  {
    id: '1.5.3',
    statement: md`**1-forms on $\mathbf{R}^3$.**

(1) The differentials $dx_1, dx_2, dx_3$ of the natural coordinate functions. By Lemma [[1.3.2]],
$$dx_i(\mathbf{v}_\mathbf{p}) = \mathbf{v}_\mathbf{p}[x_i] = \sum_j v_j \frac{\partial x_i}{\partial x_j}(\mathbf{p}) = \sum_j v_j\delta_{ij} = v_i,$$
where $\delta_{ij}$ is the Kronecker delta ($0$ if $i \ne j$, $1$ if $i = j$). So **the value of $dx_i$ on $\mathbf{v}_\mathbf{p}$ is the $i$th coordinate $v_i$ of its vector part** — independent of the point of application.

(2) The 1-form $\psi = f_1dx_1 + f_2dx_2 + f_3dx_3$, for any functions $f_1, f_2, f_3$. Its value on $\mathbf{v}_\mathbf{p}$ is
$$\psi(\mathbf{v}_\mathbf{p}) = \left(\sum f_i\,dx_i\right)(\mathbf{v}_\mathbf{p}) = \sum f_i(\mathbf{p})\,dx_i(\mathbf{v}_\mathbf{p}) = \sum f_i(\mathbf{p})\,v_i.$$`,
    notes: md`(1) shows that $dx_1, dx_2, dx_3$ play for tangent vectors the role that $x_1, x_2, x_3$ play for points. They are also "dual" to the natural frame field: $dx_i(U_j) = \delta_{ij}$, a constant.

The next lemma shows that *every* 1-form looks like (2). In the figure: $dx$, $dy$, $dz$ and $\psi = y^2dx + (z^2 - 1)dy$ evaluated on $\mathbf{v}_\mathbf{p}$ (numbers in the Algebra view).`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('oneForm', 'dx1', { comps: '(1, 0, 0)' }, { caption: 'dx_1' });
        b.add('oneForm', 'dx2', { comps: '(0, 1, 0)' }, { caption: 'dx_2' });
        b.add('oneForm', 'dx3', { comps: '(0, 0, 1)' }, { caption: 'dx_3' });
        b.add('oneForm', 'psi', { comps: '(y^2, z^2 - 1, 0)' });
        b.add('point', 'p', { coords: '(0, -2, 1)' });
        b.add('tangentVector', 'v', { v: '(1, 2, -3)', p: 'p' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('evaluateForm', 'e1', { phi: 'dx1', v: 'v' });
        b.add('evaluateForm', 'e2', { phi: 'dx2', v: 'v' });
        b.add('evaluateForm', 'e3', { phi: 'dx3', v: 'v' });
        b.add('evaluateForm', 'psv', { phi: 'psi', v: 'v' });
      },
      select: 'psv',
    },
    checks: [
      { label: md`(dx_1, dx_2, dx_3)(\mathbf{v}_\mathbf{p}) - (v_1, v_2, v_3)`, value: (s) => diff([num(s, 'e1'), num(s, 'e2'), num(s, 'e3')], vec(s, 'v').v) },
      {
        label: md`\psi(\mathbf{v}_\mathbf{p}) - \sum f_i(\mathbf{p})v_i`,
        value: (s) => {
          const p = vec(s, 'v').p;
          const v = vec(s, 'v').v;
          return num(s, 'psv') - (p[1] ** 2 * v[0] + (p[2] ** 2 - 1) * v[1]);
        },
      },
    ],
  },
  {
    id: '1.5.4',
    statement: md`If $\phi$ is a 1-form on $\mathbf{R}^3$, then $\phi = \sum f_i\,dx_i$, where $f_i = \phi(U_i)$. These functions $f_1, f_2, f_3$ are called the **Euclidean coordinate functions** of $\phi$.`,
    proof: md`A 1-form is a function on tangent vectors, so $\phi$ and $\sum f_i\,dx_i$ are equal if and only if they have the same value on every tangent vector $\mathbf{v}_\mathbf{p} = \sum v_iU_i(\mathbf{p})$. By (2) of Example [[1.5.3]],
$$\left(\sum f_i\,dx_i\right)(\mathbf{v}_\mathbf{p}) = \sum f_i(\mathbf{p})\,v_i.$$
On the other hand, by linearity,
$$\phi(\mathbf{v}_\mathbf{p}) = \phi\left(\sum v_iU_i(\mathbf{p})\right) = \sum v_i\,\phi(U_i(\mathbf{p})) = \sum v_i\,f_i(\mathbf{p}),$$
since $f_i = \phi(U_i)$. Thus $\phi$ and $\sum f_i\,dx_i$ have the same value on every tangent vector. $\quad ∎$`,
    notes: md`So a 1-form on $\mathbf{R}^3$ is nothing more than an expression $f\,dx + g\,dy + h\,dz$ — now rigorously a function on tangent vectors. In the figure, $\phi$ is evaluated on $U_1(\mathbf{p}), U_2(\mathbf{p}), U_3(\mathbf{p})$: the three numbers are $f_1(\mathbf{p}), f_2(\mathbf{p}), f_3(\mathbf{p})$.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('oneForm', 'phi', { comps: '(z^2 - 1, -1, x^2)' });
        b.add('point', 'p', { coords: '(0, -2, 1)' });
        b.add('tangentVector', 'u1', { v: '(1, 0, 0)', p: 'p' }, { color: '#d1242f', caption: 'U_1(\\mathbf{p})' });
        b.add('tangentVector', 'u2', { v: '(0, 1, 0)', p: 'p' }, { color: '#1a7f37', caption: 'U_2(\\mathbf{p})' });
        b.add('tangentVector', 'u3', { v: '(0, 0, 1)', p: 'p' }, { color: '#0550ae', caption: 'U_3(\\mathbf{p})' });
        b.add('evaluateForm', 'f1', { phi: 'phi', v: 'u1' }, { caption: 'f_1(\\mathbf{p})' });
        b.add('evaluateForm', 'f2', { phi: 'phi', v: 'u2' }, { caption: 'f_2(\\mathbf{p})' });
        b.add('evaluateForm', 'f3', { phi: 'phi', v: 'u3' }, { caption: 'f_3(\\mathbf{p})' });
        b.add('tangentVector', 'v', { v: '(1, 2, -3)', p: 'p' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('evaluateForm', 'phv', { phi: 'phi', v: 'v' });
      },
      select: 'phi',
    },
    checks: [
      {
        label: md`\phi(\mathbf{v}_\mathbf{p}) - \sum v_i\,\phi(U_i(\mathbf{p}))`,
        value: (s) => {
          const v = vec(s, 'v').v;
          return num(s, 'phv') - (v[0] * num(s, 'f1') + v[1] * num(s, 'f2') + v[2] * num(s, 'f3'));
        },
      },
    ],
  },
  {
    id: '1.5.5',
    statement: md`If $f$ is a differentiable function on $\mathbf{R}^3$, then
$$df = \sum \frac{\partial f}{\partial x_i}\,dx_i.$$`,
    proof: md`The value of $\sum (\partial f/\partial x_i)\,dx_i$ on an arbitrary tangent vector $\mathbf{v}_\mathbf{p}$ is $\sum (\partial f/\partial x_i)(\mathbf{p})\,v_i$. By Lemma [[1.3.2]], $df(\mathbf{v}_\mathbf{p}) = \mathbf{v}_\mathbf{p}[f]$ is the same. Thus the 1-forms $df$ and $\sum (\partial f/\partial x_i)\,dx_i$ are equal. $\quad ∎$`,
    notes: md`So the abstract differential of Definition [[1.5.2]] is the familiar $\frac{\partial f}{\partial x}dx + \frac{\partial f}{\partial y}dy + \frac{\partial f}{\partial z}dz$. Using this (or the definition) one sees at once that $d(f + g) = df + dg$; the next two lemmas give the effect of $d$ on products and compositions.`,
    scene: {
      views: [],
      build: (b) => {
        b.add('function', 'f', { expr: 'x*exp(y*z)', levels: '', box: 2, res: 30, dim: 3 });
        b.add('differential', 'df', { f: 'f' });
        b.add('function', 'g', { expr: 'sin(x*y)*cos(x*z)', levels: '', box: 2, res: 30, dim: 3 });
        b.add('differential', 'dg', { f: 'g' });
        b.add('function', 'fpg', { expr: 'f + g', levels: '', box: 2, res: 30, dim: 3 }, { caption: 'f + g' });
        b.add('differential', 'dfpg', { f: 'fpg' }, { caption: 'd(f+g)' });
        b.add('formSum', 'rhs', { phi: 'df', op: '+', psi: 'dg' }, { caption: 'df + dg' });
      },
      select: 'df',
    },
    checks: [
      {
        label: md`df(\mathbf{v}_\mathbf{p}) - \mathbf{v}_\mathbf{p}[f] \text{ at random } \mathbf{v}_\mathbf{p}`,
        value: (s) => {
          const f = fn(s, 'f');
          const df = form(s, 'df');
          const N = s.allNumbers();
          let m = 0;
          for (const [p, v] of [[[0.3, 1, -0.4], [1, -2, 0.5]], [[-1, 0.2, 0.7], [0.3, 0.3, -1]]]) {
            const c = formAt(df, p, N);
            m = Math.max(m, Math.abs(c[0] * v[0] + c[1] * v[1] + c[2] * v[2] - dirDerivDef(f, p, v)));
          }
          return m;
        },
        tol: 1e-6,
      },
      { label: md`d(f + g) - (df + dg)`, value: (s) => formDiff(s, form(s, 'dfpg'), form(s, 'rhs')) },
    ],
  },
  {
    id: '1.5.7',
    statement: md`Let $f\colon \mathbf{R}^3 \to \mathbf{R}$ and $h\colon \mathbf{R} \to \mathbf{R}$ be differentiable functions, so that the composite function $h(f)\colon \mathbf{R}^3 \to \mathbf{R}$ is also differentiable. Then
$$d(h(f)) = h'(f)\,df.$$`,
    proof: md`(The prime is the ordinary derivative, so $h'(f)$ is again a composite function from $\mathbf{R}^3$ to $\mathbf{R}$.) The usual chain rule for a composite function such as $h(f)$ reads
$$\frac{\partial(h(f))}{\partial x_i} = h'(f)\,\frac{\partial f}{\partial x_i}.$$
Hence
$$d(h(f)) = \sum \frac{\partial(h(f))}{\partial x_i}\,dx_i = \sum h'(f)\,\frac{\partial f}{\partial x_i}\,dx_i = h'(f)\,df. \qquad ∎$$`,
    notes: md`To compute $df$ it is almost always simpler to use these rules (sum, [[1.5.6]], [[1.5.7]]) than the formula of [[1.5.5]]; then $df$ gives all partial derivatives and all directional derivatives at once.

**The book's example.** $f = (x^2 - 1)y + (y^2 + 2)z$. By [[1.5.6]] and [[1.5.7]],
$$\begin{aligned} df &= (2x\,dx)y + (x^2 - 1)dy + (2y\,dy)z + (y^2 + 2)dz \\ &= 2xy\,dx + (x^2 + 2yz - 1)\,dy + (y^2 + 2)\,dz, \end{aligned}$$
the three coefficients being $\partial f/\partial x$, $\partial f/\partial y$, $\partial f/\partial z$. Evaluating on $\mathbf{v}_\mathbf{p}$:
$$\mathbf{v}_\mathbf{p}[f] = df(\mathbf{v}_\mathbf{p}) = 2p_1p_2v_1 + (p_1^2 + 2p_2p_3 - 1)v_2 + (p_2^2 + 2)v_3.$$
(The printed book has $(p_2^2 + 1)v_3$ in this last line, a misprint: $\partial f/\partial z = y^2 + 2$.)

In the figure (Algebra view), $h = \sin$: $d(\sin f) = \cos f\,df$.`,
    scene: {
      views: [],
      build: (b) => {
        b.add('function', 'f', { expr: 'x^2*y + z', levels: '', box: 2, res: 30, dim: 3 });
        b.add('function', 'hf', { expr: 'sin(f)', levels: '', box: 2, res: 30, dim: 3 }, { caption: 'h(f) = \\sin f' });
        b.add('function', 'hpf', { expr: 'cos(f)', levels: '', box: 2, res: 30, dim: 3 }, { caption: "h'(f) = \\cos f" });
        b.add('differential', 'df', { f: 'f' });
        b.add('differential', 'dhf', { f: 'hf' }, { caption: 'd(h(f))' });
        b.add('wedge', 'rhs', { phi: 'hpf', psi: 'df' }, { caption: "h'(f)\\,df" });
        b.add('function', 'F', { expr: '(x^2 - 1)*y + (y^2 + 2)*z', levels: '', box: 2, res: 30, dim: 3 });
        b.add('differential', 'dF', { f: 'F' });
        b.add('oneForm', 'book', { comps: '(2*x*y, x^2 + 2*y*z - 1, y^2 + 2)' }, { caption: '\\text{book}' });
      },
      select: 'dhf',
    },
    checks: [
      { label: md`d(h(f)) - h'(f)\,df`, value: (s) => formDiff(s, form(s, 'dhf'), form(s, 'rhs')) },
      { label: md`dF - (2xy\,dx + (x^2 + 2yz - 1)dy + (y^2 + 2)dz)`, value: (s) => formDiff(s, form(s, 'dF'), form(s, 'book')) },
    ],
  },

  // ===========================================================================================
  // §1.6 Differential Forms
  {
    id: 'n.pforms',
    statement: md`Roughly speaking, a **differential form** on $\mathbf{R}^3$ is an expression obtained by adding and multiplying real-valued functions and the differentials $dx_1, dx_2, dx_3$. These operations obey the usual associative and distributive laws, but the multiplication is not commutative: it obeys the

**alternation rule:** $dx_i\,dx_j = -dx_j\,dx_i$ $\quad (1 \le i, j \le 3)$.

Consequently **repeats are zero**: $dx_i\,dx_i = 0$. If each summand contains $p$ of the $dx_i$ ($p = 0, 1, 2, 3$), the form is a **$p$-form** (of degree $p$):

- a 0-form is a differentiable function $f$;
- a 1-form is an expression $f\,dx + g\,dy + h\,dz$ (as in §1.5);
- a 2-form is an expression $f\,dx\,dy + g\,dx\,dz + h\,dy\,dz$;
- a 3-form is an expression $f\,dx\,dy\,dz$.`,
    notes: md`Forms of the same degree are added by adding coefficients: $\sum f_i\,dx_i + \sum g_i\,dx_i = \sum (f_i + g_i)\,dx_i$, and likewise for 2- and 3-forms. On $\mathbf{R}^3$ every $p$-form with $p > 3$ is zero: a product of more than three $dx_i$'s contains a repeat — e.g. $dx\,dy\,dx\,dz = -dx\,dx\,dy\,dz = 0$.

As a reminder that the alternation rule must be used, the product of forms is written with a **wedge** $\wedge$ (but not between $dx$, $dy$, $dz$). The account is less rigorous than for 1-forms, since the book's use of the full system on $\mathbf{R}^3$ is limited; the properties established hold whenever forms are used.

The checks verify the alternation rule on the sandbox's own wedge product.`,
    scene: {
      views: [],
      build: (b) => {
        b.add('oneForm', 'dx', { comps: '(1, 0, 0)' }, { caption: 'dx' });
        b.add('oneForm', 'dy', { comps: '(0, 1, 0)' }, { caption: 'dy' });
        b.add('wedge', 'dxdy', { phi: 'dx', psi: 'dy' }, { caption: 'dx \\wedge dy' });
        b.add('wedge', 'dydx', { phi: 'dy', psi: 'dx' }, { caption: 'dy \\wedge dx' });
        b.add('wedge', 'dxdx', { phi: 'dx', psi: 'dx' }, { caption: 'dx \\wedge dx' });
        b.add('formSum', 'sum', { phi: 'dxdy', op: '+', psi: 'dydx' }, { caption: 'dx\\,dy + dy\\,dx' });
      },
      select: 'dydx',
    },
    checks: [
      { label: md`dx\,dy + dy\,dx`, value: (s) => Math.max(...formAt(form(s, 'sum'), [0, 0, 0], {}).map(Math.abs)) },
      { label: md`dx\,dx`, value: (s) => Math.max(...formAt(form(s, 'dxdx'), [0, 0, 0], {}).map(Math.abs)) },
    ],
  },
  {
    id: '1.6.1',
    statement: md`**Computation of wedge products.**

(1) Let $\phi = x\,dx - y\,dy$ and $\psi = z\,dx + x\,dz$. Then
$$\phi \wedge \psi = (x\,dx - y\,dy) \wedge (z\,dx + x\,dz) = xz\,dx\,dx + x^2\,dx\,dz - yz\,dy\,dx - yx\,dy\,dz.$$
But $dx\,dx = 0$ and $dy\,dx = -dx\,dy$, so
$$\phi \wedge \psi = yz\,dx\,dy + x^2\,dx\,dz - xy\,dy\,dz.$$
The product of two 1-forms is a 2-form.

(2) With $\phi$, $\psi$ as above and $\theta = z\,dy$,
$$\theta \wedge \phi \wedge \psi = yz^2\,dy\,dx\,dy + x^2z\,dy\,dx\,dz - xyz\,dy\,dy\,dz.$$
$dy\,dx\,dy$ and $dy\,dy\,dz$ contain repeats, so $\theta \wedge \phi \wedge \psi = -x^2z\,dx\,dy\,dz$.

(3) With $\phi$ as above and the 2-form $\eta = y\,dx\,dz + x\,dy\,dz$, omitting terms with repeats,
$$\phi \wedge \eta = x^2\,dx\,dy\,dz - y^2\,dy\,dx\,dz = (x^2 + y^2)\,dx\,dy\,dz.$$`,
    notes: md`In general the wedge product of a $p$-form and a $q$-form is a $(p + q)$-form, hence zero when $p + q > 3$. The sandbox computes these products symbolically (Algebra view); the checks compare them with the book's results.`,
    tryThis: [md`Select $\phi \wedge \psi$ and read it in the Course view; then edit $\phi$ and watch every product change.`],
    scene: {
      views: [],
      build: (b) => {
        b.add('oneForm', 'phi', { comps: '(x, -y, 0)' });
        b.add('oneForm', 'psi', { comps: '(z, 0, x)' });
        b.add('oneForm', 'theta', { comps: '(0, z, 0)' });
        b.add('twoForm', 'eta', { comps: '(0, y, x)' });
        b.add('wedge', 'phipsi', { phi: 'phi', psi: 'psi' }, { caption: '\\phi \\wedge \\psi' });
        b.add('wedge', 'tpp', { phi: 'theta', psi: 'phipsi' }, { caption: '\\theta \\wedge \\phi \\wedge \\psi' });
        b.add('wedge', 'phieta', { phi: 'phi', psi: 'eta' }, { caption: '\\phi \\wedge \\eta' });
        b.add('twoForm', 'b1', { comps: '(y*z, x^2, -x*y)' }, { caption: '\\text{book (1)}' });
        b.add('threeForm', 'b2', { f: '-x^2*z' }, { caption: '\\text{book (2)}' });
        b.add('threeForm', 'b3', { f: 'x^2 + y^2' }, { caption: '\\text{book (3)}' });
      },
      select: 'phipsi',
    },
    checks: [
      { label: md`(1)\ \phi \wedge \psi - (yz\,dx\,dy + x^2dx\,dz - xy\,dy\,dz)`, value: (s) => formDiff(s, form(s, 'phipsi'), form(s, 'b1')) },
      { label: md`(2)\ \theta \wedge \phi \wedge \psi + x^2z\,dx\,dy\,dz`, value: (s) => formDiff(s, form(s, 'tpp'), form(s, 'b2')) },
      { label: md`(3)\ \phi \wedge \eta - (x^2 + y^2)\,dx\,dy\,dz`, value: (s) => formDiff(s, form(s, 'phieta'), form(s, 'b3')) },
    ],
  },
  {
    id: '1.6.2',
    statement: md`If $\phi$ and $\psi$ are 1-forms, then
$$\phi \wedge \psi = -\psi \wedge \phi.$$`,
    proof: md`Write $\phi = \sum f_i\,dx_i$ and $\psi = \sum g_i\,dx_i$. Then by the alternation rule,
$$\phi \wedge \psi = \sum f_ig_j\,dx_i\,dx_j = -\sum g_jf_i\,dx_j\,dx_i = -\psi \wedge \phi. \qquad ∎$$`,
    notes: md`In particular $\phi \wedge \phi = 0$ for every 1-form. (For a $p$-form and a $q$-form the general rule is $\xi \wedge \eta = (-1)^{pq}\,\eta \wedge \xi$; e.g. a 1-form and a 2-form commute.)`,
    scene: {
      views: [],
      build: (b) => {
        b.add('oneForm', 'phi', { comps: '(y*z, 0, 1)' });
        b.add('oneForm', 'psi', { comps: '(sin(z), cos(z), 0)' });
        b.add('wedge', 'pp', { phi: 'phi', psi: 'psi' }, { caption: '\\phi \\wedge \\psi' });
        b.add('wedge', 'qq', { phi: 'psi', psi: 'phi' }, { caption: '\\psi \\wedge \\phi' });
        b.add('formSum', 'sum', { phi: 'pp', op: '+', psi: 'qq' }, { caption: '\\phi\\wedge\\psi + \\psi\\wedge\\phi' });
        b.add('wedge', 'phiphi', { phi: 'phi', psi: 'phi' }, { caption: '\\phi \\wedge \\phi' });
      },
      select: 'sum',
    },
    checks: [
      { label: md`\phi \wedge \psi + \psi \wedge \phi`, value: (s) => formDiff(s, form(s, 'pp'), negate(form(s, 'qq'))) },
      { label: md`\phi \wedge \phi`, value: (s) => formDiff(s, form(s, 'phiphi'), zero2) },
    ],
  },
  {
    id: '1.6.3',
    statement: md`If $\phi = \sum f_i\,dx_i$ is a 1-form on $\mathbf{R}^3$, the **exterior derivative** of $\phi$ is the 2-form
$$d\phi = \sum df_i \wedge dx_i.$$`,
    notes: md`The operator $d$ of [[1.5.2]] turns a 0-form $f$ into a 1-form $df$; in general $d$ turns a $p$-form into a $(p + 1)$-form by applying $d$ to its coefficient functions — this is the case $p = 1$. Expanding with [[1.5.5]] gives, for $\phi = f_1dx_1 + f_2dx_2 + f_3dx_3$,
$$d\phi = \left(\frac{\partial f_2}{\partial x_1} - \frac{\partial f_1}{\partial x_2}\right)dx_1dx_2 + \left(\frac{\partial f_3}{\partial x_1} - \frac{\partial f_1}{\partial x_3}\right)dx_1dx_3 + \left(\frac{\partial f_3}{\partial x_2} - \frac{\partial f_2}{\partial x_3}\right)dx_2dx_3.$$
No need to memorize it — applying the definition is more reliable. **Example.** $\phi = xy\,dx + x^2\,dz$:
$$d\phi = d(xy) \wedge dx + d(x^2) \wedge dz = (y\,dx + x\,dy) \wedge dx + (2x\,dx) \wedge dz = -x\,dx\,dy + 2x\,dx\,dz.$$
The general exterior derivative is linear: $d(a\phi + b\psi) = a\,d\phi + b\,d\psi$ for numbers $a, b$.`,
    scene: {
      views: [],
      build: (b) => {
        b.add('oneForm', 'phi', { comps: '(x*y, 0, x^2)' });
        b.add('exteriorDerivative', 'dphi', { phi: 'phi' });
        b.add('twoForm', 'book', { comps: '(-x, 2*x, 0)' }, { caption: '-x\\,dx\\,dy + 2x\\,dx\\,dz' });
      },
      select: 'dphi',
    },
    checks: [{ label: md`d\phi - (-x\,dx\,dy + 2x\,dx\,dz)`, value: (s) => formDiff(s, form(s, 'dphi'), form(s, 'book')) }],
  },
  {
    id: '1.6.4',
    statement: md`Let $f$ and $g$ be functions, $\phi$ and $\psi$ 1-forms. Then

- (1) $d(fg) = df\,g + f\,dg$.
- (2) $d(f\phi) = df \wedge \phi + f\,d\phi$.
- (3) $d(\phi \wedge \psi) = d\phi \wedge \psi - \phi \wedge d\psi$.`,
    proof: md`(1) is Lemma [[1.5.6]], included to show the family resemblance. The proof of (2) is a simpler version of that of (3), so we outline (3), watching where the minus sign comes from.

It suffices to prove the formula when $\phi = f\,du$, $\psi = g\,dv$, where $u$ and $v$ are any of the coordinate functions $x_1, x_2, x_3$: every 1-form is a sum of such terms, and the general case follows by linearity of $d$ and the algebra of wedge products.

Take the typical case $\phi = f\,dx$, $\psi = g\,dy$. Repeats kill, so terms bound to vanish need not be written:
$$d(\phi \wedge \psi) = d(fg\,dx\,dy) = \frac{\partial(fg)}{\partial z}\,dz\,dx\,dy = \left(f\frac{\partial g}{\partial z} + g\frac{\partial f}{\partial z}\right)dx\,dy\,dz. \qquad (*)$$
Now
$$d\phi \wedge \psi = d(f\,dx) \wedge g\,dy = \frac{\partial f}{\partial z}\,dz \wedge dx \wedge g\,dy = g\frac{\partial f}{\partial z}\,dx\,dy\,dz.$$
But
$$\phi \wedge d\psi = f\,dx \wedge d(g\,dy) = f\,dx \wedge \frac{\partial g}{\partial z}\,dz \wedge dy = -f\frac{\partial g}{\partial z}\,dx\,dy\,dz,$$
since $dx\,dz\,dy = -dx\,dy\,dz$. So we must *subtract* this last equation from the previous one to get $(*)$. $\quad ∎$`,
    notes: md`(In (3), multiplication takes precedence: read $(d\phi \wedge \psi) - (\phi \wedge d\psi)$.) To remember the sign, treat $d$ as if it were a 1-form: to reach $\psi$ it must change places with $\phi$, which by [[1.6.2]] costs a minus sign.

Forms express complicated relations among partial derivatives very efficiently: the wedge product discards early the terms that would cancel, and $d$ replaces the three operations of classical vector analysis (gradient, curl, divergence — Exercise 8). Also $d(df) = 0$ for every function (Exercise 3).

The checks compare both sides of (1), (2), (3) at sample points, with the forms in the Algebra view.`,
    scene: {
      views: [],
      build: (b) => {
        b.add('function', 'f', { expr: 'x^2*y', levels: '', box: 2, res: 30, dim: 3 });
        b.add('function', 'g', { expr: 'sin(z) + x*y', levels: '', box: 2, res: 30, dim: 3 });
        b.add('oneForm', 'phi', { comps: '(y*z, x, z^2)' });
        b.add('oneForm', 'psi', { comps: '(x^2, -z, y)' });
        b.add('differential', 'df', { f: 'f' });
        b.add('differential', 'dg', { f: 'g' });
        b.add('function', 'fg', { expr: 'f*g', levels: '', box: 2, res: 30, dim: 3 }, { caption: 'fg' });
        b.add('differential', 'l1', { f: 'fg' }, { caption: 'd(fg)' });
        b.add('wedge', 'gdf', { phi: 'g', psi: 'df' }, { caption: 'df\\,g' });
        b.add('wedge', 'fdg', { phi: 'f', psi: 'dg' }, { caption: 'f\\,dg' });
        b.add('formSum', 'r1', { phi: 'gdf', op: '+', psi: 'fdg' }, { caption: 'df\\,g + f\\,dg' });
        b.add('wedge', 'fphi', { phi: 'f', psi: 'phi' }, { caption: 'f\\phi' });
        b.add('exteriorDerivative', 'l2', { phi: 'fphi' }, { caption: 'd(f\\phi)' });
        b.add('exteriorDerivative', 'dphi', { phi: 'phi' });
        b.add('exteriorDerivative', 'dpsi', { phi: 'psi' });
        b.add('wedge', 'dfphi', { phi: 'df', psi: 'phi' }, { caption: 'df \\wedge \\phi' });
        b.add('wedge', 'fdphi', { phi: 'f', psi: 'dphi' }, { caption: 'f\\,d\\phi' });
        b.add('formSum', 'r2', { phi: 'dfphi', op: '+', psi: 'fdphi' }, { caption: 'df \\wedge \\phi + f\\,d\\phi' });
        b.add('wedge', 'pp', { phi: 'phi', psi: 'psi' }, { caption: '\\phi \\wedge \\psi' });
        b.add('exteriorDerivative', 'l3', { phi: 'pp' }, { caption: 'd(\\phi \\wedge \\psi)' });
        b.add('wedge', 'a3', { phi: 'dphi', psi: 'psi' }, { caption: 'd\\phi \\wedge \\psi' });
        b.add('wedge', 'b3', { phi: 'phi', psi: 'dpsi' }, { caption: '\\phi \\wedge d\\psi' });
        b.add('formSum', 'r3', { phi: 'a3', op: '-', psi: 'b3' }, { caption: 'd\\phi \\wedge \\psi - \\phi \\wedge d\\psi' });
      },
      select: 'l3',
    },
    checks: [
      { label: md`(1)\ d(fg) - (df\,g + f\,dg)`, value: (s) => formDiff(s, form(s, 'l1'), form(s, 'r1')) },
      { label: md`(2)\ d(f\phi) - (df \wedge \phi + f\,d\phi)`, value: (s) => formDiff(s, form(s, 'l2'), form(s, 'r2')) },
      { label: md`(3)\ d(\phi \wedge \psi) - (d\phi \wedge \psi - \phi \wedge d\psi)`, value: (s) => formDiff(s, form(s, 'l3'), form(s, 'r3')) },
    ],
  },

  // ===========================================================================================
  // §1.7 Mappings
  {
    id: '1.7.1',
    statement: md`Given a function $F\colon \mathbf{R}^n \to \mathbf{R}^m$, let $f_1, f_2, \dots, f_m$ denote the real-valued functions on $\mathbf{R}^n$ such that
$$F(\mathbf{p}) = (f_1(\mathbf{p}), f_2(\mathbf{p}), \dots, f_m(\mathbf{p}))$$
for all points $\mathbf{p}$ in $\mathbf{R}^n$. These functions are called the **Euclidean coordinate functions** of $F$, and we write $F = (f_1, f_2, \dots, f_m)$.`,
    notes: md`$F$ is **differentiable** when its coordinate functions are; a differentiable $F\colon \mathbf{R}^n \to \mathbf{R}^m$ is called a **mapping**. Note $f_i = x_i(F)$, with $x_1, \dots, x_m$ the coordinate functions of $\mathbf{R}^m$.

For $n = 3$, $m = 1$ a mapping is a function on $\mathbf{R}^3$; for $n = 1$, $m = 3$ it is a curve. The book is mostly interested in $\mathbf{R}^2 \to \mathbf{R}^2$, $\mathbf{R}^2 \to \mathbf{R}^3$ and $\mathbf{R}^3 \to \mathbf{R}^3$. (The sandbox draws $\mathbf{R}^2 \to \mathbf{R}^2$ in the 2D view and $\mathbf{R}^3 \to \mathbf{R}^3$ in the 3D view, as the image of a coordinate grid.)

**The book's example.** $F = (x^2, yz, xy)$, i.e. $F(\mathbf{p}) = (x(\mathbf{p})^2, y(\mathbf{p})z(\mathbf{p}), x(\mathbf{p})y(\mathbf{p}))$; pointwise, $F(p_1, p_2, p_3) = (p_1^2, p_2p_3, p_1p_2)$. So $F(1, -2, 0) = (1, 0, -2)$ and $F(-3, 1, 3) = (9, 3, -3)$.

Curves are simple while mappings — even $\mathbf{R}^2 \to \mathbf{R}^2$ — can be complicated, so the book uses curves at every stage to understand mappings.`,
    tryThis: [md`Drag $\mathbf{p}$ and watch $F(\mathbf{p})$.`, md`Set $\mathbf{p} = (-3, 1, 3)$ in the Algebra view: $F(\mathbf{p}) = (9, 3, -3)$.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('mapping', 'F', { comps: '(x^2, y*z, x*y)', box: 1, lines: 5, showDomain: true, center: '(0, 0, 0)', dim: 3 });
        b.add('point', 'p', { coords: '(1, -2, 0)' });
        b.add('imagePoint', 'Fp', { F: 'F', p: 'p' }, { caption: 'F(\\mathbf{p})' });
      },
      select: 'F',
    },
    checks: [
      {
        label: md`F(\mathbf{p}) - (p_1^2,\ p_2p_3,\ p_1p_2)`,
        value: (s) => {
          const [a, b, c] = point(s, 'p');
          return diff(point(s, 'Fp'), [a * a, b * c, a * b]);
        },
      },
    ],
  },
  {
    id: '1.7.2',
    statement: md`If $\alpha\colon I \to \mathbf{R}^n$ is a curve in $\mathbf{R}^n$ and $F\colon \mathbf{R}^n \to \mathbf{R}^m$ is a mapping, then the composite function $\beta = F(\alpha)\colon I \to \mathbf{R}^m$ is a curve in $\mathbf{R}^m$ called the **image of $\alpha$ under $F$**.`,
    notes: md`Fig. 1.13. In the 2D view, $F(u, v) = (u^2 - v^2, 2uv)$ of Example [[1.7.3]] maps the circle $\alpha$ of radius $r$ to the circle $\beta$ of radius $r^2$, traversed twice; the moving points show $\beta(t_0) = F(\alpha(t_0))$. In the 3D view, a helix and its image under the linear mapping $F = (x - y, x + y, 2z)$.`,
    tryThis: [md`Animate $t_0$: $\beta(t_0)$ goes around twice as fast as $\alpha(t_0)$.`],
    scene: {
      views: ['2d', '3d'],
      build: (b) => {
        b.slider('r', 1.2, 0.3, 1.6, 0.01);
        b.slider('t0', 0.6, 0, 6.28, 0.01);
        b.add('mapping', 'F', { comps: '(x^2 - y^2, 2*x*y)', box: 1.6, lines: 9, showDomain: false, center: '(0, 0)', dim: 2 }, { visible: false });
        b.add('curve', 'alpha', { comps: '(r*cos(t), r*sin(t))', param: 't', a: '0', b: '2*pi', dim: 2 });
        b.add('imageCurve', 'beta', { F: 'F', curve: 'alpha' }, { color: '#bf3989', caption: '\\beta = F(\\alpha)' });
        b.add('pointOnCurve', 'A0', { curve: 'alpha', t0: 't0' }, { caption: '\\alpha(t_0)' });
        b.add('pointOnCurve', 'B0', { curve: 'beta', t0: 't0' }, { color: '#bf3989', caption: '\\beta(t_0)' });
        b.add('mapping', 'G', { comps: '(x - y, x + y, 2*z)', box: 1, lines: 3, showDomain: false, center: '(0, 0, 0)', dim: 3 }, { visible: false, caption: 'F' });
        b.add('curve', 'alpha3', { comps: '(cos(t), sin(t), t/6)', param: 't', a: '-2*pi', b: '2*pi', dim: 3 }, { caption: '\\alpha' });
        b.add('imageCurve', 'beta3', { F: 'G', curve: 'alpha3' }, { color: '#bf3989', caption: 'F(\\alpha)' });
      },
      select: 'beta',
    },
    checks: [
      {
        label: md`\beta(t_0) - F(\alpha(t_0))`,
        value: (s) => {
          const [u, v] = point(s, 'A0');
          return diff(point(s, 'B0'), [u * u - v * v, 2 * u * v]);
        },
      },
    ],
  },
  {
    id: '1.7.3',
    statement: md`**Mappings.**

(1) Consider $F\colon \mathbf{R}^3 \to \mathbf{R}^3$ with $F = (x - y, x + y, 2z)$, that is, $F(p_1, p_2, p_3) = (p_1 - p_2, p_1 + p_2, 2p_3)$. It is a **linear** transformation, so it is completely determined by its values at three linearly independent points, say the unit points $\mathbf{u}_1 = (1, 0, 0)$, $\mathbf{u}_2 = (0, 1, 0)$, $\mathbf{u}_3 = (0, 0, 1)$.

(2) Consider $F\colon \mathbf{R}^2 \to \mathbf{R}^2$ with $F(u, v) = (u^2 - v^2, 2uv)$, where $u$ and $v$ are the coordinate functions of $\mathbf{R}^2$. Its effect on the circle $\alpha(t) = (r\cos t, r\sin t)$, $0 \le t \le 2\pi$, is
$$\beta(t) = F(\alpha(t)) = (r^2\cos^2 t - r^2\sin^2 t,\ 2r^2\cos t\sin t) = (r^2\cos 2t,\ r^2\sin 2t),$$
using $\cos 2t = \cos^2 t - \sin^2 t$ and $\sin 2t = 2\sin t\cos t$. So $\beta$ makes **two** counterclockwise trips around the circle of radius $r^2$ (Fig. 1.14).`,
    notes: md`Only simple mappings can be understood from finitely many values; (1) is one. The effect of (2) is to wrap the plane smoothly around itself twice, leaving the origin fixed ($F(0, 0) = (0, 0)$): each circle of radius $r$ is wrapped twice around the circle of radius $r^2$. (With complex numbers, $F$ is $z \mapsto z^2$.)

Differential calculus approximates smooth objects by linear ones — like $\Delta x \mapsto f'(x)\Delta x$ for a function. The tangent map ([[1.7.4]]) is the analogous linear approximation of a mapping.

The 3D view shows (1): the image of the unit cube's grid and the images of $\mathbf{u}_1, \mathbf{u}_2, \mathbf{u}_3$. The 2D view shows (2): the image of a polar-looking grid, a circle and its image.`,
    tryThis: [md`Change $r$: the image circle has radius $r^2$.`, md`Animate $t_0$.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('mapping', 'F', { comps: '(x - y, x + y, 2*z)', box: 0.5, lines: 3, showDomain: true, center: '(0.5, 0.5, 0.5)', dim: 3 });
        b.add('point', 'u1', { coords: '(1, 0, 0)' }, { caption: '\\mathbf{u}_1' });
        b.add('point', 'u2', { coords: '(0, 1, 0)' }, { caption: '\\mathbf{u}_2' });
        b.add('point', 'u3', { coords: '(0, 0, 1)' }, { caption: '\\mathbf{u}_3' });
        b.add('imagePoint', 'Fu1', { F: 'F', p: 'u1' }, { caption: 'F(\\mathbf{u}_1)', color: '#bf3989' });
        b.add('imagePoint', 'Fu2', { F: 'F', p: 'u2' }, { caption: 'F(\\mathbf{u}_2)', color: '#bf3989' });
        b.add('imagePoint', 'Fu3', { F: 'F', p: 'u3' }, { caption: 'F(\\mathbf{u}_3)', color: '#bf3989' });
        b.slider('r', 1.2, 0.3, 1.6, 0.01);
        b.slider('t0', 0.6, 0, 6.28, 0.01);
        b.add('mapping', 'G', { comps: '(x^2 - y^2, 2*x*y)', box: 1.4, lines: 9, showDomain: false, center: '(0, 0)', dim: 2 }, { caption: 'F', color: '#c4c9cf' });
        b.add('curve', 'alpha', { comps: '(r*cos(t), r*sin(t))', param: 't', a: '0', b: '2*pi', dim: 2 });
        b.add('imageCurve', 'beta', { F: 'G', curve: 'alpha' }, { color: '#bf3989' });
        b.add('pointOnCurve', 'A0', { curve: 'alpha', t0: 't0' }, { caption: '\\alpha(t_0)' });
        b.add('pointOnCurve', 'B0', { curve: 'beta', t0: 't0' }, { color: '#bf3989', caption: '\\beta(t_0)' });
      },
      select: 'beta',
    },
    checks: [
      {
        label: md`\beta(t_0) - (r^2\cos 2t_0,\ r^2\sin 2t_0)`,
        value: (s) => {
          const r = num(s, 'r');
          const t = num(s, 't0');
          return diff(point(s, 'B0'), [r * r * Math.cos(2 * t), r * r * Math.sin(2 * t)]);
        },
      },
    ],
  },
  {
    id: '1.7.4',
    statement: md`Let $F\colon \mathbf{R}^n \to \mathbf{R}^m$ be a mapping. If $\mathbf{v}$ is a tangent vector to $\mathbf{R}^n$ at $\mathbf{p}$, let $F_*(\mathbf{v})$ be the initial velocity of the curve $t \mapsto F(\mathbf{p} + t\mathbf{v})$. The resulting function $F_*$ sends tangent vectors to $\mathbf{R}^n$ to tangent vectors to $\mathbf{R}^m$, and is called the **tangent map** of $F$.`,
    notes: md`Motivation (Fig. 1.15): $\mathbf{R}^n$ is filled by the radial lines $\alpha(t) = \mathbf{p} + t\mathbf{v}$ starting at $\mathbf{p}$, so $\mathbf{R}^m$ is filled near $F(\mathbf{p})$ by their image curves $\beta(t) = F(\mathbf{p} + t\mathbf{v})$. One approximates $F$ near $\mathbf{p}$ by the map $F_*$ sending each initial velocity $\alpha'(0) = \mathbf{v}_\mathbf{p}$ to the initial velocity $\beta'(0)$.

The figure shows, in both views, $\mathbf{v}_\mathbf{p}$, the line $\mathbf{p} + t\mathbf{v}$, its image curve $\beta$, and $F_*(\mathbf{v}) = \beta'(0)$ at $F(\mathbf{p})$.`,
    tryThis: [md`Drag $\mathbf{p}$ or edit $\mathbf{v}$: $F_*(\mathbf{v})$ stays tangent to the image curve at $F(\mathbf{p})$.`],
    scene: {
      views: ['2d', '3d'],
      build: (b) => {
        b.add('mapping', 'F', { comps: '(x^2 - y^2, 2*x*y)', box: 1.3, lines: 9, showDomain: false, center: '(0, 0)', dim: 2 }, { color: '#d0d7de' });
        b.add('point', 'p', { coords: '(0.8, 0.5)' });
        b.add('tangentVector', 'v', { v: '(0.5, 0.4)', p: 'p' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('straightLine', 'ell', { p: 'p', q: 'v', a: '-1', b: '1', dim: 2 }, { caption: '\\mathbf{p} + t\\mathbf{v}', color: '#8c959f' });
        b.add('imageCurve', 'beta', { F: 'F', curve: 'ell' }, { color: '#bf3989', caption: '\\beta' });
        b.add('tangentMap', 'Fv', { F: 'F', v: 'v' }, { caption: 'F_*(\\mathbf{v})' });
        b.add('velocity', 'b0', { curve: 'beta', t0: '0' }, { visible: false, caption: "\\beta'(0)" });
        b.add('mapping', 'G', { comps: '(x^2, y*z, x*y)', box: 1, lines: 3, showDomain: false, center: '(0, 0, 0)', dim: 3 }, { visible: false, caption: 'F' });
        b.add('point', 'p3', { coords: '(1, 0.5, 1)' }, { caption: '\\mathbf{p}' });
        b.add('tangentVector', 'v3', { v: '(0.6, 0.6, -0.4)', p: 'p3' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('straightLine', 'ell3', { p: 'p3', q: 'v3', a: '-1', b: '1', dim: 3 }, { caption: '\\mathbf{p} + t\\mathbf{v}', color: '#8c959f' });
        b.add('imageCurve', 'beta3', { F: 'G', curve: 'ell3' }, { color: '#bf3989', caption: '\\beta' });
        b.add('tangentMap', 'Gv', { F: 'G', v: 'v3' }, { caption: 'F_*(\\mathbf{v})' });
        b.add('velocity', 'b30', { curve: 'beta3', t0: '0' }, { visible: false, caption: "\\beta'(0)" });
      },
      select: 'Fv',
    },
    checks: [
      { label: md`F_*(\mathbf{v}) - \beta'(0) \text{ in } \mathbf{R}^2`, value: (s) => diff(vec(s, 'Fv').v, vec(s, 'b0').v) + diff(vec(s, 'Fv').p, vec(s, 'b0').p) },
      { label: md`F_*(\mathbf{v}) - \beta'(0) \text{ in } \mathbf{R}^3`, value: (s) => diff(vec(s, 'Gv').v, vec(s, 'b30').v) + diff(vec(s, 'Gv').p, vec(s, 'b30').p) },
    ],
  },
  {
    id: '1.7.5',
    statement: md`Let $F = (f_1, f_2, \dots, f_m)$ be a mapping from $\mathbf{R}^n$ to $\mathbf{R}^m$. If $\mathbf{v}$ is a tangent vector to $\mathbf{R}^n$ at $\mathbf{p}$, then
$$F_*(\mathbf{v}) = (\mathbf{v}[f_1], \dots, \mathbf{v}[f_m]) \quad \text{at } F(\mathbf{p}).$$`,
    proof: md`For definiteness take $m = 3$. Then
$$\beta(t) = F(\mathbf{p} + t\mathbf{v}) = (f_1(\mathbf{p} + t\mathbf{v}),\ f_2(\mathbf{p} + t\mathbf{v}),\ f_3(\mathbf{p} + t\mathbf{v})).$$
By definition $F_*(\mathbf{v}) = \beta'(0)$, obtained by differentiating the coordinate functions of $\beta$ at $t = 0$ (Definition [[1.4.3]]). But
$$\frac{d}{dt}\big(f_i(\mathbf{p} + t\mathbf{v})\big)\Big|_{t=0} = \mathbf{v}[f_i].$$
Thus $F_*(\mathbf{v}) = (\mathbf{v}[f_1], \mathbf{v}[f_2], \mathbf{v}[f_3])\big|_{\beta(0)}$, and $\beta(0) = F(\mathbf{p})$. $\quad ∎$`,
    notes: md`For each point $\mathbf{p}$, $F_*$ sends $T_\mathbf{p}(\mathbf{R}^n)$ to $T_{F(\mathbf{p})}(\mathbf{R}^m)$; the restriction $F_{*\mathbf{p}}\colon T_\mathbf{p}(\mathbf{R}^n) \to T_{F(\mathbf{p})}(\mathbf{R}^m)$ is the **tangent map of $F$ at $\mathbf{p}$** (compare $f'$ giving the derivative of $f$ at each point). The figure computes the three directional derivatives $\mathbf{v}[f_i]$ of the coordinate functions of $F = (x^2, yz, xy)$.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('mapping', 'F', { comps: '(x^2, y*z, x*y)', box: 1, lines: 3, showDomain: false, center: '(0, 0, 0)', dim: 3 }, { visible: false });
        b.add('function', 'f1', { expr: 'x^2', levels: '', box: 2, res: 30, dim: 3 });
        b.add('function', 'f2', { expr: 'y*z', levels: '', box: 2, res: 30, dim: 3 });
        b.add('function', 'f3', { expr: 'x*y', levels: '', box: 2, res: 30, dim: 3 });
        b.add('point', 'p', { coords: '(1, 0.5, 1)' });
        b.add('tangentVector', 'v', { v: '(0.6, 0.6, -0.4)', p: 'p' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('tangentMap', 'Fv', { F: 'F', v: 'v' }, { caption: 'F_*(\\mathbf{v})' });
        b.add('directionalDerivative', 'vf1', { v: 'v', f: 'f1' }, { caption: '\\mathbf{v}[f_1]' });
        b.add('directionalDerivative', 'vf2', { v: 'v', f: 'f2' }, { caption: '\\mathbf{v}[f_2]' });
        b.add('directionalDerivative', 'vf3', { v: 'v', f: 'f3' }, { caption: '\\mathbf{v}[f_3]' });
      },
      select: 'Fv',
    },
    checks: [{ label: md`F_*(\mathbf{v}) - (\mathbf{v}[f_1], \mathbf{v}[f_2], \mathbf{v}[f_3])`, value: (s) => diff(vec(s, 'Fv').v, [num(s, 'vf1'), num(s, 'vf2'), num(s, 'vf3')]) }],
  },
  {
    id: '1.7.6',
    statement: md`If $F\colon \mathbf{R}^n \to \mathbf{R}^m$ is a mapping, then at each point $\mathbf{p}$ of $\mathbf{R}^n$ the tangent map $F_{*\mathbf{p}}\colon T_\mathbf{p}(\mathbf{R}^n) \to T_{F(\mathbf{p})}(\mathbf{R}^m)$ is a linear transformation.`,
    proof: md`We must show that for tangent vectors $\mathbf{v}$, $\mathbf{w}$ at $\mathbf{p}$ and numbers $a$, $b$,
$$F_*(a\mathbf{v} + b\mathbf{w}) = aF_*(\mathbf{v}) + bF_*(\mathbf{w}).$$
This follows at once from Proposition [[1.7.5]] and the linearity in assertion (1) of Theorem [[1.3.3]]. $\quad ∎$`,
    notes: md`In fact $F_{*\mathbf{p}}$ is *the linear transformation that best approximates $F$ near $\mathbf{p}$* — an idea developed in advanced calculus, where it is used to prove Theorem [[1.7.10]]. Another consequence of [[1.7.5]] is that mappings preserve velocities of curves ([[1.7.7]]).`,
    tryThis: [md`Move $a$ and $b$: $F_*(a\mathbf{v} + b\mathbf{w})$ is always $aF_*(\mathbf{v}) + bF_*(\mathbf{w})$ — even though $F$ itself is not linear.`],
    scene: {
      views: ['2d'],
      build: (b) => {
        b.slider('a', 1, -2, 2, 0.01);
        b.slider('b', 1, -2, 2, 0.01);
        b.add('mapping', 'F', { comps: '(x^2 - y^2, 2*x*y)', box: 1.3, lines: 9, showDomain: false, center: '(0, 0)', dim: 2 }, { color: '#d0d7de' });
        b.add('point', 'p', { coords: '(0.8, 0.5)' });
        b.add('tangentVector', 'v', { v: '(0.5, 0)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('tangentVector', 'w', { v: '(0, 0.4)', p: 'p' }, { color: '#0969da', caption: '\\mathbf{w}' });
        b.add('combination', 'u', { expr: 'a*v + b*w' }, { color: '#1a7f37', caption: 'a\\mathbf{v} + b\\mathbf{w}' });
        b.add('tangentMap', 'Fv', { F: 'F', v: 'v' }, { caption: 'F_*(\\mathbf{v})' });
        b.add('tangentMap', 'Fw', { F: 'F', v: 'w' }, { color: '#0969da', caption: 'F_*(\\mathbf{w})' });
        b.add('tangentMap', 'Fu', { F: 'F', v: 'u' }, { color: '#1a7f37', caption: 'F_*(a\\mathbf{v} + b\\mathbf{w})' });
      },
      select: 'Fu',
    },
    checks: [
      {
        label: md`F_*(a\mathbf{v} + b\mathbf{w}) - aF_*(\mathbf{v}) - bF_*(\mathbf{w})`,
        value: (s) => diff(vec(s, 'Fu').v, vec(s, 'Fv').v.map((x, i) => num(s, 'a') * x + num(s, 'b') * vec(s, 'Fw').v[i])),
      },
    ],
  },
  {
    id: '1.7.7',
    statement: md`Let $F\colon \mathbf{R}^n \to \mathbf{R}^m$ be a mapping. If $\beta = F(\alpha)$ is the image of a curve $\alpha$ in $\mathbf{R}^n$, then $\beta' = F_*(\alpha')$.`,
    proof: md`Again take $m = 3$. If $F = (f_1, f_2, f_3)$, then $\beta = F(\alpha) = (f_1(\alpha), f_2(\alpha), f_3(\alpha))$. Hence Proposition [[1.7.5]] gives
$$F_*(\alpha') = (\alpha'[f_1], \alpha'[f_2], \alpha'[f_3]).$$
But by Lemma [[1.4.6]], $\alpha'[f_i] = \dfrac{d f_i(\alpha)}{dt}$. Hence
$$F_*(\alpha'(t)) = \left(\frac{df_1(\alpha)}{dt}(t), \frac{df_2(\alpha)}{dt}(t), \frac{df_3(\alpha)}{dt}(t)\right)_{\beta(t)} = \beta'(t). \qquad ∎$$`,
    notes: md`"Mappings preserve velocities of curves." In both views: a curve $\alpha$, its image $\beta = F(\alpha)$, the velocity $\alpha'(t_0)$, and $F_*(\alpha'(t_0))$ — which coincides with $\beta'(t_0)$.`,
    tryThis: [md`Animate $t_0$ or drag the point along $\alpha$.`],
    scene: {
      views: ['2d', '3d'],
      build: (b) => {
        b.slider('t0', 1, 0, 6.28, 0.01);
        b.add('mapping', 'F', { comps: '(x^2 - y^2, 2*x*y)', box: 1.5, lines: 9, showDomain: false, center: '(0, 0)', dim: 2 }, { color: '#d0d7de' });
        b.add('curve', 'alpha', { comps: '(0.9 + 0.4*cos(t), 0.3 + 0.4*sin(t))', param: 't', a: '0', b: '2*pi', dim: 2 });
        b.add('imageCurve', 'beta', { F: 'F', curve: 'alpha' }, { color: '#bf3989', caption: '\\beta = F(\\alpha)' });
        b.add('velocity', 'va', { curve: 'alpha', t0: 't0' }, { caption: "\\alpha'(t_0)" });
        b.add('tangentMap', 'Fva', { F: 'F', v: 'va' }, { caption: "F_*(\\alpha'(t_0))" });
        b.add('velocity', 'vb', { curve: 'beta', t0: 't0' }, { visible: false, caption: "\\beta'(t_0)" });
        b.add('mapping', 'G', { comps: '(x^2, y*z, x*y)', box: 1, lines: 3, showDomain: false, center: '(0, 0, 0)', dim: 3 }, { visible: false, caption: 'F' });
        b.add('curve', 'alpha3', { comps: '(cos(t), sin(t), t/4)', param: 't', a: '0', b: '2*pi', dim: 3 }, { caption: '\\alpha' });
        b.add('imageCurve', 'beta3', { F: 'G', curve: 'alpha3' }, { color: '#bf3989', caption: 'F(\\alpha)' });
        b.add('velocity', 'va3', { curve: 'alpha3', t0: 't0' }, { caption: "\\alpha'(t_0)" });
        b.add('tangentMap', 'Fva3', { F: 'G', v: 'va3' }, { caption: "F_*(\\alpha'(t_0))" });
        b.add('velocity', 'vb3', { curve: 'beta3', t0: 't0' }, { visible: false, caption: "\\beta'(t_0)" });
      },
      select: 'Fva',
    },
    checks: [
      { label: md`\beta'(t_0) - F_*(\alpha'(t_0)) \text{ in } \mathbf{R}^2`, value: (s) => diff(vec(s, 'vb').v, vec(s, 'Fva').v) },
      { label: md`\beta'(t_0) - F_*(\alpha'(t_0)) \text{ in } \mathbf{R}^3`, value: (s) => diff(vec(s, 'vb3').v, vec(s, 'Fva3').v) },
    ],
  },
  {
    id: '1.7.8',
    statement: md`If $F = (f_1, \dots, f_m)$ is a mapping from $\mathbf{R}^n$ to $\mathbf{R}^m$, then
$$F_*(U_j(\mathbf{p})) = \sum_{i=1}^m \frac{\partial f_i}{\partial x_j}(\mathbf{p})\,\bar U_i(F(\mathbf{p})) \qquad (1 \le j \le n),$$
where $\{U_j\}$ and $\{\bar U_i\}$ are the natural frame fields of $\mathbf{R}^n$ and $\mathbf{R}^m$.`,
    proof: md`This follows directly from Proposition [[1.7.5]], since $U_j[f_i] = \partial f_i/\partial x_j$. $\quad ∎$`,
    notes: md`The matrix
$$\left(\frac{\partial f_i}{\partial x_j}(\mathbf{p})\right)_{1 \le i \le m,\ 1 \le j \le n}$$
is the **Jacobian matrix** of $F$ at $\mathbf{p}$ (for $m = n = 1$ it is just the derivative of $F$ at $\mathbf{p}$). Its $j$th column is $F_*(U_j(\mathbf{p}))$. Just as the derivative of a function gives information about the function, $F_*$ is used to study $F$.

The figure shows $U_1(\mathbf{p}), U_2(\mathbf{p})$ (2D) and $U_1(\mathbf{p}), U_2(\mathbf{p}), U_3(\mathbf{p})$ (3D) and their images; select $F$ to read its Jacobian matrix in the Course view.`,
    scene: {
      views: ['2d', '3d'],
      build: (b) => {
        b.add('mapping', 'F', { comps: '(x^2 - y^2, 2*x*y)', box: 1.4, lines: 9, showDomain: false, center: '(0, 0)', dim: 2 }, { color: '#d0d7de' });
        b.add('point', 'p', { coords: '(0.8, 0.5)' });
        b.add('tangentVector', 'u1', { v: '(1, 0)', p: 'p' }, { color: '#d1242f', caption: 'U_1(\\mathbf{p})' });
        b.add('tangentVector', 'u2', { v: '(0, 1)', p: 'p' }, { color: '#1a7f37', caption: 'U_2(\\mathbf{p})' });
        b.add('tangentMap', 'Fu1', { F: 'F', v: 'u1' }, { color: '#d1242f', caption: 'F_*(U_1(\\mathbf{p}))' });
        b.add('tangentMap', 'Fu2', { F: 'F', v: 'u2' }, { color: '#1a7f37', caption: 'F_*(U_2(\\mathbf{p}))' });
        b.add('mapping', 'G', { comps: '(x^2, y*z, x*y)', box: 1, lines: 3, showDomain: false, center: '(0, 0, 0)', dim: 3 }, { visible: false, caption: 'F' });
        b.add('point', 'p3', { coords: '(1, 0.5, 1)' }, { caption: '\\mathbf{p}' });
        b.add('naturalFrame', 'U', { p: 'p3' });
        b.add('tangentVector', 'e1', { v: '(1, 0, 0)', p: 'p3' }, { visible: false, caption: 'U_1(\\mathbf{p})' });
        b.add('tangentVector', 'e2', { v: '(0, 1, 0)', p: 'p3' }, { visible: false, caption: 'U_2(\\mathbf{p})' });
        b.add('tangentVector', 'e3', { v: '(0, 0, 1)', p: 'p3' }, { visible: false, caption: 'U_3(\\mathbf{p})' });
        b.add('tangentMap', 'Ge1', { F: 'G', v: 'e1' }, { color: '#d1242f', caption: 'F_*(U_1)' });
        b.add('tangentMap', 'Ge2', { F: 'G', v: 'e2' }, { color: '#1a7f37', caption: 'F_*(U_2)' });
        b.add('tangentMap', 'Ge3', { F: 'G', v: 'e3' }, { color: '#0550ae', caption: 'F_*(U_3)' });
      },
      select: 'F',
    },
    checks: [
      {
        label: md`F_*(U_j(\mathbf{p})) - (\partial f_i/\partial x_j(\mathbf{p}))_i \text{ in } \mathbf{R}^2`,
        value: (s) => {
          const [u, v] = point(s, 'p');
          return Math.max(diff(vec(s, 'Fu1').v, [2 * u, 2 * v]), diff(vec(s, 'Fu2').v, [-2 * v, 2 * u]));
        },
      },
      {
        label: md`\text{same in } \mathbf{R}^3 \text{ for } F = (x^2, yz, xy)`,
        value: (s) => {
          const [x, y, z] = point(s, 'p3');
          return Math.max(diff(vec(s, 'Ge1').v, [2 * x, 0, y]), diff(vec(s, 'Ge2').v, [0, z, x]), diff(vec(s, 'Ge3').v, [0, y, 0]));
        },
      },
    ],
  },
  {
    id: '1.7.9',
    statement: md`A mapping $F\colon \mathbf{R}^n \to \mathbf{R}^m$ is **regular** provided that at every point $\mathbf{p}$ of $\mathbf{R}^n$ the tangent map $F_{*\mathbf{p}}$ is one-to-one.`,
    notes: md`Tangent maps are linear, so by linear algebra the following are equivalent: (1) $F_{*\mathbf{p}}$ is one-to-one; (2) $F_*(\mathbf{v}_\mathbf{p}) = 0$ implies $\mathbf{v}_\mathbf{p} = 0$; (3) the Jacobian matrix of $F$ at $\mathbf{p}$ has rank $n$, the dimension of the domain. If $V$ and $W$ have the same dimension, a linear $T\colon V \to W$ is one-to-one iff it is onto, i.e. iff it is a linear isomorphism.

A mapping with a differentiable inverse mapping is a **diffeomorphism**. Everything here remains valid for open sets of Euclidean spaces.

The figure: $F(u, v) = (u^2 - v^2, 2uv)$ has $\det J = 4(u^2 + v^2)$, so $F_{*\mathbf{p}}$ is an isomorphism at every point except the origin (Exercise 4) — **$F$ is not regular**. Drag $\mathbf{p}$ to the origin: $F_*$ sends both $\mathbf{v}$ and $\mathbf{w}$ to $0$.`,
    tryThis: [md`Drag $\mathbf{p}$ to $(0, 0)$ and watch $F_*(\mathbf{v})$, $F_*(\mathbf{w})$ and $\det J$.`],
    scene: {
      views: ['2d'],
      build: (b) => {
        b.add('mapping', 'F', { comps: '(x^2 - y^2, 2*x*y)', box: 1.3, lines: 9, showDomain: false, center: '(0, 0)', dim: 2 }, { color: '#d0d7de' });
        b.add('point', 'p', { coords: '(0.6, 0.4)' });
        b.add('tangentVector', 'v', { v: '(0.5, 0)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('tangentVector', 'w', { v: '(0, 0.5)', p: 'p' }, { color: '#0969da', caption: '\\mathbf{w}' });
        b.add('tangentMap', 'Fv', { F: 'F', v: 'v' }, { caption: 'F_*(\\mathbf{v})' });
        b.add('tangentMap', 'Fw', { F: 'F', v: 'w' }, { color: '#0969da', caption: 'F_*(\\mathbf{w})' });
        b.add('slider', 'detJ', { value: '4*(x(p)^2 + y(p)^2)', min: 0, max: 10, step: 0.01 }, { caption: '\\det J(\\mathbf{p})' });
      },
      select: 'detJ',
    },
    checks: [
      {
        label: md`\det J(\mathbf{p}) - \det\big(F_*(U_1), F_*(U_2)\big)`,
        value: (s) => {
          const a = vec(s, 'Fv').v.map((x) => x / 0.5);
          const c = vec(s, 'Fw').v.map((x) => x / 0.5);
          return num(s, 'detJ') - (a[0] * c[1] - a[1] * c[0]);
        },
      },
    ],
  },
  {
    id: '1.7.10',
    statement: md`Let $F\colon \mathbf{R}^n \to \mathbf{R}^n$ be a mapping between Euclidean spaces of the same dimension. If $F_{*\mathbf{p}}$ is one-to-one at a point $\mathbf{p}$, there is an open set $\mathcal{U}$ containing $\mathbf{p}$ such that $F$ restricted to $\mathcal{U}$ is a diffeomorphism of $\mathcal{U}$ onto an open set $\mathcal{V}$.`,
    proof: md`The book states this fundamental result of advanced calculus **without proof**. (The idea: $F_{*\mathbf{p}}$ is the best linear approximation of $F$ near $\mathbf{p}$, and an invertible linear approximation forces $F$ itself to be invertible nearby.)`,
    notes: md`It is called the **inverse function theorem** because it asserts that the restricted mapping $\mathcal{U} \to \mathcal{V}$ has a differentiable inverse $\mathcal{V} \to \mathcal{U}$. Exercise 6 hints at its importance: a one-to-one, onto mapping need not be a diffeomorphism, but a one-to-one, onto *regular* mapping is.

The figure uses $F(u, v) = (u^2 - v^2, 2uv)$ again. Around the movable point $\mathbf{p}$ (where $\det J \ne 0$) the image of a small square grid is a slightly bent square — $F$ is one-to-one there, with a smooth inverse. Around the origin, where $F_*$ is not one-to-one, the image of a small square is folded twice around: no neighbourhood of $0$ is mapped one-to-one.`,
    tryThis: [md`Drag $\mathbf{p}$ toward the origin: the image of its small square degenerates.`],
    scene: {
      views: ['2d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(0.9, 0.4)' });
        b.slider('h', 0.25, 0.05, 0.5, 0.01, { caption: 'h' });
        b.add('mapping', 'Fp', { comps: '(x^2 - y^2, 2*x*y)', box: 'h', lines: 7, showDomain: true, center: 'p', dim: 2 }, { caption: 'F|_{\\mathcal{U}}', color: '#1a7f37' });
        b.add('mapping', 'F0', { comps: '(x^2 - y^2, 2*x*y)', box: 'h', lines: 7, showDomain: true, center: '(0, 0)', dim: 2 }, { caption: 'F \\text{ near } 0', color: '#cf222e' });
      },
      select: 'Fp',
    },
  },
];
