import { CH1 } from './ch1';
import { CH2 } from './ch2';
import { CH3 } from './ch3';
import { EX1 } from './ex1';
import { EX2 } from './ex2';
import { EX3 } from './ex3';
import { ENTRIES } from './entries';
import { NOTIONS } from './notions';
import { CHAPTERS, SECTIONS, baseEntries } from './toc';
import type { Entry, ExerciseSet } from './types';

const byId = new Map<string, Entry>();
for (const e of baseEntries()) byId.set(e.id, e);
for (const patch of [...ENTRIES, ...NOTIONS, ...CH1, ...CH2, ...CH3]) {
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

/** Book-style label: "Theorem 3.2" inside Chapter 2, "Theorem 3.2 of Chapter 2" elsewhere. */
export function bookLabel(id: string, chapter: number): string {
  const e = byId.get(id);
  if (!e) return id;
  if (e.kind === 'Notion') return e.title;
  const [, s, n] = e.id.split('.');
  return `${e.kind} ${s}.${n}` + (e.chapter === chapter ? '' : ` of Chapter ${e.chapter}`);
}

/** Number of an entry within its chapter, as printed in the book ("3.2"). */
export const localNumber = (e: Entry): string => (e.id.startsWith('n.') ? '' : e.id.split('.').slice(1).join('.'));

export function entriesOfSection(chapter: number, section: number): Entry[] {
  const order = (e: Entry) => (e.id.startsWith('n.') ? e.page * 100 + 50 : e.page * 100 + Number(e.id.split('.')[2]));
  return allEntries()
    .filter((e) => e.chapter === chapter && e.section === section)
    .sort((a, b) => order(a) - order(b));
}

const EXERCISES: ExerciseSet[] = [...EX1, ...EX2, ...EX3];

export const allExerciseSets = (): ExerciseSet[] => EXERCISES;
export const exercisesOf = (chapter: number, section: number): ExerciseSet | undefined =>
  EXERCISES.find((x) => x.chapter === chapter && x.section === section);

/** "Exercise 4" inside Section 1.3, "Exercise 4 of Section 1.3" elsewhere (as the book refers to them). */
export function exerciseLabel(id: string, chapter?: number, section?: number): string {
  const [c, s, n] = id.split('.').map(Number);
  return `Exercise ${n}` + (c === chapter && s === section ? '' : ` of Section ${c}.${s}`);
}
