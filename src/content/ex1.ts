// Exercises of Chapter 1. Statements keep the book's numbering, data and notation (wording is ours);
// solutions are worked out in full and agree with the book's answers to the odd-numbered exercises.

import { exercises } from './exercises';
import { md } from './helpers';
import type { ExerciseSet } from './types';

export const EX1: ExerciseSet[] = [
  // §1.1 Euclidean Space
  exercises(1, 1, 5, [
    {
      statement: md`Let $f = x^2y$ and $g = y\sin z$ be functions on $\mathbf{R}^3$. Write the following functions in terms of $x, y, z$:
(a) $fg^2$.
(b) $\dfrac{\partial f}{\partial x}\,g + \dfrac{\partial g}{\partial y}\,f$.
(c) $\dfrac{\partial^2(fg)}{\partial y\,\partial z}$.
(d) $\dfrac{\partial}{\partial y}(\sin f)$.`,
      solution: md`Functions are combined pointwise, so we simply compute with the expressions in $x, y, z$.

(a) $fg^2 = x^2y\,(y\sin z)^2 = x^2y^3\sin^2 z$.
(b) $\partial f/\partial x = 2xy$ and $\partial g/\partial y = \sin z$, so the function is $2xy \cdot y\sin z + \sin z \cdot x^2y = 2xy^2\sin z + x^2y\sin z$.
(c) $fg = x^2y^2\sin z$; differentiating in $z$ gives $x^2y^2\cos z$, then in $y$: $2x^2y\cos z$.
(d) By the chain rule, $\cos(x^2y)\,\partial(x^2y)/\partial y = x^2\cos(x^2y)$.`,
    },
    {
      statement: md`Find the value of the function $f = x^2y - y^2z$ at each point:
(a) $(1, 1, 1)$.
(b) $(3, -1, \tfrac12)$.
(c) $(a, 1, 1 - a)$.
(d) $(t, t^2, t^3)$.`,
      solution: md`$f(\mathbf{p}) = p_1^2p_2 - p_2^2p_3$ for $\mathbf{p} = (p_1, p_2, p_3)$.

(a) $1 - 1 = 0$.
(b) $9 \cdot (-1) - 1 \cdot \tfrac12 = -\tfrac{19}{2}$.
(c) $a^2 - (1 - a) = a^2 + a - 1$.
(d) $t^2 \cdot t^2 - t^4 \cdot t^3 = t^4 - t^7$.`,
    },
    {
      statement: md`Express $\partial f/\partial x$ in terms of $x$, $y$ and $z$ when
(a) $f = x\sin(xy) + y\cos(xz)$.
(b) $f = \sin g$, $g = e^h$, $h = x^2 + y^2 + z^2$.`,
      solution: md`(a) Product and chain rules: $\dfrac{\partial f}{\partial x} = \sin(xy) + xy\cos(xy) - yz\sin(xz)$.

(b) By the chain rule, $\dfrac{\partial f}{\partial x} = \cos g\,\dfrac{\partial g}{\partial x} = \cos(e^h)\,e^h\,\dfrac{\partial h}{\partial x} = 2x\,e^h\cos(e^h)$, where $h = x^2 + y^2 + z^2$.`,
    },
    {
      statement: md`If $g_1, g_2, g_3$ and $h$ are real-valued functions on $\mathbf{R}^3$, then $f = h(g_1, g_2, g_3)$ denotes the function such that
$$f(\mathbf{p}) = h\big(g_1(\mathbf{p}), g_2(\mathbf{p}), g_3(\mathbf{p})\big) \quad\text{for all } \mathbf{p}.$$
(In particular $f = f(x, y, z)$.) Express $\partial f/\partial x$ in terms of $x$, $y$ and $z$, if $h = x^2 - yz$ and
(a) $f = h(x + y,\ y^2,\ x + z)$.
(b) $f = h(e^z,\ e^{x+y},\ e^x)$.
(c) $f = h(x,\ -x,\ x)$.`,
      solution: md`Since $h = x^2 - yz$, we have $h(g_1, g_2, g_3) = g_1^2 - g_2g_3$.

(a) $f = (x + y)^2 - y^2(x + z)$, so $\partial f/\partial x = 2(x + y) - y^2$.
(b) $f = e^{2z} - e^{x+y}e^x = e^{2z} - e^{2x+y}$, so $\partial f/\partial x = -2e^{2x+y}$.
(c) $f = x^2 - (-x)x = 2x^2$, so $\partial f/\partial x = 4x$.`,
    },
  ]),

  // §1.2 Tangent Vectors
  exercises(1, 2, 11, [
    {
      statement: md`Let $\mathbf{v} = (-2, 1, -1)$ and $\mathbf{w} = (0, 1, 3)$.
(a) At an arbitrary point $\mathbf{p}$, express the tangent vector $3\mathbf{v}_\mathbf{p} - 2\mathbf{w}_\mathbf{p}$ as a linear combination of $U_1(\mathbf{p}), U_2(\mathbf{p}), U_3(\mathbf{p})$.
(b) For $\mathbf{p} = (1, 1, 0)$, make an accurate sketch of the four tangent vectors $\mathbf{v}_\mathbf{p}$, $\mathbf{w}_\mathbf{p}$, $-2\mathbf{v}_\mathbf{p}$ and $\mathbf{v}_\mathbf{p} + \mathbf{w}_\mathbf{p}$.`,
      solution: md`(a) The operations of $T_\mathbf{p}(\mathbf{R}^3)$ act on vector parts: $3\mathbf{v}_\mathbf{p} - 2\mathbf{w}_\mathbf{p} = (3\mathbf{v} - 2\mathbf{w})_\mathbf{p} = (-6, 1, -9)_\mathbf{p}$. With the identity $(a_1, a_2, a_3)_\mathbf{p} = \sum a_iU_i(\mathbf{p})$,
$$3\mathbf{v}_\mathbf{p} - 2\mathbf{w}_\mathbf{p} = -6U_1(\mathbf{p}) + U_2(\mathbf{p}) - 9U_3(\mathbf{p}).$$

(b) All four arrows start at $\mathbf{p} = (1, 1, 0)$; the arrow of $\mathbf{u}_\mathbf{p}$ ends at $\mathbf{p} + \mathbf{u}$:
- $\mathbf{v}_\mathbf{p}$ ends at $(-1, 2, -1)$;
- $\mathbf{w}_\mathbf{p}$ ends at $(1, 2, 3)$;
- $-2\mathbf{v}_\mathbf{p} = (4, -2, 2)_\mathbf{p}$ ends at $(5, -1, 2)$ — twice as long as $\mathbf{v}_\mathbf{p}$, opposite direction;
- $\mathbf{v}_\mathbf{p} + \mathbf{w}_\mathbf{p} = (-2, 2, 2)_\mathbf{p}$ ends at $(-1, 3, 2)$ — the diagonal of the parallelogram on $\mathbf{v}_\mathbf{p}$ and $\mathbf{w}_\mathbf{p}$.

The sandbox draws them exactly: use the *Tangent vector* tool in the 3D view.`,
    },
    {
      statement: md`Let $V = xU_1 + yU_2$ and $W = 2x^2U_2 - U_3$. Compute the vector field $W - xV$, and find its value at the point $\mathbf{p} = (-1, 0, 2)$.`,
      solution: md`Working with Euclidean coordinate functions,
$$W - xV = 2x^2U_2 - U_3 - x^2U_1 - xyU_2 = -x^2U_1 + (2x^2 - xy)U_2 - U_3.$$
At $\mathbf{p} = (-1, 0, 2)$ the coordinate functions take the values $-1$, $2$ and $-1$, so
$$(W - xV)(\mathbf{p}) = -U_1(\mathbf{p}) + 2U_2(\mathbf{p}) - U_3(\mathbf{p}) = (-1, 2, -1)_\mathbf{p}.$$`,
    },
    {
      statement: md`In each case, express the given vector field $V$ in the standard form $\sum v_iU_i$.
(a) $2z^2U_1 = 7V + xyU_3$.
(b) $V(\mathbf{p}) = (p_1,\ p_3 - p_1,\ 0)_\mathbf{p}$ for all $\mathbf{p}$.
(c) $V = 2(xU_1 + yU_2) - x(U_1 - y^2U_3)$.
(d) At each point $\mathbf{p}$, $V(\mathbf{p})$ is the vector from the point $(p_1, p_2, p_3)$ to the point $(1 + p_1,\ p_2p_3,\ p_2)$.
(e) At each point $\mathbf{p}$, $V(\mathbf{p})$ is the vector from $\mathbf{p}$ to the origin.`,
      solution: md`(a) $V = \tfrac17(2z^2U_1 - xyU_3) = (2z^2/7)\,U_1 - (xy/7)\,U_3$.

(b) The vector part of $V(\mathbf{p})$ is $(x(\mathbf{p}),\ z(\mathbf{p}) - x(\mathbf{p}),\ 0)$, so $V = xU_1 + (z - x)U_2$.

(c) Expanding, $V = 2xU_1 + 2yU_2 - xU_1 + xy^2U_3 = xU_1 + 2yU_2 + xy^2U_3$.

(d) The vector from $\mathbf{p}$ to $\mathbf{q}$ is $\mathbf{q} - \mathbf{p}$, here $(1,\ p_2p_3 - p_2,\ p_2 - p_3)$. Hence $V = U_1 + (yz - y)U_2 + (y - z)U_3$.

(e) The vector part is $\mathbf{0} - \mathbf{p} = -\mathbf{p}$, so $V = -xU_1 - yU_2 - zU_3$.`,
    },
    {
      statement: md`If $V = y^2U_1 - x^2U_3$ and $W = x^2U_1 - zU_2$, find functions $f$ and $g$ such that the vector field $fV + gW$ can be expressed in terms of $U_2$ and $U_3$ only.`,
      solution: md`$fV + gW = (fy^2 + gx^2)\,U_1 - gz\,U_2 - fx^2\,U_3$. We need $fy^2 + gx^2 = 0$; for instance $f = x^2$ and $g = -y^2$. Then
$$fV + gW = y^2z\,U_2 - x^4\,U_3.$$
(More generally $f = x^2k$, $g = -y^2k$ for any function $k$.)`,
    },
    {
      statement: md`Let $V_1 = U_1 - xU_3$, $V_2 = U_2$ and $V_3 = xU_1 + U_3$.
(a) Prove that the vectors $V_1(\mathbf{p}), V_2(\mathbf{p}), V_3(\mathbf{p})$ are linearly independent at each point of $\mathbf{R}^3$.
(b) Express the vector field $xU_1 + yU_2 + zU_3$ as a linear combination of $V_1, V_2, V_3$.`,
      solution: md`(a) At $\mathbf{p}$, with $a = p_1 = x(\mathbf{p})$, the vector parts are $(1, 0, -a)$, $(0, 1, 0)$, $(a, 0, 1)$. Their determinant is
$$\begin{vmatrix} 1 & 0 & -a \\ 0 & 1 & 0 \\ a & 0 & 1 \end{vmatrix} = 1 + a^2 \neq 0,$$
so the three vectors are linearly independent (at every point).

(b) We look for functions $f_1, f_2, f_3$ with $f_1V_1 + f_2V_2 + f_3V_3 = (f_1 + xf_3)\,U_1 + f_2\,U_2 + (-xf_1 + f_3)\,U_3 = xU_1 + yU_2 + zU_3$. So $f_2 = y$ and
$$f_1 + xf_3 = x, \qquad -xf_1 + f_3 = z.$$
By Cramer's rule (the determinant is $1 + x^2$),
$$f_1 = \frac{x(1 - z)}{1 + x^2}, \qquad f_3 = \frac{x^2 + z}{1 + x^2},$$
hence $xU_1 + yU_2 + zU_3 = \dfrac{x(1 - z)}{1 + x^2}\,V_1 + y\,V_2 + \dfrac{x^2 + z}{1 + x^2}\,V_3$.`,
    },
  ]),

  // §1.3 Directional Derivatives
  exercises(1, 3, 15, [
    {
      statement: md`Let $\mathbf{v}_\mathbf{p}$ be the tangent vector to $\mathbf{R}^3$ with $\mathbf{v} = (2, -1, 3)$ and $\mathbf{p} = (2, 0, -1)$. Working directly from the definition, compute the directional derivative $\mathbf{v}_\mathbf{p}[f]$, where
(a) $f = y^2z$.
(b) $f = x^7$.
(c) $f = e^x\cos y$.`,
      solution: md`By [[1.3.1]], $\mathbf{v}_\mathbf{p}[f] = \dfrac{d}{dt}\Big|_{t=0} f(\mathbf{p} + t\mathbf{v})$, and $\mathbf{p} + t\mathbf{v} = (2 + 2t,\ -t,\ -1 + 3t)$.

(a) $f(\mathbf{p} + t\mathbf{v}) = t^2(-1 + 3t) = -t^2 + 3t^3$; its derivative $-2t + 9t^2$ vanishes at $t = 0$: $\mathbf{v}_\mathbf{p}[f] = 0$.
(b) $f(\mathbf{p} + t\mathbf{v}) = (2 + 2t)^7$; the derivative at $0$ is $7 \cdot 2^6 \cdot 2 = 7 \cdot 2^7 = 896$.
(c) $f(\mathbf{p} + t\mathbf{v}) = e^{2+2t}\cos t$; the derivative $e^{2+2t}(2\cos t - \sin t)$ equals $2e^2$ at $t = 0$.`,
    },
    {
      statement: md`Compute the derivatives in [[ex:1.3.1]] using [[1.3.2]].`,
      solution: md`[[1.3.2]] gives $\mathbf{v}_\mathbf{p}[f] = \sum v_i\,\dfrac{\partial f}{\partial x_i}(\mathbf{p})$ with $\mathbf{v} = (2, -1, 3)$, $\mathbf{p} = (2, 0, -1)$.

(a) The partial derivatives of $y^2z$ are $(0,\ 2yz,\ y^2)$, which is $(0, 0, 0)$ at $\mathbf{p}$; so $\mathbf{v}_\mathbf{p}[f] = 0$.
(b) The only nonzero partial derivative is $7x^6 = 7 \cdot 2^6$ at $\mathbf{p}$; so $\mathbf{v}_\mathbf{p}[f] = 2 \cdot 7 \cdot 2^6 = 7 \cdot 2^7$.
(c) The partial derivatives are $(e^x\cos y,\ -e^x\sin y,\ 0)$, equal to $(e^2, 0, 0)$ at $\mathbf{p}$; so $\mathbf{v}_\mathbf{p}[f] = 2e^2$.

Same answers as in [[ex:1.3.1]], with much less work.`,
    },
    {
      statement: md`Let $V = y^2U_1 - xU_3$, and let $f = xy$, $g = z^3$. Compute the functions
(a) $V[f]$.
(b) $V[g]$.
(c) $V[fg]$.
(d) $fV[g] - gV[f]$.
(e) $V[f^2 + g^2]$.
(f) $V[V[f]]$.`,
      solution: md`Since $U_i[h] = \partial h/\partial x_i$, we have $V[h] = y^2\,\dfrac{\partial h}{\partial x} - x\,\dfrac{\partial h}{\partial z}$.

(a) $V[f] = y^2 \cdot y - x \cdot 0 = y^3$.
(b) $V[g] = y^2 \cdot 0 - x \cdot 3z^2 = -3xz^2$.
(c) $fg = xyz^3$, so $V[fg] = y^2 \cdot yz^3 - x \cdot 3xyz^2 = yz^2(y^2z - 3x^2)$. (Leibniz rule check: $V[f]\,g + f\,V[g] = y^3z^3 - 3x^2yz^2$.)
(d) $fV[g] - gV[f] = xy(-3xz^2) - z^3y^3 = -3x^2yz^2 - y^3z^3$.
(e) $V[f^2 + g^2] = 2fV[f] + 2gV[g] = 2xy^4 - 6xz^5 = 2x(y^4 - 3z^5)$.
(f) $V[V[f]] = V[y^3] = y^2 \cdot 0 - x \cdot 0 = 0$.`,
    },
    {
      statement: md`Prove the identity $V = \sum V[x_i]\,U_i$, where $x_1, x_2, x_3$ are the natural coordinate functions. (*Hint:* evaluate $V = \sum v_iU_i$ on $x_j$.)`,
      solution: md`Write $V = \sum_i v_iU_i$ ([[1.2.5]]). By linearity of $V[\,\cdot\,]$ in $V$ ([[1.3.4]]) and $U_i[x_j] = \partial x_j/\partial x_i = \delta_{ij}$,
$$V[x_j] = \sum_i v_i\,U_i[x_j] = \sum_i v_i\,\delta_{ij} = v_j.$$
So the Euclidean coordinate functions of $V$ are $v_j = V[x_j]$, that is, $V = \sum V[x_i]\,U_i$.`,
    },
    {
      statement: md`If $V[f] = W[f]$ for every function $f$ on $\mathbf{R}^3$, prove that $V = W$.`,
      solution: md`Apply the hypothesis to the coordinate functions: $V[x_i] = W[x_i]$ for $i = 1, 2, 3$. By [[ex:1.3.4]],
$$V = \sum V[x_i]\,U_i = \sum W[x_i]\,U_i = W.$$`,
    },
  ]),
  // §1.4 Curves in R³
  exercises(1, 4, 22, [
    {
      statement: md`Compute the velocity vector of the curve in Example [[1.4.2]](3) for arbitrary $t$, and for $t = 0$, $t = \pi/2$, $t = \pi$, visualizing these on Fig. 1.8.`,
      solution: md`The curve is $\alpha(t) = \left(1 + \cos t,\ \sin t,\ 2\sin\tfrac{t}{2}\right)$. By [[1.4.3]],
$$\alpha'(t) = \left(-\sin t,\ \cos t,\ \cos\tfrac{t}{2}\right) \quad\text{at } \alpha(t).$$
- $t = 0$: $\alpha'(0) = (0, 1, 1)$ at $(2, 0, 0)$;
- $t = \pi/2$: $\alpha'(\pi/2) = (-1, 0, 1/\sqrt2)$ at $(1, 1, \sqrt2)$;
- $t = \pi$: $\alpha'(\pi) = (0, -1, 0)$ at $(0, 0, 2)$ — horizontal, at the top of the sphere.

To see them, open the figure of Example [[1.4.2]] (where this curve is called \`gamma\`) and, in Sandbox mode, type \`Velocity(gamma, pi/2)\` in the command bar.`,
    },
    {
      statement: md`Find the unique curve $\alpha$ such that $\alpha(0) = (1, 0, 5)$ and $\alpha'(t) = (t^2, t, e^t)$.`,
      solution: md`Each coordinate function is determined by its derivative and its value at $0$: integrating,
$$\alpha(t) = \left(1 + \tfrac{t^3}{3},\ \tfrac{t^2}{2},\ 4 + e^t\right).$$
(Uniqueness: two such curves have the same derivative, so their difference is constant, and it is $0$ at $t = 0$.)`,
    },
    {
      statement: md`Find the coordinate functions of the curve $\beta = \alpha(h)$, where $\alpha$ is the curve in Example [[1.4.2]](3) and $h(s) = \cos^{-1}(s)$ on $J\colon 0 < s < 1$.`,
      solution: md`For $0 < s < 1$, $h(s) \in (0, \pi/2)$, so $\cos h = s$, $\sin h = \sqrt{1 - s^2}$ and $\sin\tfrac h2 = \sqrt{\tfrac{1 - \cos h}{2}} = \sqrt{\tfrac{1 - s}{2}}$. Hence
$$\beta(s) = \alpha(h(s)) = \left(1 + s,\ \sqrt{1 - s^2},\ \sqrt2\,\sqrt{1 - s}\right).$$`,
    },
    {
      statement: md`Reparametrize the curve $\alpha$ of Example [[1.4.2]](4) using $h(s) = \log s$ on $J\colon s > 0$. Check the equation in [[1.4.5]] in this case by calculating each side separately.`,
      solution: md`With $\alpha(t) = (e^t, e^{-t}, \sqrt2\,t)$, the reparametrization is $\beta(s) = \alpha(\log s) = (s,\ 1/s,\ \sqrt2\log s)$.

Left side: $\beta'(s) = (1,\ -1/s^2,\ \sqrt2/s)$ at $\beta(s)$.

Right side: $h'(s) = 1/s$ and $\alpha'(t) = (e^t, -e^{-t}, \sqrt2)$, so $\alpha'(h(s)) = (s, -1/s, \sqrt2)$ at $\alpha(h(s)) = \beta(s)$, and
$$\frac{dh}{ds}(s)\,\alpha'(h(s)) = \frac1s\,(s,\ -1/s,\ \sqrt2) = (1,\ -1/s^2,\ \sqrt2/s).$$
Both sides agree, as [[1.4.5]] asserts.`,
    },
    {
      statement: md`Find the equation of the straight line through the points $(1, -3, -1)$ and $(6, 2, 1)$. Does this line meet the line through the points $(-1, 1, 0)$ and $(-5, -1, -1)$?`,
      solution: md`The first line is $\alpha(t) = (1, -3, -1) + t(5, 5, 2) = (1 + 5t,\ -3 + 5t,\ -1 + 2t)$; the second is $\beta(u) = (-1, 1, 0) + u(-4, -2, -1) = (-1 - 4u,\ 1 - 2u,\ -u)$.

They meet if $\alpha(t) = \beta(u)$ for some $t, u$. The third coordinates give $u = 1 - 2t$; then the first gives $1 + 5t = -5 + 8t$, so $t = 2$, $u = -3$. The second coordinates agree: $-3 + 10 = 7 = 1 + 6$. So the lines meet, at the point $\alpha(2) = \beta(-3) = (11, 7, 3)$.`,
    },
    {
      statement: md`Deduce from [[1.4.6]] that in the definition of directional derivative ([[1.3.1]]) the straight line $t \mapsto \mathbf{p} + t\mathbf{v}$ can be replaced by any curve $\alpha$ with *initial velocity* $\mathbf{v}_\mathbf{p}$, that is, such that $\alpha(0) = \mathbf{p}$ and $\alpha'(0) = \mathbf{v}_\mathbf{p}$.`,
      solution: md`[[1.4.6]] holds for every curve: $\alpha'(t)[f] = \dfrac{d(f(\alpha))}{dt}(t)$. At $t = 0$, with $\alpha'(0) = \mathbf{v}_\mathbf{p}$,
$$\mathbf{v}_\mathbf{p}[f] = \alpha'(0)[f] = \frac{d}{dt}\Big|_{t=0} f(\alpha(t)).$$
The straight line $t \mapsto \mathbf{p} + t\mathbf{v}$ is one such curve, which gives back [[1.3.1]]; any other curve through $\mathbf{p}$ with the same initial velocity gives the same number.`,
    },
    {
      statement: md`(*Continuation.*)
(a) Show that the curves with coordinate functions $(t,\ 1 + t^2,\ t)$, $(\sin t,\ \cos t,\ t)$, $(\sinh t,\ \cosh t,\ t)$ all have the same initial velocity $\mathbf{v}_\mathbf{p}$.
(b) If $f = x^2 - y^2 + z^2$, compute $\mathbf{v}_\mathbf{p}[f]$ by calculating $d(f(\alpha))/dt$ at $t = 0$, using each of the three curves in (a).`,
      solution: md`(a) At $t = 0$ the three curves pass through $\mathbf{p} = (0, 1, 0)$. Their velocities are $(1, 2t, 1)$, $(\cos t, -\sin t, 1)$ and $(\cosh t, \sinh t, 1)$, all equal to $(1, 0, 1)$ at $t = 0$. So the common initial velocity is $\mathbf{v}_\mathbf{p} = (1, 0, 1)_\mathbf{p}$, $\mathbf{p} = (0, 1, 0)$.

(b) Along each curve:
- $f(t, 1 + t^2, t) = t^2 - (1 + t^2)^2 + t^2 = -1 - t^4$, derivative $-4t^3 = 0$ at $t = 0$;
- $f(\sin t, \cos t, t) = -\cos 2t + t^2$, derivative $2\sin 2t + 2t = 0$ at $t = 0$;
- $f(\sinh t, \cosh t, t) = -1 + t^2$, derivative $2t = 0$ at $t = 0$.

All three give $\mathbf{v}_\mathbf{p}[f] = 0$, as predicted by [[ex:1.4.6]]. (Check with [[1.3.2]]: the partial derivatives of $f$ at $\mathbf{p}$ are $(0, -2, 0)$, and $(0, -2, 0) \bullet (1, 0, 1) = 0$.)`,
    },
    {
      statement: md`Sketch the following Curves in $\mathbf{R}^2$, and find parametrizations for each.
(a) $C\colon 4x^2 + y^2 = 1$.
(b) $C\colon 3x + 4y = 1$.
(c) $C\colon y = e^x$.`,
      solution: md`(a) An ellipse centered at the origin, with semi-axes $\tfrac12$ along the $x$ axis and $1$ along the $y$ axis: $\alpha(t) = \left(\tfrac12\cos t,\ \sin t\right)$, $0 \le t < 2\pi$ (periodic).

(b) A straight line through $(-1, 1)$ and $(3, -2)$: $\alpha(t) = (-1 + 4t,\ 1 - 3t)$ — indeed $3(-1 + 4t) + 4(1 - 3t) = 1$.

(c) The graph of the exponential: $\alpha(t) = (t, e^t)$, $t \in \mathbf{R}$.

In the 2D view of the sandbox, $C$ in (a) and (b) can be drawn as level curves (\`4x^2 + y^2 = 1\`), and the parametrizations as curves — they coincide.`,
    },
    {
      statement: md`For a fixed $t$, the *tangent line* to a regular curve $\alpha$ at the point $\alpha(t)$ is the straight line $u \mapsto \alpha(t) + u\,\alpha'(t)$, where we delete the point of application of $\alpha'(t)$. Find the tangent line to the helix $\alpha(t) = (2\cos t,\ 2\sin t,\ t)$ at the points $\alpha(0)$ and $\alpha(\pi/4)$.`,
      solution: md`$\alpha'(t) = (-2\sin t,\ 2\cos t,\ 1)$.

- At $\alpha(0) = (2, 0, 0)$: $\alpha'(0) = (0, 2, 1)$, so the tangent line is $u \mapsto (2,\ 2u,\ u)$.
- At $\alpha(\pi/4) = (\sqrt2, \sqrt2, \pi/4)$: $\alpha'(\pi/4) = (-\sqrt2, \sqrt2, 1)$, so the tangent line is $u \mapsto \left(\sqrt2(1 - u),\ \sqrt2(1 + u),\ \tfrac\pi4 + u\right)$.`,
    },
  ]),

  // §1.5 1-Forms
  exercises(1, 5, 27, [
    {
      statement: md`Let $\mathbf{v} = (1, 2, -3)$ and $\mathbf{p} = (0, -2, 1)$. Evaluate the following 1-forms on the tangent vector $\mathbf{v}_\mathbf{p}$.
(a) $y^2\,dx$.
(b) $z\,dy - y\,dz$.
(c) $(z^2 - 1)\,dx - dy + x^2\,dz$.`,
      solution: md`Since $dx_i(\mathbf{v}_\mathbf{p}) = v_i$ ([[1.5.3]]), $\left(\sum f_i\,dx_i\right)(\mathbf{v}_\mathbf{p}) = \sum f_i(\mathbf{p})\,v_i$. At $\mathbf{p}$: $x = 0$, $y = -2$, $z = 1$.

(a) $4 \cdot 1 = 4$.
(b) $1 \cdot 2 - (-2)(-3) = -4$.
(c) $0 \cdot 1 - 2 + 0 \cdot (-3) = -2$.`,
    },
    {
      statement: md`If $\phi = \sum f_i\,dx_i$ and $V = \sum v_iU_i$, show that the 1-form $\phi$ evaluated on the vector field $V$ is the function $\phi(V) = \sum f_iv_i$.`,
      solution: md`$\phi(V)$ is the function whose value at $\mathbf{p}$ is $\phi(V(\mathbf{p}))$. Now $V(\mathbf{p}) = (v_1(\mathbf{p}), v_2(\mathbf{p}), v_3(\mathbf{p}))_\mathbf{p}$ and $dx_i$ picks out the $i$th coordinate of the vector part ([[1.5.3]]), so
$$\phi(V(\mathbf{p})) = \sum f_i(\mathbf{p})\,dx_i(V(\mathbf{p})) = \sum f_i(\mathbf{p})\,v_i(\mathbf{p}).$$
This holds at every point, hence $\phi(V) = \sum f_iv_i$.`,
    },
    {
      statement: md`Evaluate the 1-form $\phi = x^2\,dx - y^2\,dz$ on the vector fields $V = xU_1 + yU_2 + zU_3$, $W = xy\,(U_1 - U_3) + yz\,(U_1 - U_2)$, and $(1/x)V + (1/y)W$.`,
      solution: md`By [[ex:1.5.2]]:
- $\phi(V) = x^2 \cdot x - y^2 \cdot z = x^3 - y^2z$.
- $W = (xy + yz)\,U_1 - yz\,U_2 - xy\,U_3$, so $\phi(W) = x^2(xy + yz) + y^2 \cdot xy = x^3y + x^2yz + xy^3$.
- $\phi$ is linear over functions: $\phi(fV + gW) = f\phi(V) + g\phi(W)$ (pointwise, this is linearity of $\phi_\mathbf{p}$). So, where $x, y \neq 0$,
$$\phi\!\left(\tfrac1x V + \tfrac1y W\right) = \frac{x^3 - y^2z}{x} + \frac{x^3y + x^2yz + xy^3}{y} = x^2 - \frac{y^2z}{x} + x^3 + x^2z + xy^2.$$`,
    },
    {
      statement: md`Express the following differentials in terms of $df$:
(a) $d(f^5)$.
(b) $d(\sqrt f)$, where $f > 0$.
(c) $d(\log(1 + f^2))$.`,
      solution: md`By [[1.5.7]], $d(h(f)) = h'(f)\,df$:

(a) $d(f^5) = 5f^4\,df$.
(b) $d(\sqrt f) = \dfrac{df}{2\sqrt f}$.
(c) $d(\log(1 + f^2)) = \dfrac{2f\,df}{1 + f^2}$.`,
    },
    {
      statement: md`Express the differentials of the following functions in the standard form $\sum f_i\,dx_i$.
(a) $(x^2 + y^2 + z^2)^{1/2}$.
(b) $\tan^{-1}(y/x)$.`,
      solution: md`Use [[1.5.5]] (or [[1.5.7]]).

(a) With $r = (x^2 + y^2 + z^2)^{1/2}$: $dr = \dfrac{x\,dx + y\,dy + z\,dz}{(x^2 + y^2 + z^2)^{1/2}}$.

(b) $d\tan^{-1}(y/x) = \dfrac{1}{1 + y^2/x^2}\,d\!\left(\dfrac yx\right) = \dfrac{x^2}{x^2 + y^2}\cdot\dfrac{x\,dy - y\,dx}{x^2} = \dfrac{x\,dy - y\,dx}{x^2 + y^2}$.`,
    },
    {
      statement: md`In each case compute the differential of $f$ and find the directional derivative $\mathbf{v}_\mathbf{p}[f]$, for $\mathbf{v}_\mathbf{p}$ as in [[ex:1.5.1]].
(a) $f = xy^2 - yz^2$.
(b) $f = xe^{yz}$.
(c) $f = \sin(xy)\cos(xz)$.`,
      solution: md`$\mathbf{v}_\mathbf{p}[f] = df(\mathbf{v}_\mathbf{p})$, with $\mathbf{v} = (1, 2, -3)$ and $\mathbf{p} = (0, -2, 1)$.

(a) $df = y^2\,dx + (2xy - z^2)\,dy - 2yz\,dz$. At $\mathbf{p}$ the coefficients are $4, -1, 4$, so $\mathbf{v}_\mathbf{p}[f] = 4 - 2 - 12 = -10$.

(b) $df = e^{yz}\,dx + xze^{yz}\,dy + xye^{yz}\,dz$. At $\mathbf{p}$ the coefficients are $e^{-2}, 0, 0$, so $\mathbf{v}_\mathbf{p}[f] = e^{-2}$.

(c) $df = \big(y\cos(xy)\cos(xz) - z\sin(xy)\sin(xz)\big)\,dx + x\cos(xy)\cos(xz)\,dy - x\sin(xy)\sin(xz)\,dz$. At $\mathbf{p}$ (where $x = 0$) the coefficients are $-2, 0, 0$, so $\mathbf{v}_\mathbf{p}[f] = -2$.`,
    },
    {
      statement: md`Which of the following are 1-forms? In each case $\phi$ is the function on tangent vectors such that the value of $\phi$ on $(v_1, v_2, v_3)_\mathbf{p}$ is
(a) $v_1 - v_3$.
(b) $p_1 - p_3$.
(c) $v_1p_3 + v_2p_1$.
(d) $\mathbf{v}_\mathbf{p}[x^2 + y^2]$.
(e) $0$.
(f) $(p_1)^2$.
In case $\phi$ is a 1-form, express it as $\sum f_i\,dx_i$.`,
      solution: md`A 1-form must be linear on each tangent space ([[1.5.1]]); in particular it vanishes on the zero vector $\mathbf{0}_\mathbf{p}$.

(a) Linear in $\mathbf{v}$: $\phi = dx - dz$.
(b) Not a 1-form: its value on $\mathbf{0}_\mathbf{p}$ is $p_1 - p_3$, not always $0$.
(c) Linear in $\mathbf{v}$: $\phi = z\,dx + x\,dy$.
(d) This is $d(x^2 + y^2)(\mathbf{v}_\mathbf{p})$: $\phi = 2x\,dx + 2y\,dy$.
(e) The zero 1-form: $\phi = 0\,dx + 0\,dy + 0\,dz$.
(f) Not a 1-form, for the same reason as (b).`,
    },
    {
      statement: md`Prove [[1.5.6]] directly from the definition of $d$.`,
      solution: md`By [[1.5.2]], $df(\mathbf{v}_\mathbf{p}) = \mathbf{v}_\mathbf{p}[f]$. Using the Leibnizian property of directional derivatives ([[1.3.3]]),
$$d(fg)(\mathbf{v}_\mathbf{p}) = \mathbf{v}_\mathbf{p}[fg] = \mathbf{v}_\mathbf{p}[f]\,g(\mathbf{p}) + f(\mathbf{p})\,\mathbf{v}_\mathbf{p}[g] = g(\mathbf{p})\,df(\mathbf{v}_\mathbf{p}) + f(\mathbf{p})\,dg(\mathbf{v}_\mathbf{p}) = (g\,df + f\,dg)(\mathbf{v}_\mathbf{p}).$$
Since this holds for every tangent vector, $d(fg) = g\,df + f\,dg$.`,
    },
    {
      statement: md`A 1-form $\phi$ is *zero at a point* $\mathbf{p}$ provided $\phi(\mathbf{v}_\mathbf{p}) = 0$ for all tangent vectors at $\mathbf{p}$. A point at which its differential $df$ is zero is called a *critical point* of the function $f$. Prove that $\mathbf{p}$ is a critical point of $f$ if and only if
$$\frac{\partial f}{\partial x}(\mathbf{p}) = \frac{\partial f}{\partial y}(\mathbf{p}) = \frac{\partial f}{\partial z}(\mathbf{p}) = 0.$$
Find all critical points of $f = (1 - x^2)\,y + (1 - y^2)\,z$. (*Hint:* find the partial derivatives of $f$ by computing $df$.)`,
      solution: md`By [[1.5.5]], $df(\mathbf{v}_\mathbf{p}) = \sum \dfrac{\partial f}{\partial x_i}(\mathbf{p})\,v_i$. If the three partial derivatives vanish at $\mathbf{p}$, this is $0$ for every $\mathbf{v}$. Conversely, if $df$ is zero at $\mathbf{p}$, evaluating on $U_i(\mathbf{p})$ gives $\partial f/\partial x_i(\mathbf{p}) = 0$ for each $i$.

For $f = (1 - x^2)y + (1 - y^2)z$,
$$df = -2xy\,dx + (1 - x^2 - 2yz)\,dy + (1 - y^2)\,dz.$$
Critical points: $1 - y^2 = 0$ gives $y = \pm1$; then $xy = 0$ gives $x = 0$; then $1 - 2yz = 0$ gives $z = 1/(2y)$. So the critical points are $(0, 1, \tfrac12)$ and $(0, -1, -\tfrac12)$, that is, $\pm(0, 1, \tfrac12)$.`,
    },
    {
      statement: md`(*Continuation.*) Prove that the local maxima and local minima of $f$ are critical points of $f$. ($f$ has a *local maximum* at $\mathbf{p}$ if $f(\mathbf{q}) \le f(\mathbf{p})$ for all $\mathbf{q}$ near $\mathbf{p}$.)`,
      solution: md`Suppose $f$ has a local maximum at $\mathbf{p}$, and let $\mathbf{v}_\mathbf{p}$ be any tangent vector. The function $g(t) = f(\mathbf{p} + t\mathbf{v})$ of one variable has a local maximum at $t = 0$, so $g'(0) = 0$. But $g'(0) = \mathbf{v}_\mathbf{p}[f] = df(\mathbf{v}_\mathbf{p})$. Hence $df$ is zero at $\mathbf{p}$: $\mathbf{p}$ is a critical point. The case of a local minimum is the same (or apply the result to $-f$).`,
    },
    {
      statement: md`It is sometimes asserted that $df$ is the linear approximation of $\Delta f$.
(a) Explain the sense in which $(df)(\mathbf{v}_\mathbf{p})$ is a linear approximation of $f(\mathbf{p} + \mathbf{v}) - f(\mathbf{p})$.
(b) Compute exact and approximate values of $f(0.9, 1.6, 1.2) - f(1, 1.5, 1)$, where $f = x^2y/z$.`,
      solution: md`(a) Consider $g(t) = f(\mathbf{p} + t\mathbf{v})$. Its Taylor expansion at $0$ is $g(t) = g(0) + t\,g'(0) + O(t^2)$, and $g'(0) = \mathbf{v}_\mathbf{p}[f] = df(\mathbf{v}_\mathbf{p})$. For $t = 1$:
$$f(\mathbf{p} + \mathbf{v}) - f(\mathbf{p}) = df(\mathbf{v}_\mathbf{p}) + (\text{terms of order } \lVert\mathbf{v}\rVert^2).$$
So $df(\mathbf{v}_\mathbf{p})$, which depends *linearly* on $\mathbf{v}$, approximates the change $\Delta f$ of $f$ from $\mathbf{p}$ to $\mathbf{p} + \mathbf{v}$, with an error that is small compared with $\lVert\mathbf{v}\rVert$ when $\mathbf{v}$ is small.

(b) Exact: $f(0.9, 1.6, 1.2) = \dfrac{0.81 \cdot 1.6}{1.2} = 1.08$ and $f(1, 1.5, 1) = 1.5$, so $\Delta f = -0.420$.

Approximate: $\mathbf{p} = (1, 1.5, 1)$, $\mathbf{v} = (-0.1, 0.1, 0.2)$, and
$$df = \frac{2xy}{z}\,dx + \frac{x^2}{z}\,dy - \frac{x^2y}{z^2}\,dz,$$
with coefficients $3, 1, -1.5$ at $\mathbf{p}$. So $df(\mathbf{v}_\mathbf{p}) = -0.3 + 0.1 - 0.3 = -0.500$.`,
    },
  ]),

  // §1.6 Differential Forms
  exercises(1, 6, 32, [
    {
      statement: md`Let $\phi = yz\,dx + dz$, $\psi = \sin z\,dx + \cos z\,dy$, $\xi = dy + z\,dz$. Find the standard expressions (in terms of $dx\,dy, \dots$) for
(a) $\phi \wedge \psi$, $\psi \wedge \xi$, $\xi \wedge \phi$.
(b) $d\phi$, $d\psi$, $d\xi$.`,
      solution: md`Multiply out with the alternation rule $dx_i\,dx_j = -dx_j\,dx_i$, $dx_i\,dx_i = 0$ (as in [[1.6.1]]).

(a)
$$\phi \wedge \psi = yz\cos z\,dx\,dy + \sin z\,dz\,dx + \cos z\,dz\,dy = yz\cos z\,dx\,dy - \sin z\,dx\,dz - \cos z\,dy\,dz,$$
$$\psi \wedge \xi = \sin z\,dx\,dy + z\sin z\,dx\,dz + z\cos z\,dy\,dz,$$
$$\xi \wedge \phi = yz\,dy\,dx + dy\,dz + yz^2\,dz\,dx = -yz\,dx\,dy - yz^2\,dx\,dz + dy\,dz.$$

(b) By [[1.6.3]], $d\left(\sum f_i\,dx_i\right) = \sum df_i \wedge dx_i$:
$$d\phi = (z\,dy + y\,dz) \wedge dx = -z\,dx\,dy - y\,dx\,dz,$$
$$d\psi = \cos z\,dz \wedge dx - \sin z\,dz \wedge dy = -\cos z\,dx\,dz + \sin z\,dy\,dz,$$
$$d\xi = d(1) \wedge dy + dz \wedge dz = 0.$$`,
    },
    {
      statement: md`Let $\phi = dx/y$ and $\psi = z\,dy$. Check the Leibnizian formula (3) of [[1.6.4]] in this case by computing each term separately.`,
      solution: md`Formula (3) reads $d(\phi \wedge \psi) = d\phi \wedge \psi - \phi \wedge d\psi$.

- $\phi \wedge \psi = (z/y)\,dx\,dy$, so $d(\phi \wedge \psi) = d(z/y) \wedge dx\,dy = \left(\tfrac1y\,dz - \tfrac{z}{y^2}\,dy\right) \wedge dx\,dy = \tfrac1y\,dx\,dy\,dz$.
- $d\phi = d(1/y) \wedge dx = -\tfrac{1}{y^2}\,dy\,dx = \tfrac1{y^2}\,dx\,dy$, so $d\phi \wedge \psi = \tfrac{z}{y^2}\,dx\,dy\,dy = 0$.
- $d\psi = dz \wedge dy = -dy\,dz$, so $\phi \wedge d\psi = -\tfrac1y\,dx\,dy\,dz$.

Hence $d\phi \wedge \psi - \phi \wedge d\psi = \tfrac1y\,dx\,dy\,dz = d(\phi \wedge \psi)$.`,
    },
    {
      statement: md`For any function $f$ show that $d(df) = 0$. Deduce that $d(f\,dg) = df \wedge dg$.`,
      solution: md`$df = f_x\,dx + f_y\,dy + f_z\,dz$ (subscripts denote partial derivatives). Then
$$d(df) = df_x \wedge dx + df_y \wedge dy + df_z \wedge dz.$$
Expanding $df_x = f_{xx}\,dx + f_{xy}\,dy + f_{xz}\,dz$ (and similarly) and collecting terms with the alternation rule,
$$d(df) = (f_{yx} - f_{xy})\,dx\,dy + (f_{zx} - f_{xz})\,dx\,dz + (f_{zy} - f_{yz})\,dy\,dz = 0,$$
by the equality of mixed partial derivatives.

Then by [[1.6.4]](2), $d(f\,dg) = df \wedge dg + f\,d(dg) = df \wedge dg$.`,
    },
    {
      statement: md`Simplify the following forms:
(a) $d(f\,dg + g\,df)$.
(b) $d((f - g)(df + dg))$.
(c) $d(f\,dg \wedge g\,df)$.
(d) $d(gf\,df) + d(f\,dg)$.`,
      solution: md`Use [[ex:1.6.3]] ($d(df) = 0$, $d(h\,dk) = dh \wedge dk$) and $df \wedge df = 0$.

(a) $df \wedge dg + dg \wedge df = 0$. (Also: $f\,dg + g\,df = d(fg)$, and $d(d(fg)) = 0$.)
(b) $d(f - g) \wedge (df + dg) = (df - dg) \wedge (df + dg) = df \wedge dg - dg \wedge df = 2\,df \wedge dg$.
(c) $f\,dg \wedge g\,df = fg\,dg \wedge df$, and $d(fg\,dg \wedge df) = d(fg) \wedge dg \wedge df + fg\,d(dg \wedge df)$. The first term is $(g\,df + f\,dg) \wedge dg \wedge df = 0$ (each product has a repeated factor), and $d(dg \wedge df) = d(dg) \wedge df - dg \wedge d(df) = 0$. So the result is $0$.
(d) $d(gf) \wedge df + df \wedge dg = (f\,dg + g\,df) \wedge df + df \wedge dg = f\,dg \wedge df + df \wedge dg = (1 - f)\,df \wedge dg$.`,
    },
    {
      statement: md`For any three 1-forms $\phi_i = \sum_j f_{ij}\,dx_j$ $(1 \le i \le 3)$, prove
$$\phi_1 \wedge \phi_2 \wedge \phi_3 = \begin{vmatrix} f_{11} & f_{12} & f_{13} \\ f_{21} & f_{22} & f_{23} \\ f_{31} & f_{32} & f_{33} \end{vmatrix}\,dx_1\,dx_2\,dx_3.$$`,
      solution: md`Multiplying out,
$$\phi_1 \wedge \phi_2 \wedge \phi_3 = \sum_{j,k,l} f_{1j}f_{2k}f_{3l}\,dx_j\,dx_k\,dx_l.$$
A term with a repeated index vanishes, so only the six terms where $(j, k, l)$ is a permutation $\sigma$ of $(1, 2, 3)$ remain. Bringing $dx_{\sigma(1)}\,dx_{\sigma(2)}\,dx_{\sigma(3)}$ to $dx_1\,dx_2\,dx_3$ takes one transposition for each sign change, so it equals $\operatorname{sgn}(\sigma)\,dx_1\,dx_2\,dx_3$. Hence
$$\phi_1 \wedge \phi_2 \wedge \phi_3 = \Big(\sum_\sigma \operatorname{sgn}(\sigma)\,f_{1\sigma(1)}f_{2\sigma(2)}f_{3\sigma(3)}\Big)\,dx_1\,dx_2\,dx_3 = \det(f_{ij})\,dx_1\,dx_2\,dx_3.$$`,
    },
    {
      statement: md`If $r, \vartheta, z$ are the cylindrical coordinate functions on $\mathbf{R}^3$, then $x = r\cos\vartheta$, $y = r\sin\vartheta$, $z = z$. Compute the *volume element* $dx\,dy\,dz$ of $\mathbf{R}^3$ in cylindrical coordinates. (That is, express $dx\,dy\,dz$ in terms of the functions $r, \vartheta, z$ and their differentials.)`,
      solution: md`$dx = \cos\vartheta\,dr - r\sin\vartheta\,d\vartheta$ and $dy = \sin\vartheta\,dr + r\cos\vartheta\,d\vartheta$. So
$$dx\,dy = r\cos^2\vartheta\,dr\,d\vartheta - r\sin^2\vartheta\,d\vartheta\,dr = r\,dr\,d\vartheta,$$
and $dx\,dy\,dz = r\,dr\,d\vartheta\,dz$. (Equivalently, by [[ex:1.6.5]] the factor is the Jacobian determinant $r$.)`,
    },
    {
      statement: md`For a 2-form $\eta = f\,dx\,dy + g\,dx\,dz + h\,dy\,dz$, the *exterior derivative* $d\eta$ is defined to be the 3-form obtained by replacing $f$, $g$ and $h$ by their differentials. Prove that for any 1-form $\phi$, $d(d\phi) = 0$.

[[ex:1.6.3]] and this exercise show that $d^2 = 0$, that is, for any form $\xi$, $d(d\xi) = 0$. (If $\xi$ is a 2-form, then $d(d\xi) = 0$ since its degree exceeds 3.)`,
      solution: md`So $d\eta = df \wedge dx\,dy + dg \wedge dx\,dz + dh \wedge dy\,dz = (f_z - g_y + h_x)\,dx\,dy\,dz$, since $dz\,dx\,dy = dx\,dy\,dz$ and $dy\,dx\,dz = -dx\,dy\,dz$.

For $\phi = f_1\,dx + f_2\,dy + f_3\,dz$, the formula following [[1.6.3]] gives
$$d\phi = (f_{2x} - f_{1y})\,dx\,dy + (f_{3x} - f_{1z})\,dx\,dz + (f_{3y} - f_{2z})\,dy\,dz.$$
Applying the definition with $f = f_{2x} - f_{1y}$, $g = f_{3x} - f_{1z}$, $h = f_{3y} - f_{2z}$:
$$d(d\phi) = \big[(f_{2xz} - f_{1yz}) - (f_{3xy} - f_{1zy}) + (f_{3yx} - f_{2zx})\big]\,dx\,dy\,dz = 0,$$
because mixed partial derivatives do not depend on the order of differentiation.`,
    },
    {
      statement: md`Classical *vector analysis* avoids the use of differential forms on $\mathbf{R}^3$ by converting 1-forms and 2-forms into vector fields by means of the following one-to-one correspondences:
$$\sum f_i\,dx_i \;\overset{(1)}{\longleftrightarrow}\; \sum f_iU_i \;\overset{(2)}{\longleftrightarrow}\; f_3\,dx_1\,dx_2 - f_2\,dx_1\,dx_3 + f_1\,dx_2\,dx_3.$$
Vector analysis uses three basic operations based on partial differentiation: the *gradient* of a function $f$, $\operatorname{grad} f = \sum \dfrac{\partial f}{\partial x_i}\,U_i$; the *curl* of a vector field $V = \sum f_iU_i$,
$$\operatorname{curl} V = \left(\frac{\partial f_3}{\partial x_2} - \frac{\partial f_2}{\partial x_3}\right)U_1 + \left(\frac{\partial f_1}{\partial x_3} - \frac{\partial f_3}{\partial x_1}\right)U_2 + \left(\frac{\partial f_2}{\partial x_1} - \frac{\partial f_1}{\partial x_2}\right)U_3;$$
and the *divergence* of $V = \sum f_iU_i$, $\operatorname{div} V = \sum \dfrac{\partial f_i}{\partial x_i}$. Prove that all three operations may be expressed by exterior derivatives as follows:
(a) $df \overset{(1)}{\longleftrightarrow} \operatorname{grad} f$.
(b) If $\phi \overset{(1)}{\longleftrightarrow} V$, then $d\phi \overset{(2)}{\longleftrightarrow} \operatorname{curl} V$.
(c) If $\eta \overset{(2)}{\longleftrightarrow} V$, then $d\eta = (\operatorname{div} V)\,dx\,dy\,dz$.`,
      solution: md`Write $f_{i,j} = \partial f_i/\partial x_j$.

(a) $df = \sum \dfrac{\partial f}{\partial x_i}\,dx_i$ ([[1.5.5]]) corresponds under (1) to $\sum \dfrac{\partial f}{\partial x_i}\,U_i = \operatorname{grad} f$.

(b) For $\phi = \sum f_i\,dx_i$,
$$d\phi = (f_{2,1} - f_{1,2})\,dx_1\,dx_2 + (f_{3,1} - f_{1,3})\,dx_1\,dx_3 + (f_{3,2} - f_{2,3})\,dx_2\,dx_3.$$
Under (2), the 2-form $g_3\,dx_1\,dx_2 - g_2\,dx_1\,dx_3 + g_1\,dx_2\,dx_3$ corresponds to $\sum g_iU_i$; here $g_3 = f_{2,1} - f_{1,2}$, $g_2 = f_{1,3} - f_{3,1}$, $g_1 = f_{3,2} - f_{2,3}$ — exactly the coefficients of $\operatorname{curl} V$.

(c) For $\eta = f_3\,dx_1\,dx_2 - f_2\,dx_1\,dx_3 + f_1\,dx_2\,dx_3$, only the derivative in the missing variable survives in each term:
$$d\eta = f_{3,3}\,dx_3\,dx_1\,dx_2 - f_{2,2}\,dx_2\,dx_1\,dx_3 + f_{1,1}\,dx_1\,dx_2\,dx_3 = (f_{1,1} + f_{2,2} + f_{3,3})\,dx_1\,dx_2\,dx_3,$$
since $dx_3\,dx_1\,dx_2 = dx_1\,dx_2\,dx_3$ and $dx_2\,dx_1\,dx_3 = -dx_1\,dx_2\,dx_3$. That is, $d\eta = (\operatorname{div} V)\,dx\,dy\,dz$.

(With [[ex:1.6.3]] and [[ex:1.6.7]], $d^2 = 0$ becomes the classical identities $\operatorname{curl}\operatorname{grad} f = 0$ and $\operatorname{div}\operatorname{curl} V = 0$.)`,
    },
    {
      statement: md`Let $f$ and $g$ be real-valued functions on $\mathbf{R}^2$. Prove that
$$df \wedge dg = \begin{vmatrix} \dfrac{\partial f}{\partial x} & \dfrac{\partial f}{\partial y} \\[2mm] \dfrac{\partial g}{\partial x} & \dfrac{\partial g}{\partial y} \end{vmatrix}\,dx\,dy.$$
This formula appears in elementary calculus; show that it implies the alternation rule.`,
      solution: md`$df \wedge dg = (f_x\,dx + f_y\,dy) \wedge (g_x\,dx + g_y\,dy) = f_xg_y\,dx\,dy + f_yg_x\,dy\,dx = (f_xg_y - f_yg_x)\,dx\,dy$, which is the determinant times $dx\,dy$.

Conversely, the formula gives the alternation rule: with $f = y$, $g = x$ the determinant is $\begin{vmatrix} 0 & 1 \\ 1 & 0 \end{vmatrix} = -1$, so $dy\,dx = -dx\,dy$; with $f = g$ the two rows are equal, so $df \wedge df = 0$ (in particular $dx\,dx = dy\,dy = 0$).`,
    },
  ]),

  // §1.7 Mappings
  exercises(
    1,
    7,
    40,
    [
      {
        statement: md`Find all points $\mathbf{p}$ such that
(a) $F(\mathbf{p}) = (0, 0)$.
(b) $F(\mathbf{p}) = (8, 6)$.
(c) $F(\mathbf{p}) = \mathbf{p}$.`,
        solution: md`Writing $\mathbf{p} = (u, v)$, we must solve $u^2 - v^2 = a$, $2uv = b$. (In complex notation $F(z) = z^2$ for $z = u + iv$.)

(a) $uv = 0$ and $u^2 = v^2$ force $u = v = 0$: only $\mathbf{p} = (0, 0)$.
(b) $u^2 - v^2 = 8$, $uv = 3$: substituting $v = 3/u$ gives $u^4 - 8u^2 - 9 = 0$, so $u^2 = 9$. Hence $\mathbf{p} = (3, 1)$ or $(-3, -1)$.
(c) $u^2 - v^2 = u$ and $2uv = v$. If $v \neq 0$ then $u = \tfrac12$ and $v^2 = -\tfrac14$, impossible; so $v = 0$ and $u^2 = u$. Hence $\mathbf{p} = (0, 0)$ or $(1, 0)$.`,
      },
      {
        statement: md`(a) Sketch the horizontal line $v = 1$ and its image under $F$ (a parabola).
(b) Do the same for the vertical line $u = 1$.
(c) Describe the image of the unit square $0 \le u, v \le 1$ under $F$.`,
        solution: md`(a) $F(u, 1) = (u^2 - 1,\ 2u)$: with $x = u^2 - 1$, $y = 2u$, the image is the parabola $x = \tfrac{y^2}{4} - 1$, opening to the right with vertex $(-1, 0)$.

(b) $F(1, v) = (1 - v^2,\ 2v)$: the parabola $x = 1 - \tfrac{y^2}{4}$, opening to the left with vertex $(1, 0)$.

(c) The sides of the square go to: $v = 0$ ↦ the segment $0 \le x \le 1$ of the $x$ axis; $u = 0$ ↦ the segment $-1 \le x \le 0$; $u = 1$ ↦ the arc of the parabola of (b) from $(1, 0)$ to $(0, 2)$; $v = 1$ ↦ the arc of the parabola of (a) from $(-1, 0)$ to $(0, 2)$. The image is the region bounded by these curves,
$$\left\{(x, y) : y \ge 0,\ \tfrac{y^2}{4} - 1 \le x \le 1 - \tfrac{y^2}{4}\right\},$$
a curvilinear triangle with vertices $(-1, 0)$, $(1, 0)$, $(0, 2)$. (Indeed $1 - \tfrac{y^2}{4} - x = (1 - u^2)(1 + v^2) \ge 0$, and similarly for the other side.) In complex terms, squaring doubles the angles, so the quarter plane goes to the upper half plane. The 2D figure of Example [[1.7.3]] shows the image of a grid under this mapping.`,
      },
      {
        statement: md`Let $\mathbf{v} = (v_1, v_2)$ be a tangent vector to $\mathbf{R}^2$ at $\mathbf{p} = (p_1, p_2)$. Apply [[1.7.4]] directly to express $F_*(\mathbf{v})$ in terms of the coordinates of $\mathbf{v}$ and $\mathbf{p}$.`,
        solution: md`By definition $F_*(\mathbf{v}) = \dfrac{d}{dt}\Big|_{t=0} F(\mathbf{p} + t\mathbf{v})$, at $F(\mathbf{p})$. Here
$$F(\mathbf{p} + t\mathbf{v}) = \big((p_1 + tv_1)^2 - (p_2 + tv_2)^2,\ 2(p_1 + tv_1)(p_2 + tv_2)\big),$$
whose derivative at $t = 0$ gives
$$F_*(\mathbf{v}) = \big(2(p_1v_1 - p_2v_2),\ 2(v_1p_2 + v_2p_1)\big) \quad\text{at } F(\mathbf{p}).$$`,
      },
      {
        statement: md`Find a formula for the Jacobian matrix of $F$ at all points, and deduce that $F_{*\mathbf{p}}$ is a linear isomorphism at every point of $\mathbf{R}^2$ except the origin.`,
        solution: md`With $f_1 = u^2 - v^2$ and $f_2 = 2uv$, [[1.7.8]] gives
$$J(F)(\mathbf{p}) = \begin{pmatrix} \partial f_1/\partial u & \partial f_1/\partial v \\ \partial f_2/\partial u & \partial f_2/\partial v \end{pmatrix} = \begin{pmatrix} 2u & -2v \\ 2v & 2u \end{pmatrix}, \qquad \det = 4(u^2 + v^2).$$
The determinant is nonzero unless $u = v = 0$, so $F_{*\mathbf{p}}\colon T_\mathbf{p}(\mathbf{R}^2) \to T_{F(\mathbf{p})}(\mathbf{R}^2)$ is a linear isomorphism for $\mathbf{p} \neq \mathbf{0}$; at the origin the Jacobian matrix is zero.`,
      },
      {
        statement: md`If $F\colon \mathbf{R}^n \to \mathbf{R}^m$ is a linear transformation, prove that $F_*(\mathbf{v}_\mathbf{p}) = F(\mathbf{v})_{F(\mathbf{p})}$.`,
        solution: md`By linearity, $F(\mathbf{p} + t\mathbf{v}) = F(\mathbf{p}) + tF(\mathbf{v})$, a straight line. So by [[1.7.4]],
$$F_*(\mathbf{v}_\mathbf{p}) = \big(F(\mathbf{p}) + tF(\mathbf{v})\big)'(0) = F(\mathbf{v})_{F(\mathbf{p})}.$$`,
      },
      {
        statement: md`(a) Give an example to demonstrate that a one-to-one and onto mapping need not be a diffeomorphism. (*Hint:* take $m = n = 1$.)
(b) Prove that if a one-to-one and onto mapping $F\colon \mathbf{R}^n \to \mathbf{R}^n$ is regular, then it is a diffeomorphism.`,
        solution: md`(a) $F(t) = t^3$ on $\mathbf{R}$ is one-to-one and onto, but its inverse $t \mapsto t^{1/3}$ is not differentiable at $0$. (Accordingly $F$ is not regular there: $F'(0) = 0$.)

(b) $F$ has an inverse function $F^{-1}$; we show it is differentiable near each point $\mathbf{q}$. Since $F$ is onto, $\mathbf{q} = F(\mathbf{p})$ for some $\mathbf{p}$, and $F_{*\mathbf{p}}$ is one-to-one because $F$ is regular. By the inverse function theorem ([[1.7.10]]) there is an open set $\mathcal U \ni \mathbf{p}$ such that $F|\mathcal U$ is a diffeomorphism onto an open set $\mathcal V \ni \mathbf{q}$. As $F$ is one-to-one, $F^{-1}$ coincides on $\mathcal V$ with the differentiable inverse of $F|\mathcal U$. So $F^{-1}$ is differentiable on a neighborhood of every point: $F$ is a diffeomorphism.`,
      },
      {
        statement: md`Prove that a mapping $F\colon \mathbf{R}^n \to \mathbf{R}^m$ preserves directional derivatives in this sense: if $\mathbf{v}_\mathbf{p}$ is a tangent vector to $\mathbf{R}^n$ and $g$ is a differentiable function on $\mathbf{R}^m$, then $F_*(\mathbf{v}_\mathbf{p})[g] = \mathbf{v}_\mathbf{p}[g(F)]$.`,
        solution: md`The curve $\beta(t) = F(\mathbf{p} + t\mathbf{v})$ has initial velocity $\beta'(0) = F_*(\mathbf{v}_\mathbf{p})$ ([[1.7.4]]). By [[1.4.6]] applied to $\beta$, then [[1.3.1]],
$$F_*(\mathbf{v}_\mathbf{p})[g] = \beta'(0)[g] = \frac{d}{dt}\Big|_0\, g\big(F(\mathbf{p} + t\mathbf{v})\big) = \mathbf{v}_\mathbf{p}[g(F)].$$`,
      },
      {
        statement: md`In the definition of tangent map ([[1.7.4]]), the straight line $t \mapsto \mathbf{p} + t\mathbf{v}$ can be replaced by any curve $\alpha$ with initial velocity $\mathbf{v}_\mathbf{p}$.`,
        solution: md`We must show $F_*(\mathbf{v}_\mathbf{p}) = (F(\alpha))'(0)$ whenever $\alpha(0) = \mathbf{p}$ and $\alpha'(0) = \mathbf{v}_\mathbf{p}$. By [[1.7.5]], $F_*(\mathbf{v}_\mathbf{p}) = (\mathbf{v}_\mathbf{p}[f_1], \dots, \mathbf{v}_\mathbf{p}[f_m])$ at $F(\mathbf{p})$. By [[ex:1.4.6]], $\mathbf{v}_\mathbf{p}[f_i] = \dfrac{d}{dt}\Big|_0 f_i(\alpha(t))$, and these are the coordinates of $(F(\alpha))'(0) = \big(f_1(\alpha), \dots, f_m(\alpha)\big)'(0)$, a vector at $F(\alpha(0)) = F(\mathbf{p})$. (This is also [[1.7.7]] at $t = 0$.)`,
      },
      {
        statement: md`Let $F\colon \mathbf{R}^n \to \mathbf{R}^m$ and $G\colon \mathbf{R}^m \to \mathbf{R}^p$ be mappings. Prove:
(a) Their composition $GF\colon \mathbf{R}^n \to \mathbf{R}^p$ is a (differentiable) mapping. (Take $m = p = 2$ for simplicity.)
(b) $(GF)_* = G_*F_*$. (*Hint:* use the preceding exercise.)
(c) If $F$ is a diffeomorphism, then so is its inverse mapping $F^{-1}$.

This concise formula (b) is the general *chain rule*. Unless dimensions are small, it becomes formidable when expressed in terms of Jacobian matrices.`,
        solution: md`(a) With $F = (f_1, f_2)$ and $G = (g_1, g_2)$, $GF = \big(g_1(f_1, f_2),\ g_2(f_1, f_2)\big)$. Each coordinate function is a composite of differentiable functions, hence differentiable by the chain rule of calculus.

(b) Let $\mathbf{v}_\mathbf{p}$ be a tangent vector, $\alpha$ a curve with $\alpha'(0) = \mathbf{v}_\mathbf{p}$. Then $F(\alpha)$ is a curve with initial velocity $F_*(\alpha'(0))$ (by [[ex:1.7.8]]), and using [[ex:1.7.8]] for $GF$ and for $G$,
$$(GF)_*(\alpha'(0)) = (GF(\alpha))'(0) = G_*\big((F(\alpha))'(0)\big) = G_*F_*(\alpha'(0)).$$

(c) $F^{-1}$ is one-to-one and onto, differentiable (by definition of diffeomorphism), and its inverse $F$ is differentiable — so $F^{-1}$ is a diffeomorphism. It is also regular: from $F(F^{-1}) = I$, part (b) gives $F_*(F^{-1})_* = I_*$, the identity map on tangent vectors; so $(F^{-1})_*$ cannot carry a nonzero vector to zero.`,
      },
      {
        statement: md`Show (in two ways) that the map $F\colon \mathbf{R}^2 \to \mathbf{R}^2$ such that $F(u, v) = (ve^u,\ 2u)$ is a diffeomorphism:
(a) Prove that it is one-to-one, onto, and regular.
(b) Find a formula for its inverse $F^{-1}\colon \mathbf{R}^2 \to \mathbf{R}^2$ and observe that $F^{-1}$ is differentiable. Verify the formula by checking that both $FF^{-1}$ and $F^{-1}F$ are identity maps.`,
        solution: md`(a) *One-to-one:* if $F(u, v) = F(u', v')$ then $2u = 2u'$, so $u = u'$, and then $ve^u = v'e^u$ gives $v = v'$. *Onto:* $(x, y) = F(y/2,\ xe^{-y/2})$. *Regular:* the Jacobian matrix is $\begin{pmatrix} ve^u & e^u \\ 2 & 0 \end{pmatrix}$, with determinant $-2e^u \neq 0$. By [[ex:1.7.6]](b), $F$ is a diffeomorphism.

(b) Solving $x = ve^u$, $y = 2u$: $F^{-1}(x, y) = (y/2,\ xe^{-y/2})$, clearly differentiable. Check:
$$FF^{-1}(x, y) = F(y/2,\ xe^{-y/2}) = (xe^{-y/2}e^{y/2},\ y) = (x, y),$$
$$F^{-1}F(u, v) = F^{-1}(ve^u,\ 2u) = (u,\ ve^ue^{-u}) = (u, v).$$`,
      },
    ],
    md`In the first four exercises $F$ denotes the mapping $F(u, v) = (u^2 - v^2,\ 2uv)$ of Example [[1.7.3]].`,
  ),
];
