
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Candlestick } from "@/lib/chart-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ManualEditorProps {
  candles: Candlestick[];
  onChange: (index: number, candle: Candlestick) => void;
  onRemove: (index: number) => void;
}

const CustomNumberInput = ({ 
  label, 
  value, 
  onChange, 
  colorClass = "text-primary",
  min = 0,
  compact = false
}: { 
  label?: string, 
  value: number, 
  onChange: (val: number) => void,
  colorClass?: string,
  min?: number,
  compact?: boolean
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = Number.isFinite(value) ? value : 0;
  }, [value]);

  const handleStep = useCallback((delta: number) => {
    const currentVal = Number.isFinite(valueRef.current) ? valueRef.current : 0;
    const newValue = Math.max(min, Math.round(currentVal + delta));
    onChange(newValue);
  }, [onChange, min]);

  const stopAdjusting = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
  }, []);

  const startAdjusting = useCallback((delta: number) => {
    stopAdjusting();
    handleStep(delta);
    
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        handleStep(delta);
      }, 50);
    }, 350);
  }, [handleStep, stopAdjusting]);

  const displayValue = Number.isFinite(value) ? Math.round(value) : 0;

  return (
    <div className={`bg-[#0d0d0d] rounded-md flex flex-col items-center justify-between border border-white/5 group/input transition-colors hover:border-white/10 ${compact ? 'h-10' : 'h-14'} w-full`}>
      {label && <span className={`text-[7px] font-bold uppercase tracking-wider pt-1 ${colorClass}`}>{label}</span>}
      <div className="flex items-center w-full flex-1">
        <div className="flex-1 text-center font-mono text-[10px] font-bold text-white">
          {displayValue}
        </div>
        <div className="w-4 h-full flex flex-col border-l border-white/5 overflow-hidden rounded-r-sm">
          <button 
            onMouseDown={() => startAdjusting(1)}
            onMouseUp={stopAdjusting}
            onMouseLeave={stopAdjusting}
            className="flex-1 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] border-b border-white/5 transition-colors active:bg-primary/20"
          >
            <ChevronUp className="w-2 h-2 text-white/50 group-hover/input:text-white" />
          </button>
          <button 
            onMouseDown={() => startAdjusting(-1)}
            onMouseUp={stopAdjusting}
            onMouseLeave={stopAdjusting}
            className="flex-1 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] transition-colors active:bg-primary/20"
          >
            <ChevronDown className="w-2 h-2 text-white/50 group-hover/input:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ManualEditor: React.FC<ManualEditorProps> = ({ candles, onChange, onRemove }) => {
  const reversedIndices = Array.from({ length: candles.length }, (_, i) => candles.length - 1 - i);

  return (
    <div className="space-y-2">
      {reversedIndices.map((idx) => {
        const c = candles[idx];
        const bodyPrice = c.close - c.open;
        
        let statusColor = "bg-[#333]";
        if (bodyPrice > 10) statusColor = "bg-[#00b386]";
        else if (bodyPrice < -10) statusColor = "bg-[#f23645]";
        else statusColor = "bg-slate-400";

        const bodySize = Math.abs(bodyPrice);
        const topWickSize = Math.max(0, c.high - Math.max(c.open, c.close));
        const botWickSize = Math.max(0, Math.min(c.open, c.close) - c.low);

        return (
          <div key={`${idx}-${candles.length}`} className="bg-[#0a0a0a] border border-white/5 rounded-lg p-2 group transition-all hover:border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <GripVertical className="w-2 h-2 text-muted-foreground/30" />
                <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-tight">Bar #{idx + 1}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                onClick={() => onRemove(idx)}
              >
                <Trash2 className="w-2 h-2" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="space-y-1">
                <Label className="text-[7px] uppercase text-muted-foreground tracking-widest font-bold">Type</Label>
                <Select 
                  value={bodyPrice > 10 ? 'bullish' : (bodyPrice < -10 ? 'bearish' : 'doji')} 
                  onValueChange={(val) => {
                    if (val === 'doji') {
                      onChange(idx, { 
                        ...c, 
                        close: c.open + 10,
                        high: Math.max(c.open, c.open + 10) + topWickSize,
                        low: Math.min(c.open, c.open + 10) - botWickSize
                      });
                    } else {
                      const body = bodySize > 10 ? bodySize : 40;
                      if(val === 'bullish') {
                        const newClose = c.open + body;
                        onChange(idx, { ...c, close: newClose, high: newClose + topWickSize, low: c.open - botWickSize });
                      } else {
                        const newClose = c.open - body;
                        onChange(idx, { ...c, close: newClose, high: c.open + topWickSize, low: newClose - botWickSize });
                      }
                    }
                  }}
                >
                  <SelectTrigger className="h-10 text-[7px] bg-black border-white/5 font-bold p-1 px-2 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c212f] border-white/10 text-white">
                    <SelectItem value="bullish" className="text-[8px]">🟩 BULLISH</SelectItem>
                    <SelectItem value="bearish" className="text-[8px]">🟥 BEARISH</SelectItem>
                    <SelectItem value="doji" className="text-[8px]">⬜ DOJI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[7px] uppercase text-muted-foreground tracking-widest font-bold">Offset Y</Label>
                <CustomNumberInput 
                  value={c.offsetY || 0} 
                  onChange={(val) => onChange(idx, { ...c, offsetY: val })}
                  min={-2000}
                  compact
                  colorClass="text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <CustomNumberInput 
                label="Body" 
                value={bodySize} 
                colorClass={bodyPrice > 10 ? "text-emerald-500" : (bodyPrice < -10 ? "text-red-500" : "text-white")}
                onChange={(val) => {
                  const direction = bodyPrice < 0 ? -1 : 1;
                  const newClose = c.open + (val * direction);
                  onChange(idx, { 
                    ...c, 
                    close: newClose,
                    high: Math.max(c.open, newClose) + topWickSize,
                    low: Math.min(c.open, newClose) - botWickSize
                  });
                }} 
              />
              <CustomNumberInput 
                label="Top Wick" 
                value={topWickSize} 
                colorClass="text-emerald-500"
                onChange={(val) => {
                  onChange(idx, { ...c, high: Math.max(c.open, c.close) + val });
                }} 
              />
              <CustomNumberInput 
                label="Bot Wick" 
                value={botWickSize} 
                colorClass="text-red-500"
                onChange={(val) => {
                  onChange(idx, { ...c, low: Math.min(c.open, c.close) - val });
                }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ManualEditor;
