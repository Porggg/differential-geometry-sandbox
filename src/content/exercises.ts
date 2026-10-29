// Exercises at the end of each section: statements as in the book (same numbering, data and notation),
// with worked solutions.

import type { Exercise, ExerciseSet } from './types';

/** An exercise set; exercises are numbered in order. */
export const exercises = (chapter: number, section: number, page: number, items: Omit<Exercise, 'n'>[], intro?: string): ExerciseSet => ({
  chapter,
  section,
  page,
  intro,
  items: items.map((x, i) => ({ n: i + 1, ...x })),
});
