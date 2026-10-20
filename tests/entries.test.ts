import { describe, expect, it } from 'vitest';
import '../src/objects';
import { allEntries, hasContent } from '../src/content';
import { buildSceneSpec } from '../src/content/build';
import { Scene } from '../src/core/scene';
import { parseCommand } from '../src/core/command';
import { renderMarkdown } from '../src/ui/markdown';

const style = () => ({ color: '#000', visible: true, label: true });

describe('book entries', () => {
  const written = allEntries().filter(hasContent);
  it('has written entries', () => expect(written.length).toBeGreaterThan(5));
  for (const e of written) {
    it(`${e.id}: markdown renders`, () => {
      for (const md of [e.statement, e.proof, e.notes, ...(e.tryThis ?? [])]) if (md) expect(renderMarkdown(md)).not.toMatch(/katex-error/);
    });
    if (!e.scene) continue;
    it(`${e.id}: figure builds without errors and live checks pass`, () => {
      const s = new Scene();
      s.load(buildSceneSpec(e.scene!, style));
      for (const o of s.list()) expect(o.error, `${o.data.name}: ${o.error}`).toBeUndefined();
      for (const c of e.checks ?? []) {
        const v = c.value(s);
        expect(Math.abs(v - (c.expect ?? 0)), c.label).toBeLessThanOrEqual(c.tol ?? 1e-5);
      }
    });
  }
});

describe('command bar', () => {
  const s = new Scene();
  const run = (line: string) => {
    const pc = parseCommand(line, s, 3);
    if (pc.redefine) s.update(pc.data.name, { params: pc.data.params });
    else s.add({ ...pc.data, style: style() } as any);
    return s.get(pc.data.name)!;
  };
  it('creates curves, fields, forms, points, sliders', () => {
    expect(run('alpha(t) = (cos t, sin t, t)').value?.kind).toBe('curve');
    const V = run('V = x*y*U1 - z*U3');
    expect(V.data.type).toBe('vectorField');
    expect(V.error).toBeUndefined();
    const phi = run('phi = x^2 dx - y dz');
    expect(phi.data.type).toBe('oneForm');
    expect(phi.error).toBeUndefined();
    expect(run('p = (1, 2, 3)').value?.kind).toBe('point');
    expect(run('a = 2').value).toMatchObject({ kind: 'number', value: 2 });
    expect(run('Frenet(alpha, 1)').value?.kind).toBe('frame');
    expect(run('f(x,y,z) = x^2 + y^2').value?.kind).toBe('function');
  });
  it('redefines existing objects', () => {
    run('a = 5');
    expect(s.value('a')).toMatchObject({ value: 5 });
  });
});
