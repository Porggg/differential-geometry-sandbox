// Algebra view: the list of objects with their definitions/values, visibility, sliders and inline editing.

import { getType } from '../core/registry';
import { evalConst } from '../math/expr';
import type { Scene } from '../core/scene';
import type { ObjData, ParamValue, Value } from '../core/types';
import { buildForm, type FormHandle } from './form';
import { ICONS } from './icons';
import { escapeHtml, texToHtml } from './katex';

export interface AlgebraHost {
  scene: Scene;
  selected(): string | null;
  select(name: string | null): void;
  commit(): void;
  setSliderTransient(name: string, value: number): void;
  toggleAnimation(name: string): void;
  setAnimationSpeed(name: string, speed: number): void;
  rename(oldName: string, newName: string): void;
  remove(name: string): void;
  openObject(name: string): void;
  toast(msg: string, kind?: 'error' | 'info'): void;
}

const isLiteral = (v: ParamValue | undefined) => typeof v === 'number' || (typeof v === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(v));

const SPEEDS = [0.25, 0.5, 1, 2, 4];

type Space = 'num' | '3d' | '2d' | 'other';
const SPACE_TITLES: Record<Space, string> = {
  num: 'Numbers',
  '3d': 'R³ — 3D view',
  '2d': 'R² — 2D view',
  other: 'Not drawn — forms, isometries, …',
};

/** Which view an object belongs to (used to group the Algebra view). */
export function spaceOf(v: Value | undefined): Space {
  if (!v) return 'other';
  switch (v.kind) {
    case 'number':
      return 'num';
    case 'point':
      return v.p.length === 2 ? '2d' : '3d';
    case 'vector':
    case 'segment':
      return v.p.length === 2 ? '2d' : '3d';
    case 'vectors':
      return v.items[0]?.p.length === 2 ? '2d' : '3d';
    case 'curve':
      return v.dim === 2 ? '2d' : '3d';
    case 'field':
    case 'function':
      return v.dim === 2 ? '2d' : '3d';
    case 'mapping':
      return v.n === 2 ? '2d' : '3d';
    case 'plot':
      return '2d';
    case 'frame':
    case 'frames':
    case 'framefield':
    case 'plane':
    case 'circle':
      return '3d';
    default:
      return 'other';
  }
}

export class AlgebraPanel {
  readonly el: HTMLElement;
  private list: HTMLElement;
  private editing: string | null = null;
  private form: FormHandle | null = null;
  /** Slider being dragged: its range input must not be re-rendered. */
  private grabbing: string | null = null;
  showAux = false;

  constructor(private host: AlgebraHost) {
    this.el = document.createElement('div');
    this.el.className = 'algebra';
    this.el.innerHTML = `<div class="panel-head"><span class="panel-title">Algebra</span><span class="panel-sub" data-count></span></div><div class="alg-list"></div>`;
    this.list = this.el.querySelector('.alg-list')!;
    document.addEventListener('pointerup', () => (this.grabbing = null));
  }

  rebuild(): void {
    const sc = this.host.scene;
    if (this.editing && !sc.has(this.editing)) this.editing = null;
    const objs = sc.list().filter((o) => this.showAux || !o.data.aux);
    (this.el.querySelector('[data-count]') as HTMLElement).textContent = objs.length ? `${objs.length} object${objs.length > 1 ? 's' : ''}` : '';
    if (!objs.length) {
      this.list.innerHTML = `<div class="alg-empty">No objects yet.<br>Pick a tool in the toolbar, type a command below (e.g. <code>alpha(t) = (cos(t), sin(t), t)</code>), or open an entry of the book in the <b>Course</b> view.</div>`;
      return;
    }
    this.list.innerHTML = '';
    const groups = new Map<Space, string[]>();
    for (const o of objs) {
      const sp = spaceOf(o.value);
      if (!groups.has(sp)) groups.set(sp, []);
      groups.get(sp)!.push(o.data.name);
    }
    const order: Space[] = ['num', '3d', '2d', 'other'];
    const showHeads = groups.size > 1;
    for (const sp of order) {
      const names = groups.get(sp);
      if (!names) continue;
      if (showHeads) {
        const h = document.createElement('div');
        h.className = 'alg-group';
        h.textContent = SPACE_TITLES[sp];
        this.list.append(h);
      }
      for (const n of names) this.list.append(this.row(n));
    }
  }

  /** Update the rows of the given objects (values changed). */
  update(names: Set<string>): void {
    const sc = this.host.scene;
    let regroup = false;
    for (const n of names) {
      if (n === this.editing) continue;
      const old = this.list.querySelector(`.alg-row[data-name="${CSS.escape(n)}"]`) as HTMLElement | null;
      if (!old) continue;
      const o = sc.get(n);
      if (!o) continue;
      if (old.dataset.space !== spaceOf(o.value)) {
        regroup = true;
        continue;
      }
      // Slider rows are patched in place so that a range being dragged keeps working.
      if (o.data.type === 'slider' && old.querySelector('.alg-slider') && isLiteral(o.data.params.value)) {
        this.patchSlider(old, n);
        continue;
      }
      old.replaceWith(this.row(n));
    }
    if (regroup) this.rebuild();
  }

  setSelection(name: string | null): void {
    this.list.querySelectorAll('.alg-row').forEach((r) => r.classList.toggle('selected', (r as HTMLElement).dataset.name === name));
    const r = name ? (this.list.querySelector(`.alg-row[data-name="${CSS.escape(name)}"]`) as HTMLElement | null) : null;
    r?.scrollIntoView({ block: 'nearest' });
  }

  private texOf(name: string): string {
    const sc = this.host.scene;
    const o = sc.get(name)!;
    try {
      return getType(o.data.type).algebra(o.data, o.value, sc.courseCtx());
    } catch {
      return name;
    }
  }

  private patchSlider(row: HTMLElement, name: string): void {
    const o = this.host.scene.get(name)!;
    (row.querySelector('.alg-tex') as HTMLElement).innerHTML = texToHtml(this.texOf(name));
    const v = Number(o.data.params.value);
    const range = row.querySelector('input[type=range]') as HTMLInputElement | null;
    if (range && this.grabbing !== name) range.value = String(v);
    const box = row.querySelector('.alg-num') as HTMLInputElement | null;
    if (box && document.activeElement !== box) box.value = fmtVal(v);
    const play = row.querySelector('.play') as HTMLElement | null;
    if (play) play.innerHTML = o.data.style.animating ? ICONS.pause : ICONS.play;
  }

  private row(name: string): HTMLElement {
    const sc = this.host.scene;
    const o = sc.get(name)!;
    const el = document.createElement('div');
    el.className = `alg-row${this.host.selected() === name ? ' selected' : ''}${o.error ? ' error' : ''}${o.data.style.visible ? '' : ' hidden-obj'}`;
    el.dataset.name = name;
    el.dataset.space = spaceOf(o.value);
    const tex = this.texOf(name);
    const drawable =
      o.value && !['number', 'form', 'forms', 'isometry', 'info', 'matrix'].includes(o.value.kind)
        ? !(o.value.kind === 'function' && o.value.levels.length === 0)
        : !!(o.value?.kind === 'number' && o.value.extra?.highlight);
    el.innerHTML = `
      <button class="vis-dot ${o.data.style.visible ? 'on' : ''} ${drawable ? '' : 'nodraw'}" style="--c:${o.data.style.color}" title="${drawable ? 'Show / hide' : 'Not drawn (see the Course view)'}"></button>
      <div class="alg-main">
        <div class="alg-tex">${texToHtml(tex)}</div>
        ${o.error ? `<div class="alg-err">⚠ ${escapeHtml(o.error)}</div>` : ''}
        ${o.value?.extra?.warnings?.length ? `<div class="alg-warn">${escapeHtml(o.value.extra.warnings[0])}</div>` : ''}
      </div>
      <div class="alg-actions">
        <button class="icon-btn sm" data-act="edit" title="Edit definition">${ICONS.edit}</button>
        <button class="icon-btn sm" data-act="del" title="Delete">${ICONS.trash}</button>
      </div>`;
    if (o.data.type === 'slider' && isLiteral(o.data.params.value)) el.querySelector('.alg-main')!.append(this.slider(o.data));
    el.addEventListener('click', (ev) => {
      const target = ev.target as HTMLElement;
      if (target.closest('.vis-dot')) {
        this.host.scene.update(name, { style: { visible: !o.data.style.visible } });
        this.host.commit();
        return;
      }
      const act = (target.closest('[data-act]') as HTMLElement | null)?.dataset.act;
      if (act === 'edit') return this.startEdit(name);
      if (act === 'del') return this.host.remove(name);
      if (target.closest('.alg-slider')) return;
      this.host.select(name);
      this.host.openObject(name);
    });
    el.addEventListener('dblclick', (ev) => {
      if ((ev.target as HTMLElement).closest('.alg-slider, .alg-actions, .vis-dot')) return;
      this.startEdit(name);
    });
    if (this.editing === name) {
      const wrap = document.createElement('div');
      wrap.append(el, this.editor(o.data));
      return wrap;
    }
    return el;
  }

  private slider(d: ObjData): HTMLElement {
    const sc = this.host.scene;
    const box = document.createElement('div');
    box.className = 'alg-slider';
    const min = safeNum(d.params.min, sc, -5);
    const max = safeNum(d.params.max, sc, 5);
    const step = safeNum(d.params.step, sc, 0.01);
    const val = Number(d.params.value);
    const speed = d.style.speed ?? 1;
    box.innerHTML = `
      <button class="icon-btn sm play" title="Animate (▶) / pause">${d.style.animating ? ICONS.pause : ICONS.play}</button>
      <span class="lim">${fmtShort(min)}</span>
      <input type="range" min="${min}" max="${max}" step="${step || 'any'}" value="${val}" title="Drag to change ${escapeHtml(d.name)}">
      <span class="lim">${fmtShort(max)}</span>
      <input type="text" inputmode="decimal" class="alg-num" value="${fmtVal(val)}" spellcheck="false" title="Type a value (Enter)">
      <button class="speed" title="Animation speed (click to change)">×${speed}</button>`;
    const range = box.querySelector('input[type=range]') as HTMLInputElement;
    range.addEventListener('pointerdown', () => {
      this.grabbing = d.name;
      // grabbing the slider pauses its animation
      if (this.host.scene.get(d.name)?.data.style.animating) this.host.toggleAnimation(d.name);
    });
    range.addEventListener('input', () => this.host.setSliderTransient(d.name, Number(range.value)));
    range.addEventListener('change', () => {
      this.grabbing = null;
      this.host.commit();
    });
    const num = box.querySelector('.alg-num') as HTMLInputElement;
    const applyNum = () => {
      const v = Number(num.value.replace(',', '.'));
      if (!Number.isFinite(v)) return;
      // typing a value outside the range widens it
      const o = this.host.scene.get(d.name);
      if (o && (v < safeNum(o.data.params.min, sc, -5) || v > safeNum(o.data.params.max, sc, 5))) {
        this.host.scene.update(d.name, {
          params: { value: v, min: Math.min(v, safeNum(o.data.params.min, sc, -5)), max: Math.max(v, safeNum(o.data.params.max, sc, 5)) },
        });
        this.rebuild();
      } else this.host.setSliderTransient(d.name, v);
      this.host.commit();
    };
    num.addEventListener('change', applyNum);
    num.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyNum();
        num.blur();
      }
    });
    box.querySelector('.play')!.addEventListener('click', (e) => {
      e.stopPropagation();
      this.host.toggleAnimation(d.name);
    });
    box.querySelector('.speed')!.addEventListener('click', (e) => {
      e.stopPropagation();
      const cur = this.host.scene.get(d.name)?.data.style.speed ?? 1;
      const next = SPEEDS[(SPEEDS.indexOf(cur) + 1) % SPEEDS.length] ?? 1;
      (e.currentTarget as HTMLElement).textContent = `×${next}`;
      this.host.setAnimationSpeed(d.name, next);
    });
    return box;
  }

  startEdit(name: string): void {
    this.editing = this.editing === name ? null : name;
    this.rebuild();
    this.form?.focus();
  }

  private editor(d: ObjData): HTMLElement {
    const sc = this.host.scene;
    const t = getType(d.type);
    const dim = Number(d.params.dim ?? (t.dims.length === 1 ? t.dims[0] : 3));
    const ed = document.createElement('div');
    ed.className = 'alg-editor';
    const form = buildForm(t, dim, d.params, sc, d.name);
    this.form = form;
    ed.innerHTML = `
      <div class="ed-head">
        <label class="pform-row"><span class="pform-label">Name</span><input type="text" class="ed-name" value="${escapeHtml(d.name)}" spellcheck="false"></label>
        <label class="pform-row"><span class="pform-label">Caption (TeX, optional)</span><input type="text" class="ed-caption" value="${escapeHtml(d.style.caption ?? '')}" spellcheck="false" placeholder="${escapeHtml(sc.captionOf(d.name))}"></label>
        <div class="ed-style">
          <label>Color <input type="color" class="ed-color" value="${toHex(d.style.color)}"></label>
          <label><input type="checkbox" class="ed-label" ${d.style.label ? 'checked' : ''}> Label</label>
        </div>
      </div>`;
    ed.append(form.el);
    const err = document.createElement('div');
    err.className = 'ed-error';
    const btns = document.createElement('div');
    btns.className = 'ed-buttons';
    btns.innerHTML = `<button class="btn primary" data-a="apply">Apply</button><button class="btn" data-a="cancel">Close</button>`;
    ed.append(err, btns);
    const apply = () => {
      const newName = (ed.querySelector('.ed-name') as HTMLInputElement).value.trim();
      const caption = (ed.querySelector('.ed-caption') as HTMLInputElement).value.trim();
      const color = (ed.querySelector('.ed-color') as HTMLInputElement).value;
      const label = (ed.querySelector('.ed-label') as HTMLInputElement).checked;
      const before = JSON.stringify(sc.get(d.name)!.data);
      try {
        sc.batch(() => {
          sc.update(d.name, { params: form.read(), style: { color, label, caption: caption || undefined } });
          if (newName !== d.name) {
            this.host.rename(d.name, newName);
            this.editing = newName;
          }
        });
        const o = sc.get(this.editing ?? d.name);
        if (o?.error) err.textContent = `⚠ ${o.error}`;
        else err.textContent = '';
        if (JSON.stringify(o?.data) !== before) this.host.commit();
      } catch (e) {
        err.textContent = `⚠ ${(e as Error).message}`;
      }
    };
    btns.querySelector('[data-a=apply]')!.addEventListener('click', apply);
    btns.querySelector('[data-a=cancel]')!.addEventListener('click', () => {
      this.editing = null;
      this.rebuild();
    });
    ed.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
        e.preventDefault();
        apply();
      }
      if (e.key === 'Escape') {
        this.editing = null;
        this.rebuild();
      }
    });
    return ed;
  }
}

function safeNum(v: ParamValue | undefined, sc: Scene, d: number): number {
  if (typeof v === 'number') return v;
  try {
    return evalConst(String(v), sc.allNumbers());
  } catch {
    return d;
  }
}

const fmtVal = (x: number) => String(Math.round(x * 1e4) / 1e4);

const fmtShort = (x: number) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(2));

function toHex(c: string): string {
  if (/^#[0-9a-f]{6}$/i.test(c)) return c;
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.fillStyle = c;
  return ctx.fillStyle as string;
}
