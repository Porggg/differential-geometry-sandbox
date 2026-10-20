// Turns an entry's SceneSpec into object definitions (pure: used by the app and the tests).

import { getType } from '../core/registry';
import type { ObjData, ParamValue, Style } from '../core/types';
import { splitTuple } from '../math/expr';
import type { Builder, SceneSpec } from './types';

export function buildSceneSpec(spec: SceneSpec, styleFor: (type: string) => Style): ObjData[] {
  const out: ObjData[] = [];
  const nums = new Set<string>();
  const b: Builder = {
    slider: (name, value, min, max, step = 0.01, style) => {
      out.push({ name, type: 'slider', params: { value, min, max, step }, style: { ...styleFor('slider'), ...(style ?? {}) } });
      nums.add(name);
    },
    add: (type, name, params, style) => {
      const t = getType(type);
      let dim = Number(params.dim ?? 0);
      if (!dim) dim = t.dims.length === 1 ? t.dims[0] : guessDim(params);
      const defaults = t.defaults(dim, { find: () => [], hasNumber: (n) => nums.has(n) });
      const full: Record<string, ParamValue> = { ...defaults, ...params };
      if (t.dims.length > 1) full.dim = dim;
      out.push({ name, type, params: full, style: { ...styleFor(type), ...(style ?? {}) } });
      if (type === 'slider') nums.add(name);
    },
  };
  spec.build(b);
  return out;
}

function guessDim(params: Record<string, ParamValue>): number {
  for (const k of ['coords', 'comps', 'v']) {
    const v = params[k];
    if (typeof v === 'string' && v.trim().startsWith('(')) return splitTuple(v).length === 2 ? 2 : 3;
  }
  return 3;
}
