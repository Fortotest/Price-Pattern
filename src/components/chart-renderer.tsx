
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

const Y_AXIS_WIDTH = 180; // 4K Scale
const X_AXIS_HEIGHT = 120; // 4K Scale

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

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid / Axis Lines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH - Y_AXIS_WIDTH, 0);
    ctx.lineTo(CANVAS_WIDTH - Y_AXIS_WIDTH, CANVAS_HEIGHT);
    ctx.moveTo(0, CANVAS_HEIGHT - X_AXIS_HEIGHT);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - X_AXIS_HEIGHT);
    ctx.stroke();

    if (currentCandles.length === 0) return;

    const bounds = getChartBounds(currentCandles);
    const range = Math.max(bounds.max - bounds.min, 1);
    
    const zoom = settings.zoom || 0.8;
    const spacingMultiplier = settings.spacing || 1.0;
    const effectiveCount = Math.max(12, currentCandles.length);
    
    const chartAreaWidth = CANVAS_WIDTH - Y_AXIS_WIDTH;
    const chartAreaHeight = CANVAS_HEIGHT - X_AXIS_HEIGHT;

    const bodyWidth = (chartAreaWidth / effectiveCount) * 0.8 * zoom;
    const baseWidth = ((chartAreaWidth / effectiveCount) * 0.8) * spacingMultiplier;
    const wickWidth = Math.max(8, bodyWidth * 0.15); 

    const actualWidth = (currentCandles.length - 1) * baseWidth;
    const startX = (chartAreaWidth / 2) - (actualWidth / 2);
    const centerY = chartAreaHeight / 2;

    const getY = (price: number) => {
      const midPrice = (bounds.max + bounds.min) / 2;
      const scaledY = ((price - midPrice) / range) * (chartAreaHeight * 0.85);
      return centerY - (scaledY);
    };

    // Draw Price Labels (Y-Axis)
    ctx.fillStyle = '#666';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    const stepCount = 10;
    for(let j=0; j<=stepCount; j++) {
      const priceVal = bounds.min + (range * (j/stepCount));
      const yPos = getY(priceVal);
      if(yPos >= 0 && yPos <= chartAreaHeight) {
        ctx.fillText(priceVal.toFixed(1), chartAreaWidth + 20, yPos);
        ctx.beginPath();
        ctx.moveTo(chartAreaWidth, yPos);
        ctx.lineTo(chartAreaWidth + 10, yPos);
        ctx.strokeStyle = '#333';
        ctx.stroke();
      }
    }

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

      // Draw Wick
      ctx.beginPath();
      ctx.moveTo(x, curHighY);
      ctx.lineTo(x, curLowY);
      ctx.strokeStyle = color;
      ctx.lineWidth = wickWidth;
      ctx.lineCap = settings.wickRadius > 0 ? 'round' : 'butt';
      ctx.stroke();

      // Draw Body
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

      // Draw X-Axis Label
      if(x >= 0 && x <= chartAreaWidth) {
        ctx.fillStyle = '#666';
        ctx.font = 'bold 30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Bar ${i+1}`, x, chartAreaHeight + 60);
      }
    }
  };

  useEffect(() => {
    if (isAnimating) {
      startTimeRef.current = null;
      const animate = (time: number) => {
        if (!isAnimating) return; // Immediate bailout if stopped
        
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      requestAnimationFrame(() => draw(candles));
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
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
      const newZoom = Math.max(0.1, Math.min(2.0, settings.zoom - deltaY * 0.005));
      onSettingsChange({ zoom: newZoom });
    } else if (dragState.type === 'x') {
      const deltaX = e.movementX;
      const newSpacing = Math.max(0.5, Math.min(5.0, settings.spacing + deltaX * 0.01));
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
      className="landscape-card-container cursor-crosshair touch-none"
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
