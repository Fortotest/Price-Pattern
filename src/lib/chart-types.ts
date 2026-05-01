export interface Candlestick {
  open: number;
  high: number;
  low: number;
  close: number;
}

export type MarketType = 'Bullish' | 'Bearish' | 'Doji';

export interface ChartSettings {
  zoom: number;
  spacing: number;
  speed: number; // seconds per candle
  autoCenter: boolean;
}