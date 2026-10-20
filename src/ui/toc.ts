// Table of contents panel: chapters → sections → numbered items, with search and kind filters.

import { CHAPTERS, SECTIONS, entriesOfSection, hasContent } from '../content';
import type { EntryKind } from '../content/types';
import { escapeHtml } from './katex';

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

export class TocPanel {
  readonly el: HTMLElement;
  private query = '';
  private active = new Set<string>(FILTERS.map((f) => f.label));
  private onlyWritten = false;
  private current: string | null = null;
  private collapsed = new Set<string>();

  constructor(private open: (id: string) => void) {
    this.el = document.createElement('div');
    this.el.className = 'toc';
    this.render();
  }

  setCurrent(id: string | null): void {
    this.current = id;
    this.el.querySelectorAll('.toc-item').forEach((n) => n.classList.toggle('current', (n as HTMLElement).dataset.id === id));
    const cur = this.el.querySelector('.toc-item.current') as HTMLElement | null;
    cur?.scrollIntoView({ block: 'nearest' });
  }

  private render(): void {
    const head = `
      <div class="panel-head"><span class="panel-title">Contents</span><span class="panel-sub">O'Neill, Ch. 1–3</span></div>
      <div class="toc-tools">
        <input type="search" class="toc-search" placeholder="Search (e.g. Frenet, 2.3.2)" value="${escapeHtml(this.query)}">
        <div class="toc-filters">
          ${FILTERS.map((f) => `<button class="chip ${this.active.has(f.label) ? 'on' : ''}" data-filter="${f.label}">${f.label}</button>`).join('')}
          <button class="chip ${this.onlyWritten ? 'on' : ''}" data-written="1" title="Only entries whose content is already written">Written</button>
        </div>
      </div>`;
    const body: string[] = [];
    const q = this.query.toLowerCase();
    for (const ch of CHAPTERS) {
      const secs = SECTIONS.filter((s) => s.chapter === ch.chapter);
      const secHtml: string[] = [];
      for (const s of secs) {
        const items = entriesOfSection(s.chapter, s.section).filter((e) => {
          const f = FILTERS.find((x) => x.kinds.includes(e.kind));
          if (f && !this.active.has(f.label)) return false;
          if (this.onlyWritten && !hasContent(e)) return false;
          if (q && !(`${e.id} ${e.kind} ${e.title} ${e.bookName ?? ''}`.toLowerCase().includes(q))) return false;
          return true;
        });
        if (!items.length && (q || this.onlyWritten)) continue;
        const key = `${s.chapter}.${s.section}`;
        const closed = this.collapsed.has(key) && !q;
        secHtml.push(`
          <div class="toc-section ${closed ? 'closed' : ''}">
            <button class="toc-sec-title" data-sec="${key}"><span class="caret"></span>${key} ${escapeHtml(s.title)}<span class="pg">${s.page}</span></button>
            <div class="toc-items">
              ${items
                .map(
                  (e) => `
                <a href="#" class="toc-item ${hasContent(e) ? '' : 'todo'} ${e.id === this.current ? 'current' : ''}" data-id="${e.id}" title="${escapeHtml(`${e.kind} ${e.id.startsWith('n.') ? '' : e.id} — p. ${e.page}${hasContent(e) ? '' : ' (not written yet)'}`)}">
                  <span class="kind k-${e.kind.toLowerCase()}">${KIND_ABBR[e.kind]}</span>
                  <span class="num">${e.id.startsWith('n.') ? '' : e.id}</span>
                  <span class="ttl">${escapeHtml(e.title)}</span>
                  <span class="pg">${e.page}</span>
                </a>`,
                )
                .join('')}
            </div>
          </div>`);
      }
      if (!secHtml.length) continue;
      body.push(`<div class="toc-chapter"><div class="toc-ch-title">Chapter ${ch.chapter} · ${escapeHtml(ch.title)}</div>${secHtml.join('')}</div>`);
    }
    this.el.innerHTML = head + `<div class="toc-body">${body.join('') || '<p class="muted pad">No match.</p>'}</div>`;

    const search = this.el.querySelector('.toc-search') as HTMLInputElement;
    search.addEventListener('input', () => {
      this.query = search.value;
      const pos = search.selectionStart;
      this.render();
      const s2 = this.el.querySelector('.toc-search') as HTMLInputElement;
      s2.focus();
      s2.setSelectionRange(pos, pos);
    });
    this.el.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((b) =>
      b.addEventListener('click', () => {
        const f = b.dataset.filter!;
        if (this.active.has(f)) this.active.delete(f);
        else this.active.add(f);
        this.render();
      }),
    );
    this.el.querySelector('[data-written]')?.addEventListener('click', () => {
      this.onlyWritten = !this.onlyWritten;
      this.render();
    });
    this.el.querySelectorAll<HTMLButtonElement>('[data-sec]').forEach((b) =>
      b.addEventListener('click', () => {
        const k = b.dataset.sec!;
        if (this.collapsed.has(k)) this.collapsed.delete(k);
        else this.collapsed.add(k);
        b.parentElement!.classList.toggle('closed');
      }),
    );
    this.el.querySelectorAll<HTMLAnchorElement>('.toc-item').forEach((a) =>
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        this.open(a.dataset.id!);
      }),
    );
  }
}
