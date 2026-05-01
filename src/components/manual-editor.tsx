"use client";

import React from "react";
import { Candlestick } from "@/lib/chart-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Zap, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManualEditorProps {
  candles: Candlestick[];
  onChange: (index: number, candle: Candlestick) => void;
  onAdd: (type: 'Bullish' | 'Bearish') => void;
  onRemove: (index: number) => void;
  onClear: () => void;
}

const ManualEditor: React.FC<ManualEditorProps> = ({ candles, onChange, onAdd, onRemove, onClear }) => {
  return (
    <div className="flex flex-col h-full">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            Live Editor
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => onAdd('Bullish')} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              <ArrowUpCircle className="w-4 h-4 mr-2" /> + BUY
            </Button>
            <Button onClick={() => onAdd('Bearish')} variant="destructive" className="font-semibold">
              <ArrowDownCircle className="w-4 h-4 mr-2" /> + SELL
            </Button>
          </div>
          <Separator />
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {[...candles].reverse().map((c, i) => {
                const originalIndex = candles.length - 1 - i;
                return (
                  <div key={originalIndex} className="p-3 rounded-lg bg-card/50 border border-border/50 relative group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-muted-foreground">CANDLE #{originalIndex + 1}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemove(originalIndex)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-[10px] uppercase text-muted-foreground">Range (High/Low)</Label>
                          <span className="text-[10px] font-mono">{c.high - c.low} pts</span>
                        </div>
                        <Slider 
                          defaultValue={[c.high - c.low]} 
                          max={50} 
                          step={1} 
                          onValueChange={([val]) => {
                            const center = (c.high + c.low) / 2;
                            onChange(originalIndex, { ...c, high: center + val/2, low: center - val/2 });
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-[10px] uppercase text-muted-foreground">Body Size</Label>
                          <span className="text-[10px] font-mono">{Math.abs(c.close - c.open)} pts</span>
                        </div>
                        <Slider 
                          defaultValue={[c.close - c.open]} 
                          min={-40}
                          max={40} 
                          step={1} 
                          onValueChange={([val]) => {
                            onChange(originalIndex, { ...c, close: c.open + val });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualEditor;