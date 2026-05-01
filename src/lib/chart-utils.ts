import { Candlestick } from "./chart-types";

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
  const padding = Math.max(range * 0.3, 100); 
  return { min: min - padding, max: max + padding };
}

export function generateSVG(candles: Candlestick[]): string {
  const bounds = getChartBounds(candles);
  const range = bounds.max - bounds.min;
  const height = CANVAS_HEIGHT;
  const width = CANVAS_WIDTH;
  
  const zoom = 1.0; 
  const candleWidth = (width / Math.max(10, candles.length)) * zoom;
  const spacing = candleWidth * 0.25;
  const realCandleWidth = candleWidth - spacing;

  const getY = (price: number) => {
    const midPrice = (bounds.max + bounds.min) / 2;
    const scaledY = ((price - midPrice) / range) * (height * 0.75);
    return (height / 2) - scaledY;
  };

  let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  svgContent += `<rect width="100%" height="100%" fill="#0b0e14" />`;

  candles.forEach((c, i) => {
    const x = (width / 2) - ((candles.length * candleWidth) / 2) + (i * candleWidth) + candleWidth / 2;
    const isBullish = c.close >= c.open;
    const isDoji = Math.abs(c.close - c.open) < 0.1;
    const color = isDoji ? "#787b86" : isBullish ? "#089981" : "#f23645";
    
    const shift = (c.offsetY || 0);
    const yOpen = getY(c.open) + shift;
    const yClose = getY(c.close) + shift;
    const yHigh = getY(c.high) + shift;
    const yLow = getY(c.low) + shift;
    
    const top = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(Math.abs(yOpen - yClose), 4);
    // Balanced Wick for 4K
    const wickWidth = Math.max(8, realCandleWidth * 0.15);

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
  HAMMER: [
    { open: 150, high: 155, low: 100, close: 148, offsetY: 0 }
  ],
  SHOOTING_STAR: [
    { open: 140, high: 200, low: 138, close: 142, offsetY: 0 }
  ],
  BULLISH_MARUBOZU: [
    { open: 100, high: 200, low: 100, close: 200, offsetY: 0 }
  ],
  BEARISH_MARUBOZU: [
    { open: 200, high: 200, low: 100, close: 100, offsetY: 0 }
  ],
  BULLISH_ENGULFING: [
    { open: 120, high: 125, low: 90, close: 95, offsetY: 0 },
    { open: 95, high: 155, low: 92, close: 150, offsetY: 0 }
  ],
  BEARISH_ENGULFING: [
    { open: 150, high: 160, low: 145, close: 155, offsetY: 0 },
    { open: 155, high: 160, low: 85, close: 90, offsetY: 0 }
  ],
  TWEEZER_BOTTOM: [
    { open: 150, high: 155, low: 100, close: 105, offsetY: 0 },
    { open: 105, high: 160, low: 100, close: 155, offsetY: 0 }
  ],
  MORNING_STAR: [
    { open: 200, high: 205, low: 145, close: 150, offsetY: 0 },
    { open: 150, high: 152, low: 138, close: 140, offsetY: 0 },
    { open: 140, high: 195, low: 135, close: 185, offsetY: 0 }
  ],
  EVENING_STAR: [
    { open: 100, high: 155, low: 95, close: 145, offsetY: 0 },
    { open: 145, high: 165, low: 140, close: 160, offsetY: 0 },
    { open: 160, high: 165, low: 105, close: 110, offsetY: 0 }
  ],
  THREE_WHITE_SOLDIERS: [
    { open: 100, high: 135, low: 98, close: 130, offsetY: 0 },
    { open: 130, high: 165, low: 128, close: 160, offsetY: 0 },
    { open: 160, high: 195, low: 158, close: 190, offsetY: 0 }
  ],
  DOUBLE_BOTTOM: [
    { open: 300, high: 305, low: 150, close: 160, offsetY: 0 },
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
    { open: 100, high: 250, low: 95, close: 240, offsetY: 0 },
    { open: 240, high: 245, low: 180, close: 190, offsetY: 0 },
    { open: 190, high: 350, low: 185, close: 340, offsetY: 0 },
    { open: 340, high: 345, low: 180, close: 190, offsetY: 0 },
    { open: 190, high: 255, low: 185, close: 245, offsetY: 0 },
    { open: 245, high: 250, low: 50, close: 60, offsetY: 0 }
  ],
  BULLISH_WEDGE: [
    { open: 400, high: 410, low: 300, close: 310, offsetY: 0 },
    { open: 310, high: 360, low: 305, close: 350, offsetY: 0 },
    { open: 350, high: 355, low: 260, close: 270, offsetY: 0 },
    { open: 270, high: 320, low: 265, close: 310, offsetY: 0 },
    { open: 310, high: 450, low: 305, close: 430, offsetY: 0 }
  ],
  FULL_BULLISH_WAVE: [
    { open: 100, high: 115, low: 98, close: 112, offsetY: 0 },
    { open: 112, high: 115, low: 110, close: 113, offsetY: 0 },
    { open: 113, high: 118, low: 112, close: 117, offsetY: 0 },
    { open: 117, high: 120, low: 114, close: 115, offsetY: 0 },
    { open: 115, high: 116, low: 100, close: 101, offsetY: 0 },
    { open: 101, high: 105, low: 100, close: 103, offsetY: 0 },
    { open: 103, high: 122, low: 102, close: 120, offsetY: 0 },
    { open: 120, high: 125, low: 118, close: 124, offsetY: 0 },
    { open: 124, high: 140, low: 123, close: 138, offsetY: 0 },
    { open: 138, high: 140, low: 130, close: 132, offsetY: 0 },
    { open: 132, high: 160, low: 130, close: 158, offsetY: 0 }
  ]
};