
"use client";

import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { Candlestick } from "@/lib/chart-types";
import { Button } from "@/components/ui/button";
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
  colorClass = "text-foreground",
  min = -5000,
  ariaLabel
}: { 
  label?: string, 
  value: number, 
  onChange: (val: number) => void,
  colorClass?: string,
  min?: number,
  ariaLabel?: string
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
    <div className="bg-black/40 rounded-md flex flex-col border border-border group/input transition-colors hover:border-muted-foreground/30 h-10 w-full overflow-hidden">
      {label && (
        <span className={`text-[7px] font-black uppercase tracking-widest pt-1 px-2 ${colorClass}`}>
          {label}
        </span>
      )}
      <div className="flex items-center flex-1">
        <input
          aria-label={ariaLabel || label || "Input value"}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="flex-1 bg-transparent text-center font-mono text-[10px] font-bold text-foreground border-none outline-none focus:ring-0 w-full h-full"
        />
        <div className="w-5 h-full flex flex-col border-l border-border overflow-hidden">
          <button 
            aria-label="Increase value"
            onPointerDown={() => startAdjusting(1)}
            onPointerUp={stopAdjusting}
            onPointerLeave={stopAdjusting}
            className="flex-1 flex items-center justify-center bg-black/60 hover:bg-muted/30 border-b border-border transition-colors active:bg-primary/20"
          >
            <ChevronUp className="w-2.5 h-2.5 text-muted-foreground group-hover/input:text-foreground" />
          </button>
          <button 
            aria-label="Decrease value"
            onPointerDown={() => startAdjusting(-1)}
            onPointerUp={stopAdjusting}
            onPointerLeave={stopAdjusting}
            className="flex-1 flex items-center justify-center bg-black/60 hover:bg-muted/30 transition-colors active:bg-primary/20"
          >
            <ChevronDown className="w-2.5 h-2.5 text-muted-foreground group-hover/input:text-foreground" />
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

        let statusColor = "bg-muted-foreground/30";
        if (bodyDiff > 5) statusColor = "bg-primary shadow-[0_0_8px_rgba(0,255,157,0.6)]";
        else if (bodyDiff < -5) statusColor = "bg-destructive shadow-[0_0_8px_rgba(255,59,48,0.6)]";
        else statusColor = "bg-muted-foreground";

        return (
          <div key={c.id} className="bg-black/40 border border-border rounded-lg p-2.5 group transition-all hover:border-muted-foreground/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="w-3 h-3 text-muted-foreground/20" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Bar #{idx + 1}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${statusColor} recording-pulse`} />
              </div>
              <Button 
                aria-label={`Hapus bar ${idx + 1}`}
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                onClick={() => onRemove(idx)}
              >
                <Trash2 className="w-2.5 h-2.5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="space-y-1">
                <CustomNumberInput 
                  label="Offset Y"
                  ariaLabel={`Offset vertical bar ${idx + 1}`}
                  value={c.offsetY || 0} 
                  onChange={(val) => onChange(idx, { ...c, offsetY: val })}
                />
              </div>
              <div className="flex flex-col justify-end">
                <Button 
                   aria-label={`Balik arah bar ${idx + 1}`}
                   variant="outline" 
                   className="h-10 text-[9px] bg-black border-border font-black hover:bg-muted/20 uppercase tracking-[1px] transition-all active:scale-95 text-foreground rounded-md"
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
                ariaLabel={`Ukuran bodi bar ${idx + 1}`}
                value={bodySize} 
                min={0}
                colorClass={bodyDiff > 5 ? "text-primary" : (bodyDiff < -5 ? "text-destructive" : "text-muted-foreground")}
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
                ariaLabel={`Sumbu atas bar ${idx + 1}`}
                value={topWickSize} 
                colorClass="text-primary"
                min={0}
                onChange={(val) => onChange(idx, { ...c, high: Math.max(c.open, c.close) + val })} 
              />
              <CustomNumberInput 
                label="Bot Wick" 
                ariaLabel={`Sumbu bawah bar ${idx + 1}`}
                value={botWickSize} 
                colorClass="text-destructive"
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
