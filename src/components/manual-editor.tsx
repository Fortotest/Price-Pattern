"use client";

import React from "react";
import { Candlestick } from "@/lib/chart-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
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
  onAdd: (type: 'Bullish' | 'Bearish') => void;
  onRemove: (index: number) => void;
  onClear: () => void;
}

const ManualEditor: React.FC<ManualEditorProps> = ({ candles, onChange, onRemove }) => {
  const visibleCandles = [...candles].reverse().slice(0, 50);

  return (
    <div className="space-y-2">
      {visibleCandles.map((c, i) => {
        const idx = candles.length - 1 - i;
        const isBullish = c.close >= c.open;
        
        return (
          <div key={`${idx}-${candles.length}`} className="bg-white/5 border border-white/5 rounded-lg p-3 group transition-colors hover:bg-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-muted-foreground">#{idx + 1}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${isBullish ? 'bg-[#00b386]' : 'bg-[#f23645]'}`} />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-red-400"
                onClick={() => onRemove(idx)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Select 
                value={c.close >= c.open ? 'bullish' : 'bearish'} 
                onValueChange={(val) => {
                  const body = Math.abs(c.close - c.open);
                  if(val === 'bullish') onChange(idx, { ...c, close: c.open + body });
                  else onChange(idx, { ...c, close: c.open - body });
                }}
              >
                <SelectTrigger className="h-7 text-[10px] bg-black border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1c212f] border-white/10 text-white">
                  <SelectItem value="bullish">Bullish</SelectItem>
                  <SelectItem value="bearish">Bearish</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Input 
                  type="number" 
                  value={c.offsetY} 
                  onChange={(e) => onChange(idx, { ...c, offsetY: Number(e.target.value) })}
                  className="h-7 text-[10px] bg-black border-white/10 pl-5"
                />
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-bold text-muted-foreground">Y</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <div className="bg-black/40 rounded p-1 text-center border border-white/5">
                <span className="text-[7px] text-muted-foreground uppercase block mb-0.5">Body</span>
                <Input 
                  type="number" 
                  value={Math.abs(c.close - c.open)} 
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    onChange(idx, { ...c, close: isBullish ? c.open + val : c.open - val });
                  }}
                  className="h-5 bg-transparent border-none text-center text-[10px] p-0 focus-visible:ring-0"
                />
              </div>
              <div className="bg-black/40 rounded p-1 text-center border border-primary/20">
                <span className="text-[7px] text-primary uppercase block mb-0.5">Top</span>
                <Input 
                  type="number" 
                  value={Math.max(0, c.high - Math.max(c.open, c.close))} 
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    onChange(idx, { ...c, high: Math.max(c.open, c.close) + val });
                  }}
                  className="h-5 bg-transparent border-none text-center text-[10px] p-0 focus-visible:ring-0"
                />
              </div>
              <div className="bg-black/40 rounded p-1 text-center border border-destructive/20">
                <span className="text-[7px] text-destructive uppercase block mb-0.5">Bot</span>
                <Input 
                  type="number" 
                  value={Math.min(c.open, c.close) - c.low} 
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    onChange(idx, { ...c, low: Math.min(c.open, c.close) - val });
                  }}
                  className="h-5 bg-transparent border-none text-center text-[10px] p-0 focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ManualEditor;
