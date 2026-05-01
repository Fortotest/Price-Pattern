
"use client";

import React from "react";
import { Candlestick } from "@/lib/chart-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  colorClass = "text-primary" 
}: { 
  label: string, 
  value: number, 
  onChange: (val: number) => void,
  colorClass?: string
}) => {
  return (
    <div className="bg-[#0d0d0d] rounded-md p-1.5 flex flex-col items-center justify-between border border-white/5 h-16 w-full">
      <span className={`text-[7px] font-bold uppercase tracking-wider ${colorClass}`}>{label}</span>
      <div className="flex items-center w-full flex-1">
        <div className="flex-1 text-center font-mono text-sm font-bold text-white">
          {Math.round(value)}
        </div>
        <div className="w-5 h-full flex flex-col border-l border-white/5 overflow-hidden rounded-r-sm">
          <button 
            onClick={() => onChange(value + 1)}
            className="flex-1 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] border-b border-white/5"
          >
            <ChevronUp className="w-2.5 h-2.5 text-white/50" />
          </button>
          <button 
            onClick={() => onChange(Math.max(0, value - 1))}
            className="flex-1 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222]"
          >
            <ChevronDown className="w-2.5 h-2.5 text-white/50" />
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
        const isBullish = c.close > c.open;
        const isBearish = c.close < c.open;
        const isDoji = c.close === c.open;
        
        let statusColor = "bg-[#333]";
        if (isBullish) statusColor = "bg-[#00b386]";
        if (isBearish) statusColor = "bg-[#f23645]";

        return (
          <div key={`${idx}-${candles.length}`} className="bg-[#0a0a0a] border border-white/5 rounded-lg p-2 group transition-all hover:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="w-2.5 h-2.5 text-muted-foreground/30" />
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Bar #{idx + 1}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                onClick={() => onRemove(idx)}
              >
                <Trash2 className="w-2.5 h-2.5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="space-y-1">
                <Label className="text-[7px] uppercase text-muted-foreground tracking-widest font-bold">Type</Label>
                <Select 
                  value={isBullish ? 'bullish' : (isBearish ? 'bearish' : 'doji')} 
                  onValueChange={(val) => {
                    if (val === 'doji') {
                      onChange(idx, { ...c, close: c.open });
                    } else {
                      const body = Math.abs(c.close - c.open) || 10;
                      if(val === 'bullish') onChange(idx, { ...c, close: c.open + body });
                      else onChange(idx, { ...c, close: c.open - body });
                    }
                  }}
                >
                  <SelectTrigger className="h-6 text-[8px] bg-black border-white/5 font-bold p-1 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c212f] border-white/10 text-white">
                    <SelectItem value="bullish">🟩 BULLISH</SelectItem>
                    <SelectItem value="bearish">🟥 BEARISH</SelectItem>
                    <SelectItem value="doji">⬜ DOJI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[7px] uppercase text-muted-foreground tracking-widest font-bold">Offset Y</Label>
                <Input 
                  type="number" 
                  value={c.offsetY || 0} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onChange(idx, { ...c, offsetY: val });
                  }}
                  className="h-6 text-[8px] bg-black border-white/5 font-mono px-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <CustomNumberInput 
                label="Body" 
                value={Math.abs(c.close - c.open)} 
                colorClass={isBullish ? "text-emerald-500" : (isBearish ? "text-red-500" : "text-white")}
                onChange={(val) => {
                  if (isDoji) return; // Cannot change body if it's a doji via this field
                  onChange(idx, { ...c, close: isBullish ? c.open + val : c.open - val });
                }} 
              />
              <CustomNumberInput 
                label="Top Wick" 
                value={Math.max(0, Math.round(c.high - Math.max(c.open, c.close)))} 
                colorClass="text-emerald-500"
                onChange={(val) => {
                  onChange(idx, { ...c, high: Math.max(c.open, c.close) + val });
                }} 
              />
              <CustomNumberInput 
                label="Bot Wick" 
                value={Math.round(Math.min(c.open, c.close) - c.low)} 
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
