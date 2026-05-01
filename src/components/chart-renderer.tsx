
"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { Candlestick, ChartSettings } from "@/lib/chart-types";
import { CANVAS_WIDTH, CANVAS_HEIGHT, getChartBounds } from "@/lib/chart-utils";

interface ChartRendererProps {
  candles: Candlestick[];
  settings: ChartSettings;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
  onSettingsChange?: (newSettings: Partial<ChartSettings>) => void;
}

export interface ChartRendererHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

const Y_AXIS_WIDTH = 240; 
const X_AXIS_HEIGHT = 160; 

const ChartRenderer = forwardRef<ChartRendererHandle, ChartRendererProps>(({ 
  candles, 
  settings, 
  isAnimating, 
  onAnimationComplete,
  onSettingsChange
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | null>(null);
  
  const [dragState, setDragState] = useState<{ type: 'y' | 'x' | null, startVal: number } | null>(null);

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

    const chartAreaWidth = CANVAS_WIDTH - Y_AXIS_WIDTH;
    const chartAreaHeight = CANVAS_HEIGHT - X_AXIS_HEIGHT;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (currentCandles.length === 0) return;

    const bounds = getChartBounds(currentCandles);
    const range = Math.max(bounds.max - bounds.min, 1);
    
    const zoom = settings.zoom || 0.8;
    const spacingMultiplier = settings.spacing || 1.2;
    const effectiveCount = Math.max(12, currentCandles.length);
    
    const bodyWidth = (chartAreaWidth / effectiveCount) * 0.8 * zoom;
    const baseWidth = ((chartAreaWidth / effectiveCount) * 0.8) * spacingMultiplier;
    const wickWidth = Math.max(10, bodyWidth * 0.15); 

    const actualWidth = (currentCandles.length - 1) * baseWidth;
    const startX = (chartAreaWidth / 2) - (actualWidth / 2);
    const centerY = chartAreaHeight / 2;

    const getY = (price: number) => {
      const midPrice = (bounds.max + bounds.min) / 2;
      const scaledY = ((price - midPrice) / range) * (chartAreaHeight * 0.85);
      return centerY - scaledY;
    };

    // --- RENDER AREA CLIP (Prevent Bleeding) ---
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, chartAreaWidth, chartAreaHeight);
    ctx.clip();

    const limit = Math.ceil(progressValue);
    for (let i = 0; i < limit; i++) {
      if (i >= currentCandles.length) break;

      const c = currentCandles[i];
      const x = startX + (i * baseWidth);
      const priceOffset = (c.offsetY || 0);
      
      const yOpen = getY(c.open + priceOffset);
      const yClose = getY(c.close + priceOffset);
      const yHigh = getY(c.high + priceOffset);
      const yLow = getY(c.low + priceOffset);

      let curOpenY = yOpen, curCloseY = yClose, curHighY = yHigh, curLowY = yLow;

      // --- DUAL PHASE ANIMATION LOGIC ---
      if (i === Math.floor(progressValue) && isAnimating) {
        const p = progressValue - i; // 0 to 1
        
        if (p < 0.5) {
          // Phase 1: Wicks grow from Open (0% to 50% of total candle time)
          const t = easeOut(p / 0.5);
          curHighY = lerp(yOpen, yHigh, t);
          curLowY = lerp(yOpen, yLow, t);
          curCloseY = yOpen;
        } else {
          // Phase 2: Body grows from Open to Close (50% to 100% of total candle time)
          const t = easeOut((p - 0.5) / 0.5);
          curHighY = yHigh;
          curLowY = yLow;
          curCloseY = lerp(yOpen, yClose, t);
        }
      }

      const isBullish = c.close >= c.open;
      const color = isBullish ? settings.bullColor : settings.bearColor;

      // Draw Wick FIRST (BACK)
      ctx.beginPath();
      ctx.moveTo(x, curHighY);
      ctx.lineTo(x, curLowY);
      ctx.strokeStyle = color;
      ctx.lineWidth = wickWidth;
      ctx.lineCap = settings.wickRadius > 0 ? 'round' : 'butt';
      ctx.stroke();

      // Draw Body SECOND (FRONT)
      const bodyDiff = Math.abs(curOpenY - curCloseY);
      const isVisible = i < Math.floor(progressValue) || (i === Math.floor(progressValue) && progressValue - i >= 0.5);
      
      if (isVisible) {
        const rectY = Math.min(curOpenY, curCloseY);
        const rectHeight = Math.max(2, bodyDiff);
        ctx.fillStyle = color;
        
        if (settings.bodyRadius > 0) {
          ctx.beginPath();
          ctx.roundRect(x - bodyWidth / 2, rectY, bodyWidth, rectHeight, settings.bodyRadius);
          ctx.fill();
        } else {
          ctx.fillRect(x - bodyWidth / 2, rectY, bodyWidth, rectHeight);
        }
      }
    }
    ctx.restore();

    // --- DRAW AXES (Y-Axis) ---
    ctx.fillStyle = '#555';
    ctx.font = 'bold 42px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    const stepCount = 12;
    for(let j=0; j<=stepCount; j++) {
      const priceVal = bounds.min + (range * (j/stepCount));
      const yPos = getY(priceVal);
      if(yPos >= 0 && yPos <= chartAreaHeight) {
        ctx.fillText(priceVal.toFixed(1), chartAreaWidth + 40, yPos);
      }
    }

    // --- DRAW AXES (X-Axis) ---
    for (let i = 0; i < limit; i++) {
      const x = startX + (i * baseWidth);
      if(x >= 0 && x <= chartAreaWidth) {
        ctx.fillStyle = '#555';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`BAR ${i+1}`, x, chartAreaHeight + 80);
      }
    }
  };

  useEffect(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    if (isAnimating) {
      startTimeRef.current = null;
      const animate = (time: number) => {
        if (!isAnimating) return;
        
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
  }, [candles, isAnimating, settings, onAnimationComplete]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

    if (x > CANVAS_WIDTH - Y_AXIS_WIDTH) {
      setDragState({ type: 'y', startVal: settings.zoom });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } else if (y > CANVAS_HEIGHT - X_AXIS_HEIGHT) {
      setDragState({ type: 'x', startVal: settings.spacing });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState || !onSettingsChange) return;

    if (dragState.type === 'y') {
      const deltaY = e.movementY;
      const sensitivity = 0.005;
      const newZoom = Math.max(0.1, Math.min(2.0, settings.zoom - deltaY * sensitivity));
      onSettingsChange({ zoom: newZoom });
    } else if (dragState.type === 'x') {
      const deltaX = e.movementX;
      const sensitivity = 0.01;
      const newSpacing = Math.max(0.5, Math.min(5.0, settings.spacing + deltaX * sensitivity));
      onSettingsChange({ spacing: newSpacing });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragState(null);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      ref={containerRef}
      className="landscape-card-container cursor-crosshair touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
});

ChartRenderer.displayName = "ChartRenderer";
export default ChartRenderer;
