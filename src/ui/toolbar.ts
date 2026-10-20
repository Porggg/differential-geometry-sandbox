// GeoGebra-style toolbar: Move / Point buttons and one dropdown per group of object types.

import { GROUPS, allTypes } from '../core/registry';
import { entryLabel, getEntry } from '../content';
import { ICONS } from './icons';
import { escapeHtml } from './katex';

export interface ToolbarHost {
  tool(): string;
  setTool(id: string): void;
  activeDim(): 2 | 3;
  createWithDialog(type: string): void;
}

export class Toolbar {
  readonly el: HTMLElement;
  private openMenu: HTMLElement | null = null;

  constructor(private host: ToolbarHost) {
    this.el = document.createElement('nav');
    this.el.className = 'toolbar';
    this.render();
    document.addEventListener('pointerdown', (e) => {
      if (this.openMenu && !this.el.contains(e.target as Node)) this.closeMenu();
    });
    document.addEventListener('keydown', (e) => e.key === 'Escape' && this.closeMenu());
  }

  render(): void {
    const dim = this.host.activeDim();
    const tool = this.host.tool();
    const btn = (id: string, icon: string, title: string) =>
      `<button class="tool-btn ${tool === id ? 'active' : ''}" data-tool="${id}" title="${escapeHtml(title)}">${icon}</button>`;
    const groups = GROUPS.map((g) => {
      const types = allTypes().filter((t) => t.group === g.id);
      const enabled = types.some((t) => t.dims.includes(dim));
      return `<div class="tool-group" data-group="${g.id}">
          <button class="tool-btn group ${enabled ? '' : 'dim-off'}" data-open="${g.id}" title="${escapeHtml(`${g.label} (${g.section})`)}">${ICONS[g.id] ?? ICONS.plus}<span class="tool-label">${escapeHtml(g.label)}</span><span class="caret"></span></button>
        </div>`;
    }).join('');
    this.el.innerHTML = `
      <div class="tool-fixed">
        ${btn('move', ICONS.move, 'Move: select objects, drag free points, rotate/pan the views (Esc)')}
        ${btn('point', ICONS.point, `Point: click in the ${dim === 3 ? '3D view (on the xy plane)' : '2D view'} to place a point`)}
      </div>
      <div class="tool-sep"></div>
      <div class="tool-groups">${groups}</div>`;
    this.el.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((b) => b.addEventListener('click', () => this.host.setTool(b.dataset.tool!)));
    this.el.querySelectorAll<HTMLButtonElement>('[data-open]').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = b.dataset.open!;
        if (this.openMenu?.dataset.group === id) return this.closeMenu();
        this.showMenu(id, b);
      }),
    );
  }

  private showMenu(groupId: string, anchor: HTMLElement): void {
    this.closeMenu();
    const dim = this.host.activeDim();
    const g = GROUPS.find((x) => x.id === groupId)!;
    const types = allTypes().filter((t) => t.group === groupId);
    const menu = document.createElement('div');
    menu.className = 'tool-menu';
    menu.dataset.group = groupId;
    menu.innerHTML =
      `<div class="tool-menu-head">${escapeHtml(g.label)} <span class="muted">${escapeHtml(g.section)}</span></div>` +
      types
        .map((t) => {
          const ok = t.dims.includes(dim);
          const be = t.bookRef ? getEntry(t.bookRef) : undefined;
          const ref = be ? (be.kind === 'Notion' ? `§${be.chapter}.${be.section}` : entryLabel(be.id)) : '';
          const why = ok ? '' : ` — ${t.dims.includes(3) ? '3D' : '2D'} view only`;
          return `<button class="tool-item ${ok ? '' : 'disabled'}" data-type="${t.type}" ${ok ? '' : 'aria-disabled="true"'} title="${escapeHtml(t.description + why)}">
              <span class="ti-label">${escapeHtml(t.label)}</span>
              <span class="ti-ref">${escapeHtml(ref)}${ok ? '' : `<em>${t.dims.includes(3) ? '3D only' : '2D only'}</em>`}</span>
            </button>`;
        })
        .join('');
    const r = anchor.getBoundingClientRect();
    const host = this.el.getBoundingClientRect();
    menu.style.left = `${Math.max(0, Math.min(r.left - host.left, window.innerWidth - 340 - host.left))}px`;
    this.el.append(menu);
    this.openMenu = menu;
    anchor.classList.add('open');
    menu.querySelectorAll<HTMLButtonElement>('.tool-item').forEach((b) =>
      b.addEventListener('click', () => {
        if (b.classList.contains('disabled')) return;
        this.closeMenu();
        this.host.createWithDialog(b.dataset.type!);
      }),
    );
  }

  closeMenu(): void {
    this.openMenu?.remove();
    this.openMenu = null;
    this.el.querySelectorAll('.tool-btn.open').forEach((b) => b.classList.remove('open'));
  }
}
