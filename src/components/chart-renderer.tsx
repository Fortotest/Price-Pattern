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

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (currentCandles.length === 0) return;

    const bounds = getChartBounds(currentCandles);
    const range = Math.max(bounds.max - bounds.min, 1);
    
    // Zoom & Spacing Logic Separation
    const zoom = settings.zoom || 0.8;
    const spacingMultiplier = settings.spacing || 1.2;
    
    const effectiveCount = Math.max(12, currentCandles.length);
    
    // bodyBaseWidth is strictly tied to ZOOM
    const bodyWidth = (CANVAS_WIDTH / effectiveCount) * 0.8 * zoom;
    
    // baseWidth (distance between candles) is tied to SPACING multiplier of bodyWidth
    // If spacingMultiplier is 1.0, they are "dempet"
    const baseWidth = bodyWidth * spacingMultiplier;
    
    const wickWidth = Math.max(4, bodyWidth * 0.12); 

    const actualWidth = (currentCandles.length - 1) * baseWidth;
    const startX = (CANVAS_WIDTH / 2) - (actualWidth / 2);
    const centerY = CANVAS_HEIGHT / 2;

    const getY = (price: number) => {
      const midPrice = (bounds.max + bounds.min) / 2;
      // Vertical scale also affected by zoom for proportionality
      const scaledY = ((price - midPrice) / range) * (CANVAS_HEIGHT * 0.85);
      return centerY - (scaledY);
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

      let curOpenY = yOpen, curCloseY = yClose, curHighY = yHigh, curLowY = yLow;

      if (i === Math.floor(progressValue) && isAnimating) {
        const rawP = progressValue - i;
        const p = easeOut(Math.min(rawP, 1));
        
        if (c.close >= c.open) {
          if (p < 0.2) { const t = p / 0.2; curCloseY = lerp(yOpen, yLow, t); curHighY = yOpen; curLowY = curCloseY; }
          else if (p < 0.7) { const t = (p - 0.2) / 0.5; curCloseY = lerp(yLow, yHigh, t); curLowY = yLow; curHighY = Math.min(yOpen, curCloseY); }
          else { const t = (p - 0.7) / 0.3; curCloseY = lerp(yHigh, yClose, t); curHighY = yHigh; curLowY = yLow; }
        } else {
          if (p < 0.2) { const t = p / 0.2; curCloseY = lerp(yOpen, yHigh, t); curHighY = curCloseY; curLowY = yOpen; }
          else if (p < 0.7) { const t = (p - 0.2) / 0.5; curCloseY = lerp(yHigh, yLow, t); curHighY = yHigh; curLowY = Math.max(yOpen, curCloseY); }
          else { const t = (p - 0.7) / 0.3; curCloseY = lerp(yLow, yClose, t); curHighY = yHigh; curLowY = yLow; }
        }
      }

      const isBullish = c.close >= c.open;
      const color = isBullish ? settings.bullColor : settings.bearColor;

      // Wick
      ctx.beginPath();
      ctx.moveTo(x, curHighY);
      ctx.lineTo(x, curLowY);
      ctx.strokeStyle = color;
      ctx.lineWidth = wickWidth;
      ctx.lineCap = settings.wickRadius > 0 ? 'round' : 'butt';
      ctx.stroke();

      // Body
      const rectY = Math.min(yOpen, curCloseY);
      const rectHeight = Math.max(2, Math.abs(yOpen - curCloseY));
      ctx.fillStyle = color;
      
      if (settings.bodyRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(x - bodyWidth / 2, rectY, bodyWidth, rectHeight, settings.bodyRadius);
        ctx.fill();
      } else {
        ctx.fillRect(x - bodyWidth / 2, rectY, bodyWidth, rectHeight);
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
        if (progress < 1) animationRef.current = requestAnimationFrame(animate);
        else onAnimationComplete?.();
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      draw(candles);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [candles, isAnimating, settings]);

  return (
    <div className="landscape-card-container">
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