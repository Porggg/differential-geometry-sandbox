import { expect, it } from 'vitest';
import '../src/objects';
import { renderMarkdown } from '../src/ui/markdown';

it('absorbs the kind word before a cross reference', () => {
  const h = renderMarkdown('By Theorem [[2.3.2]] and Lemma [[1.4.5]].', { chapter: 2 });
  expect(h).toContain('By <a href="#" class="xref" data-entry="2.3.2">Theorem 3.2</a> and <a');
  expect(h).toContain('>Lemma 4.5 of Chapter 1</a>.');
  expect(h).not.toContain('Theorem Theorem');
  const g = renderMarkdown('see Example [[2.3.3]], and the Theorem of [[1.3.3]]');
  expect(g).toContain('see <a href="#" class="xref" data-entry="2.3.3">Example 2.3.3</a>');
  expect(g).toContain('the Theorem of <a');
});

it('keeps a plural kind word', () => {
  const h = renderMarkdown('Definitions [[2.1.1]] and [[2.1.3]]', { chapter: 2 });
  expect(h).toContain('Definitions <a href="#" class="xref" data-entry="2.1.1">1.1</a> and <a');
  expect(h).toContain('>Definition 1.3</a>');
});

it('never repeats the kind word in any entry', async () => {
  const { allEntries } = await import('../src/content');
  for (const e of allEntries()) {
    for (const src of [e.statement, e.proof, e.notes, ...(e.tryThis ?? [])]) {
      if (!src) continue;
      const text = renderMarkdown(src, { chapter: e.chapter }).replace(/<[^>]+>/g, '');
      expect(text, e.id).not.toMatch(/\b(Theorem|Lemma|Corollary|Definition|Example|Remark|Proposition)s? \1\b/);
    }
  }
});
