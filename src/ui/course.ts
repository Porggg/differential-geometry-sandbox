// Course view: the book. A title page and table of contents, chapter openings, and section pages
// that read like a printed chapter (numbered results, proofs, commentary, figure plates) — plus the
// full details of sandbox objects, including those that cannot be drawn.

import { CHAPTERS, SECTIONS, entriesOfSection, entryLabel, getEntry, hasContent, localNumber } from '../content';
import type { Entry, EntryKind, Section } from '../content/types';
import { getType } from '../core/registry';
import type { Scene } from '../core/scene';
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
  /** Navigate to an entry (its section page) and load its figure. */
  openEntry(id: string): void;
  openSection(chapter: number, section: number): void;
  /** Load an entry's figure without changing the page. */
  showFigure(id: string): void;
  loadEntryScene(id: string, mode: 'replace' | 'add'): void;
  loadedEntry(): string | null;
  select(name: string | null): void;
  editObject(name: string): void;
  toggleMaximize(): void;
  isMaximized(): boolean;
  pageChanged(page: CoursePage): void;
}

const FILTERS: { label: string; kinds: EntryKind[] }[] = [
  { label: 'Theorems', kinds: ['Theorem', 'Proposition'] },
  { label: 'Lemmas', kinds: ['Lemma'] },
  { label: 'Corollaries', kinds: ['Corollary'] },
  { label: 'Definitions', kinds: ['Definition', 'Notion'] },
  { label: 'Examples', kinds: ['Example'] },
  { label: 'Remarks', kinds: ['Remark'] },
];

const sectionOf = (ch: number, s: number): Section | undefined => SECTIONS.find((x) => x.chapter === ch && x.section === s);
const chapterOf = (ch: number) => CHAPTERS.find((c) => c.chapter === ch)!;
const sectionIndex = (ch: number, s: number) => SECTIONS.findIndex((x) => x.chapter === ch && x.section === s);

/** Last page of a section in the book (the page before the next section starts). */
function lastPage(s: Section): number {
  const next = SECTIONS[sectionIndex(s.chapter, s.section) + 1];
  if (next && next.chapter === s.chapter) return next.page - 1;
  const nextCh = CHAPTERS.find((c) => c.chapter === s.chapter + 1);
  return nextCh ? nextCh.page - 2 : s.page + 6;
}

/** Insert run-in HTML (a label) at the start of the first paragraph of rendered Markdown. */
function runIn(html: string, label: string): string {
  if (html.startsWith('<p>')) return `<p>${label} ${html.slice(3)}`;
  return `<p class="run-in-alone">${label}</p>${html}`;
}

export class CoursePanel {
  readonly el: HTMLElement;
  private body: HTMLElement;
  private history: CoursePage[] = [{ kind: 'contents' }];
  private pos = 0;
  /** Section currently rendered (to avoid re-rendering when jumping within it). */
  private rendered: string | null = null;
  // table-of-contents state (kept between visits)
  private query = '';
  private active = new Set<string>(FILTERS.map((f) => f.label));
  private collapsed = new Set<number>();
  private tocScroll = 0;

  constructor(private host: CourseHost) {
    this.el = document.createElement('div');
    this.el.className = 'course';
    this.el.innerHTML = `
      <div class="panel-head course-head">
        <button class="icon-btn sm" data-nav="back" title="Back">${ICONS.back}</button>
        <button class="icon-btn sm" data-nav="fwd" title="Forward">${ICONS.forward}</button>
        <button class="btn sm toc-btn" data-nav="contents" title="Table of contents">${ICONS.contents} Contents</button>
        <span class="crumb"></span>
        <button class="icon-btn sm" data-nav="prev" title="Previous section (←)">${ICONS.back}</button>
        <span class="page-ind"></span>
        <button class="icon-btn sm" data-nav="next" title="Next section (→)">${ICONS.forward}</button>
        <button class="icon-btn sm" data-nav="max" title="Full-width reading / show the figure">${ICONS.expand}</button>
      </div>
      <div class="course-body"></div>`;
    this.body = this.el.querySelector('.course-body')!;
    const nav = (k: string, f: () => void) => this.el.querySelector(`[data-nav=${k}]`)!.addEventListener('click', f);
    nav('back', () => this.go(-1));
    nav('fwd', () => this.go(1));
    nav('contents', () => this.show({ kind: 'contents' }));
    nav('prev', () => this.turnPage(-1));
    nav('next', () => this.turnPage(1));
    nav('max', () => this.host.toggleMaximize());
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
    this.render(true);
  }

  private go(d: number): void {
    const p = this.pos + d;
    if (p < 0 || p >= this.history.length) return;
    if (this.page.kind === 'contents') this.tocScroll = this.body.scrollTop;
    this.pos = p;
    this.render(true);
  }

  /** The section the current page belongs to, if any. */
  private currentSection(): Section | undefined {
    const p = this.page;
    if (p.kind === 'section') return sectionOf(p.chapter, p.section);
    if (p.kind === 'entry') {
      const e = getEntry(p.id);
      return e ? sectionOf(e.chapter, e.section) : undefined;
    }
    return undefined;
  }

  /** Previous / next section, like turning pages. From the contents, "next" opens §1.1. */
  turnPage(d: number): void {
    const s = this.currentSection();
    if (!s) {
      if (d > 0) this.host.openSection(SECTIONS[0].chapter, SECTIONS[0].section);
      return;
    }
    const t = SECTIONS[sectionIndex(s.chapter, s.section) + d];
    if (t) this.host.openSection(t.chapter, t.section);
    else if (d < 0) this.show({ kind: 'contents' });
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
    } else if (page.kind === 'entry' || page.kind === 'section') {
      this.updateFigureMarkers();
    }
  }

  updateMaxButton(): void {
    (this.el.querySelector('[data-nav=max]') as HTMLElement).innerHTML = this.host.isMaximized() ? ICONS.shrink : ICONS.expand;
  }

  private render(navigated = false): void {
    const page = this.page;
    (this.el.querySelector('[data-nav=back]') as HTMLButtonElement).disabled = this.pos === 0;
    (this.el.querySelector('[data-nav=fwd]') as HTMLButtonElement).disabled = this.pos >= this.history.length - 1;
    this.el.querySelector('[data-nav=contents]')!.classList.toggle('on', page.kind === 'contents');
    const sec = this.currentSection();
    (this.el.querySelector('.crumb') as HTMLElement).innerHTML = this.crumbHtml(page);
    (this.el.querySelector('.page-ind') as HTMLElement).textContent = sec ? `pp. ${sec.page}–${lastPage(sec)}` : '';
    (this.el.querySelector('[data-nav=prev]') as HTMLButtonElement).disabled = !sec;
    const key = sec ? `${sec.chapter}.${sec.section}` : null;
    switch (page.kind) {
      case 'contents':
        this.rendered = null;
        this.body.innerHTML = this.contentsHtml();
        this.bindContents();
        if (navigated) this.body.scrollTop = this.tocScroll;
        break;
      case 'help':
        this.rendered = null;
        this.body.innerHTML = this.helpHtml();
        if (navigated) this.body.scrollTop = 0;
        break;
      case 'object':
        this.rendered = null;
        this.body.innerHTML = this.objectHtml(page.name);
        if (navigated) this.body.scrollTop = 0;
        break;
      case 'section':
      case 'entry': {
        if (!sec) {
          this.body.innerHTML = '<p class="pad">Unknown page.</p>';
          break;
        }
        if (this.rendered !== key) {
          this.body.innerHTML = this.sectionHtml(sec);
          this.rendered = key;
          if (page.kind === 'section' && navigated) this.body.scrollTop = 0;
        } else this.updateFigureMarkers();
        if (page.kind === 'entry' && navigated) this.scrollToEntry(page.id);
        break;
      }
    }
    this.updateMaxButton();
    this.host.pageChanged(page);
  }

  private scrollToEntry(id: string): void {
    const el = this.body.querySelector(`[data-anchor="${CSS.escape(id)}"]`) as HTMLElement | null;
    if (!el) return;
    const top = el.getBoundingClientRect().top - this.body.getBoundingClientRect().top + this.body.scrollTop - 14;
    this.body.scrollTo({ top, behavior: 'auto' });
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }

  private crumbHtml(page: CoursePage): string {
    if (page.kind === 'object') return '<span>Object of the construction</span>';
    if (page.kind === 'help') return '<span>How to use</span>';
    const s = this.currentSection();
    if (!s) return '';
    return `<a href="#" data-section="${s.chapter}.1">Ch. ${s.chapter}</a> · <a href="#" data-section="${s.chapter}.${s.section}">§${s.chapter}.${s.section} ${escapeHtml(s.title)}</a>`;
  }

  // -------------------------------------------------------------------------------------------
  // Title page and table of contents

  private contentsHtml(): string {
    return `
      <article class="book-page toc-page">
        <header class="title-page">
          <div class="tp-rule"></div>
          <div class="tp-title">Elementary Differential Geometry</div>
          <div class="tp-author">Barrett O'Neill</div>
          <div class="tp-edition">Revised Second Edition · Chapters 1–3</div>
          <div class="tp-rule"></div>
          <div class="tp-sub">An interactive companion: every definition, theorem and example, with its proof and a live figure.
            <a href="#" data-help="1">How to read this book</a></div>
        </header>
        <h2 class="toc-head">Contents</h2>
        <div class="toc-tools">
          <input type="search" class="toc-search" placeholder="Find a result: Frenet, 2.3.2, isometry…" value="${escapeHtml(this.query)}">
          <div class="toc-filters">
            ${FILTERS.map((f) => `<button class="chip ${this.active.has(f.label) ? 'on' : ''}" data-filter="${f.label}">${f.label}</button>`).join('')}
          </div>
        </div>
        <div class="toc-list">${this.tocListHtml()}</div>
      </article>`;
  }

  private tocListHtml(): string {
    const q = this.query.toLowerCase().trim();
    const loaded = this.host.loadedEntry();
    const out: string[] = [];
    for (const ch of CHAPTERS) {
      const secs: string[] = [];
      for (const s of SECTIONS.filter((x) => x.chapter === ch.chapter)) {
        const items = entriesOfSection(s.chapter, s.section).filter((e) => {
          const f = FILTERS.find((x) => x.kinds.includes(e.kind));
          if (f && !this.active.has(f.label)) return false;
          if (q && !`${e.id} ${e.kind} ${e.title} ${e.bookName ?? ''} ${s.title}`.toLowerCase().includes(q)) return false;
          return true;
        });
        if (!items.length && q) continue;
        secs.push(`
          <div class="toc-sec">
            <a href="#" class="toc-line sec" data-section="${s.chapter}.${s.section}"><span class="n">${s.chapter}.${s.section}</span><span class="t">${escapeHtml(s.title)}</span><span class="dots"></span><span class="pg">${s.page}</span></a>
            <div class="toc-items">${items
              .map(
                (e) => `<a href="#" class="toc-line item ${e.id === loaded ? 'current' : ''}" data-entry="${e.id}">
                  <span class="n">${localNumber(e)}</span><span class="t"><span class="k">${e.kind === 'Notion' ? '' : e.kind}</span> ${escapeHtml(e.title)}</span><span class="dots"></span><span class="pg">${e.page}</span></a>`,
              )
              .join('')}</div>
          </div>`);
      }
      if (!secs.length) continue;
      const closed = this.collapsed.has(ch.chapter) && !q;
      out.push(`
        <div class="toc-chapter ${closed ? 'closed' : ''}">
          <div class="toc-line chap">
            <button class="toc-fold" data-chapter="${ch.chapter}" title="Show / hide the results"><span class="caret"></span></button>
            <a href="#" data-section="${ch.chapter}.1"><span class="n">Chapter ${ch.chapter}</span><span class="t">${escapeHtml(ch.title)}</span></a><span class="dots"></span><span class="pg">${ch.page}</span>
          </div>
          <div class="toc-ch-body">${secs.join('')}</div>
        </div>`);
    }
    return out.join('') || '<p class="muted">No match.</p>';
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
  }

  // -------------------------------------------------------------------------------------------
  // A section page, typeset as in the book

  private sectionHtml(s: Section): string {
    const ch = chapterOf(s.chapter);
    const md = (src: string) => renderMarkdown(src, { chapter: s.chapter });
    const opener =
      s.section === 1
        ? `<header class="ch-open">
            <div class="ch-ornament"><span></span><i class="up"></i><span></span></div>
            <div class="ch-num">Chapter ${ch.chapter}</div>
            <div class="ch-title">${escapeHtml(ch.title)}</div>
            <div class="ch-ornament"><span></span><i class="down"></i><span></span></div>
            ${ch.intro ? `<div class="ch-intro">${md(ch.intro)}</div>` : ''}
          </header>`
        : '';
    const entries = entriesOfSection(s.chapter, s.section)
      .map((e) => this.entryHtml(e, md))
      .join('');
    const idx = sectionIndex(s.chapter, s.section);
    const prev = SECTIONS[idx - 1];
    const next = SECTIONS[idx + 1];
    const turn = (x: Section | undefined, dir: 'prev' | 'next') =>
      x
        ? `<a href="#" class="turn ${dir}" data-section="${x.chapter}.${x.section}"><span class="turn-dir">${dir === 'prev' ? '← Previous' : 'Next →'}</span><span class="turn-t">${x.chapter}.${x.section} ${escapeHtml(x.title)}</span></a>`
        : `<a href="#" class="turn ${dir}" data-contents="1"><span class="turn-dir">${dir === 'prev' ? '← Contents' : ''}</span></a>`;
    return `
      <article class="book-page">
        <div class="run-head"><span>${ch.chapter}. ${escapeHtml(ch.title)}</span><span>${s.chapter}.${s.section} ${escapeHtml(s.title)}</span></div>
        ${opener}
        <h2 class="sec-title"><span class="sec-num">${s.chapter}.${s.section}</span>${escapeHtml(s.title)}</h2>
        ${entries}
        <footer class="page-foot">
          <div class="folio">pp. ${s.page}–${lastPage(s)} in the book</div>
          <nav class="turns">${turn(prev, 'prev')}${turn(next, 'next')}</nav>
        </footer>
      </article>`;
  }

  private entryHtml(e: Entry, md: (s: string) => string): string {
    const loaded = this.host.loadedEntry() === e.id;
    const kind = e.kind.toLowerCase();
    const margin = `<a href="#" class="bk-pg" data-entry-page="${e.id}" title="Page in O'Neill (revised 2nd ed.)">p. ${e.page}</a>`;
    if (!hasContent(e)) {
      return `<section class="bk-entry kind-${kind}" data-anchor="${e.id}">${margin}<p><span class="bk-lbl">${localNumber(e)} ${e.kind}</span> <span class="muted">${escapeHtml(e.title)} — see the book, p. ${e.page}.</span></p></section>`;
    }
    let stmt = md(e.statement ?? '');
    if (e.kind === 'Notion') stmt = `<h4 class="bk-notion">${escapeHtml(e.title)}</h4>${stmt}`;
    else stmt = runIn(stmt, `<span class="bk-lbl">${localNumber(e)} ${e.kind}</span>${e.bookName ? ` <span class="bk-name">(${escapeHtml(e.bookName)}).</span>` : ''}`);
    let proof = '';
    if (e.proof) {
      const body = md(e.proof);
      proof = `<div class="bk-proof">${e.kind === 'Example' ? body : runIn(body, '<span class="bk-proof-lbl">Proof.</span>')}</div>`;
    }
    const fig = e.scene
      ? `<figure class="bk-fig ${loaded ? 'loaded' : ''}" data-fig="${e.id}">
          <div class="bk-fig-icon">${e.scene.views.includes('3d') ? ICONS.view3d : ICONS.view2d}</div>
          <figcaption>
            <span class="bk-fig-n">Figure ${localNumber(e) || e.title}</span>
            <span class="bk-fig-t">${e.scene.views.length ? `Interactive ${e.scene.views.map((v) => v.toUpperCase()).join(' + ')} figure` : 'Computation without picture'} — ${loaded ? 'shown beside the text' : 'click to show it beside the text'}.</span>
          </figcaption>
        </figure>`
      : '';
    const tryThis = e.tryThis?.length
      ? `<aside class="bk-try"><div class="bk-try-h">${ICONS.view3d} Try it in the figure</div><ul>${e.tryThis.map((t) => `<li>${md(t).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ul></aside>`
      : '';
    return `
      <section class="bk-entry kind-${kind} ${loaded ? 'loaded' : ''}" data-anchor="${e.id}">
        ${margin}
        <div class="bk-stmt">${stmt}</div>
        ${proof}
        ${fig}
        ${e.notes ? `<div class="bk-notes">${md(e.notes)}</div>` : ''}
        ${tryThis}
      </section>`;
  }

  /** Reflect which entry's figure is loaded without re-rendering the page. */
  private updateFigureMarkers(): void {
    const loaded = this.host.loadedEntry();
    this.body.querySelectorAll<HTMLElement>('.bk-entry').forEach((el) => el.classList.toggle('loaded', el.dataset.anchor === loaded));
    this.body.querySelectorAll<HTMLElement>('.bk-fig').forEach((el) => {
      const on = el.dataset.fig === loaded;
      el.classList.toggle('loaded', on);
      const t = el.querySelector('.bk-fig-t');
      if (t) t.textContent = t.textContent!.replace(/— .*$/, on ? '— shown beside the text.' : '— click to show it beside the text.');
    });
  }

  // -------------------------------------------------------------------------------------------

  private helpHtml(): string {
    return `
      <article class="book-page help-page">
        <h2 class="sec-title">How to read this book</h2>
        <p><b>Book mode</b> (the default) is for reading: the text on the left, typeset like the printed book, and the figure of the result you are reading on the right.</p>
        <ul>
          <li><b>Contents</b> lists the chapters, sections and every numbered result with its page in O'Neill. Click a section to read it, or a result to jump to it.</li>
          <li>Each result has a <b>figure plate</b> under its statement or proof: click it to show that figure beside the text. The figure is live — drag it, use its sliders — and the <b>live checks</b> under it recompute the result on the figure.</li>
          <li>Turn pages with the arrows at the bottom of a section, the ‹ › buttons at the top, or the ← → keys. ⤢ hides the figure for full-width reading.</li>
          <li>Cross references are written as in the book: “Theorem 3.2” in the same chapter, “Lemma 4.5 of Chapter 1” otherwise. Click them.</li>
        </ul>
        <p><b>Sandbox mode</b> adds the construction tools: the toolbar, the Algebra view (all objects of the figure, editable), the command bar, and the details of any object in this panel. Use “Explore in the sandbox” above a figure to switch with that figure loaded.</p>
        <h3>Mouse and keyboard</h3>
        <ul>
          <li>3D: drag to rotate, right-drag to pan, wheel to zoom. 2D: drag to pan, wheel to zoom (Shift: vertical axis only).</li>
          <li>With the Move tool (sandbox mode): drag free points, and drag α(t₀), velocities or Frenet frames along their curve.</li>
          <li><code>Ctrl/⌘ Z</code> undo, <code>Ctrl/⌘ Shift Z</code> redo, <code>Esc</code> back to the Move tool.</li>
        </ul>
        <p><a href="#" data-contents="1">← Back to the contents</a></p>
      </article>`;
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
    const fig = (e.target as HTMLElement).closest('.bk-fig') as HTMLElement | null;
    if (fig?.dataset.fig) {
      this.host.showFigure(fig.dataset.fig);
      return;
    }
    const a = (e.target as HTMLElement).closest('a, button') as HTMLElement | null;
    if (!a) return;
    if (a.dataset.entry) {
      e.preventDefault();
      this.host.openEntry(a.dataset.entry);
    } else if (a.dataset.entryPage) {
      e.preventDefault();
    } else if (a.dataset.section) {
      e.preventDefault();
      const [c, s] = a.dataset.section.split('.').map(Number);
      this.host.openSection(c, s);
    } else if (a.dataset.chapter) {
      const c = Number(a.dataset.chapter);
      if (this.collapsed.has(c)) this.collapsed.delete(c);
      else this.collapsed.add(c);
      a.closest('.toc-chapter')!.classList.toggle('closed');
    } else if (a.dataset.obj) {
      e.preventDefault();
      this.host.select(a.dataset.obj);
      this.show({ kind: 'object', name: a.dataset.obj });
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

