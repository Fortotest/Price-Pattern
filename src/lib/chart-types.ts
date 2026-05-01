export interface Candlestick {
  open: number;
  high: number;
  low: number;
  close: number;
  offsetY?: number; // Optional vertical shift for custom positioning
}

export type MarketPattern = 'Bullish Trend' | 'Bearish Trend' | 'Double Top' | 'Double Bottom' | 'Sideways';

export interface ChartSettings {
  zoom: number;
  spacing: number;
  speed: number; // seconds per candle
  autoCenter: boolean;
}

export interface AIGeneratorParams {
  count: number;
  pattern: MarketPattern;
  volatility: number;
}
