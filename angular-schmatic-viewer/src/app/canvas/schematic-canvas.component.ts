import { Component, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectModel, SymbolInst, Wire } from '../core/models';

@Component({
  selector: 'schematic-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schematic-canvas.component.html',
  styleUrls: ['./schematic-canvas.component.css']
})
export class SchematicCanvasComponent {
  @Input() project!: ProjectModel;
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  // ViewBox state for pan/zoom
  vb = { x: 0, y: 0, w: 200, h: 120 };
  dragging?: { sym: SymbolInst, dx: number, dy: number };
  panning = false;
  panStart = { x: 0, y: 0, vx: 0, vy: 0 };

  ngOnInit() {
    // Fit content roughly
    const sheet = this.project.sheets[0];
    const xs = sheet.symbols.map(s => s.x || 0).concat(sheet.wires.flatMap(w => w.points.map(p=>p.x)));
    const ys = sheet.symbols.map(s => s.y || 0).concat(sheet.wires.flatMap(w => w.points.map(p=>p.y)));
    const minx = Math.min(...xs, 0) - 20;
    const maxx = Math.max(...xs, 200) + 20;
    const miny = Math.min(...ys, 0) - 20;
    const maxy = Math.max(...ys, 100) + 20;
    this.vb = { x: minx, y: miny, w: maxx-minx, h: maxy-miny };
  }

  // Map mouse to SVG coords
  toSvg(evt: MouseEvent) {
    const svg = this.svgRef.nativeElement;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const inv = m.inverse();
    const p = pt.matrixTransform(inv);
    return { x: p.x, y: p.y };
  }

  wheel(evt: WheelEvent) {
    evt.preventDefault();
    const factor = Math.pow(1.0015, evt.deltaY);
    const mouse = this.toSvg(evt as any);
    // zoom around mouse
    this.vb.x = mouse.x - (mouse.x - this.vb.x) * factor;
    this.vb.y = mouse.y - (mouse.y - this.vb.y) * factor;
    this.vb.w *= factor; this.vb.h *= factor;
  }

  mousedown(evt: MouseEvent) {
    if (evt.button === 2) { // right button = pan
      this.panning = true;
      this.panStart = { x: evt.clientX, y: evt.clientY, vx: this.vb.x, vy: this.vb.y };
    }
  }
  mousemove(evt: MouseEvent) {
    if (this.panning) {
      const dx = (evt.clientX - this.panStart.x) * (this.vb.w / this.svgRef.nativeElement.clientWidth);
      const dy = (evt.clientY - this.panStart.y) * (this.vb.h / this.svgRef.nativeElement.clientHeight);
      this.vb.x = this.panStart.vx - dx;
      this.vb.y = this.panStart.vy - dy;
    }
  }
  mouseup(evt: MouseEvent) {
    this.panning = false;
  }
  contextmenu(evt: MouseEvent) { evt.preventDefault(); }

  startDrag(sym: SymbolInst, evt: MouseEvent) {
    const p = this.toSvg(evt);
    this.dragging = { sym, dx: (sym.x||0) - p.x, dy: (sym.y||0) - p.y };
    evt.stopPropagation();
  }
  dragMove(evt: MouseEvent) {
    if (!this.dragging) return;
    const p = this.toSvg(evt);
    this.dragging.sym.x = p.x + this.dragging.dx;
    this.dragging.sym.y = p.y + this.dragging.dy;
  }
  endDrag() { this.dragging = undefined; }

  wirePath(w: Wire) {
    return w.points.map((p,i)=> (i===0? 'M':'L') + p.x + ' ' + p.y).join(' ');
  }
}
