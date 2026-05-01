export interface Candlestick {
  open: number;
  high: number;
  low: number;
  close: number;
  offsetY?: number;
}

export type MarketPattern = 'Bullish Trend' | 'Bearish Trend' | 'Double Top' | 'Double Bottom' | 'Sideways';

export interface ChartSettings {
  zoom: number;
  spacing: number;
  speed: number;
  autoCenter: boolean;
}

export type DrawingTool = 'crosshair' | 'trendline' | 'rectangle' | 'brush' | 'arrow' | null;

export interface Drawing {
  id: string;
  type: DrawingTool;
  points: { x: number; y: number }[];
  color: string;
}
