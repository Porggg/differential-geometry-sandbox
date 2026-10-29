// Application shell: layout, tools, selection, history, persistence, dialogs, command bar, animation.

import LZString from 'lz-string';
import { entryLabel, getEntry, hasContent } from './content';
import { buildSceneSpec } from './content/build';
import type { SceneSpec } from './content/types';
import { commandHelp, parseCommand } from './core/command';
import { getType } from './core/registry';
import { Scene, type SceneEvent } from './core/scene';
import type { ObjData, ParamValue, Style } from './core/types';
import { evalConst } from './math/expr';
import type { ViewHost } from './render/host';
import { View2D } from './render/view2d';
import { View3D } from './render/view3d';
import { AlgebraPanel } from './ui/algebra';
import { CoursePanel, type CoursePage } from './ui/course';
import { FigureCaption } from './ui/figure';
import { buildForm } from './ui/form';
import { ICONS } from './ui/icons';
import { escapeHtml, texToHtml } from './ui/katex';
import { Toolbar } from './ui/toolbar';

type PanelId = 'algebra' | 'v2d' | 'v3d' | 'course' | 'cmd';

interface Layout {
  /** Book: the course is the main page, the figure beside it. Sandbox: construction tools. */
  mode: 'book' | 'sandbox';
  /** Width of the figure panel in book mode, as a fraction of the window. */
  figFrac: number;
  algebra: boolean;
  v2d: boolean;
  v3d: boolean;
  course: boolean;
  cmd: boolean;
  courseMax: boolean;
  wAlgebra: number;
  wCourse: number;
}

const PALETTE = ['#0969da', '#cf222e', '#1a7f37', '#8250df', '#bf8700', '#bc4c00', '#0550ae', '#bf3989', '#57606a'];

const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, v: string): void {
    try {
      localStorage.setItem(key, v);
    } catch {
      /* storage unavailable */
    }
  },
};

export class App implements ViewHost {
  scene = new Scene();
  private _tool = 'move';
  private _selected: string | null = null;
  private _activeDim: 2 | 3 = 3;
  private loaded: string | null = null;
  /** False until the URL hash has been read at startup. */
  private booted = false;
  private layout: Layout;
  private undoStack: string[] = [];
  private undoPos = -1;
  private saveTimer = 0;
  private colorIdx = 0;
  private animating = new Set<string>();
  private lastFrame = 0;
  private cmdHistory: string[] = [];
  private cmdPos = 0;

  private root: HTMLElement;
  private view2d!: View2D;
  private view3d!: View3D;
  private toolbar!: Toolbar;
  private algebra!: AlgebraPanel;
  private course!: CoursePanel;
  private figure!: FigureCaption;

  constructor(root: HTMLElement) {
    this.root = root;
    const narrow = window.innerWidth < 900;
    const saved = safeParse<Layout>(store.get('dgs.layout'));
    this.layout = {
      mode: 'book',
      figFrac: 0.4,
      algebra: true,
      v2d: false,
      v3d: true,
      course: !narrow,
      cmd: true,
      courseMax: false,
      wAlgebra: 290,
      wCourse: 470,
      ...(saved ?? {}),
    };
    delete (this.layout as unknown as Record<string, unknown>).toc;
    this.applyThemeAttr(store.get('dgs.theme') as 'light' | 'dark' | null);
    this.buildDom();
    this.scene.on((e) => this.onScene(e));
    this.applyLayout();
    this.boot();
    this.booted = true;
    this.pageChanged(this.course.page);
    document.addEventListener('keydown', (e) => this.onKey(e));
    window.addEventListener('hashchange', () => this.onHash());
    requestAnimationFrame((t) => this.animate(t));
  }

  // ===========================================================================================
  // DOM

  private buildDom(): void {
    this.root.innerHTML = `
      <header class="topbar">
        <div class="brand" title="Differential Geometry Sandbox — O'Neill, Chapters 1–3">
          <span class="logo">∂</span><span class="brand-name">DG Sandbox</span>
        </div>
        <div class="mode-switch" role="tablist" aria-label="Mode">
          <button data-mode="book" role="tab" title="Read the course, with the figure beside the text">${ICONS.book}<span>Book</span></button>
          <button data-mode="sandbox" role="tab" title="Construction tools: toolbar, Algebra view, command bar">${ICONS.view3d}<span>Sandbox</span></button>
        </div>
        <div class="toolbar-slot sandbox-only"></div>
        <div class="top-actions">
          <button class="icon-btn sandbox-only" data-act="undo" title="Undo (Ctrl/⌘ Z)">${ICONS.undo}</button>
          <button class="icon-btn sandbox-only" data-act="redo" title="Redo (Ctrl/⌘ Shift Z)">${ICONS.redo}</button>
          <span class="sep sandbox-only"></span>
          <button class="toggle-btn sandbox-only" data-panel="algebra" title="Algebra view">${ICONS.algebra}<span>Algebra</span></button>
          <button class="toggle-btn sandbox-only" data-panel="v2d" title="2D graphics view">${ICONS.view2d}<span>2D</span></button>
          <button class="toggle-btn sandbox-only" data-panel="v3d" title="3D graphics view">${ICONS.view3d}<span>3D</span></button>
          <button class="toggle-btn sandbox-only" data-panel="course" title="Course view">${ICONS.course}<span>Course</span></button>
          <button class="toggle-btn sandbox-only" data-panel="cmd" title="Command bar">${ICONS.command}<span>Input</span></button>
          <button class="toggle-btn book-only" data-act="contents" title="Table of contents">${ICONS.contents}<span>Contents</span></button>
          <button class="icon-btn book-only" data-act="theme" title="Light / dark">${ICONS.theme}</button>
          <span class="sep"></span>
          <div class="menu-wrap">
            <button class="icon-btn" data-act="menu" title="Menu">${ICONS.menu}</button>
            <div class="dropdown" hidden>
              <button data-act="new">${ICONS.plus} New empty construction</button>
              <button data-act="export">${ICONS.download} Export construction (.json)</button>
              <button data-act="import">${ICONS.upload} Import construction…</button>
              <button data-act="share">${ICONS.share} Copy shareable link</button>
              <hr>
              <button data-act="resetView">${ICONS.reset} Reset graphics views</button>
              <button data-act="theme">${ICONS.theme} Toggle light / dark</button>
              <button data-act="aux">${ICONS.eye} Show auxiliary objects</button>
              <hr>
              <button data-act="contents">${ICONS.contents} Contents of the book</button>
              <button data-act="home">${ICONS.help} How to use the sandbox</button>
            </div>
          </div>
        </div>
      </header>
      <main class="workspace">
        <aside class="panel" data-pane="algebra"></aside>
        <div class="splitter" data-split="algebra"></div>
        <section class="graphics">
          <div class="gviews">
            <div class="gview" data-view="2d"><span class="gview-tag">2D</span><button class="icon-btn sm gview-reset" title="Reset view">${ICONS.reset}</button></div>
            <div class="gview" data-view="3d"><span class="gview-tag">3D</span><button class="icon-btn sm gview-reset" title="Reset view">${ICONS.reset}</button></div>
            <div class="graphics-empty">Nothing to draw for this entry — see the Algebra and Course views.<br><button class="btn sm" data-act="show3d">Show the 3D view</button></div>
          </div>
        </section>
        <div class="splitter" data-split="course"></div>
        <aside class="panel" data-pane="course"></aside>
      </main>
      <footer class="cmdbar">
        <span class="cmd-prompt">Input:</span>
        <input type="text" class="cmd-input" spellcheck="false" autocomplete="off" placeholder="e.g.  alpha(t) = (cos(t), sin(t), t/3)   ·   V = x*y*U1 - z*U3   ·   phi = x^2 dx - y dz   ·   Frenet(alpha, 1)">
        <button class="icon-btn sm" data-act="cmdhelp" title="Command help">${ICONS.help}</button>
        <div class="cmd-msg"></div>
        <div class="cmd-help" hidden></div>
      </footer>
      <div class="toasts"></div>
      <input type="file" class="file-input" accept=".json,application/json" hidden>`;

    this.toolbar = new Toolbar({
      tool: () => this._tool,
      setTool: (id) => this.setTool(id),
      activeDim: () => this._activeDim,
      createWithDialog: (type) => this.createWithDialog(type),
    });
    this.$('.toolbar-slot').append(this.toolbar.el);

    this.algebra = new AlgebraPanel({
      scene: this.scene,
      selected: () => this._selected,
      select: (n) => this.select(n),
      commit: () => this.commit(),
      setSliderTransient: (n, v) => this.scene.setNumber(n, 'value', v),
      toggleAnimation: (n) => this.toggleAnimation(n),
      setAnimationSpeed: (n, v) => {
        this.scene.update(n, { style: { speed: v } });
        this.commit();
      },
      rename: (a, b) => this.scene.rename(a, b),
      remove: (n) => this.remove(n),
      openObject: (n) => this.openObject(n),
      toast: (m, k) => this.toast(m, k),
    });
    this.$('[data-pane=algebra]').append(this.algebra.el);

    this.course = new CoursePanel({
      scene: this.scene,
      openEntry: (id) => this.openEntry(id),
      showFigure: (id) => {
        this.loadEntryScene(id, 'replace', false);
        if (this.layout.courseMax) {
          this.layout.courseMax = false;
          this.applyLayout();
        }
      },
      loadEntryScene: (id, mode) => this.loadEntryScene(id, mode),
      loadedEntry: () => this.loaded,
      select: (n) => this.select(n),
      editObject: (n) => this.editObject(n),
      openSection: (c, sct) => this.openSection(c, sct),
      toggleMaximize: () => {
        this.layout.courseMax = !this.layout.courseMax;
        this.applyLayout();
      },
      isMaximized: () => this.layout.courseMax,
      pageChanged: (pg) => this.pageChanged(pg),
    });
    this.$('[data-pane=course]').append(this.course.el);

    this.figure = new FigureCaption({
      scene: this.scene,
      setSlider: (n, v) => this.scene.setNumber(n, 'value', v),
      commit: () => this.commit(),
      toggleAnimation: (n) => this.toggleAnimation(n),
      loadedEntry: () => this.loaded,
      mode: () => this.layout.mode,
      setMode: (m) => this.setMode(m),
      openEntry: (id) => this.openEntry(id),
    });
    const gfx = this.$('.graphics');
    gfx.prepend(this.figure.head);
    gfx.append(this.figure.controls, this.figure.foot);
    new ResizeObserver(() => this.updateStacked()).observe(gfx);
    this.root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((b) => b.addEventListener('click', () => this.setMode(b.dataset.mode as 'book' | 'sandbox')));
    this.view2d = new View2D(this.$('[data-view="2d"]'), this);
    this.view3d = new View3D(this.$('[data-view="3d"]'), this);
    this.$('[data-view="2d"] .gview-reset').addEventListener('click', () => this.view2d.resetView());
    this.$('[data-view="3d"] .gview-reset').addEventListener('click', () => this.view3d.resetView());

    // header actions
    this.root.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach((b) =>
      b.addEventListener('click', () => this.togglePanel(b.dataset.panel as PanelId)),
    );
    const dd = this.$('.dropdown');
    this.root.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
      if (!b) {
        if (!(e.target as HTMLElement).closest('.menu-wrap')) dd.hidden = true;
        return;
      }
      const act = b.dataset.act!;
      if (act === 'menu') {
        dd.hidden = !dd.hidden;
        return;
      }
      dd.hidden = true;
      this.action(act);
    });

    // splitters
    this.root.querySelectorAll<HTMLElement>('[data-split]').forEach((s) => this.initSplitter(s));

    // command bar
    const input = this.$('.cmd-input') as HTMLInputElement;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.runCommand(input.value);
      } else if (e.key === 'ArrowUp' && this.cmdHistory.length) {
        this.cmdPos = Math.max(0, this.cmdPos - 1);
        input.value = this.cmdHistory[this.cmdPos] ?? '';
        e.preventDefault();
      } else if (e.key === 'ArrowDown' && this.cmdHistory.length) {
        this.cmdPos = Math.min(this.cmdHistory.length, this.cmdPos + 1);
        input.value = this.cmdHistory[this.cmdPos] ?? '';
        e.preventDefault();
      }
    });
    const help = this.$('.cmd-help');
    help.innerHTML =
      `<div class="cmd-help-head">Commands <span class="muted">(arguments in order; omitted ones get defaults)</span></div>` +
      `<div class="cmd-help-grid">` +
      [
        ['a = 1', 'number / slider'],
        ['p = (1, 2, 3)', 'point (2 coordinates: in R²)'],
        ['alpha(t) = (cos(t), sin(t), t)', 'curve (parameter t, s or u)'],
        ['f(x,y,z) = x^2 + y^2 - z', 'function'],
        ['V = x*y*U1 - z*U3', 'vector field, book notation'],
        ['phi = x^2 dx - y dz', '1-form, book notation'],
        ['F(x,y,z) = (x - y, x^2 + y^2, z)', 'mapping (names F, G, H, M)'],
      ]
        .map(([c, d]) => `<code>${escapeHtml(c)}</code><span>${escapeHtml(d)}</span>`)
        .join('') +
      commandHelp()
        .map((c) => `<code>${escapeHtml(c.signature)}</code><span>${escapeHtml(c.label)}</span>`)
        .join('') +
      `</div>`;

    (this.$('.file-input') as HTMLInputElement).addEventListener('change', (e) => this.importFile(e));
  }

  private $(sel: string): HTMLElement {
    return this.root.querySelector(sel) as HTMLElement;
  }

  // ===========================================================================================
  // Layout

  private togglePanel(p: PanelId): void {
    if (p === 'v2d' || p === 'v3d') {
      this.layout[p] = !this.layout[p];
      if (this.layout[p]) this.activate(p === 'v2d' ? 2 : 3);
    } else this.layout[p] = !this.layout[p];
    this.applyLayout();
  }

  setMode(m: 'book' | 'sandbox'): void {
    if (this.layout.mode === m) return;
    this.layout.mode = m;
    if (m === 'sandbox') {
      this.layout.course = true;
      this.layout.courseMax = false;
    }
    this.applyLayout();
    this.figure.update();
    this.view3d.fitSoon();
    this.view2d.fitSoon();
  }

  private applyLayout(): void {
    const L = this.layout;
    const book = L.mode === 'book';
    this.root.classList.toggle('mode-book', book);
    this.root.classList.toggle('mode-sandbox', !book);
    this.root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === L.mode));
    if (book) L.course = true;
    const show = (sel: string, on: boolean) => this.root.querySelectorAll<HTMLElement>(sel).forEach((e) => (e.style.display = on ? '' : 'none'));
    show('[data-pane=algebra], [data-split=algebra]', L.algebra);
    show('[data-pane=course], [data-split=course]', L.course);
    show('.cmdbar', L.cmd);
    show('[data-view="2d"]', L.v2d);
    show('[data-view="3d"]', L.v3d);
    const anyView = L.v2d || L.v3d;
    show('.graphics-empty', !anyView);
    this.$('.graphics').classList.toggle('no-views', !anyView);
    this.$('.workspace').classList.toggle('no-views', !anyView);
    this.$('.workspace').classList.toggle('course-max', L.course && L.courseMax);
    this.course?.updateMaxButton();
    this.$('[data-split=algebra]').style.display = L.algebra ? '' : 'none';
    this.$('[data-pane=algebra]').style.width = `${L.wAlgebra}px`;
    this.$('[data-pane=course]').style.width = book ? '' : `${L.wCourse}px`;
    if (!(L.figFrac > 0.15 && L.figFrac < 0.75)) L.figFrac = 0.4;
    this.$('.graphics').style.width = book ? `${(L.figFrac * 100).toFixed(1)}%` : '';
    this.root.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach((b) => b.classList.toggle('on', !!L[b.dataset.panel as PanelId]));
    if (!L.v2d && this._activeDim === 2 && L.v3d) this._activeDim = 3;
    if (!L.v3d && this._activeDim === 3 && L.v2d) this._activeDim = 2;
    this.markActiveView();
    this.updateStacked();
    store.set('dgs.layout', JSON.stringify(L));
    requestAnimationFrame(() => {
      this.view2d.resize();
      this.view3d.resize();
    });
  }

  /** Stack the 2D view under the 3D view when both are shown in a tall, narrow area. */
  private updateStacked(): void {
    const gfx = this.$('.gviews');
    gfx.classList.toggle('stacked', this.layout.v2d && this.layout.v3d && gfx.clientWidth < gfx.clientHeight * 1.25);
  }

  private initSplitter(s: HTMLElement): void {
    const which = s.dataset.split as 'algebra' | 'course';
    s.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      s.setPointerCapture(e.pointerId);
      const x0 = e.clientX;
      const book = this.layout.mode === 'book' && which === 'course';
      const key = which === 'algebra' ? 'wAlgebra' : 'wCourse';
      const w0 = this.layout[key];
      const f0 = this.layout.figFrac;
      const total = this.$('.workspace').clientWidth || window.innerWidth;
      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - x0;
        if (book) {
          // the splitter sits between the text (left) and the figure (right)
          this.layout.figFrac = Math.max(0.2, Math.min(0.7, f0 - dx / total));
          this.$('.graphics').style.width = `${(this.layout.figFrac * 100).toFixed(1)}%`;
        } else {
          this.layout[key] = Math.max(180, Math.min(900, which === 'course' ? w0 - dx : w0 + dx));
          this.$(`[data-pane=${which}]`).style.width = `${this.layout[key]}px`;
        }
        this.view2d.resize();
        this.view3d.resize();
      };
      const up = () => {
        s.removeEventListener('pointermove', move);
        s.removeEventListener('pointerup', up);
        this.applyLayout();
      };
      s.addEventListener('pointermove', move);
      s.addEventListener('pointerup', up);
    });
  }

  private markActiveView(): void {
    const both = this.layout.v2d && this.layout.v3d;
    this.$('[data-view="2d"]').classList.toggle('active', both && this._activeDim === 2);
    this.$('[data-view="3d"]').classList.toggle('active', both && this._activeDim === 3);
  }

  // ===========================================================================================
  // ViewHost

  tool(): string {
    return this._tool;
  }

  setTool(id: string): void {
    this._tool = id;
    this.toolbar.render();
    this.root.classList.toggle('tool-point', id === 'point');
  }

  selected(): string | null {
    return this._selected;
  }

  activeDim(): 2 | 3 {
    return this._activeDim;
  }

  activate(dim: 2 | 3): void {
    if (this._activeDim === dim) return;
    this._activeDim = dim;
    this.markActiveView();
    this.toolbar.render();
  }

  select(name: string | null): void {
    if (name && !this.scene.has(name)) name = null;
    if (this._selected === name) return;
    this._selected = name;
    this.view3d.setSelection(name);
    this.view2d.setSelection(name);
    this.algebra.setSelection(name);
    if (name) this.course.show({ kind: 'object', name });
  }

  placePoint(coords: number[]): void {
    const t = getType('point');
    const name = this.scene.freshName(t.names);
    const data: ObjData = { name, type: 'point', params: { coords: `(${coords.join(', ')})`, dim: coords.length }, style: this.defaultStyle('point') };
    try {
      this.scene.add(data);
      this.commit();
      this.select(name);
    } catch (e) {
      this.toast((e as Error).message, 'error');
    }
  }

  isDraggable(name: string): boolean {
    const o = this.scene.get(name);
    if (!o || o.data.type !== 'point') return false;
    const c = String(o.data.params.coords ?? '');
    return /^\(\s*-?[\d.]+(\s*,\s*-?[\d.]+){1,2}\s*\)$/.test(c);
  }

  dragPoint(name: string, coords: number[]): void {
    const fmt = (x: number) => String(Math.round(x * 1000) / 1000);
    this.scene.update(name, { params: { coords: `(${coords.map(fmt).join(', ')})` } });
  }

  endDrag(): void {
    this.commit();
  }

  /** Objects defined by (curve, t0) can be dragged along their curve; returns the curve's name. */
  curveHandle(name: string): string | null {
    const o = this.scene.get(name);
    const p = o?.data.params;
    if (!p || typeof p.curve !== 'string' || p.t0 === undefined || p.along) return null;
    const t0 = String(p.t0).trim();
    const sl = this.scene.get(t0);
    const sliderOk = sl?.data.type === 'slider' && /^\s*-?\d+(\.\d+)?\s*$/.test(String(sl.data.params.value));
    if (!sliderOk && !/^-?\d+(\.\d+)?$/.test(t0)) return null;
    return this.scene.value(p.curve)?.kind === 'curve' ? p.curve : null;
  }

  dragCurveParam(name: string, t: number): void {
    const o = this.scene.get(name);
    if (!o) return;
    const c = this.scene.value(String(o.data.params.curve));
    if (!c || c.kind !== 'curve') return;
    t = Math.min(c.b, Math.max(c.a, t));
    const t0 = String(o.data.params.t0).trim();
    const sl = this.scene.get(t0);
    const r = (x: number) => Math.round(x * 1000) / 1000;
    if (sl && sl.data.type === 'slider') {
      if (sl.data.style.animating) this.toggleAnimation(t0);
      const nums = this.scene.allNumbers();
      const ev = (v: ParamValue | undefined, d: number) => {
        try {
          return evalConst(String(v), nums);
        } catch {
          return d;
        }
      };
      t = Math.min(ev(sl.data.params.max, t), Math.max(ev(sl.data.params.min, t), t));
      this.scene.setNumber(t0, 'value', r(t));
    } else this.scene.update(name, { params: { t0: String(r(t)) } });
  }

  // ===========================================================================================
  // Scene events

  private onScene(e: SceneEvent): void {
    if (e.type === 'structure') {
      if (this._selected && !this.scene.has(this._selected)) this._selected = null;
      this.view3d.sync('all');
      this.view2d.sync();
      this.algebra.rebuild();
      this.algebra.setSelection(this._selected);
      this.course.refresh('all');
      this.figure.update();
      for (const n of [...this.animating]) if (!this.scene.has(n)) this.animating.delete(n);
    } else if (e.type === 'values') {
      this.view3d.sync(e.names);
      this.view2d.sync();
      this.algebra.update(e.names);
      this.course.refresh(e.names);
      this.figure.updateChecks();
    } else {
      const s = new Set([e.name]);
      this.view3d.sync(s);
      this.view2d.sync();
      this.algebra.update(s);
      this.figure.updateChecks();
    }
  }

  // ===========================================================================================
  // History & persistence

  private snapshot(): string {
    return JSON.stringify({ objects: this.scene.serialize(), entry: this.loaded });
  }

  commit(): void {
    const snap = this.snapshot();
    if (this.undoStack[this.undoPos] === snap) return;
    this.undoStack = this.undoStack.slice(0, this.undoPos + 1);
    this.undoStack.push(snap);
    if (this.undoStack.length > 200) this.undoStack.shift();
    this.undoPos = this.undoStack.length - 1;
    this.scheduleSave();
  }

  private restore(snap: string): void {
    const s = safeParse<{ objects: ObjData[]; entry: string | null }>(snap);
    if (!s) return;
    this.loaded = s.entry;
    this.animating.clear();
    this.scene.load(s.objects);
    for (const o of this.scene.list()) if (o.data.style.animating) this.animating.add(o.data.name);
    this.scheduleSave();
  }

  undo(): void {
    if (this.undoPos <= 0) return;
    this.undoPos--;
    this.restore(this.undoStack[this.undoPos]);
  }

  redo(): void {
    if (this.undoPos >= this.undoStack.length - 1) return;
    this.undoPos++;
    this.restore(this.undoStack[this.undoPos]);
  }

  private scheduleSave(): void {
    clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => store.set('dgs.scene', this.snapshot()), 400);
  }

  private boot(): void {
    if (this.onHash(true)) return;
    const saved = store.get('dgs.scene');
    const s = saved && safeParse<{ objects: ObjData[]; entry: string | null }>(saved);
    if (s && s.objects?.length) {
      this.restore(saved!);
      this.commit();
      if (s.entry && getEntry(s.entry)) this.course.show({ kind: 'entry', id: s.entry });
      this.view3d.fitSoon();
      this.view2d.fitSoon();
      return;
    }
    // first visit: the book's contents + the Frenet figure
    this.loadEntryScene('2.3.2', 'replace', false);
    this.course.show({ kind: 'contents' });
  }

  /** Handles #entry=… and #scene=… (returns true if something was loaded). */
  private onHash(initial = false): boolean {
    const h = new URLSearchParams(location.hash.slice(1));
    const sc = h.get('scene');
    if (sc) {
      const json = LZString.decompressFromEncodedURIComponent(sc);
      const s = json && safeParse<{ objects: ObjData[]; entry: string | null }>(json);
      if (s) {
        this.restore(json!);
        this.commit();
        if (s.entry && getEntry(s.entry)) this.course.show({ kind: 'entry', id: s.entry });
        history.replaceState(null, '', location.pathname + location.search);
        return true;
      }
    }
    const id = h.get('entry');
    if (id && getEntry(id)) {
      if (!initial && id === this.loaded) return true;
      this.openEntry(id);
      return true;
    }
    const sec = h.get('section');
    if (sec && /^\d+\.\d+$/.test(sec)) {
      const [c, n] = sec.split('.').map(Number);
      if (initial) this.loadEntryScene('2.3.2', 'replace', false);
      this.openSection(c, n);
      return true;
    }
    const ex = h.get('ex');
    if (ex && /^\d+\.\d+(\.\d+)?$/.test(ex)) {
      if (initial) this.loadEntryScene('2.3.2', 'replace', false);
      if (!this.layout.course) {
        this.layout.course = true;
        this.applyLayout();
      }
      this.course.openExercise(ex);
      return true;
    }
    if (h.has('contents')) {
      if (initial) this.loadEntryScene('2.3.2', 'replace', false);
      this.course.show({ kind: 'contents' });
      return true;
    }
    return false;
  }

  /** Keep the URL in sync with the book page (shareable links to entries and sections). */
  private pageChanged(page: CoursePage): void {
    // the course panel reports its first page while it is built: keep the URL until it has been read
    if (!this.booted) return;
    let hash = '';
    if (page.kind === 'entry') hash = `#entry=${page.id}`;
    else if (page.kind === 'section') hash = `#section=${page.chapter}.${page.section}`;
    else if (page.kind === 'exercise') hash = `#ex=${page.id}`;
    else if (page.kind !== 'contents') return;
    if (location.hash !== hash) history.replaceState(null, '', hash || location.pathname + location.search);
  }

  openSection(chapter: number, section: number): void {
    if (!this.layout.course) {
      this.layout.course = true;
      this.applyLayout();
    }
    this.course.show({ kind: 'section', chapter, section });
  }

  // ===========================================================================================
  // Entries

  openEntry(id: string): void {
    const e = getEntry(id);
    if (!e) return;
    if (!this.layout.course) {
      this.layout.course = true;
      this.applyLayout();
    }
    if (e.scene && hasContent(e)) this.loadEntryScene(id, 'replace', false);
    this.course.show({ kind: 'entry', id });
  }

  loadedEntry(): string | null {
    return this.loaded;
  }

  loadEntryScene(id: string, mode: 'replace' | 'add', showPage = true): void {
    const e = getEntry(id);
    if (!e?.scene) return;
    let datas = this.buildSpec(e.scene);
    this.animating.clear();
    if (mode === 'replace') {
      this.loaded = id;
      this._selected = null;
      this.scene.load(datas);
    } else {
      datas = this.renameForAdd(datas);
      this.scene.addMany(datas);
    }
    // views wanted by the entry
    const views = e.scene.views;
    if (mode === 'add' && ((views.includes('2d') && !this.layout.v2d) || (views.includes('3d') && !this.layout.v3d))) {
      if (views.includes('2d')) this.layout.v2d = true;
      if (views.includes('3d')) this.layout.v3d = true;
      this.applyLayout();
      this.view3d.fitSoon();
      this.view2d.fitSoon();
    }
    if (mode === 'replace') {
      this.layout.v3d = views.includes('3d');
      this.layout.v2d = views.includes('2d');
      if (views.length) this._activeDim = views.includes('3d') ? 3 : 2;
      this.applyLayout();
      this.toolbar.render();
      this.view3d.fitSoon();
      this.view2d.fitSoon();
    }
    this.commit();
    const sel = e.scene.select && datas.find((d) => d.name === e.scene!.select || d.name.startsWith(e.scene!.select + '_'))?.name;
    if (sel) {
      this._selected = null;
      this.view3d.setSelection(sel);
      this.view2d.setSelection(sel);
      this._selected = sel;
      this.algebra.setSelection(sel);
    }
    if (showPage) this.course.show({ kind: 'entry', id });
    else this.course.refresh('all');
  }

  private buildSpec(spec: SceneSpec): ObjData[] {
    return buildSceneSpec(spec, (type) => this.defaultStyle(type));
  }

  private renameForAdd(datas: ObjData[]): ObjData[] {
    const map: Record<string, string> = {};
    for (const d of datas) {
      if (this.scene.has(d.name) || Object.values(map).includes(d.name)) {
        let i = 2;
        while (this.scene.has(`${d.name}_${i}`)) i++;
        map[d.name] = `${d.name}_${i}`;
      }
    }
    if (!Object.keys(map).length) return datas;
    const fix = (v: ParamValue): ParamValue => {
      if (typeof v !== 'string') return v;
      if (map[v]) return map[v];
      return v.replace(/\b[A-Za-z][A-Za-z0-9_]*\b/g, (w) => map[w] ?? w);
    };
    return datas.map((d) => ({
      ...d,
      name: map[d.name] ?? d.name,
      params: Object.fromEntries(Object.entries(d.params).map(([k, v]) => [k, fix(v)])),
    }));
  }

  private openObject(name: string): void {
    if (!this.layout.course) return;
    this.course.show({ kind: 'object', name });
  }

  private editObject(name: string): void {
    if (!this.layout.algebra) {
      this.layout.algebra = true;
      this.applyLayout();
    }
    this.algebra.startEdit(name);
  }

  // ===========================================================================================
  // Creation dialog

  defaultStyle(type: string): Style {
    const t = getType(type);
    const color = t.defaultColor ?? PALETTE[this.colorIdx++ % PALETTE.length];
    return { color, visible: true, label: true };
  }

  createWithDialog(type: string): void {
    const t = getType(type);
    const dim = (t.dims.includes(this._activeDim) ? this._activeDim : t.dims[0]) as 2 | 3;
    const ctx = { find: (k: any, f?: any) => this.scene.find(k, f), hasNumber: (n: string) => this.scene.value(n)?.kind === 'number' };
    const params = t.defaults(dim, ctx);
    if (t.dims.length > 1) params.dim = dim;
    const name = this.scene.freshName(t.names);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const ref = t.bookRef && getEntry(t.bookRef) ? `<a href="#" class="xref" data-entry="${t.bookRef}">${escapeHtml(entryLabel(t.bookRef))}</a>` : '';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-label="${escapeHtml(t.label)}">
        <div class="modal-head">
          <h3>New ${escapeHtml(t.label)}</h3>
          <span class="muted">${t.dims.length > 1 ? `in R${dim === 2 ? '²' : '³'} (${dim}D view)` : ''}</span>
          <button class="icon-btn sm modal-close" title="Cancel">${ICONS.close}</button>
        </div>
        <p class="modal-desc">${escapeHtml(t.description)} ${ref ? `· ${ref}` : ''}</p>
        <label class="pform-row"><span class="pform-label">Name</span><input type="text" class="m-name" value="${escapeHtml(name)}" spellcheck="false"></label>
        <div class="m-form"></div>
        <div class="m-error"></div>
        <div class="modal-buttons"><button class="btn" data-m="cancel">Cancel</button><button class="btn primary" data-m="ok">Create</button></div>
      </div>`;
    const form = buildForm(t, dim, params, this.scene);
    overlay.querySelector('.m-form')!.append(form.el);
    document.body.append(overlay);
    const close = () => overlay.remove();
    const err = overlay.querySelector('.m-error') as HTMLElement;
    const create = () => {
      const n = (overlay.querySelector('.m-name') as HTMLInputElement).value.trim();
      const p = form.read();
      if (t.dims.length > 1) p.dim = dim;
      const data: ObjData = { name: n, type, params: p, style: this.defaultStyle(type) };
      try {
        this.scene.add(data);
      } catch (e) {
        err.textContent = `⚠ ${(e as Error).message}`;
        return;
      }
      const o = this.scene.get(n);
      if (o?.error) {
        err.textContent = `⚠ ${o.error}`;
        this.scene.remove(n);
        return;
      }
      close();
      this.commit();
      this.select(n);
    };
    overlay.addEventListener('click', (e) => {
      const tgt = e.target as HTMLElement;
      if (tgt === overlay || tgt.closest('.modal-close') || tgt.closest('[data-m=cancel]')) return close();
      if (tgt.closest('[data-m=ok]')) return create();
      const x = tgt.closest('.xref') as HTMLElement | null;
      if (x?.dataset.entry) {
        e.preventDefault();
        this.course.show({ kind: 'entry', id: x.dataset.entry });
      }
    });
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
        e.preventDefault();
        create();
      }
    });
    form.focus();
  }

  // ===========================================================================================
  // Actions

  private action(act: string): void {
    switch (act) {
      case 'undo':
        return this.undo();
      case 'redo':
        return this.redo();
      case 'new':
        this.loaded = null;
        this.animating.clear();
        this.scene.clear();
        this.commit();
        this.course.show({ kind: 'contents' });
        history.replaceState(null, '', location.pathname + location.search);
        return;
      case 'export':
        return this.exportFile();
      case 'import':
        return (this.$('.file-input') as HTMLInputElement).click();
      case 'share':
        return this.share();
      case 'resetView':
        this.view2d.resetView();
        this.view3d.resetView();
        return;
      case 'theme':
        return this.toggleTheme();
      case 'aux':
        this.algebra.showAux = !this.algebra.showAux;
        this.algebra.rebuild();
        return;
      case 'home':
      case 'contents':
        if (!this.layout.course) {
          this.layout.course = true;
          this.applyLayout();
        }
        this.course.show({ kind: act === 'home' ? 'help' : 'contents' });
        return;
      case 'cmdhelp': {
        const h = this.$('.cmd-help');
        h.hidden = !h.hidden;
        return;
      }
      case 'show3d':
        this.layout.v3d = true;
        this.applyLayout();
        return;
    }
  }

  private remove(name: string): void {
    const deps = this.scene.dependents(name);
    if (deps.length && !window.confirm(`Delete ${name} and the ${deps.length} object(s) defined from it (${deps.join(', ')})?`)) return;
    this.scene.remove(name);
    this.commit();
  }

  private exportFile(): void {
    const blob = new Blob([JSON.stringify({ format: 'dg-sandbox', version: 1, entry: this.loaded, objects: this.scene.serialize() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `construction${this.loaded ? '-' + this.loaded : ''}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  private importFile(e: Event): void {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    if (!f) return;
    f.text().then((txt) => {
      const d = safeParse<{ objects: ObjData[]; entry?: string }>(txt);
      if (!d?.objects) return this.toast('Not a sandbox construction file', 'error');
      this.loaded = d.entry ?? null;
      this.scene.load(d.objects);
      this.commit();
      this.toast(`Imported ${d.objects.length} objects`);
    });
    input.value = '';
  }

  private share(): void {
    const data = LZString.compressToEncodedURIComponent(this.snapshot());
    const url = `${location.origin}${location.pathname}#scene=${data}`;
    const done = () => this.toast('Link copied to the clipboard');
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done, () => window.prompt('Copy this link:', url));
    else window.prompt('Copy this link:', url);
  }

  private applyThemeAttr(t: 'light' | 'dark' | null): void {
    if (t) document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  }

  private toggleTheme(): void {
    const cur = document.documentElement.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    this.applyThemeAttr(next);
    store.set('dgs.theme', next);
    this.view3d.applyTheme();
    this.view2d.applyTheme();
  }

  toast(msg: string, kind: 'error' | 'info' = 'info'): void {
    const t = document.createElement('div');
    t.className = `toast ${kind}`;
    t.textContent = msg;
    this.$('.toasts').append(t);
    setTimeout(() => t.remove(), 3500);
  }

  // ===========================================================================================
  // Command bar

  private runCommand(line: string): void {
    const msg = this.$('.cmd-msg');
    const input = this.$('.cmd-input') as HTMLInputElement;
    if (!line.trim()) return;
    try {
      const pc = parseCommand(line, this.scene, this._activeDim);
      if (pc.redefine) this.scene.update(pc.data.name, { params: pc.data.params });
      else this.scene.add({ ...pc.data, style: this.defaultStyle(pc.data.type) } as ObjData);
      const o = this.scene.get(pc.data.name);
      if (o?.error) {
        msg.innerHTML = `<span class="err">⚠ ${escapeHtml(o.error)}</span>`;
      } else {
        msg.innerHTML = `${texToHtml(this.scene.captionOf(pc.data.name))} <span class="muted">${pc.redefine ? 'redefined' : 'created'}</span>`;
        input.value = '';
      }
      this.commit();
      this.select(pc.data.name);
      if (pc.dim === 2 && !this.layout.v2d && getType(pc.data.type).dims.includes(2) && pc.data.params.dim === 2) {
        this.layout.v2d = true;
        this.applyLayout();
      }
    } catch (e) {
      msg.innerHTML = `<span class="err">⚠ ${escapeHtml((e as Error).message)}</span>`;
    }
    this.cmdHistory.push(line);
    this.cmdPos = this.cmdHistory.length;
  }

  // ===========================================================================================
  // Animation & keyboard

  private toggleAnimation(name: string): void {
    const o = this.scene.get(name);
    if (!o) return;
    const on = !o.data.style.animating;
    if (on) this.animating.add(name);
    else this.animating.delete(name);
    this.scene.update(name, { style: { animating: on } });
    if (!on) this.commit();
  }

  private animate(t: number): void {
    const dt = this.lastFrame ? Math.min(0.1, (t - this.lastFrame) / 1000) : 0;
    this.lastFrame = t;
    if (this.animating.size && dt > 0) {
      this.scene.batch(() => {
        for (const n of this.animating) {
          const o = this.scene.get(n);
          if (!o || o.data.type !== 'slider') continue;
          const nums = this.scene.allNumbers();
          const ev = (v: ParamValue | undefined, d: number) => {
            try {
              return evalConst(String(v), nums);
            } catch {
              return d;
            }
          };
          const min = ev(o.data.params.min, -5);
          const max = ev(o.data.params.max, 5);
          const speed = o.data.style.speed ?? 1;
          let v = Number(o.data.params.value) + ((max - min) / 8) * speed * dt;
          if (v > max) v = min + (v - max);
          this.scene.setNumber(n, 'value', Math.round(v * 1e4) / 1e4);
        }
      });
    }
    requestAnimationFrame((x) => this.animate(x));
  }

  private onKey(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement).tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'z' && !typing) {
      e.preventDefault();
      if (e.shiftKey) this.redo();
      else this.undo();
    } else if (mod && e.key.toLowerCase() === 'y' && !typing) {
      e.preventDefault();
      this.redo();
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && !typing && this._selected && this.layout.mode === 'sandbox') {
      e.preventDefault();
      this.remove(this._selected);
    } else if (e.key === 'Escape' && !typing) {
      this.setTool('move');
      this.select(null);
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !typing && !mod && this.layout.mode === 'book') {
      // turn the pages of the book (unless the pointer is busy in a graphics view)
      if ((e.target as HTMLElement).closest?.('.gview')) return;
      e.preventDefault();
      this.course.turnPage(e.key === 'ArrowLeft' ? -1 : 1);
    }
  }
}

function safeParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}
