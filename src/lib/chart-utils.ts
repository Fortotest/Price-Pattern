
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
  // Add padding consistent with TradingView (20%)
  const range = max - min;
  const padding = range * 0.25 || 20;
  return { min: min - padding, max: max + padding };
}

export function generateSVG(candles: Candlestick[]): string {
  const bounds = getChartBounds(candles);
  const range = bounds.max - bounds.min;
  const height = 2160;
  const zoom = 1.0; 
  
  const candleWidth = (CANVAS_WIDTH / Math.max(10, candles.length)) * zoom;
  const spacing = candleWidth * 0.25;
  const realCandleWidth = candleWidth - spacing;
  const totalWidth = candles.length * candleWidth;

  const getY = (price: number) => {
    const midPrice = (bounds.max + bounds.min) / 2;
    const scaledY = ((price - midPrice) / range) * (height * 0.8);
    return (height / 2) - scaledY;
  };

  let svgContent = `<svg width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  svgContent += `<rect width="100%" height="100%" fill="#131722" />`; // Dark TradingView Background

  candles.forEach((c, i) => {
    const x = i * candleWidth + spacing / 2;
    const isBullish = c.close > c.open;
    const isDoji = Math.abs(c.close - c.open) < 0.1;
    const color = isDoji ? "#787b86" : isBullish ? "#089981" : "#f23645";
    
    const yOpen = getY(c.open) + (c.offsetY || 0);
    const yClose = getY(c.close) + (c.offsetY || 0);
    const yHigh = getY(c.high) + (c.offsetY || 0);
    const yLow = getY(c.low) + (c.offsetY || 0);
    const top = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(Math.abs(yOpen - yClose), 4);

    // Wick (Stroke width matches 4K resolution)
    svgContent += `<line x1="${x + realCandleWidth / 2}" y1="${yHigh}" x2="${x + realCandleWidth / 2}" y2="${yLow}" stroke="${color}" stroke-width="4" stroke-linecap="round" />`;
    // Body
    svgContent += `<rect x="${x}" y="${top}" width="${realCandleWidth}" height="${bodyHeight}" fill="${color}" />`;
  });

  svgContent += `</svg>`;
  return svgContent;
}

export const TEMPLATES = {
  SNR_WAVES_BULLISH: [
    { open: 100, high: 115, low: 98, close: 112 },
    { open: 112, high: 114, low: 111, close: 113 },
    { open: 113, high: 118, low: 112, close: 117 },
    { open: 117, high: 120, low: 116, close: 115 },
    { open: 115, high: 116, low: 100, close: 101 },
    { open: 101, high: 104, low: 100, close: 103 },
    { open: 103, high: 122, low: 102, close: 120 },
    { open: 120, high: 125, low: 119, close: 124 },
  ],
  ENGULFING_BEARISH: [
    { open: 100, high: 105, low: 99, close: 104 },
    { open: 104, high: 106, low: 103, close: 105 },
    { open: 105, high: 106, low: 88, close: 89 },
    { open: 89, high: 90, low: 85, close: 86 },
  ],
  DOUBLE_BOTTOM: [
    { open: 300, high: 302, low: 290, close: 291 },
    { open: 291, high: 295, low: 290, close: 294 },
    { open: 294, high: 298, low: 294, close: 297 },
    { open: 297, high: 298, low: 290, close: 291 },
    { open: 291, high: 292, low: 289, close: 291 },
    { open: 291, high: 305, low: 291, close: 304 },
  ]
};
