// Exercises of Chapter 2. Statements keep the book's numbering, data and notation (wording is ours);
// solutions are worked out in full and agree with the book's answers to the odd-numbered exercises.

import { exercises } from './exercises';
import { md } from './helpers';
import type { ExerciseSet } from './types';

export const EX2: ExerciseSet[] = [
  // §2.1 Dot Product
  exercises(2, 1, 50, [
    {
      statement: md`Let $\mathbf{v} = (1, 2, -1)$ and $\mathbf{w} = (-1, 0, 3)$ be tangent vectors at a point of $\mathbf{R}^3$. Compute:
(a) $\mathbf{v} \bullet \mathbf{w}$.
(b) $\mathbf{v} \times \mathbf{w}$.
(c) $\mathbf{v}/\lVert\mathbf{v}\rVert$, $\mathbf{w}/\lVert\mathbf{w}\rVert$.
(d) $\lVert\mathbf{v} \times \mathbf{w}\rVert$.
(e) the cosine of the angle between $\mathbf{v}$ and $\mathbf{w}$.`,
      solution: md`(a) $\mathbf{v} \bullet \mathbf{w} = -1 + 0 - 3 = -4$.

(b) By [[2.1.7]],
$$\mathbf{v} \times \mathbf{w} = \begin{vmatrix} U_1 & U_2 & U_3 \\ 1 & 2 & -1 \\ -1 & 0 & 3 \end{vmatrix} = (6 - 0,\ 1 - 3,\ 0 + 2) = (6, -2, 2).$$

(c) $\lVert\mathbf{v}\rVert = \sqrt6$ and $\lVert\mathbf{w}\rVert = \sqrt{10}$: the unit vectors are $(1, 2, -1)/\sqrt6$ and $(-1, 0, 3)/\sqrt{10}$.

(d) $\lVert\mathbf{v} \times \mathbf{w}\rVert = \sqrt{36 + 4 + 4} = 2\sqrt{11}$.

(e) $\cos\vartheta = \dfrac{\mathbf{v} \bullet \mathbf{w}}{\lVert\mathbf{v}\rVert\,\lVert\mathbf{w}\rVert} = \dfrac{-4}{\sqrt{60}} = -\dfrac{2}{\sqrt{15}}$.

Check: $\lVert\mathbf{v} \times \mathbf{w}\rVert^2 = 44 = 6 \cdot 10 - 16 = \lVert\mathbf{v}\rVert^2\lVert\mathbf{w}\rVert^2 - (\mathbf{v} \bullet \mathbf{w})^2$, as [[2.1.8]] predicts.`,
    },
    {
      statement: md`Prove that Euclidean distance has the properties
(a) $d(\mathbf{p}, \mathbf{q}) \ge 0$; $d(\mathbf{p}, \mathbf{q}) = 0$ if and only if $\mathbf{p} = \mathbf{q}$,
(b) $d(\mathbf{p}, \mathbf{q}) = d(\mathbf{q}, \mathbf{p})$,
(c) $d(\mathbf{p}, \mathbf{q}) + d(\mathbf{q}, \mathbf{r}) \ge d(\mathbf{p}, \mathbf{r})$, for any points $\mathbf{p}, \mathbf{q}, \mathbf{r}$ in $\mathbf{R}^3$.`,
      solution: md`By [[2.1.2]], $d(\mathbf{p}, \mathbf{q}) = \lVert\mathbf{p} - \mathbf{q}\rVert$.

(a) A norm is a nonnegative square root, and $\lVert\mathbf{a}\rVert^2 = \sum a_i^2 = 0$ only when every $a_i = 0$; so $d(\mathbf{p}, \mathbf{q}) = 0$ exactly when $\mathbf{p} - \mathbf{q} = \mathbf{0}$.

(b) $\lVert\mathbf{p} - \mathbf{q}\rVert = \lVert-(\mathbf{q} - \mathbf{p})\rVert = \lVert\mathbf{q} - \mathbf{p}\rVert$.

(c) It suffices to prove the triangle inequality $\lVert\mathbf{a} + \mathbf{b}\rVert \le \lVert\mathbf{a}\rVert + \lVert\mathbf{b}\rVert$ and apply it to $\mathbf{a} = \mathbf{p} - \mathbf{q}$, $\mathbf{b} = \mathbf{q} - \mathbf{r}$. By the Schwarz inequality $\mathbf{a} \bullet \mathbf{b} \le \lVert\mathbf{a}\rVert\,\lVert\mathbf{b}\rVert$,
$$\lVert\mathbf{a} + \mathbf{b}\rVert^2 = \lVert\mathbf{a}\rVert^2 + 2\,\mathbf{a} \bullet \mathbf{b} + \lVert\mathbf{b}\rVert^2 \le \big(\lVert\mathbf{a}\rVert + \lVert\mathbf{b}\rVert\big)^2.$$`,
    },
    {
      statement: md`Prove that the tangent vectors
$$\begin{gathered} \mathbf{e}_1 = \frac{(1, 2, 1)}{\sqrt6},\\ \mathbf{e}_2 = \frac{(-2, 0, 2)}{\sqrt8},\\ \mathbf{e}_3 = \frac{(1, -1, 1)}{\sqrt3} \end{gathered}$$
constitute a frame. Express $\mathbf{v} = (6, 1, -1)$ as a linear combination of these vectors. (Check the result by direct computation.)`,
      solution: md`Each is a unit vector ($6/6 = 8/8 = 3/3 = 1$), and they are mutually orthogonal: $(1, 2, 1)\bullet(-2, 0, 2) = 0$, $(1, 2, 1)\bullet(1, -1, 1) = 0$, $(-2, 0, 2)\bullet(1, -1, 1) = 0$. So they form a frame ([[2.1.4]]).

By the orthonormal expansion ([[2.1.5]]), $\mathbf{v} = \sum (\mathbf{v} \bullet \mathbf{e}_i)\,\mathbf{e}_i$ with
$$\begin{gathered} \mathbf{v} \bullet \mathbf{e}_1 = \frac{7}{\sqrt6},\\ \mathbf{v} \bullet \mathbf{e}_2 = -\frac{14}{\sqrt8},\\ \mathbf{v} \bullet \mathbf{e}_3 = \frac{4}{\sqrt3} \end{gathered}$$
so $\mathbf{v} = \dfrac{7}{\sqrt6}\,\mathbf{e}_1 - \dfrac{14}{\sqrt8}\,\mathbf{e}_2 + \dfrac{4}{\sqrt3}\,\mathbf{e}_3$.

Check: $\tfrac76(1, 2, 1) - \tfrac{14}{8}(-2, 0, 2) + \tfrac43(1, -1, 1) = \left(\tfrac76 + \tfrac72 + \tfrac43,\ \tfrac73 - \tfrac43,\ \tfrac76 - \tfrac72 + \tfrac43\right) = (6, 1, -1)$.`,
    },
    {
      statement: md`Let $\mathbf{u} = (u_1, u_2, u_3)$, $\mathbf{v} = (v_1, v_2, v_3)$, $\mathbf{w} = (w_1, w_2, w_3)$. Prove that
(a) $\mathbf{u} \bullet \mathbf{v} \times \mathbf{w} = \begin{vmatrix} u_1 & u_2 & u_3 \\ v_1 & v_2 & v_3 \\ w_1 & w_2 & w_3 \end{vmatrix}$.
(b) $\mathbf{u} \bullet \mathbf{v} \times \mathbf{w} \neq 0$ if and only if $\mathbf{u}, \mathbf{v}, \mathbf{w}$ are linearly independent.
(c) If any two vectors in $\mathbf{u} \bullet \mathbf{v} \times \mathbf{w}$ are reversed, the product changes sign.
(d) $\mathbf{u} \bullet \mathbf{v} \times \mathbf{w} = \mathbf{u} \times \mathbf{v} \bullet \mathbf{w}$.`,
      solution: md`(a) $\mathbf{v} \times \mathbf{w} = (v_2w_3 - v_3w_2,\ v_3w_1 - v_1w_3,\ v_1w_2 - v_2w_1)$, so $\mathbf{u} \bullet \mathbf{v} \times \mathbf{w} = u_1(v_2w_3 - v_3w_2) - u_2(v_1w_3 - v_3w_1) + u_3(v_1w_2 - v_2w_1)$, which is the expansion of the determinant along its first row.

(b) A determinant is nonzero if and only if its rows are linearly independent.

(c) Interchanging two rows changes the sign of a determinant.

(d) $\mathbf{u} \times \mathbf{v} \bullet \mathbf{w} = \mathbf{w} \bullet \mathbf{u} \times \mathbf{v}$ is the determinant with rows $\mathbf{w}, \mathbf{u}, \mathbf{v}$, obtained from rows $\mathbf{u}, \mathbf{v}, \mathbf{w}$ by two interchanges; so by (c) it equals $\mathbf{u} \bullet \mathbf{v} \times \mathbf{w}$.`,
    },
    {
      statement: md`Prove that $\mathbf{v} \times \mathbf{w} \neq 0$ if and only if $\mathbf{v}$ and $\mathbf{w}$ are linearly independent, and show that $\lVert\mathbf{v} \times \mathbf{w}\rVert$ is the area of the parallelogram with sides $\mathbf{v}$ and $\mathbf{w}$.`,
      solution: md`If $\mathbf{v}$ and $\mathbf{w}$ are linearly dependent, one is a multiple of the other, say $\mathbf{w} = c\mathbf{v}$; then $\mathbf{v} \times \mathbf{w} = c\,\mathbf{v} \times \mathbf{v} = 0$ (a determinant with two equal rows). Conversely, if $\mathbf{v} \times \mathbf{w} = 0$ then $\mathbf{u} \bullet \mathbf{v} \times \mathbf{w} = 0$ for *every* $\mathbf{u}$, so by [[ex:2.1.4]](b) no $\mathbf{u}$ makes $\mathbf{u}, \mathbf{v}, \mathbf{w}$ independent; if $\mathbf{v}, \mathbf{w}$ were independent we could choose $\mathbf{u}$ outside their plane. Hence $\mathbf{v}, \mathbf{w}$ are dependent.

Area: by [[2.1.8]], $\lVert\mathbf{v} \times \mathbf{w}\rVert^2 = \lVert\mathbf{v}\rVert^2\lVert\mathbf{w}\rVert^2 - (\mathbf{v} \bullet \mathbf{w})^2 = \lVert\mathbf{v}\rVert^2\lVert\mathbf{w}\rVert^2(1 - \cos^2\vartheta)$, so $\lVert\mathbf{v} \times \mathbf{w}\rVert = \lVert\mathbf{v}\rVert\,\lVert\mathbf{w}\rVert\sin\vartheta$ ($0 \le \vartheta \le \pi$). This is base $\lVert\mathbf{v}\rVert$ times height $\lVert\mathbf{w}\rVert\sin\vartheta$ of the parallelogram.`,
    },
    {
      statement: md`If $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ is a frame, show that
$$\mathbf{e}_1 \bullet \mathbf{e}_2 \times \mathbf{e}_3 = \pm1.$$
Deduce that any $3 \times 3$ orthogonal matrix has determinant $\pm1$.`,
      solution: md`By [[2.1.8]], $\mathbf{e}_2 \times \mathbf{e}_3$ is orthogonal to $\mathbf{e}_2$ and $\mathbf{e}_3$, and $\lVert\mathbf{e}_2 \times \mathbf{e}_3\rVert^2 = 1 \cdot 1 - 0 = 1$. The only unit vectors orthogonal to both $\mathbf{e}_2$ and $\mathbf{e}_3$ are $\pm\mathbf{e}_1$, so $\mathbf{e}_2 \times \mathbf{e}_3 = \pm\mathbf{e}_1$ and $\mathbf{e}_1 \bullet \mathbf{e}_2 \times \mathbf{e}_3 = \pm1$.

A $3 \times 3$ matrix $A$ is orthogonal when $A\,{}^tA = I$, i.e. its rows are orthonormal — they form a frame. By [[ex:2.1.4]](a), $\det A = \mathbf{e}_1 \bullet \mathbf{e}_2 \times \mathbf{e}_3 = \pm1$, where $\mathbf{e}_i$ are the rows.`,
    },
    {
      statement: md`If $\mathbf{u}$ is a unit vector, then the *component* of $\mathbf{v}$ in the $\mathbf{u}$ direction is
$$(\mathbf{v} \bullet \mathbf{u})\,\mathbf{u} = \lVert\mathbf{v}\rVert\cos\vartheta\,\mathbf{u}.$$
Show that $\mathbf{v}$ has a unique expression $\mathbf{v} = \mathbf{v}_1 + \mathbf{v}_2$, where $\mathbf{v}_1 \bullet \mathbf{v}_2 = 0$ and $\mathbf{v}_1$ is the component of $\mathbf{v}$ in the $\mathbf{u}$ direction.`,
      solution: md`Take $\mathbf{v}_1 = (\mathbf{v} \bullet \mathbf{u})\,\mathbf{u}$ and $\mathbf{v}_2 = \mathbf{v} - (\mathbf{v} \bullet \mathbf{u})\,\mathbf{u}$. Then $\mathbf{v}_2 \bullet \mathbf{u} = \mathbf{v} \bullet \mathbf{u} - (\mathbf{v} \bullet \mathbf{u})(\mathbf{u} \bullet \mathbf{u}) = 0$, hence $\mathbf{v}_1 \bullet \mathbf{v}_2 = 0$.

Uniqueness: $\mathbf{v}_1$ is prescribed, and then $\mathbf{v}_2 = \mathbf{v} - \mathbf{v}_1$. (More generally, if $\mathbf{v} = a\mathbf{u} + \mathbf{y}$ with $\mathbf{y} \bullet \mathbf{u} = 0$, dotting with $\mathbf{u}$ gives $a = \mathbf{v} \bullet \mathbf{u}$: the decomposition into a part along $\mathbf{u}$ and a part orthogonal to $\mathbf{u}$ is unique.)`,
    },
    {
      statement: md`Prove: the volume of the parallelepiped with sides $\mathbf{u}, \mathbf{v}, \mathbf{w}$ is $\pm\mathbf{u} \bullet \mathbf{v} \times \mathbf{w}$ (Fig. 2.5). (*Hint:* use the unit vector $\mathbf{e} = \mathbf{v} \times \mathbf{w}/\lVert\mathbf{v} \times \mathbf{w}\rVert$.)`,
      solution: md`If $\mathbf{v} \times \mathbf{w} = 0$, the base is degenerate ([[ex:2.1.5]]) and both sides are $0$. Otherwise take the parallelogram on $\mathbf{v}, \mathbf{w}$ as base: its area is $\lVert\mathbf{v} \times \mathbf{w}\rVert$ by [[ex:2.1.5]]. The unit vector $\mathbf{e}$ is orthogonal to the base, so the height is the length of the component of $\mathbf{u}$ along $\mathbf{e}$, namely $|\mathbf{u} \bullet \mathbf{e}|$ ([[ex:2.1.7]]). Hence
$$\text{volume} = \lVert\mathbf{v} \times \mathbf{w}\rVert\,\frac{|\mathbf{u} \bullet \mathbf{v} \times \mathbf{w}|}{\lVert\mathbf{v} \times \mathbf{w}\rVert} = |\mathbf{u} \bullet \mathbf{v} \times \mathbf{w}|.$$`,
    },
    {
      statement: md`Prove, using $\varepsilon$-neighborhoods, that each of the following subsets of $\mathbf{R}^3$ is open:
(a) All points $\mathbf{p}$ such that $\lVert\mathbf{p}\rVert < 1$.
(b) All $\mathbf{p}$ such that $p_3 > 0$. (*Hint:* $|p_i - q_i| \le d(\mathbf{p}, \mathbf{q})$.)`,
      solution: md`A set is open if each of its points has an $\varepsilon$-neighborhood $\{\mathbf{q} : d(\mathbf{p}, \mathbf{q}) < \varepsilon\}$ contained in it.

(a) Given $\lVert\mathbf{p}\rVert < 1$, let $\varepsilon = 1 - \lVert\mathbf{p}\rVert > 0$. If $d(\mathbf{p}, \mathbf{q}) < \varepsilon$, the triangle inequality ([[ex:2.1.2]]) gives $\lVert\mathbf{q}\rVert \le \lVert\mathbf{p}\rVert + \lVert\mathbf{q} - \mathbf{p}\rVert < \lVert\mathbf{p}\rVert + \varepsilon = 1$.

(b) Given $p_3 > 0$, let $\varepsilon = p_3$. If $d(\mathbf{p}, \mathbf{q}) < \varepsilon$ then $|p_3 - q_3| \le d(\mathbf{p}, \mathbf{q}) < p_3$, so $q_3 > 0$.`,
    },
    {
      statement: md`In each case, let $S$ be the set of all points $\mathbf{p}$ that satisfy the given condition. Describe $S$, and decide whether it is *open*.
(a) $p_1^2 + p_2^2 + p_3^2 = 1$.
(b) $p_3 \neq 0$.
(c) $p_1 = p_2 \neq p_3$.
(d) $p_1^2 + p_2^2 < 9$.`,
      solution: md`(a) The unit sphere centered at the origin. Not open: for $\mathbf{p} \in S$, the points $(1 + t)\mathbf{p}$, $t > 0$ small, are arbitrarily close to $\mathbf{p}$ but not in $S$.

(b) $\mathbf{R}^3$ with the $xy$ plane removed (two open half-spaces). Open: take $\varepsilon = |p_3|$ as in [[ex:2.1.9]](b).

(c) The plane $x = y$ with the line $x = y = z$ removed. Not open: $(p_1, p_2 + t, p_3)$ is not in $S$ for $t \neq 0$, however small.

(d) The inside of the circular cylinder of radius 3 about the $z$ axis. Open: with $\varepsilon = 3 - \sqrt{p_1^2 + p_2^2}$, if $d(\mathbf{p}, \mathbf{q}) < \varepsilon$ then $\sqrt{q_1^2 + q_2^2} \le \sqrt{p_1^2 + p_2^2} + \sqrt{(q_1 - p_1)^2 + (q_2 - p_2)^2} < 3$.`,
    },
    {
      statement: md`If $f$ is a differentiable function on $\mathbf{R}^3$, show that the gradient $\nabla f = \sum \dfrac{\partial f}{\partial x_i}\,U_i$ ([[ex:1.6.8]]) has the following properties:
(a) $\mathbf{v}[f] = (df)(\mathbf{v}) = \mathbf{v} \bullet (\nabla f)(\mathbf{p})$ for any tangent vector at $\mathbf{p}$.
(b) The norm $\lVert(\nabla f)(\mathbf{p})\rVert = \left[\sum (\partial f/\partial x_i)^2(\mathbf{p})\right]^{1/2}$ of $(\nabla f)(\mathbf{p})$ is the maximum of the directional derivatives $\mathbf{u}[f]$ for all *unit* vectors at $\mathbf{p}$. Furthermore, if $(\nabla f)(\mathbf{p}) \neq 0$, the unit vector for which the maximum occurs is $(\nabla f)(\mathbf{p})/\lVert(\nabla f)(\mathbf{p})\rVert$.

The notations $\operatorname{grad} f$, $\operatorname{curl} V$ and $\operatorname{div} V$ (in the exercise referred to) are often replaced by $\nabla f$, $\nabla \times V$ and $\nabla \bullet V$, respectively.`,
      solution: md`(a) $df(\mathbf{v}) = \mathbf{v}[f]$ by [[1.5.2]], and by [[1.3.2]] $\mathbf{v}[f] = \sum v_i\,\dfrac{\partial f}{\partial x_i}(\mathbf{p}) = \mathbf{v} \bullet (\nabla f)(\mathbf{p})$.

(b) For a unit vector $\mathbf{u}$ at $\mathbf{p}$, (a) and the Schwarz inequality give $\mathbf{u}[f] = \mathbf{u} \bullet (\nabla f)(\mathbf{p}) \le \lVert(\nabla f)(\mathbf{p})\rVert$. If $(\nabla f)(\mathbf{p}) = 0$ every directional derivative is $0$, which is the norm. Otherwise $\mathbf{u}_0 = (\nabla f)(\mathbf{p})/\lVert(\nabla f)(\mathbf{p})\rVert$ gives $\mathbf{u}_0[f] = \lVert(\nabla f)(\mathbf{p})\rVert$, so the maximum is attained there — and only there, since equality in the Schwarz inequality, $\mathbf{u} \bullet \mathbf{g} = \lVert\mathbf{u}\rVert\,\lVert\mathbf{g}\rVert$, forces $\mathbf{u}$ to be a positive multiple of $\mathbf{g}$.`,
    },
    {
      statement: md`*Angle functions.* Let $f$ and $g$ be differentiable real-valued functions on an interval $I$. Suppose that $f^2 + g^2 = 1$ and that $\vartheta_0$ is a number such that $f(0) = \cos\vartheta_0$, $g(0) = \sin\vartheta_0$. If $\vartheta$ is the function such that
$$\vartheta(t) = \vartheta_0 + \int_0^t (fg' - gf')\,du,$$
prove that $f = \cos\vartheta$, $g = \sin\vartheta$.

*Hint:* we want $(f - \cos\vartheta)^2 + (g - \sin\vartheta)^2 = 0$, so show that its derivative is zero.

The point of this exercise is that $\vartheta$ is a differentiable function, unambiguously defined on the whole interval $I$.`,
      solution: md`Differentiating $f^2 + g^2 = 1$ gives $ff' + gg' = 0$. Since $f^2 + g^2 = 1$,
$$F = (f - \cos\vartheta)^2 + (g - \sin\vartheta)^2 = 2 - 2(f\cos\vartheta + g\sin\vartheta).$$
With $\vartheta' = fg' - gf'$,
$$F' = -2\big[(f' + g\vartheta')\cos\vartheta + (g' - f\vartheta')\sin\vartheta\big].$$
Now, using $gg' = -ff'$ and $ff' = -gg'$,
$$\begin{gathered} f' + g\vartheta' = f' + fgg' - g^2f' = f'(1 - f^2 - g^2) = 0,\\ g' - f\vartheta' = g' - f^2g' + fgf' = g'(1 - f^2 - g^2) = 0. \end{gathered}$$
So $F' = 0$ on $I$, and $F(0) = 0$ by the choice of $\vartheta_0$. Hence $F = 0$ on the interval: $f = \cos\vartheta$ and $g = \sin\vartheta$.`,
    },
  ]),

  // §2.2 Curves
  exercises(2, 2, 57, [
    {
      statement: md`For the curve $\alpha(t) = (2t,\ t^2,\ t^3/3)$,
(a) find the velocity, speed, and acceleration for arbitrary $t$, and at $t = 1$;
(b) find the arc length function $s = s(t)$ (based at $t = 0$), and determine the arc length of $\alpha$ from $t = -1$ to $t = +1$.`,
      solution: md`(a) $\alpha'(t) = (2, 2t, t^2)$, speed $v(t) = \sqrt{4 + 4t^2 + t^4} = t^2 + 2$, acceleration $\alpha''(t) = (0, 2, 2t)$. At $t = 1$: velocity $(2, 2, 1)$ at $\alpha(1) = (2, 1, \tfrac13)$, speed $3$, acceleration $(0, 2, 2)$.

(b) $s(t) = \displaystyle\int_0^t (u^2 + 2)\,du = 2t + \frac{t^3}{3}$. The arc length from $-1$ to $1$ is $s(1) - s(-1) = \tfrac73 + \tfrac73 = \tfrac{14}{3}$.

In the sandbox: \`ArcLength(alpha, -1, 1)\` after \`alpha(t) = (2t, t^2, t^3/3)\`.`,
    },
    {
      statement: md`Show that a curve has constant speed if and only if its acceleration is everywhere orthogonal to its velocity.`,
      solution: md`$\dfrac{d}{dt}(\alpha' \bullet \alpha') = 2\,\alpha' \bullet \alpha''$. The speed $\lVert\alpha'\rVert$ is constant iff $\alpha' \bullet \alpha'$ is constant iff this derivative vanishes identically, that is, iff $\alpha'' \bullet \alpha' = 0$ everywhere.`,
    },
    {
      statement: md`Show that the curve $\alpha(t) = (\cosh t,\ \sinh t,\ t)$ has arc length function $s(t) = \sqrt2\sinh t$, and find a unit-speed reparametrization of $\alpha$.`,
      solution: md`$\alpha'(t) = (\sinh t, \cosh t, 1)$, so $\lVert\alpha'\rVert^2 = \sinh^2 t + \cosh^2 t + 1 = 2\cosh^2 t$ and the speed is $\sqrt2\cosh t$. Hence $s(t) = \int_0^t \sqrt2\cosh u\,du = \sqrt2\sinh t$.

The inverse function is $t(s) = \sinh^{-1}(s/\sqrt2)$, and $\cosh t(s) = \sqrt{1 + s^2/2}$. As in [[2.2.1]], $\beta(s) = \alpha(t(s))$:
$$\beta(s) = \left(\sqrt{1 + s^2/2},\ \frac{s}{\sqrt2},\ \sinh^{-1}\frac{s}{\sqrt2}\right).$$`,
    },
    {
      statement: md`Consider the curve $\alpha(t) = (2t,\ t^2,\ \log t)$ on $I\colon t > 0$. Show that this curve passes through the points $\mathbf{p} = (2, 1, 0)$ and $\mathbf{q} = (4, 4, \log 2)$, and find its arc length between these points.`,
      solution: md`$\alpha(1) = \mathbf{p}$ and $\alpha(2) = \mathbf{q}$. The velocity is $\alpha'(t) = (2, 2t, 1/t)$, and
$$\lVert\alpha'\rVert^2 = 4 + 4t^2 + \frac1{t^2} = \left(2t + \frac1t\right)^2.$$
So the arc length is $\displaystyle\int_1^2 \left(2t + \frac1t\right)dt = \big[t^2 + \log t\big]_1^2 = 3 + \log 2$.`,
    },
    {
      statement: md`Suppose that $\beta_1$ and $\beta_2$ are unit-speed reparametrizations of the same curve $\alpha$. Show that there is a number $s_0$ such that $\beta_2(s) = \beta_1(s + s_0)$ for all $s$. What is the geometric significance of $s_0$?`,
      solution: md`As in [[2.2.1]], the reparametrizations are orientation-preserving: $\beta_i = \alpha(h_i)$ with $h_i' > 0$. Let $s(t)$ be an arc length function of $\alpha$, so $s' = \lVert\alpha'\rVert$. By [[1.4.5]], $1 = \lVert\beta_i'\rVert = h_i'\,\lVert\alpha'(h_i)\rVert$, hence
$$\frac{d}{ds}\,s(h_i(s)) = s'(h_i(s))\,h_i'(s) = 1, \qquad\text{so}\quad s(h_i(s)) = s + c_i$$
for constants $c_i$. Since $s(t)$ is strictly increasing it has an inverse $t(s)$, and $h_i(s) = t(s + c_i)$. Therefore $\beta_2(s) = \alpha(t(s + c_2)) = \beta_1(s + c_2 - c_1)$: take $s_0 = c_2 - c_1$.

Geometrically, $\beta_2(0) = \beta_1(s_0)$: $s_0$ is the (signed) arc length along the curve from the starting point $\beta_1(0)$ of $\beta_1$ to the starting point $\beta_2(0)$ of $\beta_2$ — the two unit-speed parametrizations just measure arc length from different base points. (Allowing orientation-reversing reparametrizations, one gets also $\beta_2(s) = \beta_1(s_0 - s)$; see [[ex:2.3.7]].)`,
    },
    {
      statement: md`Let $Y$ be a vector field on the helix $\alpha(t) = (\cos t,\ \sin t,\ t)$. In each of the following cases, express $Y$ in the form $\sum y_iU_i$:
(a) $Y(t)$ is the vector from $\alpha(t)$ to the origin of $\mathbf{R}^3$.
(b) $Y(t) = \alpha'(t) - \alpha''(t)$.
(c) $Y(t)$ has unit length and is orthogonal to both $\alpha'(t)$ and $\alpha''(t)$.
(d) $Y(t)$ is the vector from $\alpha(t)$ to $\alpha(t + \pi)$.`,
      solution: md`Here $U_i$ stands for $U_i(\alpha(t))$, and $y_i$ are functions of $t$.

(a) $Y = -\alpha(t)$: $Y = -\cos t\,U_1 - \sin t\,U_2 - t\,U_3$.

(b) $\alpha' = (-\sin t, \cos t, 1)$ and $\alpha'' = (-\cos t, -\sin t, 0)$, so $Y = (\cos t - \sin t)\,U_1 + (\cos t + \sin t)\,U_2 + U_3$.

(c) $\alpha' \times \alpha'' = (\sin t, -\cos t, 1)$ has length $\sqrt2$, so $Y = \pm\dfrac{1}{\sqrt2}\big(\sin t\,U_1 - \cos t\,U_2 + U_3\big)$ (two continuous choices; in §2.3 this is $\pm B$).

(d) $\alpha(t + \pi) - \alpha(t) = (-2\cos t, -2\sin t, \pi)$, so $Y = -2\cos t\,U_1 - 2\sin t\,U_2 + \pi\,U_3$.`,
    },
    {
      statement: md`A reparametrization $\alpha(h)\colon [c, d] \to \mathbf{R}^3$ of a curve segment $\alpha\colon [a, b] \to \mathbf{R}^3$ is *monotone* provided either
(i) $h' \ge 0$, $h(c) = a$, $h(d) = b$, or
(ii) $h' \le 0$, $h(c) = b$, $h(d) = a$.
Prove that monotone reparametrization does not change arc length.`,
      solution: md`By [[1.4.5]], $\lVert\alpha(h)'(s)\rVert = |h'(s)|\,\lVert\alpha'(h(s))\rVert$. Use the change of variables $t = h(s)$.

Case (i): $|h'| = h'$, and $\displaystyle L(\alpha(h)) = \int_c^d \lVert\alpha'(h(s))\rVert\,h'(s)\,ds = \int_a^b \lVert\alpha'(t)\rVert\,dt = L(\alpha)$.

Case (ii): $|h'| = -h' \ge 0$, so
$$L(\alpha(h)) = \int_c^d \lVert\alpha'(h(s))\rVert\,(-h'(s))\,ds = -\int_b^a \lVert\alpha'(t)\rVert\,dt = \int_a^b \lVert\alpha'(t)\rVert\,dt = L(\alpha).$$`,
    },
    {
      statement: md`Let $Y$ be a vector field on a curve $\alpha$. If $\alpha(h)$ is a reparametrization of $\alpha$, show that the reparametrization $Y(h)$ is a vector field on $\alpha(h)$, and prove the chain rule $Y(h)' = h'\,Y'(h)$.`,
      solution: md`$Y(h)(s) = Y(h(s))$ is a tangent vector at $\alpha(h(s)) = \alpha(h)(s)$, so $Y(h)$ is a vector field on $\alpha(h)$ ([[2.2.2]]). Write $Y = \sum y_iU_i$; then $Y(h) = \sum y_i(h)\,U_i$, and its derivative is obtained by differentiating the Euclidean coordinates. By the ordinary chain rule,
$$Y(h)' = \sum \big(y_i(h)\big)'\,U_i = \sum h'\,y_i'(h)\,U_i = h'\,Y'(h).$$`,
    },
    {
      statement: md`(*Numerical integration.*) The curve segments
$$\begin{gathered} \alpha(t) = (\sin t,\ t^2\cos t,\ \sin 2t),\\ \beta(t) = \big(t^2\sin t,\ t^2,\ t^2(1 + \cos t)\big) \end{gathered}$$
defined on $0 \le t \le \pi$, run from the origin to $(0, \pi^2, 0)$. Which is shorter? (See Integration in the Appendix.)`,
      solution: md`The lengths are $L = \int_0^\pi \lVert\alpha'(t)\rVert\,dt$ with
$$\begin{gathered} \alpha' = \big(\cos t,\ 2t\cos t - t^2\sin t,\ 2\cos 2t\big),\\ \beta' = \big(2t\sin t + t^2\cos t,\ 2t,\ 2t(1 + \cos t) - t^2\sin t\big). \end{gathered}$$
These integrals have no elementary closed form; numerical integration (Simpson's rule) gives
$$L(\alpha) \approx 12.9153 < L(\beta) \approx 14.461,$$
so $\alpha$ is shorter. The book's answer prints $14.1438$ for $L(\beta)$; with the formula for $\beta$ as stated, direct integration gives $14.461$ — the conclusion is the same.

(As printed, $\alpha(\pi) = (0, -\pi^2, 0)$; changing the sign of the second coordinate of $\alpha$ makes it end at $(0, \pi^2, 0)$ without changing its length.) In the sandbox, \`ArcLength(alpha, 0, pi)\` computes these integrals.`,
    },
    {
      statement: md`Let $\alpha, \beta\colon I \to \mathbf{R}^3$ be curves such that $\alpha'(t)$ and $\beta'(t)$ are parallel (same Euclidean coordinates) at each $t$. Prove that $\alpha$ and $\beta$ are *parallel* in the sense that there is a point $\mathbf{p}$ in $\mathbf{R}^3$ such that $\beta(t) = \alpha(t) + \mathbf{p}$ for all $t$.`,
      solution: md`The curve $\gamma = \beta - \alpha$ (coordinatewise difference) has $\gamma' = \beta' - \alpha' = 0$, so each coordinate function of $\gamma$ has zero derivative on the interval $I$ and is constant. So $\gamma(t) = \mathbf{p}$ for a fixed point $\mathbf{p}$, i.e. $\beta(t) = \alpha(t) + \mathbf{p}$. (This is the first case of [[2.2.3]].)`,
    },
    {
      statement: md`Prove that a straight line is the shortest distance between two points in $\mathbf{R}^3$. Use the following scheme; let $\alpha\colon [a, b] \to \mathbf{R}^3$ be an arbitrary curve segment from $\mathbf{p} = \alpha(a)$ to $\mathbf{q} = \alpha(b)$. Let $\mathbf{u} = (\mathbf{q} - \mathbf{p})/\lVert\mathbf{q} - \mathbf{p}\rVert$.
(a) If $\sigma$ is a straight line segment from $\mathbf{p}$ to $\mathbf{q}$, say $\sigma(t) = (1 - t)\mathbf{p} + t\mathbf{q}$ $(0 \le t \le 1)$, show that $L(\sigma) = d(\mathbf{p}, \mathbf{q})$.
(b) From $\lVert\alpha'\rVert \ge \alpha' \bullet \mathbf{u}$, deduce $L(\alpha) \ge d(\mathbf{p}, \mathbf{q})$, where $L(\alpha)$ is the length of $\alpha$ and $d$ is Euclidean distance.
(c) Furthermore, show that if $L(\alpha) = d(\mathbf{p}, \mathbf{q})$, then (but for parametrization) $\alpha$ is a straight line segment. (*Hint:* write $\alpha' = (\alpha' \bullet \mathbf{u})\mathbf{u} + Y$, where $Y \bullet \mathbf{u} = 0$.)`,
      solution: md`(a) $\sigma' = \mathbf{q} - \mathbf{p}$ is constant, so $L(\sigma) = \int_0^1 \lVert\mathbf{q} - \mathbf{p}\rVert\,dt = d(\mathbf{p}, \mathbf{q})$.

(b) The Schwarz inequality with $\lVert\mathbf{u}\rVert = 1$ gives $\lVert\alpha'\rVert \ge \alpha' \bullet \mathbf{u}$. Since $\mathbf{u}$ is constant, $\alpha' \bullet \mathbf{u} = (\alpha \bullet \mathbf{u})'$, and
$$L(\alpha) = \int_a^b \lVert\alpha'\rVert\,dt \ge \int_a^b (\alpha \bullet \mathbf{u})'\,dt = (\mathbf{q} - \mathbf{p}) \bullet \mathbf{u} = \lVert\mathbf{q} - \mathbf{p}\rVert = d(\mathbf{p}, \mathbf{q}).$$

(c) If equality holds, $\int_a^b (\lVert\alpha'\rVert - \alpha' \bullet \mathbf{u})\,dt = 0$ with a continuous nonnegative integrand, so $\lVert\alpha'\rVert = \alpha' \bullet \mathbf{u}$ everywhere. Writing $\alpha' = (\alpha' \bullet \mathbf{u})\mathbf{u} + Y$ with $Y \bullet \mathbf{u} = 0$, we get $\lVert\alpha'\rVert^2 = (\alpha' \bullet \mathbf{u})^2 + \lVert Y\rVert^2$, hence $Y = 0$ and $\alpha' = f\mathbf{u}$ with $f = \alpha' \bullet \mathbf{u} \ge 0$. Integrating, $\alpha(t) = \mathbf{p} + \left(\int_a^t f\right)\mathbf{u}$: $\alpha$ runs monotonically along the segment from $\mathbf{p}$ to $\mathbf{q}$ — a (monotone) reparametrization of $\sigma$.`,
    },
  ]),

  // §2.3 The Frenet Formulas
  exercises(2, 3, 66, [
    {
      statement: md`Compute the *Frenet apparatus* $\kappa, \tau, T, N, B$ of the unit-speed curve $\beta(s) = \left(\tfrac45\cos s,\ 1 - \sin s,\ -\tfrac35\cos s\right)$. Show that this curve is a circle; find its center and radius.`,
      solution: md`$T = \beta' = \left(-\tfrac45\sin s,\ -\cos s,\ \tfrac35\sin s\right)$ (a unit vector: $\tfrac{16}{25}\sin^2 s + \cos^2 s + \tfrac{9}{25}\sin^2 s = 1$).

$T' = \left(-\tfrac45\cos s,\ \sin s,\ \tfrac35\cos s\right)$ has length $1$, so $\kappa = 1$ and $N = T'$.

$B = T \times N = \left(-\tfrac35,\ 0,\ -\tfrac45\right) = -(3, 0, 4)/5$, a constant; hence $B' = 0 = -\tau N$ and $\tau = 0$.

With $\kappa = 1$ and $\tau = 0$, [[2.3.6]] shows that $\beta$ is part of a circle of radius $1/\kappa = 1$ with center $\beta + \tfrac1\kappa N = \left(\tfrac45\cos s - \tfrac45\cos s,\ 1 - \sin s + \sin s,\ -\tfrac35\cos s + \tfrac35\cos s\right) = (0, 1, 0)$.`,
    },
    {
      statement: md`Consider the curve
$$\beta(s) = \left(\frac{(1 + s)^{3/2}}{3},\ \frac{(1 - s)^{3/2}}{3},\ \frac{s}{\sqrt2}\right)$$
defined on $I\colon -1 < s < 1$. Show that $\beta$ has unit speed, and compute its Frenet apparatus.`,
      solution: md`$T = \beta' = \left(\tfrac12\sqrt{1 + s},\ -\tfrac12\sqrt{1 - s},\ \tfrac1{\sqrt2}\right)$, and $\lVert T\rVert^2 = \tfrac{1 + s}{4} + \tfrac{1 - s}{4} + \tfrac12 = 1$: unit speed.

$T' = \left(\dfrac{1}{4\sqrt{1 + s}},\ \dfrac{1}{4\sqrt{1 - s}},\ 0\right)$, so $\kappa^2 = \dfrac1{16}\left(\dfrac1{1 + s} + \dfrac1{1 - s}\right) = \dfrac{1}{8(1 - s^2)}$ and
$$\begin{gathered} \kappa = \frac{1}{\sqrt{8(1 - s^2)}},\\ N = \frac{T'}{\kappa} = \left(\sqrt{\tfrac{1 - s}{2}},\ \sqrt{\tfrac{1 + s}{2}},\ 0\right). \end{gathered}$$

$B = T \times N = \left(-\tfrac12\sqrt{1 + s},\ \tfrac12\sqrt{1 - s},\ \tfrac1{\sqrt2}\right)$.

$B' = \left(-\dfrac{1}{4\sqrt{1 + s}},\ -\dfrac{1}{4\sqrt{1 - s}},\ 0\right) = -\tau N$ gives $\tau = \dfrac{1}{\sqrt{8(1 - s^2)}} = \kappa$.

(Since $\tau/\kappa = 1$ is constant, $\beta$ is a cylindrical helix — [[2.4.6]].)`,
    },
    {
      statement: md`For the helix in Example [[2.3.3]], check the Frenet formulas by direct substitution of the computed values of $\kappa, \tau, T, N, B$.`,
      solution: md`With $c = \sqrt{a^2 + b^2}$ and $\theta = s/c$, Example [[2.3.3]] gives
$$T = \tfrac1c(-a\sin\theta,\ a\cos\theta,\ b), \quad N = (-\cos\theta,\ -\sin\theta,\ 0), \quad B = \tfrac1c(b\sin\theta,\ -b\cos\theta,\ a), \quad \kappa = \tfrac{a}{c^2}, \quad \tau = \tfrac{b}{c^2}.$$
- $T' = \tfrac{a}{c^2}(-\cos\theta, -\sin\theta, 0) = \kappa N$.
- $N' = \tfrac1c(\sin\theta, -\cos\theta, 0)$, while $-\kappa T + \tau B = \tfrac{1}{c^3}\big((a^2 + b^2)\sin\theta,\ -(a^2 + b^2)\cos\theta,\ -ab + ab\big) = \tfrac1c(\sin\theta, -\cos\theta, 0)$.
- $B' = \tfrac{b}{c^2}(\cos\theta, \sin\theta, 0) = -\tau N$.`,
    },
    {
      statement: md`Prove that
$$\begin{gathered} T = N \times B = -B \times N,\\ N = B \times T = -T \times B,\\ B = T \times N = -N \times T. \end{gathered}$$
(A formal proof uses properties of the cross product established in the exercises of Section 1 — but one can recall these formulas by using the right-hand rule given at the end of that section.)`,
      solution: md`$B = T \times N$ is the definition. Since $T, N, B$ are orthonormal ([[2.3.1]]), $N \times B$ is a unit vector orthogonal to $N$ and $B$ ([[2.1.8]]), hence $N \times B = \pm T$; and by [[ex:2.1.4]](d),
$$T \bullet N \times B = T \times N \bullet B = B \bullet B = 1,$$
so $N \times B = T$. Likewise $B \times T = \pm N$ and $N \bullet B \times T = N \times B \bullet T = T \bullet T = 1$, so $B \times T = N$. The other forms follow from $\mathbf{v} \times \mathbf{w} = -\mathbf{w} \times \mathbf{v}$.`,
    },
    {
      statement: md`If $A$ is the vector field $\tau T + \kappa B$ on a unit-speed curve $\beta$, show that the Frenet formulas become
$$\begin{gathered} T' = A \times T,\\ N' = A \times N,\\ B' = A \times B. \end{gathered}$$`,
      solution: md`Using [[ex:2.3.4]] and $\mathbf{v} \times \mathbf{v} = 0$:
- $A \times T = \tau\,T \times T + \kappa\,B \times T = \kappa N = T'$;
- $A \times N = \tau\,T \times N + \kappa\,B \times N = \tau B - \kappa T = N'$;
- $A \times B = \tau\,T \times B + \kappa\,B \times B = -\tau N = B'$.

($A$ is the *Darboux vector*: the Frenet frame rotates about $A$ with angular speed $\lVert A\rVert = \sqrt{\kappa^2 + \tau^2}$.)`,
    },
    {
      statement: md`A unit-speed parametrization of a circle may be written
$$\gamma(s) = \mathbf{c} + r\cos\frac sr\,\mathbf{e}_1 + r\sin\frac sr\,\mathbf{e}_2,$$
where $\mathbf{e}_i \bullet \mathbf{e}_j = \delta_{ij}$. If $\beta$ is a unit-speed curve with $\kappa(0) > 0$, prove that there is one and only one circle $\gamma$ that approximates $\beta$ near $\beta(0)$ in the sense that
$$\begin{gathered} \gamma(0) = \beta(0),\\ \gamma'(0) = \beta'(0),\\ \gamma''(0) = \beta''(0). \end{gathered}$$
Show that $\gamma$ lies in the osculating plane of $\beta$ at $\beta(0)$ and find its center $\mathbf{c}$ and radius $r$ (see Fig. 2.13). The circle $\gamma$ is called the *osculating circle* and $\mathbf{c}$ the *center of curvature* of $\beta$ at $\beta(0)$. (The same results hold when $0$ is replaced by any number $s$.)`,
      solution: md`For $\gamma$ as given, $\gamma(0) = \mathbf{c} + r\mathbf{e}_1$, $\gamma'(0) = \mathbf{e}_2$, $\gamma''(0) = -\tfrac1r\,\mathbf{e}_1$. The three conditions become
$$\begin{gathered} \mathbf{e}_2 = T(0),\\ -\tfrac1r\,\mathbf{e}_1 = \beta''(0) = \kappa(0)N(0),\\ \mathbf{c} + r\mathbf{e}_1 = \beta(0). \end{gathered}$$
Since $\mathbf{e}_1$ and $N(0)$ are unit vectors and $r > 0$, the second forces $r = 1/\kappa(0)$ and $\mathbf{e}_1 = -N(0)$; then $\mathbf{c} = \beta(0) + \dfrac{1}{\kappa(0)}\,N(0)$. So exactly one circle satisfies the conditions: center $\mathbf{c} = \beta(0) + N(0)/\kappa(0)$, radius $r = 1/\kappa(0)$.

Its points $\gamma(s) = \beta(0) + \tfrac1{\kappa(0)}\big(1 - \cos(\kappa(0)s)\big)N(0) + \tfrac1{\kappa(0)}\sin(\kappa(0)s)\,T(0)$ lie in the plane through $\beta(0)$ spanned by $T(0)$ and $N(0)$ — the osculating plane.

The sandbox draws it: *Osculating circle* tool, or \`OsculatingCircle(beta, s0)\` in the command bar.`,
    },
    {
      statement: md`If $\alpha$ and a reparametrization $\bar\alpha = \alpha(h)$ are both unit-speed curves, show that
(a) $h(s) = \pm s + s_0$ for some number $s_0$;
(b) $\bar T = \pm T(h)$, $\bar N = N(h)$, $\bar\kappa = \kappa(h)$, $\bar\tau = \tau(h)$, $\bar B = \pm B(h)$,
where the sign $(\pm)$ is the same as that in (a), and we assume $\kappa > 0$. Thus even in the orientation-reversing case, the principal normals $N$ and $\bar N$ still point in the same direction.`,
      solution: md`(a) $1 = \lVert\bar\alpha'\rVert = |h'|\,\lVert\alpha'(h)\rVert = |h'|$ ([[1.4.5]]). As $h'$ is continuous, it is constantly $1$ or constantly $-1$ on the interval; so $h(s) = \varepsilon s + s_0$ with $\varepsilon = \pm1$.

(b) $\bar T = \bar\alpha' = h'\,\alpha'(h) = \varepsilon\,T(h)$. Differentiating (chain rule, [[ex:2.2.8]]): $\bar T' = \varepsilon h'\,T'(h) = \varepsilon^2\,T'(h) = \kappa(h)N(h)$. Hence $\bar\kappa = \lVert\bar T'\rVert = \kappa(h)$ and $\bar N = \bar T'/\bar\kappa = N(h)$. Then $\bar B = \bar T \times \bar N = \varepsilon\,B(h)$, and $\bar B' = \varepsilon h'\,B'(h) = B'(h) = -\tau(h)N(h) = -\tau(h)\bar N$, so $\bar\tau = \tau(h)$.`,
    },
    {
      statement: md`*Curves in the plane.* For a unit-speed curve $\beta(s) = (x(s), y(s))$ in $\mathbf{R}^2$, the *unit tangent* is $T = \beta' = (x', y')$ as usual, but the *unit normal* $N$ is defined by rotating $T$ through $+90°$, so $N = (-y', x')$. Thus $T'$ and $N$ are collinear, and the *plane curvature* $\tilde\kappa$ of $\beta$ is defined by the Frenet equation $T' = \tilde\kappa N$.
(a) Prove that $\tilde\kappa = T' \bullet N$ and $N' = -\tilde\kappa T$.
(b) The *slope angle* $\varphi(s)$ of $\beta$ is the differentiable function such that $T = (\cos\varphi, \sin\varphi) = \cos\varphi\,U_x + \sin\varphi\,U_y$. (The existence of $\varphi$ derives from [[ex:2.1.12]].) Show that $\tilde\kappa = \varphi'$.
(c) Find the curvature $\tilde\kappa$ of the following plane curves. (i) $\left(r\cos\frac tr,\ r\sin\frac tr\right)$, counterclockwise circle. (ii) $\left(r\cos\left(-\frac tr\right),\ r\sin\left(-\frac tr\right)\right)$, clockwise circle.
(d) Show that if $\tilde\kappa$ does not change sign, then $|\tilde\kappa|$ is the usual $\mathbf{R}^3$ curvature $\kappa$. (For such comparisons we can always regard $\mathbf{R}^2$ as, say, the $xy$ plane in $\mathbf{R}^3$.)`,
      solution: md`(a) $T \bullet T = 1$ gives $T' \bullet T = 0$; in the plane, the vectors orthogonal to $T$ are the multiples of $N$, so $T' = (T' \bullet N)N$ and $\tilde\kappa = T' \bullet N$. Similarly $N \bullet N = 1$ gives $N' = (N' \bullet T)T$, and differentiating $T \bullet N = 0$ gives $N' \bullet T = -T' \bullet N = -\tilde\kappa$. Hence $N' = -\tilde\kappa T$.

(b) $T' = \varphi'(-\sin\varphi, \cos\varphi) = \varphi' N$, so $\tilde\kappa = \varphi'$.

(c) (i) $T = (-\sin\frac tr, \cos\frac tr) = (\cos\varphi, \sin\varphi)$ with $\varphi = \frac tr + \frac\pi2$, so $\tilde\kappa = 1/r$. (ii) $T = (\sin(-\frac tr), -\cos(-\frac tr))$, with $\varphi = -\frac tr - \frac\pi2$, so $\tilde\kappa = -1/r$. The sign records the sense of turning.

(d) Regard $\beta$ as a curve in the $xy$ plane of $\mathbf{R}^3$. Its curvature is $\kappa = \lVert T'\rVert = \lVert\tilde\kappa N\rVert = |\tilde\kappa|$. Where $\tilde\kappa > 0$ the Frenet normal is the rotated $N$, where $\tilde\kappa < 0$ it is $-N$; this is why the sign must not change for the two Frenet frames to correspond continuously.

The sandbox plots $\tilde\kappa$ for plane curves: \`PlotCurvature(beta)\` in the 2D view.`,
    },
    {
      statement: md`Let $\tilde\beta$ be the Frenet approximation of a unit-speed curve $\beta$ with $\tau \neq 0$ near $s = 0$.

If, say, the $B_0$ component of $\tilde\beta$ is removed, the resulting curve is the *orthogonal projection* of $\tilde\beta$ in the $T_0N_0$ plane. It is the view of $\beta \approx \tilde\beta$ that one gets by looking toward $\beta(0) = \tilde\beta(0)$ directly along the vector $B_0$.

Sketch the general shape of the orthogonal projections of $\tilde\beta$ near $s = 0$ in each of the planes $T_0N_0$ (*osculating plane*), $T_0B_0$ (*rectifying plane*), and $N_0B_0$ (*normal plane*). These views of $\beta \approx \tilde\beta$ can be confirmed experimentally using a bent piece of wire. For computer views, see [[ex:2.4.15]].`,
      solution: md`From [[2.3.4]], $\tilde\beta(s) = \beta(0) + s\,T_0 + \kappa_0\dfrac{s^2}{2}\,N_0 + \kappa_0\tau_0\dfrac{s^3}{6}\,B_0$. In each plane, take the two remaining coefficients as coordinates:
- Osculating plane $T_0N_0$: $\left(s,\ \kappa_0 s^2/2\right)$ — a parabola, tangent to $T_0$ and bending toward $N_0$.
- Rectifying plane $T_0B_0$: $\left(s,\ \kappa_0\tau_0 s^3/6\right)$ — the shape of $y = \pm x^3$: an inflection at $\beta(0)$, crossing from one side to the other, with the sign of $\tau_0$.
- Normal plane $N_0B_0$: $\left(\kappa_0 s^2/2,\ \kappa_0\tau_0 s^3/6\right)$ — a cusp (semicubical parabola) $y^2 = \dfrac{2\tau_0^2}{9\kappa_0}x^3$ pointing back along $-N_0$.

The figure of [[2.3.4]] draws $\tilde\beta$ next to $\beta$; rotating the 3D view to look along $B_0$, $N_0$ or $T_0$ shows the three projections.`,
    },
    {
      statement: md`*Spherical curves.* Let $\alpha$ be a unit-speed curve with $\kappa > 0$, $\tau \neq 0$.
(a) If $\alpha$ lies on a sphere of center $\mathbf{c}$ and radius $r$, show that $\alpha - \mathbf{c} = -\rho N - \rho'\sigma B$, where $\rho = 1/\kappa$ and $\sigma = 1/\tau$. Thus $r^2 = \rho^2 + (\rho'\sigma)^2$.
(b) Conversely, if $\rho^2 + (\rho'\sigma)^2$ has constant value $r^2$ and $\rho' \neq 0$, show that $\alpha$ lies on a sphere of radius $r$.
(*Hint:* for (b), show that the "center curve" $\gamma = \alpha + \rho N + \rho'\sigma B$ — suggested by (a) — is constant.)`,
      solution: md`(a) Differentiate $(\alpha - \mathbf{c}) \bullet (\alpha - \mathbf{c}) = r^2$ repeatedly, using the Frenet formulas:
- $T \bullet (\alpha - \mathbf{c}) = 0$;
- then $\kappa N \bullet (\alpha - \mathbf{c}) + T \bullet T = 0$, so $N \bullet (\alpha - \mathbf{c}) = -\rho$;
- then $(-\kappa T + \tau B) \bullet (\alpha - \mathbf{c}) + N \bullet T = -\rho'$, so $B \bullet (\alpha - \mathbf{c}) = -\rho'\sigma$.

By the orthonormal expansion ([[2.1.5]]), $\alpha - \mathbf{c} = -\rho N - \rho'\sigma B$, and $r^2 = \lVert\alpha - \mathbf{c}\rVert^2 = \rho^2 + (\rho'\sigma)^2$.

(b) With $\rho\kappa = 1$ and $\sigma\tau = 1$,
$$\gamma' = T + \rho'N + \rho(-\kappa T + \tau B) + (\rho'\sigma)'B + \rho'\sigma(-\tau N) = \big(\rho\tau + (\rho'\sigma)'\big)B.$$
Differentiating $\rho^2 + (\rho'\sigma)^2 = r^2$ gives $2\rho\rho' + 2(\rho'\sigma)(\rho'\sigma)' = 0$; dividing by $\rho'\sigma \neq 0$, $\rho\tau + (\rho'\sigma)' = 0$. So $\gamma' = 0$ and $\gamma = \mathbf{c}$ is a constant point, and $\lVert\alpha - \mathbf{c}\rVert^2 = \lVert\rho N + \rho'\sigma B\rVert^2 = r^2$: $\alpha$ lies on the sphere of center $\mathbf{c}$ and radius $r$.`,
    },
    {
      statement: md`Let $\beta, \bar\beta\colon I \to \mathbf{R}^3$ be unit-speed curves with nonvanishing curvature and torsion. If $T = \bar T$, then $\beta$ and $\bar\beta$ are parallel ([[ex:2.2.10]]). If $B = \bar B$, prove that $\bar\beta$ is parallel to either $\beta$ or the curve $s \mapsto -\beta(s)$.`,
      solution: md`Differentiate $B = \bar B$: $-\tau N = -\bar\tau\bar N$. Both $N$ and $\bar N$ are unit vectors and $\tau, \bar\tau \neq 0$, so $\bar N = \varepsilon N$ with $\varepsilon = \pm1$ (and $\bar\tau = \varepsilon\tau$). The function $\varepsilon = \bar N \bullet N$ is continuous with values $\pm1$, hence constant on $I$. By [[ex:2.3.4]],
$$\bar T = \bar N \times \bar B = \varepsilon\,N \times B = \varepsilon T.$$
If $\varepsilon = 1$, $\bar\beta' = \beta'$ and $\bar\beta$ is parallel to $\beta$. If $\varepsilon = -1$, $\bar\beta' = -\beta' = (-\beta)'$ and $\bar\beta$ is parallel to $s \mapsto -\beta(s)$ ([[ex:2.2.10]]).`,
    },
  ]),
  // §2.4 Arbitrary-Speed Curves
  exercises(
    2,
    4,
    77,
    [
      {
        statement: md`For the curve $\alpha(t) = (2t,\ t^2,\ t^3/3)$,
(a) Compute the Frenet apparatus.
(b) Sketch the curve for $-4 \le t \le 4$, showing $T, N, B$ at $t = 2$.
(c) Find the limiting values of $T$, $N$ and $B$ as $t \to -\infty$ and $t \to \infty$.`,
        solution: md`(a) Let $f = t^2 + 2$. Then $\alpha' = (2, 2t, t^2)$, $v = f$, $\alpha'' = (0, 2, 2t)$, $\alpha''' = (0, 0, 2)$ and $\alpha' \times \alpha'' = 2(t^2, -2t, 2)$, of length $2f$. By [[2.4.3]]:
$$T = \frac{(2,\ 2t,\ t^2)}{f}, \quad B = \frac{\alpha' \times \alpha''}{\lVert\alpha' \times \alpha''\rVert} = \frac{(t^2,\ -2t,\ 2)}{f}, \quad N = B \times T = \frac{(-2t,\ 2 - t^2,\ 2t)}{f},$$
$$\begin{gathered} \kappa = \frac{\lVert\alpha' \times \alpha''\rVert}{v^3} = \frac{2}{f^2},\\ \tau = \frac{\alpha' \times \alpha'' \bullet \alpha'''}{\lVert\alpha' \times \alpha''\rVert^2} = \frac{8}{4f^2} = \frac{2}{f^2}. \end{gathered}$$

(b) At $t = 2$: $\alpha(2) = (4, 4, \tfrac83)$, $f = 6$, $T = \tfrac13(1, 2, 2)$, $N = \tfrac13(-2, -1, 2)$, $B = \tfrac13(2, -2, 1)$. In the sandbox: \`alpha(t) = (2t, t^2, t^3/3)\`, then \`Frenet(alpha, 2)\`.

(c) Dividing by $t^2$: as $t \to \pm\infty$, $T \to (0, 0, 1)$, $N \to (0, -1, 0)$, $B \to (1, 0, 0)$ — natural unit vectors, the same at both ends.`,
      },
      {
        statement: md`Express the curvature and torsion of the curve $\alpha(t) = (\cosh t,\ \sinh t,\ t)$ in terms of arc length $s$ measured from $t = 0$.`,
        solution: md`$\alpha' = (\sinh t, \cosh t, 1)$, $v = \sqrt2\cosh t$, $\alpha'' = (\cosh t, \sinh t, 0)$, $\alpha''' = (\sinh t, \cosh t, 0)$, and $\alpha' \times \alpha'' = (-\sinh t, \cosh t, -1)$, of length $\sqrt2\cosh t$. So
$$\begin{gathered} \kappa = \frac{\sqrt2\cosh t}{2\sqrt2\cosh^3 t} = \frac{1}{2\cosh^2 t},\\ \tau = \frac{\cosh^2 t - \sinh^2 t}{2\cosh^2 t} = \frac{1}{2\cosh^2 t}. \end{gathered}$$
By [[ex:2.2.3]], $s = \sqrt2\sinh t$, so $\cosh^2 t = 1 + s^2/2$ and
$$\kappa = \tau = \frac{1}{2 + s^2}.$$`,
      },
      {
        statement: md`The curve $\alpha(t) = (t\cos t,\ t\sin t,\ t)$ lies on a double cone and passes through the vertex at $t = 0$.
(a) Find the Frenet apparatus of $\alpha$ at $t = 0$.
(b) Sketch the curve for $-2\pi \le t \le 2\pi$, showing $T, N, B$ at $t = 0$.`,
        solution: md`(a) $\alpha' = (\cos t - t\sin t,\ \sin t + t\cos t,\ 1)$, $\alpha'' = (-2\sin t - t\cos t,\ 2\cos t - t\sin t,\ 0)$, $\alpha''' = (-3\cos t + t\sin t,\ -3\sin t - t\cos t,\ 0)$. At $t = 0$: $\alpha' = (1, 0, 1)$, $v = \sqrt2$, $\alpha'' = (0, 2, 0)$, $\alpha''' = (-3, 0, 0)$, and $\alpha' \times \alpha'' = (-2, 0, 2)$. So
$$T = \tfrac{1}{\sqrt2}(1, 0, 1), \quad N = (0, 1, 0), \quad B = \tfrac{1}{\sqrt2}(-1, 0, 1), \quad \kappa(0) = \frac{2\sqrt2}{2\sqrt2} = 1, \quad \tau(0) = \frac{6}{8} = \frac34.$$
(The book's answer prints $N = (0, -1, 0)$; for the curve as stated, $\alpha(t) \approx (t, t^2, t)$ near $t = 0$ bends toward $+y$, so $N(0) = (0, 1, 0)$.)

(b) The curve lies on the cone $x^2 + y^2 = z^2$, spiraling through the vertex at the origin from the lower nappe to the upper one. In the sandbox: \`alpha(t) = (t*cos(t), t*sin(t), t)\` (set its interval to $[-2\pi, 2\pi]$ in the Algebra view), then \`Frenet(alpha, 0)\`.`,
      },
      {
        statement: md`Show that the curvature of a regular curve in $\mathbf{R}^3$ is given by
$$\kappa^2v^4 = \lVert\alpha''\rVert^2 - (dv/dt)^2.$$`,
        solution: md`By [[2.4.2]], $\alpha'' = \dfrac{dv}{dt}\,T + \kappa v^2\,N$ with $T, N$ orthonormal. Hence $\lVert\alpha''\rVert^2 = (dv/dt)^2 + \kappa^2v^4$.`,
      },
      {
        statement: md`If $\alpha$ is a curve with constant speed $c > 0$, show that
$$T = \alpha'/c, \quad N = \alpha''/\lVert\alpha''\rVert, \quad B = \alpha' \times \alpha''/(c\lVert\alpha''\rVert), \quad \kappa = \frac{\lVert\alpha''\rVert}{c^2}, \quad \tau = \frac{\alpha' \times \alpha'' \bullet \alpha'''}{c^2\lVert\alpha''\rVert^2},$$
where for $N$, $B$, $\tau$ we assume $\alpha''$ never zero, that is, $\kappa > 0$.`,
        solution: md`With $v = c$ constant, $dv/dt = 0$ and [[2.4.2]] gives $\alpha' = cT$ and $\alpha'' = \kappa c^2N$. Hence $T = \alpha'/c$, $\kappa = \lVert\alpha''\rVert/c^2$ and $N = \alpha''/\lVert\alpha''\rVert$. Then $B = T \times N = \alpha' \times \alpha''/(c\lVert\alpha''\rVert)$. Finally, $\alpha' \perp \alpha''$ ([[ex:2.2.2]]), so $\lVert\alpha' \times \alpha''\rVert = c\lVert\alpha''\rVert$ and the torsion formula of [[2.4.3]] becomes $\tau = \alpha' \times \alpha'' \bullet \alpha'''/(c^2\lVert\alpha''\rVert^2)$.`,
      },
      {
        statement: md`(a) If $\alpha$ is a cylindrical helix, prove that its unit vector $\mathbf{u}$ ([[2.4.6]]) is
$$\mathbf{u} = \frac{\tau}{\sqrt{\kappa^2 + \tau^2}}\,T + \frac{\kappa}{\sqrt{\kappa^2 + \tau^2}}\,B,$$
and the coefficients here are $\cos\vartheta$ and $\sin\vartheta$ (for $\vartheta$ as in [[2.4.5]]).
(b) Check (a) for the cylindrical helix in Example [[1.4.2]] of Chapter 1.`,
        solution: md`(a) Take $\alpha$ unit-speed. Differentiating $T \bullet \mathbf{u} = \cos\vartheta$ gives $\kappa N \bullet \mathbf{u} = 0$, so $\mathbf{u} = \cos\vartheta\,T + b\,B$ with $b = \pm\sin\vartheta$. Since $\mathbf{u}$ is constant, $0 = \mathbf{u}' = (\kappa\cos\vartheta - \tau b)N$, so $\tau b = \kappa\cos\vartheta$. Together with $\cos^2\vartheta + b^2 = 1$ this gives
$$\begin{gathered} \cos\vartheta = \frac{\pm\tau}{\sqrt{\kappa^2 + \tau^2}},\\ b = \frac{\pm\kappa}{\sqrt{\kappa^2 + \tau^2}} \end{gathered}$$
with the same sign. Choosing the direction of $\mathbf{u}$ so the sign is $+$ (as in the proof of [[2.4.6]], where $\mathbf{u} = \cos\vartheta\,T + \sin\vartheta\,B$ and $\cot\vartheta = \tau/\kappa$), $\mathbf{u} = (\tau T + \kappa B)/\sqrt{\kappa^2 + \tau^2}$. It is the normalized Darboux vector of [[ex:2.3.5]].

(b) For the helix (2), $\alpha(t) = (a\cos t, a\sin t, bt)$, Example [[2.3.3]] gives (with $c = \sqrt{a^2 + b^2}$) $\kappa = a/c^2$, $\tau = b/c^2$, and
$$\frac{bT + aB}{c} = \frac{1}{c^2}\big(-ab\sin + ab\sin,\ ab\cos - ab\cos,\ b^2 + a^2\big) = (0, 0, 1) = U_3.$$
For the curve (4), $\alpha(t) = (e^t, e^{-t}, \sqrt2\,t)$: $v = e^t + e^{-t}$, $\alpha' \times \alpha'' = (-\sqrt2 e^{-t}, \sqrt2 e^t, 2)$, so $\kappa = \sqrt2/v^2$, $\tau = -\sqrt2/v^2$, $T = (e^t, -e^{-t}, \sqrt2)/v$, $B = (-e^{-t}, e^t, \sqrt2)/v$. Then
$$\mathbf{u} = \frac{-T + B}{\sqrt2} = \frac{(-e^t - e^{-t},\ e^t + e^{-t},\ 0)}{\sqrt2\,v} = \frac{(-1, 1, 0)}{\sqrt2},$$
constant indeed, with $\cot\vartheta = \tau/\kappa = -1$, $\vartheta = 3\pi/4$, and $T \bullet \mathbf{u} = -1/\sqrt2 = \cos\vartheta$. (This curve lies on a cylinder with horizontal rulings: in the plane of $(1, 1, 0)/\sqrt2$ and $U_3$ its cross-section is the catenary $(\sqrt2\cosh t, \sqrt2\,t)$.)`,
      },
      {
        statement: md`Let $\alpha\colon I \to \mathbf{R}^3$ be a cylindrical helix with unit vector $\mathbf{u}$. For $t_0 \in I$, the curve
$$\gamma(t) = \alpha(t) - \big((\alpha(t) - \alpha(t_0)) \bullet \mathbf{u}\big)\,\mathbf{u}$$
is called a *cross-sectional curve* of the cylinder on which $\alpha$ lies. Prove:
(a) $\gamma$ lies in the plane through $\alpha(t_0)$ orthogonal to $\mathbf{u}$.
(b) The curvature of $\gamma$ is $\kappa/\sin^2\vartheta$, where $\kappa$ is the curvature of $\alpha$.`,
        solution: md`(a) $(\gamma(t) - \alpha(t_0)) \bullet \mathbf{u} = (\alpha(t) - \alpha(t_0)) \bullet \mathbf{u} - (\alpha(t) - \alpha(t_0)) \bullet \mathbf{u}\,(\mathbf{u} \bullet \mathbf{u}) = 0$.

(b) Curvature does not depend on the parametrization, so take $\alpha$ unit-speed. Then $\gamma' = T - (T \bullet \mathbf{u})\mathbf{u} = T - \cos\vartheta\,\mathbf{u}$ and $\lVert\gamma'\rVert^2 = 1 - 2\cos^2\vartheta + \cos^2\vartheta = \sin^2\vartheta$: $\gamma$ has constant speed $\sin\vartheta$ (assume $\sin\vartheta \neq 0$, otherwise $\alpha$ is a straight line). Also $\gamma'' = T' = \kappa N$. By [[ex:2.4.5]], the curvature of $\gamma$ is $\lVert\gamma''\rVert/\sin^2\vartheta = \kappa/\sin^2\vartheta$.`,
      },
      {
        statement: md`Verify that the following curves are cylindrical helices and, for each, find the unit vector $\mathbf{u}$, angle $\vartheta$, and cross-sectional curve $\sigma$.
(a) The curve in [[ex:2.4.1]].
(b) The curve in Example [[2.4.4]].
(c) The curve in [[ex:2.4.2]].`,
        solution: md`In each case $\kappa = \tau$, so $\tau/\kappa = 1$ is constant ([[2.4.6]]), $\cot\vartheta = 1$, $\vartheta = \pi/4$, and by [[ex:2.4.6]] $\mathbf{u} = (T + B)/\sqrt2$. We take $\sigma$ through $\alpha(0)$ as in [[ex:2.4.7]].

(a) $T + B = (2 + t^2,\ 0,\ t^2 + 2)/f$ with $f = t^2 + 2$, so $\mathbf{u} = (1, 0, 1)/\sqrt2$. With $\alpha(0) = \mathbf{0}$ and $\alpha \bullet \mathbf{u} = (2t + t^3/3)/\sqrt2$,
$$\sigma(t) = \left(t - \tfrac{t^3}{6},\ t^2,\ \tfrac{t^3}{6} - t\right),$$ in the plane $x + z = 0$.

(b) For the 3-curve, $T + B = (0,\ 0,\ 2(1 + t^2))/(\sqrt2(1 + t^2))$, so $\mathbf{u} = (0, 0, 1)$ and $\sigma(t) = (3t - t^3,\ 3t^2,\ 0)$ in the $xy$ plane.

(c) For $\alpha = (\cosh t, \sinh t, t)$: $T = (\sinh t, \cosh t, 1)/(\sqrt2\cosh t)$ and $B = (-\sinh t, \cosh t, -1)/(\sqrt2\cosh t)$, so $\mathbf{u} = (0, 1, 0)$. With $\alpha(0) = (1, 0, 0)$, $\sigma(t) = (\cosh t,\ 0,\ t)$ — a catenary in the $xz$ plane.`,
      },
      {
        statement: md`If $\alpha$ is a curve with $\kappa > 0$ and $\tau$ both constant, show that $\alpha$ is a circular helix.`,
        solution: md`$\tau/\kappa$ is constant, so $\alpha$ is a cylindrical helix ([[2.4.6]]). (If $\tau = 0$, $\alpha$ is a circle by [[2.3.6]], a degenerate helix; assume $\tau \neq 0$.) Take $\alpha$ unit-speed. By [[ex:2.4.7]] its cross-sectional curve $\gamma$ lies in a plane and has constant curvature $\kappa/\sin^2\vartheta > 0$; a plane curve has $\tau = 0$ ([[2.3.5]]), so by [[2.3.6]] $\gamma$ lies on a circle, with center $\mathbf{c}$ in the plane orthogonal to $\mathbf{u}$. Moreover $(\alpha(s) - \alpha(0)) \bullet \mathbf{u} = s\cos\vartheta$ ($\alpha$ rises at a constant rate, as after [[2.4.5]]), so
$$\alpha(s) = \gamma(s) + s\cos\vartheta\,\mathbf{u},$$
where $\gamma$ moves around its circle with constant speed $\sin\vartheta$. In coordinates with origin $\mathbf{c}$ and $\mathbf{u} = U_3$, this is a helix $(r\cos ks,\ r\sin ks,\ s\cos\vartheta)$ as in Example [[2.3.3]].`,
      },
      {
        statement: md`(a) Prove that a curve is a cylindrical helix if and only if its spherical image is part of a circle.
(b) Sketch the spherical image of the cylindrical helix in [[ex:2.4.1]]. Is it a complete circle? Find its center.`,
        solution: md`The spherical image of $\alpha$ is the curve $\sigma = T$ moved to the origin, a curve on the unit sphere $\Sigma$.

(a) If $T \bullet \mathbf{u} = \cos\vartheta$, then $\sigma$ lies in the plane $\mathbf{x} \bullet \mathbf{u} = \cos\vartheta$, which meets $\Sigma$ in the circle of center $\cos\vartheta\,\mathbf{u}$ and radius $\sin\vartheta$. Conversely, a circle lies in a plane $\mathbf{x} \bullet \mathbf{u} = c$ ($\lVert\mathbf{u}\rVert = 1$); if $\sigma = T$ stays on such a circle then $T \bullet \mathbf{u} = c$ is constant, so $\alpha$ is a cylindrical helix.

(b) $T = (2, 2t, t^2)/(t^2 + 2)$ satisfies $T \bullet (1, 0, 1) = 1$: it runs on the circle where $\Sigma$ meets the plane $x + z = 1$, with center $(\tfrac12, 0, \tfrac12)$ and radius $1/\sqrt2$. $T(0) = (1, 0, 0)$, and as $t \to \pm\infty$, $T \to (0, 0, 1)$, which is never reached: the spherical image is the whole circle *except the point* $(0, 0, 1)$.`,
      },
      {
        statement: md`If $\alpha$ is a curve with $\kappa > 0$, its *central curve* $\alpha^* = \alpha + (1/\kappa)N$ consists of all centers of curvature of $\alpha$ ([[ex:2.3.6]]). For nonzero numbers $a$ and $b$, let $\beta_{ab}$ be the helix in Example [[2.3.3]].
(a) Show that the central curve of $\beta_{ab}$ is the helix $\beta_{\hat ab}$, where $\hat a = -b^2/a$.
(b) Deduce that the central curve of $\beta_{\hat ab}$ is the original helix $\beta_{ab}$.
(c) (*Computer graphics.*) Plot three complete turns of the mutually central helices $\beta_{2,1}$ and $\beta_{-1/2,1}$ in the same figure.`,
        solution: md`(a) With $c = \sqrt{a^2 + b^2}$: $\kappa = a/c^2$ and $N = (-\cos\frac sc, -\sin\frac sc, 0)$, so
$$\beta^* = \beta + \frac{c^2}{a}N = \left(\Big(a - \frac{c^2}{a}\Big)\cos\frac sc,\ \Big(a - \frac{c^2}{a}\Big)\sin\frac sc,\ \frac{bs}{c}\right) = \left(\hat a\cos\frac sc,\ \hat a\sin\frac sc,\ \frac{bs}{c}\right),$$
since $a - c^2/a = -b^2/a = \hat a$. This is a reparametrization ($s \mapsto s\hat c/c$, $\hat c = \sqrt{\hat a^2 + b^2}$) of the helix $\beta_{\hat ab}$; the central curve does not depend on the parametrization ([[ex:2.3.7]]).

(b) Apply (a) to $\beta_{\hat ab}$: its central curve is $\beta_{\hat{\hat a}b}$ with $\hat{\hat a} = -b^2/\hat a = -b^2/(-b^2/a) = a$.

(c) For $a = 2$, $b = 1$: $\hat a = -\tfrac12$. In the sandbox (3D view):
\`Curve((2*cos(t), 2*sin(t), t), t, 0, 6*pi)\` and \`Curve((-0.5*cos(t), -0.5*sin(t), t), t, 0, 6*pi)\`. Each point of one helix is the center of curvature of the other at the same height: the osculating circle of either curve (\`OsculatingCircle(name, t0)\`) is centered on the other.`,
      },
      {
        statement: md`If $\alpha(t) = (x(t), y(t))$ is a regular curve in $\mathbf{R}^2$, show that its plane curvature ([[ex:2.3.8]]) is given by
$$\tilde\kappa = \frac{\alpha'' \bullet J(\alpha')}{v^3} = \frac{x'y'' - x''y'}{(x'^2 + y'^2)^{3/2}},$$
where $J$ is the rotation operator $J(a, b) = (-b, a)$.`,
        solution: md`Let $\beta$ be a unit-speed reparametrization, $\alpha(t) = \beta(s(t))$, with $T$, $N = J(T)$ and $\tilde\kappa$ as in [[ex:2.3.8]]. Then $\alpha' = vT$, so $J(\alpha') = vN$, and as in [[2.4.2]]
$$\alpha'' = \frac{dv}{dt}\,T + v^2\,T'(s) = \frac{dv}{dt}\,T + \tilde\kappa v^2\,N.$$
Dotting with $N$: $\alpha'' \bullet N = \tilde\kappa v^2$, that is $\tilde\kappa = \alpha'' \bullet J(\alpha')/v^3$. In coordinates, $\alpha'' \bullet J(\alpha') = (x'', y'') \bullet (-y', x') = x'y'' - x''y'$ and $v = (x'^2 + y'^2)^{1/2}$.`,
      },
      {
        statement: md`(*Continuation.*) For a plane curve $\alpha$ with $\tilde\kappa \neq 0$, the central curve $\alpha^* = \alpha + (1/\tilde\kappa)N$ is called the *evolute* of $\alpha$. Thus $\alpha^*$ gives a direct pointwise description of the turning of $\alpha$.
(a) Show that $\alpha^* = \alpha + \dfrac{\alpha' \bullet \alpha'}{\alpha'' \bullet J(\alpha')}\,J(\alpha')$.
(b) Find a formula for the line segment $\lambda_t$ from $\alpha(t)$ to $\alpha^*(t)$. This segment is the radius (line) of the approximating circle to $\alpha$ near $\alpha(t)$ ([[ex:2.3.6]]).
(c) Prove that $\lambda_t$ is normal to $\alpha$ at $\alpha(t)$ and tangent to $\alpha^*$ at $\alpha^*(t)$. (*Hint:* it can be assumed that $\alpha$ has unit speed.)`,
        solution: md`(a) By [[ex:2.4.12]], $1/\tilde\kappa = v^3/(\alpha'' \bullet J(\alpha'))$, and $N = J(\alpha')/v$. So $(1/\tilde\kappa)N = v^2J(\alpha')/(\alpha'' \bullet J(\alpha'))$, with $v^2 = \alpha' \bullet \alpha'$.

(b) $\lambda_t(u) = \alpha(t) + u\,\dfrac{\alpha'(t) \bullet \alpha'(t)}{\alpha''(t) \bullet J(\alpha'(t))}\,J(\alpha'(t))$, for $0 \le u \le 1$.

(c) The direction of $\lambda_t$ is $J(\alpha')$, orthogonal to $\alpha'$: $\lambda_t$ is normal to $\alpha$. With $\alpha$ unit-speed, $\alpha^* = \alpha + (1/\tilde\kappa)N$ and $N' = -\tilde\kappa T$, so
$$(\alpha^*)' = T + \left(\frac{1}{\tilde\kappa}\right)'N + \frac{1}{\tilde\kappa}(-\tilde\kappa T) = \left(\frac{1}{\tilde\kappa}\right)'N,$$
parallel to $N$, the direction of $\lambda_t$: $\lambda_t$ is tangent to $\alpha^*$ at $\alpha^*(t)$ (where $\alpha^*$ is regular).`,
      },
      {
        statement: md`(*Continuation, Computer graphics.*) In each case, plot the given plane curve and its evolute on the same figure, showing some of the construction lines $\lambda_t$.
(a) The ellipse $\alpha(t) = (2\cos t,\ \sin t)$.
(b) The cycloid $\alpha(t) = (t + \sin t,\ 1 + \cos t)$ for $-2\pi \le t \le 2\pi$. (Here the evolute bears an unexpected relation to the original curve.)`,
        solution: md`Use [[ex:2.4.13]](a).

(a) $\alpha' = (-2\sin t, \cos t)$, $\alpha'' = (-2\cos t, -\sin t)$, $J(\alpha') = (-\cos t, -2\sin t)$, $\alpha'' \bullet J(\alpha') = 2$, $\alpha' \bullet \alpha' = 4\sin^2 t + \cos^2 t$. Simplifying,
$$\alpha^*(t) = \left(\tfrac32\cos^3 t,\ -3\sin^3 t\right),$$
a star-shaped curve (stretched astroid) with four cusps at the centers of curvature of the vertices of the ellipse.

(b) $\alpha' = (1 + \cos t, -\sin t)$, $\alpha'' = (-\sin t, -\cos t)$, $J(\alpha') = (\sin t, 1 + \cos t)$, $\alpha'' \bullet J(\alpha') = -(1 + \cos t)$, $\alpha' \bullet \alpha' = 2(1 + \cos t)$. So $\alpha^* = \alpha - 2J(\alpha')$:
$$\alpha^*(t) = (t - \sin t,\ -1 - \cos t) = \alpha(t - \pi) + (\pi, -2).$$
The evolute of the cycloid is the *same cycloid*, translated by $(\pi, -2)$.

In the sandbox (2D view): \`Curve((2*cos(t), sin(t)), t, 0, 2*pi)\` with \`Curve((1.5*cos(t)^3, -3*sin(t)^3), t, 0, 2*pi)\`; \`OsculatingCircle(alpha, t0)\` shows the approximating circle at $\alpha(t_0)$, centered at $\alpha^*(t_0)$ — the segment $\lambda_{t_0}$ is its radius.`,
      },
      {
        statement: md`(*Computer continuation of [[ex:2.3.9]].*)
(a) Write the commands that, given a regular curve $\alpha$ with $\kappa(0) > 0$, plot — on a small interval $-\varepsilon \le t \le \varepsilon$ — the orthogonal projection of $\alpha$ into the osculating, rectifying, and normal planes at $\alpha(0)$. Show the projections as curves in $\mathbf{R}^2$.
(b) Test (a) on the curves (3), (4), (5) in Example [[1.4.2]] of Chapter 1 and those in Example [[3.4.3]] of Chapter 3. Compare results.`,
        solution: md`(a) Compute $T_0, N_0, B_0$ at $t = 0$ ([[2.4.3]]) and the coordinates of $\alpha(t) - \alpha(0)$ in this frame:
$$x(t) = (\alpha(t) - \alpha(0)) \bullet T_0, \quad y(t) = (\alpha(t) - \alpha(0)) \bullet N_0, \quad z(t) = (\alpha(t) - \alpha(0)) \bullet B_0.$$
Then plot the plane curves $(x, y)$ (osculating plane), $(x, z)$ (rectifying plane) and $(y, z)$ (normal plane) for $-\varepsilon \le t \le \varepsilon$. In the sandbox, \`Frenet(alpha, 0)\` draws the frame, and rotating the 3D view to look along $B_0$, $N_0$ or $T_0$ shows the three projections (compare the Frenet approximation in the figure of [[2.3.4]]).

(b) For every curve with $\tau(0) \neq 0$ the pictures are those of [[ex:2.3.9]]: a parabola in the osculating plane, an inflection like $y = x^3$ in the rectifying plane, and a cusp in the normal plane. There are essentially only two cases, according to the sign of $\tau(0)$: it decides on which side the cubic and the cusp turn. The helix and its mirror image in Example [[3.4.3]] have opposite torsions, so their rectifying and normal views are mirror images of each other.`,
      },
      {
        statement: md`The condition $\kappa > 0$ cannot be avoided in a detailed study of the geometry of curves in $\mathbf{R}^3$: even if $\kappa$ is zero at only a single point, the geometric character of the curve can change radically at that point. (This difficulty does not arise for curves in the plane.)

It is shown in advanced calculus that the function $f(t) = 0$ for $t \le 0$, $f(t) = e^{-1/t^2}$ for $t > 0$, is infinitely differentiable. Thus $\alpha(t) = (t,\ f(t),\ f(-t))$ is a well-defined differentiable curve.
(a) Sketch $\alpha$ on an interval $-a \le t \le a$.
(b) Show that the curvature of $\alpha$ is zero only at $t = 0$.
(c) What are the osculating planes of $\alpha$ for $t < 0$ and $t > 0$?`,
        solution: md`(a) For $t < 0$, $\alpha(t) = (t, 0, e^{-1/t^2})$ lies in the $xz$ plane; for $t > 0$, $\alpha(t) = (t, e^{-1/t^2}, 0)$ lies in the $xy$ plane. Both halves leave the origin extremely flat along the $x$ axis (every derivative of $f$ vanishes at $0$) and rise to height $e^{-1/a^2}$ at $t = \mp a$ — in two perpendicular planes.

(b) For $t > 0$, $\alpha' = (1, f', 0)$, $\alpha'' = (0, f'', 0)$, so $\alpha' \times \alpha'' = (0, 0, f'')$ and $\kappa = |f''|/(1 + f'^2)^{3/2}$, where
$$f''(t) = \frac{4 - 6t^2}{t^6}\,e^{-1/t^2}.$$
Symmetrically for $t < 0$. At $t = 0$, $\alpha''(0) = 0$, so $\kappa(0) = 0$. For small $t \neq 0$, $f''(t) \neq 0$: on any interval with $a < \sqrt{2/3}$, the curvature vanishes only at $t = 0$. (Note: $f''$ also vanishes at $t = \pm\sqrt{2/3}$, the inflection points of $e^{-1/t^2}$, so on longer intervals $\kappa$ has two more zeros.)

(c) Where $\kappa > 0$, $T$ and $N$ lie in the plane containing the curve: the osculating plane is the $xz$ plane for $t < 0$ and the $xy$ plane for $t > 0$ ($B = \pm U_2$, then $\pm U_3$). It jumps through $90°$ at $t = 0$ although the curve is infinitely differentiable.`,
      },
      {
        statement: md`A global geometric invariant of curves is gotten by integrating a local invariant. The *total curvature* of a unit-speed curve $\alpha\colon I \to \mathbf{R}^3$ is $\int_I \kappa(s)\,ds$. If $\alpha$ is merely regular, the formula becomes $\int_I \kappa(t)v(t)\,dt$. Find the total curvature of the following curves:
(a) The curve in Example [[2.4.4]].
(b) The helix in Example [[2.3.3]].
(c) The curve in [[ex:2.4.2]].
(d) The ellipse $\alpha(t) = (a\cos t,\ b\sin t)$ on $0 \le t \le 2\pi$.`,
        solution: md`(a) For the 3-curve, $\kappa = 1/(3(1 + t^2)^2)$ and $v = 3\sqrt2(1 + t^2)$, so $\kappa v = \sqrt2/(1 + t^2)$ and
$$\int_{-\infty}^{\infty} \frac{\sqrt2\,dt}{1 + t^2} = \sqrt2\,\pi.$$
Check: the total curvature is the length of the spherical image $T$, which by [[ex:2.4.10]] runs once around a circle of radius $\sin\frac\pi4 = 1/\sqrt2$ (minus one point), of length $2\pi/\sqrt2 = \sqrt2\,\pi$. (The book's answer prints $\pi/\sqrt2$; numerical integration confirms $\sqrt2\,\pi \approx 4.443$.)

(b) $\kappa = a/c^2$ is constant and the helix is infinitely long: the total curvature is $\infty$.

(c) $\kappa = 1/(2\cosh^2 t)$ and $v = \sqrt2\cosh t$ ([[ex:2.4.2]]), so $\displaystyle\int_{-\infty}^{\infty} \frac{dt}{\sqrt2\cosh t} = \frac{\pi}{\sqrt2}$.

(d) By [[ex:2.4.12]], $\tilde\kappa = ab/v^3 > 0$ (for $a, b > 0$), so $\kappa v = ab/(a^2\sin^2 t + b^2\cos^2 t)$, and $\displaystyle\int_0^{2\pi} \frac{ab\,dt}{a^2\sin^2 t + b^2\cos^2 t} = 2\pi$ — as predicted by [[ex:2.4.18]].`,
      },
      {
        statement: md`One definition of convexity for a smoothly closed plane curve is that its curvature $\kappa$ is positive (hence its plane curvature $\tilde\kappa$ is either always positive or always negative). Prove that a convex closed plane curve has total curvature $2\pi$. (*Hint:* consider its spherical image.)

A theorem of Fenchel asserts that every regular closed curve $\alpha$ in $\mathbf{R}^3$ has total curvature $\ge 2\pi$. Surprisingly, this has an easy proof in terms of surface theory (see Sec. 8 of Ch. 6).`,
        solution: md`Say $\tilde\kappa > 0$, and let $\varphi$ be a slope angle of $\alpha$ ([[ex:2.3.8]](b)), so $T = (\cos\varphi, \sin\varphi)$ — the "spherical image" $T$ runs on the unit circle. In terms of $t$, $d\varphi/dt = \tilde\kappa v > 0$, so $T$ moves steadily counterclockwise, and
$$\int_a^b \kappa v\,dt = \int_a^b \tilde\kappa v\,dt = \varphi(b) - \varphi(a),$$
the total angle turned by $T$ — the length of the path of $T$ on the unit circle. Since the curve is smoothly closed, $T(b) = T(a)$, so this is $2\pi n$, where $n \ge 1$ is the number of times $T$ goes around the circle. For a closed curve traced once (a simple closed curve), the tangent turns exactly once — the theorem of turning tangents — so the total curvature is $2\pi$. (A circle traced twice also has $\kappa > 0$, but total curvature $4\pi$: closed curves are understood to be traced once.)`,
      },
      {
        statement: md`(*Computer.*)
(a) Plot the curve $\tau(t) = (4\cos 2t + 2\cos t,\ 4\sin 2t - 2\sin t,\ \sin 3t)$ on $0 \le t \le 2\pi$.

Even looking at this curve from different viewpoints may not make its crossing pattern clear, but Exercise 21 of Section 5.4 will show that $\tau$ is a *trefoil knot*. (Intuitively, a simple closed curve in $\mathbf{R}^3$ is a *knot* provided it cannot be continuously deformed — always remaining simply closed — until it becomes a circle.) The Fary-Milnor theorem asserts that every knot has total curvature strictly greater than $4\pi$. Show:
(b) The plane curve obtained from $\tau$ by removing the $z$-component $\sin 3t$ has total curvature exactly $4\pi$. (This curve is not simply closed, and hence is not a knot.)
(c) $\tau$ can be deformed to a knot that has (numerically estimated) total curvature less than $4.01\pi$.`,
        solution: md`(a) In the sandbox: \`Curve((4*cos(2*t) + 2*cos(t), 4*sin(2*t) - 2*sin(t), sin(3*t)), t, 0, 2*pi)\`, then rotate the 3D view.

(b) For $x = 4\cos 2t + 2\cos t$, $y = 4\sin 2t - 2\sin t$, a direct computation gives
$$x'y'' - x''y' = 124 - 16\cos 3t > 0,$$
so $\tilde\kappa > 0$ ([[ex:2.4.12]]) and, as in [[ex:2.4.18]], the total curvature is the angle turned by the tangent. Now $(x', y') = 8(-\sin 2t, \cos 2t) + 2(-\sin t, -\cos t)$; the first term turns twice around the origin as $t$ goes from $0$ to $2\pi$, and the second is too short (length $2 < 8$) to change that winding number. So the tangent turns through $2 \cdot 2\pi$: the total curvature is $4\pi$.

(c) Let $\tau_n$ be $\tau$ with $z$-component $\frac1n\sin 3t$. Shrinking the $z$-component does not change which strand passes over at each crossing ($\sin 3t$ keeps its sign there), so every $\tau_n$ is the same knot, and as $n \to \infty$ the total curvature tends to that of the plane curve, $4\pi$. Numerically, $\int_0^{2\pi} \kappa v\,dt$ is about $4.149\pi$ for $n = 1$, $4.041\pi$ for $n = 2$, $4.019\pi$ for $n = 3$ and $4.007\pi$ for $n = 5$: already $\tau_5$ has total curvature less than $4.01\pi$.`,
      },
      {
        statement: md`(*Computer.*)
(a) Write a command that, given an arbitrary regular curve, returns the test function in [[ex:2.3.10]] whose constancy implies that the curve lies on a sphere. (Plotting this function provides a good test for constancy and does not require simplifying it.) (*Hint:* to allow for arbitrary parametrization, replace derivatives $f'(s)$ by $f'(t)/v(t)$, where $v(t) = ds/dt$.)
(b) In each case, decide whether the curve lies on a sphere, and if so, find its radius and center:
(i) $\alpha(t) = (2\sin t,\ \sin 2t,\ 2\sin^2 t)$;
(ii) $\beta(t) = (\cos^2 t,\ \sin 2t,\ 2\sin t)$;
(iii) $\gamma(t) = \left(\cos t,\ 1 + \sin t,\ 2\sin\tfrac t2\right)$.`,
        solution: md`(a) With $\kappa$, $\tau$ and $v$ computed by [[2.4.3]], let $\rho = 1/\kappa$, $\sigma = 1/\tau$; the test function is
$$F(t) = \rho(t)^2 + \left(\frac{\rho'(t)}{v(t)}\,\sigma(t)\right)^2.$$
If $F$ has a constant value $r^2$ (and $\rho' \neq 0$), the curve lies on a sphere of radius $r$, centered at $\alpha + \rho N + (\rho'/v)\sigma B$ ([[ex:2.3.10]]).

(b) A direct test: a curve lies on the sphere of center $(a, b, c)$ and radius $r$ iff $x^2 + y^2 + z^2 - 2(ax + by + cz) = r^2 - a^2 - b^2 - c^2$ along it; we look for constants making the left side constant.

(i) $x^2 + y^2 + z^2 = 4\sin^2 t + 4\sin^2 t\cos^2 t + 4\sin^4 t = 8\sin^2 t = 4z$. So $x^2 + y^2 + (z - 2)^2 = 4$: the sphere of **center $(0, 0, 2)$ and radius 2**.

(ii) $x^2 + y^2 + z^2 = -3u^2 + 4$ with $u = \cos^2 t$, while $ax + by + cz = au + b\sin 2t + 2c\sin t$. The odd terms force $b = c = 0$, and $-3u^2 + 4 - 2au$ is not constant. **Not spherical.**

(iii) $x^2 + y^2 + z^2 = 4 + 2\sin t - 2\cos t$, and $2x - 2y = 2\cos t - 2 - 2\sin t$. Adding: $x^2 + y^2 + z^2 + 2x - 2y = 2$, i.e. $(x + 1)^2 + (y - 1)^2 + z^2 = 4$: the sphere of **center $(-1, 1, 0)$ and radius 2**. (This is curve (3) of Example [[1.4.2]], which lies on the sphere of radius 2 about the origin, translated by $(-1, 1, 0)$.)`,
      },
      {
        statement: md`Prove that the cubic curve $\gamma(t) = (at,\ bt^2,\ ct^3)$, $abc \neq 0$, is a cylindrical helix if and only if $3ac = \pm2b^2$. (Computer optional.)`,
        solution: md`Use [[2.4.6]]. Here $\gamma' = (a, 2bt, 3ct^2)$, $\gamma'' = (0, 2b, 6ct)$, $\gamma''' = (0, 0, 6c)$, so
$$\begin{gathered} \gamma' \times \gamma'' = (6bct^2,\ -6act,\ 2ab),\\ \gamma' \times \gamma'' \bullet \gamma''' = 12abc. \end{gathered}$$
With $v^2 = P = 9c^2t^4 + 4b^2t^2 + a^2$ and $\lVert\gamma' \times \gamma''\rVert^2 = 4b^2Q$, $Q = 9c^2t^4 + (9a^2c^2/b^2)t^2 + a^2$, [[2.4.3]] gives
$$\frac\tau\kappa = \frac{(\gamma' \times \gamma'' \bullet \gamma''')\,v^3}{\lVert\gamma' \times \gamma''\rVert^3} = \pm\frac{3ac}{2b^2}\left(\frac PQ\right)^{3/2}$$
(the sign is that of $b$). $P$ and $Q$ are polynomials in $t^2$ with the same leading coefficient $9c^2 \neq 0$ and the same constant term $a^2$, so $P/Q$ is constant iff $P = Q$, iff $4b^2 = 9a^2c^2/b^2$, iff $4b^4 = 9a^2c^2$, that is, $3ac = \pm2b^2$. (Then $\tau/\kappa = \pm1$.) Example: in the orthonormal coordinates $\big((x + z)/\sqrt2,\ y,\ (z - x)/\sqrt2\big)$ the 3-curve of Example [[2.4.4]] becomes $(3\sqrt2\,t,\ 3t^2,\ \sqrt2\,t^3)$, and indeed $3ac = 18 = 2b^2$.`,
      },
    ],
    md`Computer commands that produce the Frenet apparatus $\kappa, \tau, T, N, B$ of a curve are given in the book's Appendix; their use is optional in the following exercises. In this sandbox, the *Frenet frame* tool (\`Frenet(alpha, t0)\`), \`PlotCurvature(alpha)\` and \`ArcLength(alpha, a, b)\` play that role.`,
  ),
  // §2.5 Covariant Derivatives
  exercises(2, 5, 84, [
    {
      statement: md`Consider the tangent vector $\mathbf{v} = (1, -1, 2)$ at the point $\mathbf{p} = (1, 3, -1)$. Compute $\nabla_\mathbf{v}W$ directly from the definition, where
(a) $W = x^2U_1 + yU_2$.
(b) $W = xU_1 + x^2U_2 - z^2U_3$.`,
      solution: md`By [[2.5.1]], $\nabla_\mathbf{v}W = W(\mathbf{p} + t\mathbf{v})'(0)$, with $\mathbf{p} + t\mathbf{v} = (1 + t,\ 3 - t,\ -1 + 2t)$.

(a) $W(\mathbf{p} + t\mathbf{v}) = \big((1 + t)^2,\ 3 - t,\ 0\big)$; differentiating at $t = 0$: $\nabla_\mathbf{v}W = (2, -1, 0) = 2U_1(\mathbf{p}) - U_2(\mathbf{p})$.

(b) $W(\mathbf{p} + t\mathbf{v}) = \big(1 + t,\ (1 + t)^2,\ -(-1 + 2t)^2\big)$; differentiating at $t = 0$: $\nabla_\mathbf{v}W = (1, 2, 4) = U_1(\mathbf{p}) + 2U_2(\mathbf{p}) + 4U_3(\mathbf{p})$.

(Check with [[2.5.2]]: in (a), $\mathbf{v}[x^2] = 2x\,v_1 = 2$ and $\mathbf{v}[y] = -1$.)`,
    },
    {
      statement: md`Let $V = -yU_1 + xU_3$ and $W = \cos x\,U_1 + \sin x\,U_2$. Express the following covariant derivatives in terms of $U_1, U_2, U_3$:
(a) $\nabla_VW$.
(b) $\nabla_VV$.
(c) $\nabla_V(z^2W)$.
(d) $\nabla_W(V)$.
(e) $\nabla_V(\nabla_VW)$.
(f) $\nabla_V(xV - zW)$.`,
      solution: md`By [[2.5.4]], $\nabla_V\left(\sum w_iU_i\right) = \sum V[w_i]\,U_i$. Here $V[f] = -y\,f_x + x\,f_z$ and $W[f] = \cos x\,f_x + \sin x\,f_y$.

(a) $V[\cos x] = y\sin x$, $V[\sin x] = -y\cos x$: $\nabla_VW = y\sin x\,U_1 - y\cos x\,U_2$.
(b) $V[-y] = 0$, $V[x] = -y$: $\nabla_VV = -y\,U_3$.
(c) $\nabla_V(z^2W) = V[z^2]\,W + z^2\nabla_VW = 2xz\,W + z^2\nabla_VW = (2xz\cos x + yz^2\sin x)\,U_1 + (2xz\sin x - yz^2\cos x)\,U_2$.
(d) $W[-y] = -\sin x$, $W[x] = \cos x$: $\nabla_WV = -\sin x\,U_1 + \cos x\,U_3$.
(e) $V[y\sin x] = -y^2\cos x$ and $V[-y\cos x] = -y^2\sin x$: $\nabla_V(\nabla_VW) = -y^2\cos x\,U_1 - y^2\sin x\,U_2$.
(f) $\nabla_V(xV - zW) = V[x]\,V + x\nabla_VV - V[z]\,W - z\nabla_VW$, with $V[x] = -y$, $V[z] = x$:
$$\nabla_V(xV - zW) = (y^2 - x\cos x - yz\sin x)\,U_1 + (yz\cos x - x\sin x)\,U_2 - 2xy\,U_3.$$`,
    },
    {
      statement: md`If $W$ is a vector field with constant length $\lVert W\rVert$, prove that for any vector field $V$, the covariant derivative $\nabla_VW$ is everywhere orthogonal to $W$.`,
      solution: md`$W \bullet W$ is constant, so $V[W \bullet W] = 0$. By [[2.5.4]](4), $V[W \bullet W] = 2\,\nabla_VW \bullet W$. Hence $\nabla_VW \bullet W = 0$.`,
    },
    {
      statement: md`Let $X$ be the special vector field $\sum x_iU_i$, where $x_1, x_2, x_3$ are the natural coordinate functions of $\mathbf{R}^3$. Prove that $\nabla_VX = V$ for every vector field $V$.`,
      solution: md`By [[2.5.4]], $\nabla_VX = \sum V[x_i]\,U_i$, and $\sum V[x_i]\,U_i = V$ by [[ex:1.3.4]].`,
    },
    {
      statement: md`Let $W$ be a vector field defined on a region containing a regular curve $\alpha$. Then $t \mapsto W(\alpha(t))$ is a vector field on $\alpha$ called the *restriction* of $W$ to $\alpha$ and denoted by $W_\alpha$.
(a) Prove that $\nabla_{\alpha'(t)}W = (W_\alpha)'(t)$.
(b) Deduce that the straight line in [[2.5.1]] may be replaced by *any* curve with initial velocity $\mathbf{v}$. Thus the derivative $Y'$ of a vector field $Y$ on a curve $\alpha$ is (almost) $\nabla_{\alpha'}Y$.`,
      solution: md`(a) Write $W = \sum w_iU_i$. By [[2.5.2]] and [[1.4.6]],
$$\nabla_{\alpha'(t)}W = \sum \alpha'(t)[w_i]\,U_i(\alpha(t)) = \sum \frac{d}{dt}\big(w_i(\alpha)\big)(t)\,U_i(\alpha(t)) = (W_\alpha)'(t).$$

(b) If $\alpha(0) = \mathbf{p}$ and $\alpha'(0) = \mathbf{v}$, (a) at $t = 0$ gives $\nabla_\mathbf{v}W = (W_\alpha)'(0)$; the straight line $t \mapsto \mathbf{p} + t\mathbf{v}$ is just one such curve. So when a vector field $Y$ on $\alpha$ is the restriction of a vector field $W$ on $\mathbf{R}^3$, $Y' = \nabla_{\alpha'}W$. ("Almost": a vector field on a curve need not be a restriction — for instance if $\alpha$ passes twice through the same point with different values of $Y$.)`,
    },
  ]),

  // §2.6 Frame Fields
  exercises(2, 6, 87, [
    {
      statement: md`If $V$ and $W$ are vector fields on $\mathbf{R}^3$ that are linearly independent at each point, show that
$$\begin{gathered} E_1 = \frac{V}{\lVert V\rVert},\\ E_2 = \frac{\tilde W}{\lVert\tilde W\rVert},\\ E_3 = E_1 \times E_2 \end{gathered}$$
is a frame field, where $\tilde W = W - (W \bullet E_1)E_1$.`,
      solution: md`$V \neq 0$ everywhere, so $E_1$ is a (differentiable) unit vector field. $\tilde W \bullet E_1 = W \bullet E_1 - (W \bullet E_1)(E_1 \bullet E_1) = 0$, so also $V \bullet \tilde W = 0$; and $\tilde W \neq 0$ at every point, since otherwise $W = (W \bullet E_1)E_1$ would be a multiple of $V$. Hence $E_2$ is a unit vector field orthogonal to $E_1$. Finally, by [[2.1.8]], $E_3 = E_1 \times E_2$ is orthogonal to $E_1$ and $E_2$, with $\lVert E_3\rVert^2 = 1 \cdot 1 - 0^2 = 1$. So $E_1, E_2, E_3$ is a frame field ([[2.6.1]]). (This is the Gram–Schmidt process, done pointwise.)`,
    },
    {
      statement: md`Express each of the following vector fields (i) in terms of the cylindrical frame field (with coefficients in terms of $r, \vartheta, z$) and (ii) in terms of the spherical frame field (with coefficients in terms of $\rho, \vartheta, \varphi$):
(a) $U_1$.
(b) $\cos\vartheta\,U_1 + \sin\vartheta\,U_2 + U_3$.
(c) $xU_1 + yU_2 + zU_3$.`,
      solution: md`By [[2.6.3]], the coordinate functions are the dot products with the frame vectors. The frames of Example [[2.6.2]] are
$E_1 = \cos\vartheta\,U_1 + \sin\vartheta\,U_2$, $E_2 = -\sin\vartheta\,U_1 + \cos\vartheta\,U_2$, $E_3 = U_3$, and
$F_1 = \cos\varphi\,E_1 + \sin\varphi\,U_3$, $F_2 = E_2$, $F_3 = -\sin\varphi\,E_1 + \cos\varphi\,U_3$.

(a) (i) $U_1 = \cos\vartheta\,E_1 - \sin\vartheta\,E_2$. (ii) $U_1 = \cos\varphi\cos\vartheta\,F_1 - \sin\vartheta\,F_2 - \sin\varphi\cos\vartheta\,F_3$.

(b) The field is $E_1 + U_3$. (i) $E_1 + E_3$. (ii) $(\cos\varphi + \sin\varphi)\,F_1 + (\cos\varphi - \sin\varphi)\,F_3$.

(c) With $x = r\cos\vartheta$, $y = r\sin\vartheta$, the field is $rE_1 + zU_3$. (i) $rE_1 + zE_3$. (ii) With $r = \rho\cos\varphi$, $z = \rho\sin\varphi$, it is $\rho(\cos\varphi\,E_1 + \sin\varphi\,U_3) = \rho F_1$ — the position vector field is radial.`,
    },
    {
      statement: md`Find a frame field $E_1, E_2, E_3$ such that
$$E_1 = \cos x\,U_1 + \sin x\cos z\,U_2 + \sin x\sin z\,U_3.$$`,
      solution: md`$E_1$ is a unit vector field. The field $E_2 = -\sin z\,U_2 + \cos z\,U_3$ is a unit vector field with $E_1 \bullet E_2 = -\sin x\cos z\sin z + \sin x\sin z\cos z = 0$. Then
$$E_3 = E_1 \times E_2 = \sin x\,U_1 - \cos x\cos z\,U_2 - \cos x\sin z\,U_3$$
completes the frame field. (Another choice: $E_2 = \partial E_1/\partial x = -\sin x\,U_1 + \cos x\cos z\,U_2 + \cos x\sin z\,U_3$, then $E_3 = E_1 \times E_2 = -\sin z\,U_2 + \cos z\,U_3$.)`,
    },
  ]),

  // §2.7 Connection Forms
  exercises(2, 7, 93, [
    {
      statement: md`For any function $f$, show that the vector fields
$$\begin{gathered} E_1 = (\sin f\,U_1 + U_2 - \cos f\,U_3)/\sqrt2,\\ E_2 = (\sin f\,U_1 - U_2 - \cos f\,U_3)/\sqrt2,\\ E_3 = \cos f\,U_1 + \sin f\,U_3 \end{gathered}$$
form a frame field, and find its connection forms.`,
      solution: md`Write $s = \sin f$, $c = \cos f$. Then $\lVert E_1\rVert^2 = \lVert E_2\rVert^2 = (s^2 + 1 + c^2)/2 = 1$, $\lVert E_3\rVert^2 = 1$, $E_1 \bullet E_2 = (s^2 - 1 + c^2)/2 = 0$, $E_1 \bullet E_3 = E_2 \bullet E_3 = (sc - cs)/\sqrt2 = 0$: a frame field.

By [[2.7.3]], $\omega_{ij} = dE_i \bullet E_j$ (differentiating the Euclidean coordinates). Here $dE_1 = dE_2 = (c, 0, s)\,df/\sqrt2$ and $dE_3 = (-s, 0, c)\,df$. So
$$\begin{gathered} \omega_{12} = \tfrac12(cs - sc)\,df = 0,\\ \omega_{13} = \tfrac{1}{\sqrt2}(c^2 + s^2)\,df = \frac{df}{\sqrt2},\\ \omega_{23} = \frac{df}{\sqrt2}. \end{gathered}$$`,
    },
    {
      statement: md`Find the connection forms of the natural frame field $U_1, U_2, U_3$.`,
      solution: md`$\nabla_\mathbf{v}U_i = 0$ for every $\mathbf{v}$ (the $U_i$ have constant coordinates), so $\omega_{ij}(\mathbf{v}) = \nabla_\mathbf{v}U_i \bullet U_j(\mathbf{p}) = 0$: all connection forms are zero. (Equivalently, the attitude matrix is $I$, and $dI = 0$.)`,
    },
    {
      statement: md`For any function $f$, show that
$$A = \begin{pmatrix} \cos^2 f & \cos f\sin f & \sin f \\ \sin f\cos f & \sin^2 f & -\cos f \\ -\sin f & \cos f & 0 \end{pmatrix}$$
is the attitude matrix of a frame field, and compute its connection forms.`,
      solution: md`With $s = \sin f$, $c = \cos f$, the rows are $E_1 = (c^2, cs, s)$, $E_2 = (sc, s^2, -c)$, $E_3 = (-s, c, 0)$, and
$\lVert E_1\rVert^2 = c^2(c^2 + s^2) + s^2 = 1$, $\lVert E_2\rVert^2 = s^2 + c^2 = 1$, $\lVert E_3\rVert^2 = 1$, $E_1 \bullet E_2 = cs(c^2 + s^2) - sc = 0$, $E_1 \bullet E_3 = -c^2s + c^2s = 0$, $E_2 \bullet E_3 = -s^2c + s^2c = 0$. So the rows form a frame field with attitude matrix $A$ ([[2.1.6]]).

$dE_1 = (-2cs,\ c^2 - s^2,\ c)\,df$, $dE_2 = (c^2 - s^2,\ 2sc,\ s)\,df$. By [[2.7.3]]:
$$\omega_{12} = dE_1 \bullet E_2 = (-2c^2s^2 + c^2s^2 - s^4 - c^2)\,df = -df,$$
$$\begin{gathered} \omega_{13} = dE_1 \bullet E_3 = (2cs^2 + c^3 - cs^2)\,df = \cos f\,df,\\ \omega_{23} = dE_2 \bullet E_3 = (-c^2s + s^3 + 2sc^2)\,df = \sin f\,df. \end{gathered}$$`,
    },
    {
      statement: md`Prove that the connection forms of the spherical frame field are
$$\begin{gathered} \omega_{12} = \cos\varphi\,d\vartheta,\\ \omega_{13} = d\varphi,\\ \omega_{23} = \sin\varphi\,d\vartheta. \end{gathered}$$`,
      solution: md`With $E = \cos\vartheta\,U_1 + \sin\vartheta\,U_2$, the spherical frame field is $F_1 = \cos\varphi\,E + \sin\varphi\,U_3$, $F_2 = -\sin\vartheta\,U_1 + \cos\vartheta\,U_2$, $F_3 = -\sin\varphi\,E + \cos\varphi\,U_3$. Since $dE = F_2\,d\vartheta$,
$$dF_1 = (-\sin\varphi\,E + \cos\varphi\,U_3)\,d\varphi + \cos\varphi\,F_2\,d\vartheta = F_3\,d\varphi + \cos\varphi\,F_2\,d\vartheta,$$
so $\omega_{12} = dF_1 \bullet F_2 = \cos\varphi\,d\vartheta$ and $\omega_{13} = dF_1 \bullet F_3 = d\varphi$. Also $dF_2 = -E\,d\vartheta$, so $\omega_{23} = dF_2 \bullet F_3 = \sin\varphi\,d\vartheta$. (Here $dF_i \bullet F_j$ means $\omega = dA\,{}^tA$, [[2.7.3]].)`,
    },
    {
      statement: md`If $E_1, E_2, E_3$ is a frame field and $W = \sum f_iE_i$, prove the *covariant derivative formula*:
$$\nabla_VW = \sum_j\Big\{V[f_j] + \sum_i f_i\,\omega_{ij}(V)\Big\}E_j.$$`,
      solution: md`By [[2.5.4]] (linearity and the Leibniz rule (3)), $\nabla_VW = \sum_i V[f_i]\,E_i + \sum_i f_i\,\nabla_VE_i$. The connection equations ([[2.7.2]]) give $\nabla_VE_i = \sum_j \omega_{ij}(V)\,E_j$. Renaming the summation index in the first sum and collecting the coefficient of each $E_j$ gives the formula.`,
    },
    {
      statement: md`Let $E_1, E_2, E_3$ be the cylindrical frame field. If $V$ is a vector field such that $V[r] = r$ and $V[\vartheta] = 1$, compute $\nabla_V(r\cos\vartheta\,E_1 + r\sin\vartheta\,E_3)$.`,
      solution: md`For the cylindrical frame field, $\omega_{12} = d\vartheta$ and $\omega_{13} = \omega_{23} = 0$; so $\omega_{12}(V) = V[\vartheta] = 1$, $\omega_{21}(V) = -1$. With $f_1 = r\cos\vartheta$, $f_2 = 0$, $f_3 = r\sin\vartheta$, [[ex:2.7.5]] gives
- $E_1$: $V[r\cos\vartheta] + f_2\,\omega_{21}(V) = r\cos\vartheta - r\sin\vartheta$;
- $E_2$: $V[0] + f_1\,\omega_{12}(V) = r\cos\vartheta$;
- $E_3$: $V[r\sin\vartheta] = r\sin\vartheta + r\cos\vartheta$.

So $\nabla_V(r\cos\vartheta\,E_1 + r\sin\vartheta\,E_3) = r(\cos\vartheta - \sin\vartheta)\,E_1 + r\cos\vartheta\,E_2 + r(\sin\vartheta + \cos\vartheta)\,E_3$.`,
    },
    {
      statement: md`(*Computer.*)
(a) Write a computer command that, given the attitude matrix $A$ of a frame field on $\mathbf{R}^3$, returns the matrix $\omega = dA\,{}^tA$ of its connection forms.
(b) Test part (a) on the cylindrical frame field and on the spherical frame field ([[ex:2.7.4]]).`,
      solution: md`(a) Differentiate each entry of $A$ (a function of the coordinates, so its differential is a 1-form), then multiply the resulting matrix of 1-forms by the transpose of $A$ ([[2.7.3]]). In a computer algebra system: take the total differential of the matrix entries, then the matrix product with \`Transpose[A]\` and simplify. In the sandbox, the details of a cylindrical or spherical *Frame field* (Course view) list these forms, and \`ConnectionForms(E, v)\` evaluates $\omega_{ij}(\mathbf{v})$ on a tangent vector for any frame field, including a custom one.

(b) Cylindrical: $A = \begin{pmatrix} \cos\vartheta & \sin\vartheta & 0 \\ -\sin\vartheta & \cos\vartheta & 0 \\ 0 & 0 & 1 \end{pmatrix}$ gives $\omega_{12} = d\vartheta$, $\omega_{13} = \omega_{23} = 0$. Spherical: $\omega_{12} = \cos\varphi\,d\vartheta$, $\omega_{13} = d\varphi$, $\omega_{23} = \sin\varphi\,d\vartheta$, as in [[ex:2.7.4]].`,
    },
    {
      statement: md`Let $\beta$ be a unit-speed curve in $\mathbf{R}^3$ with $\kappa > 0$, and suppose that $E_1, E_2, E_3$ is a frame field on $\mathbf{R}^3$ such that the restriction of these vector fields to $\beta$ gives the Frenet frame field $T, N, B$ of $\beta$. Prove that
$$\begin{gathered} \omega_{12}(T) = \kappa,\\ \omega_{13}(T) = 0,\\ \omega_{23}(T) = \tau. \end{gathered}$$
Then deduce the Frenet formulas from the connection equations. (*Hint:* [[ex:2.5.5]].)`,
      solution: md`By [[ex:2.5.5]](a), $\nabla_{T(s)}E_i = (E_i$ restricted to $\beta)'(s)$; so $\nabla_TE_1 = T'$, $\nabla_TE_2 = N'$, $\nabla_TE_3 = B'$. Hence, by [[2.7.1]],
$$\begin{gathered} \omega_{12}(T) = T' \bullet N = \kappa,\\ \omega_{13}(T) = T' \bullet B = \kappa N \bullet B = 0,\\ \omega_{23}(T) = N' \bullet B = -N \bullet B' = \tau \end{gathered}$$
using only the definitions $T' = \kappa N$, $B' = -\tau N$ and $N \bullet B = 0$.

The connection equations ([[2.7.2]]) evaluated on $T$ now read
$$T' = \omega_{12}(T)N + \omega_{13}(T)B = \kappa N, \quad N' = -\omega_{12}(T)T + \omega_{23}(T)B = -\kappa T + \tau B, \quad B' = -\omega_{13}(T)T - \omega_{23}(T)N = -\tau N,$$
which are the Frenet formulas ([[2.3.2]]).`,
    },
  ]),

  // §2.8 The Structural Equations
  exercises(2, 8, 98, [
    {
      statement: md`For a 1-form $\phi = \sum f_i\theta_i$, prove
$$d\phi = \sum_j\Big\{df_j + \sum_i f_i\,\omega_{ij}\Big\} \wedge \theta_j.$$
(Compare [[ex:2.7.5]].)`,
      solution: md`By [[1.6.4]], $d\phi = \sum_i (df_i \wedge \theta_i + f_i\,d\theta_i)$. The first structural equations ([[2.8.3]]) give $d\theta_i = \sum_j \omega_{ij} \wedge \theta_j$. So
$$d\phi = \sum_j df_j \wedge \theta_j + \sum_j \sum_i f_i\,\omega_{ij} \wedge \theta_j = \sum_j\Big\{df_j + \sum_i f_i\,\omega_{ij}\Big\} \wedge \theta_j.$$`,
    },
    {
      statement: md`Check all the structural equations of the spherical frame field.`,
      solution: md`From Example [[2.8.4]] and [[ex:2.7.4]]: $\theta_1 = d\rho$, $\theta_2 = \rho\cos\varphi\,d\vartheta$, $\theta_3 = \rho\,d\varphi$; $\omega_{12} = \cos\varphi\,d\vartheta$, $\omega_{13} = d\varphi$, $\omega_{23} = \sin\varphi\,d\vartheta$.

*First structural equations* $d\theta_i = \sum_j \omega_{ij} \wedge \theta_j$:
- $d\theta_1 = 0$, and $\omega_{12} \wedge \theta_2 + \omega_{13} \wedge \theta_3 = \rho\cos^2\varphi\,d\vartheta\,d\vartheta + \rho\,d\varphi\,d\varphi = 0$.
- $d\theta_2 = \cos\varphi\,d\rho\,d\vartheta - \rho\sin\varphi\,d\varphi\,d\vartheta$, and $\omega_{21} \wedge \theta_1 + \omega_{23} \wedge \theta_3 = -\cos\varphi\,d\vartheta\,d\rho + \rho\sin\varphi\,d\vartheta\,d\varphi$ — the same.
- $d\theta_3 = d\rho\,d\varphi$, and $\omega_{31} \wedge \theta_1 + \omega_{32} \wedge \theta_2 = -d\varphi\,d\rho - \rho\sin\varphi\cos\varphi\,d\vartheta\,d\vartheta = d\rho\,d\varphi$.

*Second structural equations* $d\omega_{ij} = \sum_k \omega_{ik} \wedge \omega_{kj}$:
- $d\omega_{12} = -\sin\varphi\,d\varphi\,d\vartheta$, and $\omega_{13} \wedge \omega_{32} = d\varphi \wedge (-\sin\varphi\,d\vartheta)$ — the same.
- $d\omega_{13} = 0$, and $\omega_{12} \wedge \omega_{23} = \cos\varphi\sin\varphi\,d\vartheta\,d\vartheta = 0$.
- $d\omega_{23} = \cos\varphi\,d\varphi\,d\vartheta$, and $\omega_{21} \wedge \omega_{13} = -\cos\varphi\,d\vartheta\,d\varphi = \cos\varphi\,d\varphi\,d\vartheta$.`,
    },
    {
      statement: md`For the cylindrical frame field $E_1, E_2, E_3$:
(a) Starting from the basic cylindrical equations $x = r\cos\vartheta$, $y = r\sin\vartheta$, $z = z$, show that the dual 1-forms are $\theta_1 = dr$, $\theta_2 = r\,d\vartheta$, $\theta_3 = dz$.
(b) Deduce that $E_1[r] = 1$, $E_2[\vartheta] = 1/r$, $E_3[z] = 1$ and that the other six possibilities $E_1[\vartheta], \dots$ are all zero.
(c) For a function $f(r, \vartheta, z)$, show that
$$\begin{gathered} E_1[f] = \frac{\partial f}{\partial r},\\ E_2[f] = \frac1r\frac{\partial f}{\partial\vartheta},\\ E_3[f] = \frac{\partial f}{\partial z}. \end{gathered}$$`,
      solution: md`(a) $\theta_i(\mathbf{v}) = \mathbf{v} \bullet E_i = \sum_j a_{ij}v_j$, so $\theta = A\,d\xi$, where $\theta$ and $d\xi$ are the columns of $\theta_i$ and of $dx, dy, dz$, and $A$ is the attitude matrix. With $dx = \cos\vartheta\,dr - r\sin\vartheta\,d\vartheta$ and $dy = \sin\vartheta\,dr + r\cos\vartheta\,d\vartheta$:
$$\begin{gathered} \theta_1 = \cos\vartheta\,dx + \sin\vartheta\,dy = dr,\\ \theta_2 = -\sin\vartheta\,dx + \cos\vartheta\,dy = r\,d\vartheta,\\ \theta_3 = dz. \end{gathered}$$

(b) $\theta_i(E_j) = \delta_{ij}$ ([[2.8.1]]) and $E_j[g] = dg(E_j)$. So $E_1[r] = dr(E_1) = \theta_1(E_1) = 1$, $E_2[\vartheta] = \theta_2(E_2)/r = 1/r$, $E_3[z] = \theta_3(E_3) = 1$, while $E_2[r] = \theta_1(E_2) = 0$, $E_1[\vartheta] = \theta_2(E_1)/r = 0$, and so on for the other six.

(c) By the chain rule, $df = f_r\,dr + f_\vartheta\,d\vartheta + f_z\,dz$, so $E_i[f] = f_r\,E_i[r] + f_\vartheta\,E_i[\vartheta] + f_z\,E_i[z]$; by (b) this gives the three formulas.`,
    },
    {
      statement: md`*Frame fields on* $\mathbf{R}^2$. Given a frame field $E_1, E_2$ on $\mathbf{R}^2$ there is an angle function $\psi$ such that
$$E_1 = \cos\psi\,U_1 + \sin\psi\,U_2, \qquad E_2 = -\sin\psi\,U_1 + \cos\psi\,U_2.$$
(a) Express the connection form and dual 1-forms in terms of $\psi$ and the natural coordinates $x, y$.
(b) What are the structural equations in this case? Check that the results in part (a) satisfy these equations.
(*Hint:* defining $E_3 = U_3$ gives a frame field on $\mathbf{R}^3$.)`,
      solution: md`(a) $dE_1 = (-\sin\psi, \cos\psi)\,d\psi = E_2\,d\psi$, so the only connection form is $\omega_{12} = dE_1 \bullet E_2 = d\psi = \psi_x\,dx + \psi_y\,dy$. The dual forms are $\theta_i(\mathbf{v}) = \mathbf{v} \bullet E_i$:
$$\theta_1 = \cos\psi\,dx + \sin\psi\,dy, \qquad \theta_2 = -\sin\psi\,dx + \cos\psi\,dy.$$

(b) With $E_3 = U_3$: $\omega_{13} = \omega_{23} = 0$, $\theta_3 = dz$, and [[2.8.3]] reduces to
$$\begin{gathered} d\theta_1 = \omega_{12} \wedge \theta_2,\\ d\theta_2 = -\omega_{12} \wedge \theta_1,\\ d\omega_{12} = 0. \end{gathered}$$
Check: $d\theta_1 = -\sin\psi\,d\psi\,dx + \cos\psi\,d\psi\,dy = d\psi \wedge \theta_2$; $d\theta_2 = -\cos\psi\,d\psi\,dx - \sin\psi\,d\psi\,dy = -d\psi \wedge \theta_1$; $d\omega_{12} = d(d\psi) = 0$ ([[ex:1.6.3]]).`,
    },
  ]),
];
