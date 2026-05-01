
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

    // High quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (currentCandles.length === 0) return;

    const bounds = getChartBounds(currentCandles);
    const range = bounds.max - bounds.min;
    const chartHeight = CANVAS_HEIGHT * 0.8;
    
    // Center Logic
    const midPrice = (bounds.max + bounds.min) / 2;
    const getY = (price: number) => {
      const scaledY = ((price - midPrice) / range) * chartHeight;
      return (CANVAS_HEIGHT / 2) - scaledY;
    };

    const candleWidth = (CANVAS_WIDTH / Math.max(10, currentCandles.length)) * settings.zoom;
    const totalSpacing = candleWidth * 0.25; // 25% gap for TradingView feel
    const realCandleWidth = candleWidth - totalSpacing;
    const startX = (CANVAS_WIDTH - (candleWidth * currentCandles.length)) / 2;

    currentCandles.forEach((c, i) => {
      const isLast = i === currentCandles.length - 1;
      let displayCandle = { ...c };
      
      if (isLast && isAnimating) {
        if (progress < 0.25) {
          const p = progress / 0.25;
          displayCandle.high = c.open;
          displayCandle.low = c.open - (c.open - c.low) * p;
          displayCandle.close = displayCandle.low;
        } else if (progress < 0.75) {
          const p = (progress - 0.25) / 0.5;
          displayCandle.high = c.low + (c.high - c.low) * p;
          displayCandle.low = c.low;
          displayCandle.close = displayCandle.high;
        } else {
          const p = (progress - 0.75) / 0.25;
          displayCandle.high = c.high;
          displayCandle.low = c.low;
          displayCandle.close = c.high - (c.high - c.close) * p;
        }
      }

      const offsetShift = (c.offsetY || 0) * settings.zoom;
      const x = startX + i * candleWidth + totalSpacing / 2;
      const yOpen = getY(displayCandle.open) + offsetShift;
      const yClose = getY(displayCandle.close) + offsetShift;
      const yHigh = getY(displayCandle.high) + offsetShift;
      const yLow = getY(displayCandle.low) + offsetShift;

      const isBullish = displayCandle.close > displayCandle.open;
      const isDoji = Math.abs(displayCandle.close - displayCandle.open) < 0.1;
      
      // TradingView Pro Colors
      const bodyColor = isDoji ? "#787b86" : isBullish ? "#089981" : "#f23645";
      const wickColor = bodyColor; // Standard TV: wick matches body color

      // Thick Wicks for 4K visibility
      // Since it's 3840px wide, we need substantial thickness
      ctx.lineWidth = Math.max(3, 4 * settings.zoom);
      ctx.strokeStyle = wickColor;
      ctx.lineCap = "round";

      // Draw Wick
      ctx.beginPath();
      ctx.moveTo(x + realCandleWidth / 2, yHigh);
      ctx.lineTo(x + realCandleWidth / 2, yLow);
      ctx.stroke();

      // Draw Body
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(Math.abs(yOpen - yClose), ctx.lineWidth); // Body at least as thick as wick
      
      ctx.fillStyle = bodyColor;
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
    <div className="canvas-container bg-[#131722] border-2 border-primary/20 shadow-2xl overflow-hidden rounded-xl">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="w-full h-full"
      />
    </div>
  );
});

ChartRenderer.displayName = "ChartRenderer";

export default ChartRenderer;
