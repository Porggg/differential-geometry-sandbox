// Core data model: serialisable object definitions, computed values, and object-type descriptors.

import type { Node, UserFunction } from '../math/expr';
import type { Vec, Mat } from '../math/vec';

// ---------------------------------------------------------------------------------------------
// Serialisable definition of a sandbox object

export type ParamValue = string | number | boolean | string[];

export interface Style {
  color: string;
  visible: boolean;
  label: boolean;
  /** Optional TeX caption overriding the generated one. */
  caption?: string;
  opacity?: number;
  /** For sliders: animation state. */
  animating?: boolean;
  speed?: number;
}

export interface ObjData {
  name: string;
  type: string;
  params: Record<string, ParamValue>;
  style: Style;
  /** Auxiliary objects created by a book entry can be hidden from the Algebra view. */
  aux?: boolean;
}

// ---------------------------------------------------------------------------------------------
// Computed values

export interface Extra {
  /** Additional facts shown in the Course view (TeX lines). */
  facts?: [string, string][];
  /** Non-fatal warnings (e.g. frame not orthonormal). */
  warnings?: string[];
  [k: string]: unknown;
}

interface Base {
  extra?: Extra;
}

export interface NumberValue extends Base {
  kind: 'number';
  value: number;
}
export interface PointValue extends Base {
  kind: 'point';
  p: Vec;
}
/** A tangent vector v_p: vector part v, point of application p. */
export interface VectorValue extends Base {
  kind: 'vector';
  p: Vec;
  v: Vec;
}
export interface ArrowItem {
  p: Vec;
  v: Vec;
  color?: string;
  label?: string;
}
/** A collection of tangent vectors (vector fields on curves, components…). */
export interface VectorsValue extends Base {
  kind: 'vectors';
  items: ArrowItem[];
  dashed?: boolean;
}
export interface FrameValue extends Base {
  kind: 'frame';
  p: Vec;
  e: [Vec, Vec, Vec];
  labels: [string, string, string];
}
export interface FramesValue extends Base {
  kind: 'frames';
  frames: { p: Vec; e: [Vec, Vec, Vec] }[];
  labels: [string, string, string];
}
export interface CurveValue extends Base {
  kind: 'curve';
  dim: number;
  param: string;
  a: number;
  b: number;
  f: (t: number) => Vec;
  d1: (t: number) => Vec;
  d2: (t: number) => Vec;
  d3: (t: number) => Vec;
  /** Symbolic components in the parameter, when available. */
  exprs?: Node[];
  /** Draw only this sub-interval highlighted (arc length). */
  highlight?: [number, number];
  ticks?: number;
}
export interface FieldValue extends Base {
  kind: 'field';
  dim: number;
  f: (x: Vec) => Vec;
  exprs: Node[];
  box: number;
  n: number;
  scale: number;
}
export interface FunctionValue extends Base {
  kind: 'function';
  dim: number;
  vars: string[];
  f: (x: Vec) => number;
  expr: Node;
  levels: number[];
  box: number;
  res: number;
}
/** Differential form on R^3. degree 0: [f]; 1: [f1,f2,f3] on dx1,dx2,dx3; 2: [f12,f13,f23] on dx1dx2, dx1dx3, dx2dx3; 3: [f] on dx1dx2dx3. */
export interface FormValue extends Base {
  kind: 'form';
  degree: 0 | 1 | 2 | 3;
  comps: Node[];
}
export interface MappingValue extends Base {
  kind: 'mapping';
  n: number;
  m: number;
  vars: string[];
  exprs: Node[];
  f: (x: Vec) => Vec;
  jac: Node[][];
  box: number;
  lines: number;
  showDomain: boolean;
  /** The drawn grid is the cube/square of half-size box around this point. */
  center: Vec;
}
export interface IsometryValue extends Base {
  kind: 'isometry';
  /** Orthogonal part C (matrix acting on column vectors). */
  C: Mat;
  /** Translation part: F = T_a ∘ C, so F(p) = a + C p. */
  a: Vec;
}
export interface FrameFieldValue extends Base {
  kind: 'framefield';
  /** Attitude matrix A = (a_ij): E_i = Σ_j a_ij U_j (symbolic in x, y, z). */
  A: Node[][];
  E: (x: Vec) => [Vec, Vec, Vec];
  box: number;
  n: number;
  labels: [string, string, string];
  /** TeX description of the frame field in the book's coordinates. */
  bookTex?: string;
}
export interface PlaneValue extends Base {
  kind: 'plane';
  p: Vec;
  u: Vec;
  v: Vec;
  size: number;
}
export interface CircleValue extends Base {
  kind: 'circle';
  c: Vec;
  r: number;
  u: Vec;
  v: Vec;
}
export interface SegmentValue extends Base {
  kind: 'segment';
  p: Vec;
  q: Vec;
}
export interface PlotSeries {
  f: (t: number) => number;
  label: string;
  color?: string;
}
export interface PlotValue extends Base {
  kind: 'plot';
  a: number;
  b: number;
  series: PlotSeries[];
  /** Optional vertical marker (e.g. current t0). */
  marker?: number;
}
export interface FormsValue extends Base {
  kind: 'forms';
  /** Named forms, e.g. ω12, θ1. */
  forms: { label: string; form: FormValue }[];
}
export interface MatrixValue extends Base {
  kind: 'matrix';
  m: Mat;
}
export interface InfoValue extends Base {
  kind: 'info';
}

export type Value =
  | NumberValue
  | PointValue
  | VectorValue
  | VectorsValue
  | FrameValue
  | FramesValue
  | CurveValue
  | FieldValue
  | FunctionValue
  | FormValue
  | MappingValue
  | IsometryValue
  | FrameFieldValue
  | PlaneValue
  | CircleValue
  | SegmentValue
  | PlotValue
  | FormsValue
  | MatrixValue
  | InfoValue;

export type ValueKind = Value['kind'];

// ---------------------------------------------------------------------------------------------
// Object types

export type ParamKind = 'expr' | 'vec' | 'ref' | 'select' | 'bool' | 'int' | 'matrix' | 'text';

export interface ParamSpec {
  key: string;
  label: string;
  kind: ParamKind;
  /** Free variables allowed in expression params. */
  vars?: string[];
  /** Number of components for 'vec' params (and rows for 'matrix'). */
  size?: number;
  /** Accepted value kinds for 'ref' params. */
  accepts?: ValueKind[];
  /** Extra filter for refs (e.g. only 3D curves). */
  filter?: (v: Value) => boolean;
  options?: { value: string; label: string }[];
  help?: string;
  optional?: boolean;
  /** Hide this field unless the predicate holds (depends on other params). */
  when?: (params: Record<string, ParamValue>) => boolean;
  min?: number;
  max?: number;
}

export interface ComputeCtx {
  /** Value of another object (must be a declared dependency). */
  get(name: string): Value;
  /** Scene numbers usable in expressions. */
  numbers: Record<string, number>;
  /** Scene scalar functions usable in expressions (inlined). */
  functions: Record<string, UserFunction>;
  /** Points (and vector parts of tangent vectors) usable as x(p), y(p), z(p). */
  points: Record<string, number[]>;
  /** Evaluate a constant expression. */
  num(src: string | number): number;
}

export interface CourseCtx {
  get(name: string): Value | undefined;
  /** TeX for an object's name/caption. */
  label(name: string): string;
}

export interface Preset {
  label: string;
  params: Record<string, ParamValue>;
}

export interface ObjectType {
  type: string;
  /** Human-readable tool name, e.g. "Curve". */
  label: string;
  group: string;
  /** Short description (tooltip, Course view). */
  description: string;
  /** Entry id in the book (e.g. "1.4.1") defining this notion. */
  bookRef?: string;
  /** Default names to use, in order (then suffixed with numbers). */
  names: string[];
  /** 2 or 3 (fixed), or 'view': the active graphics view decides. */
  dims: (2 | 3)[];
  params(dim: number): ParamSpec[];
  defaults(dim: number, ctx: DefaultsCtx): Record<string, ParamValue>;
  presets?: (dim: number) => Preset[];
  compute(params: Record<string, ParamValue>, ctx: ComputeCtx): Value;
  /** TeX caption (label in views), e.g. "\\alpha'(t_0)". */
  caption(obj: ObjData, cx: CourseCtx): string;
  /** TeX shown in the Algebra view: definition and/or value. */
  algebra(obj: ObjData, value: Value | undefined, cx: CourseCtx): string;
  /** Markdown (with $TeX$) for the Course view details. */
  course?(obj: ObjData, value: Value, cx: CourseCtx): string;
  defaultColor?: string;
  /** Command-bar signature, e.g. Frenet(curve, t0). */
  command?: { name: string; args: string[] };
  /** Interactive placement in views (Point tool). */
  interactive?: boolean;
  /** Warning shown in the creation dialog / Course view. */
  note?: string;
}

export interface DefaultsCtx {
  /** Existing objects whose value kind is one of `kinds`, most recent first. */
  find(kinds: ValueKind[], filter?: (v: Value) => boolean): string[];
  /** A fresh slider name may be suggested. */
  hasNumber(name: string): boolean;
}
