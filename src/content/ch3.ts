// Chapter 3 — Euclidean Geometry. (3.1.7 and 3.2.3 are in entries.ts.)
// Wording is ours; structure, notation and numbering follow O'Neill.

import type { Scene } from '../core/scene';
import type { Entry } from './types';
import { cross, det3, dot, matvec, norm, sub } from '../math/vec';
import { curve, diff, frame, frenetAt, iso, md, num, point, vec } from './helpers';

/** Distance between two scene points. */
const dist = (s: Scene, a: string, b: string): number => norm(sub(point(s, a), point(s, b)));

/** A small asymmetric "triangle" p, q, r and its sides, plus its image under F (names p', q', r'). */
function triangle(b: Parameters<NonNullable<Entry['scene']>['build']>[0], F: string) {
  b.add('point', 'p', { coords: '(1, 0, 0)' });
  b.add('point', 'q', { coords: '(2, 1, 0.5)' }, { color: '#8250df' });
  b.add('point', 'r', { coords: '(1, 1.5, 1)' }, { color: '#bf8700' });
  b.add('distance', 'dpq', { p: 'p', q: 'q' }, { label: false });
  b.add('distance', 'dqr', { p: 'q', q: 'r' }, { label: false });
  b.add('distance', 'drp', { p: 'r', q: 'p' }, { label: false });
  b.add('isoImage', 'Fp', { F, X: 'p' }, { caption: F + '(\\mathbf{p})', color: '#cf222e' });
  b.add('isoImage', 'Fq', { F, X: 'q' }, { caption: F + '(\\mathbf{q})', color: '#cf222e' });
  b.add('isoImage', 'Fr', { F, X: 'r' }, { caption: F + '(\\mathbf{r})', color: '#cf222e' });
  b.add('distance', 'dFpq', { p: 'Fp', q: 'Fq' }, { label: false, color: '#cf222e' });
  b.add('distance', 'dFqr', { p: 'Fq', q: 'Fr' }, { label: false, color: '#cf222e' });
  b.add('distance', 'dFrp', { p: 'Fr', q: 'Fp' }, { label: false, color: '#cf222e' });
}

const sidesCheck = (label = md`\max |d(F(\mathbf{p}), F(\mathbf{q})) - d(\mathbf{p}, \mathbf{q})| \text{ (three sides)}`) => ({
  label,
  value: (s: Scene) => Math.max(Math.abs(dist(s, 'Fp', 'Fq') - dist(s, 'p', 'q')), Math.abs(dist(s, 'Fq', 'Fr') - dist(s, 'q', 'r')), Math.abs(dist(s, 'Fr', 'Fp') - dist(s, 'r', 'p'))),
});

const ROT2 = '(x*cos(th) - y*sin(th), x*sin(th) + y*cos(th))';

export const CH3: Partial<Entry>[] = [
  // ===========================================================================================
  // §3.1 Isometries of R³
  {
    id: '3.1.1',
    statement: md`An **isometry** of $\mathbf{R}^3$ is a mapping $F\colon \mathbf{R}^3 \to \mathbf{R}^3$ such that
$$d(F(\mathbf{p}), F(\mathbf{q})) = d(\mathbf{p}, \mathbf{q})$$
for all points $\mathbf{p}$, $\mathbf{q}$ in $\mathbf{R}^3$.`,
    notes: md`An isometry, or **rigid motion**, preserves the Euclidean distance of [[2.1.2]].

**Why (introduction to Chapter 3).** In plane geometry two triangles are *congruent* if a rigid motion carries one exactly onto the other; then corresponding angles, sides, areas… are equal — every geometric property is shared. Conversely, congruence can be decided simply, e.g. when the same three side lengths occur. Chapter 3 studies the rigid motions of $\mathbf{R}^3$ and extends these remarks from triangles to other objects, above all curves (§3.5).

The figure moves a triangle $\mathbf{p}, \mathbf{q}, \mathbf{r}$ by an isometry $F$ (a rotation followed by a translation): the image triangle has the same side lengths. The 2D view does the same in the plane with a rotation by $\vartheta$ (Fig. 3.1).`,
    tryThis: [md`Drag $\mathbf{p}$, $\mathbf{q}$ or $\mathbf{r}$, or move $\vartheta$: the side lengths of the two triangles stay equal.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('th', 1, -3.14, 3.14, 0.01, { caption: '\\vartheta' });
        b.add('rotation', 'C', { axis: '(1, 1, 2)', angle: 'th' }, { visible: false });
        b.add('translation', 'T', { a: '(-2, 0.5, 0.5)' }, { visible: false });
        b.add('composition', 'F', { F: 'C', G: 'T' }, { caption: 'F' });
        triangle(b, 'F');
        b.add('mapping', 'R', { comps: ROT2, box: 1.5, lines: 7, showDomain: true, center: '(0, 0)', dim: 2 }, { caption: 'F', color: '#cf222e' });
        b.add('point', 'p2', { coords: '(1.2, 0.4)' }, { caption: '\\mathbf{p}' });
        b.add('point', 'q2', { coords: '(0.3, 1)' }, { color: '#8250df', caption: '\\mathbf{q}' });
        b.add('imagePoint', 'Rp', { F: 'R', p: 'p2' }, { caption: 'F(\\mathbf{p})', color: '#cf222e' });
        b.add('imagePoint', 'Rq', { F: 'R', p: 'q2' }, { caption: 'F(\\mathbf{q})', color: '#cf222e' });
        b.add('distance', 'd2', { p: 'p2', q: 'q2' });
        b.add('distance', 'dR2', { p: 'Rp', q: 'Rq' }, { color: '#cf222e' });
      },
      select: 'F',
    },
    checks: [sidesCheck(), { label: md`d(F(\mathbf{p}), F(\mathbf{q})) - d(\mathbf{p}, \mathbf{q}) \text{ in } \mathbf{R}^2`, value: (s) => dist(s, 'Rp', 'Rq') - dist(s, 'p2', 'q2') }],
  },
  {
    id: '3.1.2',
    statement: md`**(1) Translations.** Fix a point $\mathbf{a}$ in $\mathbf{R}^3$ and let $T$ add $\mathbf{a}$ to every point: $T(\mathbf{p}) = \mathbf{p} + \mathbf{a}$. $T$ is called **translation by $\mathbf{a}$**. It is an isometry, since
$$d(T(\mathbf{p}), T(\mathbf{q})) = d(\mathbf{p} + \mathbf{a}, \mathbf{q} + \mathbf{a}) = \lVert (\mathbf{p} + \mathbf{a}) - (\mathbf{q} + \mathbf{a}) \rVert = \lVert \mathbf{p} - \mathbf{q} \rVert = d(\mathbf{p}, \mathbf{q}).$$

**(2) Rotation around a coordinate axis.** A rotation of the $xy$ plane through an angle $\vartheta$ carries $(p_1, p_2)$ to $(q_1, q_2)$ with (Fig. 3.1)
$$q_1 = p_1\cos\vartheta - p_2\sin\vartheta, \qquad q_2 = p_1\sin\vartheta + p_2\cos\vartheta.$$
So a **rotation** $C$ of $\mathbf{R}^3$ around the $z$ axis through the angle $\vartheta$ is
$$C(\mathbf{p}) = C(p_1, p_2, p_3) = (p_1\cos\vartheta - p_2\sin\vartheta,\ p_1\sin\vartheta + p_2\cos\vartheta,\ p_3).$$
$C$ is a linear transformation, and a straightforward computation shows that it preserves Euclidean distance: it is an isometry.`,
    notes: md`The 3D view shows a translation $T$ (gray arrow $\mathbf{a}$) and the rotation $C$ about the $z$ axis acting on a point and on a short helix; the 2D view is Fig. 3.1: the rotation of the plane through $\vartheta$, with the image of a grid.`,
    tryThis: [md`Move $\vartheta$: the 2D point $(p_1, p_2)$ turns about the origin; in 3D, $C(\mathbf{p})$ keeps its height $p_3$.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('th', 0.8, -3.14, 3.14, 0.01, { caption: '\\vartheta' });
        b.add('translation', 'T', { a: '(0.5, -1.5, 1)' });
        b.add('rotation', 'C', { axis: '(0, 0, 1)', angle: 'th' });
        b.add('point', 'o', { coords: '(0, 0, 0)' }, { label: false, color: '#24292f' });
        b.add('tangentVector', 'av', { v: '(0.5, -1.5, 1)', p: 'o' }, { color: '#8c959f', caption: '\\mathbf{a}' });
        b.add('point', 'p', { coords: '(1.5, 0.5, 1)' });
        b.add('isoImage', 'Tp', { F: 'T', X: 'p' }, { caption: 'T(\\mathbf{p})', color: '#953800' });
        b.add('isoImage', 'Cp', { F: 'C', X: 'p' }, { caption: 'C(\\mathbf{p})', color: '#cf222e' });
        b.add('curve', 'h', { comps: '(1.5 + 0.3*cos(4*t), 0.3*sin(4*t), 0.2*t)', param: 't', a: '0', b: '6', dim: 3 }, { caption: '\\gamma' });
        b.add('isoImage', 'Ch', { F: 'C', X: 'h' }, { caption: 'C(\\gamma)', color: '#cf222e' });
        b.add('isoImage', 'Th', { F: 'T', X: 'h' }, { caption: 'T(\\gamma)', color: '#953800' });
        b.add('mapping', 'R', { comps: ROT2, box: 1.5, lines: 7, showDomain: true, center: '(0, 0)', dim: 2 }, { caption: 'C', color: '#cf222e' });
        b.add('point', 'p2', { coords: '(1.3, 0.5)' }, { caption: '(p_1, p_2)' });
        b.add('imagePoint', 'q2', { F: 'R', p: 'p2' }, { caption: '(q_1, q_2)', color: '#cf222e' });
      },
      select: 'C',
    },
    checks: [
      {
        label: md`C(\mathbf{p}) - (p_1\cos\vartheta - p_2\sin\vartheta,\ p_1\sin\vartheta + p_2\cos\vartheta,\ p_3)`,
        value: (s) => {
          const [p1, p2, p3] = point(s, 'p');
          const t = num(s, 'th');
          return diff(point(s, 'Cp'), [p1 * Math.cos(t) - p2 * Math.sin(t), p1 * Math.sin(t) + p2 * Math.cos(t), p3]);
        },
      },
      { label: md`T(\mathbf{p}) - (\mathbf{p} + \mathbf{a})`, value: (s) => diff(point(s, 'Tp'), point(s, 'p').map((x, i) => x + [0.5, -1.5, 1][i])) },
    ],
  },
  {
    id: '3.1.3',
    statement: md`If $F$ and $G$ are isometries of $\mathbf{R}^3$, then the composite mapping $GF$ is also an isometry of $\mathbf{R}^3$.`,
    proof: md`Since $G$ is an isometry, the distance from $G(F(\mathbf{p}))$ to $G(F(\mathbf{q}))$ is $d(F(\mathbf{p}), F(\mathbf{q}))$. Since $F$ is an isometry, this equals $d(\mathbf{p}, \mathbf{q})$. Thus $GF$ preserves distance; hence it is an isometry. $\quad ∎$`,
    notes: md`$GF$ means: apply first $F$, then $G$. In short, a composition of isometries is an isometry. If $F$ is one-to-one and onto, it has an inverse $F^{-1}$ with $FF^{-1} = I$ and $F^{-1}F = I$, where $I$ is the **identity mapping** $I(\mathbf{p}) = \mathbf{p}$. (With composition, the isometries form a group, the **Euclidean group** $E(3)$ — Exercise 7.)

The figure: $F$ = rotation about the $x$ axis, $G$ = reflection in a plane; the triangle, its image under $GF$ (red), and the intermediate image under $F$ (faint).`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('th', 1.2, -3.14, 3.14, 0.01, { caption: '\\vartheta' });
        b.add('rotation', 'F', { axis: '(1, 0, 0)', angle: 'th' }, { visible: false });
        b.add('reflection', 'G', { n: '(1, -1, 0.5)' }, { visible: false });
        b.add('composition', 'GF', { F: 'F', G: 'G' });
        triangle(b, 'GF');
        b.add('isoImage', 'Fq0', { F: 'F', X: 'q' }, { caption: 'F(\\mathbf{q})', color: '#d0d7de' });
      },
      select: 'GF',
    },
    checks: [sidesCheck(md`\text{sides of } GF(\triangle) - \text{sides of } \triangle`)],
  },
  {
    id: '3.1.4',
    statement: md`(1) If $S$ and $T$ are translations, then $ST = TS$ is also a translation.

(2) If $T$ is translation by $\mathbf{a}$, then $T$ has an inverse $T^{-1}$, which is translation by $-\mathbf{a}$.

(3) Given any two points $\mathbf{p}$ and $\mathbf{q}$ of $\mathbf{R}^3$, there exists a unique translation $T$ such that $T(\mathbf{p}) = \mathbf{q}$.`,
    proof: md`We prove (3). Translation by $\mathbf{q} - \mathbf{p}$ certainly carries $\mathbf{p}$ to $\mathbf{q}$. It is the only possibility: if $T$ is translation by $\mathbf{a}$ and $T(\mathbf{p}) = \mathbf{q}$, then $\mathbf{p} + \mathbf{a} = \mathbf{q}$, hence $\mathbf{a} = \mathbf{q} - \mathbf{p}$. $\quad ∎$`,
    notes: md`(1) and (2) are immediate: translating by $\mathbf{a}$ then by $\mathbf{b}$ is translating by $\mathbf{a} + \mathbf{b}$, in either order. A useful special case of (3): *if a translation fixes one point, it is the identity.*

Translations are the simplest isometries. In the figure: $S$, $T$, and $ST$, $TS$ applied to $\mathbf{p}$ (same point); and the translation by $\mathbf{q} - \mathbf{p}$, which carries $\mathbf{p}$ to the movable point $\mathbf{q}$.`,
    tryThis: [md`Drag $\mathbf{q}$: the translation by $\mathbf{q} - \mathbf{p}$ always carries $\mathbf{p}$ onto it.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('translation', 'S', { a: '(1, 0, 0.5)' }, { visible: false });
        b.add('translation', 'T', { a: '(0, 1.5, 0)' }, { visible: false });
        b.add('composition', 'ST', { F: 'T', G: 'S' }, { visible: false, caption: 'ST' });
        b.add('composition', 'TS', { F: 'S', G: 'T' }, { visible: false, caption: 'TS' });
        b.add('point', 'p', { coords: '(-1, -1, 0)' });
        b.add('isoImage', 'STp', { F: 'ST', X: 'p' }, { caption: 'ST(\\mathbf{p})', color: '#cf222e' });
        b.add('isoImage', 'TSp', { F: 'TS', X: 'p' }, { caption: 'TS(\\mathbf{p})', color: '#0969da', label: false });
        b.add('point', 'q', { coords: '(1.5, 0.5, 1.5)' }, { color: '#8250df' });
        b.add('translation', 'Tpq', { a: '(x(q) - x(p), y(q) - y(p), z(q) - z(p))' }, { caption: 'T_{\\mathbf{q}-\\mathbf{p}}' });
        b.add('isoImage', 'Tp', { F: 'Tpq', X: 'p' }, { caption: 'T_{\\mathbf{q}-\\mathbf{p}}(\\mathbf{p})', color: '#bf8700' });
        b.add('point', 'p2', { coords: '(-1, -0.5)' }, { caption: '\\mathbf{p}' });
        b.add('point', 'q2', { coords: '(1, 1)' }, { color: '#8250df', caption: '\\mathbf{q}' });
        b.add('mapping', 'T2', { comps: '(x + x(q2) - x(p2), y + y(q2) - y(p2))', box: 0.6, lines: 5, showDomain: true, center: 'p2', dim: 2 }, { caption: 'T', color: '#bf8700' });
      },
      select: 'Tpq',
    },
    checks: [
      { label: md`ST(\mathbf{p}) - TS(\mathbf{p})`, value: (s) => diff(point(s, 'STp'), point(s, 'TSp')) },
      { label: md`T_{\mathbf{q}-\mathbf{p}}(\mathbf{p}) - \mathbf{q}`, value: (s) => diff(point(s, 'Tp'), point(s, 'q')) },
    ],
  },
  {
    id: '3.1.5',
    statement: md`If $C\colon \mathbf{R}^3 \to \mathbf{R}^3$ is an orthogonal transformation, then $C$ is an isometry of $\mathbf{R}^3$.`,
    proof: md`First, $C$ preserves norms. By definition $\lVert \mathbf{p} \rVert^2 = \mathbf{p} \bullet \mathbf{p}$, hence
$$\lVert C(\mathbf{p}) \rVert^2 = C(\mathbf{p}) \bullet C(\mathbf{p}) = \mathbf{p} \bullet \mathbf{p} = \lVert \mathbf{p} \rVert^2.$$
Thus $\lVert C(\mathbf{p}) \rVert = \lVert \mathbf{p} \rVert$ for all $\mathbf{p}$. Since $C$ is linear, it follows easily that $C$ is an isometry:
$$d(C(\mathbf{p}), C(\mathbf{q})) = \lVert C(\mathbf{p}) - C(\mathbf{q}) \rVert = \lVert C(\mathbf{p} - \mathbf{q}) \rVert = \lVert \mathbf{p} - \mathbf{q} \rVert = d(\mathbf{p}, \mathbf{q}). \qquad ∎$$`,
    notes: md`An **orthogonal transformation** of $\mathbf{R}^3$ is a linear transformation $C$ that preserves dot products: $C(\mathbf{p}) \bullet C(\mathbf{q}) = \mathbf{p} \bullet \mathbf{q}$ for all $\mathbf{p}, \mathbf{q}$. The rotation of [[3.1.2]] is one. By linear algebra, a linear transformation is orthogonal iff its matrix is orthogonal (transpose = inverse).

The figure uses the matrix of Exercise 4,
$$C = \begin{pmatrix} 1/\sqrt2 & 0 & 1/\sqrt2 \\ 0 & 1 & 0 \\ -1/\sqrt2 & 0 & 1/\sqrt2 \end{pmatrix}$$
(edit it in the Algebra view: a non-orthogonal matrix is refused).`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('orthogonal', 'C', { C: '1/sqrt(2), 0, 1/sqrt(2); 0, 1, 0; -1/sqrt(2), 0, 1/sqrt(2)' });
        triangle(b, 'C');
      },
      select: 'C',
    },
    checks: [
      sidesCheck(),
      { label: md`C(\mathbf{p}) \bullet C(\mathbf{q}) - \mathbf{p} \bullet \mathbf{q}`, value: (s) => dot(point(s, 'Fp'), point(s, 'Fq')) - dot(point(s, 'p'), point(s, 'q')) },
    ],
  },
  {
    id: '3.1.6',
    statement: md`If $F$ is an isometry of $\mathbf{R}^3$ such that $F(\mathbf{0}) = \mathbf{0}$, then $F$ is an orthogonal transformation.`,
    proof: md`First we show that $F$ preserves dot products, then that $F$ is linear. By definition of Euclidean distance, $\lVert \mathbf{p} \rVert = d(\mathbf{0}, \mathbf{p})$. Since $F$ preserves distance and $F(\mathbf{0}) = \mathbf{0}$,
$$\lVert F(\mathbf{p}) \rVert = d(\mathbf{0}, F(\mathbf{p})) = d(F(\mathbf{0}), F(\mathbf{p})) = d(\mathbf{0}, \mathbf{p}) = \lVert \mathbf{p} \rVert.$$
So $F$ preserves norms. By a standard trick (**polarization**) it also preserves dot products: from $d(F(\mathbf{p}), F(\mathbf{q})) = d(\mathbf{p}, \mathbf{q})$ we get $\lVert F(\mathbf{p}) - F(\mathbf{q}) \rVert = \lVert \mathbf{p} - \mathbf{q} \rVert$, i.e.
$$(F(\mathbf{p}) - F(\mathbf{q})) \bullet (F(\mathbf{p}) - F(\mathbf{q})) = (\mathbf{p} - \mathbf{q}) \bullet (\mathbf{p} - \mathbf{q}),$$
$$\lVert F(\mathbf{p}) \rVert^2 - 2F(\mathbf{p}) \bullet F(\mathbf{q}) + \lVert F(\mathbf{q}) \rVert^2 = \lVert \mathbf{p} \rVert^2 - 2\mathbf{p} \bullet \mathbf{q} + \lVert \mathbf{q} \rVert^2.$$
The norm terms cancel, leaving $F(\mathbf{p}) \bullet F(\mathbf{q}) = \mathbf{p} \bullet \mathbf{q}$.

It remains to prove that $F$ is linear. With the unit points $\mathbf{u}_1 = (1, 0, 0)$, $\mathbf{u}_2 = (0, 1, 0)$, $\mathbf{u}_3 = (0, 0, 1)$ we have $\mathbf{p} = (p_1, p_2, p_3) = \sum p_i\mathbf{u}_i$ and $\mathbf{u}_i \bullet \mathbf{u}_j = \delta_{ij}$. Since $F$ preserves dot products, $F(\mathbf{u}_1), F(\mathbf{u}_2), F(\mathbf{u}_3)$ are orthonormal too, and orthonormal expansion gives
$$F(\mathbf{p}) = \sum F(\mathbf{p}) \bullet F(\mathbf{u}_i)\,F(\mathbf{u}_i).$$
But $F(\mathbf{p}) \bullet F(\mathbf{u}_i) = \mathbf{p} \bullet \mathbf{u}_i = p_i$, so $F(\mathbf{p}) = \sum p_i\,F(\mathbf{u}_i)$. With this identity the linearity condition $F(a\mathbf{p} + b\mathbf{q}) = aF(\mathbf{p}) + bF(\mathbf{q})$ is a simple check. $\quad ∎$`,
    notes: md`This converse of [[3.1.5]] is the main step toward Theorem [[3.1.7]] ($F = TC$). In the figure, $F$ fixes the origin; the images $F(\mathbf{u}_i)$ of the unit points are orthonormal (drawn as a frame at $\mathbf{0}$), and $F(\mathbf{p}) = \sum p_iF(\mathbf{u}_i)$ — the dashed components.`,
    tryThis: [md`Drag $\mathbf{p}$: $F(\mathbf{p})$ is always the combination of $F(\mathbf{u}_1), F(\mathbf{u}_2), F(\mathbf{u}_3)$ with the coordinates of $\mathbf{p}$.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('rotation', 'C', { axis: '(1, 2, 1)', angle: '2' }, { visible: false });
        b.add('reflection', 'R', { n: '(0, 1, 0)' }, { visible: false });
        b.add('composition', 'F', { F: 'C', G: 'R' }, { caption: 'F' });
        b.add('frame', 'u', { p: '(0, 0, 0)', e1: '(1, 0, 0)', e2: '(0, 1, 0)', e3: '(0, 0, 1)', lab: 'e' }, { label: false, caption: '\\mathbf{u}_i' });
        b.add('isoImage', 'Fu', { F: 'F', X: 'u' }, { caption: 'F(\\mathbf{u}_i)' });
        b.add('point', 'p', { coords: '(1.5, 1, 0.8)' });
        b.add('isoImage', 'Fp', { F: 'F', X: 'p' }, { caption: 'F(\\mathbf{p})', color: '#cf222e' });
        b.add('tangentVector', 'Fpv', { v: '(x(Fp), y(Fp), z(Fp))', p: '(0, 0, 0)' }, { visible: false, caption: 'F(\\mathbf{p})' });
        b.add('orthonormalExpansion', 'comp', { v: 'Fpv', frame: 'Fu' }, { caption: 'p_iF(\\mathbf{u}_i)' });
      },
      select: 'F',
    },
    checks: [
      {
        label: md`F(\mathbf{p}) - \sum p_iF(\mathbf{u}_i)`,
        value: (s) => {
          const p = point(s, 'p');
          const e = frame(s, 'Fu').e;
          return diff(point(s, 'Fp'), [0, 1, 2].map((k) => p[0] * e[0][k] + p[1] * e[1][k] + p[2] * e[2][k]));
        },
      },
      { label: md`\max |F(\mathbf{u}_i) \bullet F(\mathbf{u}_j) - \delta_{ij}|`, value: (s) => { const e = frame(s, 'Fu').e; let m = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) m = Math.max(m, Math.abs(dot(e[i], e[j]) - (i === j ? 1 : 0))); return m; } },
    ],
  },
  {
    id: 'n.inverseIso',
    statement: md`Every isometry of $\mathbf{R}^3$ can be uniquely described as an orthogonal transformation followed by a translation ([[3.1.7]]). When $F = TC$, $C$ is called the **orthogonal part** of $F$ and $T$ the **translation part** of $F$. Note that $CT$ is generally not the same as $TC$ (Exercise 1).

If $C$ has matrix $(c_{ij})$ with respect to the natural basis, i.e. $C(p_1, p_2, p_3) = \left(\sum c_{1j}p_j, \sum c_{2j}p_j, \sum c_{3j}p_j\right)$, and $T$ is translation by $\mathbf{a} = (a_1, a_2, a_3)$, then
$$F(\mathbf{p}) = TC(\mathbf{p}) = \mathbf{a} + C(\mathbf{p}) = \left(a_1 + \sum c_{1j}p_j,\ a_2 + \sum c_{2j}p_j,\ a_3 + \sum c_{3j}p_j\right),$$
or in column vectors $\mathbf{q} = F(\mathbf{p})$ means $\begin{pmatrix} q_1 \\ q_2 \\ q_3 \end{pmatrix} = \begin{pmatrix} a_1 \\ a_2 \\ a_3 \end{pmatrix} + \begin{pmatrix} c_{11} & c_{12} & c_{13} \\ c_{21} & c_{22} & c_{23} \\ c_{31} & c_{32} & c_{33} \end{pmatrix}\begin{pmatrix} p_1 \\ p_2 \\ p_3 \end{pmatrix}$.`,
    notes: md`This decomposition theorem is the decisive fact about isometries of $\mathbf{R}^3$ (its proof works in $\mathbf{R}^n$). By linear algebra, a linear transformation is orthogonal iff its matrix is orthogonal ($ {}^t C = C^{-1}$).

**Inverse** (Exercise 3). $F = T_\mathbf{a}C$ has the inverse $F^{-1} = C^{-1}T_\mathbf{a}^{-1}$, again an isometry: $F^{-1}(\mathbf{q}) = {}^t C(\mathbf{q} - \mathbf{a})$; its orthogonal part is $ {}^t C$ and its translation part is translation by $-{}^t C\mathbf{a}$. **Exercise 1:** $CT_\mathbf{a} = T_{C(\mathbf{a})}C$.

The figure: $F = T_\mathbf{a}C$ (red image of $\gamma$), $CT_\mathbf{a}$ (blue — different!), and $F^{-1}(F(\gamma)) = \gamma$.`,
    tryThis: [md`Select $F$ in the Algebra view to read its orthogonal part, translation part and sign.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('th', 1.2, -3.14, 3.14, 0.01, { caption: '\\vartheta' });
        b.add('rotation', 'C', { axis: '(0, 0, 1)', angle: 'th' }, { visible: false });
        b.add('translation', 'Ta', { a: '(2, 0, 0.5)' }, { visible: false, caption: 'T_\\mathbf{a}' });
        b.add('composition', 'F', { F: 'C', G: 'Ta' }, { caption: 'F = T_\\mathbf{a}C' });
        b.add('composition', 'CT', { F: 'Ta', G: 'C' }, { caption: 'CT_\\mathbf{a}' });
        b.add('inverse', 'Finv', { F: 'F' });
        b.add('curve', 'gamma', { comps: '(1 + 0.3*cos(4*t), 0.3*sin(4*t), 0.15*t)', param: 't', a: '0', b: '6', dim: 3 });
        b.add('isoImage', 'Fg', { F: 'F', X: 'gamma' }, { caption: 'T_\\mathbf{a}C(\\gamma)', color: '#cf222e' });
        b.add('isoImage', 'CTg', { F: 'CT', X: 'gamma' }, { caption: 'CT_\\mathbf{a}(\\gamma)', color: '#0969da' });
        b.add('isoImage', 'back', { F: 'Finv', X: 'Fg' }, { caption: 'F^{-1}F(\\gamma)', color: '#1a7f37', visible: false });
      },
      select: 'F',
    },
    checks: [
      { label: md`F^{-1}(F(\gamma(t))) - \gamma(t) \text{ at } t = 2`, value: (s) => diff(curve(s, 'back').f(2), curve(s, 'gamma').f(2)) },
      {
        label: md`CT_\mathbf{a} - T_{C(\mathbf{a})}C \text{ (Exercise 1)}`,
        value: (s) => {
          const CT = iso(s, 'CT');
          const C = iso(s, 'C');
          return diff(CT.a, matvec(C.C, [2, 0, 0.5]));
        },
      },
    ],
  },
  // ===========================================================================================
  // §3.2 The Tangent Map of an Isometry (3.2.3 is in entries.ts)
  {
    id: '3.2.1',
    statement: md`Let $F$ be an isometry of $\mathbf{R}^3$ with orthogonal part $C$. Then
$$F_*(\mathbf{v}_\mathbf{p}) = C(\mathbf{v})_{F(\mathbf{p})}$$
for all tangent vectors $\mathbf{v}_\mathbf{p}$ to $\mathbf{R}^3$.`,
    proof: md`Write $F = TC$ as in Theorem [[3.1.7]], with $T$ the translation by $\mathbf{a}$, so $F(\mathbf{p}) = \mathbf{a} + C(\mathbf{p})$. By Definition [[1.7.4]], $F_*(\mathbf{v}_\mathbf{p})$ is the initial velocity of the curve $t \mapsto F(\mathbf{p} + t\mathbf{v})$. By linearity of $C$,
$$F(\mathbf{p} + t\mathbf{v}) = TC(\mathbf{p} + t\mathbf{v}) = T(C(\mathbf{p}) + tC(\mathbf{v})) = \mathbf{a} + C(\mathbf{p}) + tC(\mathbf{v}) = F(\mathbf{p}) + tC(\mathbf{v}).$$
So $F_*(\mathbf{v}_\mathbf{p})$ is the initial velocity of $t \mapsto F(\mathbf{p}) + tC(\mathbf{v})$, which is exactly the tangent vector $C(\mathbf{v})_{F(\mathbf{p})}$. $\quad ∎$`,
    notes: md`(The distinction between tangent vectors and points is crucial here, so the point of application is written again.) In words (Fig. 3.2): to get $F_*(\mathbf{v}_\mathbf{p})$, shift $\mathbf{v}_\mathbf{p}$ to the canonically corresponding point $\mathbf{v}$, apply the orthogonal part $C$, and shift $C(\mathbf{v})$ to the corresponding tangent vector at $F(\mathbf{p})$. **All tangent vectors at all points are "rotated" in exactly the same way by $F_*$ — only the new point of application $F(\mathbf{p})$ depends on $\mathbf{p}$.** In Euclidean coordinates,
$$F_*\left(\sum v_jU_j\right) = \sum_{i,j} c_{ij}v_j\,\bar U_i,$$
with $C = (c_{ij})$, $U_i$ evaluated at $\mathbf{p}$ and $\bar U_i$ at $F(\mathbf{p})$.

The figure computes $F_*(\mathbf{v}_\mathbf{p})$ twice: by the general tangent map of the mapping $F = (x\cos\vartheta - y\sin\vartheta + 1,\ x\sin\vartheta + y\cos\vartheta + 1,\ z)$ ([[1.7.4]]) and by the formula $C(\mathbf{v})_{F(\mathbf{p})}$; the dashed arrows at $\mathbf{0}$ are $\mathbf{v}$ and $C(\mathbf{v})$ (Fig. 3.2). A second vector $\mathbf{w}_\mathbf{q}$ with the same vector part is rotated the same way.`,
    tryThis: [md`Drag $\mathbf{p}$: $F_*(\mathbf{v}_\mathbf{p})$ moves with $F(\mathbf{p})$ but its vector part $C(\mathbf{v})$ does not change.`],
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('th', 1, -3.14, 3.14, 0.01, { caption: '\\vartheta' });
        b.add('rotation', 'C', { axis: '(0, 0, 1)', angle: 'th' }, { visible: false });
        b.add('translation', 'T', { a: '(1, 1, 0)' }, { visible: false });
        b.add('composition', 'F', { F: 'C', G: 'T' }, { caption: 'F = TC' });
        b.add('mapping', 'G', { comps: '(x*cos(th) - y*sin(th) + 1, x*sin(th) + y*cos(th) + 1, z)', box: 1, lines: 3, showDomain: false, center: '(0, 0, 0)', dim: 3 }, { visible: false, caption: 'F' });
        b.add('point', 'p', { coords: '(1.5, -0.5, 0.5)' });
        b.add('tangentVector', 'v', { v: '(1, 0.5, 1)', p: 'p' }, { caption: '\\mathbf{v}_\\mathbf{p}' });
        b.add('tangentMap', 'Gv', { F: 'G', v: 'v' }, { caption: 'F_*(\\mathbf{v}_\\mathbf{p})', color: '#cf222e' });
        b.add('isoImage', 'Fv', { F: 'F', X: 'v' }, { caption: 'C(\\mathbf{v})_{F(\\mathbf{p})}', color: '#953800', visible: false });
        b.add('point', 'o', { coords: '(0, 0, 0)' }, { label: false, color: '#24292f' });
        b.add('tangentVector', 'v0', { v: '(1, 0.5, 1)', p: 'o' }, { color: '#8c959f', caption: '\\mathbf{v}' });
        b.add('isoImage', 'Cv', { F: 'C', X: 'v0' }, { color: '#8c959f', caption: 'C(\\mathbf{v})' });
        b.add('point', 'q', { coords: '(-1.5, 1, -0.5)' }, { color: '#8250df' });
        b.add('tangentVector', 'w', { v: '(1, 0.5, 1)', p: 'q' }, { caption: '\\mathbf{w}_\\mathbf{q}', color: '#8250df' });
        b.add('isoImage', 'Fw', { F: 'F', X: 'w' }, { caption: 'F_*(\\mathbf{w}_\\mathbf{q})', color: '#bf3989' });
      },
      select: 'Gv',
    },
    checks: [
      { label: md`F_*(\mathbf{v}_\mathbf{p}) \text{ (Def. 1.7.4)} - C(\mathbf{v})_{F(\mathbf{p})}`, value: (s) => Math.max(diff(vec(s, 'Gv').v, vec(s, 'Fv').v), diff(vec(s, 'Gv').p, vec(s, 'Fv').p)) },
      { label: md`\text{vector part of } F_*(\mathbf{w}_\mathbf{q}) - C(\mathbf{v})`, value: (s) => diff(vec(s, 'Fw').v, vec(s, 'Cv').v) },
    ],
  },
  {
    id: '3.2.2',
    statement: md`Isometries preserve dot products of tangent vectors. That is, if $\mathbf{v}_\mathbf{p}$ and $\mathbf{w}_\mathbf{p}$ are tangent vectors to $\mathbf{R}^3$ at the same point, and $F$ is an isometry, then
$$F_*(\mathbf{v}_\mathbf{p}) \bullet F_*(\mathbf{w}_\mathbf{p}) = \mathbf{v}_\mathbf{p} \bullet \mathbf{w}_\mathbf{p}.$$`,
    proof: md`Let $C$ be the orthogonal part of $F$; being orthogonal, $C$ preserves dot products in $\mathbf{R}^3$. By Theorem [[3.2.1]],
$$F_*(\mathbf{v}_\mathbf{p}) \bullet F_*(\mathbf{w}_\mathbf{p}) = C(\mathbf{v})_{F(\mathbf{p})} \bullet C(\mathbf{w})_{F(\mathbf{p})} = C(\mathbf{v}) \bullet C(\mathbf{w}) = \mathbf{v} \bullet \mathbf{w} = \mathbf{v}_\mathbf{p} \bullet \mathbf{w}_\mathbf{p},$$
using twice Definition [[2.1.3]] (dot products of tangent vectors). $\quad ∎$`,
    notes: md`Hence derived notions are preserved too: $\lVert F_*(\mathbf{v}) \rVert = \lVert \mathbf{v} \rVert$, and orthogonal vectors stay orthogonal. So **frames are preserved**: if $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ is a frame at $\mathbf{p}$ and $F$ an isometry, $F_*(\mathbf{e}_1), F_*(\mathbf{e}_2), F_*(\mathbf{e}_3)$ is a frame at $F(\mathbf{p})$ (directly: $F_*(\mathbf{e}_i) \bullet F_*(\mathbf{e}_j) = \mathbf{e}_i \bullet \mathbf{e}_j = \delta_{ij}$).

The figure: $\mathbf{v}$, $\mathbf{w}$ and a frame at $\mathbf{p}$, with their images under an isometry that includes a reflection.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('rotation', 'C', { axis: '(1, 1, 0)', angle: '1.3' }, { visible: false });
        b.add('reflection', 'R', { n: '(0, 0, 1)' }, { visible: false });
        b.add('composition', 'RC', { F: 'C', G: 'R' }, { visible: false });
        b.add('translation', 'T', { a: '(-2, 1, 0.5)' }, { visible: false });
        b.add('composition', 'F', { F: 'RC', G: 'T' }, { caption: 'F' });
        b.add('point', 'p', { coords: '(1, 0.5, 0.5)' });
        b.add('tangentVector', 'v', { v: '(1, 0.5, 0.5)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('tangentVector', 'w', { v: '(-0.5, 1, 0.3)', p: 'p' }, { caption: '\\mathbf{w}', color: '#0969da' });
        b.add('isoImage', 'Fv', { F: 'F', X: 'v' }, { caption: 'F_*(\\mathbf{v})' });
        b.add('isoImage', 'Fw', { F: 'F', X: 'w' }, { caption: 'F_*(\\mathbf{w})', color: '#0969da' });
        b.add('dot', 'vw', { v: 'v', w: 'w' }, { caption: '\\mathbf{v} \\bullet \\mathbf{w}' });
        b.add('dot', 'FvFw', { v: 'Fv', w: 'Fw' }, { caption: 'F_*\\mathbf{v} \\bullet F_*\\mathbf{w}' });
        b.add('frame', 'e', { p: '(2, -1, 0)', e1: '(1, 2, 1)/sqrt(6)', e2: '(-2, 0, 2)/sqrt(8)', e3: '(1, -1, 1)/sqrt(3)', lab: 'e' });
        b.add('isoImage', 'Fe', { F: 'F', X: 'e' });
      },
      select: 'FvFw',
    },
    checks: [
      { label: md`F_*(\mathbf{v}) \bullet F_*(\mathbf{w}) - \mathbf{v} \bullet \mathbf{w}`, value: (s) => num(s, 'FvFw') - num(s, 'vw') },
      { label: md`\max |F_*(\mathbf{e}_i) \bullet F_*(\mathbf{e}_j) - \delta_{ij}|`, value: (s) => { const e = frame(s, 'Fe').e; let m = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) m = Math.max(m, Math.abs(dot(e[i], e[j]) - (i === j ? 1 : 0))); return m; } },
    ],
  },
  // ===========================================================================================
  // §3.3 Orientation
  {
    id: '3.3.1',
    statement: md`Each frame $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ at a point of $\mathbf{R}^3$ has an attitude matrix $A$, and $\mathbf{e}_1 \bullet \mathbf{e}_2 \times \mathbf{e}_3 = \det A = \pm1$. When this number is $+1$ the frame is **positively oriented** (right-handed); when it is $-1$ it is **negatively oriented** (left-handed).

**Remark.** (1) At each point of $\mathbf{R}^3$ the frame of the natural frame field $U_1, U_2, U_3$ is positively oriented.

(2) A frame $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ is positively oriented if and only if $\mathbf{e}_1 \times \mathbf{e}_2 = \mathbf{e}_3$. So orientation is determined in practice by the right-hand rule; frame $(P)$ of Fig. 3.3 is positively oriented, frame $(N)$ negatively. In particular **Frenet frames are always positively oriented**, since by definition $B = T \times N$.

(3) For a positively oriented frame the cross products are
$$\mathbf{e}_1 = \mathbf{e}_2 \times \mathbf{e}_3 = -\mathbf{e}_3 \times \mathbf{e}_2, \quad \mathbf{e}_2 = \mathbf{e}_3 \times \mathbf{e}_1 = -\mathbf{e}_1 \times \mathbf{e}_3, \quad \mathbf{e}_3 = \mathbf{e}_1 \times \mathbf{e}_2 = -\mathbf{e}_2 \times \mathbf{e}_1;$$
for a negatively oriented frame, reverse the vectors in each cross product.`,
    proof: md`The book omits the easy proof of these facts. (For (2): $\mathbf{e}_1 \times \mathbf{e}_2$ is a unit vector orthogonal to $\mathbf{e}_1$ and $\mathbf{e}_2$ by [[2.1.8]], hence $\pm\mathbf{e}_3$, and the sign is $\mathbf{e}_1 \times \mathbf{e}_2 \bullet \mathbf{e}_3 = \mathbf{e}_1 \bullet \mathbf{e}_2 \times \mathbf{e}_3$.)`,
    notes: md`Orientation is what distinguishes a right-handed glove from a left-handed one. The figure shows the two frames of Fig. 3.3 — $(P)$ and $(N)$, which differ by exchanging $\mathbf{e}_1$ and $\mathbf{e}_2$ — and a Frenet frame on a helix.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frame', 'P', { p: '(-1.5, 0, 0)', e1: '(1, 0, 0)', e2: '(0, 1, 0)', e3: '(0, 0, 1)', lab: 'e' }, { caption: '(P)' });
        b.add('frame', 'N', { p: '(1.5, 0, 0)', e1: '(0, 1, 0)', e2: '(1, 0, 0)', e3: '(0, 0, 1)', lab: 'e' }, { caption: '(N)' });
        b.add('curve', 'h', { comps: '(cos(t), sin(t) + 2.5, t/4)', param: 't', a: '-6', b: '6', dim: 3 }, { caption: '\\beta' });
        b.add('frenetFrame', 'TNB', { curve: 'h', t0: '1', along: false, n: 12 });
      },
      select: 'N',
    },
    checks: [
      { label: md`\mathbf{e}_1 \bullet \mathbf{e}_2 \times \mathbf{e}_3 \text{ for } (P)`, value: (s) => det3(frame(s, 'P').e), expect: 1 },
      { label: md`\mathbf{e}_1 \bullet \mathbf{e}_2 \times \mathbf{e}_3 \text{ for } (N)`, value: (s) => det3(frame(s, 'N').e), expect: -1 },
      { label: md`T \bullet N \times B \text{ (Frenet frame)}`, value: (s) => det3(frame(s, 'TNB').e), expect: 1 },
    ],
  },
  {
    id: '3.3.2',
    statement: md`If $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ is a frame at some point of $\mathbf{R}^3$ and $F$ is an isometry, then
$$F_*(\mathbf{e}_1) \bullet F_*(\mathbf{e}_2) \times F_*(\mathbf{e}_3) = (\operatorname{sgn} F)\,\mathbf{e}_1 \bullet \mathbf{e}_2 \times \mathbf{e}_3.$$`,
    proof: md`If $\mathbf{e}_j = \sum a_{jk}U_k$, the coordinate form of Theorem [[3.2.1]] gives
$$F_*(\mathbf{e}_j) = \sum_{i,k} c_{ik}a_{jk}\,\bar U_i,$$
where $C = (c_{ij})$ is the orthogonal part of $F$. So the attitude matrix of the frame $F_*(\mathbf{e}_1), F_*(\mathbf{e}_2), F_*(\mathbf{e}_3)$ is
$$\left(\sum_k c_{ik}a_{jk}\right) = \left(\sum_k c_{ik}\,{}^t a_{kj}\right) = C\,{}^t A$$
(up to transposition, which does not change the determinant). The triple product of a frame is the determinant of its attitude matrix, and by definition $\operatorname{sgn} F = \det C$. Hence
$$F_*(\mathbf{e}_1) \bullet F_*(\mathbf{e}_2) \times F_*(\mathbf{e}_3) = \det(C\,{}^t A) = \det C \cdot \det{}^t A = \det C \cdot \det A = (\operatorname{sgn} F)\,\mathbf{e}_1 \bullet \mathbf{e}_2 \times \mathbf{e}_3. \qquad ∎$$`,
    notes: md`**Sign of an isometry.** The determinant of an orthogonal matrix is $\pm1$; if $C$ is the orthogonal part of $F$, the **sign** of $F$ is $\operatorname{sgn} F = \det C$.

So if $\operatorname{sgn} F = +1$, $F_*$ carries positively oriented frames to positively oriented frames (and negative to negative); if $\operatorname{sgn} F = -1$, positive goes to negative and negative to positive. The figure: a positively oriented frame and its images under a rotation $G$ ($+1$) and under $F$, which includes a reflection ($-1$).`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frame', 'e', { p: '(0, 0, 0)', e1: '(1, 2, 1)/sqrt(6)', e2: '(-2, 0, 2)/sqrt(8)', e3: '(1, -1, 1)/sqrt(3)', lab: 'e' });
        b.add('rotation', 'C', { axis: '(1, 1, 1)', angle: '2' }, { visible: false });
        b.add('translation', 'T1', { a: '(-2.5, 1, 0)' }, { visible: false });
        b.add('composition', 'G', { F: 'C', G: 'T1' });
        b.add('reflection', 'R', { n: '(1, 0, 0)' }, { visible: false });
        b.add('translation', 'T2', { a: '(2.5, 1, 0)' }, { visible: false });
        b.add('composition', 'RC', { F: 'C', G: 'R' }, { visible: false });
        b.add('composition', 'F', { F: 'RC', G: 'T2' });
        b.add('isoImage', 'Ge', { F: 'G', X: 'e' }, { caption: 'G_*(\\mathbf{e}_i)' });
        b.add('isoImage', 'Fe', { F: 'F', X: 'e' }, { caption: 'F_*(\\mathbf{e}_i)' });
      },
      select: 'Fe',
    },
    checks: [
      { label: md`\text{triple}(G_*\mathbf{e}) - (\operatorname{sgn} G)\,\text{triple}(\mathbf{e})`, value: (s) => det3(frame(s, 'Ge').e) - Math.sign(det3(iso(s, 'G').C)) * det3(frame(s, 'e').e) },
      { label: md`\text{triple}(F_*\mathbf{e}) - (\operatorname{sgn} F)\,\text{triple}(\mathbf{e})`, value: (s) => det3(frame(s, 'Fe').e) - Math.sign(det3(iso(s, 'F').C)) * det3(frame(s, 'e').e) },
    ],
  },
  {
    id: '3.3.3',
    statement: md`An isometry $F$ of $\mathbf{R}^3$ is said to be
$$\text{orientation-preserving if } \operatorname{sgn} F = \det C = +1, \qquad \text{orientation-reversing if } \operatorname{sgn} F = \det C = -1,$$
where $C$ is the orthogonal part of $F$.`,
    notes: md`By [[3.3.2]], orientation-preserving isometries keep right-handed frames right-handed. They also keep **right-handed helices right-handed**, while an orientation-reversing isometry turns them into left-handed ones (and changes the sign of the torsion, [[3.4.2]]). The figure: a helix, its image under a rotation (still right-handed) and under a reflection (left-handed). The sign satisfies $\operatorname{sgn}(FG) = \operatorname{sgn} F\cdot\operatorname{sgn} G$ (Exercise 1).`,
    tryThis: [md`Select the isometries to read their signs in the Course view.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('curve', 'h', { comps: '(cos(t), sin(t), t/5)', param: 't', a: '-6', b: '6', dim: 3 }, { caption: '\\beta' });
        b.add('rotation', 'C', { axis: '(1, 0, 0)', angle: 'pi/2' }, { visible: false });
        b.add('translation', 'Ta', { a: '(0, -3, 0)' }, { visible: false });
        b.add('composition', 'G', { F: 'C', G: 'Ta' }, { caption: 'G' });
        b.add('reflection', 'R', { n: '(0, 1, 0)' }, { visible: false });
        b.add('translation', 'Tb', { a: '(0, 3, 0)' }, { visible: false });
        b.add('composition', 'F', { F: 'R', G: 'Tb' }, { caption: 'F' });
        b.add('isoImage', 'Gh', { F: 'G', X: 'h' }, { caption: 'G(\\beta)', color: '#1a7f37' });
        b.add('isoImage', 'Fh', { F: 'F', X: 'h' }, { caption: 'F(\\beta)', color: '#cf222e' });
        b.add('curvaturePlot', 'p1', { curve: 'Gh', kappa: false, tau: true, speed: false, ratio: false, marker: '' }, { caption: '\\tau \\text{ of } G(\\beta)' });
        b.add('curvaturePlot', 'p2', { curve: 'Fh', kappa: false, tau: true, speed: false, ratio: false, marker: '' }, { caption: '\\tau \\text{ of } F(\\beta)' });
      },
      select: 'F',
    },
    checks: [
      { label: md`\operatorname{sgn} G`, value: (s) => Math.sign(det3(iso(s, 'G').C)), expect: 1 },
      { label: md`\operatorname{sgn} F`, value: (s) => Math.sign(det3(iso(s, 'F').C)), expect: -1 },
    ],
  },
  {
    id: '3.3.4',
    statement: md`**(1) Translations.** All translations are orientation-preserving: the orthogonal part of a translation $T$ is the identity $I$, so $\operatorname{sgn} T = \det I = +1$.

**(2) Rotations.** The rotation $C$ of Example [[3.1.2]] through $\vartheta$ around the $z$ axis has matrix
$$\begin{pmatrix} \cos\vartheta & -\sin\vartheta & 0 \\ \sin\vartheta & \cos\vartheta & 0 \\ 0 & 0 & 1 \end{pmatrix},$$
so $\operatorname{sgn} C = \det C = +1$: $C$ is orientation-preserving (see Exercise 4).

**(3) Reflections.** Reversal of orientation can (literally) be seen in a mirror. If the $yz$ plane is the mirror, a point $\mathbf{p} = (p_1, p_2, p_3)$ appears to be at $R(\mathbf{p}) = (-p_1, p_2, p_3)$ (Fig. 3.4). This **reflection in the $yz$ plane** is an orthogonal transformation with matrix
$$\begin{pmatrix} -1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{pmatrix},$$
so $R$ is orientation-reversing — as confirmed by the experimental fact that the mirror image of a right hand is a left hand.`,
    notes: md`The figure: the mirror ($yz$ plane), a point and its reflection, and a right-handed frame whose mirror image is left-handed. In the plane (2D view) the reflection in the $y$ axis, $(x, y) \mapsto (-x, y)$, reverses the sense of rotation of a circle.`,
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('function', 'f', { expr: 'x', levels: '0', box: 2, res: 8, dim: 3 }, { color: '#8c959f', opacity: 0.2, label: false });
        b.add('reflection', 'R', { n: '(1, 0, 0)' }, { visible: false });
        b.add('point', 'p', { coords: '(1.5, 0.5, 1)' });
        b.add('isoImage', 'Rp', { F: 'R', X: 'p' }, { caption: 'R(\\mathbf{p})', color: '#cf222e' });
        b.add('frame', 'e', { p: '(1.5, -1, 0)', e1: '(1, 0, 0)', e2: '(0, 1, 0)', e3: '(0, 0, 1)', lab: 'e' });
        b.add('isoImage', 'Re', { F: 'R', X: 'e' }, { caption: 'R_*(\\mathbf{e}_i)' });
        b.add('curve', 'c', { comps: '(1.5 + 0.5*cos(t), 0.5*sin(t))', param: 't', a: '0', b: '5', dim: 2 }, { caption: '\\gamma' });
        b.add('mapping', 'R2', { comps: '(-x, y)', box: 1, lines: 2, showDomain: false, center: '(0, 0)', dim: 2 }, { visible: false, caption: 'R' });
        b.add('imageCurve', 'Rc', { F: 'R2', curve: 'c' }, { caption: 'R(\\gamma)', color: '#cf222e' });
        b.add('velocity', 'vc', { curve: 'c', t0: '1' }, { caption: "\\gamma'" });
        b.add('velocity', 'vRc', { curve: 'Rc', t0: '1' }, { caption: "R(\\gamma)'", color: '#cf222e' });
      },
      select: 'Re',
    },
    checks: [
      { label: md`R(\mathbf{p}) - (-p_1, p_2, p_3)`, value: (s) => { const p = point(s, 'p'); return diff(point(s, 'Rp'), [-p[0], p[1], p[2]]); } },
      { label: md`\text{triple}(R_*\mathbf{e})`, value: (s) => det3(frame(s, 'Re').e), expect: -1 },
    ],
  },
  {
    id: '3.3.5',
    statement: md`Let $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ be a frame at a point of $\mathbf{R}^3$. If $\mathbf{v} = \sum v_i\mathbf{e}_i$ and $\mathbf{w} = \sum w_i\mathbf{e}_i$, then
$$\mathbf{v} \times \mathbf{w} = \varepsilon\begin{vmatrix} \mathbf{e}_1 & \mathbf{e}_2 & \mathbf{e}_3 \\ v_1 & v_2 & v_3 \\ w_1 & w_2 & w_3 \end{vmatrix},$$
where $\varepsilon = \mathbf{e}_1 \bullet \mathbf{e}_2 \times \mathbf{e}_3 = \pm1$.`,
    proof: md`It suffices to expand
$$\mathbf{v} \times \mathbf{w} = (v_1\mathbf{e}_1 + v_2\mathbf{e}_2 + v_3\mathbf{e}_3) \times (w_1\mathbf{e}_1 + w_2\mathbf{e}_2 + w_3\mathbf{e}_3)$$
using the formulas (3) of Remark [[3.3.1]]. For example, if the frame is positively oriented, the $\mathbf{e}_1$ component of $\mathbf{v} \times \mathbf{w}$ is
$$v_2\mathbf{e}_2 \times w_3\mathbf{e}_3 + v_3\mathbf{e}_3 \times w_2\mathbf{e}_2 = (v_2w_3 - v_3w_2)\,\mathbf{e}_1.$$
Since $\varepsilon = 1$ in this case, the determinant of the statement gives the same result. $\quad ∎$`,
    notes: md`The dot product has the same formula $\mathbf{v} \bullet \mathbf{w} = \sum v_iw_i$ in every frame; the cross product has *almost* the same formula, but orientation enters through $\varepsilon$. The figure uses a negatively oriented frame ($\varepsilon = -1$).`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('frame', 'e', { p: '(0, 0, 0)', e1: '(-2, 0, 2)/sqrt(8)', e2: '(1, 2, 1)/sqrt(6)', e3: '(1, -1, 1)/sqrt(3)', lab: 'e' });
        b.add('tangentVector', 'v', { v: '(1.5, 0.5, -0.5)', p: '(0, 0, 0)' }, { caption: '\\mathbf{v}' });
        b.add('tangentVector', 'w', { v: '(0, 1, 1)', p: '(0, 0, 0)' }, { caption: '\\mathbf{w}', color: '#0969da' });
        b.add('cross', 'vxw', { v: 'v', w: 'w' });
      },
      select: 'vxw',
    },
    checks: [
      {
        label: md`\mathbf{v} \times \mathbf{w} - \varepsilon\,\det(\ldots)`,
        value: (s) => {
          const E = frame(s, 'e').e;
          const eps = det3(E);
          const a = E.map((e) => dot(vec(s, 'v').v, e));
          const c = E.map((e) => dot(vec(s, 'w').v, e));
          const k = [a[1] * c[2] - a[2] * c[1], a[2] * c[0] - a[0] * c[2], a[0] * c[1] - a[1] * c[0]];
          return diff(vec(s, 'vxw').v, [0, 1, 2].map((i) => eps * (k[0] * E[0][i] + k[1] * E[1][i] + k[2] * E[2][i])));
        },
      },
    ],
  },
  {
    id: '3.3.6',
    statement: md`Let $\mathbf{v}$ and $\mathbf{w}$ be tangent vectors to $\mathbf{R}^3$ at $\mathbf{p}$. If $F$ is an isometry of $\mathbf{R}^3$, then
$$F_*(\mathbf{v} \times \mathbf{w}) = (\operatorname{sgn} F)\,F_*(\mathbf{v}) \times F_*(\mathbf{w}).$$`,
    proof: md`Write $\mathbf{v} = \sum v_iU_i(\mathbf{p})$ and $\mathbf{w} = \sum w_iU_i(\mathbf{p})$, and let $\mathbf{e}_i = F_*(U_i(\mathbf{p}))$. Since $F_*$ is linear, $F_*(\mathbf{v}) = \sum v_i\mathbf{e}_i$ and $F_*(\mathbf{w}) = \sum w_i\mathbf{e}_i$. A straightforward computation with Lemma [[3.3.5]] gives
$$F_*(\mathbf{v}) \times F_*(\mathbf{w}) = \varepsilon\,F_*(\mathbf{v} \times \mathbf{w}),$$
where $\varepsilon = \mathbf{e}_1 \bullet \mathbf{e}_2 \times \mathbf{e}_3 = F_*(U_1(\mathbf{p})) \bullet F_*(U_2(\mathbf{p})) \times F_*(U_3(\mathbf{p}))$. But $U_1, U_2, U_3$ is positively oriented, so by Lemma [[3.3.2]], $\varepsilon = \operatorname{sgn} F$. $\quad ∎$`,
    notes: md`So the effect of an isometry on cross products involves orientation: an orientation-reversing isometry maps $\mathbf{v} \times \mathbf{w}$ to $-F_*(\mathbf{v}) \times F_*(\mathbf{w})$ (Exercise 3 with the matrix of Exercise 4 of §3.1). In the figure, $F$ includes a reflection: the images $F_*(\mathbf{v} \times \mathbf{w})$ (red) and $F_*\mathbf{v} \times F_*\mathbf{w}$ (blue) are opposite.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('point', 'p', { coords: '(-1.5, 0, 0)' });
        b.add('tangentVector', 'v', { v: '(1, 0.3, 0)', p: 'p' }, { caption: '\\mathbf{v}' });
        b.add('tangentVector', 'w', { v: '(0, 1, 0.4)', p: 'p' }, { caption: '\\mathbf{w}', color: '#0969da' });
        b.add('cross', 'vxw', { v: 'v', w: 'w' }, { caption: '\\mathbf{v}\\times\\mathbf{w}' });
        b.add('reflection', 'R', { n: '(0, 0, 1)' }, { visible: false });
        b.add('translation', 'T', { a: '(3, 0.5, 0)' }, { visible: false });
        b.add('composition', 'F', { F: 'R', G: 'T' });
        b.add('isoImage', 'Fv', { F: 'F', X: 'v' }, { caption: 'F_*\\mathbf{v}' });
        b.add('isoImage', 'Fw', { F: 'F', X: 'w' }, { caption: 'F_*\\mathbf{w}', color: '#0969da' });
        b.add('isoImage', 'Fvxw', { F: 'F', X: 'vxw' }, { caption: 'F_*(\\mathbf{v}\\times\\mathbf{w})', color: '#cf222e' });
        b.add('cross', 'FvxFw', { v: 'Fv', w: 'Fw' }, { caption: 'F_*\\mathbf{v} \\times F_*\\mathbf{w}', color: '#0550ae' });
      },
      select: 'F',
    },
    checks: [
      {
        label: md`F_*(\mathbf{v} \times \mathbf{w}) - (\operatorname{sgn} F)\,F_*\mathbf{v} \times F_*\mathbf{w}`,
        value: (s) => {
          const sg = Math.sign(det3(iso(s, 'F').C));
          return diff(vec(s, 'Fvxw').v, cross(vec(s, 'Fv').v, vec(s, 'Fw').v).map((x) => sg * x));
        },
      },
    ],
  },
  // ===========================================================================================
  // §3.4 Euclidean Geometry
  {
    id: '3.4.1',
    statement: md`Let $Y$ be a vector field on a curve $\alpha$ in $\mathbf{R}^3$, and let $F$ be an isometry of $\mathbf{R}^3$. Then $\bar Y = F_*(Y)$ is a vector field on $\bar\alpha = F(\alpha)$, and
$$\bar Y' = F_*(Y').$$`,
    proof: md`A vector field $Y = \sum y_jU_j$ is differentiated by differentiating its Euclidean coordinates: $Y' = \sum \frac{dy_j}{dt}U_j$. So by the coordinate version of Theorem [[3.2.1]],
$$F_*(Y') = \sum c_{ij}\frac{dy_j}{dt}\,\bar U_i.$$
On the other hand $\bar Y = F_*(Y) = \sum c_{ij}y_j\,\bar U_i$. Each $c_{ij}$ is constant — an entry of the matrix of the orthogonal part of $F$ — hence
$$\bar Y' = \sum \frac{d}{dt}(c_{ij}y_j)\,\bar U_i = \sum c_{ij}\frac{dy_j}{dt}\,\bar U_i.$$
Thus $F_*(Y')$ and $\bar Y'$ are the same. $\quad ∎$`,
    notes: md`**Euclidean geometry** (beginning of §3.4). That congruent triangles share all geometric properties is not a theorem — it is the *definition* of a geometric property. More generally, Euclidean geometry can be defined as the totality of concepts preserved by isometries: dot products ([[3.2.2]]), cross products up to sign ([[3.3.6]])… In practice the label is kept for concepts preserved by isometries but *not* by arbitrary mappings or diffeomorphisms.

**Velocity vs. acceleration.** Every mapping preserves velocity, $\beta' = F_*(\alpha')$ ([[1.7.7]]), but not acceleration: for $\alpha(t) = (t, 0, 0)$ and $F = (x^2, y, z)$, $\alpha'' = 0$ so $F_*(\alpha'') = 0$, while $\beta = F(\alpha) = (t^2, 0, 0)$ has $\beta'' = 2U_1$. **Isometries do preserve acceleration**: with $Y = \alpha'$, $\bar Y = \bar\alpha'$ by [[1.7.7]], so $\bar\alpha'' = \bar Y' = F_*(Y') = F_*(\alpha'')$. Velocity belongs to the *calculus* of Euclidean space, acceleration to its *geometry*.

The 3D view: Exercise 2, $Y = (t, 1 - t^2, 1 + t^2)$ on the helix $\alpha = (\cos t, \sin t, 2t)$ and the orthogonal $C$ given there (Fig. 3.6). The 2D view: the non-isometric $F = (x^2, y)$ maps the straight line $\alpha(t) = (t, 0.5)$ (zero acceleration) onto a curve run with acceleration $2U_1$.`,
    tryThis: [md`Animate $t_0$: $\bar\alpha''(t_0)$ always equals $C_*(\alpha''(t_0))$ in 3D, whereas in 2D the acceleration of $F(\alpha)$ is not $F_*(0) = 0$.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('t0', 0.6, 0.2, 1.5, 0.01);
        b.add('curve', 'alpha', { comps: '(cos(t), sin(t), 2*t)', param: 't', a: '-1.5', b: '1.5', dim: 3 });
        b.add('curveField', 'Y', { curve: 'alpha', mode: 'custom', comps: '(t, 1 - t^2, 1 + t^2)', n: 9, scale: 0.4 }, { color: '#bf8700' });
        b.add('orthogonal', 'C', { C: '-1, 0, 0; 0, 1/sqrt(2), -1/sqrt(2); 0, 1/sqrt(2), 1/sqrt(2)' });
        b.add('isoImage', 'abar', { F: 'C', X: 'alpha' }, { caption: '\\bar\\alpha = C(\\alpha)', color: '#cf222e' });
        b.add('isoImage', 'Ybar', { F: 'C', X: 'Y' }, { caption: '\\bar Y = C_*(Y)', color: '#953800' });
        b.add('acceleration', 'acc', { curve: 'alpha', t0: 't0' }, { caption: "\\alpha''(t_0)" });
        b.add('acceleration', 'accbar', { curve: 'abar', t0: 't0' }, { caption: "\\bar\\alpha''(t_0)", color: '#cf222e' });
        b.add('isoImage', 'Cacc', { F: 'C', X: 'acc' }, { caption: "C_*(\\alpha''(t_0))", visible: false });
        b.add('mapping', 'G', { comps: '(x^2, y)', box: 1, lines: 5, showDomain: false, center: '(1, 0.5)', dim: 2 }, { caption: 'F', color: '#d0d7de' });
        b.add('curve', 'a2', { comps: '(t, 0.5)', param: 't', a: '0.2', b: '1.5', dim: 2 }, { caption: '\\alpha' });
        b.add('imageCurve', 'b2', { F: 'G', curve: 'a2' }, { caption: '\\beta = F(\\alpha)', color: '#bf3989' });
        b.add('acceleration', 'acc2', { curve: 'b2', t0: 't0' }, { caption: "\\beta''", color: '#bf3989' });
      },
      select: 'accbar',
    },
    checks: [
      { label: md`\bar\alpha''(t_0) - C_*(\alpha''(t_0))`, value: (s) => diff(vec(s, 'accbar').v, vec(s, 'Cacc').v) },
      {
        label: md`\bar Y'(t_0) - C_*(Y'(t_0)) \text{ (numerical)}`,
        value: (s) => {
          const C = iso(s, 'C').C;
          const t = num(s, 't0');
          const Y = (u: number) => [u, 1 - u * u, 1 + u * u];
          const h = 1e-5;
          const Ybp = matvec(C, Y(t + h));
          const Ybm = matvec(C, Y(t - h));
          const dYbar = Ybp.map((x, i) => (x - Ybm[i]) / (2 * h));
          return diff(dYbar, matvec(C, [1, -2 * t, 2 * t]));
        },
        tol: 1e-6,
      },
      { label: md`\lVert \beta'' \rVert \text{ in 2D (not } 0\text{: } F \text{ is not an isometry)}`, value: (s) => norm(vec(s, 'acc2').v), expect: 2 },
    ],
  },
  {
    id: '3.4.2',
    statement: md`Let $\beta$ be a unit-speed curve in $\mathbf{R}^3$ with positive curvature, and let $\bar\beta = F(\beta)$ be the image curve of $\beta$ under an isometry $F$ of $\mathbf{R}^3$. Then
$$\bar\kappa = \kappa, \qquad \bar\tau = (\operatorname{sgn} F)\,\tau, \qquad \bar T = F_*(T), \qquad \bar N = F_*(N), \qquad \bar B = (\operatorname{sgn} F)\,F_*(B),$$
where $\operatorname{sgn} F = \pm1$ is the sign of the isometry $F$.`,
    proof: md`$\bar\beta$ is also unit-speed, since $\lVert \bar\beta' \rVert = \lVert F_*(\beta') \rVert = \lVert \beta' \rVert = 1$. So the definitions of §2.3 apply to both, and
$$\bar T = \bar\beta' = F_*(\beta') = F_*(T).$$
Since $F_*$ preserves acceleration and norms, the definition of curvature gives
$$\bar\kappa = \lVert \bar\beta'' \rVert = \lVert F_*(\beta'') \rVert = \lVert \beta'' \rVert = \kappa.$$
To get the full Frenet frame we use $\kappa > 0$ (hence $\bar\kappa > 0$). By definition $N = \beta''/\kappa$, so
$$\bar N = \frac{\bar\beta''}{\bar\kappa} = \frac{F_*(\beta'')}{\kappa} = F_*\left(\frac{\beta''}{\kappa}\right) = F_*(N).$$
It remains to treat the interesting cases $B$ and $\tau$. Since $B = T \times N$ involves a cross product, Theorem [[3.3.6]] gives
$$\bar B = \bar T \times \bar N = F_*(T) \times F_*(N) = (\operatorname{sgn} F)\,F_*(T \times N) = (\operatorname{sgn} F)\,F_*(B).$$
The definition of torsion is essentially $\tau = -B' \bullet N = B \bullet N'$. Using the results for $B$ and $N$,
$$\bar\tau = \bar B \bullet \bar N' = (\operatorname{sgn} F)\,F_*(B) \bullet F_*(N') = (\operatorname{sgn} F)\,B \bullet N' = (\operatorname{sgn} F)\,\tau. \qquad ∎$$`,
    notes: md`A rigid motion carries a curve into one that turns and twists in exactly the same way — *when the isometry is orientation-preserving*. The factor $\operatorname{sgn} F$ shows that torsion carries a subtler information than curvature: **the sign of $\tau$ measures the orientation of the twisting** of the curve; an orientation-reversing isometry reverses it ($\bar\tau = -\tau$).

The figure: a unit-speed helix $\beta$, its image under $G$ (orientation-preserving) and $F$ (orientation-reversing), with their Frenet frames at $s_0$; the 2D view graphs the three torsions.`,
    tryThis: [md`Animate $s_0$ and compare the three Frenet frames: for $F(\beta)$, $\bar B$ is the opposite of $F_*(B)$.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('s0', 1, -8, 8, 0.01);
        b.add('curve', 'beta', { comps: '(2*cos(s/sqrt(5)), 2*sin(s/sqrt(5)), s/sqrt(5))', param: 's', a: '-10', b: '10', dim: 3 });
        b.add('rotation', 'C', { axis: '(1, 0, 0)', angle: '2.2' }, { visible: false });
        b.add('translation', 'Ta', { a: '(0, 6, 0)' }, { visible: false });
        b.add('composition', 'G', { F: 'C', G: 'Ta' });
        b.add('reflection', 'R', { n: '(1, 1, 0)' }, { visible: false });
        b.add('translation', 'Tb', { a: '(0, -6, 0)' }, { visible: false });
        b.add('composition', 'F', { F: 'R', G: 'Tb' });
        b.add('isoImage', 'Gb', { F: 'G', X: 'beta' }, { caption: 'G(\\beta)', color: '#1a7f37' });
        b.add('isoImage', 'Fb', { F: 'F', X: 'beta' }, { caption: 'F(\\beta)', color: '#cf222e' });
        b.add('frenetFrame', 'TNB', { curve: 'beta', t0: 's0', along: false, n: 12 });
        b.add('frenetFrame', 'TNBG', { curve: 'Gb', t0: 's0', along: false, n: 12 }, { caption: '\\bar T, \\bar N, \\bar B' });
        b.add('frenetFrame', 'TNBF', { curve: 'Fb', t0: 's0', along: false, n: 12 }, { caption: '\\bar T, \\bar N, \\bar B' });
        b.add('curvaturePlot', 'plot', { curve: 'beta', kappa: true, tau: true, speed: false, ratio: false, marker: 's0' }, { caption: '\\beta' });
        b.add('curvaturePlot', 'plotF', { curve: 'Fb', kappa: false, tau: true, speed: false, ratio: false, marker: 's0' }, { caption: '\\bar\\tau \\text{ of } F(\\beta)' });
      },
      select: 'TNBF',
    },
    checks: [
      {
        label: md`F\colon\ |\bar\kappa - \kappa|,\ |\bar\tau - (\operatorname{sgn}F)\tau|`,
        value: (s) => {
          const t = num(s, 's0');
          const A = frenetAt(curve(s, 'beta'), t);
          const B = frenetAt(curve(s, 'Fb'), t);
          const sg = Math.sign(det3(iso(s, 'F').C));
          return Math.max(Math.abs(B.kappa - A.kappa), Math.abs(B.tau - sg * A.tau));
        },
      },
      {
        label: md`F\colon\ \bar T - F_*T,\ \bar N - F_*N,\ \bar B - (\operatorname{sgn}F)F_*B`,
        value: (s) => {
          const t = num(s, 's0');
          const A = frenetAt(curve(s, 'beta'), t);
          const B = frenetAt(curve(s, 'Fb'), t);
          const C = iso(s, 'F').C;
          const sg = Math.sign(det3(C));
          return Math.max(diff(B.T, matvec(C, A.T)), diff(B.N, matvec(C, A.N)), diff(B.B, matvec(C, A.B).map((x) => sg * x)));
        },
      },
      {
        label: md`G\colon\ |\bar\tau - \tau| \text{ (orientation-preserving)}`,
        value: (s) => {
          const t = num(s, 's0');
          return Math.abs(frenetAt(curve(s, 'Gb'), t).tau - frenetAt(curve(s, 'beta'), t).tau);
        },
      },
    ],
  },
  {
    id: '3.4.3',
    statement: md`Let $\beta$ be the unit-speed helix
$$\beta(s) = \left(\cos\frac{s}{c},\ \sin\frac{s}{c},\ \frac{s}{c}\right),$$
obtained from Example [[2.3.3]] with $a = b = 1$, so $c = \sqrt2$; by the formulas for helices $\kappa = \tau = 1/2$. Let $R$ be the reflection in the $xy$ plane, $R(x, y, z) = (x, y, -z)$. The image curve $\bar\beta = R(\beta)$ is the mirror image
$$\bar\beta(s) = \left(\cos\frac{s}{c},\ \sin\frac{s}{c},\ -\frac{s}{c}\right).$$`,
    notes: md`In Fig. 3.7 the mirror has its usual effect: $\beta$ and $\bar\beta$ twist in opposite ways — if $\beta$ is "right-handed", $\bar\beta$ is "left-handed". (That $\beta$ goes up and $\bar\beta$ down is irrelevant.) Formally, $R$ is orientation-reversing, so Theorem [[3.4.2]] predicts $\bar\kappa = \kappa = \tfrac12$ and $\bar\tau = -\tau = -\tfrac12$. Since $\bar\beta$ is the helix of Example [[2.3.3]] with $a = 1$, $b = -1$, this agrees with the general formulas there.

The figure shows both helices on the cylinder $x^2 + y^2 = 1$, with their Frenet frames; the 2D view graphs $\kappa$ and $\tau$ of $\bar\beta$.`,
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('s0', 1, -8, 8, 0.01);
        b.add('curve', 'beta', { comps: '(cos(s/sqrt(2)), sin(s/sqrt(2)), s/sqrt(2))', param: 's', a: '-9', b: '9', dim: 3 });
        b.add('reflection', 'R', { n: '(0, 0, 1)' });
        b.add('isoImage', 'bbar', { F: 'R', X: 'beta' }, { caption: '\\bar\\beta', color: '#cf222e' });
        b.add('function', 'cyl', { expr: 'x^2 + y^2', levels: '1', box: 6.5, res: 40, dim: 3 }, { color: '#8c959f', opacity: 0.15, label: false });
        b.add('frenetFrame', 'TNB', { curve: 'beta', t0: 's0', along: false, n: 12 });
        b.add('frenetFrame', 'TNBbar', { curve: 'bbar', t0: 's0', along: false, n: 12 }, { caption: '\\bar T, \\bar N, \\bar B' });
        b.add('curvaturePlot', 'plot', { curve: 'bbar', kappa: true, tau: true, speed: false, ratio: false, marker: 's0' }, { caption: '\\bar\\beta' });
      },
      select: 'bbar',
    },
    checks: [
      { label: md`\bar\kappa(s_0)`, value: (s) => frenetAt(curve(s, 'bbar'), num(s, 's0')).kappa, expect: 0.5 },
      { label: md`\bar\tau(s_0)`, value: (s) => frenetAt(curve(s, 'bbar'), num(s, 's0')).tau, expect: -0.5 },
    ],
  },
  // ===========================================================================================
  // §3.5 Congruence of Curves
  {
    id: '3.5.1',
    statement: md`Two curves $\alpha, \beta\colon I \to \mathbf{R}^3$ are **congruent** provided there exists an isometry $F$ of $\mathbf{R}^3$ such that $\beta = F(\alpha)$; that is, $\beta(t) = F(\alpha(t))$ for all $t$ in $I$.`,
    notes: md`Intuitively, congruent curves are the same except for position in space: *trips at the same speed along routes of the same shape*. **Example.** The helix $\alpha(t) = (\cos t, \sin t, t)$ spirals around the $z$ axis exactly as $\beta(t) = (t, \cos t, \sin t)$ spirals around the $x$ axis; with the isometry $F(p_1, p_2, p_3) = (p_3, p_1, p_2)$, $F(\alpha) = \beta$.

Trying all isometries is hopeless; what is wanted is a description of the shape of a unit-speed curve so accurate that equal descriptions force congruence — curvature and torsion ([[3.5.3]]). Curves congruent by a translation are called **parallel**: $\beta = \alpha + \mathbf{p}$.

The 2D view shows two congruent plane curves (a parabola arc and a rotated, translated copy).`,
    tryThis: [md`Animate $t_0$: $F(\alpha(t_0))$ and $\beta(t_0)$ are the same point.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('t0', 1, -6, 6, 0.01);
        b.add('curve', 'alpha', { comps: '(cos(t), sin(t), t/2)', param: 't', a: '-6', b: '6', dim: 3 });
        b.add('curve', 'beta', { comps: '(t/2, cos(t), sin(t))', param: 't', a: '-6', b: '6', dim: 3 }, { color: '#cf222e' });
        b.add('orthogonal', 'F', { C: '0, 0, 1; 1, 0, 0; 0, 1, 0' });
        b.add('isoImage', 'Fa', { F: 'F', X: 'alpha' }, { caption: 'F(\\alpha)', color: '#cf222e', visible: false });
        b.add('pointOnCurve', 'A0', { curve: 'alpha', t0: 't0' }, { caption: '\\alpha(t_0)' });
        b.add('pointOnCurve', 'B0', { curve: 'beta', t0: 't0' }, { caption: '\\beta(t_0)', color: '#cf222e' });
        b.add('isoImage', 'FA0', { F: 'F', X: 'A0' }, { caption: 'F(\\alpha(t_0))', label: false, color: '#953800' });
        b.add('curve', 'c', { comps: '(t, t^2/2)', param: 't', a: '-1.5', b: '1.5', dim: 2 }, { caption: '\\alpha' });
        b.add('mapping', 'G', { comps: '(x*cos(2.2) - y*sin(2.2) + 3, x*sin(2.2) + y*cos(2.2) + 1)', box: 1, lines: 2, showDomain: false, center: '(0, 0)', dim: 2 }, { visible: false, caption: 'F' });
        b.add('imageCurve', 'Gc', { F: 'G', curve: 'c' }, { caption: 'F(\\alpha)', color: '#cf222e' });
      },
      select: 'F',
    },
    checks: [{ label: md`F(\alpha(t_0)) - \beta(t_0)`, value: (s) => diff(point(s, 'FA0'), point(s, 'B0')) }],
  },
  {
    id: '3.5.2',
    statement: md`Two curves $\alpha, \beta\colon I \to \mathbf{R}^3$ are parallel if their velocity vectors $\alpha'(s)$ and $\beta'(s)$ are parallel for each $s$ in $I$. In this case, if $\alpha(s_0) = \beta(s_0)$ for some one $s_0$ in $I$, then $\alpha = \beta$.`,
    proof: md`If $\alpha'(s)$ and $\beta'(s)$ are parallel, they have the same Euclidean coordinates:
$$\frac{d\alpha_i}{ds}(s) = \frac{d\beta_i}{ds}(s) \qquad (1 \le i \le 3),$$
where $\alpha_i$ and $\beta_i$ are the Euclidean coordinate functions. By elementary calculus $d\alpha_i/ds = d\beta_i/ds$ implies $\beta_i = \alpha_i + p_i$ for a constant $p_i$; hence $\beta = \alpha + \mathbf{p}$. If moreover $\alpha(s_0) = \beta(s_0)$, then $\mathbf{p} = 0$, so $\alpha = \beta$. $\quad ∎$`,
    notes: md`(Parallel tangent vectors have the same vector part, [[1.2.1]].) The figure: $\beta = \alpha + \mathbf{p}$ for a movable point $\mathbf{p}$; their velocities at $s_0$ are parallel. This "parallel velocities + one common point ⇒ same curve" argument is the last step of the proof of [[3.5.3]].`,
    tryThis: [md`Drag $\mathbf{p}$ to the origin: the two curves coincide.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('s0', 1, -3, 3, 0.01);
        b.add('point', 'p', { coords: '(1.5, 1, 0.5)' }, { color: '#57606a' });
        b.add('curve', 'alpha', { comps: '(cos(s), sin(2*s)/2, s/3)', param: 's', a: '-3', b: '3', dim: 3 });
        b.add('translation', 'T', { a: '(x(p), y(p), z(p))' }, { visible: false });
        b.add('isoImage', 'beta', { F: 'T', X: 'alpha' }, { caption: '\\beta = \\alpha + \\mathbf{p}', color: '#cf222e' });
        b.add('velocity', 'va', { curve: 'alpha', t0: 's0' }, { caption: "\\alpha'(s_0)" });
        b.add('velocity', 'vb', { curve: 'beta', t0: 's0' }, { caption: "\\beta'(s_0)", color: '#cf222e' });
        b.add('curve', 'a2', { comps: '(s, sin(s))', param: 's', a: '-3', b: '3', dim: 2 }, { caption: '\\alpha' });
        b.add('curve', 'b2', { comps: '(s + 0.5, sin(s) + 1)', param: 's', a: '-3', b: '3', dim: 2 }, { caption: '\\alpha + \\mathbf{p}', color: '#cf222e' });
        b.add('velocity', 'va2', { curve: 'a2', t0: 's0' }, { caption: "\\alpha'" });
        b.add('velocity', 'vb2', { curve: 'b2', t0: 's0' }, { caption: "\\beta'", color: '#cf222e' });
      },
      select: 'beta',
    },
    checks: [{ label: md`\alpha'(s_0) - \beta'(s_0) \text{ (vector parts)}`, value: (s) => diff(vec(s, 'va').v, vec(s, 'vb').v) }],
  },
  {
    id: '3.5.3',
    statement: md`If $\alpha, \beta\colon I \to \mathbf{R}^3$ are unit-speed curves such that $\kappa_\alpha = \kappa_\beta$ and $\tau_\alpha = \pm\tau_\beta$, then $\alpha$ and $\beta$ are congruent.`,
    proof: md`Two main steps: (1) replace $\alpha$ by a suitably chosen congruent curve $F(\alpha)$; (2) show that $F(\alpha) = \beta$ (Fig. 3.8).

The choice in (1) is guided by Theorem [[3.4.2]]. Fix a number, say 0, in $I$. If $\tau_\alpha = \tau_\beta$, let $F$ be the (orientation-preserving) isometry that carries the Frenet frame $T_\alpha(0), N_\alpha(0), B_\alpha(0)$ at $\alpha(0)$ to the Frenet frame $T_\beta(0), N_\beta(0), B_\beta(0)$ at $\beta(0)$ — it exists by Theorem [[3.2.3]]. Denote by $\bar\kappa, \bar\tau, \bar T, \bar N, \bar B$ the Frenet apparatus of $\bar\alpha = F(\alpha)$; by Theorem [[3.4.2]],
$$\bar\alpha(0) = \beta(0), \quad \bar\kappa = \kappa_\beta, \quad \bar\tau = \tau_\beta, \quad \bar T(0) = T_\beta(0), \quad \bar N(0) = N_\beta(0), \quad \bar B(0) = B_\beta(0). \qquad (\ddagger)$$
If instead $\tau_\alpha = -\tau_\beta$, let $F$ be the (orientation-reversing) isometry carrying $T_\alpha(0), N_\alpha(0), B_\alpha(0)$ to $T_\beta(0), N_\beta(0), -B_\beta(0)$ — a negatively oriented frame, since Frenet frames are positively oriented. Theorem [[3.4.2]] again gives $(\ddagger)$; e.g. $\bar B(0) = -F_*(B_\alpha(0)) = B_\beta(0)$.

For step (2) we show $\bar T = T_\beta$, i.e. the unit tangents of $\bar\alpha$ and $\beta$ are parallel; since $\bar\alpha(0) = \beta(0)$, Lemma [[3.5.2]] then gives $F(\alpha) = \beta$. Consider
$$f = \bar T \bullet T_\beta + \bar N \bullet N_\beta + \bar B \bullet B_\beta.$$
These are unit vector fields, so by the Schwarz inequality $\bar T \bullet T_\beta \le 1$, with equality iff $\bar T = T_\beta$; similarly for the other terms. So it suffices to show that $f$ is constantly $3$. By $(\ddagger)$, $f(0) = 3$. Now
$$f' = \bar T' \bullet T_\beta + \bar T \bullet T_\beta' + \bar N' \bullet N_\beta + \bar N \bullet N_\beta' + \bar B' \bullet B_\beta + \bar B \bullet B_\beta'.$$
Substituting the Frenet formulas and using $\bar\kappa = \kappa_\beta$, $\bar\tau = \tau_\beta$ from $(\ddagger)$, the eight resulting terms cancel in pairs, so $f' = 0$ and $f$ has constant value 3. $\quad ∎$`,
    notes: md`Thus **a unit-speed curve is determined, up to position in $\mathbf{R}^3$, by its curvature and torsion.** The proof also tells how to compute the isometry ([[3.5.4]]).

The figure: $\beta$ is the curve with $\kappa(s) = 1 + 0.4\sin s$, $\tau(s) = 0.3 + 0.2\cos s$ (built by solving the Frenet equations, [[3.5.8]]); $\alpha$ is a copy moved by an unknown isometry. The **Congruence** object compares $\kappa$, $\tau$ and finds $F$ from the Frenet frames at $s_0$; $F(\alpha)$ (dashed red) falls exactly on $\beta$. The check also computes the function $f$ of the proof.`,
    tryThis: [md`Change $s_0$ (the parameter where the frames are matched): the same isometry is found.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('s0', 2, 0.5, 9, 0.01);
        b.add('curveFromKT', 'beta', { kappa: '1 + 0.4*sin(s)', tau: '0.3 + 0.2*cos(s)', L: '10', p0: '(0, 0, 0)', dim: 3 }, { color: '#cf222e' });
        b.add('rotation', 'Cg', { axis: '(1, -2, 1)', angle: '2.4' }, { visible: false });
        b.add('translation', 'Tg', { a: '(-4, 3, 1)' }, { visible: false });
        b.add('composition', 'G', { F: 'Cg', G: 'Tg' }, { visible: false });
        b.add('isoImage', 'alpha', { F: 'G', X: 'beta' }, { caption: '\\alpha', color: '#0969da' });
        b.add('congruence', 'F', { alpha: 'alpha', beta: 'beta', t0: 's0' });
        b.add('isoImage', 'Fa', { F: 'F', X: 'alpha' }, { caption: 'F(\\alpha)', color: '#953800' });
        b.add('frenetFrame', 'Fa0', { curve: 'alpha', t0: 's0', along: false, n: 12 }, { caption: 'T_\\alpha, N_\\alpha, B_\\alpha' });
        b.add('frenetFrame', 'Fb0', { curve: 'beta', t0: 's0', along: false, n: 12 }, { caption: 'T_\\beta, N_\\beta, B_\\beta' });
        b.add('curvaturePlot', 'plot', { curve: 'alpha', kappa: true, tau: true, speed: false, ratio: false, marker: 's0' }, { caption: '\\alpha' });
      },
      select: 'F',
    },
    checks: [
      {
        label: md`\max_s \lVert F(\alpha(s)) - \beta(s) \rVert`,
        value: (s) => {
          const Fa = curve(s, 'Fa');
          const b = curve(s, 'beta');
          let m = 0;
          for (let i = 0; i <= 40; i++) {
            const t = (10 * i) / 40;
            m = Math.max(m, norm(sub(Fa.f(t), b.f(t))));
          }
          return m;
        },
        tol: 1e-3,
      },
      {
        label: md`f(s) = \bar T \bullet T_\beta + \bar N \bullet N_\beta + \bar B \bullet B_\beta \text{ at } s = 7`,
        value: (s) => {
          const A = frenetAt(curve(s, 'Fa'), 7);
          const B = frenetAt(curve(s, 'beta'), 7);
          return dot(A.T, B.T) + dot(A.N, B.N) + dot(A.B, B.B);
        },
        expect: 3,
        tol: 1e-4,
      },
    ],
  },
  {
    id: '3.5.4',
    statement: md`Consider the unit-speed curves $\alpha, \beta\colon \mathbf{R} \to \mathbf{R}^3$ with
$$\alpha(s) = \left(\cos\frac{s}{c},\ \sin\frac{s}{c},\ \frac{s}{c}\right), \qquad \beta(s) = \left(\cos\frac{s}{c},\ \sin\frac{s}{c},\ -\frac{s}{c}\right), \qquad c = \sqrt2.$$
They are obviously congruent by a reflection (Example [[3.4.3]]), but ignore this to illustrate the general method for computing the isometry.`,
    proof: md`By Example [[2.3.3]], $\kappa_\alpha = 1/2 = \kappa_\beta$ but $\tau_\alpha = 1/2 = -\tau_\beta$, so the theorem predicts congruence by an orientation-reversing isometry $F$. By its proof, $F$ must carry the Frenet frame
$$T_\alpha(0) = (0, a, a), \qquad N_\alpha(0) = (-1, 0, 0), \qquad B_\alpha(0) = (0, -a, a), \qquad a = 1/\sqrt2,$$
to the frame
$$T_\beta(0) = (0, a, -a), \qquad N_\beta(0) = (-1, 0, 0), \qquad -B_\beta(0) = (0, -a, -a),$$
where the minus sign produces orientation reversal (formulas from Example [[2.3.3]]). By the remark after Theorem [[3.2.3]], the orthogonal part of $F$ is $C = {}^t B A$, $A$ and $B$ being the attitude matrices of the two frames:
$$C = \begin{pmatrix} 0 & -1 & 0 \\ a & 0 & -a \\ -a & 0 & -a \end{pmatrix}\begin{pmatrix} 0 & a & a \\ -1 & 0 & 0 \\ 0 & -a & a \end{pmatrix} = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & -1 \end{pmatrix}.$$
Both frames are at $\alpha(0) = \beta(0) = (1, 0, 0)$, which $C$ does not move, so the translation part of $F$ is the identity. Thus, correctly, the reflection $F = C$ carries $\alpha$ to $\beta$.`,
    notes: md`From the viewpoint of Euclidean geometry two curves are "the same" if they differ by an isometry. The figure runs the same computation: the **Congruence** object matches the Frenet frames at $s = 0$ (with $-B_\beta$, since the torsions are opposite) and finds $C$; select it to read $C$ and its sign.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.add('curve', 'alpha', { comps: '(cos(s/sqrt(2)), sin(s/sqrt(2)), s/sqrt(2))', param: 's', a: '-9', b: '9', dim: 3 });
        b.add('curve', 'beta', { comps: '(cos(s/sqrt(2)), sin(s/sqrt(2)), -s/sqrt(2))', param: 's', a: '-9', b: '9', dim: 3 }, { color: '#cf222e' });
        b.add('frenetFrame', 'Fa', { curve: 'alpha', t0: '0', along: false, n: 12 }, { caption: 'T_\\alpha, N_\\alpha, B_\\alpha' });
        b.add('frenetFrame', 'Fb', { curve: 'beta', t0: '0', along: false, n: 12 }, { caption: 'T_\\beta, N_\\beta, B_\\beta' });
        b.add('congruence', 'F', { alpha: 'alpha', beta: 'beta', t0: '0' });
      },
      select: 'F',
    },
    checks: [
      {
        label: md`C - \operatorname{diag}(1, 1, -1)`,
        value: (s) => {
          const C = iso(s, 'F').C;
          return Math.max(...C.map((r, i) => Math.max(...r.map((x, j) => Math.abs(x - (i === j ? (i === 2 ? -1 : 1) : 0))))));
        },
      },
      { label: md`\text{translation part}`, value: (s) => norm(iso(s, 'F').a) },
      {
        label: md`\text{Frenet frames at } 0 - \text{book}`,
        value: (s) => {
          const a = Math.SQRT1_2;
          const A = frame(s, 'Fa').e;
          const B = frame(s, 'Fb').e;
          return Math.max(diff(A[0], [0, a, a]), diff(A[1], [-1, 0, 0]), diff(A[2], [0, -a, a]), diff(B[0], [0, a, -a]), diff(B[2].map((x) => -x), [0, -a, -a]));
        },
      },
    ],
  },
  {
    id: '3.5.5',
    statement: md`Let $\alpha$ be a unit-speed curve in $\mathbf{R}^3$. Then $\alpha$ is a helix if and only if both its curvature and torsion are nonzero constants.`,
    proof: md`For any numbers $a > 0$ and $b \ne 0$, let $\beta_{a,b}$ be the special helix of Example [[2.3.3]]. If $\alpha$ is congruent to $\beta_{a,b}$, then (changing the sign of $b$ if necessary) we may assume the isometry is orientation-preserving. Thus by Theorem [[3.4.2]], $\alpha$ has curvature and torsion
$$\kappa = \frac{a}{a^2 + b^2}, \qquad \tau = \frac{b}{a^2 + b^2}.$$
Conversely, suppose $\alpha$ has constant nonzero $\kappa$ and $\tau$. Solving the preceding equations,
$$a = \frac{\kappa}{\kappa^2 + \tau^2}, \qquad b = \frac{\tau}{\kappa^2 + \tau^2}.$$
Thus $\alpha$ and $\beta_{a,b}$ have the same curvature and torsion; hence (Theorem [[3.5.3]]) they are congruent. $\quad ∎$`,
    notes: md`So a **helix** is not just a curve spiraling around the $z$ axis as in Example [[2.3.3]], but any curve congruent to one of these special helices. In the figure, $\alpha$ is the curve with *constant* curvature $\kappa$ and torsion $\tau$ (sliders), obtained by solving the Frenet equations — it is a helix with some other axis. $\beta_{a,b}$ is the special helix with $a = \kappa/(\kappa^2 + \tau^2)$, $b = \tau/(\kappa^2 + \tau^2)$; the **Congruence** object finds the isometry, and $F(\alpha)$ lies on $\beta_{a,b}$.`,
    tryThis: [md`Move $\kappa$ and $\tau$ (keep them nonzero): $\alpha$ is always congruent to the computed $\beta_{a,b}$.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.slider('k', 0.5, 0.1, 1.5, 0.01, { caption: '\\kappa' });
        b.slider('t', 0.25, -1, 1, 0.01, { caption: '\\tau' });
        b.add('slider', 'a', { value: 'k/(k^2 + t^2)', min: 0, max: 10, step: 0.01 });
        b.add('slider', 'b', { value: 't/(k^2 + t^2)', min: -10, max: 10, step: 0.01 });
        b.add('slider', 'c', { value: 'sqrt(a^2 + b^2)', min: 0, max: 10, step: 0.01 });
        b.add('curveFromKT', 'alpha', { kappa: 'k', tau: 't', L: '14', p0: '(2, 2, 0)', dim: 3 });
        b.add('curve', 'beta', { comps: '(a*cos(s/c), a*sin(s/c), b*s/c)', param: 's', a: '0', b: '14', dim: 3 }, { caption: '\\beta_{a,b}', color: '#cf222e' });
        b.add('congruence', 'F', { alpha: 'alpha', beta: 'beta', t0: '1' });
        b.add('isoImage', 'Fa', { F: 'F', X: 'alpha' }, { caption: 'F(\\alpha)', color: '#953800' });
        b.add('curvaturePlot', 'plot', { curve: 'alpha', kappa: true, tau: true, speed: false, ratio: false, marker: '' }, { caption: '\\alpha' });
      },
      select: 'F',
    },
    checks: [
      {
        label: md`\max_s \lVert F(\alpha(s)) - \beta_{a,b}(s) \rVert`,
        value: (s) => {
          const Fa = curve(s, 'Fa');
          const b = curve(s, 'beta');
          let m = 0;
          for (let i = 0; i <= 28; i++) m = Math.max(m, norm(sub(Fa.f(i / 2), b.f(i / 2))));
          return m;
        },
        tol: 1e-3,
      },
    ],
  },
  {
    id: '3.5.6',
    statement: md`Let $\alpha, \beta\colon I \to \mathbf{R}^3$ be arbitrary-speed curves. If
$$v_\alpha = v_\beta > 0, \qquad \kappa_\alpha = \kappa_\beta > 0, \qquad \text{and} \qquad \tau_\alpha = \pm\tau_\beta,$$
then the curves $\alpha$ and $\beta$ are congruent.`,
    proof: md`Immediate: the data ensure that the unit-speed parametrizations of $\alpha$ and $\beta$ have the same curvature and torsion, hence are congruent ([[3.5.3]]). Then the original curves are congruent under the same isometry, since their speeds are the same. $\quad ∎$`,
    notes: md`The theory of curves presented so far applies only to regular curves with $\kappa > 0$, the only ones with a Frenet frame field; an arbitrary curve can be studied with an *arbitrary* frame field on it ([[3.5.7]]).

The figure: the 3-curve $\alpha(t) = (3t - t^3, 3t^2, 3t + t^3)$ of [[2.4.4]] and a curve $\beta$ given by its own formula — the **Congruence** object compares speed, curvature and torsion along the common interval (see its Course view) and builds the isometry.`,
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('curve', 'alpha', { comps: '(3*t - t^3, 3*t^2, 3*t + t^3)', param: 't', a: '-1.2', b: '1.2', dim: 3 });
        b.add('curve', 'beta', { comps: '(3*t^2 + 2, -(3*t - t^3), 3*t + t^3 - 1)', param: 't', a: '-1.2', b: '1.2', dim: 3 }, { color: '#cf222e' });
        b.add('congruence', 'F', { alpha: 'alpha', beta: 'beta', t0: '0.3' });
        b.add('isoImage', 'Fa', { F: 'F', X: 'alpha' }, { caption: 'F(\\alpha)', color: '#953800' });
        b.add('curvaturePlot', 'pa', { curve: 'alpha', kappa: true, tau: true, speed: true, ratio: false, marker: '' }, { caption: '\\alpha' });
      },
      select: 'F',
    },
    checks: [
      {
        label: md`\max_t \lVert F(\alpha(t)) - \beta(t) \rVert`,
        value: (s) => {
          const Fa = curve(s, 'Fa');
          const b = curve(s, 'beta');
          let m = 0;
          for (let i = 0; i <= 24; i++) {
            const t = -1.2 + (2.4 * i) / 24;
            m = Math.max(m, norm(sub(Fa.f(t), b.f(t))));
          }
          return m;
        },
      },
    ],
  },
  {
    id: '3.5.7',
    statement: md`Let $\alpha, \beta\colon I \to \mathbf{R}^3$ be curves defined on the same interval. Let $E_1, E_2, E_3$ be a frame field on $\alpha$, and $F_1, F_2, F_3$ a frame field on $\beta$. If

- (1) $\alpha' \bullet E_i = \beta' \bullet F_i$ $(1 \le i \le 3)$,
- (2) $E_i' \bullet E_j = F_i' \bullet F_j$ $(1 \le i, j \le 3)$,

then $\alpha$ and $\beta$ are congruent. Explicitly, for any $t_0$ in $I$, if $\mathbf{F}$ is the unique Euclidean isometry that sends each $E_i(t_0)$ to $F_i(t_0)$, then $\mathbf{F}(\alpha) = \beta$.`,
    proof: md`Let $\mathbf{F}$ be the specified isometry. Since $\mathbf{F}_*$ preserves dot products, $\bar E_i = \mathbf{F}_*(E_i)$ form a frame field on $\bar\alpha = \mathbf{F}(\alpha)$. Since $\mathbf{F}_*$ preserves velocities and derivatives of vector fields ([[1.7.7]], [[3.4.1]]), condition (1) gives
$$\bar\alpha(t_0) = \beta(t_0) \quad\text{and}\quad \bar\alpha' \bullet \bar E_i = \beta' \bullet F_i \quad (1 \le i \le 3). \qquad (*)$$
Similarly, condition (2) gives
$$\bar E_i(t_0) = F_i(t_0) \quad\text{and}\quad \bar E_i' \bullet \bar E_j = F_i' \bullet F_j \quad (1 \le i, j \le 3). \qquad (**)$$
By $(**)$, orthonormal expansion gives $\bar E_i' = \sum_j a_{ij}\bar E_j$ and $F_i' = \sum_j a_{ij}F_j$ with the *same* coefficient functions $a_{ij}$; and $a_{ij} + a_{ji} = 0$ (differentiate $\bar E_i \bullet \bar E_j = \delta_{ij}$), so $a_{ii} = 0$. Now let $f = \sum \bar E_i \bullet F_i$. As before $f(t_0) = 3$, and
$$f' = \sum \left(\bar E_i' \bullet F_i + \bar E_i \bullet F_i'\right) = \sum_{i,j} (a_{ij} + a_{ji})\,\bar E_j \bullet F_i = 0.$$
Thus each $\bar E_i \bullet F_i = 1$: $\bar E_i$ and $F_i$ are parallel at each point. By $(*)$ the same holds for
$$\bar\alpha' = \sum (\bar\alpha' \bullet \bar E_i)\bar E_i \quad\text{and}\quad \beta' = \sum (\beta' \bullet F_i)F_i.$$
Since $\bar\alpha(t_0) = \beta(t_0)$, Lemma [[3.5.2]] gives $\mathbf{F}(\alpha) = \bar\alpha = \beta$. $\quad ∎$`,
    notes: md`This generalization of [[3.5.3]] is needed later (surfaces). It works with *any* frame fields on the curves — no curvature hypothesis. In the figure, the frame field on each curve is its Frenet frame field (drawn along the curves); the checks verify conditions (1) and (2) numerically at a sample parameter, and that the isometry $\mathbf{F}$ carrying the frame at $t_0$ to the frame at $t_0$ maps $\alpha$ onto $\beta$.`,
    scene: {
      views: ['3d'],
      build: (b) => {
        b.slider('t0', 0.5, -1, 1, 0.01);
        b.add('curve', 'alpha', { comps: '(t, t^2, t^3)', param: 't', a: '-1.1', b: '1.1', dim: 3 });
        b.add('rotation', 'Cg', { axis: '(2, 1, -1)', angle: '1.9' }, { visible: false });
        b.add('translation', 'Tg', { a: '(2, -2, 1)' }, { visible: false });
        b.add('composition', 'G', { F: 'Cg', G: 'Tg' }, { visible: false });
        b.add('isoImage', 'beta', { F: 'G', X: 'alpha' }, { caption: '\\beta', color: '#cf222e' });
        b.add('frenetFrame', 'Ea', { curve: 'alpha', t0: 't0', along: true, n: 10 }, { label: false, caption: 'E_i' });
        b.add('frenetFrame', 'Fb', { curve: 'beta', t0: 't0', along: true, n: 10 }, { label: false, caption: 'F_i' });
        b.add('frenetFrame', 'E0', { curve: 'alpha', t0: 't0', along: false, n: 10 }, { caption: 'E_i(t_0)' });
        b.add('frenetFrame', 'F0', { curve: 'beta', t0: 't0', along: false, n: 10 }, { caption: 'F_i(t_0)' });
        b.add('isoFromFrames', 'F', { e: 'E0', f: 'F0' }, { caption: '\\mathbf{F}' });
        b.add('isoImage', 'Fa', { F: 'F', X: 'alpha' }, { caption: '\\mathbf{F}(\\alpha)', color: '#953800' });
      },
      select: 'F',
    },
    checks: [
      {
        label: md`(1)\ \max_i |\alpha' \bullet E_i - \beta' \bullet F_i| \text{ at } t = -0.6`,
        value: (s) => {
          const a = curve(s, 'alpha');
          const b = curve(s, 'beta');
          const A = frenetAt(a, -0.6);
          const B = frenetAt(b, -0.6);
          return Math.max(...[0, 1, 2].map((i) => Math.abs(dot(a.d1(-0.6), [A.T, A.N, A.B][i]) - dot(b.d1(-0.6), [B.T, B.N, B.B][i]))));
        },
      },
      {
        label: md`(2)\ \max_{ij} |E_i' \bullet E_j - F_i' \bullet F_j| \text{ at } t = -0.6`,
        value: (s) => {
          const a = curve(s, 'alpha');
          const b = curve(s, 'beta');
          const h = 1e-4;
          const fr = (c: typeof a, t: number) => {
            const F = frenetAt(c, t);
            return [F.T, F.N, F.B];
          };
          const der = (c: typeof a, t: number) => fr(c, t + h).map((e, i) => e.map((x, k) => (x - fr(c, t - h)[i][k]) / (2 * h)));
          const dA = der(a, -0.6);
          const dB = der(b, -0.6);
          const A0 = fr(a, -0.6);
          const B0 = fr(b, -0.6);
          let m = 0;
          for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) m = Math.max(m, Math.abs(dot(dA[i], A0[j]) - dot(dB[i], B0[j])));
          return m;
        },
        tol: 1e-4,
      },
      {
        label: md`\max_t \lVert \mathbf{F}(\alpha(t)) - \beta(t) \rVert`,
        value: (s) => {
          const Fa = curve(s, 'Fa');
          const b = curve(s, 'beta');
          let m = 0;
          for (let i = 0; i <= 20; i++) {
            const t = -1.1 + (2.2 * i) / 20;
            m = Math.max(m, norm(sub(Fa.f(t), b.f(t))));
          }
          return m;
        },
      },
    ],
  },
  {
    id: '3.5.8',
    statement: md`**Existence theorem for curves in $\mathbf{R}^3$.** Curvature and torsion tell whether two unit-speed curves are isometric, but they do more: *given any two continuous functions $\kappa > 0$ and $\tau$ on an interval $I$, there exists a unit-speed curve $\alpha\colon I \to \mathbf{R}^3$ that has these functions as its curvature and torsion.* (Any two such curves are congruent.) Thus the natural description of curves in $\mathbf{R}^3$ is devoid of geometry: a pair of real-valued functions.`,
    notes: md`The proof requires advanced methods (existence of solutions of the Frenet system of differential equations), so the book illustrates it by the corresponding result for **plane curves** (Exercises 7–10), simpler and with the advantage that the plane curvature $\tilde\kappa$ need not be positive.

The sandbox *constructs* such curves by solving the Frenet equations numerically (Runge–Kutta). The 3D view: $\kappa(s) = 1 + 0.5\sin s$, $\tau(s) = s/10$ — show the plot of $\kappa$, $\tau$ (click its dot in the Algebra view) to see that the computed curvature and torsion of the curve reproduce the given functions. The 2D view shows the plane curve with signed curvature $\tilde\kappa(s) = s/2$: a **clothoid** (Euler spiral), whose curvature grows linearly with arc length.`,
    tryThis: [md`Edit $\kappa(s)$ and $\tau(s)$ in the Algebra view (select $\gamma$): try $\kappa = 1$, $\tau = 0$ (a circle), then $\kappa = 1$, $\tau = 0.5$ (a helix).`, md`Try $\tilde\kappa(s) = \sin s$ or $\tilde\kappa = -1$ (a circle turning right) for the plane curve.`],
    scene: {
      views: ['3d', '2d'],
      build: (b) => {
        b.add('curveFromKT', 'gamma', { kappa: '1 + 0.5*sin(s)', tau: 's/10', L: '14', p0: '(0, 0, 0)', dim: 3 });
        b.add('curvaturePlot', 'plot', { curve: 'gamma', kappa: true, tau: true, speed: false, ratio: false, marker: '' }, { caption: '\\gamma', visible: false });
        b.add('curveFromKT', 'clo', { kappa: 's/2', tau: '0', L: '7', p0: '(0, 0)', dim: 2 }, { caption: '\\text{clothoid}', color: '#bf3989' });
      },
      select: 'gamma',
    },
    checks: [
      {
        label: md`\max_s |\kappa_{\text{computed}}(s) - (1 + 0.5\sin s)|`,
        value: (s) => {
          const c = curve(s, 'gamma');
          let m = 0;
          for (let i = 1; i < 28; i++) m = Math.max(m, Math.abs(frenetAt(c, i / 2).kappa - (1 + 0.5 * Math.sin(i / 2))));
          return m;
        },
        tol: 1e-3,
      },
      {
        label: md`\max_s |\tau_{\text{computed}}(s) - s/10|`,
        value: (s) => {
          const c = curve(s, 'gamma');
          let m = 0;
          for (let i = 1; i < 28; i++) m = Math.max(m, Math.abs(frenetAt(c, i / 2).tau - i / 20));
          return m;
        },
        tol: 1e-3,
      },
    ],
  },
];

