// Exercises of Chapter 3. Statements keep the book's numbering, data and notation (wording is ours);
// solutions are worked out in full and agree with the book's answers to the odd-numbered exercises.

import { exercises } from './exercises';
import { md } from './helpers';
import type { ExerciseSet } from './types';

export const EX3: ExerciseSet[] = [
  // §3.1 Isometries of R³
  exercises(
    3,
    1,
    105,
    [
      {
        statement: md`Prove that $CT_\mathbf{a} = T_{C(\mathbf{a})}C$.`,
        solution: md`For every point $\mathbf{p}$, by linearity of $C$: $CT_\mathbf{a}(\mathbf{p}) = C(\mathbf{a} + \mathbf{p}) = C(\mathbf{a}) + C(\mathbf{p}) = T_{C(\mathbf{a})}\big(C(\mathbf{p})\big)$.`,
      },
      {
        statement: md`Given isometries $F = T_\mathbf{a}A$ and $G = T_\mathbf{b}B$, find the translation and orthogonal part of $FG$ and $GF$.`,
        solution: md`By [[ex:3.1.1]], $AT_\mathbf{b} = T_{A(\mathbf{b})}A$, and translations compose by adding: $T_\mathbf{a}T_\mathbf{c} = T_{\mathbf{a} + \mathbf{c}}$. Hence
$$\begin{gathered} FG = T_\mathbf{a}AT_\mathbf{b}B = T_\mathbf{a}T_{A(\mathbf{b})}AB = T_{\mathbf{a} + A(\mathbf{b})}\,AB,\\ GF = T_{\mathbf{b} + B(\mathbf{a})}\,BA. \end{gathered}$$
$FG$ has translation part $\mathbf{a} + A(\mathbf{b})$ and orthogonal part $AB$; $GF$ has translation part $\mathbf{b} + B(\mathbf{a})$ and orthogonal part $BA$ (by the uniqueness in [[3.1.7]]).`,
      },
      {
        statement: md`Show that an isometry $F = T_\mathbf{a}C$ has an inverse mapping $F^{-1}$, which is also an isometry. Find the translation and orthogonal parts of $F^{-1}$.`,
        solution: md`$T_\mathbf{a}$ has inverse $T_{-\mathbf{a}}$, and since $C$ is orthogonal, $C^{-1} = {}^tC$. So $F^{-1} = (T_\mathbf{a}C)^{-1} = C^{-1}(T_\mathbf{a})^{-1} = {}^tC\,T_{-\mathbf{a}}$, which by [[ex:3.1.1]] equals
$$F^{-1} = T_{{}^tC(-\mathbf{a})}\,{}^tC = T_{-{}^tC(\mathbf{a})}\,{}^tC.$$
It is a composite of isometries, hence an isometry ([[3.1.3]]): translation part $-{}^tC(\mathbf{a})$, orthogonal part $ {}^tC = C^{-1}$.`,
      },
      {
        statement: md`If
$$C = \begin{pmatrix} -2/3 & 2/3 & -1/3 \\ 2/3 & 1/3 & -2/3 \\ 1/3 & 2/3 & 2/3 \end{pmatrix} \quad\text{and}\quad \begin{cases} \mathbf{p} = (3, 1, -6), \\ \mathbf{q} = (1, 0, 3), \end{cases}$$
show that $C$ is orthogonal; then compute $C(\mathbf{p})$ and $C(\mathbf{q})$, and check that $C(\mathbf{p}) \bullet C(\mathbf{q}) = \mathbf{p} \bullet \mathbf{q}$.`,
        solution: md`The rows $\tfrac13(-2, 2, -1)$, $\tfrac13(2, 1, -2)$, $\tfrac13(1, 2, 2)$ are unit vectors ($9/9 = 1$) and mutually orthogonal ($-4 + 2 + 2 = 0$, $-2 + 4 - 2 = 0$, $2 + 2 - 4 = 0$), so $C\,{}^tC = I$: $C$ is orthogonal. Then
$$C(\mathbf{p}) = \tfrac13(2,\ 19,\ -7), \qquad C(\mathbf{q}) = \tfrac13(-5,\ -4,\ 7),$$
$$C(\mathbf{p}) \bullet C(\mathbf{q}) = \tfrac19(-10 - 76 - 49) = -15 = 3 + 0 - 18 = \mathbf{p} \bullet \mathbf{q}.$$`,
      },
      {
        statement: md`Let $F = T_\mathbf{a}C$, where $\mathbf{a} = (1, 3, -1)$ and
$$C = \begin{pmatrix} 1/\sqrt2 & 0 & -1/\sqrt2 \\ 0 & 1 & 0 \\ 1/\sqrt2 & 0 & 1/\sqrt2 \end{pmatrix}.$$
If $\mathbf{p} = (2, -2, 8)$, find the coordinates of the point $\mathbf{q}$ for which
(a) $\mathbf{q} = F(\mathbf{p})$.
(b) $\mathbf{q} = F^{-1}(\mathbf{p})$.
(c) $\mathbf{q} = (CT_\mathbf{a})(\mathbf{p})$.`,
        solution: md`(a) $C(\mathbf{p}) = \big((2 - 8)/\sqrt2,\ -2,\ (2 + 8)/\sqrt2\big) = (-3\sqrt2, -2, 5\sqrt2)$, so $F(\mathbf{p}) = \mathbf{a} + C(\mathbf{p}) = (1 - 3\sqrt2,\ 1,\ -1 + 5\sqrt2)$.

(b) By [[ex:3.1.3]], $F^{-1}(\mathbf{p}) = {}^tC(\mathbf{p} - \mathbf{a}) = {}^tC(1, -5, 9) = \big((1 + 9)/\sqrt2,\ -5,\ (-1 + 9)/\sqrt2\big) = (5\sqrt2,\ -5,\ 4\sqrt2)$.
Check: $C(5\sqrt2, -5, 4\sqrt2) = (1, -5, 9)$, and adding $\mathbf{a}$ gives $(2, -2, 8) = \mathbf{p}$. (The book's answer prints $(5\sqrt2, -2, 3\sqrt2)$, which is $ {}^tC(\mathbf{p})$ — the translation has been left out.)

(c) $(CT_\mathbf{a})(\mathbf{p}) = C(3, 1, 7) = (-2\sqrt2,\ 1,\ 5\sqrt2)$.`,
      },
      {
        statement: md`In each case decide whether $F$ is an isometry of $\mathbf{R}^3$. If so, find its translation and orthogonal parts.
(a) $F(\mathbf{p}) = -\mathbf{p}$.
(b) $F(\mathbf{p}) = (\mathbf{p} \bullet \mathbf{a})\,\mathbf{a}$, where $\lVert\mathbf{a}\rVert = 1$.
(c) $F(\mathbf{p}) = (p_3 - 1,\ p_2 - 2,\ p_1 - 3)$.
(d) $F(\mathbf{p}) = (p_1,\ p_2,\ 1)$.`,
        solution: md`(a) Yes: $-I$ is orthogonal. Translation part $\mathbf{0}$, orthogonal part $C = -I$ (the reflection through the origin).

(b) No: it is the projection onto the line through $\mathbf{0}$ in the $\mathbf{a}$ direction, and it sends every point orthogonal to $\mathbf{a}$ to $\mathbf{0}$, so it does not preserve distance.

(c) Yes: $F = T_\mathbf{a}C$ with $\mathbf{a} = (-1, -2, -3)$ and $C(p_1, p_2, p_3) = (p_3, p_2, p_1)$, whose matrix $\begin{pmatrix} 0 & 0 & 1 \\ 0 & 1 & 0 \\ 1 & 0 & 0 \end{pmatrix}$ is orthogonal.

(d) No: $F(0, 0, 0) = F(0, 0, 1)$.`,
      },
      {
        statement: md`A *group* $G$ is a set furnished with an *operation* that assigns to each pair $g_1, g_2$ of elements of $G$ an element $g_1g_2$, subject to these rules: (1) associative law: $(g_1g_2)g_3 = g_1(g_2g_3)$; (2) there is a unique *identity element* $e$ such that $eg = ge = g$ for all $g$ in $G$; and (3) inverses: for each $g$ in $G$ there is an element $g^{-1}$ in $G$ such that $gg^{-1} = g^{-1}g = e$. Groups occur naturally in many parts of geometry, and we shall mention a few in subsequent exercises.

Prove that the set $\mathscr{E}(3)$ of all isometries of $\mathbf{R}^3$ forms a group — with composition of functions as the operation. $\mathscr{E}(3)$ is called the *Euclidean group* of order 3.`,
        solution: md`- The composite of two isometries is an isometry ([[3.1.3]]), so composition is an operation on $\mathscr{E}(3)$.
- Composition of functions is associative.
- The identity map $I$ is an isometry and $IF = FI = F$; it is the only such element, since $eF = F$ for all $F$ forces $e = e\,I = I$.
- Every isometry $F = T_\mathbf{a}C$ has an inverse $F^{-1}$ which is again an isometry ([[ex:3.1.3]]).`,
      },
      {
        statement: md`A subset $H$ of a group $G$ is a *subgroup* of $G$ provided (1) if $g_1$ and $g_2$ are in $H$, then so is $g_1g_2$; (2) if $g$ is in $H$, so is $g^{-1}$, and hence (3) the identity element $e$ of $G$ is in $H$. A subgroup $H$ of $G$ is automatically a group.

Prove that the set $\mathscr{T}(3)$ of all translations of $\mathbf{R}^3$ and the set $O(3)$ of all orthogonal transformations of $\mathbf{R}^3$ are each subgroups of the Euclidean group $\mathscr{E}(3)$. $O(3)$ is called the *orthogonal group* of order 3. Which isometries of $\mathbf{R}^3$ are in both these subgroups?`,
        solution: md`*Translations:* $T_\mathbf{a}T_\mathbf{b} = T_{\mathbf{a} + \mathbf{b}}$ and $(T_\mathbf{a})^{-1} = T_{-\mathbf{a}}$ are translations.

*Orthogonal transformations:* if $A$ and $B$ preserve dot products, so does $AB$: $AB(\mathbf{p}) \bullet AB(\mathbf{q}) = B(\mathbf{p}) \bullet B(\mathbf{q}) = \mathbf{p} \bullet \mathbf{q}$; and $A^{-1} = {}^tA$ is orthogonal since $ {}^tA\,{}^t({}^tA) = {}^tA\,A = I$.

*Both:* an orthogonal transformation is linear, so it fixes $\mathbf{0}$; a translation $T_\mathbf{a}$ fixes $\mathbf{0}$ only if $\mathbf{a} = \mathbf{0}$. So the identity map is the only isometry in both subgroups.`,
      },
      {
        statement: md`It is easy to check that the results of this section, though stated for $\mathbf{R}^3$, remain valid for Euclidean spaces $\mathbf{R}^n$ of any dimension.
(a) Give an explicit description of an arbitrary $2 \times 2$ orthogonal matrix $C$. (*Hint:* use an angle and a sign.)
(b) Give a formula for an arbitrary isometry $F$ of $\mathbf{R} = \mathbf{R}^1$.`,
        solution: md`(a) The columns of $C$ are orthonormal. The first, $C(1, 0)$, is a unit vector: $(\cos\vartheta, \sin\vartheta)$ for some angle $\vartheta$. The second is a unit vector orthogonal to it: $\pm(-\sin\vartheta, \cos\vartheta)$. So
$$C = \begin{pmatrix} \cos\vartheta & \mp\sin\vartheta \\ \sin\vartheta & \pm\cos\vartheta \end{pmatrix}.$$
With the upper signs ($\det C = 1$), $C$ is the rotation through angle $\vartheta$; with the lower signs ($\det C = -1$), it is the reflection in the line through $\mathbf{0}$ at angle $\vartheta/2$.

(b) $O(1)$ consists of $+1$ and $-1$ (the only numbers $c$ with $c^2 = 1$), so by [[3.1.7]] every isometry of $\mathbf{R}$ is $F(t) = a \pm t$ for some number $a$.`,
      },
    ],
    md`Throughout these exercises, $A$, $B$ and $C$ denote orthogonal transformations (or their matrices), and $T_\mathbf{a}$ is translation by $\mathbf{a}$.`,
  ),

  // §3.2 The Tangent Map of an Isometry
  exercises(3, 2, 110, [
    {
      statement: md`If $T$ is a translation, show that for every tangent vector $\mathbf{v}$ the vector $T_*(\mathbf{v})$ is parallel to $\mathbf{v}$ (same Euclidean coordinates).`,
      solution: md`The orthogonal part of a translation is the identity, so by [[3.2.1]], $T_*(\mathbf{v}_\mathbf{p}) = \mathbf{v}_{T(\mathbf{p})}$: same vector part, moved to the point $T(\mathbf{p})$.`,
    },
    {
      statement: md`Prove the general formulas $(GF)_* = G_*F_*$ and $(F^{-1})_* = (F_*)^{-1}$ in the special case where $F$ and $G$ are isometries of $\mathbf{R}^3$.`,
      solution: md`Let $F = T_\mathbf{a}A$ and $G = T_\mathbf{b}B$. By [[ex:3.1.2]], $GF$ has orthogonal part $BA$, so by [[3.2.1]]
$$(GF)_*(\mathbf{v}_\mathbf{p}) = BA(\mathbf{v})_{GF(\mathbf{p})} = G_*\big(A(\mathbf{v})_{F(\mathbf{p})}\big) = G_*F_*(\mathbf{v}_\mathbf{p}).$$
By [[ex:3.1.3]], $F^{-1}$ has orthogonal part $A^{-1}$, so $(F^{-1})_*(\mathbf{w}_\mathbf{q}) = A^{-1}(\mathbf{w})_{F^{-1}(\mathbf{q})}$. Then $F_*\big((F^{-1})_*(\mathbf{w}_\mathbf{q})\big) = AA^{-1}(\mathbf{w})_{FF^{-1}(\mathbf{q})} = \mathbf{w}_\mathbf{q}$, and likewise in the other order: $(F^{-1})_* = (F_*)^{-1}$.`,
    },
    {
      statement: md`Given the frame
$$\begin{gathered} \mathbf{e}_1 = (2, 2, 1)/3,\\ \mathbf{e}_2 = (-2, 1, 2)/3,\\ \mathbf{e}_3 = (1, -2, 2)/3 \end{gathered}$$
at $\mathbf{p} = (0, 1, 0)$ and the frame
$$\begin{gathered} \mathbf{f}_1 = (1, 0, 1)/\sqrt2,\\ \mathbf{f}_2 = (0, 1, 0),\\ \mathbf{f}_3 = (1, 0, -1)/\sqrt2 \end{gathered}$$
at $\mathbf{q} = (3, -1, 1)$, find $\mathbf{a}$ and $C$ such that the isometry $F = T_\mathbf{a}C$ carries the $\mathbf{e}$ frame to the $\mathbf{f}$ frame.`,
      solution: md`As in [[3.2.3]], $C = {}^tB\,A$, where $A$ and $B$ are the attitude matrices (rows $\mathbf{e}_i$ and $\mathbf{f}_i$). Here $B$ is symmetric, and
$$C = \begin{pmatrix} 1/\sqrt2 & 0 & 1/\sqrt2 \\ -2/3 & 1/3 & 2/3 \\ 1/(3\sqrt2) & 4/(3\sqrt2) & -1/(3\sqrt2) \end{pmatrix}.$$
(So the middle row of $C$ is $(-2, 1, 2)/3$.) Then $\mathbf{a} = \mathbf{q} - C(\mathbf{p})$, with $C(\mathbf{p})$ the second column $(0, \tfrac13, \tfrac{2\sqrt2}{3})$:
$$\mathbf{a} = \left(3,\ -\tfrac43,\ 1 - \tfrac{2\sqrt2}{3}\right).$$
Check: $C(\mathbf{e}_1) = (1/\sqrt2, 0, 1/\sqrt2) = \mathbf{f}_1$ (see [[ex:3.2.5]] for the other two).

In the sandbox, \`IsometryFromFrames(e, f)\` builds this isometry from two frames.`,
    },
    {
      statement: md`(a) Prove that an isometry $F = TC$ carries the plane through $\mathbf{p}$ orthogonal to $\mathbf{q} \neq 0$ to the plane through $F(\mathbf{p})$ orthogonal to $C(\mathbf{q})$.
(b) If $P$ is the plane through $(1/2, -1, 0)$ orthogonal to $(0, 1, 0)$, find an isometry $F = TC$ such that $F(P)$ is the plane through $(1, -2, 1)$ orthogonal to $(1, 0, -1)$.`,
      solution: md`(a) The plane is $P = \{\mathbf{r} : (\mathbf{r} - \mathbf{p}) \bullet \mathbf{q} = 0\}$. For $\mathbf{r}$ in $P$, $F(\mathbf{r}) - F(\mathbf{p}) = C(\mathbf{r} - \mathbf{p})$, so
$$\big(F(\mathbf{r}) - F(\mathbf{p})\big) \bullet C(\mathbf{q}) = C(\mathbf{r} - \mathbf{p}) \bullet C(\mathbf{q}) = (\mathbf{r} - \mathbf{p}) \bullet \mathbf{q} = 0.$$
So $F(P)$ lies in the plane $P'$ through $F(\mathbf{p})$ orthogonal to $C(\mathbf{q})$; applying the same argument to $F^{-1}$ (orthogonal part $C^{-1}$) shows $F^{-1}(P') \subset P$, hence $F(P) = P'$.

(b) By (a) we need $C(0, 1, 0)$ parallel to $(1, 0, -1)$: choose the orthogonal $C$ with columns
$$\begin{gathered} C(U_1) = (0, 1, 0),\\ C(U_2) = \tfrac{1}{\sqrt2}(1, 0, -1),\\ C(U_3) = C(U_1) \times C(U_2) = \tfrac{1}{\sqrt2}(-1, 0, -1) \end{gathered}$$
and the translation $T$ by $\mathbf{a} = (1, -2, 1) - C(\tfrac12, -1, 0)$. Since $C(\tfrac12, -1, 0) = (-\tfrac{1}{\sqrt2}, \tfrac12, \tfrac1{\sqrt2})$,
$$\mathbf{a} = \left(1 + \tfrac1{\sqrt2},\ -\tfrac52,\ 1 - \tfrac1{\sqrt2}\right).$$
Then $F = T_\mathbf{a}C$ sends $(\tfrac12, -1, 0)$ to $(1, -2, 1)$, and $F(P)$ is the required plane. (Many other choices work.)`,
    },
    {
      statement: md`(*Computer.*)
(a) Verify that both sets of vectors in [[ex:3.2.3]] form frames by showing that $A\,{}^tA = I$ for their attitude matrices.
(b) Find the matrix $C$ that carries each $\mathbf{e}_i$ to $\mathbf{f}_i$, and check this for $i = 1, 2, 3$.`,
      solution: md`(a) The entries of $A\,{}^tA$ are the dot products $\mathbf{e}_i \bullet \mathbf{e}_j$: the rows of $A$ have length $1$ and are mutually orthogonal (as computed in [[ex:3.2.3]]), so $A\,{}^tA = I$. Likewise $\mathbf{f}_1 \bullet \mathbf{f}_3 = (1 - 1)/2 = 0$, $\mathbf{f}_1 \bullet \mathbf{f}_2 = \mathbf{f}_2 \bullet \mathbf{f}_3 = 0$, and all have length $1$: $B\,{}^tB = I$.

(b) $C = {}^tB\,A$ is the matrix found in [[ex:3.2.3]]. Applying it:
$$\begin{gathered} C(\mathbf{e}_1) = \tfrac{1}{\sqrt2}(1, 0, 1) = \mathbf{f}_1,\\ C(\mathbf{e}_2) = (0, 1, 0) = \mathbf{f}_2,\\ C(\mathbf{e}_3) = \tfrac1{\sqrt2}(1, 0, -1) = \mathbf{f}_3. \end{gathered}$$
(In a computer algebra system: \`C = Transpose[B].A\`, then \`C.e1\` and so on.)`,
    },
  ]),

  // §3.3 Orientation
  exercises(3, 3, 115, [
    {
      statement: md`Prove
$$\operatorname{sgn}(FG) = \operatorname{sgn}F \cdot \operatorname{sgn}G = \operatorname{sgn}(GF).$$
Deduce that $\operatorname{sgn}F = \operatorname{sgn}(F^{-1})$.`,
      solution: md`If the orthogonal parts of $F$ and $G$ are $A$ and $B$, then by [[ex:3.1.2]] those of $FG$ and $GF$ are $AB$ and $BA$, and by [[3.3.3]]
$$\operatorname{sgn}(FG) = \det AB = (\det A)(\det B) = \det BA = \operatorname{sgn}(GF).$$
Then $+1 = \operatorname{sgn}I = \operatorname{sgn}(FF^{-1}) = \operatorname{sgn}(F)\operatorname{sgn}(F^{-1})$; since signs are $\pm1$, $\operatorname{sgn}(F^{-1}) = \operatorname{sgn}F$.`,
    },
    {
      statement: md`If $H_0$ is an orientation-reversing isometry of $\mathbf{R}^3$, show that *every* orientation-reversing isometry has a unique expression $H_0F$, where $F$ is orientation-preserving.`,
      solution: md`Let $H$ be orientation-reversing and put $F = H_0^{-1}H$. By [[ex:3.3.1]], $\operatorname{sgn}F = \operatorname{sgn}(H_0^{-1})\operatorname{sgn}H = (-1)(-1) = +1$, and $H = H_0F$. Uniqueness: $H_0F = H_0F'$ implies $F = F'$ (compose with $H_0^{-1}$).`,
    },
    {
      statement: md`Let $\mathbf{v} = (3, 1, -1)$ and $\mathbf{w} = (-3, -3, 1)$ be tangent vectors at some point. If $C$ is the orthogonal transformation given in [[ex:3.1.4]], check the formula
$$C_*(\mathbf{v} \times \mathbf{w}) = (\operatorname{sgn}C)\,C_*(\mathbf{v}) \times C_*(\mathbf{w}).$$`,
      solution: md`$C_*$ acts on vector parts by $C$ ([[3.2.1]]).
- $\mathbf{v} \times \mathbf{w} = (-2, 0, -6)$ and $C(\mathbf{v} \times \mathbf{w}) = \tfrac13(10, 8, -14)$.
- $C(\mathbf{v}) = (-1, 3, 1)$ and $C(\mathbf{w}) = \tfrac13(-1, -11, -7)$, so $C(\mathbf{v}) \times C(\mathbf{w}) = \tfrac13(-10, -8, 14)$.
- $\det C = -1$ (the rows $\mathbf{r}_i$ give $\mathbf{r}_1 \bullet \mathbf{r}_2 \times \mathbf{r}_3 = -1$), so $\operatorname{sgn}C = -1$.

Hence $(\operatorname{sgn}C)\,C(\mathbf{v}) \times C(\mathbf{w}) = \tfrac13(10, 8, -14) = C(\mathbf{v} \times \mathbf{w})$, as [[3.3.6]] asserts.`,
    },
    {
      statement: md`A *rotation* is an orthogonal transformation $C$ such that $\det C = +1$. Prove that $C$ does, in fact, rotate $\mathbf{R}^3$ around an axis. Explicitly, given a rotation $C$, show that there exists a number $\vartheta$ and points $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ with $\mathbf{e}_i \bullet \mathbf{e}_j = \delta_{ij}$ such that (Fig. 3.5)
$$\begin{gathered} C(\mathbf{e}_1) = \cos\vartheta\,\mathbf{e}_1 + \sin\vartheta\,\mathbf{e}_2,\\ C(\mathbf{e}_2) = -\sin\vartheta\,\mathbf{e}_1 + \cos\vartheta\,\mathbf{e}_2,\\ C(\mathbf{e}_3) = \mathbf{e}_3. \end{gathered}$$
(*Hint:* the fact that the dimension of $\mathbf{R}^3$ is odd means that $C$ has an eigenvalue $+1$, so there is a point $\mathbf{p} \neq 0$ such that $C(\mathbf{p}) = \mathbf{p}$.)`,
      solution: md`*Eigenvalue $+1$.* The characteristic polynomial of $C$ has odd degree 3, so it has a real root. Since $\lVert C(\mathbf{p})\rVert = \lVert\mathbf{p}\rVert$, every real eigenvalue is $\pm1$ and complex ones have absolute value 1, coming in conjugate pairs $\mu, \bar\mu$ with $\mu\bar\mu = 1$. The product of the eigenvalues is $\det C = 1$: if they are all real, they are $1, 1, 1$ or $1, -1, -1$; otherwise they are $\lambda, \mu, \bar\mu$ with $\lambda = 1$. Either way $+1$ is an eigenvalue: take a unit vector $\mathbf{e}_3$ with $C(\mathbf{e}_3) = \mathbf{e}_3$.

*The plane orthogonal to $\mathbf{e}_3$ is invariant:* if $\mathbf{p} \bullet \mathbf{e}_3 = 0$, then $C(\mathbf{p}) \bullet \mathbf{e}_3 = C(\mathbf{p}) \bullet C(\mathbf{e}_3) = \mathbf{p} \bullet \mathbf{e}_3 = 0$.

Choose a unit $\mathbf{e}_1 \perp \mathbf{e}_3$ and let $\mathbf{e}_2 = \mathbf{e}_3 \times \mathbf{e}_1$, so $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$ is a positively oriented frame. $C(\mathbf{e}_1)$ is a unit vector in the plane of $\mathbf{e}_1, \mathbf{e}_2$: $C(\mathbf{e}_1) = \cos\vartheta\,\mathbf{e}_1 + \sin\vartheta\,\mathbf{e}_2$ for some $\vartheta$. $C(\mathbf{e}_2)$ is a unit vector in that plane orthogonal to $C(\mathbf{e}_1)$, so $C(\mathbf{e}_2) = \varepsilon(-\sin\vartheta\,\mathbf{e}_1 + \cos\vartheta\,\mathbf{e}_2)$ with $\varepsilon = \pm1$. Finally, by [[3.3.2]], $C(\mathbf{e}_1) \bullet C(\mathbf{e}_2) \times C(\mathbf{e}_3) = \det C\,(\mathbf{e}_1 \bullet \mathbf{e}_2 \times \mathbf{e}_3) = 1$, while, using $\mathbf{e}_1 \times \mathbf{e}_3 = -\mathbf{e}_2$ and $\mathbf{e}_2 \times \mathbf{e}_3 = \mathbf{e}_1$,
$$C(\mathbf{e}_1) \bullet C(\mathbf{e}_2) \times \mathbf{e}_3 = \varepsilon\,(\cos\vartheta\,\mathbf{e}_1 + \sin\vartheta\,\mathbf{e}_2) \bullet (\cos\vartheta\,\mathbf{e}_1 + \sin\vartheta\,\mathbf{e}_2) = \varepsilon.$$
So $\varepsilon = 1$.`,
    },
    {
      statement: md`Let $\mathbf{a}$ be a point of $\mathbf{R}^3$ such that $\lVert\mathbf{a}\rVert = 1$. Prove that the formula
$$C(\mathbf{p}) = \mathbf{a} \times \mathbf{p} + (\mathbf{p} \bullet \mathbf{a})\,\mathbf{a}$$
defines an orthogonal transformation. Describe its general effect on $\mathbf{R}^3$.`,
      solution: md`$C$ is linear. Write $\mathbf{p} = (\mathbf{p} \bullet \mathbf{a})\mathbf{a} + \mathbf{p}_\perp$ with $\mathbf{p}_\perp \bullet \mathbf{a} = 0$. Then $\mathbf{a} \times \mathbf{p} = \mathbf{a} \times \mathbf{p}_\perp$ is orthogonal to $\mathbf{a}$ and has length $\lVert\mathbf{p}_\perp\rVert$ ([[2.1.8]]), so
$$\lVert C(\mathbf{p})\rVert^2 = (\mathbf{p} \bullet \mathbf{a})^2 + \lVert\mathbf{p}_\perp\rVert^2 = \lVert\mathbf{p}\rVert^2.$$
A linear map preserving norms preserves dot products (since $2\,\mathbf{p} \bullet \mathbf{q} = \lVert\mathbf{p} + \mathbf{q}\rVert^2 - \lVert\mathbf{p}\rVert^2 - \lVert\mathbf{q}\rVert^2$), so $C$ is orthogonal.

Effect: $C$ fixes the axis through $\mathbf{0}$ in the $\mathbf{a}$ direction and sends $\mathbf{p}_\perp$ to $\mathbf{a} \times \mathbf{p}_\perp$, its quarter turn in the plane orthogonal to $\mathbf{a}$. So $C$ is the rotation through angle $\pi/2$ about the axis given by $\mathbf{a}$ (counterclockwise seen from the tip of $\mathbf{a}$). For $\mathbf{a} = U_3$: $C(p_1, p_2, p_3) = (-p_2, p_1, p_3)$.`,
    },
    {
      statement: md`Prove:
(a) The set $O^+(3)$ of all rotations of $\mathbf{R}^3$ is a subgroup of the orthogonal group $O(3)$ (see [[ex:3.1.8]]).
(b) The set $\mathscr{E}^+(3)$ of all orientation-preserving isometries of $\mathbf{R}^3$ is a subgroup of the Euclidean group $\mathscr{E}(3)$.`,
      solution: md`(a) If $\det A = \det B = 1$, then $\det AB = 1$ and $\det A^{-1} = 1/\det A = 1$; and $\det I = 1$.

(b) By [[ex:3.3.1]], if $\operatorname{sgn}F = \operatorname{sgn}G = 1$ then $\operatorname{sgn}(FG) = 1$ and $\operatorname{sgn}(F^{-1}) = \operatorname{sgn}F = 1$; and $\operatorname{sgn}I = 1$.`,
    },
  ]),

  // §3.4 Euclidean Geometry
  exercises(3, 4, 120, [
    {
      statement: md`Let $F = TC$ be an isometry of $\mathbf{R}^3$, $\beta$ a unit speed curve in $\mathbf{R}^3$. Prove:
(a) If $\beta$ is a cylindrical helix, then $F(\beta)$ is a cylindrical helix.
(b) If $\beta$ has spherical image $\sigma$, then $F(\beta)$ has spherical image $C(\sigma)$.`,
      solution: md`$\bar\beta = F(\beta)$ has unit tangent $\bar T = F_*(T)$ ([[3.4.2]]), whose vector part is $C(T)$ by [[3.2.1]].

(a) If $T \bullet \mathbf{u} = \cos\vartheta$, then $\bar T \bullet C(\mathbf{u}) = C(T) \bullet C(\mathbf{u}) = T \bullet \mathbf{u} = \cos\vartheta$: $\bar\beta$ is a cylindrical helix with unit vector $C(\mathbf{u})$ and the same angle.

(b) By definition, $\sigma(s)$ is the point canonically corresponding to $T(s)$, i.e. its vector part. By [[3.2.1]], $F_*(T(s)) = C(T(s))_{F(\beta(s))}$ has vector part $C(\sigma(s))$; so the spherical image of $F(\beta)$ is $C(\sigma)$.`,
    },
    {
      statement: md`Let $Y = (t,\ 1 - t^2,\ 1 + t^2)$ be a vector field on the helix $\alpha(t) = (\cos t,\ \sin t,\ 2t)$, and let $C$ be the orthogonal transformation
$$C = \begin{pmatrix} -1 & 0 & 0 \\ 0 & 1/\sqrt2 & -1/\sqrt2 \\ 0 & 1/\sqrt2 & 1/\sqrt2 \end{pmatrix}.$$
Compute $\bar\alpha = C(\alpha)$ and $\bar Y = C_*(Y)$, and check that
$$\begin{gathered} C_*(Y') = \bar Y',\\ C_*(\alpha'') = \bar\alpha'',\\ Y' \bullet \alpha'' = \bar Y' \bullet \bar\alpha''. \end{gathered}$$`,
      solution: md`$$\begin{gathered} \bar\alpha(t) = \left(-\cos t,\ \frac{\sin t - 2t}{\sqrt2},\ \frac{\sin t + 2t}{\sqrt2}\right),\\ \bar Y(t) = C(Y(t)) = \left(-t,\ -\sqrt2\,t^2,\ \sqrt2\right). \end{gathered}$$
- $Y' = (1, -2t, 2t)$ and $C(Y') = (-1,\ -2\sqrt2\,t,\ 0) = \bar Y'$.
- $\alpha'' = (-\cos t, -\sin t, 0)$ and $C(\alpha'') = (\cos t,\ -\sin t/\sqrt2,\ -\sin t/\sqrt2) = \bar\alpha''$.
- $Y' \bullet \alpha'' = -\cos t + 2t\sin t$ and $\bar Y' \bullet \bar\alpha'' = -\cos t + 2\sqrt2\,t\,\sin t/\sqrt2 = -\cos t + 2t\sin t$.

These are instances of [[3.4.1]].`,
    },
    {
      statement: md`Sketch the triangles in $\mathbf{R}^2$ that have vertices
$$\Delta_1\colon (3, 1),\ (7, 1),\ (7, 4), \qquad \Delta_2\colon (2, 0),\ (2, 5),\ (-2/5, 16/5).$$
Show that these triangles are congruent by exhibiting an isometry $F = TC$ that carries $\Delta_1$ to $\Delta_2$. (*Hint:* the orthogonal part $C$ is not altered if the triangles are translated.)`,
      solution: md`Both are right triangles with sides $3, 4, 5$: in $\Delta_1$ the right angle is at $(7, 1)$, in $\Delta_2$ at $(-2/5, 16/5)$. Matching sides, $F$ must send $(3, 1) \mapsto (2, 0)$, $(7, 1) \mapsto (-2/5, 16/5)$, $(7, 4) \mapsto (2, 5)$.

Translate each triangle so that its first vertex is at the origin: $\Delta_1$ becomes $(0, 0), (4, 0), (4, 3)$ and $\Delta_2$ becomes $(0, 0), (-12/5, 16/5), (0, 5)$. The linear map $C$ must send $(4, 0) \mapsto (-12/5, 16/5)$ and $(4, 3) \mapsto (0, 5)$, so $C(1, 0) = (-3/5, 4/5)$ and $C(0, 1) = (4/5, 3/5)$:
$$C = \begin{pmatrix} -3/5 & 4/5 \\ 4/5 & 3/5 \end{pmatrix}, \qquad \det C = -1,$$
orthogonal and orientation-reversing (a reflection — one triangle is the mirror image of the other). The translation part is $\mathbf{a} = (2, 0) - C(3, 1) = (2, 0) - (-1, 3) = (3, -3)$. Check: $F(7, 1) = (-17/5, 31/5) + (3, -3) = (-2/5, 16/5)$ and $F(7, 4) = (-1, 8) + (3, -3) = (2, 5)$.`,
    },
    {
      statement: md`If $F\colon \mathbf{R}^3 \to \mathbf{R}^3$ is a diffeomorphism such that $F_*$ preserves dot products, show that $F$ is an isometry. (*Hint:* show that $F$ preserves lengths of curve segments and deduce that $F^{-1}$ does also.)`,
      solution: md`For a curve segment $\alpha$, $F(\alpha)' = F_*(\alpha')$ ([[1.7.7]]) has the same length as $\alpha'$, so $L(F(\alpha)) = L(\alpha)$. Let $\sigma$ be the straight segment from $\mathbf{p}$ to $\mathbf{q}$. By [[ex:2.2.11]],
$$d(F(\mathbf{p}), F(\mathbf{q})) \le L(F(\sigma)) = L(\sigma) = d(\mathbf{p}, \mathbf{q}).$$
$F^{-1}$ is also a diffeomorphism, and $(F^{-1})_* = (F_*)^{-1}$ ([[ex:1.7.9]]) preserves dot products too; the same argument gives $d(F^{-1}(\mathbf{x}), F^{-1}(\mathbf{y})) \le d(\mathbf{x}, \mathbf{y})$. With $\mathbf{x} = F(\mathbf{p})$, $\mathbf{y} = F(\mathbf{q})$ this is the reverse inequality, so $d(F(\mathbf{p}), F(\mathbf{q})) = d(\mathbf{p}, \mathbf{q})$.`,
    },
    {
      statement: md`Let $F$ be an isometry of $\mathbf{R}^3$. For each vector field $V$ let $\bar V$ be the vector field such that $F_*(V(\mathbf{p})) = \bar V(F(\mathbf{p}))$ for all $\mathbf{p}$. Prove that isometries preserve covariant derivatives; that is, show $\overline{\nabla_VW} = \nabla_{\bar V}\bar W$.`,
      solution: md`Let $F = TC$ and let $\mathbf{v}$ be a tangent vector at $\mathbf{p}$. The curve $t \mapsto F(\mathbf{p} + t\mathbf{v}) = F(\mathbf{p}) + tC(\mathbf{v})$ is the straight line with initial velocity $F_*(\mathbf{v})$, and along it $F_*(W(\mathbf{p} + t\mathbf{v})) = \bar W(F(\mathbf{p}) + tC(\mathbf{v}))$. Since $F_*$ acts on vector parts by the constant linear map $C$, it commutes with differentiation in $t$:
$$F_*(\nabla_\mathbf{v}W) = F_*\big(W(\mathbf{p} + t\mathbf{v})'(0)\big) = \big(\bar W(F(\mathbf{p}) + tC(\mathbf{v}))\big)'(0) = \nabla_{F_*(\mathbf{v})}\bar W.$$
With $\mathbf{v} = V(\mathbf{p})$, $F_*(\mathbf{v}) = \bar V(F(\mathbf{p}))$, so $F_*\big((\nabla_VW)(\mathbf{p})\big) = (\nabla_{\bar V}\bar W)(F(\mathbf{p}))$, that is, $\overline{\nabla_VW} = \nabla_{\bar V}\bar W$.`,
    },
  ]),

  // §3.5 Congruence of Curves
  exercises(3, 5, 127, [
    {
      statement: md`Given a curve $\alpha = (\alpha_1, \alpha_2, \alpha_3)\colon I \to \mathbf{R}^3$, prove that $\beta\colon I \to \mathbf{R}^3$ is congruent to $\alpha$ if and only if $\beta$ can be written as
$$\beta(t) = \mathbf{p} + \alpha_1(t)\,\mathbf{e}_1 + \alpha_2(t)\,\mathbf{e}_2 + \alpha_3(t)\,\mathbf{e}_3,$$
where $\mathbf{e}_i \bullet \mathbf{e}_j = \delta_{ij}$.`,
      solution: md`If $\beta = F(\alpha)$ with $F = T_\mathbf{p}C$ ([[3.1.7]]), then by linearity $\beta = \mathbf{p} + C\big(\sum \alpha_iU_i\big) = \mathbf{p} + \sum \alpha_i\,C(U_i)$, and $\mathbf{e}_i = C(U_i)$ are orthonormal since $C$ preserves dot products. Conversely, given such $\mathbf{p}$ and $\mathbf{e}_i$, the linear map $C$ with $C(U_i) = \mathbf{e}_i$ carries an orthonormal basis to an orthonormal basis, hence is orthogonal, and $F = T_\mathbf{p}C$ is an isometry with $F(\alpha) = \beta$ ([[3.5.1]]).`,
    },
    {
      statement: md`Let $E_1, E_2, E_3$ be a frame field on $\mathbf{R}^3$ with dual forms $\theta_i$ and connection forms $\omega_{ij}$. Prove that two curves $\alpha, \beta\colon I \to \mathbf{R}^3$ are congruent if $\theta_i(\alpha') = \theta_i(\beta')$ and $\omega_{ij}(\alpha') = \omega_{ij}(\beta')$ for $1 \le i, j \le 3$. (*Hint:* use [[3.5.7]].)`,
      solution: md`Restrict the frame field to each curve: $E_i(\alpha(t))$ is a frame field on $\alpha$, $E_i(\beta(t))$ one on $\beta$. Then, by [[2.8.1]] and [[ex:2.5.5]],
$$\alpha' \bullet E_i(\alpha) = \theta_i(\alpha') = \theta_i(\beta') = \beta' \bullet E_i(\beta),$$
$$E_i(\alpha)' \bullet E_j(\alpha) = \nabla_{\alpha'}E_i \bullet E_j = \omega_{ij}(\alpha') = \omega_{ij}(\beta') = E_i(\beta)' \bullet E_j(\beta).$$
These are the hypotheses (1) and (2) of [[3.5.7]], so $\alpha$ and $\beta$ are congruent.`,
    },
    {
      statement: md`Show that the curve
$$\beta(t) = \left(t + \sqrt3\sin t,\ 2\cos t,\ \sqrt3\,t - \sin t\right)$$
is a helix by finding its curvature and torsion. Find a helix of the form $\alpha(t) = (a\cos t,\ a\sin t,\ bt)$ and an isometry $F$ such that $F(\alpha) = \beta$.`,
      solution: md`$\beta' = (1 + \sqrt3\cos t,\ -2\sin t,\ \sqrt3 - \cos t)$ has $\lVert\beta'\rVert^2 = 8$: constant speed $2\sqrt2$. With $\beta'' = (-\sqrt3\sin t, -2\cos t, \sin t)$ and $\beta''' = (-\sqrt3\cos t, 2\sin t, \cos t)$,
$$\beta' \times \beta'' = \big(-2 + 2\sqrt3\cos t,\ -4\sin t,\ -2\cos t - 2\sqrt3\big), \quad \lVert\beta' \times \beta''\rVert^2 = 32, \quad \beta' \times \beta'' \bullet \beta''' = -8.$$
So $\kappa = 4\sqrt2/(2\sqrt2)^3 = \tfrac14$ and $\tau = -8/32 = -\tfrac14$: constant, so $\beta$ is a helix ([[3.5.5]]).

The helix $(a\cos t, a\sin t, bt)$ has speed $\sqrt{a^2 + b^2}$, $\kappa = a/(a^2 + b^2)$, $\tau = b/(a^2 + b^2)$; matching gives $a = 2$, $b = -2$ (or $b = 2$, using an orientation-reversing isometry). Take $\alpha(t) = (2\cos t, 2\sin t, -2t)$. Comparing Frenet frames at $t = 0$ as in Example [[3.5.4]] gives $C = {}^tB\,A$ with columns
$$\begin{gathered} C(U_1) = (0, 1, 0),\\ C(U_2) = \left(\tfrac{\sqrt3}{2}, 0, -\tfrac12\right),\\ C(U_3) = \left(-\tfrac12, 0, -\tfrac{\sqrt3}{2}\right) \end{gathered}$$
a rotation, and the translation part is $\beta(0) - C(\alpha(0)) = (0, 2, 0) - (0, 2, 0) = \mathbf{0}$. So $F = C$, and indeed
$$C(\alpha(t)) = 2\cos t\,(0, 1, 0) + 2\sin t\left(\tfrac{\sqrt3}{2}, 0, -\tfrac12\right) - 2t\left(-\tfrac12, 0, -\tfrac{\sqrt3}{2}\right) = \beta(t).$$
In the sandbox, \`Congruence(alpha, beta, 0)\` computes such an isometry.`,
    },
    {
      statement: md`(*Computer; see Appendix.*)
(a) Show that the curves
$$\begin{gathered} \alpha(t) = \left(t + t^2,\ t - t^2,\ 1 + \sqrt2\,t^3\right),\\ \beta(t) = \left(t^2 + t^3,\ 1 - \sqrt2\,t,\ t^2 - t^3\right) \end{gathered}$$
defined on the entire real line, have the same speed, curvature, and torsion.
(b) Find formulas for $T$ and $C$ such that the isometry $F = TC$ carries $\alpha$ to $\beta$ and verify explicitly that $F(\alpha) = \beta$. (*Hint:* use [[ex:3.2.5]].)`,
      solution: md`(a) $\lVert\alpha'\rVert^2 = \lVert\beta'\rVert^2 = 2 + 8t^2 + 18t^4$. Next,
$$\begin{gathered} \alpha' \times \alpha'' = \big(6\sqrt2(t - t^2),\ -6\sqrt2(t + t^2),\ -4\big),\\ \beta' \times \beta'' = \big(\sqrt2(6t - 2),\ 12t^2,\ \sqrt2(6t + 2)\big) \end{gathered}$$
both of squared length $144t^4 + 144t^2 + 16$; and $\alpha' \times \alpha'' \bullet \alpha''' = \beta' \times \beta'' \bullet \beta''' = -24\sqrt2$. By [[2.4.3]], $\kappa$ and $\tau$ agree, and [[3.5.6]] predicts congruence by an orientation-preserving isometry.

(b) At $t = 0$: for $\alpha$, $T = (1, 1, 0)/\sqrt2$, $N = (1, -1, 0)/\sqrt2$, $B = (0, 0, -1)$ at $(0, 0, 1)$; for $\beta$, $T = (0, -1, 0)$, $N = (1, 0, 1)/\sqrt2$, $B = (-1, 0, 1)/\sqrt2$ at $(0, 1, 0)$. Then $C = {}^tB\,A$ maps one frame to the other:
$$C = \begin{pmatrix} 1/2 & -1/2 & 1/\sqrt2 \\ -1/\sqrt2 & -1/\sqrt2 & 0 \\ 1/2 & -1/2 & -1/\sqrt2 \end{pmatrix}, \qquad T = \text{translation by } \mathbf{a} = \beta(0) - C(\alpha(0)) = \left(-\tfrac1{\sqrt2},\ 1,\ \tfrac1{\sqrt2}\right).$$
Check: $C(\alpha(t)) = \left(t^2 + t^3 + \tfrac1{\sqrt2},\ -\sqrt2\,t,\ t^2 - t^3 - \tfrac1{\sqrt2}\right)$, and adding $\mathbf{a}$ gives $\beta(t)$.`,
    },
    {
      statement: md`(*Computer optional.*) Is the following curve a helix? Prove your answer.
$$c(t) = \left(-2\cos t + 2\sin t + 2t,\ 2\cos t + \sin t + 4t,\ \cos t + 2\sin t - 4t\right).$$`,
      solution: md`Yes. Write $c(t) = -\cos t\,\mathbf{A} + \sin t\,\mathbf{B} + t\,\mathbf{D}$ with $\mathbf{A} = (2, -2, -1)$, $\mathbf{B} = (2, 1, 2)$, $\mathbf{D} = (2, 4, -4)$. These are mutually orthogonal, with $\lVert\mathbf{A}\rVert = \lVert\mathbf{B}\rVert = 3$ and $\lVert\mathbf{D}\rVert = 6$. So with the orthonormal vectors $\mathbf{e}_1 = \mathbf{A}/3$, $\mathbf{e}_2 = \mathbf{B}/3$, $\mathbf{e}_3 = \mathbf{D}/6$,
$$c(t) = (-3\cos t)\,\mathbf{e}_1 + (3\sin t)\,\mathbf{e}_2 + (6t)\,\mathbf{e}_3,$$
which by [[ex:3.5.1]] is congruent to the curve $(-3\cos t, 3\sin t, 6t)$ — a circular helix of radius 3. Directly: $c$ has constant speed $\sqrt{45}$, curvature $\kappa = 3/45 = \tfrac1{15}$ and torsion $\tau = \tfrac{2}{15}$, all constant ([[3.5.5]]).`,
    },
    {
      statement: md`*Congruence of curves.*
(a) Prove that curves $\alpha, \beta\colon I \to \mathbf{R}^2$ are congruent if $\tilde\kappa_\alpha = \tilde\kappa_\beta$ and they have the same speed.
(b) Show that the space curves $\alpha(t) = (\sqrt2\,t,\ t^2,\ 0)$ and $\beta(t) = (-t,\ t,\ t^2)$ are congruent. Find an isometry that carries $\alpha$ to $\beta$.`,
      solution: md`(a) Same speed means the same arc length function, so we may reparametrize both by arc length with the same $h$ and assume unit speed. Apply an orientation-preserving isometry $F$ of $\mathbf{R}^2$ (rotation and translation) so that $F(\beta)(0) = \alpha(0)$ and the unit tangents agree at $0$; rotations preserve plane curvature, so $F(\beta)$ still has $\tilde\kappa_\beta = \tilde\kappa_\alpha$. Write $\bar T, \bar N$ for the frame of $F(\beta)$ ([[ex:2.3.8]]) and let $f = T \bullet \bar T + N \bullet \bar N$. Then
$$f' = \tilde\kappa N \bullet \bar T + T \bullet \tilde\kappa\bar N - \tilde\kappa T \bullet \bar N - N \bullet \tilde\kappa\bar T = 0,$$
and $f(0) = 2$; since $f \le 2$ with equality only if $T = \bar T$, we get $T = \bar T$ everywhere. So $\alpha$ and $F(\beta)$ are parallel and agree at $0$: $\alpha = F(\beta)$.

(b) $\beta$ lies in the plane $x + y = 0$. In that plane, with orthonormal vectors $\mathbf{u} = (-1, 1, 0)/\sqrt2$ and $U_3$, $\beta(t) = \sqrt2\,t\,\mathbf{u} + t^2\,U_3$ — the same coordinates as $\alpha$ in the $U_1, U_2$ plane. So the orthogonal $C$ with
$$\begin{gathered} C(U_1) = \tfrac{1}{\sqrt2}(-1, 1, 0),\\ C(U_2) = (0, 0, 1),\\ C(U_3) = C(U_1) \times C(U_2) = \tfrac{1}{\sqrt2}(1, 1, 0) \end{gathered}$$
gives $C(\alpha(t)) = \sqrt2\,t\,C(U_1) + t^2\,C(U_2) = (-t, t, t^2) = \beta(t)$. (Both have speed $\sqrt{2 + 4t^2}$ and plane curvature $2\sqrt2/(2 + 4t^2)^{3/2}$, as (a) requires.)`,
    },
    {
      statement: md`Given a continuous function $f$ on an interval $I$, prove — using ordinary integration of functions — that there exists a unit-speed curve $\beta(s)$ in $\mathbf{R}^2$ for which $f(s)$ is the plane curvature. (*Hint:* reverse the logic in [[ex:2.3.8]].)`,
      solution: md`Fix $s_0$ in $I$ and let
$$\begin{gathered} \varphi(s) = \int_{s_0}^s f(u)\,du,\\ \beta(s) = \left(\int_{s_0}^s \cos\varphi(u)\,du,\ \int_{s_0}^s \sin\varphi(u)\,du\right). \end{gathered}$$
By the fundamental theorem of calculus, $\beta' = (\cos\varphi, \sin\varphi)$ is a unit vector, so $\beta$ has unit speed and slope angle $\varphi$. By [[ex:2.3.8]](b), $\tilde\kappa = \varphi' = f$.`,
    },
    {
      statement: md`Show that $\beta(s) = (x(s), y(s))$ in the preceding exercise is given by the solutions of the differential equations
$$\begin{gathered} x'(s) = \cos\varphi(s),\\ y'(s) = \sin\varphi(s),\\ \varphi'(s) = f(s) \end{gathered}$$
with initial conditions $x(0) = y(0) = \varphi(0) = 0$. (These initial conditions suffice, since any other $\beta$ differs at most by a Euclidean isometry and a reparametrization $s \to s + c$.)

Explicit integration is rarely possible; the following exercises use numerical integration.`,
      solution: md`Take $s_0 = 0$ in [[ex:3.5.7]]. Differentiating, the functions $x = \int_0^s \cos\varphi$, $y = \int_0^s \sin\varphi$, $\varphi = \int_0^s f$ satisfy the three equations and vanish at $0$. Conversely, the third equation and $\varphi(0) = 0$ determine $\varphi = \int_0^s f$, and then the first two equations with $x(0) = y(0) = 0$ determine $x$ and $y$: the solution is unique. Other choices of initial point, initial direction and base point change $\beta$ by a translation, a rotation and a shift $s \to s + c$ (by (a) of [[ex:3.5.6]], curves with the same $\tilde\kappa$ are congruent).`,
    },
    {
      statement: md`(*Numerical integration, computer graphics.*) Write computer commands that (a) given $f(s)$, produce a numerical description of the solution curve $\beta(s)$ in the preceding exercise, and (b) given $f(s)$, plot the solution curve.`,
      solution: md`(a) Solve the initial value problem of [[ex:3.5.8]] numerically on an interval $a \le s \le b$ containing $0$ — for instance with \`NDSolve\` in Mathematica or \`dsolve(..., type=numeric)\` in Maple, or a Runge–Kutta loop: from $(x, y, \varphi) = (0, 0, 0)$, step $s$ by $h$ and update with the right-hand sides $(\cos\varphi, \sin\varphi, f(s))$.

(b) Plot the computed points $(x(s), y(s))$ with equal scales on both axes.

The sandbox has this built in: with the 2D view active, \`CurveKT(f, 0, L)\` (the *Curve with given κ(s), τ(s)* tool) integrates these equations by the Runge–Kutta method for $0 \le s \le L$ and draws the curve whose plane curvature is $f(s)$ — see Remark [[3.5.8]].`,
    },
    {
      statement: md`(*Continuation.*) Plot unit-speed plane curves with the given plane curvature function $f$ on at least the given interval.
(a) $f(s) = 1 + e^s$, on $-6 \le s \le 3$.
(b) $f(s) = 2 + 3\cos 3s$, on $0 \le s \le 2\pi$.
(c) $f(s) = 3 - 2s^2 + s^3$, on $-2.5 \le s \le 3.5$.
Adjust scales on axes as needed.`,
      solution: md`The sandbox's \`CurveKT\` integrates from $s = 0$; shifting the variable, $f(s + c)$ gives the same curve up to an isometry and the reparametrization $s \to s + c$ ([[ex:3.5.8]]). In the 2D view:

(a) \`CurveKT(1 + exp(s - 6), 0, 9)\`. For $s < -2$ the curvature is nearly $1$, so the curve first follows an arc of a unit circle; then the curvature grows exponentially and the curve winds into a tightening spiral (the tangent turns $\int_{-6}^{3} f = 9 + e^3 - e^{-6} \approx 29$ radians, about $4.6$ turns, mostly at the end).

(b) \`CurveKT(2 + 3*cos(3*s), 0, 2*pi)\`. The curvature is periodic of period $2\pi/3$, and over each period the tangent turns by $\int f = 4\pi/3$. After three periods ($s = 2\pi$) it has turned $4\pi$ and the curve closes up: a closed curve with threefold symmetry along which the tangent turns twice. The curvature changes sign (where $\cos 3s < -\tfrac23$), so the curve has inflections.

(c) \`CurveKT(3 - 2*(s - 2.5)^2 + (s - 2.5)^3, 0, 6)\`. Here $f(s) = (s + 1)(s^2 - 3s + 3)$ changes sign only at $s = -1$: the curve starts in a tight clockwise spiral ($f(-2.5) \approx -25$), straightens out near $s = -1$, and ends in a tight counterclockwise spiral ($f(3.5) \approx 21$) — an S-shaped curve with spirals at both ends.`,
    },
  ]),
];
