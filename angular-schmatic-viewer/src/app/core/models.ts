export interface Point { x: number; y: number; }
export interface Wire { points: Point[]; }
export interface SymbolInst {
  ref?: string;
  value?: string;
  libId?: string;
  x?: number;
  y?: number;
  rot?: number;
  mirror?: boolean;
  fields?: Record<string,string>;
}
export interface Label { name: string; x: number; y: number; }
export interface Sheet {
  id: string;
  title: string;
  symbols: SymbolInst[];
  wires: Wire[];
  netLabels?: Label[];
  junctions?: Point[];
}
export interface ProjectModel {
  meta: { projectName: string; units: string; };
  grid: { step: number; snap: boolean; };
  sheets: Sheet[];
  rules?: any;
}
