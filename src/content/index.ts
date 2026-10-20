import { ENTRIES } from './entries';
import { NOTIONS } from './notions';
import { CHAPTERS, SECTIONS, baseEntries } from './toc';
import type { Entry } from './types';

const byId = new Map<string, Entry>();
for (const e of baseEntries()) byId.set(e.id, e);
for (const patch of [...ENTRIES, ...NOTIONS]) {
  const base = byId.get(patch.id!);
  if (!base) throw new Error(`content for unknown entry ${patch.id}`);
  byId.set(base.id, { ...base, ...patch });
}

export const allEntries = (): Entry[] => [...byId.values()];
export const getEntry = (id: string): Entry | undefined => byId.get(id);
export const hasContent = (e: Entry): boolean => !!e.statement;
export { CHAPTERS, SECTIONS };

/** "Theorem 2.3.2" / "Lemma 1.5.6" / notion title. */
export function entryLabel(id: string): string {
  const e = byId.get(id);
  if (!e) return id;
  if (e.kind === 'Notion') return e.title;
  return `${e.kind} ${e.id}`;
}

export function entriesOfSection(chapter: number, section: number): Entry[] {
  const order = (e: Entry) => (e.id.startsWith('n.') ? e.page * 100 + 50 : e.page * 100 + Number(e.id.split('.')[2]));
  return allEntries()
    .filter((e) => e.chapter === chapter && e.section === section)
    .sort((a, b) => order(a) - order(b));
}
