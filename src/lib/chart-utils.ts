
import { Candlestick, ChartSettings } from "./chart-types";

export const CANVAS_WIDTH = 3840;
export const CANVAS_HEIGHT = 2160;

export function getChartBounds(candles: Candlestick[]) {
  if (candles.length === 0) return { min: 0, max: 100 };
  let min = Infinity;
  let max = -Infinity;
  
  candles.forEach(c => {
    const shift = c.offsetY || 0;
    if (c.low + shift < min) min = c.low + shift;
    if (c.high + shift > max) max = c.high + shift;
  });

  const range = max - min;
  const padding = Math.max(range * 0.3, 150); 
  return { min: min - padding, max: max + padding };
}

export function generateSVG(candles: Candlestick[], settings: ChartSettings): string {
  const bounds = getChartBounds(candles);
  const range = Math.max(bounds.max - bounds.min, 1);
  const height = CANVAS_HEIGHT;
  const width = CANVAS_WIDTH;
  
  const zoom = settings.zoom || 0.8;
  const spacingMultiplier = settings.spacing || 1.0;
  const effectiveCount = Math.max(12, candles.length);
  
  const bodyWidth = (width / effectiveCount) * 0.8 * zoom;
  const baseWidth = ((width / effectiveCount) * 0.8) * spacingMultiplier;
  const wickWidth = Math.max(12, bodyWidth * 0.2);

  const getY = (price: number) => {
    const midPrice = (bounds.max + bounds.min) / 2;
    const scaledY = ((price - midPrice) / range) * (height * 0.85);
    return (height / 2) - scaledY;
  };

  const actualWidth = (candles.length - 1) * baseWidth;
  const startX = (width / 2) - (actualWidth / 2);

  let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  svgContent += `<rect width="100%" height="100%" fill="#000000" />`;

  candles.forEach((c, i) => {
    const x = startX + (i * baseWidth);
    const isBullish = c.close >= c.open;
    const color = isBullish ? settings.bullColor : settings.bearColor;
    
    const shift = (c.offsetY || 0);
    const yOpen = getY(c.open + shift);
    const yClose = getY(c.close + shift);
    const yHigh = getY(c.high + shift);
    const yLow = getY(c.low + shift);
    
    const top = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(Math.abs(yOpen - yClose), 4);
    const rx = settings.bodyRadius || 0;

    // Wick
    svgContent += `<line x1="${x}" y1="${yHigh}" x2="${x}" y2="${yLow}" stroke="${color}" stroke-width="${wickWidth}" stroke-linecap="${settings.wickRadius > 0 ? 'round' : 'butt'}" />`;
    
    // Body
    svgContent += `<rect x="${x - bodyWidth / 2}" y="${top}" width="${bodyWidth}" height="${bodyHeight}" fill="${color}" rx="${rx}" />`;
  });

  svgContent += `</svg>`;
  return svgContent;
}

export const createId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

export const TEMPLATES = {
  HAMMER: [{ id: createId(), open: 150, high: 155, low: 80, close: 148, offsetY: 0 }],
  SHOOTING_STAR: [{ id: createId(), open: 140, high: 220, low: 138, close: 135, offsetY: 0 }],
  DOUBLE_BOTTOM: [
    { id: createId(), open: 300, high: 305, low: 220, close: 230, offsetY: 0 },
    { id: createId(), open: 230, high: 320, low: 225, close: 310, offsetY: 0 },
    { id: createId(), open: 310, high: 315, low: 220, close: 225, offsetY: 0 },
    { id: createId(), open: 225, high: 400, low: 220, close: 390, offsetY: 0 }
  ],
  DOUBLE_TOP: [
    { id: createId(), open: 150, high: 350, low: 145, close: 340, offsetY: 0 },
    { id: createId(), open: 340, high: 345, low: 220, close: 230, offsetY: 0 },
    { id: createId(), open: 230, high: 355, low: 225, close: 345, offsetY: 0 },
    { id: createId(), open: 345, high: 350, low: 140, close: 150, offsetY: 0 }
  ],
  BULLISH_ENGULFING: [
    { id: createId(), open: 250, high: 255, low: 200, close: 210, offsetY: 0 },
    { id: createId(), open: 210, high: 280, low: 205, close: 275, offsetY: 0 }
  ],
  BEARISH_ENGULFING: [
    { id: createId(), open: 210, high: 280, low: 205, close: 275, offsetY: 0 },
    { id: createId(), open: 275, high: 280, low: 190, close: 200, offsetY: 0 }
  ],
  FULL_BULLISH_WAVE: [
    { id: createId(), open: 100, high: 115, low: 98, close: 112, offsetY: 0 },
    { id: createId(), open: 112, high: 115, low: 110, close: 113, offsetY: 0 },
    { id: createId(), open: 113, high: 118, low: 112, close: 117, offsetY: 0 },
    { id: createId(), open: 117, high: 120, low: 114, close: 115, offsetY: 0 },
    { id: createId(), open: 115, high: 116, low: 100, close: 101, offsetY: 0 },
    { id: createId(), open: 101, high: 105, low: 100, close: 103, offsetY: 0 },
    { id: createId(), open: 103, high: 122, low: 102, close: 120, offsetY: 0 },
    { id: createId(), open: 120, high: 125, low: 118, close: 124, offsetY: 0 },
    { id: createId(), open: 124, high: 140, low: 123, close: 138, offsetY: 0 },
    { id: createId(), open: 138, high: 140, low: 130, close: 132, offsetY: 0 },
    { id: createId(), open: 132, high: 160, low: 130, close: 158, offsetY: 0 }
  ]
};

export const createTemplateWithNewIds = (template: any[]) => {
  return template.map(c => ({ ...c, id: createId() }));
};
