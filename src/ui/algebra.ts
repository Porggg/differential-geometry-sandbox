// Algebra view: the list of objects with their definitions/values, visibility, sliders and inline editing.

import { getType } from '../core/registry';
import { evalConst } from '../math/expr';
import type { Scene } from '../core/scene';
import type { ObjData, ParamValue } from '../core/types';
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
  rename(oldName: string, newName: string): void;
  remove(name: string): void;
  openObject(name: string): void;
  toast(msg: string, kind?: 'error' | 'info'): void;
}

const isLiteral = (v: ParamValue | undefined) => typeof v === 'number' || (typeof v === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(v));

export class AlgebraPanel {
  readonly el: HTMLElement;
  private list: HTMLElement;
  private editing: string | null = null;
  private form: FormHandle | null = null;
  showAux = false;

  constructor(private host: AlgebraHost) {
    this.el = document.createElement('div');
    this.el.className = 'algebra';
    this.el.innerHTML = `<div class="panel-head"><span class="panel-title">Algebra</span><span class="panel-sub" data-count></span></div><div class="alg-list"></div>`;
    this.list = this.el.querySelector('.alg-list')!;
  }

  rebuild(): void {
    const sc = this.host.scene;
    if (this.editing && !sc.has(this.editing)) this.editing = null;
    const objs = sc.list().filter((o) => this.showAux || !o.data.aux);
    (this.el.querySelector('[data-count]') as HTMLElement).textContent = objs.length ? `${objs.length} object${objs.length > 1 ? 's' : ''}` : '';
    if (!objs.length) {
      this.list.innerHTML = `<div class="alg-empty">No objects yet.<br>Pick a tool in the toolbar, type a command below (e.g. <code>alpha(t) = (cos(t), sin(t), t)</code>), or open an entry of the <b>Contents</b>.</div>`;
      return;
    }
    this.list.innerHTML = '';
    for (const o of objs) this.list.append(this.row(o.data.name));
  }

  /** Update the rows of the given objects (values changed). */
  update(names: Set<string>): void {
    for (const n of names) {
      if (n === this.editing) continue;
      const old = this.list.querySelector(`.alg-row[data-name="${CSS.escape(n)}"]`);
      if (old) old.replaceWith(this.row(n));
    }
  }

  setSelection(name: string | null): void {
    this.list.querySelectorAll('.alg-row').forEach((r) => r.classList.toggle('selected', (r as HTMLElement).dataset.name === name));
    const r = name ? (this.list.querySelector(`.alg-row[data-name="${CSS.escape(name)}"]`) as HTMLElement | null) : null;
    r?.scrollIntoView({ block: 'nearest' });
  }

  private row(name: string): HTMLElement {
    const sc = this.host.scene;
    const o = sc.get(name)!;
    const t = getType(o.data.type);
    const el = document.createElement('div');
    el.className = `alg-row${this.host.selected() === name ? ' selected' : ''}${o.error ? ' error' : ''}${o.data.style.visible ? '' : ' hidden-obj'}`;
    el.dataset.name = name;
    let tex: string;
    try {
      tex = t.algebra(o.data, o.value, sc.courseCtx());
    } catch {
      tex = name;
    }
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
    box.innerHTML = `
      <button class="icon-btn sm play" title="Animate">${d.style.animating ? ICONS.pause : ICONS.play}</button>
      <span class="lim">${fmtShort(min)}</span>
      <input type="range" min="${min}" max="${max}" step="${step || 'any'}" value="${val}">
      <span class="lim">${fmtShort(max)}</span>`;
    const range = box.querySelector('input')!;
    range.addEventListener('input', () => this.host.setSliderTransient(d.name, Number(range.value)));
    range.addEventListener('change', () => this.host.commit());
    box.querySelector('.play')!.addEventListener('click', (e) => {
      e.stopPropagation();
      this.host.toggleAnimation(d.name);
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

const fmtShort = (x: number) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(2));

function toHex(c: string): string {
  if (/^#[0-9a-f]{6}$/i.test(c)) return c;
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.fillStyle = c;
  return ctx.fillStyle as string;
}
