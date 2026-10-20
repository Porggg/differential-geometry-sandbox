// The 2D graphics view (canvas): objects of R², level curves, mappings R² → R², and plots of
// real functions (κ(t), τ(t), …).

import type { SceneObj } from '../core/scene';
import type { Value } from '../core/types';
import { contour } from '../math/isosurface';
import { linspace } from '../math/numeric';
import type { Vec } from '../math/vec';
import { texToHtml } from '../ui/katex';
import { cssVar, type GraphicsView, type ViewHost } from './host';

interface Label {
  tex: string;
  x: number;
  y: number;
  color: string;
}

export class View2D implements GraphicsView {
  readonly el: HTMLElement;
  private canvas: HTMLCanvasElement;
  private overlay: HTMLDivElement;
  private ctx: CanvasRenderingContext2D;
  /** pixels per unit, horizontally and vertically (equal unless the view only shows graphs) */
  private sx = 60;
  private sy = 60;
  /** world coordinates of the canvas center */
  private cx = 0;
  private cy = 0;
  private selection: string | null = null;
  private pending = false;
  private drag: { mode: 'pan' | 'point'; name?: string; x: number; y: number; cx: number; cy: number } | null = null;
  private downAt: { x: number; y: number } | null = null;
  private labels: Label[] = [];
  private legend: { tex: string; color: string }[] = [];

  constructor(container: HTMLElement, private host: ViewHost) {
    this.el = container;
    this.canvas = document.createElement('canvas');
    this.overlay = document.createElement('div');
    this.overlay.className = 'labels2d';
    container.append(this.canvas, this.overlay);
    this.ctx = this.canvas.getContext('2d')!;
    new ResizeObserver(() => this.resize()).observe(container);
    this.canvas.addEventListener('pointerdown', (e) => this.onDown(e));
    this.canvas.addEventListener('pointermove', (e) => this.onMove(e));
    this.canvas.addEventListener('pointerup', (e) => this.onUp(e));
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    container.addEventListener('pointerdown', () => host.activate(2), true);
  }

  /** Fit the drawn objects. Graph-only views get independent x/y scales; geometry keeps a 1:1 aspect. */
  resetView(): void {
    const b = this.contentBounds();
    const w = this.w || 600;
    const h = this.h || 400;
    if (!b) {
      this.sx = this.sy = 60;
      this.cx = this.cy = 0;
    } else {
      let [x0, x1, y0, y1] = b.box;
      if (x1 - x0 < 1e-6) [x0, x1] = [x0 - 1, x1 + 1];
      if (y1 - y0 < 1e-6) [y0, y1] = [y0 - 1, y1 + 1];
      const padX = (x1 - x0) * 0.08;
      const padY = (y1 - y0) * 0.12;
      x0 -= padX;
      x1 += padX;
      y0 -= padY;
      y1 += padY;
      const kx = w / (x1 - x0);
      const ky = h / (y1 - y0);
      if (b.onlyPlots) {
        this.sx = kx;
        this.sy = ky;
      } else this.sx = this.sy = Math.min(kx, ky);
      this.cx = (x0 + x1) / 2;
      this.cy = (y0 + y1) / 2;
    }
    this.redraw();
  }

  fitSoon(): void {
    setTimeout(() => {
      this.resize();
      this.resetView();
    }, 60);
  }

  private contentBounds(): { box: [number, number, number, number]; onlyPlots: boolean } | null {
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    let onlyPlots = true;
    let any = false;
    const addPt = (p: Vec) => {
      if (!p.every(Number.isFinite) || Math.abs(p[0]) > 1e4 || Math.abs(p[1]) > 1e4) return;
      x0 = Math.min(x0, p[0]);
      x1 = Math.max(x1, p[0]);
      y0 = Math.min(y0, p[1]);
      y1 = Math.max(y1, p[1]);
      any = true;
    };
    for (const o of this.host.scene.list()) {
      const v = o.value;
      if (!v || !o.data.style.visible) continue;
      switch (v.kind) {
        case 'point':
          if (v.p.length === 2) (addPt(v.p), (onlyPlots = false));
          break;
        case 'vector':
          if (v.p.length === 2) (addPt(v.p), addPt([v.p[0] + v.v[0], v.p[1] + v.v[1]]), (onlyPlots = false));
          break;
        case 'curve':
          if (v.dim === 2) {
            for (const t of linspace(v.a, v.b, 200)) addPt(v.f(t));
            onlyPlots = false;
          }
          break;
        case 'field':
        case 'function':
          if (v.dim === 2) (addPt([-v.box, -v.box]), addPt([v.box, v.box]), (onlyPlots = false));
          break;
        case 'mapping':
          if (v.n === 2) {
            for (const a of linspace(-v.box, v.box, 9)) for (const c of linspace(-v.box, v.box, 9)) addPt(v.f([a, c]));
            onlyPlots = false;
          }
          break;
        case 'plot': {
          const ys: number[] = [];
          for (const s of v.series) for (const t of linspace(v.a, v.b, 300)) {
            const y = s.f(t);
            if (Number.isFinite(y)) ys.push(y);
          }
          ys.sort((a, b) => a - b);
          const lo = ys.length ? ys[Math.floor(ys.length * 0.02)] : 0;
          const hi = ys.length ? ys[Math.ceil(ys.length * 0.98) - 1] : 1;
          addPt([v.a, Math.min(lo, 0)]);
          addPt([v.b, Math.max(hi, 0)]);
          break;
        }
      }
    }
    if (!any) return null;
    return { box: [x0, x1, y0, y1], onlyPlots };
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.el.clientWidth;
    const h = this.el.clientHeight;
    if (!w || !h) return;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.redraw();
  }

  applyTheme(): void {
    this.redraw();
  }

  sync(): void {
    this.redraw();
  }

  setSelection(name: string | null): void {
    this.selection = name;
    this.redraw();
  }

  redraw(): void {
    if (this.pending) return;
    this.pending = true;
    requestAnimationFrame(() => {
      this.pending = false;
      this.draw();
    });
  }

  // -------------------------------------------------------------------------------------------
  // coordinates

  private get w(): number {
    return this.el.clientWidth;
  }
  private get h(): number {
    return this.el.clientHeight;
  }
  private X = (x: number): number => this.w / 2 + (x - this.cx) * this.sx;
  private Y = (y: number): number => this.h / 2 - (y - this.cy) * this.sy;
  private toWorld = (px: number, py: number): Vec => [this.cx + (px - this.w / 2) / this.sx, this.cy - (py - this.h / 2) / this.sy];
  private bounds(): [number, number, number, number] {
    const [x0, y1] = this.toWorld(0, 0);
    const [x1, y0] = this.toWorld(this.w, this.h);
    return [x0, x1, y0, y1];
  }

  // -------------------------------------------------------------------------------------------
  // drawing

  private draw(): void {
    const c = this.ctx;
    const { w, h } = this;
    if (!w || !h) return;
    c.save();
    c.fillStyle = cssVar('--view-bg', '#fff');
    c.fillRect(0, 0, w, h);
    this.drawGrid();
    this.labels = [];
    this.legend = [];
    for (const o of this.host.scene.list()) {
      if (!o.value || !o.data.style.visible) continue;
      try {
        this.drawObj(o, o.value);
      } catch {
        /* skip objects that fail to draw */
      }
    }
    c.restore();
    this.renderLabels();
  }

  private niceStep(scale: number): number {
    const target = 80 / scale;
    const p = Math.pow(10, Math.floor(Math.log10(target)));
    for (const m of [1, 2, 5, 10]) if (m * p >= target) return m * p;
    return 10 * p;
  }

  private drawGrid(): void {
    const c = this.ctx;
    const [x0, x1, y0, y1] = this.bounds();
    const stepX = this.niceStep(this.sx);
    const stepY = this.niceStep(this.sy);
    c.lineWidth = 1;
    c.strokeStyle = cssVar('--grid-minor', '#f0f0f0');
    c.beginPath();
    for (let x = Math.ceil(x0 / (stepX / 5)) * (stepX / 5); x < x1; x += stepX / 5) {
      c.moveTo(this.X(x), 0);
      c.lineTo(this.X(x), this.h);
    }
    for (let y = Math.ceil(y0 / (stepY / 5)) * (stepY / 5); y < y1; y += stepY / 5) {
      c.moveTo(0, this.Y(y));
      c.lineTo(this.w, this.Y(y));
    }
    c.stroke();
    c.strokeStyle = cssVar('--grid', '#ddd');
    c.beginPath();
    for (let x = Math.ceil(x0 / stepX) * stepX; x < x1; x += stepX) {
      c.moveTo(this.X(x), 0);
      c.lineTo(this.X(x), this.h);
    }
    for (let y = Math.ceil(y0 / stepY) * stepY; y < y1; y += stepY) {
      c.moveTo(0, this.Y(y));
      c.lineTo(this.w, this.Y(y));
    }
    c.stroke();
    // axes
    c.strokeStyle = cssVar('--axis', '#444');
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(0, this.Y(0));
    c.lineTo(this.w, this.Y(0));
    c.moveTo(this.X(0), 0);
    c.lineTo(this.X(0), this.h);
    c.stroke();
    // tick labels
    c.fillStyle = cssVar('--muted', '#777');
    c.font = '11px system-ui, sans-serif';
    const fmtTick = (v: number) => (Math.abs(v) < 1e-9 ? '0' : Number(v.toPrecision(6)).toString());
    const ay = Math.min(Math.max(this.Y(0), 12), this.h - 4);
    const ax = Math.min(Math.max(this.X(0), 4), this.w - 30);
    c.textAlign = 'center';
    for (let x = Math.ceil(x0 / stepX) * stepX; x < x1; x += stepX) if (Math.abs(x) > stepX / 2) c.fillText(fmtTick(x), this.X(x), ay + 13 > this.h ? ay - 4 : ay + 13);
    c.textAlign = 'left';
    for (let y = Math.ceil(y0 / stepY) * stepY; y < y1; y += stepY) if (Math.abs(y) > stepY / 2) c.fillText(fmtTick(y), ax + 4, this.Y(y) + 4);
  }

  private drawObj(o: SceneObj, v: Value): void {
    const c = this.ctx;
    const color = o.data.style.color;
    const sel = this.selection === o.data.name;
    const lw = sel ? 3.5 : 2;
    const cap = o.data.style.label ? this.host.scene.captionOf(o.data.name) : '';
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = lw;
    switch (v.kind) {
      case 'point':
        if (v.p.length !== 2) return;
        c.beginPath();
        c.arc(this.X(v.p[0]), this.Y(v.p[1]), sel ? 6.5 : 5, 0, 2 * Math.PI);
        c.fill();
        c.strokeStyle = cssVar('--view-bg', '#fff');
        c.lineWidth = 1.5;
        c.stroke();
        if (cap) this.label(cap, v.p, color, 8, -8);
        return;
      case 'vector':
        if (v.p.length !== 2) return;
        this.arrow(v.p, v.v, color, lw);
        if (cap) this.label(cap, [v.p[0] + v.v[0], v.p[1] + v.v[1]], color, 6, -6);
        return;
      case 'vectors':
        if (!v.items.length || v.items[0].p.length !== 2) return;
        if (v.dashed) c.setLineDash([5, 4]);
        for (const it of v.items) this.arrow(it.p, it.v, it.color ?? color, lw * 0.8);
        c.setLineDash([]);
        return;
      case 'segment':
        if (v.p.length !== 2) return;
        c.setLineDash([6, 4]);
        this.polyline([v.p, v.q]);
        c.setLineDash([]);
        if (cap) this.label(cap, [(v.p[0] + v.q[0]) / 2, (v.p[1] + v.q[1]) / 2], color, 6, -6);
        return;
      case 'curve': {
        if (v.dim !== 2) return;
        this.polyline(linspace(v.a, v.b, 900).map((t) => v.f(t)));
        if (v.ticks && v.ticks > 0) for (const t of linspace(v.a, v.b, v.ticks + 1)) this.dot(v.f(t), 3);
        if (cap) this.label(cap, v.f(v.a + 0.62 * (v.b - v.a)), color, 6, -6);
        return;
      }
      case 'number': {
        const hl = v.extra?.highlight as { curve: string; a: number; b: number } | undefined;
        const cv = hl && this.host.scene.value(hl.curve);
        if (!hl || !cv || cv.kind !== 'curve' || cv.dim !== 2) return;
        c.lineWidth = lw + 4;
        c.globalAlpha = 0.6;
        this.polyline(linspace(hl.a, hl.b, 400).map((t) => cv.f(t)));
        c.globalAlpha = 1;
        return;
      }
      case 'field': {
        if (v.dim !== 2) return;
        const n = Math.max(2, v.n);
        for (const x of linspace(-v.box, v.box, n))
          for (const y of linspace(-v.box, v.box, n)) {
            const w = v.f([x, y]);
            if (w.every(Number.isFinite)) this.arrow([x, y], w.map((k) => k * v.scale), color, sel ? 2 : 1.4);
          }
        return;
      }
      case 'function': {
        if (v.dim !== 2) return;
        const R = v.box;
        v.levels.forEach((lev) => {
          const segs = contour((x, y) => v.f([x, y]), lev, [-R, R, -R, R], v.res);
          c.beginPath();
          for (let i = 0; i < segs.length; i += 4) {
            c.moveTo(this.X(segs[i]), this.Y(segs[i + 1]));
            c.lineTo(this.X(segs[i + 2]), this.Y(segs[i + 3]));
          }
          c.stroke();
        });
        if (cap) this.label(`${cap} = c`, [R * 0.75, R * 0.9], color, 0, 0);
        return;
      }
      case 'mapping': {
        if (v.n !== 2) return;
        const ticks = linspace(-v.box, v.box, Math.max(2, v.lines));
        const ss = linspace(-v.box, v.box, 120);
        if (v.showDomain) {
          c.save();
          c.strokeStyle = cssVar('--muted', '#999');
          c.globalAlpha = 0.35;
          c.lineWidth = 1;
          for (const a of ticks) {
            this.polyline([[a, -v.box], [a, v.box]]);
            this.polyline([[-v.box, a], [v.box, a]]);
          }
          c.restore();
        }
        c.lineWidth = sel ? 2 : 1.3;
        for (const a of ticks) {
          this.polyline(ss.map((s) => v.f([a, s])));
          this.polyline(ss.map((s) => v.f([s, a])));
        }
        return;
      }
      case 'plot': {
        const [x0, x1] = this.bounds();
        const lo = Math.max(v.a, x0);
        const hi = Math.min(v.b, x1);
        v.series.forEach((s) => {
          c.strokeStyle = s.color ?? color;
          c.lineWidth = lw;
          this.polyline(linspace(lo, hi, 800).map((t) => [t, s.f(t)]), true);
          this.legend.push({ tex: s.label ? `${s.label}` : cap, color: s.color ?? color });
        });
        if (v.marker !== undefined && Number.isFinite(v.marker)) {
          c.save();
          c.strokeStyle = cssVar('--muted', '#888');
          c.setLineDash([4, 4]);
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(this.X(v.marker), 0);
          c.lineTo(this.X(v.marker), this.h);
          c.stroke();
          c.restore();
          v.series.forEach((s) => {
            const y = s.f(v.marker!);
            if (Number.isFinite(y)) {
              c.fillStyle = s.color ?? color;
              this.dot([v.marker!, y], 4);
            }
          });
        }
        return;
      }
      default:
        return;
    }
  }

  private polyline(pts: Vec[], breakOnJump = false): void {
    const c = this.ctx;
    c.beginPath();
    let pen = false;
    let prev: Vec | null = null;
    for (const p of pts) {
      const ok = p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) < 1e6 && Math.abs(p[1]) < 1e6;
      if (!ok) {
        pen = false;
        prev = null;
        continue;
      }
      const X = this.X(p[0]);
      const Y = this.Y(p[1]);
      if (breakOnJump && prev && Math.abs(Y - this.Y(prev[1])) > this.h * 2) pen = false;
      if (pen) c.lineTo(X, Y);
      else c.moveTo(X, Y);
      pen = true;
      prev = p;
    }
    c.stroke();
  }

  private dot(p: Vec, r: number): void {
    if (!p.every(Number.isFinite)) return;
    this.ctx.beginPath();
    this.ctx.arc(this.X(p[0]), this.Y(p[1]), r, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  private arrow(p: Vec, v: Vec, color: string, lw: number): void {
    const c = this.ctx;
    if (!p.every(Number.isFinite) || !v.every(Number.isFinite)) return;
    const x0 = this.X(p[0]);
    const y0 = this.Y(p[1]);
    const x1 = this.X(p[0] + v[0]);
    const y1 = this.Y(p[1] + v[1]);
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (len < 0.5) return;
    const head = Math.min(11, len * 0.4);
    const ang = Math.atan2(y1 - y0, x1 - x0);
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = lw;
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1 - head * 0.8 * Math.cos(ang), y1 - head * 0.8 * Math.sin(ang));
    c.stroke();
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x1 - head * Math.cos(ang - 0.38), y1 - head * Math.sin(ang - 0.38));
    c.lineTo(x1 - head * Math.cos(ang + 0.38), y1 - head * Math.sin(ang + 0.38));
    c.closePath();
    c.fill();
  }

  private label(tex: string, at: Vec, color: string, dx: number, dy: number): void {
    if (!at.every(Number.isFinite)) return;
    this.labels.push({ tex, x: this.X(at[0]) + dx, y: this.Y(at[1]) + dy, color });
  }

  private renderLabels(): void {
    const parts = this.labels
      .filter((l) => l.x > -50 && l.x < this.w + 50 && l.y > -30 && l.y < this.h + 30)
      .map((l) => `<div class="obj-label" style="left:${l.x}px;top:${l.y}px;color:${l.color}">${texToHtml(l.tex)}</div>`);
    if (this.legend.length) {
      parts.push(
        `<div class="plot-legend">${this.legend.map((l) => `<span><i style="background:${l.color}"></i>${texToHtml(l.tex)}</span>`).join('')}</div>`,
      );
    }
    this.overlay.innerHTML = parts.join('');
  }

  // -------------------------------------------------------------------------------------------
  // interaction

  private hitPoint(px: number, py: number): string | null {
    let best: string | null = null;
    let bd = 12;
    for (const o of this.host.scene.list()) {
      const v = o.value;
      if (!v || !o.data.style.visible) continue;
      let p: Vec | null = null;
      if (v.kind === 'point' && v.p.length === 2) p = v.p;
      if (v.kind === 'vector' && v.p.length === 2) p = [v.p[0] + v.v[0], v.p[1] + v.v[1]];
      if (!p) continue;
      const d = Math.hypot(this.X(p[0]) - px, this.Y(p[1]) - py);
      if (d < bd) {
        bd = d;
        best = o.data.name;
      }
    }
    return best;
  }

  private hitCurve(px: number, py: number): string | null {
    for (const o of [...this.host.scene.list()].reverse()) {
      const v = o.value;
      if (!v || !o.data.style.visible) continue;
      if (v.kind === 'curve' && v.dim === 2) {
        for (const t of linspace(v.a, v.b, 400)) {
          const p = v.f(t);
          if (Math.hypot(this.X(p[0]) - px, this.Y(p[1]) - py) < 6) return o.data.name;
        }
      }
    }
    return null;
  }

  private pos(e: PointerEvent): [number, number] {
    const r = this.canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  private onDown(e: PointerEvent): void {
    const [x, y] = this.pos(e);
    this.downAt = { x, y };
    this.canvas.setPointerCapture(e.pointerId);
    const tool = this.host.tool();
    if (tool === 'move') {
      const name = this.hitPoint(x, y);
      if (name && this.host.isDraggable(name) && this.host.scene.value(name)?.kind === 'point') {
        this.drag = { mode: 'point', name, x, y, cx: this.cx, cy: this.cy };
        this.host.select(name);
        return;
      }
    }
    this.drag = { mode: 'pan', x, y, cx: this.cx, cy: this.cy };
  }

  private onMove(e: PointerEvent): void {
    if (!this.drag) return;
    const [x, y] = this.pos(e);
    if (this.drag.mode === 'pan') {
      this.cx = this.drag.cx - (x - this.drag.x) / this.sx;
      this.cy = this.drag.cy + (y - this.drag.y) / this.sy;
      this.redraw();
    } else if (this.drag.name) {
      const [wx, wy] = this.toWorld(x, y);
      const r = (v: number) => Math.round(v * 20) / 20;
      this.host.dragPoint(this.drag.name, [r(wx), r(wy)]);
    }
  }

  private onUp(e: PointerEvent): void {
    const [x, y] = this.pos(e);
    const d = this.drag;
    this.drag = null;
    const moved = this.downAt && Math.hypot(x - this.downAt.x, y - this.downAt.y) > 4;
    this.downAt = null;
    if (d?.mode === 'point') {
      this.host.endDrag();
      return;
    }
    if (moved) return;
    if (this.host.tool() === 'point') {
      const [wx, wy] = this.toWorld(x, y);
      const r = (v: number) => Math.round(v * 10) / 10;
      this.host.placePoint([r(wx), r(wy)]);
      return;
    }
    this.host.select(this.hitPoint(x, y) ?? this.hitCurve(x, y));
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const [px, py] = this.pos(e as unknown as PointerEvent);
    const before = this.toWorld(px, py);
    const k = Math.exp(-e.deltaY * 0.0015);
    // Shift: zoom the y axis only (useful for graphs); Alt: x axis only.
    if (!e.altKey) this.sx = Math.min(1e5, Math.max(0.5, this.sx * k));
    if (!e.shiftKey) this.sy = Math.min(1e5, Math.max(0.5, this.sy * k));
    const after = this.toWorld(px, py);
    this.cx += before[0] - after[0];
    this.cy += before[1] - after[1];
    this.redraw();
  }
}

