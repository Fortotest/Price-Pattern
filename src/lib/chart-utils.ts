import { Candlestick } from "./chart-types";

export const CANVAS_WIDTH = 3840;
export const CANVAS_HEIGHT = 2160;

export function getChartBounds(candles: Candlestick[]) {
  if (candles.length === 0) return { min: 0, max: 100 };
  let min = candles[0].low;
  let max = candles[0].high;
  candles.forEach(c => {
    if (c.low < min) min = c.low;
    if (c.high > max) max = c.high;
  });
  // Add padding
  const range = max - min;
  const padding = range * 0.2 || 10;
  return { min: min - padding, max: max + padding };
}

export function generateSVG(candles: Candlestick[]): string {
  const bounds = getChartBounds(candles);
  const range = bounds.max - bounds.min;
  const candleWidth = 40;
  const spacing = 10;
  const totalWidth = candles.length * (candleWidth + spacing);
  const height = 1000;

  const getY = (price: number) => height - ((price - bounds.min) / range) * height;

  let svgContent = `<svg width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  svgContent += `<rect width="100%" height="100%" fill="none" />`;

  candles.forEach((c, i) => {
    const x = i * (candleWidth + spacing) + spacing / 2;
    const isBullish = c.close > c.open;
    const isDoji = Math.abs(c.close - c.open) < 0.1;
    const color = isDoji ? "#888888" : isBullish ? "#61D4BD" : "#EF5350";
    
    const yOpen = getY(c.open);
    const yClose = getY(c.close);
    const yHigh = getY(c.high);
    const yLow = getY(c.low);
    const top = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(Math.abs(yOpen - yClose), 2);

    // Wick
    svgContent += `<line x1="${x + candleWidth/2}" y1="${yHigh}" x2="${x + candleWidth/2}" y2="${yLow}" stroke="${color}" stroke-width="2" />`;
    // Body
    svgContent += `<rect x="${x}" y="${top}" width="${candleWidth}" height="${bodyHeight}" fill="${color}" />`;
  });

  svgContent += `</svg>`;
  return svgContent;
}

export const TEMPLATES = {
  SNR_WAVES_BULLISH: [
    { open: 10, high: 15, low: 8, close: 12 },
    { open: 12, high: 14, low: 11, close: 13 },
    { open: 13, high: 18, low: 12, close: 17 },
    { open: 17, high: 20, low: 16, close: 15 },
    { open: 15, high: 16, low: 10, close: 11 },
    { open: 11, high: 14, low: 10, close: 13 },
    { open: 13, high: 22, low: 12, close: 20 },
    { open: 20, high: 25, low: 19, close: 24 },
  ],
  ENGULFING_BEARISH: [
    { open: 10, high: 15, low: 9, close: 14 },
    { open: 14, high: 16, low: 13, close: 15 },
    { open: 15, high: 16, low: 8, close: 9 },
    { open: 9, high: 10, low: 5, close: 6 },
  ],
  DOUBLE_BOTTOM: [
    { open: 30, high: 32, low: 20, close: 21 },
    { open: 21, high: 25, low: 20, close: 24 },
    { open: 24, high: 28, low: 24, close: 27 },
    { open: 27, high: 28, low: 20, close: 21 },
    { open: 21, high: 22, low: 19, close: 21 },
    { open: 21, high: 35, low: 21, close: 34 },
  ]
};