"use client";

import React from "react";
import { Candlestick } from "@/lib/chart-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, BarChart4 } from "lucide-react";
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
  const visibleCandles = [...candles].reverse().slice(0, 200);

  return (
    <div className="space-y-4">
      {visibleCandles.map((c, i) => {
        const idx = candles.length - 1 - i;
        const isBullish = c.close >= c.open;
        
        return (
          <div key={`${idx}-${candles.length}`} className="bg-white/5 border border-white/5 rounded-2xl p-4 group hover:bg-white/[0.08] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-muted-foreground">BAR #{idx + 1}</span>
                <div className={`w-2 h-2 rounded-full ${isBullish ? 'bg-[#00b386]' : 'bg-[#f23645]'}`} />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                onClick={() => onRemove(idx)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Type</span>
                <Select 
                  value={c.close >= c.open ? (Math.abs(c.close - c.open) < 0.1 ? 'doji' : 'bullish') : 'bearish'} 
                  onValueChange={(val) => {
                    const body = Math.abs(c.close - c.open);
                    if(val === 'bullish') onChange(idx, { ...c, close: c.open + body });
                    else if(val === 'bearish') onChange(idx, { ...c, close: c.open - body });
                    else onChange(idx, { ...c, close: c.open });
                  }}
                >
                  <SelectTrigger className="h-9 text-[11px] bg-[#0b0e14] border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c212f] border-white/10 text-white">
                    <SelectItem value="bullish">🟩 Bullish</SelectItem>
                    <SelectItem value="bearish">🟥 Bearish</SelectItem>
                    <SelectItem value="doji">⬛ Doji</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Offset Y</span>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={c.offsetY} 
                    onChange={(e) => onChange(idx, { ...c, offsetY: Number(e.target.value) })}
                    className="h-9 text-[11px] bg-[#0b0e14] border-white/10 pl-5 font-bold"
                  />
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground">Y</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#0b0e14] rounded-xl p-2 text-center border border-white/5">
                <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1">Body</span>
                <Input 
                  type="number" 
                  value={Math.abs(c.close - c.open)} 
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    onChange(idx, { ...c, close: isBullish ? c.open + val : c.open - val });
                  }}
                  className="h-6 bg-transparent border-none text-center text-[12px] font-bold p-0 focus-visible:ring-0"
                />
              </div>
              <div className="bg-[#0b0e14] rounded-xl p-2 text-center border border-primary/20">
                <span className="text-[8px] font-bold text-primary uppercase block mb-1">Top Wick</span>
                <Input 
                  type="number" 
                  value={Math.max(0, c.high - Math.max(c.open, c.close))} 
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    onChange(idx, { ...c, high: Math.max(c.open, c.close) + val });
                  }}
                  className="h-6 bg-transparent border-none text-center text-[12px] font-bold p-0 focus-visible:ring-0"
                />
              </div>
              <div className="bg-[#0b0e14] rounded-xl p-2 text-center border border-destructive/20">
                <span className="text-[8px] font-bold text-destructive uppercase block mb-1">Bot Wick</span>
                <Input 
                  type="number" 
                  value={Math.min(c.open, c.close) - c.low} 
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    onChange(idx, { ...c, low: Math.min(c.open, c.close) - val });
                  }}
                  className="h-6 bg-transparent border-none text-center text-[12px] font-bold p-0 focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
        );
      })}
      
      {candles.length === 0 && (
        <div className="text-center py-16 opacity-30">
          <BarChart4 className="w-10 h-10 mx-auto mb-3" />
          <p className="text-[10px] font-bold uppercase tracking-widest">No Candles Active</p>
        </div>
      )}
    </div>
  );
};

export default ManualEditor;
