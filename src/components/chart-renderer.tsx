"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { Candlestick, ChartSettings, DrawingTool, Drawing } from "@/lib/chart-types";
import { CANVAS_WIDTH, CANVAS_HEIGHT, getChartBounds } from "@/lib/chart-utils";

interface ChartRendererProps {
  candles: Candlestick[];
  settings: ChartSettings;
  isAnimating: boolean;
  activeTool: DrawingTool;
  onAnimationComplete?: () => void;
}

export interface ChartRendererHandle {
  getCanvas: () => HTMLCanvasElement | null;
  clearDrawings: () => void;
}

const ChartRenderer = forwardRef<ChartRendererHandle, ChartRendererProps>(({ 
  candles, 
  settings, 
  isAnimating, 
  activeTool,
  onAnimationComplete 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    clearDrawings: () => setDrawings([])
  }));

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  const getCanvasMousePos = (e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeTool || activeTool === 'crosshair') return;
    const pos = getCanvasMousePos(e);
    const newDrawing: Drawing = {
      id: Math.random().toString(36).substr(2, 9),
      type: activeTool,
      points: [pos, pos],
      color: '#2962ff'
    };
    setCurrentDrawing(newDrawing);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getCanvasMousePos(e);
    setMousePos(pos);
    
    if (currentDrawing) {
      setCurrentDrawing(prev => {
        if (!prev) return null;
        if (prev.type === 'brush') {
          return { ...prev, points: [...prev.points, pos] };
        }
        return { ...prev, points: [prev.points[0], pos] };
      });
    }
    
    if (!isAnimating) draw(candles);
  };

  const handleMouseUp = () => {
    if (currentDrawing) {
      setDrawings(prev => [...prev, currentDrawing]);
      setCurrentDrawing(null);
    }
  };

  const draw = (currentCandles: Candlestick[], progressValue: number = currentCandles.length) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Pitch Black Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (currentCandles.length === 0 && drawings.length === 0 && !currentDrawing) return;

    const bounds = getChartBounds(currentCandles);
    const range = Math.max(bounds.max - bounds.min, 1);
    const zoom = settings.zoom || 1.0;
    
    // Auto-scaling logic
    const effectiveCount = Math.max(10, currentCandles.length);
    const baseWidth = (CANVAS_WIDTH / effectiveCount) * zoom;
    const spacing = baseWidth * 0.25; 
    const bodyWidth = Math.max(4, baseWidth - spacing);
    const wickWidth = Math.max(6, bodyWidth * 0.15); 

    const actualWidth = currentCandles.length * baseWidth;
    const startX = (CANVAS_WIDTH / 2) - (actualWidth / 2) + (baseWidth / 2);
    const centerY = CANVAS_HEIGHT / 2;

    const getY = (price: number) => {
      const midPrice = (bounds.max + bounds.min) / 2;
      const scaledY = ((price - midPrice) / range) * (CANVAS_HEIGHT * 0.85);
      return centerY - scaledY;
    };

    // Render Candles
    const currentIndex = Math.floor(progressValue);
    const rawP = progressValue - currentIndex;
    const p = easeOut(Math.min(rawP, 1));

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

      if (i === currentIndex && isAnimating) {
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
      const isDoji = Math.abs(c.close - c.open) < 0.1;
      const color = isDoji ? "#787b86" : isBullish ? "#00b386" : "#f23645";

      // Wick - Slightly rounded
      ctx.beginPath();
      ctx.moveTo(x, curHighY);
      ctx.lineTo(x, curLowY);
      ctx.strokeStyle = color;
      ctx.lineWidth = wickWidth;
      ctx.lineCap = 'round'; // Sedikit rounded
      ctx.stroke();

      // Body - Sharp (Square)
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
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // Render Drawings
    const renderDrawing = (d: Drawing) => {
      ctx.beginPath();
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (d.type === 'trendline' || d.type === 'arrow') {
        ctx.moveTo(d.points[0].x, d.points[0].y);
        ctx.lineTo(d.points[1].x, d.points[1].y);
        if (d.type === 'arrow') {
          const angle = Math.atan2(d.points[1].y - d.points[0].y, d.points[1].x - d.points[0].x);
          ctx.lineTo(d.points[1].x - 20 * Math.cos(angle - Math.PI / 6), d.points[1].y - 20 * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(d.points[1].x, d.points[1].y);
          ctx.lineTo(d.points[1].x - 20 * Math.cos(angle + Math.PI / 6), d.points[1].y - 20 * Math.sin(angle + Math.PI / 6));
        }
      } else if (d.type === 'rectangle') {
        const x = d.points[0].x;
        const y = d.points[0].y;
        const w = d.points[1].x - x;
        const h = d.points[1].y - y;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = d.color + '22';
        ctx.fillRect(x, y, w, h);
      } else if (d.type === 'brush') {
        ctx.moveTo(d.points[0].x, d.points[0].y);
        for (let i = 1; i < d.points.length; i++) {
          ctx.lineTo(d.points[i].x, d.points[i].y);
        }
      }
      ctx.stroke();
    };

    drawings.forEach(renderDrawing);
    if (currentDrawing) renderDrawing(currentDrawing);

    // Crosshair
    if (activeTool === 'crosshair') {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.setLineDash([10, 10]);
      ctx.lineWidth = 2;
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(CANVAS_WIDTH, mousePos.y);
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);
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
        else setTimeout(() => onAnimationComplete?.(), 300);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      draw(candles);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [candles, isAnimating, settings, drawings, currentDrawing, mousePos, activeTool]);

  return (
    <div className={`landscape-card-container ${activeTool ? 'cursor-none' : 'cursor-crosshair'}`}>
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full object-contain"
      />
    </div>
  );
});

ChartRenderer.displayName = "ChartRenderer";
export default ChartRenderer;
