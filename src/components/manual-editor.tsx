"use client";

import React from "react";
import { Candlestick } from "@/lib/chart-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Zap, ArrowUpCircle, ArrowDownCircle, MoveVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManualEditorProps {
  candles: Candlestick[];
  onChange: (index: number, candle: Candlestick) => void;
  onAdd: (type: 'Bullish' | 'Bearish') => void;
  onRemove: (index: number) => void;
  onClear: () => void;
}

const ManualEditor: React.FC<ManualEditorProps> = ({ candles, onChange, onAdd, onRemove, onClear }) => {
  // Only render up to 200 forms for performance as per PRD
  const visibleCandles = [...candles].reverse().slice(0, 200);

  return (
    <div className="flex flex-col h-full">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#2D3E50]">
            <Zap className="w-4 h-4 text-[#61D4BD] fill-current" />
            Manual Override
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClear} 
            className="h-8 text-[10px] font-bold text-destructive hover:bg-destructive/5"
            disabled={candles.length === 0}
          >
            CLEAR ALL
          </Button>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => onAdd('Bullish')} className="bg-[#089981] hover:bg-[#089981]/90 text-white font-bold h-10 shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> ➕ Bullish
            </Button>
            <Button onClick={() => onAdd('Bearish')} variant="destructive" className="font-bold h-10 shadow-sm bg-[#f23645]">
              <Plus className="w-4 h-4 mr-2" /> ➕ Bearish
            </Button>
          </div>
          <Separator className="bg-primary/5" />
          
          <ScrollArea className="h-[500px] -mr-4 pr-4">
            <div className="space-y-4">
              {visibleCandles.map((c, i) => {
                const idx = candles.length - 1 - i;
                const isBullish = c.close >= c.open;
                
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-primary/5 shadow-sm group hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-primary/40">#{idx + 1}</span>
                        <div className={`w-2.5 h-2.5 rounded-full ${isBullish ? 'bg-[#089981]' : 'bg-[#f23645]'}`} />
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">{isBullish ? 'Bullish' : 'Bearish'}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemove(idx)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Offset Y Control */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-[10px] font-bold text-[#2D3E50]/70 uppercase tracking-wider">Vertical Offset (Y)</Label>
                          <span className="text-[10px] font-mono font-bold text-primary">{c.offsetY?.toFixed(0) || 0}</span>
                        </div>
                        <Slider 
                          value={[c.offsetY || 0]} 
                          min={-200}
                          max={200} 
                          step={1} 
                          onValueChange={([val]) => onChange(idx, { ...c, offsetY: val })}
                        />
                      </div>

                      {/* Body Control */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-[10px] font-bold text-[#2D3E50]/70 uppercase tracking-wider">Body Height</Label>
                          <span className="text-[10px] font-mono font-bold text-primary">{Math.abs(c.close - c.open).toFixed(1)}</span>
                        </div>
                        <Slider 
                          value={[Math.abs(c.close - c.open)]} 
                          max={100} 
                          step={0.5} 
                          onValueChange={([val]) => {
                            const newClose = isBullish ? c.open + val : c.open - val;
                            onChange(idx, { ...c, close: newClose });
                          }}
                        />
                      </div>

                      {/* Wick Controls */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="text-[9px] font-bold text-[#2D3E50]/70 uppercase">Wick Top</Label>
                            <span className="text-[9px] font-mono font-bold">{Math.max(0, c.high - Math.max(c.open, c.close)).toFixed(1)}</span>
                          </div>
                          <Slider 
                            value={[Math.max(0, c.high - Math.max(c.open, c.close))]} 
                            max={50} 
                            step={0.5} 
                            onValueChange={([val]) => {
                              const bodyTop = Math.max(c.open, c.close);
                              onChange(idx, { ...c, high: bodyTop + val });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="text-[9px] font-bold text-[#2D3E50]/70 uppercase">Wick Bottom</Label>
                            <span className="text-[9px] font-mono font-bold">{(Math.min(c.open, c.close) - c.low).toFixed(1)}</span>
                          </div>
                          <Slider 
                            value={[Math.min(c.open, c.close) - c.low]} 
                            max={50} 
                            step={0.5} 
                            onValueChange={([val]) => {
                              const bodyBtm = Math.min(c.open, c.close);
                              onChange(idx, { ...c, low: bodyBtm - val });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {candles.length > 200 && (
                <p className="text-[10px] text-center text-muted-foreground font-medium py-4">
                  Showing latest 200 candles. Canvas renders all {candles.length}.
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualEditor;
