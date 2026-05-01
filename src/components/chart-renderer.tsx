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

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dark Studio Background
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#0b0e14');
    grad.addColorStop(1, '#151924');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Aesthetic Vertical/Horizontal Grids
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 3;
    for(let i=1; i<10; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (CANVAS_HEIGHT/10)*i);
        ctx.lineTo(CANVAS_WIDTH, (CANVAS_HEIGHT/10)*i);
        ctx.stroke();
    }
    for(let i=1; i<12; i++) {
        ctx.beginPath();
        ctx.moveTo((CANVAS_WIDTH/12)*i, 0);
        ctx.lineTo((CANVAS_WIDTH/12)*i, CANVAS_HEIGHT);
        ctx.stroke();
    }

    if (currentCandles.length === 0) return;

    const bounds = getChartBounds(currentCandles);
    const range = bounds.max - bounds.min;
    
    const zoom = settings.zoom || 1.0;
    const baseWidth = (CANVAS_WIDTH / Math.max(10, currentCandles.length)) * zoom;
    const spacing = baseWidth * 0.25;
    const bodyWidth = baseWidth - spacing;
    
    // Balanced Wick Width for 4K
    const wickWidth = Math.max(8, bodyWidth * 0.15); 

    const startX = (CANVAS_WIDTH / 2) - ((currentCandles.length * baseWidth) / 2) + (baseWidth / 2);
    const centerY = CANVAS_HEIGHT / 2;

    const currentIndex = Math.floor(progressValue);
    const rawP = progressValue - currentIndex;
    const p = easeOut(Math.min(rawP, 1));

    const getY = (price: number) => {
      const midPrice = (bounds.max + bounds.min) / 2;
      const scaledY = ((price - midPrice) / range) * (CANVAS_HEIGHT * 0.75);
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
        if (c.close >= c.open) { // Bullish
          if (p < 0.25) {
            const t = p / 0.25;
            curCloseY = lerp(yOpen, yLow, t);
            curHighY = yOpen;
            curLowY = curCloseY;
          } else if (p < 0.7) {
            const t = (p - 0.25) / 0.45;
            curCloseY = lerp(yLow, yHigh, t);
            curLowY = yLow;
            curHighY = Math.min(yOpen, curCloseY);
          } else {
            const t = (p - 0.7) / 0.3;
            curCloseY = lerp(yHigh, yClose, t);
            curHighY = yHigh;
            curLowY = yLow;
          }
        } else { // Bearish
          if (p < 0.25) {
            const t = p / 0.25;
            curCloseY = lerp(yOpen, yHigh, t);
            curHighY = curCloseY;
            curLowY = yOpen;
          } else if (p < 0.7) {
            const t = (p - 0.25) / 0.45;
            curCloseY = lerp(yHigh, yLow, t);
            curHighY = yHigh;
            curLowY = Math.max(yOpen, curCloseY);
          } else {
            const t = (p - 0.7) / 0.3;
            curCloseY = lerp(yLow, yClose, t);
            curHighY = yHigh;
            curLowY = yLow;
          }
        }
      } else {
        curOpenY = yOpen;
        curCloseY = yClose;
        curHighY = yHigh;
        curLowY = yLow;
      }

      const isBullish = curCloseY <= yOpen;
      const isDoji = Math.abs(c.close - c.open) < 0.1;
      const color = isDoji ? "#787b86" : isBullish ? "#089981" : "#f23645";

      // Draw Wick
      ctx.beginPath();
      ctx.moveTo(x, curHighY);
      ctx.lineTo(x, curLowY);
      ctx.strokeStyle = color;
      ctx.lineWidth = wickWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      // Draw Body
      const rectY = Math.min(yOpen, curCloseY);
      const rectHeight = Math.max(wickWidth, Math.abs(yOpen - curCloseY));
      
      ctx.fillStyle = color;
      if (!isDoji) {
        ctx.beginPath();
        // Use half of wickWidth as radius for subtle rounded corners
        ctx.roundRect(x - bodyWidth / 2, rectY, bodyWidth, rectHeight, wickWidth / 2);
        ctx.fill();
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
    <div className="canvas-container w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain rounded-2xl shadow-2xl shadow-black/50"
      />
    </div>
  );
});

ChartRenderer.displayName = "ChartRenderer";

export default ChartRenderer;