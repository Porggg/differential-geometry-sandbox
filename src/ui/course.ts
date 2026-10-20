// Course view: book entries (statement, proof, notes, live checks) and full details of sandbox objects.

import { SECTIONS, allEntries, entryLabel, getEntry, hasContent } from '../content';
import type { Entry } from '../content/types';
import { getType } from '../core/registry';
import type { Scene } from '../core/scene';
import { fmt } from '../math/vec';
import { ICONS } from './icons';
import { escapeHtml, texToHtml } from './katex';
import { renderMarkdown } from './markdown';

export type CoursePage = { kind: 'home' } | { kind: 'entry'; id: string } | { kind: 'object'; name: string };

export interface CourseHost {
  scene: Scene;
  openEntry(id: string): void;
  loadEntryScene(id: string, mode: 'replace' | 'add'): void;
  loadedEntry(): string | null;
  select(name: string | null): void;
  editObject(name: string): void;
}

export class CoursePanel {
  readonly el: HTMLElement;
  private body: HTMLElement;
  private history: CoursePage[] = [{ kind: 'home' }];
  private pos = 0;

  constructor(private host: CourseHost) {
    this.el = document.createElement('div');
    this.el.className = 'course';
    this.el.innerHTML = `
      <div class="panel-head course-head">
        <button class="icon-btn sm" data-nav="back" title="Back">${ICONS.back}</button>
        <button class="icon-btn sm" data-nav="fwd" title="Forward">${ICONS.forward}</button>
        <span class="panel-title">Course</span>
        <span class="crumb"></span>
      </div>
      <div class="course-body"></div>`;
    this.body = this.el.querySelector('.course-body')!;
    this.el.querySelector('[data-nav=back]')!.addEventListener('click', () => this.go(-1));
    this.el.querySelector('[data-nav=fwd]')!.addEventListener('click', () => this.go(1));
    this.body.addEventListener('click', (e) => this.onClick(e));
    this.render();
  }

  get page(): CoursePage {
    return this.history[this.pos];
  }

  show(page: CoursePage): void {
    const cur = this.page;
    if (JSON.stringify(cur) !== JSON.stringify(page)) {
      this.history = this.history.slice(0, this.pos + 1);
      this.history.push(page);
      if (this.history.length > 100) this.history.shift();
      this.pos = this.history.length - 1;
    }
    this.render();
    this.body.scrollTop = 0;
  }

  private go(d: number): void {
    const p = this.pos + d;
    if (p < 0 || p >= this.history.length) return;
    this.pos = p;
    this.render();
  }

  /** Live update after scene changes. */
  refresh(names: Set<string> | 'all'): void {
    const page = this.page;
    if (page.kind === 'object') {
      const o = this.host.scene.get(page.name);
      if (!o) return this.render();
      if (names === 'all' || names.has(page.name) || o.deps.some((d) => names.has(d))) {
        const top = this.body.scrollTop;
        this.render();
        this.body.scrollTop = top;
      }
    } else if (page.kind === 'entry') {
      const box = this.body.querySelector('.checks-body');
      const e = getEntry(page.id);
      if (box && e?.checks) box.innerHTML = this.checksHtml(e);
    }
  }

  private render(): void {
    const page = this.page;
    (this.el.querySelector('[data-nav=back]') as HTMLButtonElement).disabled = this.pos === 0;
    (this.el.querySelector('[data-nav=fwd]') as HTMLButtonElement).disabled = this.pos >= this.history.length - 1;
    const crumb = this.el.querySelector('.crumb') as HTMLElement;
    if (page.kind === 'home') {
      crumb.textContent = '';
      this.body.innerHTML = this.homeHtml();
    } else if (page.kind === 'entry') {
      const e = getEntry(page.id);
      const sec = e && SECTIONS.find((s) => s.chapter === e.chapter && s.section === e.section);
      crumb.textContent = sec ? `§${sec.chapter}.${sec.section} ${sec.title}` : '';
      this.body.innerHTML = e ? this.entryHtml(e) : `<p class="pad">Unknown entry ${escapeHtml(page.id)}.</p>`;
    } else {
      crumb.textContent = 'Object';
      this.body.innerHTML = this.objectHtml(page.name);
    }
  }

  // -------------------------------------------------------------------------------------------

  private homeHtml(): string {
    return `
      <article class="entry home">
        <h2>Differential Geometry Sandbox</h2>
        <p>A construction kit for the objects of <em>Elementary Differential Geometry</em> (B. O'Neill, revised 2nd ed.), Chapters 1–3.</p>
        <h3>How it works</h3>
        <ul>
          <li><b>Contents</b> (left): every definition, theorem, lemma, corollary, example and remark of the book, in order. Click one to load its figure in the sandbox and read its statement and proof here.</li>
          <li><b>Toolbar</b>: create objects (points, tangent vectors, curves, Frenet frames, forms, mappings, frames, isometries…). New objects use the active graphics view (2D or 3D — click a view to activate it).</li>
          <li><b>Algebra</b>: every object with its definition. Click to select (details appear here), double-click or ✎ to edit, click the colored dot to show/hide. Sliders animate with ▶.</li>
          <li><b>Course</b> (this panel): full details of the selected object — formulas, computed values, links to the book — including objects that cannot be drawn (forms, isometries, numbers).</li>
          <li><b>Command bar</b> (bottom, can be hidden): type definitions such as <code>alpha(t) = (cos(t), sin(t), t)</code>, <code>V = x*y*U1 - z*U3</code>, <code>phi = x^2 dx - y dz</code>, <code>Frenet(alpha, 1)</code>.</li>
        </ul>
        <h3>Mouse</h3>
        <ul>
          <li>3D: drag to rotate, right-drag to pan, wheel to zoom. With the <b>Move</b> tool, drag a free point (Shift: vertically).</li>
          <li>2D: drag to pan, wheel to zoom, drag free points with <b>Move</b>.</li>
          <li>Keyboard: <code>Ctrl/⌘ Z</code> undo, <code>Ctrl/⌘ Shift Z</code> redo, <code>Delete</code> deletes the selection, <code>Esc</code> returns to the Move tool.</li>
        </ul>
        <h3>Written so far</h3>
        <p>${allEntries()
          .filter(hasContent)
          .map((e) => `<a href="#" class="xref" data-entry="${e.id}">${escapeHtml(entryLabel(e.id))}</a>`)
          .join(' · ')}</p>
        <p class="muted">The other entries are listed in the Contents with their page number and will be written in the next deliveries.</p>
      </article>`;
  }

  private entryHtml(e: Entry): string {
    const head = `
      <header class="entry-head">
        <span class="badge k-${e.kind.toLowerCase()}">${e.kind === 'Notion' ? 'In the text' : e.kind}</span>
        <h2>${e.id.startsWith('n.') ? '' : `<span class="num">${e.id}</span> `}${escapeHtml(e.title)}</h2>
        <span class="book-page" title="Page in O'Neill, Elementary Differential Geometry, revised 2nd ed.">${ICONS.book} p. ${e.page}</span>
      </header>`;
    const nav = this.prevNext(e);
    if (!hasContent(e)) {
      return `<article class="entry">${head}
        <div class="todo-box">This entry is not written yet — it will come in a later delivery.<br>Meanwhile, read it in the book, <b>page ${e.page}</b>, and experiment with the toolbar.</div>
        ${nav}</article>`;
    }
    const loaded = this.host.loadedEntry() === e.id;
    const actions = e.scene
      ? `<div class="entry-actions">
          <button class="btn ${loaded ? '' : 'primary'}" data-load="replace">${ICONS.load} ${loaded ? 'Reload figure' : 'Load figure'}</button>
          <button class="btn" data-load="add" title="Add the objects of this entry to the current construction">${ICONS.plus} Add to scene</button>
        </div>`
      : '';
    const kindWord = e.kind === 'Notion' ? 'Definitions' : e.kind;
    return `
      <article class="entry">
        ${head}
        ${actions}
        <section class="statement kind-${e.kind.toLowerCase()}">
          <div class="statement-label">${kindWord}${e.bookName ? ` <span class="muted">(${escapeHtml(e.bookName)})</span>` : ''}</div>
          ${renderMarkdown(e.statement ?? '')}
        </section>
        ${e.proof ? `<section class="proof"><h3>${e.kind === 'Example' ? 'Computation' : 'Proof'}</h3>${renderMarkdown(e.proof)}</section>` : ''}
        ${e.notes ? `<section class="notes"><h3>Explanation</h3>${renderMarkdown(e.notes)}</section>` : ''}
        ${e.tryThis?.length ? `<section class="try"><h3>Try this</h3><ul>${e.tryThis.map((t) => `<li>${renderMarkdown(t).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ul></section>` : ''}
        ${e.checks?.length ? `<section class="checks"><h3>Live check <span class="muted">(${loaded ? 'updates as you change the figure' : 'load the figure to run it'})</span></h3><div class="checks-body">${loaded ? this.checksHtml(e) : ''}</div></section>` : ''}
        ${nav}
      </article>`;
  }

  private checksHtml(e: Entry): string {
    if (this.host.loadedEntry() !== e.id) return '<p class="muted">Load the figure to run the check.</p>';
    const rows = (e.checks ?? []).map((c) => {
      let val: number;
      let ok = false;
      let txt: string;
      try {
        val = c.value(this.host.scene);
        const exp = c.expect ?? 0;
        ok = Math.abs(val - exp) <= (c.tol ?? 1e-5);
        txt = fmt(val, 8);
      } catch (err) {
        txt = `undefined (${escapeHtml((err as Error).message)})`;
      }
      return `<tr class="${ok ? 'ok' : 'bad'}"><td>${texToHtml(c.label)}</td><td class="val">${txt}${c.expect !== undefined ? ` <span class="muted">(expected ${c.expect})</span>` : ''}</td><td class="mark">${ok ? '✓' : '✗'}</td></tr>`;
    });
    return `<table class="checks-table">${rows.join('')}</table>`;
  }

  private prevNext(e: Entry): string {
    const list = allEntries()
      .slice()
      .sort((a, b) => a.chapter - b.chapter || a.section - b.section || order(a) - order(b));
    const i = list.findIndex((x) => x.id === e.id);
    const prev = list[i - 1];
    const next = list[i + 1];
    const link = (x: Entry | undefined, dir: string) =>
      x ? `<a href="#" class="xref nav-${dir}" data-entry="${x.id}">${dir === 'prev' ? '← ' : ''}${escapeHtml(entryLabel(x.id))}${x.id.startsWith('n.') ? '' : ` · ${escapeHtml(x.title)}`}${dir === 'next' ? ' →' : ''}</a>` : '<span></span>';
    return `<nav class="entry-nav">${link(prev, 'prev')}${link(next, 'next')}</nav>`;
  }

  private objectHtml(name: string): string {
    const sc = this.host.scene;
    const o = sc.get(name);
    if (!o) return `<p class="pad muted">The object “${escapeHtml(name)}” no longer exists.</p>`;
    const t = getType(o.data.type);
    const cx = sc.courseCtx();
    const cap = sc.captionOf(name);
    let details = '';
    if (o.value && t.course) {
      try {
        details = renderMarkdown(t.course(o.data, o.value, cx));
      } catch (err) {
        details = `<p class="muted">(${escapeHtml((err as Error).message)})</p>`;
      }
    }
    const facts = o.value?.extra?.facts ?? [];
    const warnings = o.value?.extra?.warnings ?? [];
    const users = sc.order.filter((n) => sc.get(n)!.deps.includes(name));
    const objLink = (n: string) => `<a href="#" class="objref" data-obj="${escapeHtml(n)}">${texToHtml(sc.captionOf(n))}</a>`;
    let alg = '';
    try {
      alg = t.algebra(o.data, o.value, cx);
    } catch {
      /* ignore */
    }
    return `
      <article class="entry object">
        <header class="entry-head">
          <span class="badge k-object" style="--c:${o.data.style.color}">${escapeHtml(t.label)}</span>
          <h2>${texToHtml(cap)} <span class="muted small">(${escapeHtml(name)})</span></h2>
          <button class="btn sm" data-edit="${escapeHtml(name)}">${ICONS.edit} Edit</button>
        </header>
        ${t.bookRef && getEntry(t.bookRef) ? `<p class="defined-in">${ICONS.book} See <a href="#" class="xref" data-entry="${t.bookRef}">${escapeHtml(entryLabel(t.bookRef))}</a> · ${escapeHtml(t.description)}</p>` : `<p class="defined-in">${escapeHtml(t.description)}</p>`}
        ${alg ? `<div class="math-display obj-def">${texToHtml(alg, true)}</div>` : ''}
        ${o.error ? `<div class="error-box">⚠ ${escapeHtml(o.error)}</div>` : ''}
        ${warnings.map((w) => `<div class="warn-box">${escapeHtml(w)}</div>`).join('')}
        ${facts.length ? `<table class="facts">${facts.map(([k, v]) => `<tr><td>${texToHtml(k)}</td><td>${texToHtml(v)}</td></tr>`).join('')}</table>` : ''}
        <section class="obj-details">${details}</section>
        <section class="obj-graph">
          ${o.deps.length ? `<p><b>Defined from:</b> ${o.deps.map(objLink).join(', ')}</p>` : ''}
          ${users.length ? `<p><b>Used by:</b> ${users.map(objLink).join(', ')}</p>` : ''}
        </section>
      </article>`;
  }

  private onClick(e: MouseEvent): void {
    const a = (e.target as HTMLElement).closest('a, button') as HTMLElement | null;
    if (!a) return;
    if (a.dataset.entry) {
      e.preventDefault();
      this.host.openEntry(a.dataset.entry);
    } else if (a.dataset.obj) {
      e.preventDefault();
      this.host.select(a.dataset.obj);
      this.show({ kind: 'object', name: a.dataset.obj });
    } else if (a.dataset.load) {
      const p = this.page;
      if (p.kind === 'entry') this.host.loadEntryScene(p.id, a.dataset.load as 'replace' | 'add');
    } else if (a.dataset.edit) {
      this.host.editObject(a.dataset.edit);
    }
  }
}

const order = (e: Entry) => (e.id.startsWith('n.') ? e.page * 100 + 50 : e.page * 100 + Number(e.id.split('.')[2]));
