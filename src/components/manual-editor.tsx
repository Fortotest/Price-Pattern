
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
    <div className="bg-[#0d0d0d] rounded-md p-2 flex flex-col items-center justify-between border border-white/5 h-20 w-full">
      <span className={`text-[8px] font-bold uppercase tracking-wider ${colorClass}`}>{label}</span>
      <div className="flex items-center w-full flex-1">
        <div className="flex-1 text-center font-mono text-xl font-bold text-white">
          {Math.round(value)}
        </div>
        <div className="w-6 h-full flex flex-col border-l border-white/5 overflow-hidden rounded-r-sm">
          <button 
            onClick={() => onChange(value + 1)}
            className="flex-1 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] border-b border-white/5"
          >
            <ChevronUp className="w-3 h-3 text-white/50" />
          </button>
          <button 
            onClick={() => onChange(Math.max(0, value - 1))}
            className="flex-1 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222]"
          >
            <ChevronDown className="w-3 h-3 text-white/50" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ManualEditor: React.FC<ManualEditorProps> = ({ candles, onChange, onRemove }) => {
  const reversedIndices = Array.from({ length: candles.length }, (_, i) => candles.length - 1 - i);

  return (
    <div className="space-y-3">
      {reversedIndices.map((idx) => {
        const c = candles[idx];
        const isBullish = c.close >= c.open;
        
        return (
          <div key={`${idx}-${candles.length}`} className="bg-[#0a0a0a] border border-white/5 rounded-lg p-3 group transition-all hover:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-3 h-3 text-muted-foreground/30" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Bar #{idx + 1}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${isBullish ? 'bg-[#00b386]' : 'bg-[#f23645]'}`} />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                onClick={() => onRemove(idx)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="space-y-1">
                <Label className="text-[7px] uppercase text-muted-foreground tracking-widest font-bold">Type</Label>
                <Select 
                  value={c.close >= c.open ? 'bullish' : 'bearish'} 
                  onValueChange={(val) => {
                    const body = Math.abs(c.close - c.open);
                    if(val === 'bullish') onChange(idx, { ...c, close: c.open + body });
                    else onChange(idx, { ...c, close: c.open - body });
                  }}
                >
                  <SelectTrigger className="h-7 text-[9px] bg-black border-white/5 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c212f] border-white/10 text-white">
                    <SelectItem value="bullish">🟩 Bullish</SelectItem>
                    <SelectItem value="bearish">🟥 Bearish</SelectItem>
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
                  className="h-7 text-[9px] bg-black border-white/5 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <CustomNumberInput 
                label="Body" 
                value={Math.abs(c.close - c.open)} 
                colorClass="text-emerald-500"
                onChange={(val) => {
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
