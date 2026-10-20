// Generic parameter forms built from an object type's ParamSpecs (creation dialog + Algebra editing).

import type { Scene } from '../core/scene';
import type { ObjectType, ParamSpec, ParamValue } from '../core/types';
import { escapeHtml } from './katex';

export interface FormHandle {
  el: HTMLElement;
  read(): Record<string, ParamValue>;
  focus(): void;
}

const h = <K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, html = ''): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (html) el.innerHTML = html;
  return el;
};

export function buildForm(type: ObjectType, dim: number, params: Record<string, ParamValue>, scene: Scene, self?: string): FormHandle {
  const root = h('div', { class: 'pform' });
  const specs = type.params(dim);
  const values: Record<string, ParamValue> = { ...params };
  const rows: { spec: ParamSpec; row: HTMLElement; get: () => ParamValue; set: (v: ParamValue) => void }[] = [];

  if (type.note) root.append(h('div', { class: 'pform-note' }, escapeHtml(type.note)));

  const presets = type.presets?.(dim);
  if (presets?.length) {
    const row = h('label', { class: 'pform-row' });
    row.append(h('span', { class: 'pform-label' }, 'Preset'));
    const sel = h('select');
    sel.append(h('option', { value: '' }, '— choose a preset —'));
    presets.forEach((p, i) => sel.append(h('option', { value: String(i) }, escapeHtml(p.label))));
    sel.addEventListener('change', () => {
      const p = presets[Number(sel.value)];
      if (!p) return;
      for (const [k, v] of Object.entries(p.params)) {
        values[k] = v;
        rows.find((r) => r.spec.key === k)?.set(v);
      }
      refresh();
    });
    row.append(sel);
    root.append(row);
  }

  for (const spec of specs) {
    if (spec.when && spec.when({}) === false && spec.key === 'dim') continue;
    const row = h('label', { class: `pform-row kind-${spec.kind}` });
    row.append(h('span', { class: 'pform-label' }, escapeHtml(spec.label)));
    let get: () => ParamValue;
    let set: (v: ParamValue) => void;
    const cur = values[spec.key];
    switch (spec.kind) {
      case 'bool': {
        const inp = h('input', { type: 'checkbox' });
        inp.checked = !!cur;
        inp.addEventListener('change', refresh);
        get = () => inp.checked;
        set = (v) => (inp.checked = !!v);
        row.classList.add('pform-check');
        row.prepend(inp);
        break;
      }
      case 'select': {
        const sel = h('select');
        for (const o of spec.options ?? []) sel.append(h('option', { value: o.value }, escapeHtml(o.label)));
        sel.value = String(cur ?? spec.options?.[0]?.value ?? '');
        sel.addEventListener('change', refresh);
        get = () => sel.value;
        set = (v) => (sel.value = String(v));
        row.append(sel);
        break;
      }
      case 'ref': {
        const sel = h('select');
        const fill = () => {
          sel.innerHTML = '';
          if (spec.optional) sel.append(h('option', { value: '' }, '(none)'));
          const names = scene.find(spec.accepts ?? [], spec.filter).filter((n) => n !== self);
          if (!names.length && !spec.optional) sel.append(h('option', { value: '' }, `(no ${spec.accepts?.join(' / ')} yet)`));
          for (const n of names.reverse()) sel.append(h('option', { value: n }, escapeHtml(n)));
          const c = String(values[spec.key] ?? '');
          if (c && !names.includes(c)) sel.append(h('option', { value: c }, escapeHtml(c)));
          sel.value = c;
        };
        fill();
        sel.addEventListener('change', refresh);
        get = () => sel.value;
        set = (v) => {
          values[spec.key] = v;
          fill();
        };
        row.append(sel);
        break;
      }
      case 'int': {
        const inp = h('input', { type: 'number', min: String(spec.min ?? 0), max: String(spec.max ?? 100), step: '1' });
        inp.value = String(cur ?? spec.min ?? 0);
        get = () => Math.round(Number(inp.value));
        set = (v) => (inp.value = String(v));
        row.append(inp);
        break;
      }
      case 'matrix': {
        const wrap = h('div', { class: 'pform-matrix' });
        const rowsStr = String(cur ?? '1,0,0;0,1,0;0,0,1').split(';');
        const inputs = [0, 1, 2].map((i) => {
          const inp = h('input', { type: 'text', spellcheck: 'false' });
          inp.value = (rowsStr[i] ?? '').trim();
          wrap.append(inp);
          return inp;
        });
        get = () => inputs.map((i) => i.value.trim()).join('; ');
        set = (v) => String(v).split(';').forEach((r, i) => inputs[i] && (inputs[i].value = r.trim()));
        row.append(wrap);
        break;
      }
      default: {
        const inp = h('input', { type: 'text', spellcheck: 'false', autocomplete: 'off' });
        inp.value = Array.isArray(cur) ? `(${cur.join(', ')})` : cur === undefined ? '' : String(cur);
        if (spec.kind === 'vec' && spec.size) inp.placeholder = spec.size === 2 ? '(a, b)' : spec.size === 3 ? '(a, b, c)' : '';
        if (spec.vars?.length) inp.placeholder = `in ${spec.vars.join(', ')}`;
        get = () => inp.value.trim();
        set = (v) => (inp.value = Array.isArray(v) ? `(${v.join(', ')})` : String(v));
        row.append(inp);
      }
    }
    if (spec.help) row.append(h('span', { class: 'pform-help' }, escapeHtml(spec.help)));
    rows.push({ spec, row, get, set });
    root.append(row);
  }

  function readAll(): Record<string, ParamValue> {
    const out: Record<string, ParamValue> = { ...values };
    for (const r of rows) out[r.spec.key] = r.get();
    return out;
  }

  function refresh() {
    const cur = readAll();
    for (const r of rows) {
      const visible = !r.spec.when || r.spec.when(cur);
      r.row.style.display = visible ? '' : 'none';
    }
  }
  refresh();

  return {
    el: root,
    read: readAll,
    focus: () => (root.querySelector('input[type=text], select') as HTMLElement | null)?.focus(),
  };
}
