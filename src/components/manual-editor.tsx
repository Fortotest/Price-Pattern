"use client";

import React from "react";
import { Candlestick } from "@/lib/chart-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, BarChart4 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const ManualEditor: React.FC<ManualEditorProps> = ({ candles, onChange, onAdd, onRemove, onClear }) => {
  const visibleCandles = [...candles].reverse().slice(0, 200);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-2 shrink-0">
        <Button onClick={() => onAdd('Bullish')} className="flex-1 bg-[#089981] hover:bg-[#089981]/90 font-bold h-10 gap-2">
          <Plus className="w-4 h-4" /> Bullish
        </Button>
        <Button onClick={() => onAdd('Bearish')} variant="destructive" className="flex-1 font-bold h-10 gap-2 bg-[#f23645] hover:bg-[#f23645]/90">
          <Plus className="w-4 h-4" /> Bearish
        </Button>
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Activity</span>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-6 text-[10px] font-bold text-destructive hover:bg-destructive/10 px-2 rounded-md">
          Reset All
        </Button>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-3 pb-4">
          {visibleCandles.map((c, i) => {
            const idx = candles.length - 1 - i;
            const isBullish = c.close >= c.open;
            
            return (
              <div key={idx} className="bg-secondary/20 border border-border/50 rounded-xl p-3 group hover:border-primary/50 transition-all duration-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-border group-hover:bg-primary transition-colors" />
                
                <div className="flex items-center justify-between mb-3 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground/60">BAR #{idx + 1}</span>
                    <div className={`w-2 h-2 rounded-full ${isBullish ? 'bg-[#089981]' : 'bg-[#f23645]'}`} />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(idx)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Arah</span>
                    <Select 
                      value={c.close >= c.open ? (Math.abs(c.close - c.open) < 0.1 ? 'doji' : 'bullish') : 'bearish'} 
                      onValueChange={(val) => {
                        const body = Math.abs(c.close - c.open);
                        if(val === 'bullish') onChange(idx, { ...c, close: c.open + body });
                        else if(val === 'bearish') onChange(idx, { ...c, close: c.open - body });
                        else onChange(idx, { ...c, close: c.open });
                      }}
                    >
                      <SelectTrigger className="h-8 text-[11px] bg-background border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bullish">🟩 Bullish</SelectItem>
                        <SelectItem value="bearish">🟥 Bearish</SelectItem>
                        <SelectItem value="doji">⬛ Doji</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Posisi Y</span>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={c.offsetY} 
                        onChange={(e) => onChange(idx, { ...c, offsetY: Number(e.target.value) })}
                        className="h-8 text-[11px] bg-background border-border/50 pl-5 font-bold"
                      />
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground">Y</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-background border border-border/50 rounded-lg p-1.5 text-center flex flex-col justify-center">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Body</span>
                    <Input 
                      type="number" 
                      value={Math.abs(c.close - c.open)} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onChange(idx, { ...c, close: isBullish ? c.open + val : c.open - val });
                      }}
                      className="h-6 bg-transparent border-none text-center text-[11px] font-bold p-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="bg-background border border-border/50 rounded-lg p-1.5 text-center flex flex-col justify-center border-t-primary/30">
                    <span className="text-[8px] font-bold text-primary uppercase">Top Wick</span>
                    <Input 
                      type="number" 
                      value={Math.max(0, c.high - Math.max(c.open, c.close))} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onChange(idx, { ...c, high: Math.max(c.open, c.close) + val });
                      }}
                      className="h-6 bg-transparent border-none text-center text-[11px] font-bold p-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="bg-background border border-border/50 rounded-lg p-1.5 text-center flex flex-col justify-center border-b-destructive/30">
                    <span className="text-[8px] font-bold text-destructive uppercase">Bot Wick</span>
                    <Input 
                      type="number" 
                      value={Math.min(c.open, c.close) - c.low} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onChange(idx, { ...c, low: Math.min(c.open, c.close) - val });
                      }}
                      className="h-6 bg-transparent border-none text-center text-[11px] font-bold p-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {candles.length === 0 && (
            <div className="text-center py-10 opacity-40">
              <BarChart4 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No Candles Active</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ManualEditor;