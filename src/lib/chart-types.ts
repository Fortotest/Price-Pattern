
export interface Candlestick {
  id: string;
  open: number;
  high: number;
  low: number;
  close: number;
  offsetY?: number;
}

export interface ChartSettings {
  zoom: number;
  spacing: number; 
  speed: number;
  autoCenter: boolean;
  bullColor: string;
  bearColor: string;
  bodyRadius: number;
  wickRadius: number;
}
