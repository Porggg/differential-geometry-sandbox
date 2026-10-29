// Minimal Markdown + KaTeX renderer for the Course view.
// Supports: paragraphs, "- " lists, "> " quotes, **bold**, *italic*, `code`, $inline$, $$display$$,
// "(a) …" lines (parts of an exercise), cross references [[id]] / [[id|text]] to book entries and
// [[ex:1.3.4]] to exercises.

import { bookLabel, entryLabel, exerciseLabel, getEntry } from '../content';
import { escapeHtml, texToHtml } from './katex';

export interface MdOptions {
  /** Chapter of the page being read: cross references are written as in the book ("Theorem 3.2", "Lemma 4.5 of Chapter 1"). */
  chapter?: number;
  /** Section of the page being read: exercises of the same section are referred to by number only. */
  section?: number;
}

const PART = /^\s*\(([a-z]|i{1,3}|iv|v|vi{1,3})\)\s+/;

export function renderMarkdown(src: string, opts: MdOptions = {}): string {
  const math: string[] = [];
  const texLen: number[] = [];
  const keep = (html: string, tex: string) => {
    math.push(html);
    texLen.push(tex.length);
    return `\u0000${math.length - 1}\u0000`;
  };
  // a backtick inside an md raw template must be escaped, which leaves a backslash before it: drop it
  let s = src.replace(/\\`/g, '`');
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => keep(`<div class="math-display">${texToHtml(t.trim(), true)}</div>`, t));
  s = s.replace(/\$([^$\n]+?)\$/g, (_, t) => keep(texToHtml(t.trim(), false), t));
  s = s.replace(/`([^`]+)`/g, (_, t) => keep(`<code>${escapeHtml(t)}</code>`, t));
  /** Approximate printed length of a line (math counted by its TeX source). */
  const width = (l: string) => l.replace(/\u0000(\d+)\u0000/g, (_, i) => 'x'.repeat(Math.ceil(texLen[Number(i)] * 0.6))).length;

  const blocks = s.split(/\n\s*\n/);
  const out: string[] = [];
  const paragraph = (text: string) => {
    if (!text) return;
    // a paragraph that is only display math should not be wrapped in <p>
    if (/^\u0000\d+\u0000$/.test(text) && math[Number(text.slice(1, -1))].startsWith('<div')) out.push(text);
    else out.push(`<p>${inline(text, opts)}</p>`);
  };
  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.trim());
    if (lines.length && lines.every((l) => /^> ?/.test(l))) {
      out.push(`<blockquote>${inline(lines.map((l) => l.replace(/^> ?/, '')).join(' '), opts)}</blockquote>`);
      continue;
    }
    // a block is a sequence of runs: text lines (one paragraph), "- " list items, "(a) " parts
    const kind = (l: string) => (/^\s*- /.test(l) ? 'list' : PART.test(l) ? 'part' : 'text');
    for (let i = 0; i < lines.length; ) {
      const k = kind(lines[i]);
      let j = i;
      while (j < lines.length && kind(lines[j]) === k) j++;
      const run = lines.slice(i, j);
      if (k === 'list') {
        out.push(`<ul>${run.map((l) => `<li>${inline(l.replace(/^\s*- /, ''), opts)}</li>`).join('')}</ul>`);
      } else if (k === 'part') {
        const cols = run.every((l) => width(l) < 40) ? ' cols' : '';
        const items = run.map((l) => {
          const m = PART.exec(l)!;
          return `<li><span class="pl">(${m[1]})</span> ${inline(l.slice(m[0].length), opts)}</li>`;
        });
        out.push(`<ol class="parts${cols}">${items.join('')}</ol>`);
      } else {
        paragraph(run.join(' ').trim());
      }
      i = j;
    }
  }
  let html = out.join('\n');
  html = html.replace(/\u0000(\d+)\u0000/g, (_, i) => math[Number(i)]);
  return html;
}

function inline(s: string, opts: MdOptions): string {
  let t = escapeHtml(s);
  // The label of [[id]] already contains the kind, so "Theorem [[2.3.2]]" drops the word before the link;
  // "Definitions [[a]] and [[b]]" keeps it and labels the first link by its number only.
  t = t.replace(
    /(?:\b(Theorem|Lemma|Corollary|Definition|Example|Remark|Proposition)(s?)\s+)?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, word: string | undefined, plural: string, id: string, text?: string) => {
      if (id.startsWith('ex:')) {
        const x = id.slice(3);
        return `${word ? `${word}${plural} ` : ''}<a href="#" class="xref" data-ex="${escapeHtml(x)}">${text ?? exerciseLabel(x, opts.chapter, opts.section)}</a>`;
      }
      const e = getEntry(id);
      let label = text ?? (opts.chapter ? bookLabel(id, opts.chapter) : entryLabel(id));
      let prefix = word ? `${word}${plural} ` : '';
      if (word && !text && e?.kind === word) {
        if (plural) label = label.slice(word.length + 1);
        else prefix = '';
      }
      return prefix + (e ? `<a href="#" class="xref" data-entry="${escapeHtml(id)}">${label}</a>` : label);
    },
  );
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
  return t;
}
