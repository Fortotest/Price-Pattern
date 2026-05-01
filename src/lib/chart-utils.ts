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
  const padding = range * 0.4 || 100; // Extra padding for pro look
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
    const wickWidth = 6;

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
  // SINGLE PATTERNS
  HAMMER: [
    { open: 150, high: 152, low: 100, close: 145, offsetY: 0 }
  ],
  SHOOTING_STAR: [
    { open: 145, high: 200, low: 143, close: 148, offsetY: 0 }
  ],
  BULLISH_MARUBOZU: [
    { open: 100, high: 200, low: 100, close: 200, offsetY: 0 }
  ],
  BEARISH_MARUBOZU: [
    { open: 200, high: 200, low: 100, close: 100, offsetY: 0 }
  ],
  
  // DUAL PATTERNS
  BULLISH_ENGULFING: [
    { open: 100, high: 105, low: 75, close: 80, offsetY: 0 },
    { open: 80, high: 160, low: 78, close: 150, offsetY: 0 }
  ],
  BEARISH_ENGULFING: [
    { open: 150, high: 170, low: 145, close: 165, offsetY: 0 },
    { open: 165, high: 175, low: 90, close: 95, offsetY: 0 }
  ],
  TWEEZER_BOTTOM: [
    { open: 150, high: 155, low: 100, close: 105, offsetY: 0 },
    { open: 105, high: 160, low: 100, close: 155, offsetY: 0 }
  ],

  // THREE CANDLE PATTERNS
  MORNING_STAR: [
    { open: 200, high: 205, low: 145, close: 150, offsetY: 0 },
    { open: 140, high: 142, low: 128, close: 130, offsetY: 0 },
    { open: 135, high: 195, low: 130, close: 185, offsetY: 0 }
  ],
  EVENING_STAR: [
    { open: 100, high: 155, low: 95, close: 145, offsetY: 0 },
    { open: 155, high: 165, low: 150, close: 160, offsetY: 0 },
    { open: 155, high: 160, low: 100, close: 110, offsetY: 0 }
  ],
  THREE_WHITE_SOLDIERS: [
    { open: 100, high: 135, low: 98, close: 130, offsetY: 0 },
    { open: 130, high: 165, low: 128, close: 160, offsetY: 0 },
    { open: 160, high: 195, low: 158, close: 190, offsetY: 0 }
  ],

  // MARKET STRUCTURES
  DOUBLE_BOTTOM: [
    { open: 300, high: 310, low: 150, close: 160, offsetY: 0 },
    { open: 160, high: 250, low: 155, close: 240, offsetY: 0 },
    { open: 240, high: 245, low: 150, close: 155, offsetY: 0 },
    { open: 155, high: 400, low: 150, close: 380, offsetY: 0 }
  ],
  DOUBLE_TOP: [
    { open: 100, high: 350, low: 95, close: 340, offsetY: 0 },
    { open: 340, high: 345, low: 250, close: 260, offsetY: 0 },
    { open: 260, high: 355, low: 255, close: 345, offsetY: 0 },
    { open: 345, high: 350, low: 50, close: 60, offsetY: 0 }
  ],
  HEAD_AND_SHOULDERS: [
    { open: 100, high: 250, low: 95, close: 240, offsetY: 0 }, // Left Shoulder
    { open: 240, high: 245, low: 180, close: 190, offsetY: 0 }, // Valley
    { open: 190, high: 350, low: 185, close: 340, offsetY: 0 }, // Head
    { open: 340, high: 345, low: 180, close: 190, offsetY: 0 }, // Valley
    { open: 190, high: 255, low: 185, close: 245, offsetY: 0 }, // Right Shoulder
    { open: 245, high: 250, low: 50, close: 60, offsetY: 0 }    // Breakdown
  ],
  BULLISH_WEDGE: [
    { open: 400, high: 410, low: 300, close: 310, offsetY: 0 },
    { open: 310, high: 360, low: 315, close: 350, offsetY: 0 },
    { open: 350, high: 355, low: 260, close: 270, offsetY: 0 },
    { open: 270, high: 320, low: 275, close: 310, offsetY: 0 },
    { open: 310, high: 450, low: 305, close: 430, offsetY: 0 }
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
