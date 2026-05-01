
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
  bullColor: string;
  bearColor: string;
  bodyRadius: number;
  wickRadius: number;
  volatility?: number;
}
