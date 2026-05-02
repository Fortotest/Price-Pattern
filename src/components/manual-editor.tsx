
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
  colorClass = "text-white",
  min = -5000,
}: { 
  label?: string, 
  value: number, 
  onChange: (val: number) => void,
  colorClass?: string,
  min?: number,
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
    <div className="bg-[#0d0d0d] rounded-md flex flex-col border border-white/5 group/input transition-colors hover:border-white/10 h-14 w-full overflow-hidden">
      {label && (
        <span className={`text-[8px] font-black uppercase tracking-widest pt-1.5 px-2 ${colorClass}`}>
          {label}
        </span>
      )}
      <div className="flex items-center flex-1">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="flex-1 bg-transparent text-center font-mono text-[11px] font-bold text-white border-none outline-none focus:ring-0 w-full h-full"
        />
        <div className="w-5 h-full flex flex-col border-l border-white/5 overflow-hidden">
          <button 
            onPointerDown={() => startAdjusting(1)}
            onPointerUp={stopAdjusting}
            onPointerLeave={stopAdjusting}
            className="flex-1 flex items-center justify-center bg-[#151515] hover:bg-[#222] border-b border-white/5 transition-colors active:bg-primary/20"
          >
            <ChevronUp className="w-3 h-3 text-white/40 group-hover/input:text-white" />
          </button>
          <button 
            onPointerDown={() => startAdjusting(-1)}
            onPointerUp={stopAdjusting}
            onPointerLeave={stopAdjusting}
            className="flex-1 flex items-center justify-center bg-[#151515] hover:bg-[#222] transition-colors active:bg-primary/20"
          >
            <ChevronDown className="w-3 h-3 text-white/40 group-hover/input:text-white" />
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
    <div className="space-y-3">
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
          <div key={c.id} className="bg-[#070707] border border-white/5 rounded-xl p-3 group transition-all hover:border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-3 h-3 text-white/10" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Bar #{idx + 1}</span>
                <div className={`w-2 h-2 rounded-full ${statusColor} shadow-[0_0_8px_rgba(255,255,255,0.1)]`} />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                onClick={() => onRemove(idx)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-white/30 tracking-widest ml-1">Offset Y</Label>
                <CustomNumberInput 
                  value={c.offsetY || 0} 
                  onChange={(val) => onChange(idx, { ...c, offsetY: val })}
                />
              </div>
              <div className="flex flex-col justify-end">
                <Button 
                   variant="outline" 
                   className="h-14 text-[10px] bg-black border-white/10 font-black hover:bg-white/5 uppercase tracking-[2px] transition-all active:scale-95"
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

            <div className="grid grid-cols-3 gap-2">
              <CustomNumberInput 
                label="Body" 
                value={bodySize} 
                min={0}
                colorClass={bodyDiff > 5 ? "text-emerald-500" : (bodyDiff < -5 ? "text-red-500" : "text-white/40")}
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
