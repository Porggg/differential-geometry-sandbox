// Caption of the graphics area: which entry the figure belongs to, a button to switch between the
// book and the sandbox, and the live checks of the entry (recomputed as the figure changes).

import { SECTIONS, getEntry, localNumber } from '../content';
import type { Scene } from '../core/scene';
import { evalConst } from '../math/expr';
import { fmt } from '../math/vec';
import { ICONS } from './icons';
import { escapeHtml, texToHtml } from './katex';

export interface FigureHost {
  scene: Scene;
  setSlider(name: string, value: number): void;
  commit(): void;
  toggleAnimation(name: string): void;
  loadedEntry(): string | null;
  mode(): 'book' | 'sandbox';
  setMode(m: 'book' | 'sandbox'): void;
  openEntry(id: string): void;
}

const isLiteral = (v: unknown) => typeof v === 'number' || (typeof v === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(v));

export class FigureCaption {
  readonly head: HTMLElement;
  readonly foot: HTMLElement;
  /** Sliders of the figure (so that it can be played with without the Algebra view). */
  readonly controls: HTMLElement;
  private grabbing: string | null = null;
  private shownFor: string | null = null;
  private open = true;

  constructor(private host: FigureHost) {
    this.head = document.createElement('div');
    this.head.className = 'fig-head';
    this.foot = document.createElement('div');
    this.foot.className = 'fig-foot';
    this.controls = document.createElement('div');
    this.controls.className = 'fig-controls';
    document.addEventListener('pointerup', () => (this.grabbing = null));
    this.head.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('[data-fig-act]') as HTMLElement | null;
      if (!b) return;
      e.preventDefault();
      const act = b.dataset.figAct!;
      if (act === 'sandbox') this.host.setMode('sandbox');
      else if (act === 'book') this.host.setMode('book');
      else if (act === 'entry') {
        const id = this.host.loadedEntry();
        if (id) this.host.openEntry(id);
      }
    });
    this.foot.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.fig-checks-h')) {
        this.open = !this.open;
        this.foot.classList.toggle('closed', !this.open);
      }
    });
  }

  /** Rebuild the caption (entry changed or mode changed). */
  update(): void {
    const id = this.host.loadedEntry();
    const e = id ? getEntry(id) : undefined;
    const book = this.host.mode() === 'book';
    const switchBtn = book
      ? `<button class="btn sm" data-fig-act="sandbox" title="Edit this figure with the construction tools">${ICONS.edit} Explore in the sandbox</button>`
      : `<button class="btn sm" data-fig-act="book" title="Back to reading">${ICONS.book} Back to the book</button>`;
    this.buildControls();
    if (!e) {
      this.head.innerHTML = `<span class="fig-title muted">${book ? 'No figure' : 'Your construction'}</span>${switchBtn}`;
      this.foot.innerHTML = '';
      this.foot.hidden = true;
      this.shownFor = null;
      return;
    }
    const sec = SECTIONS.find((s) => s.chapter === e.chapter && s.section === e.section);
    const label = e.kind === 'Notion' ? escapeHtml(e.title) : `${e.kind} ${localNumber(e)}${e.bookName ? ` (${escapeHtml(e.bookName)})` : ''}`;
    this.head.innerHTML = `
      <span class="fig-title"><b>Figure ${localNumber(e) || ''}</b> <a href="#" data-fig-act="entry" title="Go to the text">${label}</a>
        <span class="muted">· §${e.chapter}.${e.section}${sec ? ` ${escapeHtml(sec.title)}` : ''}</span></span>
      ${switchBtn}`;
    this.shownFor = e.id;
    this.updateChecks();
  }

  /** Slider rows for the literal-valued numbers of the scene. */
  private buildControls(): void {
    const sc = this.host.scene;
    const sliders = sc.list().filter((o) => o.data.type === 'slider' && !o.data.aux && isLiteral(o.data.params.value));
    this.controls.hidden = sliders.length === 0;
    const nums = sc.allNumbers();
    const ev = (v: unknown, d: number) => {
      if (typeof v === 'number') return v;
      try {
        return evalConst(String(v), nums);
      } catch {
        return d;
      }
    };
    this.controls.innerHTML = sliders
      .map((o) => {
        const d = o.data;
        const min = ev(d.params.min, -5);
        const max = ev(d.params.max, 5);
        const step = ev(d.params.step, 0.01) || 'any';
        return `<label class="fig-slider" data-name="${escapeHtml(d.name)}">
          <button class="icon-btn sm play" title="Animate / pause">${d.style.animating ? ICONS.pause : ICONS.play}</button>
          <span class="fs-name">${texToHtml(sc.captionOf(d.name))}</span>
          <input type="range" min="${min}" max="${max}" step="${step}" value="${Number(d.params.value)}">
          <span class="fs-val">${fmt(Number(d.params.value), 3)}</span>
        </label>`;
      })
      .join('');
    this.controls.querySelectorAll<HTMLElement>('.fig-slider').forEach((row) => {
      const name = row.dataset.name!;
      const range = row.querySelector('input') as HTMLInputElement;
      range.addEventListener('pointerdown', () => {
        this.grabbing = name;
        if (sc.get(name)?.data.style.animating) this.host.toggleAnimation(name);
      });
      range.addEventListener('input', () => this.host.setSlider(name, Number(range.value)));
      range.addEventListener('change', () => {
        this.grabbing = null;
        this.host.commit();
      });
      row.querySelector('.play')!.addEventListener('click', (ev2) => {
        ev2.preventDefault();
        this.host.toggleAnimation(name);
      });
    });
  }

  /** Reflect slider values (they may be animated or changed elsewhere). */
  private syncControls(): void {
    const sc = this.host.scene;
    this.controls.querySelectorAll<HTMLElement>('.fig-slider').forEach((row) => {
      const o = sc.get(row.dataset.name!);
      if (!o) return;
      const v = Number(o.data.params.value);
      const range = row.querySelector('input') as HTMLInputElement;
      if (this.grabbing !== o.data.name) range.value = String(v);
      (row.querySelector('.fs-val') as HTMLElement).textContent = fmt(v, 3);
      (row.querySelector('.play') as HTMLElement).innerHTML = o.data.style.animating ? ICONS.pause : ICONS.play;
    });
  }

  /** Recompute the live checks (cheap; called on every scene change). */
  updateChecks(): void {
    const id = this.host.loadedEntry();
    if (id !== this.shownFor) return this.update();
    this.syncControls();
    const e = id ? getEntry(id) : undefined;
    if (!e?.checks?.length) {
      this.foot.hidden = true;
      return;
    }
    this.foot.hidden = false;
    let allOk = true;
    const rows = e.checks.map((c) => {
      let ok = false;
      let txt: string;
      try {
        const val = c.value(this.host.scene);
        ok = Math.abs(val - (c.expect ?? 0)) <= (c.tol ?? 1e-5);
        txt = fmt(val, 7);
      } catch (err) {
        txt = `undefined (${escapeHtml((err as Error).message)})`;
      }
      allOk &&= ok;
      return `<tr class="${ok ? 'ok' : 'bad'}"><td>${texToHtml(c.label)}</td><td class="val">${txt}${c.expect !== undefined ? ` <span class="muted">(expected ${c.expect})</span>` : ''}</td><td class="mark">${ok ? '✓' : '✗'}</td></tr>`;
    });
    this.foot.classList.toggle('closed', !this.open);
    this.foot.innerHTML = `
      <div class="fig-checks-h"><span class="caret"></span> Live check <span class="${allOk ? 'ok' : 'bad'}">${allOk ? '✓ the result holds on this figure' : '✗ not satisfied here'}</span></div>
      <table class="checks-table">${rows.join('')}</table>`;
  }
}
