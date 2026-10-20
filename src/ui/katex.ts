import katex from 'katex';

const cache = new Map<string, string>();

/** Render TeX to an HTML string (cached). Errors are shown inline instead of thrown. */
export function texToHtml(tex: string, display = false): string {
  const key = (display ? 'D' : 'I') + tex;
  const hit = cache.get(key);
  if (hit) return hit;
  let html: string;
  try {
    html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', trust: false, output: 'html' });
  } catch {
    html = `<code>${escapeHtml(tex)}</code>`;
  }
  if (cache.size > 4000) cache.clear();
  cache.set(key, html);
  return html;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
