
import { Candlestick, ChartSettings } from "./chart-types";

export const CANVAS_WIDTH = 3840;
export const CANVAS_HEIGHT = 2160;

export const createId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

// === RAW TEMPLATES DEFINITION ===
const patternTemplates = {
  // === BASIC CANDLES ===
  spinning_tops: [
    { type: 'bullish', body: 15, wickTop: 25, wickBottom: 25 },
    { type: 'bearish', body: 15, wickTop: 25, wickBottom: 25 }
  ],
  shooting_star: [
    { type: 'bearish', body: 20, wickTop: 60, wickBottom: 5 }
  ],
  hammer: [
    { type: 'bullish', body: 20, wickTop: 5, wickBottom: 60 }
  ],
  doji: [
    { type: 'doji', body: 2, wickTop: 35, wickBottom: 35 }
  ],

  // === DUAL CANDLE PATTERNS ===
  bullish_engulfing: [
    { type: 'bearish', body: 30, wickTop: 10, wickBottom: 15 },
    { type: 'bullish', body: 80, wickTop: 5, wickBottom: 5 }
  ],
  bearish_engulfing: [
    { type: 'bullish', body: 30, wickTop: 15, wickBottom: 10 },
    { type: 'bearish', body: 80, wickTop: 5, wickBottom: 5 }
  ],

  // === TRIPLE CANDLE PATTERNS ===
  evening_star: [
    { type: 'bullish', body: 70, wickTop: 15, wickBottom: 5 },
    { type: 'doji', body: 5, wickTop: 25, wickBottom: 20 },
    { type: 'bearish', body: 65, wickTop: 5, wickBottom: 15 }
  ],
  morning_star: [
    { type: 'bearish', body: 70, wickTop: 5, wickBottom: 15 },
    { type: 'doji', body: 5, wickTop: 20, wickBottom: 25 },
    { type: 'bullish', body: 65, wickTop: 15, wickBottom: 5 }
  ],
  three_soldiers: [
    { type: 'bullish', body: 40, wickTop: 5, wickBottom: 15 },
    { type: 'bullish', body: 55, wickTop: 10, wickBottom: 5 },
    { type: 'bullish', body: 70, wickTop: 15, wickBottom: 2 }
  ],
  three_crows: [
    { type: 'bearish', body: 40, wickTop: 15, wickBottom: 5 },
    { type: 'bearish', body: 55, wickTop: 5, wickBottom: 10 },
    { type: 'bearish', body: 70, wickTop: 2, wickBottom: 15 }
  ],

  // === MACRO SNR STRUCTURES ===
  bullish_snr_3_valleys: [
    { type: 'bearish', body: 60, wickTop: 10, wickBottom: 5 },
    { type: 'bearish', body: 40, wickTop: 5, wickBottom: 15 },
    { type: 'bullish', body: 20, wickTop: 5, wickBottom: 45 },
    { type: 'bullish', body: 35, wickTop: 10, wickBottom: 5 },
    { type: 'bearish', body: 30, wickTop: 5, wickBottom: 10 },
    { type: 'doji', body: 4, wickTop: 15, wickBottom: 40 },
    { type: 'bullish', body: 45, wickTop: 15, wickBottom: 5 },
    { type: 'bearish', body: 40, wickTop: 10, wickBottom: 5 },
    { type: 'bullish', body: 75, wickTop: 10, wickBottom: 10 },
    { type: 'bullish', body: 60, wickTop: 15, wickBottom: 5 },
    { type: 'bullish', body: 90, wickTop: 20, wickBottom: 5 }
  ],

  bearish_snr_3_peaks: [
    { type: 'bullish', body: 60, wickTop: 5, wickBottom: 10 },
    { type: 'bullish', body: 40, wickTop: 15, wickBottom: 5 },
    { type: 'bearish', body: 20, wickTop: 45, wickBottom: 5 },
    { type: 'bearish', body: 35, wickTop: 5, wickBottom: 10 },
    { type: 'bullish', body: 30, wickTop: 10, wickBottom: 5 },
    { type: 'doji', body: 4, wickTop: 40, wickBottom: 15 },
    { type: 'bearish', body: 45, wickTop: 5, wickBottom: 15 },
    { type: 'bullish', body: 40, wickTop: 5, wickBottom: 10 },
    { type: 'bearish', body: 75, wickTop: 10, wickBottom: 10 },
    { type: 'bearish', body: 60, wickTop: 5, wickBottom: 15 },
    { type: 'bearish', body: 90, wickTop: 5, wickBottom: 20 }
  ]
};

function convertToCandlesticks(raw: any[]): Candlestick[] {
  let prevClose = 300;
  return raw.map(item => {
    let open = prevClose;
    let close, high, low;
    if (item.type === 'bullish') {
      close = open + item.body;
      high = close + item.wickTop;
      low = open - item.wickBottom;
    } else if (item.type === 'bearish') {
      close = open - item.body;
      high = open + item.wickTop;
      low = close - item.wickBottom;
    } else { // doji
      close = open + item.body;
      high = Math.max(open, close) + item.wickTop;
      low = Math.min(open, close) - item.wickBottom;
    }
    prevClose = close;
    return { id: createId(), open, close, high, low, offsetY: 0 };
  });
}

export const TEMPLATES = Object.fromEntries(
  Object.entries(patternTemplates).map(([key, value]) => [key, convertToCandlesticks(value)])
);

export function getChartBounds(candles: Candlestick[]) {
  if (candles.length === 0) return { min: 0, max: 100 };
  let min = Infinity;
  let max = -Infinity;
  
  candles.forEach(c => {
    const shift = c.offsetY || 0;
    if (c.low + shift < min) min = c.low + shift;
    if (c.high + shift > max) max = c.high + shift;
  });

  const range = Math.max(max - min, 1);
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

    svgContent += `<line x1="${x}" y1="${yHigh}" x2="${x}" y2="${yLow}" stroke="${color}" stroke-width="${wickWidth}" stroke-linecap="${settings.wickRadius > 0 ? 'round' : 'butt'}" />`;
    svgContent += `<rect x="${x - bodyWidth / 2}" y="${top}" width="${bodyWidth}" height="${bodyHeight}" fill="${color}" rx="${rx}" />`;
  });

  svgContent += `</svg>`;
  return svgContent;
}

export const createTemplateWithNewIds = (template: Candlestick[]) => {
  return template.map(c => ({ ...c, id: createId() }));
};
