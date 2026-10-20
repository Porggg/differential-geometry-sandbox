// Course view: the book. A table of contents, section pages, entry pages (statement, proof, notes,
// live checks) — and full details of sandbox objects, including those that cannot be drawn.

import { CHAPTERS, SECTIONS, allEntries, entriesOfSection, entryLabel, getEntry, hasContent } from '../content';
import type { Entry, EntryKind, Section } from '../content/types';
import { getType } from '../core/registry';
import type { Scene } from '../core/scene';
import { fmt } from '../math/vec';
import { ICONS } from './icons';
import { escapeHtml, texToHtml } from './katex';
import { renderMarkdown } from './markdown';

export type CoursePage =
  | { kind: 'contents' }
  | { kind: 'help' }
  | { kind: 'section'; chapter: number; section: number }
  | { kind: 'entry'; id: string }
  | { kind: 'object'; name: string };

export interface CourseHost {
  scene: Scene;
  openEntry(id: string): void;
  openSection(chapter: number, section: number): void;
  loadEntryScene(id: string, mode: 'replace' | 'add'): void;
  loadedEntry(): string | null;
  select(name: string | null): void;
  editObject(name: string): void;
  toggleMaximize(): void;
  isMaximized(): boolean;
  pageChanged(page: CoursePage): void;
}

const KIND_ABBR: Record<EntryKind, string> = {
  Definition: 'Def',
  Theorem: 'Thm',
  Lemma: 'Lem',
  Corollary: 'Cor',
  Proposition: 'Prop',
  Example: 'Ex',
  Remark: 'Rem',
  Notion: 'Text',
};

const FILTERS: { label: string; kinds: EntryKind[] }[] = [
  { label: 'Theorems', kinds: ['Theorem', 'Proposition'] },
  { label: 'Lemmas', kinds: ['Lemma'] },
  { label: 'Corollaries', kinds: ['Corollary'] },
  { label: 'Definitions', kinds: ['Definition', 'Notion'] },
  { label: 'Examples', kinds: ['Example'] },
  { label: 'Remarks', kinds: ['Remark'] },
];

const order = (e: Entry) => (e.id.startsWith('n.') ? e.page * 100 + 50 : e.page * 100 + Number(e.id.split('.')[2]));
const sectionOf = (ch: number, s: number): Section | undefined => SECTIONS.find((x) => x.chapter === ch && x.section === s);

export class CoursePanel {
  readonly el: HTMLElement;
  private body: HTMLElement;
  private history: CoursePage[] = [{ kind: 'contents' }];
  private pos = 0;
  // table-of-contents state (kept between visits)
  private query = '';
  private active = new Set<string>(FILTERS.map((f) => f.label));
  private onlyWritten = false;
  private collapsed = new Set<number>();
  private tocScroll = 0;

  constructor(private host: CourseHost) {
    this.el = document.createElement('div');
    this.el.className = 'course';
    this.el.innerHTML = `
      <div class="panel-head course-head">
        <button class="icon-btn sm" data-nav="back" title="Back">${ICONS.back}</button>
        <button class="icon-btn sm" data-nav="fwd" title="Forward">${ICONS.forward}</button>
        <button class="btn sm toc-btn" data-nav="contents" title="Table of contents of the book">${ICONS.contents} Contents</button>
        <span class="crumb"></span>
        <button class="icon-btn sm" data-nav="max" title="Enlarge / restore the Course view">${ICONS.expand}</button>
      </div>
      <div class="course-body"></div>`;
    this.body = this.el.querySelector('.course-body')!;
    this.el.querySelector('[data-nav=back]')!.addEventListener('click', () => this.go(-1));
    this.el.querySelector('[data-nav=fwd]')!.addEventListener('click', () => this.go(1));
    this.el.querySelector('[data-nav=contents]')!.addEventListener('click', () => this.show({ kind: 'contents' }));
    this.el.querySelector('[data-nav=max]')!.addEventListener('click', () => this.host.toggleMaximize());
    this.el.querySelector('.crumb')!.addEventListener('click', (e) => this.onClick(e as MouseEvent));
    this.body.addEventListener('click', (e) => this.onClick(e));
    this.render();
  }

  get page(): CoursePage {
    return this.history[this.pos];
  }

  show(page: CoursePage): void {
    const cur = this.page;
    if (cur.kind === 'contents') this.tocScroll = this.body.scrollTop;
    if (JSON.stringify(cur) !== JSON.stringify(page)) {
      this.history = this.history.slice(0, this.pos + 1);
      this.history.push(page);
      if (this.history.length > 100) this.history.shift();
      this.pos = this.history.length - 1;
    }
    this.render();
    this.body.scrollTop = page.kind === 'contents' ? this.tocScroll : 0;
  }

  private go(d: number): void {
    const p = this.pos + d;
    if (p < 0 || p >= this.history.length) return;
    if (this.page.kind === 'contents') this.tocScroll = this.body.scrollTop;
    this.pos = p;
    this.render();
    if (this.page.kind === 'contents') this.body.scrollTop = this.tocScroll;
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
      if (names === 'all') {
        const top = this.body.scrollTop;
        this.render();
        this.body.scrollTop = top;
        return;
      }
      const box = this.body.querySelector('.checks-body');
      const e = getEntry(page.id);
      if (box && e?.checks) box.innerHTML = this.checksHtml(e);
    }
  }

  updateMaxButton(): void {
    (this.el.querySelector('[data-nav=max]') as HTMLElement).innerHTML = this.host.isMaximized() ? ICONS.shrink : ICONS.expand;
  }

  private render(): void {
    const page = this.page;
    (this.el.querySelector('[data-nav=back]') as HTMLButtonElement).disabled = this.pos === 0;
    (this.el.querySelector('[data-nav=fwd]') as HTMLButtonElement).disabled = this.pos >= this.history.length - 1;
    this.el.querySelector('[data-nav=contents]')!.classList.toggle('on', page.kind === 'contents');
    const crumb = this.el.querySelector('.crumb') as HTMLElement;
    crumb.innerHTML = this.crumbHtml(page);
    switch (page.kind) {
      case 'contents':
        this.body.innerHTML = this.contentsHtml();
        this.bindContents();
        break;
      case 'help':
        this.body.innerHTML = this.helpHtml();
        break;
      case 'section':
        this.body.innerHTML = this.sectionHtml(page.chapter, page.section);
        break;
      case 'entry': {
        const e = getEntry(page.id);
        this.body.innerHTML = e ? this.entryHtml(e) : `<p class="pad">Unknown entry ${escapeHtml(page.id)}.</p>`;
        break;
      }
      case 'object':
        this.body.innerHTML = this.objectHtml(page.name);
        break;
    }
    this.updateMaxButton();
    this.host.pageChanged(page);
  }

  private crumbHtml(page: CoursePage): string {
    const secLink = (ch: number, s: number) => {
      const sec = sectionOf(ch, s);
      return sec ? `<a href="#" data-section="${ch}.${s}">§${ch}.${s} ${escapeHtml(sec.title)}</a>` : '';
    };
    if (page.kind === 'section') return `<span>Chapter ${page.chapter}</span>`;
    if (page.kind === 'entry') {
      const e = getEntry(page.id);
      return e ? secLink(e.chapter, e.section) : '';
    }
    if (page.kind === 'object') return '<span>Object</span>';
    if (page.kind === 'help') return '<span>How to use</span>';
    return '';
  }

  // -------------------------------------------------------------------------------------------
  // Table of contents

  private contentsHtml(): string {
    const written = allEntries().filter(hasContent).length;
    return `
      <article class="entry book-toc">
        <header class="book-cover">
          <div class="book-title">Elementary Differential Geometry</div>
          <div class="book-sub">B. O'Neill · revised 2nd edition · Chapters 1–3 — interactive companion</div>
          <div class="book-meta">${written} of ${allEntries().length} entries written · <a href="#" data-help="1">How to use the sandbox</a></div>
        </header>
        <div class="toc-tools">
          <input type="search" class="toc-search" placeholder="Search: Frenet, 2.3.2, isometry…" value="${escapeHtml(this.query)}">
          <div class="toc-filters">
            ${FILTERS.map((f) => `<button class="chip ${this.active.has(f.label) ? 'on' : ''}" data-filter="${f.label}">${f.label}</button>`).join('')}
            <button class="chip ${this.onlyWritten ? 'on' : ''}" data-written="1" title="Only entries whose content is already written">Written</button>
          </div>
        </div>
        <div class="toc-list">${this.tocListHtml()}</div>
      </article>`;
  }

  private tocListHtml(): string {
    const q = this.query.toLowerCase().trim();
    const body: string[] = [];
    for (const ch of CHAPTERS) {
      const secHtml: string[] = [];
      for (const s of SECTIONS.filter((x) => x.chapter === ch.chapter)) {
        const items = entriesOfSection(s.chapter, s.section).filter((e) => {
          const f = FILTERS.find((x) => x.kinds.includes(e.kind));
          if (f && !this.active.has(f.label)) return false;
          if (this.onlyWritten && !hasContent(e)) return false;
          if (q && !`${e.id} ${e.kind} ${e.title} ${e.bookName ?? ''} ${s.title}`.toLowerCase().includes(q)) return false;
          return true;
        });
        if (!items.length && (q || this.onlyWritten)) continue;
        secHtml.push(`
          <div class="toc-section">
            <a href="#" class="toc-sec-title" data-section="${s.chapter}.${s.section}"><span class="sec-num">${s.chapter}.${s.section}</span> ${escapeHtml(s.title)}<span class="pg">${s.page}</span></a>
            <div class="toc-items">${items.map((e) => this.tocItem(e)).join('')}</div>
          </div>`);
      }
      if (!secHtml.length) continue;
      const closed = this.collapsed.has(ch.chapter) && !q;
      body.push(`
        <div class="toc-chapter ${closed ? 'closed' : ''}">
          <button class="toc-ch-title" data-chapter="${ch.chapter}"><span class="caret"></span>Chapter ${ch.chapter} · ${escapeHtml(ch.title)}<span class="pg">${ch.page}</span></button>
          <div class="toc-ch-body">${secHtml.join('')}</div>
        </div>`);
    }
    return body.join('') || '<p class="muted pad">No match.</p>';
  }

  private tocItem(e: Entry): string {
    const loaded = this.host.loadedEntry() === e.id;
    return `
      <a href="#" class="toc-item ${hasContent(e) ? '' : 'todo'} ${loaded ? 'current' : ''}" data-entry="${e.id}" title="${escapeHtml(`${e.kind} ${e.id.startsWith('n.') ? '' : e.id} — p. ${e.page}${hasContent(e) ? '' : ' (not written yet)'}`)}">
        <span class="kind k-${e.kind.toLowerCase()}">${KIND_ABBR[e.kind]}</span>
        <span class="num">${e.id.startsWith('n.') ? '' : e.id}</span>
        <span class="ttl">${escapeHtml(e.title)}</span>
        <span class="pg">${e.page}</span>
      </a>`;
  }

  private bindContents(): void {
    const search = this.body.querySelector('.toc-search') as HTMLInputElement;
    const list = this.body.querySelector('.toc-list') as HTMLElement;
    search.addEventListener('input', () => {
      this.query = search.value;
      list.innerHTML = this.tocListHtml();
    });
    this.body.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((b) =>
      b.addEventListener('click', () => {
        const f = b.dataset.filter!;
        if (this.active.has(f)) this.active.delete(f);
        else this.active.add(f);
        b.classList.toggle('on');
        list.innerHTML = this.tocListHtml();
      }),
    );
    this.body.querySelector('[data-written]')?.addEventListener('click', (e) => {
      this.onlyWritten = !this.onlyWritten;
      (e.currentTarget as HTMLElement).classList.toggle('on');
      list.innerHTML = this.tocListHtml();
    });
  }

  // -------------------------------------------------------------------------------------------
  // Section page: every entry of the section, in the book's order

  private sectionHtml(chapter: number, section: number): string {
    const s = sectionOf(chapter, section);
    if (!s) return '<p class="pad">Unknown section.</p>';
    const entries = entriesOfSection(chapter, section);
    const next = SECTIONS.find((x) => x.page > s.page);
    const prev = [...SECTIONS].reverse().find((x) => x.page < s.page);
    const end = next ? next.page - 1 : s.page;
    const cards = entries.map((e) => {
      const head = `
        <div class="sec-entry-head">
          <span class="kind k-${e.kind.toLowerCase()}">${KIND_ABBR[e.kind]}</span>
          <a href="#" data-entry="${e.id}" class="sec-entry-title">${e.id.startsWith('n.') ? '' : `<span class="num">${e.id}</span> `}${escapeHtml(e.title)}</a>
          <span class="pg">p. ${e.page}</span>
        </div>`;
      if (!hasContent(e)) return `<div class="sec-entry todo">${head}<p class="muted">Not written yet — book p. ${e.page}.</p></div>`;
      return `
        <div class="sec-entry">
          ${head}
          <div class="statement kind-${e.kind.toLowerCase()}">${renderMarkdown(e.statement ?? '')}</div>
          <a href="#" class="btn sm" data-entry="${e.id}">Open — ${[e.proof ? (e.kind === 'Example' ? 'computation' : 'proof') : '', e.scene ? 'figure' : '', 'explanation'].filter(Boolean).join(', ')} →</a>
        </div>`;
    });
    const link = (x: Section | undefined, dir: 'prev' | 'next') =>
      x ? `<a href="#" class="xref nav-${dir}" data-section="${x.chapter}.${x.section}">${dir === 'prev' ? '← ' : ''}§${x.chapter}.${x.section} ${escapeHtml(x.title)}${dir === 'next' ? ' →' : ''}</a>` : '<span></span>';
    return `
      <article class="entry section-page">
        <header class="entry-head">
          <span class="badge">Section</span>
          <h2><span class="num">${s.chapter}.${s.section}</span> ${escapeHtml(s.title)}</h2>
          <span class="book-page">${ICONS.book} pp. ${s.page}–${end}</span>
        </header>
        ${cards.join('')}
        <nav class="entry-nav">${link(prev, 'prev')}${link(next, 'next')}</nav>
      </article>`;
  }

  // -------------------------------------------------------------------------------------------

  private helpHtml(): string {
    return `
      <article class="entry home">
        <h2>How to use the sandbox</h2>
        <ul>
          <li><b>Course</b> (this panel) is the book: <b>Contents</b> lists every definition, theorem, lemma, corollary, example and remark of Chapters 1–3. Clicking an entry loads its figure and shows its statement, proof and explanation; clicking a section shows the whole section. ⤢ enlarges the panel for reading.</li>
          <li><b>Toolbar</b>: create objects (points, tangent vectors, curves, Frenet frames, forms, mappings, frames, isometries…). New objects go to the active graphics view (2D or 3D — click a view to activate it).</li>
          <li><b>Algebra</b>: every object with its definition, grouped by view (R³, R², numbers, objects that are not drawn). Click to select (its details appear here), double-click or ✎ to edit, click the colored dot to show/hide.</li>
          <li><b>Sliders</b>: drag them, or type a value in the box; ▶ animates, ×1 changes the speed; grabbing the slider pauses the animation.</li>
          <li><b>Command bar</b> (bottom, can be hidden): type definitions such as <code>alpha(t) = (cos(t), sin(t), t)</code>, <code>V = x*y*U1 - z*U3</code>, <code>phi = x^2 dx - y dz</code>, <code>Frenet(alpha, 1)</code>.</li>
        </ul>
        <h3>Mouse</h3>
        <ul>
          <li>3D: drag to rotate, right-drag to pan, wheel to zoom.</li>
          <li>2D: drag to pan, wheel to zoom (Shift: vertical axis only, Alt: horizontal only).</li>
          <li>With the <b>Move</b> tool: drag a free point (3D: Shift for vertical motion); drag a point α(t₀), a velocity or a Frenet frame <b>along its curve</b> — the parameter (or its slider) follows.</li>
          <li>Keyboard: <code>Ctrl/⌘ Z</code> undo, <code>Ctrl/⌘ Shift Z</code> redo, <code>Delete</code> deletes the selection, <code>Esc</code> returns to the Move tool.</li>
        </ul>
        <p><a href="#" data-contents="1">← Back to the contents</a></p>
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
      let ok = false;
      let txt: string;
      try {
        const val = c.value(this.host.scene);
        ok = Math.abs(val - (c.expect ?? 0)) <= (c.tol ?? 1e-5);
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
      x
        ? `<a href="#" class="xref nav-${dir}" data-entry="${x.id}">${dir === 'prev' ? '← ' : ''}${escapeHtml(entryLabel(x.id))}${x.id.startsWith('n.') ? '' : ` · ${escapeHtml(x.title)}`}${dir === 'next' ? ' →' : ''}</a>`
        : '<span></span>';
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
    const loaded = this.host.loadedEntry();
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
          ${loaded ? `<p class="muted">Figure of <a href="#" class="xref" data-entry="${loaded}">${escapeHtml(entryLabel(loaded))}</a></p>` : ''}
        </section>
      </article>`;
  }

  private onClick(e: MouseEvent): void {
    const a = (e.target as HTMLElement).closest('a, button') as HTMLElement | null;
    if (!a) return;
    if (a.dataset.entry) {
      e.preventDefault();
      this.host.openEntry(a.dataset.entry);
    } else if (a.dataset.section) {
      e.preventDefault();
      const [c, s] = a.dataset.section.split('.').map(Number);
      this.host.openSection(c, s);
    } else if (a.dataset.chapter) {
      const c = Number(a.dataset.chapter);
      if (this.collapsed.has(c)) this.collapsed.delete(c);
      else this.collapsed.add(c);
      a.parentElement!.classList.toggle('closed');
    } else if (a.dataset.obj) {
      e.preventDefault();
      this.host.select(a.dataset.obj);
      this.show({ kind: 'object', name: a.dataset.obj });
    } else if (a.dataset.load) {
      const p = this.page;
      if (p.kind === 'entry') this.host.loadEntryScene(p.id, a.dataset.load as 'replace' | 'add');
    } else if (a.dataset.edit) {
      this.host.editObject(a.dataset.edit);
    } else if (a.dataset.help) {
      e.preventDefault();
      this.show({ kind: 'help' });
    } else if (a.dataset.contents) {
      e.preventDefault();
      this.show({ kind: 'contents' });
    }
  }
}
