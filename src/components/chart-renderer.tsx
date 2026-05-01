"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Candlestick, ChartSettings } from "@/lib/chart-types";
import { CANVAS_WIDTH, CANVAS_HEIGHT, getChartBounds } from "@/lib/chart-utils";

interface ChartRendererProps {
  candles: Candlestick[];
  settings: ChartSettings;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
}

export interface ChartRendererHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

const ChartRenderer = forwardRef<ChartRendererHandle, ChartRendererProps>(({ 
  candles, 
  settings, 
  isAnimating, 
  onAnimationComplete 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const startTimeRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current
  }));

  const draw = (currentCandles: Candlestick[], progress: number = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (currentCandles.length === 0) return;

    const bounds = getChartBounds(currentCandles);
    const range = bounds.max - bounds.min;
    const chartHeight = CANVAS_HEIGHT * 0.8;
    const chartTop = CANVAS_HEIGHT * 0.1;

    const getY = (price: number) => chartTop + chartHeight - ((price - bounds.min) / range) * chartHeight;

    const candleWidth = (CANVAS_WIDTH / Math.max(10, currentCandles.length)) * settings.zoom;
    const totalSpacing = candleWidth * 0.15;
    const realCandleWidth = candleWidth - totalSpacing;
    const startX = (CANVAS_WIDTH - (candleWidth * currentCandles.length)) / 2;

    currentCandles.forEach((c, i) => {
      // Logic for animating last candle
      const isLast = i === currentCandles.length - 1;
      let displayCandle = { ...c };
      
      if (isLast && isAnimating) {
        // Simple tick simulation: Open -> Low -> High -> Close
        if (progress < 0.25) {
          // Open to Low
          const p = progress / 0.25;
          displayCandle.high = c.open;
          displayCandle.low = c.open - (c.open - c.low) * p;
          displayCandle.close = displayCandle.low;
        } else if (progress < 0.75) {
          // Low to High
          const p = (progress - 0.25) / 0.5;
          displayCandle.high = c.low + (c.high - c.low) * p;
          displayCandle.low = c.low;
          displayCandle.close = displayCandle.high;
        } else {
          // High to Close
          const p = (progress - 0.75) / 0.25;
          displayCandle.high = c.high;
          displayCandle.low = c.low;
          displayCandle.close = c.high - (c.high - c.close) * p;
        }
      }

      const x = startX + i * candleWidth + totalSpacing / 2;
      const yOpen = getY(displayCandle.open);
      const yClose = getY(displayCandle.close);
      const yHigh = getY(displayCandle.high);
      const yLow = getY(displayCandle.low);

      const isBullish = displayCandle.close > displayCandle.open;
      const isDoji = Math.abs(displayCandle.close - displayCandle.open) < 0.01;
      const color = isDoji ? "#888888" : isBullish ? "#61D4BD" : "#EF5350";

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = Math.max(2, 4 * settings.zoom);

      // Draw Wick
      ctx.beginPath();
      ctx.moveTo(x + realCandleWidth / 2, yHigh);
      ctx.lineTo(x + realCandleWidth / 2, yLow);
      ctx.stroke();

      // Draw Body
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(Math.abs(yOpen - yClose), 4);
      ctx.fillRect(x, bodyTop, realCandleWidth, bodyHeight);
    });
  };

  useEffect(() => {
    if (isAnimating) {
      const animate = (time: number) => {
        if (startTimeRef.current === null) startTimeRef.current = time;
        const elapsed = time - startTimeRef.current;
        const duration = settings.speed * 1000;
        const progress = Math.min(elapsed / duration, 1);

        draw(candles, progress);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          startTimeRef.current = null;
          onAnimationComplete?.();
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      draw(candles);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [candles, isAnimating, settings]);

  return (
    <div className="canvas-container bg-white dark:bg-zinc-900 border-2 border-primary/10">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
      />
    </div>
  );
});

ChartRenderer.displayName = "ChartRenderer";

export default ChartRenderer;