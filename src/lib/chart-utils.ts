
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
  ],

  // === ADVANCED PRICE ACTION (PSYCHOLOGY) ===
  trend_reversal_v_shape: [
    { type: 'bearish', body: 50, wickTop: 5, wickBottom: 10 },
    { type: 'bearish', body: 75, wickTop: 10, wickBottom: 15 },
    { type: 'bearish', body: 90, wickTop: 5, wickBottom: 5 },
    { type: 'bearish', body: 25, wickTop: 5, wickBottom: 85 },
    { type: 'bullish', body: 30, wickTop: 10, wickBottom: 60 },
    { type: 'bullish', body: 80, wickTop: 10, wickBottom: 5 },
    { type: 'bullish', body: 65, wickTop: 15, wickBottom: 10 },
    { type: 'bullish', body: 95, wickTop: 5, wickBottom: 5 }
  ],
  bullish_fakeout_trap: [
    { type: 'bullish', body: 25, wickTop: 10, wickBottom: 10 },
    { type: 'bearish', body: 20, wickTop: 15, wickBottom: 5 },
    { type: 'bullish', body: 15, wickTop: 5, wickBottom: 15 },
    { type: 'bullish', body: 85, wickTop: 5, wickBottom: 5 },
    { type: 'bearish', body: 110, wickTop: 35, wickBottom: 5 },
    { type: 'bearish', body: 70, wickTop: 5, wickBottom: 25 },
    { type: 'bearish', body: 95, wickTop: 10, wickBottom: 5 }
  ],
  valid_breakout_retest: [
    { type: 'bearish', body: 20, wickTop: 10, wickBottom: 5 },
    { type: 'bullish', body: 25, wickTop: 5, wickBottom: 15 },
    { type: 'bearish', body: 15, wickTop: 10, wickBottom: 10 },
    { type: 'bullish', body: 90, wickTop: 10, wickBottom: 5 },
    { type: 'bearish', body: 30, wickTop: 15, wickBottom: 5 },
    { type: 'doji', body: 5, wickTop: 10, wickBottom: 35 },
    { type: 'bullish', body: 75, wickTop: 15, wickBottom: 5 },
    { type: 'bullish', body: 85, wickTop: 5, wickBottom: 10 }
  ],
  strong_momentum_run: [
    { type: 'bullish', body: 35, wickTop: 15, wickBottom: 10 },
    { type: 'bullish', body: 55, wickTop: 10, wickBottom: 5 },
    { type: 'bullish', body: 80, wickTop: 5, wickBottom: 5 },
    { type: 'bullish', body: 120, wickTop: 2, wickBottom: 2 },
    { type: 'bullish', body: 70, wickTop: 25, wickBottom: 5 }
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
      const bodySize = item.body;
      close = open + bodySize;
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

export const createTemplateWithNewIds = (template: Candlestick[]) => {
  return template.map(c => ({ ...c, id: createId() }));
};
