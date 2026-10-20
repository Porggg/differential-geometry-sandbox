import type { Scene } from '../core/scene';

/** What the graphics views need from the application. */
export interface ViewHost {
  scene: Scene;
  /** Current tool id ('move', 'point', or an object type creating via dialog). */
  tool(): string;
  selected(): string | null;
  select(name: string | null): void;
  /** Point tool: place a point. */
  placePoint(coords: number[]): void;
  /** Free points (numeric coordinates) can be dragged. */
  isDraggable(name: string): boolean;
  dragPoint(name: string, coords: number[]): void;
  endDrag(): void;
  /** Name of the curve along which this object can be dragged (via its parameter t0), or null. */
  curveHandle(name: string): string | null;
  dragCurveParam(name: string, t: number): void;
  /** The view became the active graphics view. */
  activate(dim: 2 | 3): void;
}

export interface GraphicsView {
  sync(names: Set<string> | 'all'): void;
  setSelection(name: string | null): void;
  resize(): void;
  applyTheme(): void;
  resetView(): void;
}

export const cssVar = (name: string, fallback = '#888'): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
