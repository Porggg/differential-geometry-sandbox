// Minimal Markdown + KaTeX renderer for the Course view.
// Supports: paragraphs, "- " lists, "> " quotes, **bold**, *italic*, `code`, $inline$, $$display$$,
// and cross references [[id]] / [[id|text]] to book entries.

import { entryLabel, getEntry } from '../content';
import { escapeHtml, texToHtml } from './katex';

export function renderMarkdown(src: string): string {
  const math: string[] = [];
  const keep = (html: string) => {
    math.push(html);
    return `\u0000${math.length - 1}\u0000`;
  };
  let s = src.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => keep(`<div class="math-display">${texToHtml(t.trim(), true)}</div>`));
  s = s.replace(/\$([^$\n]+?)\$/g, (_, t) => keep(texToHtml(t.trim(), false)));
  s = s.replace(/`([^`]+)`/g, (_, t) => keep(`<code>${escapeHtml(t)}</code>`));

  const blocks = s.split(/\n\s*\n/);
  const out: string[] = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*- /.test(l) || l.trim() === '')) {
      out.push(`<ul>${lines.filter((l) => l.trim()).map((l) => `<li>${inline(l.replace(/^\s*- /, ''))}</li>`).join('')}</ul>`);
    } else if (lines.every((l) => /^> ?/.test(l))) {
      out.push(`<blockquote>${inline(lines.map((l) => l.replace(/^> ?/, '')).join(' '))}</blockquote>`);
    } else {
      const text = lines.join(' ').trim();
      if (!text) continue;
      // a block that is only display math should not be wrapped in <p>
      if (/^\u0000\d+\u0000$/.test(text) && math[Number(text.slice(1, -1))].startsWith('<div')) out.push(text);
      else out.push(`<p>${inline(text)}</p>`);
    }
  }
  let html = out.join('\n');
  html = html.replace(/\u0000(\d+)\u0000/g, (_, i) => math[Number(i)]);
  return html;
}

function inline(s: string): string {
  let t = escapeHtml(s);
  t = t.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, id: string, text?: string) => {
    const label = text ?? entryLabel(id);
    const exists = !!getEntry(id);
    return exists ? `<a href="#" class="xref" data-entry="${escapeHtml(id)}">${label}</a>` : label;
  });
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
  return t;
}
