import { describe, expect, it } from 'vitest';
import '../src/objects';
import { SECTIONS, allExerciseSets, getEntry } from '../src/content';
import { renderMarkdown } from '../src/ui/markdown';
import ex1Src from '../src/content/ex1.ts?raw';
import ex2Src from '../src/content/ex2.ts?raw';
import ex3Src from '../src/content/ex3.ts?raw';

const sets = allExerciseSets();
const exists = (id: string) => {
  const [c, s, n] = id.split('.').map(Number);
  const x = sets.find((e) => e.chapter === c && e.section === s);
  return !!x && (n === undefined || (n >= 1 && n <= x.items.length));
};

describe('exercises', () => {
  it('belong to sections of the book, one set per section', () => {
    const keys = sets.map((x) => `${x.chapter}.${x.section}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const x of sets) expect(SECTIONS.some((s) => s.chapter === x.chapter && s.section === x.section), `${x.chapter}.${x.section}`).toBe(true);
  });
  it('render without TeX errors, with resolvable cross references', () => {
    for (const x of sets) {
      for (const src of [x.intro ?? '', ...x.items.flatMap((e) => [e.statement, e.solution])]) {
        const where = `${x.chapter}.${x.section}: ${src.slice(0, 50)}`;
        expect(renderMarkdown(src, { chapter: x.chapter, section: x.section }), where).not.toMatch(/katex-error/);
        for (const [, id] of src.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
          if (id.startsWith('ex:')) expect(exists(id.slice(3)), `${where} → ${id}`).toBe(true);
          else expect(getEntry(id), `${where} → ${id}`).toBeDefined();
        }
      }
    }
  });
  it('sources never contain "${"', () => {
    for (const [name, src] of [['ex1', ex1Src], ['ex2', ex2Src], ['ex3', ex3Src]]) expect(src.includes('$' + '{'), name).toBe(false);
  });
});
