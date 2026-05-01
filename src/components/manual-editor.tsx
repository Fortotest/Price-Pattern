
"use client";

import React from "react";
import { Candlestick } from "@/lib/chart-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical } from "lucide-react";
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

const ManualEditor: React.FC<ManualEditorProps> = ({ candles, onChange, onRemove }) => {
  // Tampilkan bar terbaru di paling atas (reversed visual)
  const reversedIndices = Array.from({ length: candles.length }, (_, i) => candles.length - 1 - i);

  return (
    <div className="space-y-3">
      {reversedIndices.map((idx) => {
        const c = candles[idx];
        const isBullish = c.close >= c.open;
        
        return (
          <div key={`${idx}-${candles.length}`} className="bg-white/5 border border-white/5 rounded-lg p-3 group transition-all hover:bg-white/[0.08] hover:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">Bar #{idx + 1}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${isBullish ? 'bg-[#00b386]' : 'bg-[#f23645]'}`} />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-full"
                onClick={() => onRemove(idx)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="space-y-1">
                <Label className="text-[8px] uppercase text-muted-foreground">Type</Label>
                <Select 
                  value={c.close >= c.open ? 'bullish' : 'bearish'} 
                  onValueChange={(val) => {
                    const body = Math.abs(c.close - c.open);
                    if(val === 'bullish') onChange(idx, { ...c, close: c.open + body });
                    else onChange(idx, { ...c, close: c.open - body });
                  }}
                >
                  <SelectTrigger className="h-8 text-[10px] bg-black border-white/5 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c212f] border-white/10 text-white">
                    <SelectItem value="bullish">🟩 Bullish</SelectItem>
                    <SelectItem value="bearish">🟥 Bearish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[8px] uppercase text-muted-foreground">Offset Y</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={c.offsetY || 0} 
                    onChange={(e) => onChange(idx, { ...c, offsetY: Number(e.target.value) })}
                    className="h-8 text-[10px] bg-black border-white/5 font-mono text-center px-6"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-primary">Y</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/60 rounded-md p-2 text-center border border-white/5">
                <Label className="text-[7px] text-muted-foreground uppercase font-bold block mb-1">Body</Label>
                <Input 
                  type="number" 
                  value={Math.abs(c.close - c.open)} 
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    onChange(idx, { ...c, close: isBullish ? c.open + val : c.open - val });
                  }}
                  className="h-6 bg-transparent border-none text-center text-[11px] p-0 font-mono font-bold focus-visible:ring-0"
                />
              </div>
              <div className="bg-black/60 rounded-md p-2 text-center border border-primary/10">
                <Label className="text-[7px] text-primary uppercase font-bold block mb-1">Top Wick</Label>
                <Input 
                  type="number" 
                  value={Math.max(0, Math.round(c.high - Math.max(c.open, c.close)))} 
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    onChange(idx, { ...c, high: Math.max(c.open, c.close) + val });
                  }}
                  className="h-6 bg-transparent border-none text-center text-[11px] p-0 font-mono font-bold focus-visible:ring-0"
                />
              </div>
              <div className="bg-black/60 rounded-md p-2 text-center border border-destructive/10">
                <Label className="text-[7px] text-destructive uppercase font-bold block mb-1">Bot Wick</Label>
                <Input 
                  type="number" 
                  value={Math.round(Math.min(c.open, c.close) - c.low)} 
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    onChange(idx, { ...c, low: Math.min(c.open, c.close) - val });
                  }}
                  className="h-6 bg-transparent border-none text-center text-[11px] p-0 font-mono font-bold focus-visible:ring-0"
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
