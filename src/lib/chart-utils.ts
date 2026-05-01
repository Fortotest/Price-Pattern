
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
  const spacingMultiplier = settings.spacing || 1.2;
  const effectiveCount = Math.max(12, candles.length);
  
  const bodyWidth = (width / effectiveCount) * 0.8 * zoom;
  const baseWidth = ((width / effectiveCount) * 0.8) * spacingMultiplier;
  const wickWidth = Math.max(12, bodyWidth * 0.15);

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

    // Wick (Draw First)
    svgContent += `<line x1="${x}" y1="${yHigh}" x2="${x}" y2="${yLow}" stroke="${color}" stroke-width="${wickWidth}" stroke-linecap="${settings.wickRadius > 0 ? 'round' : 'butt'}" />`;
    
    // Body (Draw Second to cover wick center)
    svgContent += `<rect x="${x - bodyWidth / 2}" y="${top}" width="${bodyWidth}" height="${bodyHeight}" fill="${color}" rx="${rx}" />`;
  });

  svgContent += `</svg>`;
  return svgContent;
}

export const createId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

export const TEMPLATES = {
  HAMMER: [{ id: createId(), open: 300, high: 305, low: 220, close: 295, offsetY: 0 }],
  SHOOTING_STAR: [{ id: createId(), open: 300, high: 380, low: 295, close: 290, offsetY: 0 }],
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
    { id: createId(), open: 100, high: 110, low: 95, close: 108, offsetY: 0 },
    { id: createId(), open: 108, high: 125, low: 105, close: 122, offsetY: 0 },
    { id: createId(), open: 122, high: 125, low: 110, close: 112, offsetY: 0 },
    { id: createId(), open: 112, high: 140, low: 110, close: 135, offsetY: 0 },
    { id: createId(), open: 135, high: 145, low: 120, close: 125, offsetY: 0 },
    { id: createId(), open: 125, high: 160, low: 122, close: 155, offsetY: 0 },
    { id: createId(), open: 155, high: 158, low: 140, close: 142, offsetY: 0 },
    { id: createId(), open: 142, high: 185, low: 140, close: 180, offsetY: 0 },
    { id: createId(), open: 180, high: 210, low: 178, close: 205, offsetY: 0 },
    { id: createId(), open: 205, high: 210, low: 185, close: 190, offsetY: 0 },
    { id: createId(), open: 190, high: 240, low: 188, close: 235, offsetY: 0 }
  ]
};

export const createTemplateWithNewIds = (template: any[]) => {
  return template.map(c => ({ ...c, id: createId() }));
};
