import type { Scene } from '../core/scene';
import type { ParamValue, Style } from '../core/types';

export type EntryKind = 'Definition' | 'Theorem' | 'Lemma' | 'Corollary' | 'Proposition' | 'Example' | 'Remark' | 'Notion';

export interface Check {
  /** TeX label, e.g. "\\lVert T' - \\kappa N \\rVert". */
  label: string;
  /** Computes the quantity from the current scene (throw if undefined). */
  value: (scene: Scene) => number;
  /** Expected value (default 0). */
  expect?: number;
  tol?: number;
}

export interface SceneSpec {
  /** Which graphics views the entry wants visible. */
  views: ('2d' | '3d')[];
  build: (b: Builder) => void;
  /** Object to select after loading. */
  select?: string;
}

export interface Entry {
  /** "2.3.2" for numbered items, "n.slug" for notions defined in the text. */
  id: string;
  chapter: number;
  section: number;
  kind: EntryKind;
  /** Short descriptive title used in the table of contents. */
  title: string;
  /** Name the book itself gives, e.g. "Frenet formulas". */
  bookName?: string;
  /** Page in the book (Revised 2nd edition). */
  page: number;
  /** Statement (Markdown with $TeX$, [[id]] links). */
  statement?: string;
  /** Proof, following the book's structure. */
  proof?: string;
  /** Explanation / what to look at in the sandbox. */
  notes?: string;
  /** Suggested experiments in the sandbox. */
  tryThis?: string[];
  scene?: SceneSpec;
  checks?: Check[];
}

export interface Section {
  chapter: number;
  section: number;
  title: string;
  page: number;
}

export interface Chapter {
  chapter: number;
  title: string;
  page: number;
  /** Opening paragraphs of the chapter (Markdown). */
  intro?: string;
}

export interface Builder {
  slider(name: string, value: number, min: number, max: number, step?: number, style?: Partial<Style>): void;
  add(type: string, name: string, params: Record<string, ParamValue>, style?: Partial<Style>): void;
}
