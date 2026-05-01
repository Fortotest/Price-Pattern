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
  const range = max - min;
  const padding = range * 0.25 || 100;
  return { min: min - padding, max: max + padding };
}

export function generateSVG(candles: Candlestick[]): string {
  const bounds = getChartBounds(candles);
  const range = bounds.max - bounds.min;
  const height = 2160;
  const width = 3840;
  
  const zoom = 1.0; 
  const candleWidth = (width / Math.max(10, candles.length)) * zoom;
  const spacing = candleWidth * 0.25;
  const realCandleWidth = candleWidth - spacing;

  const getY = (price: number) => {
    const midPrice = (bounds.max + bounds.min) / 2;
    const scaledY = ((price - midPrice) / range) * (height * 0.8);
    return (height / 2) - scaledY;
  };

  let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  svgContent += `<rect width="100%" height="100%" fill="#0b0e14" />`;

  candles.forEach((c, i) => {
    const x = (width / 2) - ((candles.length * candleWidth) / 2) + (i * candleWidth) + candleWidth / 2;
    const isBullish = c.close >= c.open;
    const isDoji = Math.abs(c.close - c.open) < 0.1;
    const color = isDoji ? "#787b86" : isBullish ? "#089981" : "#f23645";
    
    const yOpen = getY(c.open) + (c.offsetY || 0);
    const yClose = getY(c.close) + (c.offsetY || 0);
    const yHigh = getY(c.high) + (c.offsetY || 0);
    const yLow = getY(c.low) + (c.offsetY || 0);
    
    const top = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(Math.abs(yOpen - yClose), 4);
    const wickWidth = 4;

    // Wick
    svgContent += `<line x1="${x}" y1="${yHigh}" x2="${x}" y2="${yLow}" stroke="${color}" stroke-width="${wickWidth}" stroke-linecap="round" />`;
    // Body
    if (!isDoji) {
      svgContent += `<rect x="${x - realCandleWidth / 2}" y="${top}" width="${realCandleWidth}" height="${bodyHeight}" fill="${color}" rx="${wickWidth / 2}" />`;
    } else {
      svgContent += `<line x1="${x - realCandleWidth / 2}" y1="${yOpen}" x2="${x + realCandleWidth / 2}" y2="${yOpen}" stroke="${color}" stroke-width="${wickWidth}" stroke-linecap="round" />`;
    }
  });

  svgContent += `</svg>`;
  return svgContent;
}

export const TEMPLATES = {
  BULLISH_ENGULFING: [
    { open: 100, high: 110, low: 90, close: 70, offsetY: 0 },
    { open: 70, high: 150, low: 65, close: 140, offsetY: 0 }
  ],
  BEARISH_ENGULFING: [
    { open: 100, high: 120, low: 95, close: 115, offsetY: 0 },
    { open: 115, high: 125, low: 70, close: 75, offsetY: 0 }
  ],
  MORNING_STAR: [
    { open: 200, high: 205, low: 145, close: 150, offsetY: 0 },
    { open: 140, high: 142, low: 128, close: 130, offsetY: 0 },
    { open: 135, high: 195, low: 130, close: 185, offsetY: 0 }
  ],
  FULL_BULLISH_WAVE: [
    { open: 100, high: 115, low: 98, close: 112, offsetY: 0 },
    { open: 112, high: 114, low: 111, close: 113, offsetY: 0 },
    { open: 113, high: 118, low: 112, close: 117, offsetY: 0 },
    { open: 117, high: 120, low: 116, close: 115, offsetY: 0 },
    { open: 115, high: 116, low: 100, close: 101, offsetY: 0 },
    { open: 101, high: 104, low: 100, close: 103, offsetY: 0 },
    { open: 103, high: 122, low: 102, close: 120, offsetY: 0 },
    { open: 120, high: 125, low: 119, close: 124, offsetY: 0 },
    { open: 124, high: 140, low: 123, close: 138, offsetY: 0 },
    { open: 138, high: 139, low: 130, close: 132, offsetY: 0 },
    { open: 132, high: 160, low: 131, close: 158, offsetY: 0 }
  ]
};