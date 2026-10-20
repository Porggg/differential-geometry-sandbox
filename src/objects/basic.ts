// Section 1.1–1.2: points, numbers (sliders), tangent vectors, the natural frame.

import { register } from '../core/registry';
import type { ObjectType, Value } from '../core/types';
import { fmt } from '../math/vec';
import { COLORS, P, arr, linCombTex, nameOf, numVec, pointOf, str, texNum, texParts, texPointParam, texVec, texVecAt, exprTex } from './common';

const slider: ObjectType = {
  type: 'slider',
  label: 'Number / slider',
  group: 'basic',
  description: 'A real number, adjustable with a slider and animatable (▶).',
  names: ['a', 'b', 'c', 't0', 's0', 'k', 'r', 'h', 'm', 'n'],
  dims: [2, 3],
  params: () => [
    P.expr('value', 'Value'),
    P.expr('min', 'Min'),
    P.expr('max', 'Max'),
    P.expr('step', 'Step'),
  ],
  defaults: () => ({ value: 1, min: -5, max: 5, step: 0.01 }),
  compute: (p, ctx) => {
    const v = ctx.num(typeof p.value === 'number' ? p.value : str(p.value));
    return { kind: 'number', value: v };
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => `${nameOf(o)} = ${v && v.kind === 'number' ? texNum(v.value) : exprTex(o.params.value)}`,
  course: (o, v) =>
    `A real number, here $${nameOf(o)} = ${v.kind === 'number' ? fmt(v.value, 6) : '?'}$. ` +
    `Use it in any expression (e.g. \`a*cos(t)\`) and drag its slider in the Algebra view; ▶ animates it between ` +
    `${str(o.params.min)} and ${str(o.params.max)}.`,
  command: { name: 'Slider', args: ['value', 'min', 'max', 'step'] },
};

const point: ObjectType = {
  type: 'point',
  label: 'Point',
  group: 'basic',
  description: 'A point p = (p₁, p₂, p₃) of R³ (or of R² in the 2D view). Click in a view to place it.',
  bookRef: '1.1.1',
  names: ['p', 'q', 'r', 'm', 'o'],
  dims: [2, 3],
  interactive: true,
  params: (dim) => [P.vec('coords', 'Coordinates', dim)],
  defaults: (dim) => ({ coords: dim === 2 ? '(1, 1)' : '(1, 2, 1)' }),
  compute: (p, ctx) => {
    const parts = arr(p.coords);
    return { kind: 'point', p: numVec(p.coords, ctx, parts.length === 2 ? 2 : 3, 'point') };
  },
  caption: (o) => nameOf(o),
  algebra: (o, v) => `${nameOf(o)} = ${v && v.kind === 'point' ? texVec(v.p) : texParts(arr(o.params.coords))}`,
  course: (o, v) => {
    if (v.kind !== 'point') return '';
    const n = nameOf(o);
    const coords = v.p.map((x, i) => `${['x', 'y', 'z'][i]}(${n}) = ${fmt(x)}`).join(',\\quad ');
    return (
      `A point of $\\mathbf{R}^{${v.p.length}}$ is an ordered ${v.p.length === 3 ? 'triple' : 'pair'} of real numbers ([[1.1.1]]).\n\n` +
      `Natural coordinate functions ([[1.1.2]]): $${coords}$.`
    );
  },
  command: { name: 'Point', args: ['coords'] },
};

const tangentVector: ObjectType = {
  type: 'tangentVector',
  label: 'Tangent vector vₚ',
  group: 'basic',
  description: 'A tangent vector vₚ: vector part v and point of application p, drawn as the arrow from p to p + v.',
  bookRef: '1.2.1',
  names: ['v', 'w', 'u', 'v1', 'w1'],
  dims: [2, 3],
  params: (dim) => [
    P.vec('v', 'Vector part v', dim),
    P.vec('p', 'Point of application p', dim, [], { help: 'Coordinates, or the name of a point (e.g. p).' }),
  ],
  defaults: (dim, ctx) => {
    const pts = ctx.find(['point'], (v) => v.kind === 'point' && v.p.length === dim);
    return { v: dim === 2 ? '(1, 0.5)' : '(2, 3, 2)', p: pts[0] ?? (dim === 2 ? '(0, 0)' : '(1, 1, 3)') };
  },
  compute: (p, ctx) => {
    const v = arr(p.v);
    const dim = v.length;
    return { kind: 'vector', v: numVec(p.v, ctx, dim, 'vector part'), p: pointOf(ctx, p.p, dim) };
  },
  caption: (o) => nameOf(o),
  algebra: (o, v, cx) =>
    v && v.kind === 'vector'
      ? `${nameOf(o)} = ${texVecAt(v.v, v.p)}`
      : `${nameOf(o)} = ${texParts(arr(o.params.v))}_{${texPointParam(o.params.p, cx)}}`,
  course: (o, v) => {
    if (v.kind !== 'vector') return '';
    const end = v.p.map((x, i) => x + v.v[i]);
    return (
      `A tangent vector consists of two points: its **vector part** $v = ${texVec(v.v)}$ and its **point of application** ` +
      `$p = ${texVec(v.p)}$ ([[1.2.1]]). It is pictured as the arrow from $p$ to $p + v = ${texVec(end)}$.\n\n` +
      `It belongs to the tangent space $T_p(\\mathbf{R}^${v.p.length})$ ([[1.2.2]]). In terms of the natural frame ` +
      `([[1.2.4]]): $${nameOf(o)} = ${linCombTex(v.v, v.v.map((_, i) => `U_${i + 1}(\\mathbf{p})`))}$.`
    );
  },
  command: { name: 'Vector', args: ['v', 'p'] },
};

const naturalFrame: ObjectType = {
  type: 'naturalFrame',
  label: 'Natural frame U₁, U₂, U₃ at p',
  group: 'basic',
  description: 'The values U₁(p), U₂(p), U₃(p) of the natural frame field at a point.',
  bookRef: '1.2.4',
  names: ['U', 'Up', 'Uq'],
  dims: [3],
  params: () => [P.vec('p', 'Point p', 3, [], { help: 'Coordinates, or the name of a point.' })],
  defaults: (_d, ctx) => ({ p: ctx.find(['point'], (v) => v.kind === 'point' && v.p.length === 3)[0] ?? '(0, 0, 0)' }),
  compute: (p, ctx): Value => {
    const at = pointOf(ctx, p.p, 3);
    return {
      kind: 'frame',
      p: at,
      e: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      labels: ['U_1', 'U_2', 'U_3'],
    };
  },
  caption: (o, cx) => `U_i(${texPointParam(o.params.p, cx)})`,
  algebra: (o, v, cx) => `U_1, U_2, U_3 \\text{ at } ${v && v.kind === 'frame' ? texVec(v.p) : texPointParam(o.params.p, cx)}`,
  course: (_o, v) =>
    v.kind === 'frame'
      ? `$U_1 = (1,0,0)_p$, $U_2 = (0,1,0)_p$, $U_3 = (0,0,1)_p$ at $p = ${texVec(v.p)}$. ` +
        `$U_i$ is the unit vector field in the positive $x_i$ direction ([[1.2.4]]); every vector field is $V = \\sum v_i U_i$ ([[1.2.5]]).`
      : '',
  defaultColor: COLORS.frame,
  command: { name: 'NaturalFrame', args: ['p'] },
};

register(slider, point, tangentVector, naturalFrame);
