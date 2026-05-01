"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TEMPLATES } from "@/lib/chart-utils";
import { Candlestick } from "@/lib/chart-types";
import { Layers, TrendingUp, TrendingDown, Maximize2 } from "lucide-react";

interface PatternLibraryProps {
  onSelect: (pattern: Candlestick[]) => void;
}

const PatternLibrary: React.FC<PatternLibraryProps> = ({ onSelect }) => {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          Template Library
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-2">
        <div className="grid grid-cols-1 gap-2">
          <Button 
            variant="outline" 
            className="justify-start gap-2 h-11 text-xs" 
            onClick={() => onSelect(TEMPLATES.SNR_WAVES_BULLISH)}
          >
            <TrendingUp className="w-4 h-4 text-accent" />
            SNR Bullish Waves
          </Button>
          <Button 
            variant="outline" 
            className="justify-start gap-2 h-11 text-xs" 
            onClick={() => onSelect(TEMPLATES.ENGULFING_BEARISH)}
          >
            <TrendingDown className="w-4 h-4 text-destructive" />
            Bearish Engulfing
          </Button>
          <Button 
            variant="outline" 
            className="justify-start gap-2 h-11 text-xs" 
            onClick={() => onSelect(TEMPLATES.DOUBLE_BOTTOM)}
          >
            <Maximize2 className="w-4 h-4 text-primary" />
            Double Bottom (W)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternLibrary;