import type { ObjectType } from './types';

const types = new Map<string, ObjectType>();

export function register(...ts: ObjectType[]): void {
  for (const t of ts) {
    if (types.has(t.type)) throw new Error(`duplicate object type ${t.type}`);
    types.set(t.type, t);
  }
}

export function getType(type: string): ObjectType {
  const t = types.get(type);
  if (!t) throw new Error(`unknown object type “${type}”`);
  return t;
}

export const hasType = (type: string): boolean => types.has(type);
export const allTypes = (): ObjectType[] => [...types.values()];

export interface ToolGroup {
  id: string;
  label: string;
  icon: string;
  section: string;
}

/** Toolbar groups, in display order. */
export const GROUPS: ToolGroup[] = [
  { id: 'basic', label: 'Points', icon: 'point', section: '§1.1–1.2' },
  { id: 'fields', label: 'Fields', icon: 'field', section: '§1.2–1.3, 2.5' },
  { id: 'curves', label: 'Curves', icon: 'curve', section: '§1.4, 2.2' },
  { id: 'frenet', label: 'Frenet', icon: 'frenet', section: '§2.3–2.4' },
  { id: 'forms', label: 'Forms', icon: 'form', section: '§1.5–1.6' },
  { id: 'mappings', label: 'Maps', icon: 'mapping', section: '§1.7' },
  { id: 'measure', label: 'Dot & ×', icon: 'measure', section: '§2.1' },
  { id: 'frames', label: 'Frame fields', icon: 'frames', section: '§2.6–2.8' },
  { id: 'isometries', label: 'Isometries', icon: 'isometry', section: '§3.1–3.5' },
];
