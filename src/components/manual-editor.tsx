
"use client";

import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { Candlestick } from "@/lib/chart-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

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
  min = -5000,
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
  const [inputValue, setInputValue] = useState(Math.round(value).toString());

  useEffect(() => {
    setInputValue(Math.round(value).toString());
  }, [value]);

  const stopAdjusting = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const handleStep = useCallback((delta: number) => {
    const nextVal = Math.round(value + delta);
    if (Number.isFinite(nextVal)) {
      onChange(nextVal);
    }
  }, [onChange, value]);

  const startAdjusting = useCallback((delta: number) => {
    stopAdjusting();
    handleStep(delta);
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        handleStep(delta);
      }, 60);
    }, 300);
  }, [handleStep, stopAdjusting]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    const parsed = parseInt(rawValue);
    if (!isNaN(parsed) && Number.isFinite(parsed)) {
      onChange(Math.max(min, parsed));
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue);
    if (isNaN(parsed) || !Number.isFinite(parsed)) {
      setInputValue(Math.round(value).toString());
    } else {
      const finalVal = Math.max(min, parsed);
      setInputValue(finalVal.toString());
      onChange(finalVal);
    }
  };

  return (
    <div className={`bg-[#0d0d0d] rounded-md flex flex-col items-center justify-between border border-white/5 group/input transition-colors hover:border-white/10 ${compact ? 'h-10' : 'h-14'} w-full`}>
      {label && <span className={`text-[7px] font-bold uppercase tracking-wider pt-1 ${colorClass}`}>{label}</span>}
      <div className="flex items-center w-full flex-1">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="flex-1 bg-transparent text-center font-mono text-[10px] font-bold text-white border-none outline-none focus:ring-0 w-full h-full"
        />
        <div className="w-4 h-full flex flex-col border-l border-white/5 overflow-hidden rounded-r-sm">
          <button 
            onPointerDown={() => startAdjusting(1)}
            onPointerUp={stopAdjusting}
            onPointerLeave={stopAdjusting}
            className="flex-1 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] border-b border-white/5 transition-colors active:bg-primary/20"
          >
            <ChevronUp className="w-2 h-2 text-white/50 group-hover/input:text-white" />
          </button>
          <button 
            onPointerDown={() => startAdjusting(-1)}
            onPointerUp={stopAdjusting}
            onPointerLeave={stopAdjusting}
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
  const items = useMemo(() => {
    return [...candles].reverse().map((c, i) => ({
      candle: c,
      originalIndex: candles.length - 1 - i
    }));
  }, [candles]);

  return (
    <div className="space-y-2">
      {items.map(({ candle: c, originalIndex: idx }) => {
        const bodyDiff = c.close - c.open;
        const bodySize = Math.abs(bodyDiff);
        const topWickSize = Math.max(0, c.high - Math.max(c.open, c.close));
        const botWickSize = Math.max(0, Math.min(c.open, c.close) - c.low);

        let statusColor = "bg-[#333]";
        if (bodyDiff > 5) statusColor = "bg-[#00b386]";
        else if (bodyDiff < -5) statusColor = "bg-[#f23645]";
        else statusColor = "bg-slate-400";

        return (
          <div key={c.id} className="bg-[#0a0a0a] border border-white/5 rounded-lg p-2 group transition-all hover:border-white/10">
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
                <Label className="text-[7px] uppercase text-muted-foreground tracking-widest font-bold">Offset Y</Label>
                <CustomNumberInput 
                  value={c.offsetY || 0} 
                  onChange={(val) => onChange(idx, { ...c, offsetY: val })}
                  compact
                  colorClass="text-white"
                />
              </div>
              <div className="space-y-1 flex flex-col justify-end">
                <Button 
                   variant="outline" 
                   className="h-10 text-[7px] bg-black border-white/5 font-bold hover:bg-white/5 uppercase"
                   onClick={() => {
                     const isBullish = bodyDiff >= 0;
                     const newClose = isBullish ? c.open - bodySize : c.open + bodySize;
                     onChange(idx, { 
                       ...c, 
                       close: newClose,
                       high: Math.max(c.open, newClose) + topWickSize,
                       low: Math.min(c.open, newClose) - botWickSize
                     });
                   }}
                >
                  Flip
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <CustomNumberInput 
                label="Body" 
                value={bodySize} 
                min={0}
                colorClass={bodyDiff > 5 ? "text-emerald-500" : (bodyDiff < -5 ? "text-red-500" : "text-white")}
                onChange={(val) => {
                  const direction = bodyDiff < 0 ? -1 : 1;
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
                min={0}
                onChange={(val) => onChange(idx, { ...c, high: Math.max(c.open, c.close) + val })} 
              />
              <CustomNumberInput 
                label="Bot Wick" 
                value={botWickSize} 
                colorClass="text-red-500"
                min={0}
                onChange={(val) => onChange(idx, { ...c, low: Math.min(c.open, c.close) - val })} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ManualEditor;
