// The 3D graphics view (three.js). Z axis up, as in the book's figures.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import type { SceneObj } from '../core/scene';
import type { ArrowItem, Value } from '../core/types';
import { isosurface } from '../math/isosurface';
import { linspace } from '../math/numeric';
import { norm, type Vec } from '../math/vec';
import { texToHtml } from '../ui/katex';
import { cssVar, type GraphicsView, type ViewHost } from './host';

const FRAME_COLORS = ['#d1242f', '#1a7f37', '#0550ae'];
const UP = new THREE.Vector3(0, 1, 0);

const v3 = (p: Vec): THREE.Vector3 => new THREE.Vector3(p[0], p[1], p[2] ?? 0);

export class View3D implements GraphicsView {
  readonly el: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private labels: CSS2DRenderer;
  private scene3 = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private world = new THREE.Group();
  private axes = new THREE.Group();
  private nodes = new Map<string, THREE.Group>();
  private lineMaterials = new Set<LineMaterial>();
  private needsRender = true;
  private selection: string | null = null;
  private shaftGeo = new THREE.CylinderGeometry(1, 1, 1, 12, 1).translate(0, 0.5, 0);
  private headGeo = new THREE.ConeGeometry(1, 1, 18, 1).translate(0, 0.5, 0);
  private sphereGeo = new THREE.SphereGeometry(1, 20, 14);
  private extent = 4;
  private drag: { name: string; plane: THREE.Plane; offset: THREE.Vector3 } | null = null;
  private curveDrag: { name: string; curve: string } | null = null;
  private downAt: { x: number; y: number } | null = null;
  private raf = 0;

  constructor(container: HTMLElement, private host: ViewHost) {
    this.el = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);
    this.labels = new CSS2DRenderer();
    this.labels.domElement.className = 'labels3d';
    container.appendChild(this.labels.domElement);

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 500);
    this.camera.up.set(0, 0, 1);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.addEventListener('change', () => (this.needsRender = true));
    this.resetView();

    this.scene3.add(new THREE.HemisphereLight(0xffffff, 0x888899, 1.6));
    const dl = new THREE.DirectionalLight(0xffffff, 1.4);
    dl.position.set(5, -4, 10);
    this.scene3.add(dl);
    const dl2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dl2.position.set(-6, 5, -3);
    this.scene3.add(dl2);
    this.scene3.add(this.axes, this.world);
    this.buildAxes();
    this.applyTheme();

    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', (e) => this.onDown(e));
    dom.addEventListener('pointermove', (e) => this.onMove(e));
    dom.addEventListener('pointerup', (e) => this.onUp(e));
    dom.addEventListener('pointerleave', () => this.endDrag());
    container.addEventListener('pointerdown', () => host.activate(3), true);

    new ResizeObserver(() => this.resize()).observe(container);
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      if (this.controls.update()) this.needsRender = true;
      if (this.needsRender && this.el.offsetWidth > 0) {
        this.needsRender = false;
        this.renderer.render(this.scene3, this.camera);
        this.labels.render(this.scene3, this.camera);
      }
    };
    loop();
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
  }

  /** Frame the visible objects (and the origin), from the default viewing direction. */
  resetView(): void {
    const box = new THREE.Box3();
    this.world.updateMatrixWorld(true);
    this.world.traverse((o) => {
      if (o instanceof CSS2DObject) return;
      const geo = (o as THREE.Mesh).geometry as THREE.BufferGeometry | undefined;
      if (geo) {
        // LineGeometry / InstancedMesh compute their real bounding boxes themselves (not from 'position').
        if (o instanceof THREE.InstancedMesh) o.computeBoundingBox();
        else geo.computeBoundingBox();
        const local = o instanceof THREE.InstancedMesh ? o.boundingBox : geo.boundingBox;
        if (!local) return;
        const b = local.clone().applyMatrix4(o.matrixWorld);
        if (Number.isFinite(b.min.x) && Number.isFinite(b.max.x) && b.max.length() < 1e4) box.union(b);
      }
    });
    box.expandByPoint(new THREE.Vector3(-1.5, -1.5, -1.5)).expandByPoint(new THREE.Vector3(1.5, 1.5, 1.5));
    const center = box.getCenter(new THREE.Vector3());
    const radius = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 2);
    const extent = Math.min(12, Math.max(3, Math.ceil(Math.max(...box.min.toArray().map(Math.abs), ...box.max.toArray().map(Math.abs)) * 0.9)));
    if (extent !== this.extent) {
      this.extent = extent;
      this.buildAxes();
    }
    const aspect = this.camera.aspect || 1;
    const vfov = (this.camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const dist = (radius * 1.08) / Math.sin(Math.min(vfov, hfov) / 2);
    const dir = new THREE.Vector3(9, 5.5, 6.2).normalize();
    this.controls.target.copy(center);
    this.camera.position.copy(center.clone().add(dir.multiplyScalar(dist)));
    this.camera.near = Math.max(0.01, dist / 200);
    this.camera.far = dist * 20;
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.needsRender = true;
  }

  /** Fit after the layout has settled (two frames). */
  fitSoon(): void {
    setTimeout(() => {
      this.resize();
      this.resetView();
    }, 60);
  }

  resize(): void {
    const w = this.el.clientWidth;
    const h = this.el.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = `${w}px`;
    this.renderer.domElement.style.height = `${h}px`;
    this.labels.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    for (const m of this.lineMaterials) m.resolution.set(w, h);
    this.needsRender = true;
  }

  applyTheme(): void {
    this.scene3.background = new THREE.Color(cssVar('--view-bg', '#ffffff'));
    this.buildAxes();
    this.needsRender = true;
  }

  // -------------------------------------------------------------------------------------------
  // Axes and grid

  private buildAxes(): void {
    this.clearGroup(this.axes);
    const L = this.extent;
    const axisColor = cssVar('--axis', '#444');
    const gridColor = cssVar('--grid', '#ddd');
    const grid = new THREE.GridHelper(2 * L, 2 * L, new THREE.Color(gridColor), new THREE.Color(gridColor));
    grid.rotation.x = Math.PI / 2;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.7;
    this.axes.add(grid);
    const names = ['x', 'y', 'z'];
    for (let i = 0; i < 3; i++) {
      const dir = [0, 0, 0];
      dir[i] = 1;
      const from = dir.map((x) => -x * L);
      const to = dir.map((x) => x * (L + 0.4));
      this.axes.add(this.makeLine([from, to], axisColor, 1.4));
      const head = this.makeArrowMesh(to, dir.map((x) => x * 0.001), axisColor, { headOnly: true });
      this.axes.add(head);
      const lab = this.makeLabel(names[i], 'axis-label');
      lab.position.copy(v3(dir.map((x) => x * (L + 0.75))));
      this.axes.add(lab);
      for (let k = -L; k <= L; k++) {
        if (k === 0) continue;
        const pos = dir.map((x) => x * k);
        const t = this.makeLabel(String(k), 'tick-label', false);
        t.position.copy(v3(pos));
        this.axes.add(t);
      }
    }
    const o = this.makeLabel('0', 'tick-label', false);
    this.axes.add(o);
  }

  // -------------------------------------------------------------------------------------------
  // Sync with the scene model

  sync(names: Set<string> | 'all'): void {
    const scene = this.host.scene;
    if (names === 'all') {
      for (const [n, g] of this.nodes) {
        this.world.remove(g);
        this.disposeGroup(g);
        this.nodes.delete(n);
      }
      for (const o of scene.list()) this.build(o);
    } else {
      for (const n of names) {
        const old = this.nodes.get(n);
        if (old) {
          this.world.remove(old);
          this.disposeGroup(old);
          this.nodes.delete(n);
        }
        const o = scene.get(n);
        if (o) this.build(o);
      }
      // arc-length highlights depend on curves drawn elsewhere: rebuild them if their curve changed
      for (const o of scene.list()) {
        if (o.data.type === 'arcLength' && !names.has(o.data.name) && names.has(String(o.data.params.curve))) {
          const old = this.nodes.get(o.data.name);
          if (old) {
            this.world.remove(old);
            this.disposeGroup(old);
            this.nodes.delete(o.data.name);
          }
          this.build(o);
        }
      }
    }
    this.needsRender = true;
  }

  setSelection(name: string | null): void {
    const prev = this.selection;
    this.selection = name;
    const s = new Set<string>();
    if (prev) s.add(prev);
    if (name) s.add(name);
    this.sync(s);
  }

  private build(o: SceneObj): void {
    const v = o.value;
    if (!v || !o.data.style.visible) return;
    const g = new THREE.Group();
    g.userData.name = o.data.name;
    const sel = this.selection === o.data.name;
    const color = o.data.style.color;
    const caption = o.data.style.label ? this.host.scene.captionOf(o.data.name) : '';
    const ok = this.draw(g, v, color, sel, caption, o);
    if (!ok) return;
    g.traverse((c) => (c.userData.name = o.data.name));
    this.nodes.set(o.data.name, g);
    this.world.add(g);
  }

  /** Returns false when the value has nothing to draw in 3D. */
  private draw(g: THREE.Group, v: Value, color: string, sel: boolean, caption: string, o: SceneObj): boolean {
    const lw = sel ? 4.5 : 2.6;
    switch (v.kind) {
      case 'point': {
        if (v.p.length !== 3) return false;
        const r = sel ? 0.11 : 0.085;
        const m = new THREE.Mesh(this.sphereGeo, this.mat(color, sel));
        m.scale.setScalar(r);
        m.position.copy(v3(v.p));
        g.add(m);
        if (caption) this.addLabel(g, caption, v.p, [0.15, 0.15, 0.15]);
        return true;
      }
      case 'vector': {
        if (v.p.length !== 3) return false;
        g.add(this.makeArrowMesh(v.p, v.v, color, { sel }));
        if (norm(v.v) < 1e-12) g.add(this.dot(v.p, color, 0.06));
        if (caption) this.addLabel(g, caption, v.p.map((x, i) => x + v.v[i]), [0.12, 0.12, 0.12]);
        return true;
      }
      case 'vectors': {
        if (!v.items.length || v.items[0].p.length !== 3) return false;
        if (v.items.length > 40) g.add(this.arrowBatch(v.items, color, sel));
        else for (const it of v.items) g.add(this.makeArrowMesh(it.p, it.v, it.color ?? color, { sel, dashed: v.dashed }));
        if (caption && v.items.length > 0 && !v.dashed) {
          const it = v.items[Math.floor(v.items.length / 2)];
          this.addLabel(g, caption, it.p.map((x, i) => x + it.v[i]), [0.1, 0.1, 0.1]);
        }
        if (v.dashed) v.items.forEach((it) => it.label && this.addLabel(g, it.label, it.p.map((x, i) => x + it.v[i]), [0.08, 0.08, 0.08], 'small'));
        return true;
      }
      case 'frame': {
        v.e.forEach((e, i) => {
          g.add(this.makeArrowMesh(v.p, e, FRAME_COLORS[i], { sel }));
          if (o.data.style.label) this.addLabel(g, v.labels[i], v.p.map((x, k) => x + e[k] * 1.12), [0, 0, 0]);
        });
        g.add(this.dot(v.p, color, 0.06));
        return true;
      }
      case 'frames': {
        for (let i = 0; i < 3; i++) {
          const items: ArrowItem[] = v.frames.map((f) => ({ p: f.p, v: f.e[i].map((x) => x * 0.6) }));
          g.add(this.arrowBatch(items, FRAME_COLORS[i], sel, 0.75));
        }
        return true;
      }
      case 'curve': {
        if (v.dim !== 3) return false;
        const pts = sampleCurve(v.f, v.a, v.b, 700);
        g.add(this.makeLine(pts, color, lw));
        if (v.ticks && v.ticks > 0) {
          for (const t of linspace(v.a, v.b, v.ticks + 1)) {
            const p = v.f(t);
            if (p.every(Number.isFinite)) g.add(this.dot(p, color, 0.045));
          }
        }
        if (caption) {
          const tm = v.a + 0.62 * (v.b - v.a);
          this.addLabel(g, caption, v.f(tm), [0.15, 0.15, 0.2]);
        }
        return true;
      }
      case 'number': {
        const hl = v.extra?.highlight as { curve: string; a: number; b: number } | undefined;
        if (!hl) return false;
        const c = this.host.scene.value(hl.curve);
        if (!c || c.kind !== 'curve' || c.dim !== 3) return false;
        g.add(this.makeLine(sampleCurve(c.f, hl.a, hl.b, 400), color, lw + 3.5, 0.8));
        return true;
      }
      case 'segment': {
        if (v.p.length !== 3) return false;
        g.add(this.makeLine([v.p, v.q], color, lw, 1, true));
        if (caption) this.addLabel(g, caption, v.p.map((x, i) => (x + v.q[i]) / 2), [0.1, 0.1, 0.1]);
        return true;
      }
      case 'field': {
        if (v.dim !== 3) return false;
        const items: ArrowItem[] = [];
        const n = Math.max(2, v.n);
        for (const x of linspace(-v.box, v.box, n))
          for (const y of linspace(-v.box, v.box, n))
            for (const z of linspace(-v.box, v.box, n)) {
              const w = v.f([x, y, z]);
              if (w.every(Number.isFinite)) items.push({ p: [x, y, z], v: w.map((c) => c * v.scale) });
            }
        g.add(this.arrowBatch(items, color, sel, 0.8));
        return true;
      }
      case 'function': {
        if (v.dim !== 3 || !v.levels.length) return false;
        const f3 = (x: number, y: number, z: number) => v.f([x, y, z]);
        v.levels.forEach((c, i) => {
          const mesh = isosurface(f3, c, [-v.box, v.box], v.res);
          if (!mesh.positions.length) return;
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3));
          geo.setAttribute('normal', new THREE.BufferAttribute(gradientNormals(mesh.positions, f3), 3));
          const mat = new THREE.MeshPhongMaterial({
            color: shade(color, i, v.levels.length),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: o.data.style.opacity ?? (sel ? 0.75 : 0.55),
            depthWrite: false,
            shininess: 30,
          });
          g.add(new THREE.Mesh(geo, mat));
        });
        if (caption) this.addLabel(g, caption, [v.box, v.box, v.box], [0, 0, 0]);
        return true;
      }
      case 'mapping': {
        if (v.n !== 3) return false;
        const shift = (x: Vec) => x.map((xi, i) => xi + v.center[i]);
        const segs = gridImageSegments((x) => v.f(shift(x)), v.box, v.lines, 36);
        g.add(this.makeSegments(segs, color, sel ? 2.4 : 1.6, 0.9));
        if (v.showDomain) g.add(this.makeSegments(gridImageSegments(shift, v.box, v.lines, 2), cssVar('--muted', '#999'), 1, 0.35));
        return true;
      }
      case 'framefield': {
        const n = Math.max(1, v.n);
        const pts = n === 1 ? [0] : linspace(-v.box, v.box, n);
        const by: ArrowItem[][] = [[], [], []];
        for (const x of pts)
          for (const y of pts)
            for (const z of pts) {
              const e = v.E([x, y, z]);
              if (e.some((w) => !w.every(Number.isFinite))) continue;
              e.forEach((w, i) => by[i].push({ p: [x, y, z], v: w.map((c) => c * 0.55) }));
            }
        by.forEach((items, i) => items.length && g.add(this.arrowBatch(items, FRAME_COLORS[i], sel, 0.7)));
        return true;
      }
      case 'plane': {
        const s = v.size;
        const corners = [
          [-s, -s], [s, -s], [s, s], [-s, s],
        ].map(([a, b]) => v.p.map((x, i) => x + a * v.u[i] + b * v.v[i]));
        const geo = new THREE.BufferGeometry().setFromPoints(corners.map(v3));
        geo.setIndex([0, 1, 2, 0, 2, 3]);
        geo.computeVertexNormals();
        g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })));
        g.add(this.makeLine([...corners, corners[0]], color, 1.2, 0.7));
        return true;
      }
      case 'circle': {
        const pts = linspace(0, 2 * Math.PI, 160).map((th) => v.c.map((x, i) => x + v.r * (Math.cos(th) * v.u[i] + Math.sin(th) * v.v[i])));
        g.add(this.makeLine(pts, color, lw));
        g.add(this.dot(v.c, color, 0.05));
        return true;
      }
      default:
        return false;
    }
  }

  // -------------------------------------------------------------------------------------------
  // Primitives

  private mat(color: string, sel = false): THREE.Material {
    const c = new THREE.Color(color);
    return new THREE.MeshPhongMaterial({ color: c, emissive: sel ? c.clone().multiplyScalar(0.35) : new THREE.Color(0x000000), shininess: 60 });
  }

  private dot(p: Vec, color: string, r: number): THREE.Mesh {
    const m = new THREE.Mesh(this.sphereGeo, this.mat(color));
    m.scale.setScalar(r);
    m.position.copy(v3(p));
    return m;
  }

  private makeArrowMesh(p: Vec, v: Vec, color: string, opts: { sel?: boolean; headOnly?: boolean; dashed?: boolean } = {}): THREE.Group {
    const g = new THREE.Group();
    const len = norm(v);
    if (len < 1e-12) return g;
    const dir = v3(v).normalize();
    const headLen = Math.min(0.24, len * 0.35);
    const headR = headLen * 0.38;
    const shaftR = opts.sel ? 0.028 : 0.018;
    const material = this.mat(color, opts.sel);
    if (opts.dashed) (material as THREE.MeshPhongMaterial).transparent = true;
    if (opts.dashed) (material as THREE.MeshPhongMaterial).opacity = 0.75;
    if (!opts.headOnly) {
      const shaft = new THREE.Mesh(this.shaftGeo, material);
      shaft.scale.set(opts.dashed ? shaftR * 0.7 : shaftR, Math.max(len - headLen, 0), opts.dashed ? shaftR * 0.7 : shaftR);
      g.add(shaft);
    }
    const head = new THREE.Mesh(this.headGeo, material);
    head.scale.set(opts.headOnly ? 0.07 : headR, opts.headOnly ? 0.22 : headLen, opts.headOnly ? 0.07 : headR);
    head.position.y = opts.headOnly ? -0.22 : len - headLen;
    g.add(head);
    g.quaternion.setFromUnitVectors(UP, dir);
    g.position.copy(v3(p));
    return g;
  }

  /** Many arrows as two instanced meshes. */
  private arrowBatch(items: ArrowItem[], color: string, sel: boolean, sizeFactor = 1): THREE.Group {
    const g = new THREE.Group();
    const ok = items.filter((it) => norm(it.v) > 1e-9 && it.v.every(Number.isFinite) && it.p.every(Number.isFinite));
    if (!ok.length) return g;
    const material = this.mat(color, sel);
    const shafts = new THREE.InstancedMesh(this.shaftGeo, material, ok.length);
    const heads = new THREE.InstancedMesh(this.headGeo, material, ok.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const pos = new THREE.Vector3();
    ok.forEach((it, i) => {
      const len = norm(it.v);
      const dir = v3(it.v).normalize();
      q.setFromUnitVectors(UP, dir);
      const headLen = Math.min(0.2 * sizeFactor, len * 0.35);
      const headR = headLen * 0.38;
      const shaftR = 0.014 * sizeFactor;
      pos.copy(v3(it.p));
      s.set(shaftR, Math.max(len - headLen, 1e-4), shaftR);
      m.compose(pos, q, s);
      shafts.setMatrixAt(i, m);
      const hp = pos.clone().add(dir.clone().multiplyScalar(len - headLen));
      s.set(headR, headLen, headR);
      m.compose(hp, q, s);
      heads.setMatrixAt(i, m);
    });
    shafts.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
    g.add(shafts, heads);
    return g;
  }

  private makeLine(points: Vec[], color: string, width: number, opacity = 1, dashed = false): THREE.Object3D {
    const flat: number[] = [];
    const g = new THREE.Group();
    let run: number[] = [];
    const flush = () => {
      if (run.length >= 6) {
        const geo = new LineGeometry();
        geo.setPositions(run);
        const line = new Line2(geo, this.lineMat(color, width, opacity, dashed));
        if (dashed) line.computeLineDistances();
        g.add(line);
      }
      run = [];
    };
    for (const p of points) {
      if (p.every(Number.isFinite) && p.every((x) => Math.abs(x) < 1e4)) run.push(p[0], p[1], p[2] ?? 0);
      else flush();
    }
    flush();
    void flat;
    return g;
  }

  private makeSegments(segs: number[], color: string, width: number, opacity = 1): THREE.Object3D {
    const geo = new LineSegmentsGeometry();
    geo.setPositions(segs);
    return new LineSegments2(geo, this.lineMat(color, width, opacity, false));
  }

  private lineMat(color: string, width: number, opacity: number, dashed: boolean): LineMaterial {
    const m = new LineMaterial({
      color: new THREE.Color(color).getHex(),
      linewidth: width,
      transparent: opacity < 1,
      opacity,
      dashed,
      dashSize: 0.12,
      gapSize: 0.08,
    });
    m.resolution.set(this.el.clientWidth || 800, this.el.clientHeight || 600);
    this.lineMaterials.add(m);
    return m;
  }

  private makeLabel(tex: string, cls = 'obj-label', math = true): CSS2DObject {
    const div = document.createElement('div');
    div.className = cls;
    div.innerHTML = math ? texToHtml(tex) : tex;
    return new CSS2DObject(div);
  }

  private addLabel(g: THREE.Group, tex: string, at: Vec, offset: Vec, cls = ''): void {
    if (!at.every(Number.isFinite)) return;
    const l = this.makeLabel(tex, `obj-label ${cls}`);
    l.position.copy(v3(at.map((x, i) => x + offset[i])));
    g.add(l);
  }

  private clearGroup(g: THREE.Group): void {
    for (const c of [...g.children]) {
      g.remove(c);
      this.disposeObject(c);
    }
  }

  private disposeGroup(g: THREE.Group): void {
    this.clearGroup(g);
  }

  private disposeObject(o: THREE.Object3D): void {
    o.traverse((c: any) => {
      if (c instanceof CSS2DObject) c.element.remove();
      if (c.geometry && c.geometry !== this.shaftGeo && c.geometry !== this.headGeo && c.geometry !== this.sphereGeo) c.geometry.dispose?.();
      if (c.material) {
        const ms = Array.isArray(c.material) ? c.material : [c.material];
        ms.forEach((m: THREE.Material) => {
          if (m instanceof LineMaterial) this.lineMaterials.delete(m);
          m.dispose();
        });
      }
    });
  }

  // -------------------------------------------------------------------------------------------
  // Interaction

  private ndc(e: PointerEvent): THREE.Vector2 {
    const r = this.renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }

  private pick(e: PointerEvent): string | null {
    const ray = new THREE.Raycaster();
    ray.setFromCamera(this.ndc(e), this.camera);
    (ray.params as any).Line2 = { threshold: 6 };
    ray.params.Line = { threshold: 0.05 };
    const hits = ray.intersectObjects(this.world.children, true);
    // prefer points
    const pts = hits.find((h) => h.object instanceof THREE.Mesh && (h.object as THREE.Mesh).geometry === this.sphereGeo);
    const h = pts ?? hits[0];
    return h ? (h.object.userData.name as string) ?? null : null;
  }

  private onDown(e: PointerEvent): void {
    this.downAt = { x: e.clientX, y: e.clientY };
    const tool = this.host.tool();
    if (tool === 'move') {
      const name = this.pick(e);
      const curve = name && !this.host.isDraggable(name) ? this.host.curveHandle(name) : null;
      if (name && curve) {
        this.curveDrag = { name, curve };
        this.controls.enabled = false;
        this.host.select(name);
        this.renderer.domElement.setPointerCapture(e.pointerId);
        return;
      }
      if (name && this.host.isDraggable(name)) {
        const v = this.host.scene.value(name);
        if (v?.kind === 'point' && v.p.length === 3) {
          const p = v3(v.p);
          const plane = e.shiftKey
            ? new THREE.Plane().setFromNormalAndCoplanarPoint(
                new THREE.Vector3().subVectors(this.camera.position, p).setZ(0).normalize(),
                p,
              )
            : new THREE.Plane(new THREE.Vector3(0, 0, 1), -p.z);
          const hit = this.planeHit(e, plane);
          this.drag = { name, plane, offset: hit ? p.clone().sub(hit) : new THREE.Vector3() };
          this.controls.enabled = false;
          this.host.select(name);
          this.renderer.domElement.setPointerCapture(e.pointerId);
        }
      }
    }
  }

  private planeHit(e: PointerEvent, plane: THREE.Plane): THREE.Vector3 | null {
    const ray = new THREE.Raycaster();
    ray.setFromCamera(this.ndc(e), this.camera);
    const out = new THREE.Vector3();
    return ray.ray.intersectPlane(plane, out) ? out : null;
  }

  private onMove(e: PointerEvent): void {
    if (this.curveDrag) {
      const c = this.host.scene.value(this.curveDrag.curve);
      if (c?.kind === 'curve') {
        const t = this.nearestParam(e, c.f, c.a, c.b);
        if (t !== null) this.host.dragCurveParam(this.curveDrag.name, t);
      }
      return;
    }
    if (!this.drag) return;
    const hit = this.planeHit(e, this.drag.plane);
    if (!hit) return;
    const p = hit.add(this.drag.offset);
    const round = (x: number) => Math.round(x * 20) / 20;
    this.host.dragPoint(this.drag.name, [round(p.x), round(p.y), round(p.z)]);
  }

  private onUp(e: PointerEvent): void {
    const wasDrag = !!this.drag || !!this.curveDrag;
    this.endDrag();
    const moved = this.downAt && Math.hypot(e.clientX - this.downAt.x, e.clientY - this.downAt.y) > 4;
    this.downAt = null;
    if (wasDrag || moved) return;
    const tool = this.host.tool();
    if (tool === 'point') {
      const hit = this.planeHit(e, new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
      if (hit) {
        const r = (x: number) => Math.round(x * 10) / 10;
        this.host.placePoint([r(hit.x), r(hit.y), 0]);
      }
      return;
    }
    this.host.select(this.pick(e));
  }

  /** Parameter of the curve point closest (on screen) to the mouse. */
  private nearestParam(e: PointerEvent, f: (t: number) => Vec, a: number, b: number): number | null {
    const r = this.renderer.domElement.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const proj = (t: number): number => {
      const p = f(t);
      if (!p.every(Number.isFinite)) return Infinity;
      const v = v3(p).project(this.camera);
      if (v.z > 1) return Infinity;
      const x = ((v.x + 1) / 2) * r.width;
      const y = ((1 - v.y) / 2) * r.height;
      return (x - mx) ** 2 + (y - my) ** 2;
    };
    const N = 800;
    let best = -1;
    let bd = Infinity;
    for (let i = 0; i <= N; i++) {
      const d = proj(a + ((b - a) * i) / N);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    if (best < 0) return null;
    // refine between the neighbouring samples
    let lo = a + ((b - a) * Math.max(0, best - 1)) / N;
    let hi = a + ((b - a) * Math.min(N, best + 1)) / N;
    for (let k = 0; k < 30; k++) {
      const m1 = lo + (hi - lo) / 3;
      const m2 = hi - (hi - lo) / 3;
      if (proj(m1) < proj(m2)) hi = m2;
      else lo = m1;
    }
    return (lo + hi) / 2;
  }

  private endDrag(): void {
    if (this.curveDrag) {
      this.curveDrag = null;
      this.controls.enabled = true;
      this.host.endDrag();
    }
    if (this.drag) {
      this.drag = null;
      this.controls.enabled = true;
      this.host.endDrag();
    }
  }
}

// ---------------------------------------------------------------------------------------------

function sampleCurve(f: (t: number) => Vec, a: number, b: number, n: number): Vec[] {
  return linspace(a, b, n).map((t) => {
    try {
      return f(t);
    } catch {
      return [NaN, NaN, NaN];
    }
  });
}

function gradientNormals(pos: Float32Array, f: (x: number, y: number, z: number) => number): Float32Array {
  const out = new Float32Array(pos.length);
  const h = 1e-3;
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i];
    const y = pos[i + 1];
    const z = pos[i + 2];
    let gx = (f(x + h, y, z) - f(x - h, y, z)) / (2 * h);
    let gy = (f(x, y + h, z) - f(x, y - h, z)) / (2 * h);
    let gz = (f(x, y, z + h) - f(x, y, z - h)) / (2 * h);
    const n = Math.hypot(gx, gy, gz) || 1;
    gx /= n;
    gy /= n;
    gz /= n;
    out[i] = gx;
    out[i + 1] = gy;
    out[i + 2] = gz;
  }
  return out;
}

/** Image under F of the coordinate grid lines of [-R, R]^3. */
function gridImageSegments(F: (x: Vec) => Vec, R: number, lines: number, samples: number): number[] {
  const out: number[] = [];
  const ticks = linspace(-R, R, Math.max(2, lines));
  const ss = linspace(-R, R, samples + 1);
  for (let axis = 0; axis < 3; axis++)
    for (const a of ticks)
      for (const b of ticks) {
        let prev: Vec | null = null;
        for (const s of ss) {
          const p = [0, 0, 0];
          p[axis] = s;
          p[(axis + 1) % 3] = a;
          p[(axis + 2) % 3] = b;
          const q = F(p);
          if (!q.every(Number.isFinite)) {
            prev = null;
            continue;
          }
          if (prev) out.push(prev[0], prev[1], prev[2], q[0], q[1], q[2]);
          prev = q;
        }
      }
  return out;
}

function shade(color: string, i: number, n: number): THREE.Color {
  const c = new THREE.Color(color);
  if (n <= 1) return c;
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  return new THREE.Color().setHSL((hsl.h + (i / n) * 0.18) % 1, hsl.s, Math.min(0.75, hsl.l + (i / n) * 0.15));
}

