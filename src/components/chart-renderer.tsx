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

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  const draw = (currentCandles: Candlestick[], progressValue: number = currentCandles.length) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset transform and clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Pitch Black Background - Pure Pro Look
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (currentCandles.length === 0) return;

    const bounds = getChartBounds(currentCandles);
    const range = Math.max(bounds.max - bounds.min, 1);
    
    const zoom = settings.zoom || 1.0;
    // Consistent width logic: fill canvas width but keep minimum bar size
    const baseWidth = (CANVAS_WIDTH / Math.max(12, currentCandles.length)) * zoom;
    const spacing = baseWidth * 0.2; 
    const bodyWidth = Math.max(4, baseWidth - spacing);
    
    // Solid thick wicks - Pro TradingView Style (15% of bar width)
    const wickWidth = Math.max(6, bodyWidth * 0.15); 

    const startX = (CANVAS_WIDTH / 2) - ((currentCandles.length * baseWidth) / 2) + (baseWidth / 2);
    const centerY = CANVAS_HEIGHT / 2;

    const currentIndex = Math.floor(progressValue);
    const rawP = progressValue - currentIndex;
    const p = easeOut(Math.min(rawP, 1));

    const getY = (price: number) => {
      const midPrice = (bounds.max + bounds.min) / 2;
      // High vertical dynamic range (80% of canvas height)
      const scaledY = ((price - midPrice) / range) * (CANVAS_HEIGHT * 0.8);
      return centerY - scaledY;
    };

    for (let i = 0; i < Math.ceil(progressValue); i++) {
      if (i >= currentCandles.length) break;

      const c = currentCandles[i];
      const x = startX + (i * baseWidth);
      const shift = (c.offsetY || 0);
      
      const yOpen = getY(c.open) + shift;
      const yClose = getY(c.close) + shift;
      const yHigh = getY(c.high) + shift;
      const yLow = getY(c.low) + shift;

      let curOpenY = yOpen;
      let curCloseY = yClose;
      let curHighY = yHigh;
      let curLowY = yLow;

      // Price Action Animation Logic
      if (i === currentIndex && isAnimating) {
        if (c.close >= c.open) {
            // Bullish Animation Path
            if (p < 0.2) {
                const t = p / 0.2;
                curCloseY = lerp(yOpen, yLow, t);
                curHighY = yOpen; curLowY = curCloseY;
            } else if (p < 0.7) {
                const t = (p - 0.2) / 0.5;
                curCloseY = lerp(yLow, yHigh, t);
                curLowY = yLow; curHighY = Math.min(yOpen, curCloseY);
            } else {
                const t = (p - 0.7) / 0.3;
                curCloseY = lerp(yHigh, yClose, t);
                curHighY = yHigh; curLowY = yLow;
            }
        } else {
            // Bearish Animation Path
            if (p < 0.2) {
                const t = p / 0.2;
                curCloseY = lerp(yOpen, yHigh, t);
                curHighY = curCloseY; curLowY = yOpen;
            } else if (p < 0.7) {
                const t = (p - 0.2) / 0.5;
                curCloseY = lerp(yHigh, yLow, t);
                curHighY = yHigh; curLowY = Math.max(yOpen, curCloseY);
            } else {
                const t = (p - 0.7) / 0.3;
                curCloseY = lerp(yLow, yClose, t);
                curHighY = yHigh; curLowY = yLow;
            }
        }
      } else {
        curOpenY = yOpen;
        curCloseY = yClose;
        curHighY = yHigh;
        curLowY = yLow;
      }

      const isBullish = c.close >= c.open;
      const isDoji = Math.abs(c.close - c.open) < 0.1;
      const color = isDoji ? "#787b86" : isBullish ? "#00b386" : "#f23645";

      // Draw Wick - Thick, Solid, No Rounding
      ctx.beginPath();
      ctx.moveTo(x, curHighY);
      ctx.lineTo(x, curLowY);
      ctx.strokeStyle = color;
      ctx.lineWidth = wickWidth;
      ctx.lineCap = "butt"; 
      ctx.stroke();

      // Draw Body - Sharp Edges
      const rectY = Math.min(yOpen, curCloseY);
      const rectHeight = Math.max(wickWidth, Math.abs(yOpen - curCloseY));
      
      ctx.fillStyle = color;
      if (!isDoji) {
        ctx.fillRect(x - bodyWidth / 2, rectY, bodyWidth, rectHeight);
      } else {
        ctx.beginPath();
        ctx.moveTo(x - bodyWidth / 2, yOpen);
        ctx.lineTo(x + bodyWidth / 2, yOpen);
        ctx.lineWidth = wickWidth;
        ctx.stroke();
      }
    }
  };

  useEffect(() => {
    if (isAnimating) {
      startTimeRef.current = null;
      const animate = (time: number) => {
        if (startTimeRef.current === null) startTimeRef.current = time;
        const elapsed = time - startTimeRef.current;
        const durationPerCandle = (settings.speed || 0.8) * 1000;
        const totalDuration = candles.length * durationPerCandle;
        const progress = Math.min(elapsed / totalDuration, 1);
        const progressValue = progress * candles.length;

        draw(candles, progressValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setTimeout(() => {
            onAnimationComplete?.();
          }, 300);
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
    <div className="canvas-container w-full h-full flex items-center justify-center bg-black">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain"
      />
    </div>
  );
});

ChartRenderer.displayName = "ChartRenderer";

export default ChartRenderer;