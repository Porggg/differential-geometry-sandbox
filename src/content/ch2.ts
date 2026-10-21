// Chapter 2 — Frame Fields. (2.3.2, 2.3.3, 2.4.3 and n.curvature are in entries.ts / notions.ts.)
// Wording is ours; structure, notation and numbering follow O'Neill.

import type { Entry } from './types';
import { cross, det3, dot, norm } from '../math/vec';
import type { FunctionValue } from '../core/types';
import type { Scene } from '../core/scene';
import { formAt, zeroForm } from '../math/forms';
import { SAMPLES, covDef, curve, diff, dirDerivDef, field, fieldDiff, fn, form, formDiff, frame, framefield, frenetAt, frenetResiduals, md, num, point, vec, vectors } from './helpers';

const zero1 = zeroForm(1);

export const CH2: Partial<Entry>[] = [
  // ===========================================================================================
  // §2.1 Dot Product
  {
    id: '2.1.1',
    statement: md`The **dot product** of points $\mathbf{p} = (p_1, p_2, p_3)$ and $\mathbf{q} = (q_1, q_2, q_3)$ in $\mathbf{R}^3$ is the number
$$\mathbf{p} \bullet \mathbf{q} = p_1q_1 + p_2q_2 + p_3q_3.$$`,
    notes: md`The dot product is an **inner product**:

- (1) bilinearity: $(a\mathbf{p} + b\mathbf{q}) \bullet \mathbf{r} = a\,\mathbf{p} \bullet \mathbf{r} + b\,\mathbf{q} \bullet \mathbf{r}$ and $\mathbf{r} \bullet (a\mathbf{p} + b\mathbf{q}) = a\,\mathbf{r} \bullet \mathbf{p} + b\,\mathbf{r} \bullet \mathbf{q}$;
- (2) symmetry: $\mathbf{p} \bullet \mathbf{q} = \mathbf{q} \bullet \mathbf{p}$;
- (3) positive definiteness: $\mathbf{p} \bullet \mathbf{p} \ge 0$, with equality iff $\mathbf{p} = 0$.

The **norm** of $\mathbf{p}$ is $\lVert \mathbf{p} \rVert = (\mathbf{p} \bullet \mathbf{p})^{1/2} = (p_1^2 + p_2^2 + p_3^2)^{1/2}$, a real-valued function on $\mathbf{R}^3$ with $\lVert \mathbf{p} + \mathbf{q} \rVert \le \lVert \mathbf{p} \rVert + \lVert \mathbf{q} \rVert$ and $\lVert a\mathbf{p} \rVert = |a|\,\lVert \mathbf{p} \rVert$.

Geometry begins with distances and angles, and the geometry of Euclidean space can be derived from this natural inner product (introduction to Chapter 2). The same definitions work in $\mathbf{R}^2$ (2D view).`,
    tryThis: [md`Drag $\mathbf{q}$ until $\mathbf{p} \bullet \mathbf{q} = 0$: then $\mathbf{p}$ and $\mathbf{q}$ are perpendicular as seen from the origin.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(1, 2, 1)' });
        b.add('point', 'q', { coords: '(2, -1, 1.5)' }, { color: '#8250df' });
        b.add('dot', 'pq', { v: 'p', w: 'q' });
        b.add('dot', 'qp', { v: 'q', w: 'p' });
        b.add('norm', 'np', { v: 'p' });
        b.add('point', 'p2', { coords: '(1.5, 1)' }, { caption: '\\mathbf{p}' });
        b.add('point', 'q2', { coords: '(-1, 2)' }, { color: '#8250df', caption: '\\mathbf{q}' });
        b.add('dot', 'pq2', { v: 'p2', w: 'q2' });
      },
      select: 'pq',
    },
    checks: [
      { label: md`\mathbf{p} \bullet \mathbf{q} - \mathbf{q} \bullet \mathbf{p}`, value: (s) => num(s, 'pq') - num(s, 'qp') },
      { label: md`\lVert \mathbf{p} \rVert^2 - \mathbf{p} \bullet \mathbf{p}`, value: (s) => num(s, 'np') ** 2 - dot(point(s, 'p'), point(s, 'p')) },
    ],
  },
  {
    id: '2.1.2',
    statement: md`If $\mathbf{p}$ and $\mathbf{q}$ are points of $\mathbf{R}^3$, the **Euclidean distance** from $\mathbf{p}$ to $\mathbf{q}$ is the number
$$d(\mathbf{p}, \mathbf{q}) = \lVert \mathbf{p} - \mathbf{q} \rVert.$$`,
    notes: md`Since $\mathbf{p} - \mathbf{q} = (p_1 - q_1, p_2 - q_2, p_3 - q_3)$, expanding the norm gives the familiar formula (Fig. 2.1)
$$d(\mathbf{p}, \mathbf{q}) = \left((p_1 - q_1)^2 + (p_2 - q_2)^2 + (p_3 - q_3)^2\right)^{1/2}.$$
**Open sets, precisely.** For $\varepsilon > 0$, the **$\varepsilon$ neighborhood** $\mathcal{N}_\varepsilon$ of $\mathbf{p}$ is the set of points $\mathbf{q}$ with $d(\mathbf{p}, \mathbf{q}) < \varepsilon$. A set $\mathcal{O}$ is **open** if each of its points has an $\varepsilon$ neighborhood entirely contained in $\mathcal{O}$ — all points near enough to a point of $\mathcal{O}$ are in $\mathcal{O}$. This works in $\mathbf{R}^n$, or in any set with a reasonable distance function.

The 2D view shows an $\varepsilon$ neighborhood of $\mathbf{p}$ in the plane (a disk; in $\mathbf{R}^3$ it is a ball).`,
    tryThis: [md`Drag $\mathbf{q}$ (2D view) inside and outside the $\varepsilon$ neighborhood; compare $d(\mathbf{p}, \mathbf{q})$ with $\varepsilon$.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(1, 1, 0.5)' });
        b.add('point', 'q', { coords: '(-1, 2.5, 2)' }, { color: '#8250df' });
        b.add('distance', 'dpq', { p: 'p', q: 'q' });
        b.slider('eps', 1, 0.1, 2, 0.01, { caption: '\\varepsilon' });
        b.add('point', 'p2', { coords: '(0.5, 0.5)' }, { caption: '\\mathbf{p}' });
        b.add('point', 'q2', { coords: '(1.2, 1.1)' }, { color: '#8250df', caption: '\\mathbf{q}' });
        b.add('distance', 'dpq2', { p: 'p2', q: 'q2' }, { caption: 'd(\\mathbf{p}, \\mathbf{q})' });
        b.add('function', 'ball', { expr: '(x - x(p2))^2 + (y - y(p2))^2', levels: 'eps^2', box: 3, res: 120, dim: 2 }, { color: '#1a7f37', caption: '\\mathcal{N}_\\varepsilon(\\mathbf{p})\\colon d^2' });
      },
      select: 'dpq',
    },
    checks: [
      {
        label: md`d(\mathbf{p}, \mathbf{q}) - \left(\sum (p_i - q_i)^2\right)^{1/2}`,
        value: (s) => {
          const v = s.value('dpq');
          const d = v && v.kind === 'segment' ? (v.extra!.d as number) : NaN;
          const p = point(s, 'p');
          const q = point(s, 'q');
          return d - Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
        },
      },
    ],
  },
  {
    id: 'n.angle',
    statement: md`The canonical isomorphism $\mathbf{v} \mapsto \mathbf{v}_\mathbf{p}$ transfers the dot product to each tangent space ([[2.1.3]]). Each tangent vector has a **norm** (length) $\lVert \mathbf{v}_\mathbf{p} \rVert = \lVert \mathbf{v} \rVert$. By the **Schwarz inequality** $|\mathbf{v} \bullet \mathbf{w}| \le \lVert \mathbf{v} \rVert\,\lVert \mathbf{w} \rVert$, one can define the cosine of the **angle** $\vartheta$ between $\mathbf{v}$ and $\mathbf{w}$ by
$$\mathbf{v} \bullet \mathbf{w} = \lVert \mathbf{v} \rVert\,\lVert \mathbf{w} \rVert \cos\vartheta \qquad (0 \le \vartheta \le \pi).$$
Vectors are **orthogonal** when their dot product is zero ($\vartheta = \pi/2$), and a vector of length 1 is a **unit vector**.`,
    notes: md`So the dot product of two vectors is the product of their lengths and the cosine of the angle between them (Fig. 2.2): $\lVert \mathbf{v} \rVert\cos\vartheta$ is the length of the projection of $\mathbf{v}$ on the line of $\mathbf{w}$. (Without a restriction like $0 \le \vartheta \le \pi$ the angle is not unique.)`,
    tryThis: [md`Edit $\mathbf{w}$ to make $\vartheta = 90°$, then $\mathbf{v} \bullet \mathbf{w} = 0$.`],
    scene: {
      views: ['2d', '3d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(0, 0)' }, { label: false });
        b.add('tangentVector', 'v', { v: '(1.5, 2)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('tangentVector', 'w', { v: '(3, 0)', p: 'p' }, { color: '#0969da', caption: '\\mathbf{w}' });
        b.add('dot', 'vw', { v: 'v', w: 'w' });
        b.add('angle', 'theta', { v: 'v', w: 'w' }, { caption: '\\vartheta' });
        b.add('point', 'p3', { coords: '(1, 1, 0)' }, { caption: '\\mathbf{p}' });
        b.add('tangentVector', 'v3', { v: '(1, 2, 1)', p: 'p3' }, { caption: '\\mathbf{v}' });
        b.add('tangentVector', 'w3', { v: '(-1, 0, 3)', p: 'p3' }, { color: '#0969da', caption: '\\mathbf{w}' });
        b.add('angle', 'theta3', { v: 'v3', w: 'w3' }, { caption: '\\vartheta' });
      },
      select: 'theta',
    },
    checks: [
      {
        label: md`\mathbf{v} \bullet \mathbf{w} - \lVert\mathbf{v}\rVert\lVert\mathbf{w}\rVert\cos\vartheta`,
        value: (s) => num(s, 'vw') - norm(vec(s, 'v').v) * norm(vec(s, 'w').v) * Math.cos(num(s, 'theta')),
      },
    ],
  },
  {
    id: '2.1.3',
    statement: md`The **dot product** of tangent vectors $\mathbf{v}_\mathbf{p}$ and $\mathbf{w}_\mathbf{p}$ at the same point of $\mathbf{R}^3$ is the number $\mathbf{v}_\mathbf{p} \bullet \mathbf{w}_\mathbf{p} = \mathbf{v} \bullet \mathbf{w}$.`,
    notes: md`For example, $(1, 0, -1)_\mathbf{p} \bullet (3, -3, 7)_\mathbf{p} = 1(3) + 0(-3) + (-1)7 = -4$.

The canonical isomorphisms $\mathbf{v} \mapsto \mathbf{v}_\mathbf{p}$ from $\mathbf{R}^3$ onto the tangent spaces lie at the heart of Euclidean geometry: through them, each $T_\mathbf{p}(\mathbf{R}^3)$ gets a dot product with the same properties as that of $\mathbf{R}^3$ — hence norms, angles and orthogonality of tangent vectors (see "Norm, orthogonality, angle"). Tangent vectors at *different* points are not dotted (the sandbox warns).`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(1, 1, 1)' });
        b.add('tangentVector', 'v', { v: '(1, 0, -1)', p: 'p' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('tangentVector', 'w', { v: '(3, -3, 7)', p: 'p' }, { color: '#0969da', caption: '\\mathbf{w}_\\mathbf{p}' });
        b.add('dot', 'vw', { v: 'v', w: 'w' });
      },
      select: 'vw',
    },
    checks: [{ label: md`\mathbf{v}_\mathbf{p} \bullet \mathbf{w}_\mathbf{p} - \sum v_iw_i`, value: (s) => num(s, 'vw') - dot(vec(s, 'v').v, vec(s, 'w').v) }],
  },
  {
    id: '2.1.4',
    statement: md`A set $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ of three mutually orthogonal unit vectors tangent to $\mathbf{R}^3$ at $\mathbf{p}$ is called a **frame** at the point $\mathbf{p}$.`,
    notes: md`So $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ is a frame iff
$$\mathbf{e}_1 \bullet \mathbf{e}_1 = \mathbf{e}_2 \bullet \mathbf{e}_2 = \mathbf{e}_3 \bullet \mathbf{e}_3 = 1, \qquad \mathbf{e}_1 \bullet \mathbf{e}_2 = \mathbf{e}_1 \bullet \mathbf{e}_3 = \mathbf{e}_2 \bullet \mathbf{e}_3 = 0$$
(the remaining three equations follow by symmetry). In index notation: $\mathbf{e}_i \bullet \mathbf{e}_j = \delta_{ij}$. For example $U_1(\mathbf{p}), U_2(\mathbf{p}), U_3(\mathbf{p})$ is a frame at every point. The figure uses the frame of Exercise 3: $\mathbf{e}_1 = (1, 2, 1)/\sqrt6$, $\mathbf{e}_2 = (-2, 0, 2)/\sqrt8$, $\mathbf{e}_3 = (1, -1, 1)/\sqrt3$.`,
    tryThis: [md`Edit $\mathbf{e}_2$ so that it is no longer orthogonal to $\mathbf{e}_1$: the sandbox flags the object as "not a frame".`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(1, 1, 0.5)' });
        b.add('frame', 'e', { p: 'p', e1: '(1, 2, 1)/sqrt(6)', e2: '(-2, 0, 2)/sqrt(8)', e3: '(1, -1, 1)/sqrt(3)', lab: 'e' });
        b.add('naturalFrame', 'U', { p: '(-1, -1, 0)' });
      },
      select: 'e',
    },
    checks: [{ label: md`\max_{i,j} |\mathbf{e}_i \bullet \mathbf{e}_j - \delta_{ij}|`, value: (s) => orthoErr(frame(s, 'e').e) }],
  },
  {
    id: '2.1.5',
    statement: md`Let $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ be a frame at a point $\mathbf{p}$ of $\mathbf{R}^3$. If $\mathbf{v}$ is any tangent vector to $\mathbf{R}^3$ at $\mathbf{p}$, then
$$\mathbf{v} = (\mathbf{v} \bullet \mathbf{e}_1)\,\mathbf{e}_1 + (\mathbf{v} \bullet \mathbf{e}_2)\,\mathbf{e}_2 + (\mathbf{v} \bullet \mathbf{e}_3)\,\mathbf{e}_3.$$`,
    proof: md`First, $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ are linearly independent: if $\sum a_i\mathbf{e}_i = 0$, then
$$0 = \left(\sum a_i\mathbf{e}_i\right) \bullet \mathbf{e}_j = \sum a_i\,\mathbf{e}_i \bullet \mathbf{e}_j = \sum a_i\delta_{ij} = a_j,$$
so $a_1 = a_2 = a_3 = 0$. Since $T_\mathbf{p}(\mathbf{R}^3)$ is linearly isomorphic to $\mathbf{R}^3$, it has dimension 3, so these three independent vectors form a basis: each $\mathbf{v}$ is $\mathbf{v} = \sum c_i\mathbf{e}_i$ for unique numbers $c_i$. But
$$\mathbf{v} \bullet \mathbf{e}_j = \left(\sum c_i\mathbf{e}_i\right) \bullet \mathbf{e}_j = \sum c_i\delta_{ij} = c_j,$$
and thus $\mathbf{v} = \sum (\mathbf{v} \bullet \mathbf{e}_j)\,\mathbf{e}_j$. $\quad ∎$`,
    notes: md`One of the great labor-saving devices: to find the coordinates of $\mathbf{v}$ in an *arbitrary* basis one must solve linear equations, but with respect to a **frame** (an orthonormal basis) they are just three dot products — the **orthonormal expansion** of $\mathbf{v}$. For the natural frame it is $\mathbf{v} = (v_1, v_2, v_3) = \sum v_iU_i(\mathbf{p})$. If $a_i = \mathbf{v} \bullet \mathbf{e}_i$ and $b_i = \mathbf{w} \bullet \mathbf{e}_i$, the dot product keeps its simple form:
$$\mathbf{v} \bullet \mathbf{w} = \left(\sum a_i\mathbf{e}_i\right) \bullet \left(\sum b_j\mathbf{e}_j\right) = \sum a_ib_j\,\mathbf{e}_i \bullet \mathbf{e}_j = \sum a_ib_i.$$
The figure (Fig. 2.3) expands $\mathbf{v} = (6, 1, -1)$ in the frame of Exercise 3: the dashed arrows are $(\mathbf{v} \bullet \mathbf{e}_i)\mathbf{e}_i$.`,
    tryThis: [md`Edit $\mathbf{v}$: the three components always add up to $\mathbf{v}$.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(0, 0, 0)' }, { label: false });
        b.add('frame', 'e', { p: 'p', e1: '(1, 2, 1)/sqrt(6)', e2: '(-2, 0, 2)/sqrt(8)', e3: '(1, -1, 1)/sqrt(3)', lab: 'e' });
        b.add('tangentVector', 'v', { v: '(6, 1, -1)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('orthonormalExpansion', 'exp', { v: 'v', frame: 'e' });
      },
      select: 'exp',
    },
    checks: [
      {
        label: md`\mathbf{v} - \sum (\mathbf{v} \bullet \mathbf{e}_i)\,\mathbf{e}_i`,
        value: (s) => {
          const e = frame(s, 'e').e;
          const v = vec(s, 'v').v;
          const sum = [0, 1, 2].map((k) => e.reduce((acc, ei) => acc + dot(v, ei) * ei[k], 0));
          return diff(sum, v);
        },
      },
    ],
  },
  {
    id: '2.1.6',
    statement: md`Let $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ be a frame at a point $\mathbf{p}$ of $\mathbf{R}^3$. The $3 \times 3$ matrix $A$ whose rows are the Euclidean coordinates of these three vectors is called the **attitude matrix** of the frame.`,
    notes: md`Explicitly, if $\mathbf{e}_1 = (a_{11}, a_{12}, a_{13})_\mathbf{p}$, $\mathbf{e}_2 = (a_{21}, a_{22}, a_{23})_\mathbf{p}$, $\mathbf{e}_3 = (a_{31}, a_{32}, a_{33})_\mathbf{p}$, then
$$A = \begin{pmatrix} a_{11} & a_{12} & a_{13} \\ a_{21} & a_{22} & a_{23} \\ a_{31} & a_{32} & a_{33} \end{pmatrix}.$$
$A$ describes the "attitude" of the frame in $\mathbf{R}^3$ (not its point of application). Its rows are orthonormal, $\sum_k a_{ik}a_{jk} = \mathbf{e}_i \bullet \mathbf{e}_j = \delta_{ij}$, i.e. $A$ is an **orthogonal** matrix: $A\,{}^tA = I$. By linear algebra then $ {}^tA\,A = I$ too, so $ {}^tA = A^{-1}$.

Select the frame to read its attitude matrix in the Course view; rotate it with the slider.`,
    tryThis: [md`Move the slider $\vartheta$ (the frame turns about the $z$ axis) and watch $A$ change.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('th', 0.6, -3.14, 3.14, 0.01, { caption: '\\vartheta' });
        b.add('point', 'p', { coords: '(1, 1, 0)' });
        b.add('frame', 'e', { p: 'p', e1: '(cos(th), sin(th), 0)', e2: '(-sin(th), cos(th), 0)', e3: '(0, 0, 1)', lab: 'e' });
      },
      select: 'e',
    },
    checks: [
      {
        label: md`\max |A\,{}^tA - I|`,
        value: (s) => orthoErr(frame(s, 'e').e),
      },
      {
        label: md`\max |{}^tA\,A - I|`,
        value: (s) => {
          const A = frame(s, 'e').e;
          const cols = [0, 1, 2].map((j) => A.map((r) => r[j]));
          return orthoErr(cols);
        },
      },
    ],
  },
  {
    id: '2.1.7',
    statement: md`If $\mathbf{v}$ and $\mathbf{w}$ are tangent vectors to $\mathbf{R}^3$ at the same point $\mathbf{p}$, the **cross product** of $\mathbf{v}$ and $\mathbf{w}$ is the tangent vector
$$\mathbf{v} \times \mathbf{w} = \begin{vmatrix} U_1(\mathbf{p}) & U_2(\mathbf{p}) & U_3(\mathbf{p}) \\ v_1 & v_2 & v_3 \\ w_1 & w_2 & w_3 \end{vmatrix},$$
the formal determinant being expanded along its first row.`,
    notes: md`**Example.** For $\mathbf{v} = (1, 0, -1)_\mathbf{p}$ and $\mathbf{w} = (2, 2, -7)_\mathbf{p}$,
$$\mathbf{v} \times \mathbf{w} = \begin{vmatrix} U_1(\mathbf{p}) & U_2(\mathbf{p}) & U_3(\mathbf{p}) \\ 1 & 0 & -1 \\ 2 & 2 & -7 \end{vmatrix} = 2U_1(\mathbf{p}) + 5U_2(\mathbf{p}) + 2U_3(\mathbf{p}) = (2, 5, 2)_\mathbf{p}.$$
Properties of determinants show that $\mathbf{v} \times \mathbf{w}$ is linear in $\mathbf{v}$ and in $\mathbf{w}$ and satisfies the **alternation rule** $\mathbf{v} \times \mathbf{w} = -\mathbf{w} \times \mathbf{v}$; in particular $\mathbf{v} \times \mathbf{v} = 0$. It is closely related to the wedge product of 1-forms and second in importance only to the dot product.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(0, 0, 0)' }, { label: false });
        b.add('tangentVector', 'v', { v: '(1, 0, -1)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('tangentVector', 'w', { v: '(2, 2, -7)', p: 'p' }, { color: '#0969da', caption: '\\mathbf{w}' });
        b.add('cross', 'vxw', { v: 'v', w: 'w' });
        b.add('cross', 'wxv', { v: 'w', w: 'v' }, { color: '#bf8700', visible: false });
      },
      select: 'vxw',
    },
    checks: [
      { label: md`\mathbf{v} \times \mathbf{w} + \mathbf{w} \times \mathbf{v}`, value: (s) => diff(vec(s, 'vxw').v, vec(s, 'wxv').v.map((x) => -x)) },
      {
        label: md`\mathbf{v} \times \mathbf{w} - \text{first-row expansion}`,
        value: (s) => {
          const [v1, v2, v3] = vec(s, 'v').v;
          const [w1, w2, w3] = vec(s, 'w').v;
          return diff(vec(s, 'vxw').v, [v2 * w3 - v3 * w2, v3 * w1 - v1 * w3, v1 * w2 - v2 * w1]);
        },
      },
    ],
  },
  {
    id: '2.1.8',
    statement: md`The cross product $\mathbf{v} \times \mathbf{w}$ is orthogonal to both $\mathbf{v}$ and $\mathbf{w}$, and has length such that
$$\lVert \mathbf{v} \times \mathbf{w} \rVert^2 = (\mathbf{v} \bullet \mathbf{v})(\mathbf{w} \bullet \mathbf{w}) - (\mathbf{v} \bullet \mathbf{w})^2.$$`,
    proof: md`Let $\mathbf{v} \times \mathbf{w} = \sum c_iU_i(\mathbf{p})$. Then $\mathbf{v} \bullet (\mathbf{v} \times \mathbf{w}) = \sum v_ic_i$. By the definition of the cross product the $c_i$ are the cofactors of the first row, so
$$\mathbf{v} \bullet (\mathbf{v} \times \mathbf{w}) = \begin{vmatrix} v_1 & v_2 & v_3 \\ v_1 & v_2 & v_3 \\ w_1 & w_2 & w_3 \end{vmatrix},$$
which is zero since two rows are equal: $\mathbf{v} \times \mathbf{w}$ is orthogonal to $\mathbf{v}$, and similarly to $\mathbf{w}$.

For the length, a brute-force computation. On one hand
$$\begin{aligned} (\mathbf{v} \bullet \mathbf{v})(\mathbf{w} \bullet \mathbf{w}) - (\mathbf{v} \bullet \mathbf{w})^2 &= \left(\sum v_i^2\right)\left(\sum w_j^2\right) - \left(\sum v_iw_i\right)^2 \\ &= \sum_{i,j} v_i^2w_j^2 - \left\{\sum v_i^2w_i^2 + 2\sum_{i<j} v_iw_iv_jw_j\right\} = \sum_{i \ne j} v_i^2w_j^2 - 2\sum_{i<j} v_iw_iv_jw_j. \end{aligned}$$
On the other hand
$$\lVert \mathbf{v} \times \mathbf{w} \rVert^2 = \sum c_i^2 = (v_2w_3 - v_3w_2)^2 + (v_3w_1 - v_1w_3)^2 + (v_1w_2 - v_2w_1)^2,$$
and expanding these squares gives the same result. $\quad ∎$`,
    notes: md`More intuitively, $\lVert \mathbf{v} \times \mathbf{w} \rVert = \lVert \mathbf{v} \rVert\,\lVert \mathbf{w} \rVert \sin\vartheta$ with $0 \le \vartheta \le \pi$ the angle from $\mathbf{v}$ to $\mathbf{w}$ — the area of the parallelogram they span. Its direction on the line orthogonal to both is given by the **right-hand rule** (Fig. 2.4): fingers along the shortest rotation from $\mathbf{v}$ to $\mathbf{w}$, thumb along $\mathbf{v} \times \mathbf{w}$.`,
    tryThis: [md`Edit $\mathbf{w}$ to make it parallel to $\mathbf{v}$: the cross product vanishes.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(0, 0, 0)' }, { label: false });
        b.add('tangentVector', 'v', { v: '(1, 2, -1)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('tangentVector', 'w', { v: '(-1, 0, 3)', p: 'p' }, { color: '#0969da', caption: '\\mathbf{w}' });
        b.add('cross', 'vxw', { v: 'v', w: 'w' });
        b.add('angle', 'theta', { v: 'v', w: 'w' }, { caption: '\\vartheta' });
      },
      select: 'vxw',
    },
    checks: [
      { label: md`\mathbf{v} \bullet (\mathbf{v} \times \mathbf{w}),\ \mathbf{w} \bullet (\mathbf{v} \times \mathbf{w})`, value: (s) => Math.max(Math.abs(dot(vec(s, 'v').v, vec(s, 'vxw').v)), Math.abs(dot(vec(s, 'w').v, vec(s, 'vxw').v))) },
      {
        label: md`\lVert \mathbf{v} \times \mathbf{w} \rVert^2 - (\mathbf{v}\bullet\mathbf{v})(\mathbf{w}\bullet\mathbf{w}) + (\mathbf{v}\bullet\mathbf{w})^2`,
        value: (s) => {
          const v = vec(s, 'v').v;
          const w = vec(s, 'w').v;
          return norm(vec(s, 'vxw').v) ** 2 - dot(v, v) * dot(w, w) + dot(v, w) ** 2;
        },
      },
      { label: md`\lVert \mathbf{v} \times \mathbf{w} \rVert - \lVert\mathbf{v}\rVert\lVert\mathbf{w}\rVert\sin\vartheta`, value: (s) => norm(vec(s, 'vxw').v) - norm(vec(s, 'v').v) * norm(vec(s, 'w').v) * Math.sin(num(s, 'theta')) },
    ],
  },
  {
    id: 'n.triple',
    statement: md`Combining the dot and cross products gives the **triple scalar product** $\mathbf{u} \bullet \mathbf{v} \times \mathbf{w}$ of three vectors (parentheses are unnecessary: $\mathbf{u} \bullet (\mathbf{v} \times \mathbf{w})$ is the only possible meaning). By Exercise 4,
$$\mathbf{u} \bullet \mathbf{v} \times \mathbf{w} = \begin{vmatrix} u_1 & u_2 & u_3 \\ v_1 & v_2 & v_3 \\ w_1 & w_2 & w_3 \end{vmatrix}.$$`,
    notes: md`Its absolute value is the volume of the parallelepiped spanned by $\mathbf{u}, \mathbf{v}, \mathbf{w}$; it vanishes iff they are linearly dependent. For a frame it is $\pm1$ — the sign is the **orientation** of the frame ([[3.3.1]]). It also appears in the torsion formula of [[2.4.3]].`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(0, 0, 0)' }, { label: false });
        b.add('tangentVector', 'u', { v: '(1, 0, 0.5)', p: 'p' }, { color: '#bf8700', caption: '\\mathbf{u}' });
        b.add('tangentVector', 'v', { v: '(0, 2, 0)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('tangentVector', 'w', { v: '(0.5, 0, 1.5)', p: 'p' }, { color: '#0969da', caption: '\\mathbf{w}' });
        b.add('triple', 'uvw', { u: 'u', v: 'v', w: 'w' });
      },
      select: 'uvw',
    },
    checks: [
      {
        label: md`\mathbf{u} \bullet (\mathbf{v} \times \mathbf{w}) - \det(\mathbf{u}; \mathbf{v}; \mathbf{w})`,
        value: (s) => dot(vec(s, 'u').v, cross(vec(s, 'v').v, vec(s, 'w').v)) - det3([vec(s, 'u').v, vec(s, 'v').v, vec(s, 'w').v]) + (num(s, 'uvw') - det3([vec(s, 'u').v, vec(s, 'v').v, vec(s, 'w').v])),
      },
    ],
  },
  // ===========================================================================================
  // §2.2 Curves
  {
    id: 'n.arclength',
    statement: md`Let $\alpha\colon I \to \mathbf{R}^3$ be a curve. The **speed** of $\alpha$ at $t$ is the length $v(t) = \lVert \alpha'(t) \rVert$ of its velocity, a real-valued function on $I$:
$$v = \lVert \alpha' \rVert = \left(\left(\frac{d\alpha_1}{dt}\right)^2 + \left(\frac{d\alpha_2}{dt}\right)^2 + \left(\frac{d\alpha_3}{dt}\right)^2\right)^{1/2}.$$
The **arc length** of $\alpha$ from $t = a$ to $t = b$ is the number
$$\int_a^b \lVert \alpha'(t) \rVert\, dt.$$`,
    notes: md`As in physics, the distance traveled is the integral of the speed. It only involves the restriction of $\alpha$ to the closed interval $[a, b]$; such a restriction $\sigma\colon [a, b] \to \mathbf{R}^3$ is a **curve segment**, and its length is written $L(\sigma)$ (its velocity is well defined at the endpoints).

The figure uses Exercise 1, $\alpha(t) = (2t, t^2, t^3/3)$: $\lVert \alpha' \rVert = (4 + 4t^2 + t^4)^{1/2} = 2 + t^2$, so the segment from $t = -1$ to $t = 1$ (highlighted) has length $\int_{-1}^1 (2 + t^2)\,dt = 14/3$. The 2D view shows an arc of the circle of radius 2, whose length is $2t_1$.`,
    tryThis: [md`Change the endpoints of the arc length object in the Algebra view.`, md`Move $t_1$ in the 2D figure: $L = 2t_1$.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('curve', 'alpha', { comps: '(2*t, t^2, t^3/3)', param: 't', a: '-1.8', b: '1.8', dim: 3 });
        b.add('arcLength', 'L', { curve: 'alpha', a: '-1', b: '1' });
        b.slider('t1', 2, 0, 6.28, 0.01);
        b.add('curve', 'c', { comps: '(2*cos(t), 2*sin(t))', param: 't', a: '0', b: '2*pi', dim: 2 }, { caption: '\\gamma' });
        b.add('arcLength', 'L2', { curve: 'c', a: '0', b: 't1' }, { caption: 'L(\\gamma|_{[0, t_1]})' });
      },
      select: 'L',
    },
    checks: [
      { label: md`L - 14/3 \text{ (Exercise 1)}`, value: (s) => num(s, 'L') - 14 / 3, tol: 1e-6 },
      { label: md`L(\gamma) - 2t_1`, value: (s) => num(s, 'L2') - 2 * num(s, 't1'), tol: 1e-6 },
    ],
  },
  {
    id: '2.2.1',
    statement: md`If $\alpha$ is a regular curve in $\mathbf{R}^3$, then there exists a reparametrization $\beta$ of $\alpha$ such that $\beta$ has unit speed.`,
    proof: md`Fix a number $a$ in the domain $I$ of $\alpha$ and consider the **arc length function**
$$s(t) = \int_a^t \lVert \alpha'(u) \rVert\, du.$$
(The resulting reparametrization is said to be *based at* $t = a$.) Its derivative $ds/dt$ is the speed $v = \lVert \alpha' \rVert$. Since $\alpha$ is regular, $\alpha'$ is never zero, so $ds/dt > 0$. By a standard theorem of calculus, $s$ has an inverse function $t = t(s)$, whose derivative $dt/ds$ at $s = s(t)$ is the reciprocal of $ds/dt$ at $t = t(s)$; in particular $dt/ds > 0$.

Now let $\beta(s) = \alpha(t(s))$. By Lemma [[1.4.5]],
$$\beta'(s) = \frac{dt}{ds}(s)\,\alpha'(t(s)).$$
Hence the speed of $\beta$ is
$$\lVert \beta'(s) \rVert = \frac{dt}{ds}(s)\,\lVert \alpha'(t(s)) \rVert = \frac{dt}{ds}(s)\,\frac{ds}{dt}(t(s)) = 1. \qquad ∎$$`,
    notes: md`A unit-speed curve is a "standard trip" along a route; it is said to have **arc-length parametrization**, since its length from $s = a$ to $s = b$ is $b - a$.

**Example.** The helix $\alpha(t) = (a\cos t, a\sin t, bt)$ has $\lVert \alpha' \rVert^2 = a^2\sin^2t + a^2\cos^2t + b^2 = a^2 + b^2$: constant speed $c = (a^2 + b^2)^{1/2}$. Measuring arc length from $t = 0$, $s(t) = ct$, so $t(s) = s/c$ and
$$\beta(s) = \alpha(s/c) = \left(a\cos\frac{s}{c},\ a\sin\frac{s}{c},\ \frac{bs}{c}\right).$$
A reparametrization $\alpha(h)$ is **orientation-preserving** if $h' \ge 0$ and **orientation-reversing** if $h' \le 0$ (same route, opposite direction); unit-speed reparametrizations preserve orientation since $ds/dt > 0$.

In practice the speed can rarely be integrated in familiar terms — even for an ellipse (2D view) the arc length is an elliptic integral. The sandbox computes $s(t)$ and its inverse numerically: the marks of the unit-speed curve are equally spaced along the route, unlike those of $\alpha$.`,
    tryThis: [md`Compare the marks of $\alpha$ (equal steps in $t$) and of $\beta$ (equal steps in $s$) on the ellipse.`, md`Change $a$, $b$: the helix's $\beta$ stays unit-speed.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('a', 2, 0.3, 3, 0.01);
        b.slider('b', 0.5, -1, 1, 0.01);
        b.add('slider', 'c', { value: 'sqrt(a^2 + b^2)', min: 0, max: 5, step: 0.01 });
        b.slider('s0', 3, 0, 12, 0.01);
        b.add('curve', 'alpha', { comps: '(a*cos(t), a*sin(t), b*t)', param: 't', a: '0', b: '2*pi', ticks: 0, dim: 3 });
        b.add('unitSpeed', 'beta', { curve: 'alpha', base: '0', ticks: 0 }, { color: '#9a6700' });
        b.add('velocity', 'vb', { curve: 'beta', t0: 's0' }, { caption: "\\beta'(s_0)" });
        b.add('curve', 'ell', { comps: '(2*cos(t), sin(t))', param: 't', a: '0', b: '2*pi', ticks: 24, dim: 2 }, { caption: '\\alpha' });
        b.add('unitSpeed', 'bell', { curve: 'ell', base: '0', ticks: 24 }, { color: '#9a6700', caption: '\\beta' });
      },
      select: 'beta',
    },
    checks: [
      { label: md`\lVert \beta'(s_0) \rVert - 1`, value: (s) => norm(vec(s, 'vb').v) - 1, tol: 1e-4 },
      {
        label: md`\beta(s_0) - \alpha(s_0/c) \text{ (helix)}`,
        value: (s) => {
          const c = num(s, 'c');
          const s0 = num(s, 's0');
          const a = num(s, 'a');
          return diff(vec(s, 'vb').p, [a * Math.cos(s0 / c), a * Math.sin(s0 / c), (num(s, 'b') * s0) / c]);
        },
        tol: 1e-4,
      },
    ],
  },
  {
    id: '2.2.2',
    statement: md`A **vector field $Y$ on a curve** $\alpha\colon I \to \mathbf{R}^3$ is a function that assigns to each number $t$ in $I$ a tangent vector $Y(t)$ to $\mathbf{R}^3$ at the point $\alpha(t)$.`,
    notes: md`The velocity $\alpha'$ is such a field — but in general a vector field on $\alpha$ need not be tangent to $\alpha$ (Fig. 2.6). For each $t$,
$$Y(t) = (y_1(t), y_2(t), y_3(t))_{\alpha(t)} = \sum y_i(t)\,U_i(\alpha(t)),$$
defining the **Euclidean coordinate functions** $y_1, y_2, y_3$ of $Y$ (always assumed differentiable). One often writes $U_i$ for $U_i(\alpha(t))$.

Addition, scalar multiplication, dot and cross products of fields on the same curve are pointwise. **The book's example:** $Y(t) = t^2U_1 - tU_3$, $Z(t) = (1 - t^2)U_2 + tU_3$, $f(t) = (t + 1)/t$:
$$(Y + Z)(t) = t^2U_1 + (1 - t^2)U_2, \qquad (fY)(t) = t(t + 1)U_1 - (t + 1)U_3,$$
$$(Y \times Z)(t) = t(1 - t^2)U_1 - t^3U_2 + t^2(1 - t^2)U_3, \qquad (Y \bullet Z)(t) = -t^2.$$
**Differentiation:** differentiate the coordinate functions, $Y' = \sum \frac{dy_i}{dt}U_i$; here $Y' = 2tU_1 - U_3$, $Y'' = 2U_1$, $Y''' = 0$. The derivative $\alpha''$ of the velocity is the **acceleration** — generally not tangent to the curve. As always, $(aY + bZ)' = aY' + bZ'$, $(fY)' = \frac{df}{dt}Y + fY'$, $(Y \bullet Z)' = Y' \bullet Z + Y \bullet Z'$. If $Y \bullet Z$ is constant, $Y' \bullet Z + Y \bullet Z' = 0$; in particular a field of **constant length is orthogonal to its derivative**. $Y$ is **parallel** if all its values are parallel (constant coordinates).

The figure draws $Y$ and $Z$ on a helix $\alpha$.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('curve', 'alpha', { comps: '(2*cos(t), 2*sin(t), t/2)', param: 't', a: '-1.5', b: '1.5', dim: 3 });
        b.add('curveField', 'Y', { curve: 'alpha', mode: 'custom', comps: '(t^2, 0, -t)', n: 13, scale: 0.8 }, { color: '#cf222e' });
        b.add('curveField', 'Z', { curve: 'alpha', mode: 'custom', comps: '(0, 1 - t^2, t)', n: 13, scale: 0.8 }, { color: '#0969da' });
      },
      select: 'Y',
    },
  },
  {
    id: '2.2.3',
    statement: md`(1) A curve $\alpha$ is constant if and only if its velocity is zero, $\alpha' = 0$.

(2) A nonconstant curve $\alpha$ is a straight line if and only if its acceleration is zero, $\alpha'' = 0$.

(3) A vector field $Y$ on a curve is parallel if and only if its derivative is zero, $Y' = 0$.`,
    proof: md`In each case it suffices to look at the Euclidean coordinate functions. We prove (2). If $\alpha = (\alpha_1, \alpha_2, \alpha_3)$, then
$$\alpha'' = \left(\frac{d^2\alpha_1}{dt^2}, \frac{d^2\alpha_2}{dt^2}, \frac{d^2\alpha_3}{dt^2}\right).$$
So $\alpha'' = 0$ iff each $d^2\alpha_i/dt^2 = 0$, which by elementary calculus means there are constants $p_i$, $q_i$ with $\alpha_i(t) = p_i + tq_i$ ($i = 1, 2, 3$). Thus $\alpha(t) = \mathbf{p} + t\mathbf{q}$, a straight line as in Example [[1.4.2]] (nonconstancy forces $\mathbf{q} \ne 0$). $\quad ∎$`,
    notes: md`Vanishing derivatives always matter in calculus. In the figure: a straight line (its velocities, drawn along it, are all parallel and its acceleration at $t_0$ is zero) and, on a helix, the parallel field $Y = U_3$ (constant coordinates, $Y' = 0$).`,
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('t0', 0.5, -2, 2, 0.01);
        b.add('straightLine', 'ell', { p: '(1, -1, 0)', q: '(1, 1, 1)', a: '-2', b: '2', dim: 3 }, { caption: '\\alpha' });
        b.add('curveField', 'vel', { curve: 'ell', mode: 'velocity', comps: '(0, 0, 1)', n: 7, scale: 0.6 }, { caption: "\\alpha'" });
        b.add('acceleration', 'acc', { curve: 'ell', t0: 't0' });
        b.add('curve', 'gamma', { comps: '(cos(t) - 2, sin(t), t/4)', param: 't', a: '-6', b: '6', dim: 3 });
        b.add('curveField', 'Y', { curve: 'gamma', mode: 'custom', comps: '(0, 0, 1)', n: 12, scale: 0.6 }, { color: '#bf8700' });
        b.add('straightLine', 'ell2', { p: '(-1, 0)', q: '(1, 0.5)', a: '-1', b: '3', dim: 2 }, { caption: '\\alpha' });
        b.add('curveField', 'vel2', { curve: 'ell2', mode: 'velocity', comps: '(0, 0, 1)', n: 6, scale: 0.6 }, { caption: "\\alpha'" });
      },
      select: 'acc',
    },
    checks: [{ label: md`\lVert \alpha''(t_0) \rVert \text{ (straight line)}`, value: (s) => norm(vec(s, 'acc').v) }],
  },
  // ===========================================================================================
  // §2.3 The Frenet Formulas (2.3.2, 2.3.3 and the definitions of T, κ, N, B, τ are elsewhere)
  {
    id: '2.3.1',
    statement: md`Let $\beta$ be a unit-speed curve in $\mathbf{R}^3$ with $\kappa > 0$. Then the three vector fields $T$, $N$ and $B$ on $\beta$ are unit vector fields that are mutually orthogonal at each point. $T, N, B$ is called the **Frenet frame field** on $\beta$.`,
    proof: md`By definition $\lVert T \rVert = 1$. Since $\kappa = \lVert T' \rVert > 0$,
$$\lVert N \rVert = (1/\kappa)\,\lVert T' \rVert = 1.$$
We saw that $T$ and $N$ are orthogonal ($T' \bullet T = 0$ because $T$ has constant length). Then Lemma [[2.1.8]], applied at each point, shows that $\lVert B \rVert = \lVert T \times N \rVert = 1$ and that $B$ is orthogonal to both $T$ and $N$. $\quad ∎$`,
    notes: md`In summary $T = \beta'$, $N = T'/\kappa$, $B = T \times N$, with $T \bullet T = N \bullet N = B \bullet B = 1$ and all other dot products zero.

The key to the geometry of a curve is to use its Frenet frame field instead of the natural frame field $U_1, U_2, U_3$: the Frenet frame is full of information about $\beta$, the natural frame contains none. The first use is to express $T', N', B'$ in terms of $T, N, B$: $T' = \beta'' = \kappa N$, and $B'$ is a multiple of $N$ (since $B' \bullet B = 0$ and $B' \bullet T = -B \bullet T' = -B \bullet \kappa N = 0$), which defines the torsion — leading to the Frenet formulas ([[2.3.2]]).

The figure shows the Frenet frame at $t_0$ (and, faintly, along the whole curve).`,
    tryThis: [md`Animate $t_0$: the three arrows stay unit and perpendicular.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('t0', 0.6, -3, 3, 0.01);
        b.add('curve', 'beta', { comps: '(cos(t), sin(t), t^2/4)', param: 't', a: '-3', b: '3', dim: 3 });
        b.add('frenetFrame', 'TNB', { curve: 'beta', t0: 't0', along: false, n: 12 });
        b.add('frenetFrame', 'all', { curve: 'beta', t0: 't0', along: true, n: 16 }, { label: false, caption: 'T, N, B \\text{ along } \\beta' });
      },
      select: 'TNB',
    },
    checks: [{ label: md`\max |e_i \bullet e_j - \delta_{ij}| \text{ for } T, N, B`, value: (s) => orthoErr(frame(s, 'TNB').e) }],
  },
  {
    id: '2.3.4',
    statement: md`The book has insisted on the distinction between a tangent vector and a point of $\mathbf{R}^3$. But given a point $\mathbf{p}$ there is a natural one-to-one correspondence between points $(v_1, v_2, v_3)$ and tangent vectors $(v_1, v_2, v_3)_\mathbf{p}$ at $\mathbf{p}$, so one may switch quietly between them. Corresponding objects have the same Euclidean coordinates, so the switch affects no operation defined in terms of coordinates.`,
    notes: md`So a vector field $Y = (y_1, y_2, y_3)_\beta$ on a curve becomes a curve $(y_1, y_2, y_3)$; a parallel field is identified with a single point. The **plane through $\mathbf{p}$ orthogonal to $\mathbf{q} \ne 0$** is the set of points $\mathbf{r}$ with $(\mathbf{r} - \mathbf{p}) \bullet \mathbf{q} = 0$, picturing $\mathbf{q}$ as a tangent vector at $\mathbf{p}$ (Fig. 2.9).

**The Frenet approximation.** For a unit-speed $\beta$ near $\beta(0)$, Taylor's formula gives $\beta(s) \sim \beta(0) + s\beta'(0) + \frac{s^2}{2}\beta''(0) + \frac{s^3}{6}\beta'''(0)$. Here $\beta'(0) = T_0$, $\beta''(0) = \kappa_0N_0$ (assume $\kappa_0 \ne 0$), and $\beta''' = (\kappa N)' = \frac{d\kappa}{ds}N + \kappa N'$, so by the Frenet formula for $N'$,
$$\beta'''(0) = -\kappa_0^2T_0 + \frac{d\kappa}{ds}(0)N_0 + \kappa_0\tau_0B_0.$$
Keeping only the dominant term in each component:
$$\hat\beta(s) = \beta(0) + sT_0 + \kappa_0\frac{s^2}{2}N_0 + \kappa_0\tau_0\frac{s^3}{6}B_0,$$
the **Frenet approximation** of $\beta$ near $s = 0$ (near $s_0$, replace $s$ by $s - s_0$). Its first two terms give the **tangent line**, the best linear approximation; three terms give the parabola $s \mapsto \beta(0) + sT_0 + \kappa_0(s^2/2)N_0$, the best quadratic approximation, lying in the plane through $\beta(0)$ orthogonal to $B_0$ — the **osculating plane** — with the shape of $y = \kappa_0x^2/2$. The torsion term, smallest, controls the motion out of the osculating plane (Fig. 2.10).

Also: a unit-speed curve with $\kappa \equiv 0$ is a straight line, by (2) of [[2.2.3]], since $\kappa = \lVert \beta'' \rVert$ — curvature measures deviation from straightness.`,
    tryThis: [md`Animate $s_0$: the cubic $\hat\beta$ (orange) hugs the helix near $\beta(s_0)$.`, md`Increase the drawn range $h$ of $\hat\beta$ to see where the approximation fails.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('s0', 0, -10, 10, 0.01);
        b.add('curve', 'beta', { comps: '(2*cos(s/sqrt(5)), 2*sin(s/sqrt(5)), s/sqrt(5))', param: 's', a: '-12', b: '12', dim: 3 });
        b.add('frenetFrame', 'TNB', { curve: 'beta', t0: 's0', along: false, n: 12 });
        b.add('osculatingPlane', 'Pi', { curve: 'beta', t0: 's0', size: 1.6 }, { label: false });
        b.add('frenetApprox', 'bhat', { curve: 'beta', t0: 's0', h: 2.2 });
      },
      select: 'bhat',
    },
    checks: [
      {
        label: md`|\beta(s_0 + h) - \hat\beta(h)| / h^3 \text{ at } h = 0.01 \text{ (should be } O(h))`,
        value: (s) => {
          const c = curve(s, 'beta');
          const a = curve(s, 'bhat');
          const h = 0.01;
          return norm(c.f(num(s, 's0') + h).map((x, i) => x - a.f(h)[i])) / h ** 3;
        },
        tol: 0.05,
      },
    ],
  },
  {
    id: 'n.osculating',
    statement: md`Let $\beta$ be a unit-speed curve with $\kappa(0) > 0$. The **osculating plane** of $\beta$ at $\beta(0)$ is the plane through $\beta(0)$ orthogonal to $B_0$ — the plane spanned by $T_0$ and $N_0$ (§2.3, after [[2.3.4]]).

The **osculating circle** of $\beta$ at $\beta(0)$ (Exercise 6 of §2.3) is the unique circle $\gamma$ that approximates $\beta$ near $\beta(0)$ in the sense that $\gamma(0) = \beta(0)$, $\gamma'(0) = \beta'(0)$, $\gamma''(0) = \beta''(0)$. It lies in the osculating plane, has radius $1/\kappa(0)$ and center $\mathbf{c} = \beta(0) + \frac{1}{\kappa(0)}N(0)$, the **center of curvature**. (The same holds at any $s$.)`,
    notes: md`The osculating plane contains the best quadratic approximation of the curve (the parabola of the Frenet approximation); the osculating circle is the circle with the same position, velocity and acceleration. Its radius $1/\kappa$ is the **radius of curvature**: small radius, sharp turning. Compare Lemma [[2.3.6]]: for a circle, the center of curvature is the center itself.`,
    tryThis: [md`Drag the frame along the curve with the **Move** tool (or animate $t_0$): the osculating circle is small where the curve bends sharply.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('t0', 0.5, -1.8, 1.8, 0.01);
        b.add('curve', 'beta', { comps: '(2*t, t^2, t^3/3)', param: 't', a: '-1.8', b: '1.8', dim: 3 });
        b.add('frenetFrame', 'TNB', { curve: 'beta', t0: 't0', along: false, n: 12 });
        b.add('osculatingPlane', 'Pi', { curve: 'beta', t0: 't0', size: 2 }, { label: false });
        b.add('osculatingCircle', 'C0', { curve: 'beta', t0: 't0' });
      },
      select: 'C0',
    },
    checks: [
      {
        label: md`d(\mathbf{c}, \beta(t_0)) - 1/\kappa(t_0)`,
        value: (s) => {
          const c = s.value('C0');
          const b = curve(s, 'beta');
          const t = num(s, 't0');
          if (!c || c.kind !== 'circle') throw new Error('C0 undefined');
          return norm(c.c.map((x, i) => x - b.f(t)[i])) - 1 / frenetAt(b, t).kappa;
        },
      },
    ],
  },
  {
    id: '2.3.5',
    statement: md`Let $\beta$ be a unit-speed curve in $\mathbf{R}^3$ with $\kappa > 0$. Then $\beta$ is a plane curve if and only if $\tau = 0$.`,
    proof: md`Suppose $\beta$ is a plane curve: there are points $\mathbf{p}$ and $\mathbf{q}$ with $(\beta(s) - \mathbf{p}) \bullet \mathbf{q} = 0$ for all $s$. Differentiating,
$$\beta'(s) \bullet \mathbf{q} = \beta''(s) \bullet \mathbf{q} = 0 \quad \text{for all } s.$$
So $\mathbf{q}$ is always orthogonal to $T = \beta'$ and $N = \beta''/\kappa$. But $B$ is also orthogonal to $T$ and $N$ and has unit length, so $B = \pm\mathbf{q}/\lVert \mathbf{q} \rVert$. Thus $B' = 0$, and by definition $\tau = 0$ (Fig. 2.11).

Conversely, suppose $\tau = 0$. Then $B' = 0$: $B$ is parallel and may be identified (Remark [[2.3.4]]) with a *point* of $\mathbf{R}^3$. We claim $\beta$ lies in the plane through $\beta(0)$ orthogonal to $B$. Consider $f(s) = (\beta(s) - \beta(0)) \bullet B$. Then
$$\frac{df}{ds} = \beta' \bullet B = T \bullet B = 0.$$
Since $f(0) = 0$, $f$ is identically zero: $(\beta(s) - \beta(0)) \bullet B = 0$ for all $s$, so $\beta$ lies entirely in this plane orthogonal to its (parallel) binormal. $\quad ∎$`,
    notes: md`A **plane curve** lies in a single plane of $\mathbf{R}^3$; it does not twist as the helix does. The Frenet approximation suggested that $\tau_0 \ne 0$ is what makes a curve leave its osculating plane; the corollary confirms it globally.

The figure: an ellipse in a tilted plane — its binormal (drawn along the curve, blue) is the same at every point and $\tau = 0$ (2D view); a helix nearby has constant $\tau \ne 0$ for comparison.`,
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('curve', 'beta', { comps: '(2*cos(t), sin(t)*cos(0.7), sin(t)*sin(0.7))', param: 't', a: '0', b: '2*pi', dim: 3 });
        b.add('frenetFrame', 'all', { curve: 'beta', t0: '0', along: true, n: 14 }, { label: false, caption: 'T, N, B' });
        b.add('curvaturePlot', 'plot', { curve: 'beta', kappa: true, tau: true, speed: false, ratio: false, marker: '' });
      },
      select: 'plot',
    },
    checks: [
      {
        label: md`\max |\tau| \text{ on the ellipse}`,
        value: (s) => {
          const c = curve(s, 'beta');
          let m = 0;
          for (let i = 0; i <= 50; i++) m = Math.max(m, Math.abs(frenetAt(c, c.a + ((c.b - c.a) * i) / 50).tau));
          return m;
        },
      },
    ],
  },
  {
    id: '2.3.6',
    statement: md`If $\beta$ is a unit-speed curve with constant curvature $\kappa > 0$ and torsion zero, then $\beta$ is part of a circle of radius $1/\kappa$.`,
    proof: md`Since $\tau = 0$, $\beta$ is a plane curve ([[2.3.5]]). We must show that every point of $\beta$ is at distance $1/\kappa$ from some fixed point — the center. Consider the curve $\gamma = \beta + (1/\kappa)N$. Using the hypothesis on $\beta$ and a Frenet formula,
$$\gamma' = \beta' + \frac{1}{\kappa}N' = T + \frac{1}{\kappa}(-\kappa T) = 0.$$
So $\gamma$ is constant: $\beta(s) + (1/\kappa)N(s)$ has the same value, say $\mathbf{c}$, for all $s$ (Fig. 2.12). But
$$d(\mathbf{c}, \beta(s)) = \lVert \mathbf{c} - \beta(s) \rVert = \left\lVert \frac{1}{\kappa}N(s) \right\rVert = \frac{1}{\kappa}. \qquad ∎$$`,
    notes: md`A circle of radius $a$ has curvature $1/a$ and torsion zero ([[2.3.3]] with $b = 0$), and its $N$ points to the center — the idea of the proof. The figure: a circle in a tilted plane; $\beta + N/\kappa$ (the center of its osculating circle) is the same point for every $t_0$.

**Spherical curves** (end of §2.3). If $\beta$ lies on the sphere $\Sigma$ of radius $a$ centered at $0$, then $\kappa \ge 1/a$ (equality on great circles). Indeed $\beta \bullet \beta = a^2$; differentiating, $\beta \bullet T = 0$; again, $T \bullet T + \kappa\,\beta \bullet N = 0$, so $\kappa\,\beta \bullet N = -1$. By the Schwarz inequality $|\beta \bullet N| \le \lVert \beta \rVert\,\lVert N \rVert = a$, hence $\kappa = 1/|\beta \bullet N| \ge 1/a$. The second curve of the figure, $(1 + \cos t, \sin t, 2\sin\frac t2)$ of Example [[1.4.2]], lies on the sphere of radius 2: the check verifies $\kappa \ge 1/2$ along it.`,
    tryThis: [md`Animate $t_0$: the osculating circle of the circle is the circle itself.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('t0', 1, 0, 6.28, 0.01);
        b.add('curve', 'beta', { comps: '(1.5*cos(t), 1.5*sin(t)*cos(0.8), 1.5*sin(t)*sin(0.8))', param: 't', a: '0', b: '2*pi', dim: 3 });
        b.add('frenetFrame', 'TNB', { curve: 'beta', t0: 't0', along: false, n: 12 });
        b.add('osculatingCircle', 'C0', { curve: 'beta', t0: 't0' }, { color: '#8250df' });
        b.add('curve', 'gamma', { comps: '(1 + cos(t), sin(t), 2*sin(t/2))', param: 't', a: '0', b: '4*pi', dim: 3 }, { color: '#cf222e' });
        b.add('function', 'sph', { expr: 'x^2 + y^2 + z^2', levels: '4', box: 2.2, res: 36, dim: 3 }, { visible: false, color: '#bf8700', label: false });
      },
      select: 'C0',
    },
    checks: [
      {
        label: md`\lVert (\beta + N/\kappa)(t_0) \rVert \text{ (center is } 0)`,
        value: (s) => {
          const c = s.value('C0');
          if (!c || c.kind !== 'circle') throw new Error('C0 undefined');
          return norm(c.c);
        },
      },
      {
        label: md`\max(0,\ 1/2 - \min\kappa) \text{ on the spherical curve}`,
        value: (s) => {
          const g = curve(s, 'gamma');
          let m = Infinity;
          for (let i = 1; i < 80; i++) m = Math.min(m, frenetAt(g, g.a + ((g.b - g.a) * i) / 80).kappa);
          return Math.max(0, 0.5 - m);
        },
      },
    ],
  },
  // ===========================================================================================
  // §2.4 Arbitrary-Speed Curves (2.4.3 is in entries.ts)
  {
    id: '2.4.1',
    statement: md`If $\alpha$ is a regular curve in $\mathbf{R}^3$ with $\kappa > 0$, then
$$\begin{alignedat}{3} T' &={} & & \kappa vN, & & \\ N' &={} & -\kappa vT & & & + \tau vB, \\ B' &={} & & -\tau vN. & & \end{alignedat}$$`,
    proof: md`Let $\bar\alpha$ be a unit-speed reparametrization of $\alpha$. By definition $T = \bar T(s)$, where $s$ is an arc length function of $\alpha$. The chain rule for vector fields (Exercise 7 of §2.2) gives
$$T' = \bar T'(s)\,\frac{ds}{dt}.$$
By the usual Frenet formula $\bar T' = \bar\kappa\bar N$; substituting the function $s$,
$$\bar T'(s) = \bar\kappa(s)\bar N(s) = \kappa N,$$
by the definition of $\kappa$ and $N$ in the arbitrary-speed case. Since $ds/dt$ is the speed $v$ of $\alpha$, these two equations combine to give $T' = \kappa vN$. The formulas for $N'$ and $B'$ are derived in the same way. $\quad ∎$`,
    notes: md`**Transfer of the Frenet apparatus.** For a regular curve $\alpha$, take a unit-speed reparametrization $\bar\alpha$ with $\alpha(t) = \bar\alpha(s(t))$ (Fig. 2.14). If $\bar\kappa > 0$, define for $\alpha$: curvature $\kappa = \bar\kappa(s)$, torsion $\tau = \bar\tau(s)$, unit tangent $T = \bar T(s)$, principal normal $N = \bar N(s)$, binormal $B = \bar B(s)$. They describe exactly the same turning and twisting of the common route; e.g. a regular curve with $\tau = 0$ is a plane curve by [[2.3.5]].

For computations this transfer is impractical — explicit unit-speed parametrizations are rarely available (try $\alpha(t) = (t, t^2, t^3)$). The Frenet formulas give rates of change **with respect to arc length**; in general the speed $v$ is the correction factor, as in this lemma. (A common notation writes $dT/dt$ and $dT/ds$; then the proof is $dT/dt = (dT/ds)(ds/dt) = \kappa vN$.)

The figure: $\alpha(t) = (t, t^2, t^3)$ and its Frenet frame; the check differentiates the frame numerically.`,
    tryThis: [md`Animate $t_0$; the residuals stay $0$ although the speed varies.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('t0', 0.4, -1.2, 1.2, 0.01);
        b.add('curve', 'alpha', { comps: '(t, t^2, t^3)', param: 't', a: '-1.2', b: '1.2', dim: 3 });
        b.add('frenetFrame', 'TNB', { curve: 'alpha', t0: 't0', along: false, n: 12 });
        b.add('curvaturePlot', 'plot', { curve: 'alpha', kappa: true, tau: true, speed: true, ratio: false, marker: 't0' });
      },
      select: 'TNB',
    },
    checks: [
      { label: md`\lVert T' - \kappa vN \rVert`, value: (s) => frenetResiduals(curve(s, 'alpha'), num(s, 't0'))[0], tol: 1e-4 },
      { label: md`\lVert N' + \kappa vT - \tau vB \rVert`, value: (s) => frenetResiduals(curve(s, 'alpha'), num(s, 't0'))[1], tol: 1e-4 },
      { label: md`\lVert B' + \tau vN \rVert`, value: (s) => frenetResiduals(curve(s, 'alpha'), num(s, 't0'))[2], tol: 1e-4 },
    ],
  },
  {
    id: '2.4.2',
    statement: md`If $\alpha$ is a regular curve with speed function $v$, then the velocity and acceleration of $\alpha$ are given by
$$\alpha' = vT, \qquad \alpha'' = \frac{dv}{dt}T + \kappa v^2N.$$`,
    proof: md`Since $\alpha = \bar\alpha(s)$, where $s$ is the arc length function of $\alpha$, Lemma [[1.4.5]] gives
$$\alpha' = \bar\alpha'(s)\,\frac{ds}{dt} = v\,\bar T(s) = vT.$$
Differentiating again,
$$\alpha'' = \frac{dv}{dt}T + vT' = \frac{dv}{dt}T + \kappa v^2N,$$
using Lemma [[2.4.1]]. $\quad ∎$`,
    notes: md`$\alpha' = vT$ is expected: $\alpha'$ and $T$ are both tangent and $\lVert \alpha' \rVert = v$. The acceleration formula is more interesting (Fig. 2.15). The **tangential component** $\frac{dv}{dt}T$ measures the rate of change of the speed; the **normal component** $\kappa v^2N$ the rate of change of direction. Newton's laws make these felt as forces: speeding up on a straight road you feel only $\frac{dv}{dt}T$; taking an unbanked curve at speed $v$ you feel $\kappa v^2N$ — $\kappa$ is how sharply the *road* turns, $v^2$ the effect of speed (60 mph is four times as unsettling as 30).

Only for a **constant-speed** curve is the acceleration always orthogonal to the velocity ($\beta' \bullet \beta'$ constant $\iff 2\beta' \bullet \beta'' = 0$).

The figure shows $\alpha'(t_0)$, $\alpha''(t_0)$ and the two dashed components of $\alpha''$.`,
    tryThis: [md`Animate $t_0$: where the speed is extremal, $dv/dt = 0$ and the acceleration is purely normal.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('t0', 0.5, -1.2, 1.2, 0.01);
        b.add('curve', 'alpha', { comps: '(t, t^2, t^3)', param: 't', a: '-1.2', b: '1.2', dim: 3 });
        b.add('velocity', 'vel', { curve: 'alpha', t0: 't0' });
        b.add('acceleration', 'acc', { curve: 'alpha', t0: 't0' });
        b.add('accDecomposition', 'parts', { curve: 'alpha', t0: 't0' });
        b.add('frenetFrame', 'TNB', { curve: 'alpha', t0: 't0', along: false, n: 12 }, { visible: false });
      },
      select: 'parts',
    },
    checks: [
      {
        label: md`\alpha' - vT`,
        value: (s) => {
          const F = frenetAt(curve(s, 'alpha'), num(s, 't0'));
          return diff(vec(s, 'vel').v, F.T.map((x) => F.v * x));
        },
      },
      {
        label: md`\alpha'' - \left(\tfrac{dv}{dt}T + \kappa v^2N\right)`,
        value: (s) => {
          const c = curve(s, 'alpha');
          const t = num(s, 't0');
          const F = frenetAt(c, t);
          const h = 1e-5;
          const dv = (norm(c.d1(t + h)) - norm(c.d1(t - h))) / (2 * h);
          return diff(vec(s, 'acc').v, [0, 1, 2].map((i) => dv * F.T[i] + F.kappa * F.v ** 2 * F.N[i]));
        },
        tol: 1e-4,
      },
    ],
  },
  {
    id: '2.4.4',
    statement: md`The Frenet apparatus of the **3-curve** $\alpha(t) = (3t - t^3,\ 3t^2,\ 3t + t^3)$.`,
    proof: md`The derivatives are
$$\alpha'(t) = 3(1 - t^2,\ 2t,\ 1 + t^2), \qquad \alpha''(t) = 6(-t,\ 1,\ t), \qquad \alpha'''(t) = 6(-1,\ 0,\ 1).$$
Now $\alpha'(t) \bullet \alpha'(t) = 18(1 + 2t^2 + t^4)$, so
$$v(t) = \lVert \alpha'(t) \rVert = \sqrt{18}\,(1 + t^2).$$
The definition of cross product gives
$$\alpha'(t) \times \alpha''(t) = 18\begin{vmatrix} U_1 & U_2 & U_3 \\ 1 - t^2 & 2t & 1 + t^2 \\ -t & 1 & t \end{vmatrix} = 18(-1 + t^2,\ -2t,\ 1 + t^2).$$
Dotting this vector with itself, $(18)^2\left[(-1 + t^2)^2 + 4t^2 + (1 + t^2)^2\right] = 2(18)^2(1 + t^2)^2$, hence
$$\lVert \alpha'(t) \times \alpha''(t) \rVert = 18\sqrt2\,(1 + t^2).$$
With $\alpha'''$: $(\alpha' \times \alpha'') \bullet \alpha''' = 6 \cdot 18 \cdot 2$. Substituting into the formulas of Theorem [[2.4.3]] (with $N = B \times T$ by another cross product) gives
$$T = \frac{(1 - t^2,\ 2t,\ 1 + t^2)}{\sqrt2\,(1 + t^2)}, \qquad N = \frac{(-2t,\ 1 - t^2,\ 0)}{1 + t^2}, \qquad B = \frac{(-1 + t^2,\ -2t,\ 1 + t^2)}{\sqrt2\,(1 + t^2)},$$
$$\kappa = \tau = \frac{1}{3(1 + t^2)^2}.$$`,
    notes: md`Alternatively, $\lVert \alpha' \times \alpha'' \rVert$ can be computed with the identity of [[2.1.8]], and $(\alpha' \times \alpha'') \bullet \alpha''' = \alpha' \bullet (\alpha'' \times \alpha''')$ as a determinant. With $v$, the arbitrary-speed formulas recover §2.3 when $v = 1$.

Since $\kappa = \tau$, the ratio $\tau/\kappa = 1$ is constant: the 3-curve is a **cylindrical helix** ([[2.4.6]]); indeed the third coordinate of $T$ is $1/\sqrt2$, so $T$ makes a constant $45°$ angle with $U_3$.`,
    tryThis: [md`Animate $t_0$ and compare the computed $T, N, B$ with the book's formulas (live check).`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('t0', 0.6, -1.2, 1.2, 0.01);
        b.add('curve', 'alpha', { comps: '(3*t - t^3, 3*t^2, 3*t + t^3)', param: 't', a: '-1.2', b: '1.2', dim: 3 });
        b.add('frenetFrame', 'TNB', { curve: 'alpha', t0: 't0', along: false, n: 12 });
        b.add('curvaturePlot', 'plot', { curve: 'alpha', kappa: true, tau: true, speed: false, ratio: false, marker: 't0' });
      },
      select: 'TNB',
    },
    checks: [
      {
        label: md`T, N, B - \text{book's formulas}`,
        value: (s) => {
          const t = num(s, 't0');
          const F = frame(s, 'TNB');
          const q = 1 + t * t;
          const r = Math.SQRT2 * q;
          return Math.max(diff(F.e[0], [(1 - t * t) / r, (2 * t) / r, q / r]), diff(F.e[1], [(-2 * t) / q, (1 - t * t) / q, 0]), diff(F.e[2], [(-1 + t * t) / r, (-2 * t) / r, q / r]));
        },
      },
      {
        label: md`\kappa - \frac{1}{3(1+t_0^2)^2},\ \tau - \frac{1}{3(1+t_0^2)^2}`,
        value: (s) => {
          const t = num(s, 't0');
          const F = frenetAt(curve(s, 'alpha'), t);
          const k = 1 / (3 * (1 + t * t) ** 2);
          return Math.max(Math.abs(F.kappa - k), Math.abs(F.tau - k));
        },
      },
    ],
  },
  {
    id: '2.4.5',
    statement: md`A regular curve $\alpha$ in $\mathbf{R}^3$ is a **cylindrical helix** provided the unit tangent $T$ of $\alpha$ has constant angle $\vartheta$ with some fixed unit vector $\mathbf{u}$; that is, $T(t) \bullet \mathbf{u} = \cos\vartheta$ for all $t$.`,
    notes: md`The condition is unchanged by reparametrization, so take $\beta$ with unit speed and $T \bullet \mathbf{u} = \cos\vartheta$. The function $h(s) = (\beta(s) - \beta(0)) \bullet \mathbf{u}$ measures how far $\beta$ has "risen" in the $\mathbf{u}$ direction (Fig. 2.17), and
$$\frac{dh}{ds} = \beta' \bullet \mathbf{u} = T \bullet \mathbf{u} = \cos\vartheta,$$
so $\beta$ rises at a constant rate relative to arc length: $h(s) = s\cos\vartheta$ (in general $h(t) = s(t)\cos\vartheta$). Drawing through each point of $\beta$ the line in the $\mathbf{u}$ direction gives a **cylinder** $C$ that $\beta$ cuts at the constant angle $\vartheta$ (Fig. 2.18); when $C$ is circular, $\beta$ is a helix as in [[2.3.3]].

**Spherical image** (§2.4). Moving each $T(s)$ of a unit-speed $\beta$ to the origin gives a curve $\sigma \approx T$ on the unit sphere whose motion represents the turning of $\beta$; its speed is $\kappa$ and its curvature $\kappa_\sigma = (1 + (\tau/\kappa)^2)^{1/2} \ge 1$ depends only on $\tau/\kappa$. For a cylindrical helix, $\sigma$ stays on the circle of the sphere where $\sigma \bullet \mathbf{u} = \cos\vartheta$.

The figure: the 3-curve of [[2.4.4]] is a cylindrical helix with $\mathbf{u} = U_3$, $\vartheta = 45°$. The vertical segments down to the $xy$ plane are rulings of its (non-circular) cylinder; the 2D view graphs $T \bullet \mathbf{u}$, constant $1/\sqrt2$.`,
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('curve', 'alpha', { comps: '(3*t - t^3, 3*t^2, 3*t + t^3)', param: 't', a: '-1.2', b: '1.2', dim: 3 });
        b.add('curve', 'base', { comps: '(3*t - t^3, 3*t^2, 0)', param: 't', a: '-1.2', b: '1.2', dim: 3 }, { color: '#8c959f', caption: '\\text{base of } C' });
        b.add('curveField', 'rul', { curve: 'alpha', mode: 'custom', comps: '(0, 0, -(3*t + t^3))', n: 25, scale: 1 }, { color: '#d0d7de', label: false, caption: '\\text{rulings}' });
        b.add('curvaturePlot', 'plot', { curve: 'alpha', kappa: false, tau: false, speed: false, ratio: false, Tu: true, u: '(0, 0, 1)', marker: '' });
      },
      select: 'plot',
    },
    checks: [
      {
        label: md`\max |T \bullet U_3 - 1/\sqrt2|`,
        value: (s) => {
          const c = curve(s, 'alpha');
          let m = 0;
          for (let i = 0; i <= 40; i++) m = Math.max(m, Math.abs(frenetAt(c, c.a + ((c.b - c.a) * i) / 40).T[2] - Math.SQRT1_2));
          return m;
        },
      },
    ],
  },
  {
    id: '2.4.6',
    statement: md`A regular curve $\alpha$ with $\kappa > 0$ is a cylindrical helix if and only if the ratio $\tau/\kappa$ is constant.`,
    proof: md`It suffices to treat a unit-speed $\alpha$. If $\alpha$ is a cylindrical helix with $T \bullet \mathbf{u} = \cos\vartheta$, then
$$0 = (T \bullet \mathbf{u})' = T' \bullet \mathbf{u} = \kappa N \bullet \mathbf{u}.$$
Since $\kappa > 0$, $N \bullet \mathbf{u} = 0$: at each $s$, $\mathbf{u}$ lies in the plane of $T(s)$ and $B(s)$, and orthonormal expansion gives
$$\mathbf{u} = \cos\vartheta\,T + \sin\vartheta\,B.$$
Differentiating and using the Frenet formulas,
$$0 = (\kappa\cos\vartheta - \tau\sin\vartheta)\,N.$$
Hence $\tau\sin\vartheta = \kappa\cos\vartheta$, and $\tau/\kappa$ has the constant value $\cot\vartheta$.

Conversely, suppose $\tau/\kappa$ is constant, and choose $\vartheta$ with $\cot\vartheta = \tau/\kappa$. For
$$U = \cos\vartheta\,T + \sin\vartheta\,B$$
we find $U' = (\kappa\cos\vartheta - \tau\sin\vartheta)\,N = 0$. This parallel vector field determines (Remark [[2.3.4]]) a unit vector $\mathbf{u}$ with $T \bullet \mathbf{u} = \cos\vartheta$, so $\alpha$ is a cylindrical helix. $\quad ∎$`,
    notes: md`Exercise 9 uses this to show that *circular* helices are characterized by constant curvature and torsion (see also [[3.5.5]]). Summary of the effect of simple hypotheses on a regular curve:

- $\kappa = 0$ $\iff$ straight line;
- $\tau = 0$ $\iff$ plane curve;
- $\kappa$ constant $> 0$ and $\tau = 0$ $\iff$ circle;
- $\kappa$ constant $> 0$ and $\tau$ constant $> 0$ $\iff$ circular helix;
- $\tau/\kappa$ constant $\ne 0$ $\iff$ cylindrical helix.

The figure: for the 3-curve ($\tau/\kappa = 1$, $\vartheta = \pi/4$), the field $U = \cos\vartheta\,T + \sin\vartheta\,B$ drawn along the curve is parallel — the same vertical vector everywhere; the 2D view graphs $\tau/\kappa$.`,
    tryThis: [md`Replace the curve by $(\cos t, \sin t, t^2/4)$: $\tau/\kappa$ is no longer constant and $U$ (with any fixed $\vartheta$) is no longer parallel.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('curve', 'alpha', { comps: '(3*t - t^3, 3*t^2, 3*t + t^3)', param: 't', a: '-1.2', b: '1.2', dim: 3 });
        b.add('slider', 'th', { value: 'pi/4', min: 0, max: 3.14, step: 0.01 }, { caption: '\\vartheta' });
        b.add('curveField', 'U', { curve: 'alpha', mode: 'frenet', fcomps: '(cos(th), 0, sin(th))', n: 13, scale: 1.5 }, { color: '#bf8700', caption: 'U' });
        b.add('curvaturePlot', 'plot', { curve: 'alpha', kappa: true, tau: true, speed: false, ratio: true, marker: '' });
      },
      select: 'U',
    },
    checks: [
      {
        label: md`\max |\tau/\kappa - 1|`,
        value: (s) => {
          const c = curve(s, 'alpha');
          let m = 0;
          for (let i = 0; i <= 40; i++) {
            const F = frenetAt(c, c.a + ((c.b - c.a) * i) / 40);
            m = Math.max(m, Math.abs(F.tau / F.kappa - 1));
          }
          return m;
        },
      },
      {
        label: md`U \text{ is parallel: } \max_t \lVert U(t) - U(t_{\text{first}}) \rVert`,
        value: (s) => {
          const items = vectors(s, 'U').items;
          return Math.max(...items.map((it) => diff(it.v, items[0].v))) / 1.5;
        },
      },
    ],
  },
  // ===========================================================================================
  // §2.5 Covariant Derivatives
  {
    id: '2.5.1',
    statement: md`Let $W$ be a vector field on $\mathbf{R}^3$, and let $\mathbf{v}$ be a tangent vector to $\mathbf{R}^3$ at the point $\mathbf{p}$. Then the **covariant derivative** of $W$ with respect to $\mathbf{v}$ is the tangent vector
$$\nabla_\mathbf{v}W = W(\mathbf{p} + t\mathbf{v})'(0)$$
at the point $\mathbf{p}$.`,
    notes: md`The definition mimics $\mathbf{v}[f]$ ([[1.3.1]]): replacing $f$ by $W$ gives the vector field $t \mapsto W(\mathbf{p} + t\mathbf{v})$ on the line $t \mapsto \mathbf{p} + t\mathbf{v}$, and fields on curves are differentiated as in §2.2. So $\nabla_\mathbf{v}W$ measures the **initial rate of change of $W(\mathbf{p})$ as $\mathbf{p}$ moves in the $\mathbf{v}$ direction**. ("Covariant" refers to a generalization in Chapter 7.)

**The book's example.** $W = x^2U_1 + yzU_3$, $\mathbf{v} = (-1, 0, 2)$ at $\mathbf{p} = (2, 1, 0)$. Then $\mathbf{p} + t\mathbf{v} = (2 - t, 1, 2t)$, so $W(\mathbf{p} + t\mathbf{v}) = (2 - t)^2U_1 + 2tU_3$ (with $U_i$ evaluated at $\mathbf{p} + t\mathbf{v}$) and
$$\nabla_\mathbf{v}W = W(\mathbf{p} + t\mathbf{v})'(0) = -4U_1(\mathbf{p}) + 2U_3(\mathbf{p}).$$
The figure shows $W$ restricted to the line (the arrows along it) and $\nabla_\mathbf{v}W$ at $\mathbf{p}$.`,
    tryThis: [md`Edit $\mathbf{v}$ or drag $\mathbf{p}$ and watch how the arrows of $W$ along the line change near $\mathbf{p}$.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('vectorField', 'W', { comps: '(x^2, 0, y*z)', box: 2, n: 4, scale: 0.15, dim: 3 }, { visible: false });
        b.add('point', 'p', { coords: '(2, 1, 0)' });
        b.add('tangentVector', 'v', { v: '(-1, 0, 2)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('straightLine', 'ell', { p: 'p', q: 'v', a: '-0.6', b: '0.8', dim: 3 }, { color: '#8c959f', caption: '\\mathbf{p} + t\\mathbf{v}' });
        b.add('curveField', 'Wl', { curve: 'ell', mode: 'restriction', W: 'W', n: 8, scale: 0.25 }, { color: '#8250df', caption: 'W(\\mathbf{p} + t\\mathbf{v})' });
        b.add('covariantDerivative', 'DvW', { v: 'v', W: 'W' });
      },
      select: 'DvW',
    },
    checks: [
      { label: md`\nabla_\mathbf{v}W - W(\mathbf{p} + t\mathbf{v})'(0) \text{ (numerical)}`, value: (s) => diff(vec(s, 'DvW').v, covDef(field(s, 'W'), vec(s, 'v').p, vec(s, 'v').v)) },
    ],
  },
  {
    id: '2.5.2',
    statement: md`If $W = \sum w_iU_i$ is a vector field on $\mathbf{R}^3$, and $\mathbf{v}$ is a tangent vector at $\mathbf{p}$, then
$$\nabla_\mathbf{v}W = \sum \mathbf{v}[w_i]\,U_i(\mathbf{p}).$$`,
    proof: md`For the restriction of $W$ to the curve $t \mapsto \mathbf{p} + t\mathbf{v}$,
$$W(\mathbf{p} + t\mathbf{v}) = \sum w_i(\mathbf{p} + t\mathbf{v})\,U_i(\mathbf{p} + t\mathbf{v}).$$
Such a field is differentiated (at $t = 0$) by differentiating its Euclidean coordinates. By the definition of directional derivative ([[1.3.1]]), the derivative of $w_i(\mathbf{p} + t\mathbf{v})$ at $t = 0$ is exactly $\mathbf{v}[w_i]$. Thus
$$\nabla_\mathbf{v}W = W(\mathbf{p} + t\mathbf{v})'(0) = \sum \mathbf{v}[w_i]\,U_i(\mathbf{p}). \qquad ∎$$`,
    notes: md`In short: **to apply $\nabla_\mathbf{v}$ to a vector field, apply $\mathbf{v}$ to its Euclidean coordinates.** In the example of [[2.5.1]], $\mathbf{v}[x^2] = 2p_1v_1 = -4$, $\mathbf{v}[0] = 0$, $\mathbf{v}[yz] = p_3v_2 + p_2v_3 = 2$. The sandbox computes $\nabla_\mathbf{v}W$ with this formula; the check compares it with the definition.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('vectorField', 'W', { comps: '(x^2, 0, y*z)', box: 2, n: 4, scale: 0.15, dim: 3 }, { visible: false });
        b.add('point', 'p', { coords: '(2, 1, 0)' });
        b.add('tangentVector', 'v', { v: '(-1, 0, 2)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('covariantDerivative', 'DvW', { v: 'v', W: 'W' });
        b.add('function', 'w1', { expr: 'x^2', levels: '', box: 2, res: 30, dim: 3 });
        b.add('function', 'w3', { expr: 'y*z', levels: '', box: 2, res: 30, dim: 3 });
        b.add('directionalDerivative', 'vw1', { v: 'v', f: 'w1' }, { caption: '\\mathbf{v}[w_1]' });
        b.add('directionalDerivative', 'vw3', { v: 'v', f: 'w3' }, { caption: '\\mathbf{v}[w_3]' });
      },
      select: 'DvW',
    },
    checks: [
      { label: md`\nabla_\mathbf{v}W - (\mathbf{v}[w_1], \mathbf{v}[w_2], \mathbf{v}[w_3])`, value: (s) => diff(vec(s, 'DvW').v, [num(s, 'vw1'), 0, num(s, 'vw3')]) },
      { label: md`\nabla_\mathbf{v}W - W(\mathbf{p} + t\mathbf{v})'(0)`, value: (s) => diff(vec(s, 'DvW').v, covDef(field(s, 'W'), vec(s, 'v').p, vec(s, 'v').v)) },
    ],
  },
  {
    id: '2.5.3',
    statement: md`Let $\mathbf{v}$ and $\mathbf{w}$ be tangent vectors to $\mathbf{R}^3$ at $\mathbf{p}$, and let $Y$ and $Z$ be vector fields on $\mathbf{R}^3$. Then for numbers $a$, $b$ and functions $f$,

- (1) $\nabla_{a\mathbf{v} + b\mathbf{w}}Y = a\nabla_\mathbf{v}Y + b\nabla_\mathbf{w}Y$.
- (2) $\nabla_\mathbf{v}(aY + bZ) = a\nabla_\mathbf{v}Y + b\nabla_\mathbf{v}Z$.
- (3) $\nabla_\mathbf{v}(fY) = \mathbf{v}[f]\,Y(\mathbf{p}) + f(\mathbf{p})\,\nabla_\mathbf{v}Y$.
- (4) $\mathbf{v}[Y \bullet Z] = \nabla_\mathbf{v}Y \bullet Z(\mathbf{p}) + Y(\mathbf{p}) \bullet \nabla_\mathbf{v}Z$.`,
    proof: md`These follow from the corresponding properties of directional derivatives (Theorem [[1.3.3]]) via Lemma [[2.5.2]]. We prove (4). If $Y = \sum y_iU_i$ and $Z = \sum z_iU_i$, then $Y \bullet Z = \sum y_iz_i$, so by Theorem [[1.3.3]]
$$\mathbf{v}[Y \bullet Z] = \mathbf{v}\left[\sum y_iz_i\right] = \sum \mathbf{v}[y_i]\,z_i(\mathbf{p}) + \sum y_i(\mathbf{p})\,\mathbf{v}[z_i].$$
But by the preceding lemma, $\nabla_\mathbf{v}Y = \sum \mathbf{v}[y_i]U_i(\mathbf{p})$ and $\nabla_\mathbf{v}Z = \sum \mathbf{v}[z_i]U_i(\mathbf{p})$. So the two sums are exactly $\nabla_\mathbf{v}Y \bullet Z(\mathbf{p})$ and $Y(\mathbf{p}) \bullet \nabla_\mathbf{v}Z$. $\quad ∎$`,
    notes: md`Once more, differentiation comes with linear and Leibnizian properties. The figure shows $\mathbf{v}$, $\mathbf{w}$, $a\mathbf{v} + b\mathbf{w}$ and the covariant derivatives of $Y$ in these directions; the live checks evaluate both sides of (1)–(4).`,
    tryThis: [md`Move $a$, $b$ or drag $\mathbf{p}$: the four identities keep holding.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('a', 1.5, -2, 2, 0.01);
        b.slider('b', -1, -2, 2, 0.01);
        b.add('vectorField', 'Y', { comps: '(-y, x*z, 1)', box: 1.5, n: 3, scale: 0.2, dim: 3 }, { visible: false });
        b.add('vectorField', 'Z', { comps: '(cos(x), sin(x), y)', box: 1.5, n: 3, scale: 0.2, dim: 3 }, { visible: false });
        b.add('function', 'f', { expr: 'x*y + z^2', levels: '', box: 2, res: 30, dim: 3 });
        b.add('point', 'p', { coords: '(1, 0.5, -0.5)' });
        b.add('tangentVector', 'v', { v: '(1, 0, 1)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('tangentVector', 'w', { v: '(0, 1, -0.5)', p: 'p' }, { color: '#0969da', caption: '\\mathbf{w}' });
        b.add('combination', 'u', { expr: 'a*v + b*w' }, { color: '#1a7f37', caption: 'a\\mathbf{v}+b\\mathbf{w}' });
        b.add('covariantDerivative', 'DvY', { v: 'v', W: 'Y' }, { caption: '\\nabla_\\mathbf{v}Y' });
        b.add('covariantDerivative', 'DwY', { v: 'w', W: 'Y' }, { caption: '\\nabla_\\mathbf{w}Y', color: '#0969da' });
        b.add('covariantDerivative', 'DuY', { v: 'u', W: 'Y' }, { caption: '\\nabla_{a\\mathbf{v}+b\\mathbf{w}}Y', color: '#1a7f37' });
      },
      select: 'DuY',
    },
    checks: [
      { label: md`(1)`, value: (s) => diff(vec(s, 'DuY').v, vec(s, 'DvY').v.map((x, i) => num(s, 'a') * x + num(s, 'b') * vec(s, 'DwY').v[i])) },
      {
        label: md`(2)`,
        value: (s) => {
          const Y = field(s, 'Y');
          const Z = field(s, 'Z');
          const [a, b] = [num(s, 'a'), num(s, 'b')];
          const { p, v } = vec(s, 'v');
          const comb = { ...Y, f: (x: number[]) => Y.f(x).map((y, i) => a * y + b * Z.f(x)[i]) };
          return diff(covDef(comb, p, v), covDef(Y, p, v).map((y, i) => a * y + b * covDef(Z, p, v)[i]));
        },
        tol: 1e-6,
      },
      {
        label: md`(3)`,
        value: (s) => {
          const Y = field(s, 'Y');
          const f = fn(s, 'f');
          const { p, v } = vec(s, 'v');
          const fY = { ...Y, f: (x: number[]) => Y.f(x).map((y) => f.f(x) * y) };
          const vf = dirDerivDef(f, p, v);
          return diff(covDef(fY, p, v), Y.f(p).map((y, i) => vf * y + f.f(p) * covDef(Y, p, v)[i]));
        },
        tol: 1e-6,
      },
      {
        label: md`(4)`,
        value: (s) => {
          const Y = field(s, 'Y');
          const Z = field(s, 'Z');
          const { p, v } = vec(s, 'v');
          const YZ = { kind: 'function', dim: 3, vars: ['x', 'y', 'z'], f: (x: number[]) => dot(Y.f(x), Z.f(x)) } as unknown as FunctionValue;
          return Math.abs(dirDerivDef(YZ, p, v) - dot(covDef(Y, p, v), Z.f(p)) - dot(Y.f(p), covDef(Z, p, v)));
        },
        tol: 1e-6,
      },
    ],
  },
  {
    id: '2.5.4',
    statement: md`Let $V$, $W$, $Y$ and $Z$ be vector fields on $\mathbf{R}^3$. Then

- (1) $\nabla_{fV + gW}Y = f\nabla_VY + g\nabla_WY$, for all functions $f$ and $g$.
- (2) $\nabla_V(aY + bZ) = a\nabla_VY + b\nabla_VZ$, for all numbers $a$ and $b$.
- (3) $\nabla_V(fY) = V[f]\,Y + f\nabla_VY$, for all functions $f$.
- (4) $V[Y \bullet Z] = \nabla_VY \bullet Z + Y \bullet \nabla_VZ$.`,
    proof: md`The book omits the proof: it is an exercise in the use of parentheses, based on the pointwise definition $(\nabla_VY)(\mathbf{p}) = \nabla_{V(\mathbf{p})}Y$ and Theorem [[2.5.3]] — exactly as [[1.3.4]] follows from [[1.3.3]].`,
    notes: md`By the pointwise principle, the covariant derivative of $W$ with respect to a **vector field** $V$ is the vector field $\nabla_VW$ whose value at $\mathbf{p}$ is $\nabla_{V(\mathbf{p})}W$. By [[2.5.2]], if $W = \sum w_iU_i$ then $\nabla_VW = \sum V[w_i]\,U_i$, easily computed with $U_i[f] = \partial f/\partial x_i$.

**The book's example.** $V = (y - x)U_1 + xyU_3$, $W = x^2U_1 + yzU_3$: $V[x^2] = (y - x)U_1[x^2] = 2x(y - x)$ and $V[yz] = xyU_3[yz] = xy^2$, so
$$\nabla_VW = 2x(y - x)\,U_1 + xy^2\,U_3.$$
$\nabla_VY$ is **not symmetric** in $V$ and $Y$: $Y$ is differentiated, $V$ only enters algebraically. So $\nabla_{fV}Y = f\nabla_VY$, but $\nabla_V(fY) \ne f\nabla_VY$ — there is the extra term $V[f]\,Y$.

The figure draws $V$ and $\nabla_VW$ (sampled); the checks compare with the book's result and verify (3).`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('vectorField', 'V', { comps: '(y - x, 0, x*y)', box: 1.5, n: 4, scale: 0.25, dim: 3 });
        b.add('vectorField', 'W', { comps: '(x^2, 0, y*z)', box: 1.5, n: 4, scale: 0.25, dim: 3 }, { visible: false });
        b.add('covariantDerivative', 'DVW', { v: 'V', W: 'W' }, { color: '#cf222e' });
        b.add('vectorField', 'book', { comps: '(2*x*(y - x), 0, x*y^2)', box: 1.5, n: 4, scale: 0.25, dim: 3 }, { visible: false, caption: '2x(y-x)U_1 + xy^2U_3' });
        b.add('function', 'f', { expr: 'x + y*z', levels: '', box: 2, res: 30, dim: 3 });
      },
      select: 'DVW',
    },
    checks: [
      { label: md`\nabla_VW - (2x(y - x)U_1 + xy^2U_3)`, value: (s) => fieldDiff(field(s, 'DVW'), field(s, 'book')) },
      {
        label: md`(3)\ \nabla_V(fW) - V[f]W - f\nabla_VW \text{ at sample points}`,
        value: (s) => {
          const V = field(s, 'V');
          const W = field(s, 'W');
          const f = fn(s, 'f');
          const fW = { ...W, f: (x: number[]) => W.f(x).map((y) => f.f(x) * y) };
          let m = 0;
          for (const p of SAMPLES) {
            const v = V.f(p);
            const Vf = dirDerivDef(f, p, v);
            m = Math.max(m, diff(covDef(fW, p, v), W.f(p).map((y, i) => Vf * y + f.f(p) * covDef(W, p, v)[i])));
          }
          return m;
        },
        tol: 1e-6,
      },
    ],
  },
  // ===========================================================================================
  // §2.6 Frame Fields
  {
    id: '2.6.1',
    statement: md`Vector fields $E_1, E_2, E_3$ on $\mathbf{R}^3$ constitute a **frame field** on $\mathbf{R}^3$ provided
$$E_i \bullet E_j = \delta_{ij} \qquad (1 \le i, j \le 3),$$
where $\delta_{ij}$ is the Kronecker delta.`,
    notes: md`At each point $\mathbf{p}$, $E_1(\mathbf{p}), E_2(\mathbf{p}), E_3(\mathbf{p})$ is then a frame ([[2.1.4]]).

**The method of moving frames.** After Frenet (1847) and Serret (1851), Darboux (around 1880) adapted the method to surfaces and Cartan brought it to full generality: *assign a frame to each point of the object under study, then use orthonormal expansion to express the rate of change of the frame in terms of the frame itself* — exactly what the Frenet formulas do for a curve. §§2.6–2.8 carry this out for $\mathbf{R}^3$ itself; the geometry of curves and surfaces will be a corollary.

By the pointwise principle, $V \bullet W$ is the function with value $V(\mathbf{p}) \bullet W(\mathbf{p})$, and the norm $\lVert V \rVert = (V \bullet V)^{1/2}$ is a function — not necessarily differentiable where $V = 0$.

The figure: a frame field that turns about the $z$ axis as the height grows, $E_1 = \cos z\,U_1 + \sin z\,U_2$, $E_2 = -\sin z\,U_1 + \cos z\,U_2$, $E_3 = U_3$, drawn on a grid, and its frame at the movable point $\mathbf{p}$.`,
    tryThis: [md`Drag $\mathbf{p}$ up and down: the frame turns.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frameField', 'E', { preset: 'custom', E1: '(cos(z), sin(z), 0)', E2: '(-sin(z), cos(z), 0)', E3: '(0, 0, 1)', box: 2, n: 3 });
        b.add('point', 'p', { coords: '(1, 1, 0.5)' });
        b.add('frameFieldAt', 'Ep', { field: 'E', p: 'p' });
      },
      select: 'E',
    },
    checks: [{ label: md`\max |E_i \bullet E_j - \delta_{ij}| \text{ at sample points}`, value: (s) => Math.max(...SAMPLES.map((q) => orthoErr(framefield(s, 'E').E(q)))) }],
  },
  {
    id: '2.6.2',
    statement: md`**(1) The cylindrical frame field** (Fig. 2.19). Let $r, \vartheta, z$ be the usual cylindrical coordinate functions on $\mathbf{R}^3$, and take a unit vector field in the direction in which each coordinate increases (the other two held constant). For $r$ this is $E_1 = \cos\vartheta\,U_1 + \sin\vartheta\,U_2$, pointing straight out from the $z$ axis; then $E_2 = -\sin\vartheta\,U_1 + \cos\vartheta\,U_2$ points in the direction of increasing $\vartheta$, and $E_3 = U_3$. One checks $E_i \bullet E_j = \delta_{ij}$: this is the **cylindrical frame field** (defined on $\mathbf{R}^3$ minus the $z$ axis).

**(2) The spherical frame field** (Fig. 2.20). Similarly, a frame field $F_1, F_2, F_3$ comes from the spherical coordinates $\rho, \vartheta, \varphi$, where $\varphi$ is measured *up from the $xy$ plane*. With $E_1, E_2, E_3$ cylindrical: the field in the direction of increasing $\vartheta$ is $F_2 = E_2$; that of increasing $\rho$ points straight out from the origin, $F_1 = \cos\varphi\,E_1 + \sin\varphi\,E_3$ (Fig. 2.21); that of increasing $\varphi$ is $F_3 = -\sin\varphi\,E_1 + \cos\varphi\,E_3$. Hence
$$\begin{aligned} F_1 &= \cos\varphi(\cos\vartheta\,U_1 + \sin\vartheta\,U_2) + \sin\varphi\,U_3, \\ F_2 &= -\sin\vartheta\,U_1 + \cos\vartheta\,U_2, \\ F_3 &= -\sin\varphi(\cos\vartheta\,U_1 + \sin\vartheta\,U_2) + \cos\varphi\,U_3. \end{aligned}$$
Repeated use of $\sin^2 + \cos^2 = 1$ shows that $F_1, F_2, F_3$ is a frame field — the **spherical frame field** (again on $\mathbf{R}^3$ minus the $z$ axis).`,
    notes: md`In elementary calculus, frame fields usually come from coordinate systems like these. The figure shows, at the movable point $\mathbf{p}$, the cylindrical frame $E_1, E_2, E_3$ and the spherical frame $F_1, F_2, F_3$: $F_2 = E_2$, and $F_1, F_3$ are $E_1, E_3$ turned by the angle $\varphi$ (Fig. 2.21). The two frame fields themselves are in the Algebra view (hidden): show them to see them on a grid.`,
    tryThis: [md`Drag $\mathbf{p}$ (Shift for height): when $\mathbf{p}$ is in the $xy$ plane, $\varphi = 0$ and the two frames coincide.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frameField', 'E', { preset: 'cylindrical', box: 2, n: 3 }, { visible: false });
        b.add('frameField', 'F', { preset: 'spherical', box: 2, n: 3 }, { visible: false });
        b.add('point', 'p', { coords: '(1.5, 1, 1.2)' });
        b.add('frameFieldAt', 'Ep', { field: 'E', p: 'p' });
        b.add('frameFieldAt', 'Fp', { field: 'F', p: 'p' });
      },
      select: 'Fp',
    },
    checks: [
      {
        label: md`F_1 - (\cos\varphi\,E_1 + \sin\varphi\,E_3) \text{ at } \mathbf{p}`,
        value: (s) => {
          const [x, y, z] = point(s, 'p');
          const phi = Math.atan2(z, Math.hypot(x, y));
          const E = frame(s, 'Ep').e;
          const F = frame(s, 'Fp').e;
          return Math.max(diff(F[0], E[0].map((c, i) => Math.cos(phi) * c + Math.sin(phi) * E[2][i])), diff(F[1], E[1]), diff(F[2], E[0].map((c, i) => -Math.sin(phi) * c + Math.cos(phi) * E[2][i])));
        },
      },
    ],
  },
  {
    id: '2.6.3',
    statement: md`Let $E_1, E_2, E_3$ be a frame field on $\mathbf{R}^3$.

- (1) If $V$ is a vector field on $\mathbf{R}^3$, then $V = \sum f_iE_i$, where the functions $f_i = V \bullet E_i$ are called the **coordinate functions** of $V$ with respect to $E_1, E_2, E_3$.
- (2) If $V = \sum f_iE_i$ and $W = \sum g_iE_i$, then $V \bullet W = \sum f_ig_i$. In particular $\lVert V \rVert = \left(\sum f_i^2\right)^{1/2}$.`,
    proof: md`This is an immediate consequence of orthonormal expansion (Theorem [[2.1.5]]) applied at each point $\mathbf{p}$ to the frame $E_1(\mathbf{p}), E_2(\mathbf{p}), E_3(\mathbf{p})$, together with the computation $\mathbf{v} \bullet \mathbf{w} = \sum a_ib_i$ that follows it. $\quad ∎$`,
    notes: md`So a vector field has a different set of coordinate functions for each frame field; the **Euclidean** coordinate functions ([[1.2.5]]) are those for $U_1, U_2, U_3$. Chapter 1 used the natural frame field exclusively; from now on one chooses a frame field *adapted to the problem at hand* — simpler computations and clearer geometry.

The figure expands $V(\mathbf{p})$ in the cylindrical frame at $\mathbf{p}$ (dashed components $f_i(\mathbf{p})E_i(\mathbf{p})$).`,
    tryThis: [md`Drag $\mathbf{p}$ around the $z$ axis: the cylindrical coordinates of $V = -yU_1 + xU_2$ are $(0, r, 0)$ — it is $r\,E_2$.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frameField', 'E', { preset: 'cylindrical', box: 2, n: 3 }, { visible: false });
        b.add('vectorField', 'V', { comps: '(-y, x, 0.5)', box: 2, n: 4, scale: 0.2, dim: 3 }, { visible: false });
        b.add('vectorField', 'W', { comps: '(1, z, x)', box: 2, n: 4, scale: 0.2, dim: 3 }, { visible: false });
        b.add('point', 'p', { coords: '(1.5, 0.5, 0.5)' });
        b.add('frameFieldAt', 'Ep', { field: 'E', p: 'p' });
        b.add('fieldAt', 'Vp', { V: 'V', p: 'p' });
        b.add('fieldAt', 'Wp', { V: 'W', p: 'p' }, { color: '#0969da' });
        b.add('orthonormalExpansion', 'comp', { v: 'Vp', frame: 'Ep' }, { caption: 'f_i(\\mathbf{p})E_i(\\mathbf{p})' });
      },
      select: 'comp',
    },
    checks: [
      {
        label: md`V \bullet W - \sum f_ig_i \text{ at } \mathbf{p}`,
        value: (s) => {
          const E = frame(s, 'Ep').e;
          const v = vec(s, 'Vp').v;
          const w = vec(s, 'Wp').v;
          return dot(v, w) - E.reduce((acc, e) => acc + dot(v, e) * dot(w, e), 0);
        },
      },
    ],
  },
  // ===========================================================================================
  // §2.7 Connection Forms
  {
    id: '2.7.1',
    statement: md`Let $E_1, E_2, E_3$ be a frame field on $\mathbf{R}^3$. For each tangent vector $\mathbf{v}$ to $\mathbf{R}^3$ at the point $\mathbf{p}$, let
$$\omega_{ij}(\mathbf{v}) = \nabla_\mathbf{v}E_i \bullet E_j(\mathbf{p}) \qquad (1 \le i, j \le 3).$$
Then each $\omega_{ij}$ is a 1-form, and $\omega_{ij} = -\omega_{ji}$. These 1-forms are called the **connection forms** of the frame field $E_1, E_2, E_3$.`,
    proof: md`By definition $\omega_{ij}$ is a real-valued function on tangent vectors, so to show it is a 1-form ([[1.5.1]]) it suffices to check linearity. By Theorem [[2.5.3]],
$$\begin{aligned} \omega_{ij}(a\mathbf{v} + b\mathbf{w}) &= \nabla_{a\mathbf{v} + b\mathbf{w}}E_i \bullet E_j(\mathbf{p}) = (a\nabla_\mathbf{v}E_i + b\nabla_\mathbf{w}E_i) \bullet E_j(\mathbf{p}) \\ &= a\nabla_\mathbf{v}E_i \bullet E_j(\mathbf{p}) + b\nabla_\mathbf{w}E_i \bullet E_j(\mathbf{p}) = a\,\omega_{ij}(\mathbf{v}) + b\,\omega_{ij}(\mathbf{w}). \end{aligned}$$
For $\omega_{ij} = -\omega_{ji}$ we show $\omega_{ij}(\mathbf{v}) = -\omega_{ji}(\mathbf{v})$ for every $\mathbf{v}$. By definition of frame field $E_i \bullet E_j = \delta_{ij}$, a constant (0 or 1), so the Leibnizian formula (4) of Theorem [[2.5.3]] gives
$$0 = \mathbf{v}[E_i \bullet E_j] = \nabla_\mathbf{v}E_i \bullet E_j(\mathbf{p}) + E_i(\mathbf{p}) \bullet \nabla_\mathbf{v}E_j.$$
By symmetry of the dot product the last term is $\omega_{ji}(\mathbf{v})$, so $0 = \omega_{ij}(\mathbf{v}) + \omega_{ji}(\mathbf{v})$. $\quad ∎$`,
    notes: md`The power of the Frenet formulas is that they express $T', N', B'$ *in terms of $T, N, B$*. The same is done for an arbitrary frame field: by orthonormal expansion
$$\nabla_\mathbf{v}E_i = \sum_j c_{ij}E_j(\mathbf{p}), \qquad c_{ij} = \nabla_\mathbf{v}E_i \bullet E_j(\mathbf{p}),$$
and since the coefficients depend on $\mathbf{v}$ they are written $\omega_{ij}(\mathbf{v})$. Geometrically, **$\omega_{ij}(\mathbf{v})$ is the initial rate at which $E_i$ rotates toward $E_j$ as $\mathbf{p}$ moves in the $\mathbf{v}$ direction**; the 1-forms $\omega_{ij}$ hold this information for all tangent vectors.

The figure: the spherical frame field, a tangent vector $\mathbf{v}$ at $\mathbf{p}$, and the connection forms evaluated on $\mathbf{v}$ (Course view of $\omega$: formula vs. definition).`,
    tryThis: [md`Edit $\mathbf{v}$ or drag $\mathbf{p}$: the values $\omega_{ij}(\mathbf{v})$ from the formulas match the definition $\nabla_\mathbf{v}E_i \bullet E_j$.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frameField', 'F', { preset: 'spherical', box: 2, n: 3 }, { visible: false });
        b.add('point', 'p', { coords: '(1.2, 0.8, 0.9)' });
        b.add('frameFieldAt', 'Fp', { field: 'F', p: 'p' });
        b.add('tangentVector', 'v', { v: '(0.3, 0.9, 0.4)', p: 'p' }, { caption: '\\mathbf{v}', color: '#57606a' });
        b.add('connectionForms', 'omega', { field: 'F', v: 'v' });
      },
      select: 'omega',
    },
    checks: [
      {
        label: md`\omega_{ij}(\mathbf{v}) - \nabla_\mathbf{v}E_i \bullet E_j(\mathbf{p})`,
        value: (s) => {
          const o = s.value('omega');
          if (!o || o.kind !== 'forms') throw new Error('omega undefined');
          return diff(o.extra!.values as number[], o.extra!.defValues as number[]);
        },
        tol: 1e-6,
      },
      {
        label: md`\omega_{ij}(\mathbf{v}) + \omega_{ji}(\mathbf{v}) \text{ (by the definition)}`,
        value: (s) => {
          const F = framefield(s, 'F');
          const { p, v } = vec(s, 'v');
          const h = 1e-5;
          const Ep = F.E(p.map((x, k) => x + h * v[k]));
          const Em = F.E(p.map((x, k) => x - h * v[k]));
          const E0 = F.E(p);
          const D = (i: number) => Ep[i].map((x, k) => (x - Em[i][k]) / (2 * h));
          let m = 0;
          for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) m = Math.max(m, Math.abs(dot(D(i), E0[j]) + dot(D(j), E0[i])));
          return m;
        },
        tol: 1e-6,
      },
    ],
  },
  {
    id: '2.7.2',
    statement: md`Let $\omega_{ij}$ $(1 \le i, j \le 3)$ be the connection forms of a frame field $E_1, E_2, E_3$ on $\mathbf{R}^3$. Then for any vector field $V$ on $\mathbf{R}^3$,
$$\nabla_VE_i = \sum_j \omega_{ij}(V)\,E_j \qquad (1 \le i \le 3).$$
These are the **connection equations** of the frame field $E_1, E_2, E_3$.`,
    proof: md`For fixed $i$ both sides are vector fields, so we must show that at each point $\mathbf{p}$
$$\nabla_{V(\mathbf{p})}E_i = \sum_j \omega_{ij}(V(\mathbf{p}))\,E_j(\mathbf{p}).$$
But the very definition of the connection forms makes this a consequence of orthonormal expansion ([[2.1.5]]). $\quad ∎$`,
    notes: md`For $i = j$ skew-symmetry gives $\omega_{ii} = -\omega_{ii}$, so $\omega_{11} = \omega_{22} = \omega_{33} = 0$: only $\omega_{12}, \omega_{13}, \omega_{23}$ matter, best seen as the skew-symmetric matrix
$$\omega = \begin{pmatrix} 0 & \omega_{12} & \omega_{13} \\ -\omega_{12} & 0 & \omega_{23} \\ -\omega_{13} & -\omega_{23} & 0 \end{pmatrix}.$$
Expanded, the connection equations read
$$\begin{aligned} \nabla_VE_1 &= \omega_{12}(V)E_2 + \omega_{13}(V)E_3, \\ \nabla_VE_2 &= -\omega_{12}(V)E_1 + \omega_{23}(V)E_3, \\ \nabla_VE_3 &= -\omega_{13}(V)E_1 - \omega_{23}(V)E_2, \end{aligned} \qquad (*)$$
an obvious relative of the Frenet formulas. Differences: the Frenet frame is *fitted* to its curve, so $T'$ involves $N$ only (no $\omega_{13}$ terms); and $\mathbf{R}^3$ has three dimensions, so the coefficients must handle arbitrary directions — they are 1-forms, not functions. And while the Frenet formulas describe the curve, an arbitrary frame field's connection equations only describe *how that frame field rotates* — a strength: fit a frame field to a geometric problem and they describe the problem. (The Frenet formulas can be deduced from them, Exercise 8.)

The figure checks $(*)$ for the spherical frame field: $\nabla_\mathbf{v}F_i$ computed directly (covariant derivative of $F_i$ as a vector field) vs. $\sum_j \omega_{ij}(\mathbf{v})F_j(\mathbf{p})$.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frameField', 'F', { preset: 'spherical', box: 2, n: 3 }, { visible: false });
        b.add('frameFieldVector', 'F1', { field: 'F', i: '1', box: 2, n: 4 }, { visible: false });
        b.add('point', 'p', { coords: '(1.2, 0.8, 0.9)' });
        b.add('frameFieldAt', 'Fp', { field: 'F', p: 'p' });
        b.add('tangentVector', 'v', { v: '(0.3, 0.9, 0.4)', p: 'p' }, { caption: '\\mathbf{v}', color: '#57606a' });
        b.add('covariantDerivative', 'DvF1', { v: 'v', W: 'F1' }, { caption: '\\nabla_\\mathbf{v}F_1', color: '#8250df' });
        b.add('connectionForms', 'omega', { field: 'F', v: 'v' });
      },
      select: 'DvF1',
    },
    checks: [
      {
        label: md`\nabla_\mathbf{v}F_1 - (\omega_{12}(\mathbf{v})F_2 + \omega_{13}(\mathbf{v})F_3)`,
        value: (s) => {
          const o = s.value('omega');
          if (!o || o.kind !== 'forms') throw new Error('omega undefined');
          const [w12, w13] = o.extra!.values as number[];
          const F = frame(s, 'Fp').e;
          return diff(vec(s, 'DvF1').v, F[1].map((x, k) => w12 * x + w13 * F[2][k]));
        },
        tol: 1e-6,
      },
    ],
  },
  {
    id: '2.7.3',
    statement: md`If $A = (a_{ij})$ is the attitude matrix and $\omega = (\omega_{ij})$ the matrix of connection forms of a frame field $E_1, E_2, E_3$, then
$$\omega = dA\,{}^tA \quad \text{(matrix multiplication)},$$
or equivalently,
$$\omega_{ij} = \sum_k (da_{ik})\,a_{jk} \qquad \text{for } 1 \le i, j \le 3.$$`,
    proof: md`Writing $E_i = \sum_k a_{ik}U_k$, Lemma [[2.5.2]] gives $\nabla_\mathbf{v}E_i = \sum_k \mathbf{v}[a_{ik}]\,U_k(\mathbf{p}) = \sum_k da_{ik}(\mathbf{v})\,U_k(\mathbf{p})$. Then, since $E_j(\mathbf{p}) = \sum_k a_{jk}(\mathbf{p})U_k(\mathbf{p})$,
$$\omega_{ij}(\mathbf{v}) = \nabla_\mathbf{v}E_i \bullet E_j(\mathbf{p}) = \sum_k da_{ik}(\mathbf{v})\,a_{jk}(\mathbf{p}),$$
which is the asserted formula. (The book calls this proof routine and illustrates the result instead.)`,
    notes: md`**The attitude matrix of a frame field.** Expanding $E_i = a_{i1}U_1 + a_{i2}U_2 + a_{i3}U_3$ with $a_{ij} = E_i \bullet U_j$ functions on $\mathbf{R}^3$, $A = (a_{ij})$ is the attitude matrix of the frame field: at each $\mathbf{p}$, $A(\mathbf{p})$ is the attitude matrix of the frame $E_i(\mathbf{p})$ ([[2.1.6]]), so $ {}^tA = A^{-1}$. Its differential is $dA = (da_{ij})$, a matrix of 1-forms.

**The book's example: the cylindrical frame field.**
$$A = \begin{pmatrix} \cos\vartheta & \sin\vartheta & 0 \\ -\sin\vartheta & \cos\vartheta & 0 \\ 0 & 0 & 1 \end{pmatrix}, \qquad \omega = dA\,{}^tA = \begin{pmatrix} -\sin\vartheta\,d\vartheta & \cos\vartheta\,d\vartheta & 0 \\ -\cos\vartheta\,d\vartheta & -\sin\vartheta\,d\vartheta & 0 \\ 0 & 0 & 0 \end{pmatrix}\begin{pmatrix} \cos\vartheta & -\sin\vartheta & 0 \\ \sin\vartheta & \cos\vartheta & 0 \\ 0 & 0 & 1 \end{pmatrix} = \begin{pmatrix} 0 & d\vartheta & 0 \\ -d\vartheta & 0 & 0 \\ 0 & 0 & 0 \end{pmatrix}.$$
So $\omega_{12} = d\vartheta$ is the only nonzero connection form, and the connection equations become
$$\nabla_VE_1 = d\vartheta(V)E_2 = V[\vartheta]E_2, \qquad \nabla_VE_2 = -V[\vartheta]E_1, \qquad \nabla_VE_3 = 0.$$
$E_3 = U_3$ is parallel, and $E_1$, $E_2$ change only with the angle $\vartheta$: for a field $V$ tangent to planes through the $z$ axis, $V[\vartheta] = 0$ and $\nabla_VE_1 = \nabla_VE_2 = 0$ — indeed $E_1$, $E_2$ stay parallel on such a plane (Fig. 2.19).

In $x, y, z$: $d\vartheta = \dfrac{-y\,dx + x\,dy}{x^2 + y^2}$, which is what the sandbox computes from $A$ (select $\omega$).`,
    tryThis: [md`Move $\mathbf{v}$ so that it lies in the plane through $\mathbf{p}$ and the $z$ axis: then $\omega_{12}(\mathbf{v}) = 0$.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frameField', 'E', { preset: 'cylindrical', box: 2, n: 3 });
        b.add('connectionForms', 'omega', { field: 'E', v: 'v' });
        b.add('point', 'p', { coords: '(1.2, 0.8, 0.5)' });
        b.add('tangentVector', 'v', { v: '(-0.8, 1.2, 0)', p: 'p' }, { caption: '\\mathbf{v}', color: '#57606a' });
        b.add('oneForm', 'dth', { comps: '(-y/(x^2+y^2), x/(x^2+y^2), 0)' }, { caption: 'd\\vartheta' });
      },
      select: 'omega',
    },
    checks: [
      {
        label: md`\omega_{12} - d\vartheta,\ \omega_{13},\ \omega_{23}`,
        value: (s) => {
          const o = s.value('omega');
          if (!o || o.kind !== 'forms') throw new Error('omega undefined');
          return Math.max(formDiff(s, o.forms[0].form, form(s, 'dth')), formDiff(s, o.forms[1].form, zero1), formDiff(s, o.forms[2].form, zero1));
        },
      },
    ],
  },
  // ===========================================================================================
  // §2.8 The Structural Equations
  {
    id: '2.8.1',
    statement: md`If $E_1, E_2, E_3$ is a frame field on $\mathbf{R}^3$, then the **dual 1-forms** $\theta_1, \theta_2, \theta_3$ of the frame field are the 1-forms such that
$$\theta_i(\mathbf{v}) = \mathbf{v} \bullet E_i(\mathbf{p})$$
for each tangent vector $\mathbf{v}$ to $\mathbf{R}^3$ at $\mathbf{p}$.`,
    notes: md`$\theta_i$ is linear at each point, hence a 1-form; $\theta_i(E_j) = \delta_{ij}$, so at each point $\theta_1, \theta_2, \theta_3$ is the **dual basis** of $E_1, E_2, E_3$. For the natural frame field the dual forms are $dx_1, dx_2, dx_3$: by Example [[1.5.3]], $dx_i(\mathbf{v}) = v_i = \mathbf{v} \bullet U_i(\mathbf{p})$. With dual forms, the orthonormal expansion of [[2.6.3]] reads $V = \sum \theta_i(V)E_i$.

The connection forms describe the rotation of a frame field; the frame field itself is described by 1-forms too. For the **cylindrical** frame field (Exercise 3) the dual forms are $\theta_1 = dr$, $\theta_2 = r\,d\vartheta$, $\theta_3 = dz$ — in $x, y, z$: $dr = (x\,dx + y\,dy)/r$ and $r\,d\vartheta = (-y\,dx + x\,dy)/r$. The figure evaluates them on $\mathbf{v}$: the three numbers are the coordinates $\mathbf{v} \bullet E_i(\mathbf{p})$ of $\mathbf{v}$ in the cylindrical frame (dashed components).`,
    tryThis: [md`Edit $\mathbf{v}$ or drag $\mathbf{p}$: $\theta_i(\mathbf{v})$ always equals $\mathbf{v} \bullet E_i(\mathbf{p})$.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frameField', 'E', { preset: 'cylindrical', box: 2, n: 3 }, { visible: false });
        b.add('dualForms', 'theta', { field: 'E', p: '(1, 0.5, 0.7)' });
        b.add('oneForm', 'th1', { comps: '(x, y, 0)/(sqrt(x^2 + y^2))' }, { caption: '\\theta_1 = dr' });
        b.add('oneForm', 'th2', { comps: '(-y, x, 0)/(sqrt(x^2 + y^2))' }, { caption: '\\theta_2 = r\\,d\\vartheta' });
        b.add('oneForm', 'th3', { comps: '(0, 0, 1)' }, { caption: '\\theta_3 = dz' });
        b.add('point', 'p', { coords: '(1.2, 0.8, 0.5)' });
        b.add('frameFieldAt', 'Ep', { field: 'E', p: 'p' });
        b.add('tangentVector', 'v', { v: '(0.5, 1.2, 0.8)', p: 'p' }, { caption: '\\mathbf{v}', color: '#57606a' });
        b.add('orthonormalExpansion', 'comp', { v: 'v', frame: 'Ep' }, { caption: '\\theta_i(\\mathbf{v})E_i' });
        b.add('evaluateForm', 'e1', { phi: 'th1', v: 'v' }, { caption: '\\theta_1(\\mathbf{v})' });
        b.add('evaluateForm', 'e2', { phi: 'th2', v: 'v' }, { caption: '\\theta_2(\\mathbf{v})' });
        b.add('evaluateForm', 'e3', { phi: 'th3', v: 'v' }, { caption: '\\theta_3(\\mathbf{v})' });
      },
      select: 'theta',
    },
    checks: [
      {
        label: md`\theta_i(\mathbf{v}) - \mathbf{v} \bullet E_i(\mathbf{p})`,
        value: (s) => {
          const E = frame(s, 'Ep').e;
          const v = vec(s, 'v').v;
          return diff([num(s, 'e1'), num(s, 'e2'), num(s, 'e3')], E.map((e) => dot(v, e)));
        },
      },
      {
        label: md`\text{computed } \theta_i \text{ vs. } dr,\ r\,d\vartheta,\ dz`,
        value: (s) => {
          const t = s.value('theta');
          if (!t || t.kind !== 'forms') throw new Error('theta undefined');
          return Math.max(formDiff(s, t.forms[0].form, form(s, 'th1')), formDiff(s, t.forms[1].form, form(s, 'th2')), formDiff(s, t.forms[2].form, form(s, 'th3')));
        },
      },
    ],
  },
  {
    id: '2.8.2',
    statement: md`Let $\theta_1, \theta_2, \theta_3$ be the dual 1-forms of a frame field $E_1, E_2, E_3$. Then any 1-form $\phi$ on $\mathbf{R}^3$ has a unique expression
$$\phi = \sum \phi(E_i)\,\theta_i.$$`,
    proof: md`Two 1-forms are the same if they have the same value on any vector field $V$. But
$$\left(\sum \phi(E_i)\theta_i\right)(V) = \sum \phi(E_i)\,\theta_i(V) = \phi\left(\sum \theta_i(V)E_i\right) = \phi(V). \qquad ∎$$`,
    notes: md`So $\phi$ is expressed in terms of the dual forms by evaluating it on $E_1, E_2, E_3$ — the generalization of Lemma [[1.5.4]] to arbitrary frame fields.

**Attitude matrix and dual forms.** If $E_i = \sum_j a_{ij}U_j$, then dually
$$\theta_i = \sum_j a_{ij}\,dx_j$$
with *the same coefficients*: by the lemma $\theta_i = \sum_j \theta_i(U_j)\,dx_j$, and $\theta_i(U_j) = E_i \bullet U_j = \left(\sum_k a_{ik}U_k\right) \bullet U_j = \sum_k a_{ik}\delta_{kj} = a_{ij}$. So $\theta_1, \theta_2, \theta_3$ is merely the dual description of the frame field.

The check expands $\phi = yz\,dx + dz$ in the spherical dual forms at sample points.`,
    scene: {
      views: [],
      build: (b) => {
        b.add('frameField', 'F', { preset: 'spherical', box: 2, n: 3 });
        b.add('dualForms', 'theta', { field: 'F', p: '(1, 0.5, 0.7)' });
        b.add('oneForm', 'phi', { comps: '(y*z, 0, 1)' });
      },
      select: 'theta',
    },
    checks: [
      {
        label: md`\phi - \sum \phi(E_i)\theta_i \text{ at sample points}`,
        value: (s) => {
          const F = framefield(s, 'F');
          const phi = form(s, 'phi');
          const t = s.value('theta');
          if (!t || t.kind !== 'forms') throw new Error('theta undefined');
          const N = s.allNumbers();
          let m = 0;
          for (const p of SAMPLES) {
            const f = formAt(phi, p, N);
            const E = F.E(p);
            const sum = [0, 0, 0];
            for (let i = 0; i < 3; i++) {
              const c = dot(f, E[i]);
              const th = formAt(t.forms[i].form, p, N);
              for (let k = 0; k < 3; k++) sum[k] += c * th[k];
            }
            m = Math.max(m, diff(sum, f));
          }
          return m;
        },
      },
    ],
  },
  {
    id: '2.8.3',
    bookName: 'Cartan structural equations',
    statement: md`Let $E_1, E_2, E_3$ be a frame field on $\mathbf{R}^3$ with dual forms $\theta_1, \theta_2, \theta_3$ and connection forms $\omega_{ij}$ $(1 \le i, j \le 3)$. The exterior derivatives of these forms satisfy

- (1) the **first structural equations**: $\displaystyle d\theta_i = \sum_j \omega_{ij} \wedge \theta_j \quad (1 \le i \le 3)$;
- (2) the **second structural equations**: $\displaystyle d\omega_{ij} = \sum_k \omega_{ik} \wedge \omega_{kj} \quad (1 \le i, j \le 3)$.`,
    proof: md`In the Cartan approach the fundamental objects are **matrices whose entries are forms** (multiplied with the wedge product; $d$ of a matrix is $d$ of each entry). We have $\omega = dA\,{}^tA$ ([[2.7.3]]). Writing $\theta$ for the column of the $\theta_i$ and $d\xi$ for the column of the $dx_i$, the formula $\theta_i = \sum a_{ij}\,dx_j$ reads
$$\theta = A\,d\xi.$$
Since $A$ is orthogonal, $ {}^tA\,A = I$ can be inserted anywhere.

*First structural equation.* Since $d^2 = 0$ (Exercise 3 of §1.6), $d(d\xi) = 0$, so
$$d\theta = d(A\,d\xi) = dA \cdot d\xi = dA\,{}^tA \cdot A\,d\xi = \omega\theta.$$
In terms of entries this is (1).

*Second structural equation.* For functions $f$ and $g$, $d(df\,g) = d(g\,df) = dg \wedge df = -df \wedge dg$. Thus, with the transpose rule $ {}^t(AB) = {}^tB\,{}^tA$,
$$d\omega = d(dA\,{}^tA) = -dA \cdot d({}^tA) = -dA\,{}^tA \cdot A\,{}^t(dA) = -\omega\,{}^t\omega = \omega\omega,$$
the last step by skew-symmetry of $\omega$. In terms of entries this is (2). $\quad ∎$`,
    notes: md`Having attached to each frame field its dual forms and connection forms, it is natural to ask for their exterior derivatives; the answer is these two sets of equations, due to Cartan. Since $\theta_i$ is dual to $E_i$, the first structural equations are the dual of the connection equations. Only later (Chapter 6–7) will it appear that the second structural equations say that **$\mathbf{R}^3$ is flat**, in the same sense that the plane is.

The figure computes $d\theta_i$, $d\omega_{ij}$ and the right-hand sides for the spherical frame field at the movable point $\mathbf{p}$ (Course view of $\theta$); the checks report the largest discrepancy.`,
    tryThis: [md`Switch the frame field to "Custom" in the Algebra view (e.g. the frame turning with height of [[2.6.1]]): the structural equations still hold.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frameField', 'F', { preset: 'spherical', box: 2, n: 3 }, { visible: false });
        b.add('point', 'p', { coords: '(1, 0.6, 0.8)' });
        b.add('frameFieldAt', 'Fp', { field: 'F', p: 'p' });
        b.add('connectionForms', 'omega', { field: 'F', v: '' });
        b.add('dualForms', 'theta', { field: 'F', p: 'p' });
      },
      select: 'theta',
    },
    checks: [
      { label: md`(1)\ \max_i |d\theta_i - \textstyle\sum_j \omega_{ij} \wedge \theta_j| \text{ at } \mathbf{p}`, value: (s) => structural(s).first, tol: 1e-5 },
      { label: md`(2)\ \max_{ij} |d\omega_{ij} - \textstyle\sum_k \omega_{ik} \wedge \omega_{kj}| \text{ at } \mathbf{p}`, value: (s) => structural(s).second, tol: 1e-5 },
    ],
  },
  {
    id: '2.8.4',
    statement: md`**Structural equations for the spherical frame field** (Example [[2.6.2]]). The dual forms and connection forms are
$$\theta_1 = d\rho, \quad \theta_2 = \rho\cos\varphi\,d\vartheta, \quad \theta_3 = \rho\,d\varphi; \qquad \omega_{12} = \cos\varphi\,d\vartheta, \quad \omega_{13} = d\varphi, \quad \omega_{23} = \sin\varphi\,d\vartheta.$$
Check the first structural equation $d\theta_3 = \sum \omega_{3j} \wedge \theta_j = \omega_{31} \wedge \theta_1 + \omega_{32} \wedge \theta_2$. By skew-symmetry and the properties of forms,
$$\omega_{31} \wedge \theta_1 = -d\varphi \wedge d\rho = d\rho \wedge d\varphi, \qquad \omega_{32} \wedge \theta_2 = (-\sin\varphi\,d\vartheta) \wedge (\rho\cos\varphi\,d\vartheta) = 0$$
(since $d\vartheta \wedge d\vartheta = 0$). The sum is, correctly, $d\theta_3 = d(\rho\,d\varphi) = d\rho \wedge d\varphi$.

Second structural equations involve only one wedge product; e.g., since $\omega_{11} = \omega_{22} = 0$, $d\omega_{12} = \sum \omega_{1k} \wedge \omega_{k2} = \omega_{13} \wedge \omega_{32}$. Here $\omega_{13} \wedge \omega_{32} = d\varphi \wedge (-\sin\varphi\,d\vartheta) = -\sin\varphi\,d\varphi \wedge d\vartheta$, the same as $d\omega_{12} = d(\cos\varphi\,d\vartheta) = -\sin\varphi\,d\varphi \wedge d\vartheta$.`,
    notes: md`**Deriving the dual forms.** Differentiate $x_1 = \rho\cos\varphi\cos\vartheta$, $x_2 = \rho\cos\varphi\sin\vartheta$, $x_3 = \rho\sin\varphi$ to get $dx_1, dx_2, dx_3$, and substitute in $\theta_i = \sum a_{ij}\,dx_j$ with the attitude matrix of Example [[2.6.2]]. (The printed book has $x_3 = \rho\sin\vartheta$, a misprint for $\rho\sin\varphi$.) Elementary calculus finds the same result by a plausibility argument: increments $d\rho, d\vartheta, d\varphi$ of the coordinates give an infinitesimal box with sides $d\rho$, $\rho\cos\varphi\,d\vartheta$, $\rho\,d\varphi$ (Fig. 2.22).

**The method.** Choose a frame field adapted to the problem; find its dual and connection forms; apply the structural equations; interpret the results. It will be used for surfaces.

The checks compare the forms computed by the sandbox from the attitude matrix (in $x, y, z$) with the book's formulas, rewritten in $x, y, z$ ($r = \sqrt{x^2 + y^2}$, $\rho = \sqrt{x^2 + y^2 + z^2}$).`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frameField', 'F', { preset: 'spherical', box: 2, n: 3 });
        b.add('connectionForms', 'omega', { field: 'F', v: '' });
        b.add('dualForms', 'theta', { field: 'F', p: '(1, 0.6, 0.8)' });
        b.add('oneForm', 'drho', { comps: '(x, y, z)/(sqrt(x^2+y^2+z^2))' }, { caption: 'd\\rho' });
        b.add('oneForm', 'rcdth', { comps: '(-y, x, 0)/(sqrt(x^2+y^2))' }, { caption: '\\rho\\cos\\varphi\\,d\\vartheta' });
        b.add('oneForm', 'rdphi', { comps: '(-x*z, -y*z, x^2+y^2)/(sqrt(x^2+y^2)*sqrt(x^2+y^2+z^2))' }, { caption: '\\rho\\,d\\varphi' });
        b.add('oneForm', 'w12', { comps: '(-y, x, 0)/(sqrt(x^2+y^2)*sqrt(x^2+y^2+z^2))' }, { caption: '\\cos\\varphi\\,d\\vartheta' });
        b.add('oneForm', 'w13', { comps: '(-x*z, -y*z, x^2+y^2)/(sqrt(x^2+y^2)*(x^2+y^2+z^2))' }, { caption: 'd\\varphi' });
        b.add('oneForm', 'w23', { comps: '(-y*z, x*z, 0)/((x^2+y^2)*sqrt(x^2+y^2+z^2))' }, { caption: '\\sin\\varphi\\,d\\vartheta' });
      },
      select: 'omega',
    },
    checks: [
      {
        label: md`\theta_1 - d\rho,\ \theta_2 - \rho\cos\varphi\,d\vartheta,\ \theta_3 - \rho\,d\varphi`,
        value: (s) => {
          const t = s.value('theta');
          if (!t || t.kind !== 'forms') throw new Error('theta undefined');
          return Math.max(formDiff(s, t.forms[0].form, form(s, 'drho')), formDiff(s, t.forms[1].form, form(s, 'rcdth')), formDiff(s, t.forms[2].form, form(s, 'rdphi')));
        },
      },
      {
        label: md`\omega_{12} - \cos\varphi\,d\vartheta,\ \omega_{13} - d\varphi,\ \omega_{23} - \sin\varphi\,d\vartheta`,
        value: (s) => {
          const o = s.value('omega');
          if (!o || o.kind !== 'forms') throw new Error('omega undefined');
          return Math.max(formDiff(s, o.forms[0].form, form(s, 'w12')), formDiff(s, o.forms[1].form, form(s, 'w13')), formDiff(s, o.forms[2].form, form(s, 'w23')));
        },
      },
      { label: md`\text{structural equations at } (1, 0.6, 0.8)`, value: (s) => Math.max(structural(s).first, structural(s).second), tol: 1e-5 },
    ],
  },
];

/** max |e_i • e_j − δ_ij|. */
function orthoErr(e: number[][]): number {
  let m = 0;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) m = Math.max(m, Math.abs(dot(e[i], e[j]) - (i === j ? 1 : 0)));
  return m;
}

/** Residuals of the structural equations reported by the dual-forms object `theta`. */
function structural(s: Scene): { first: number; second: number } {
  const t = s.value('theta');
  if (!t || t.kind !== 'forms') throw new Error('theta undefined');
  const c = t.extra!.check as { first: number[]; second: number[] };
  return { first: Math.max(...c.first), second: Math.max(...c.second) };
}
