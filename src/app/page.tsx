"use client";

import React, { useState, useRef } from "react";
import { Candlestick, ChartSettings, AIGeneratorParams } from "@/lib/chart-types";
import { generateSVG, TEMPLATES } from "@/lib/chart-utils";
import ChartRenderer, { ChartRendererHandle } from "@/components/chart-renderer";
import ManualEditor from "@/components/manual-editor";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  Video, 
  Sparkles, 
  BarChart4,
  RefreshCw,
  Play,
  MousePointer2,
  Wand2
} from "lucide-react";
import { generatePattern } from "@/ai/flows/generate-pattern-from-description-flow";
import { refinePatternWithAI } from "@/ai/flows/refine-pattern-with-ai-flow";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PricePatternStudio() {
  const [candles, setCandles] = useState<Candlestick[]>([]);
  const [settings, setSettings] = useState<ChartSettings>({
    zoom: 1.0,
    spacing: 1.0,
    speed: 0.8,
    autoCenter: true
  });
  const [aiParams, setAiParams] = useState<AIGeneratorParams>({
    count: 30,
    pattern: 'Bullish Trend',
    volatility: 0.8
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  
  const chartRef = useRef<ChartRendererHandle>(null);
  const { toast } = useToast();

  const handleTemplateLoad = (val: string) => {
    if (val === 'custom') return;
    const template = TEMPLATES[val as keyof typeof TEMPLATES];
    if (template) {
      setCandles(template);
      // Auto adjust zoom for clarity
      setSettings(prev => ({ ...prev, zoom: template.length > 10 ? 0.7 : 1.2 }));
      toast({ title: "Template Loaded", description: `Applied ${val} structure.` });
    }
  };

  const handleAddCandle = (type: 'Bullish' | 'Bearish') => {
    const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 300;
    const bodySize = 40;
    const wickSize = 15;
    
    const newCandle: Candlestick = type === 'Bullish' 
      ? { open: lastClose, close: lastClose + bodySize, high: lastClose + bodySize + wickSize, low: lastClose - 5, offsetY: 0 }
      : { open: lastClose, close: lastClose - bodySize, high: lastClose + 5, low: lastClose - bodySize - wickSize, offsetY: 0 };
    
    setCandles([...candles, newCandle]);
  };

  const handleUpdateCandle = (index: number, updated: Candlestick) => {
    const newCandles = [...candles];
    newCandles[index] = updated;
    // Continuity logic: Next candle's open must match previous' close
    for (let i = index + 1; i < newCandles.length; i++) {
      const prevClose = newCandles[i-1].close;
      const body = Math.abs(newCandles[i].close - newCandles[i].open);
      const isUp = newCandles[i].close >= newCandles[i].open;
      newCandles[i] = {
        ...newCandles[i],
        open: prevClose,
        close: isUp ? prevClose + body : prevClose - body,
        // Also adjust high/low roughly to keep proportions if needed, 
        // but for now just fix the open to maintain the chain.
      };
    }
    setCandles(newCandles);
  };

  const handleExportSVG = () => {
    if (candles.length === 0) return;
    const svg = generateSVG(candles);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CandleStick_Vector_Pro.svg`;
    a.click();
    toast({ title: "SVG Exported", description: "Pro Vector format saved." });
  };

  const handleReplay = () => {
    if (candles.length === 0) return;
    setIsAnimating(false);
    // Use a small timeout to ensure the state reset is caught before restarting
    setTimeout(() => {
      setIsAnimating(true);
      toast({ title: "Replaying Animation", description: "Watching the price action build..." });
    }, 50);
  };

  const handleRecordVideo = async () => {
    const canvas = chartRef.current?.getCanvas();
    if (!canvas || candles.length === 0) return;

    setIsRecording(true);
    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 15000000 
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Candlestick_PriceAction_4K.webm`;
      a.click();
      setIsRecording(false);
      setIsAnimating(false);
      toast({ title: "Video Exported", description: "4K Price Action replay saved." });
    };

    recorder.start();
    setIsAnimating(true);
  };

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePattern(aiParams);
      if (result && result.candlesticks) {
        setCandles(result.candlesticks);
        // Smart zoom based on count
        let newZoom = 1.0;
        const n = result.candlesticks.length;
        if (n > 100) newZoom = 0.3;
        else if (n > 50) newZoom = 0.5;
        else if (n > 20) newZoom = 0.8;
        else newZoom = 1.5;
        setSettings(prev => ({ ...prev, zoom: newZoom }));
        toast({ title: "AI Generated", description: `Synthesized ${n} candles.` });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to generate pattern." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiRefine = async () => {
    if (candles.length === 0) return;
    setIsRefining(true);
    try {
      const result = await refinePatternWithAI({
        candlesticks: candles,
        patternDescription: `Refine this ${aiParams.pattern} to be more realistic.`
      });
      if (result && result.refinedCandlesticks) {
        setCandles(result.refinedCandlesticks);
        toast({ title: "AI Refined", description: "Pattern enhanced with realistic noise." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to refine pattern." });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden font-body selection:bg-primary/30">
      {/* Left Panel */}
      <aside className={`w-[400px] flex flex-col h-full p-5 gap-5 border-r bg-card/40 backdrop-blur-xl transition-all duration-300 ${isRecording ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
        
        {/* Logo & App Info */}
        <div className="flex items-center gap-3 p-1">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <BarChart4 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Candle<span className="text-primary">stick</span></h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Vector & Animation Pro</p>
          </div>
        </div>

        {/* AI & Global Controls */}
        <div className="bg-secondary/30 border rounded-2xl p-5 space-y-5">
           <div className="space-y-4">
              <div>
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Template Market</Label>
                <Select onValueChange={handleTemplateLoad}>
                  <SelectTrigger className="bg-background border-border/50 h-11 text-xs">
                    <SelectValue placeholder="-- Desain Manual --" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="custom">-- Desain Manual --</SelectItem>
                    <SelectGroup>
                      <SelectLabel>Pola Singkat</SelectLabel>
                      <SelectItem value="BULLISH_ENGULFING">🟢 Bullish Engulfing</SelectItem>
                      <SelectItem value="BEARISH_ENGULFING">🔴 Bearish Engulfing</SelectItem>
                      <SelectItem value="MORNING_STAR">🌅 Morning Star</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Struktur Panjang</SelectLabel>
                      <SelectItem value="FULL_BULLISH_WAVE">📈 Full Bullish Wave</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Zoom</Label>
                    <span className="text-[10px] font-mono font-bold text-primary">{settings.zoom.toFixed(1)}x</span>
                  </div>
                  <Slider 
                    value={[settings.zoom]} 
                    min={0.2} max={3} step={0.1}
                    onValueChange={([val]) => setSettings(prev => ({ ...prev, zoom: val }))}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Durasi /Bar</Label>
                    <span className="text-[10px] font-mono font-bold text-primary">{settings.speed.toFixed(1)}s</span>
                  </div>
                  <Slider 
                    value={[settings.speed]} 
                    min={0.1} max={2.5} step={0.1}
                    onValueChange={([val]) => setSettings(prev => ({ ...prev, speed: val }))}
                  />
                </div>
              </div>
           </div>
        </div>

        {/* Main Editor Tabs */}
        <Tabs defaultValue="manual" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 h-11 bg-secondary/30 p-1 mb-4 rounded-xl">
            <TabsTrigger value="manual" className="text-xs font-bold gap-2">
              <MousePointer2 className="w-3.5 h-3.5" /> Manual
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs font-bold gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Auto AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="flex-1 flex flex-col min-h-0 mt-0">
            <ManualEditor 
              candles={candles} 
              onChange={handleUpdateCandle} 
              onAdd={handleAddCandle}
              onRemove={(idx) => setCandles(candles.filter((_, i) => i !== idx))}
              onClear={() => setCandles([])}
            />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6 mt-0">
            <div className="bg-secondary/30 border rounded-2xl p-5 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-bold">Candle Count</Label>
                      <span className="text-[10px] font-mono text-primary font-bold">{aiParams.count}</span>
                    </div>
                    <Slider 
                      value={[aiParams.count]} 
                      min={2} max={200} step={1}
                      onValueChange={([val]) => setAiParams(prev => ({ ...prev, count: val }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pattern</Label>
                    <Select value={aiParams.pattern} onValueChange={(val: any) => setAiParams(prev => ({ ...prev, pattern: val }))}>
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bullish Trend">Bullish Trend</SelectItem>
                        <SelectItem value="Bearish Trend">Bearish Trend</SelectItem>
                        <SelectItem value="Double Top">Double Top</SelectItem>
                        <SelectItem value="Double Bottom">Double Bottom</SelectItem>
                        <SelectItem value="Sideways">Sideways</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Volatility</Label>
                      <span className="text-[10px] font-mono text-primary font-bold">{aiParams.volatility.toFixed(1)}</span>
                    </div>
                    <Slider 
                      value={[aiParams.volatility]} 
                      min={0.1} max={2.0} step={0.1}
                      onValueChange={([val]) => setAiParams(prev => ({ ...prev, volatility: val }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 h-11 font-bold gap-2 bg-primary hover:bg-primary/90" 
                      onClick={handleAiGenerate}
                      disabled={isGenerating}
                    >
                      <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      Generate
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 h-11 font-bold gap-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/5" 
                      onClick={handleAiRefine}
                      disabled={isRefining || candles.length === 0}
                    >
                      <Wand2 className={`w-4 h-4 ${isRefining ? 'animate-pulse' : ''}`} />
                      Refine
                    </Button>
                  </div>
                </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="space-y-3 mt-auto pt-4 shrink-0">
          <Button 
            variant="secondary" 
            className="w-full h-11 font-bold gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200"
            onClick={handleReplay}
            disabled={candles.length === 0 || isAnimating}
          >
            <Play className="w-4 h-4" /> Replay Animasi
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 gap-2 border-primary/20 text-primary hover:bg-primary/5 font-bold" onClick={handleExportSVG} disabled={candles.length === 0}>
              <Download className="w-4 h-4" /> Export SVG
            </Button>
            <Button className="flex-1 h-12 gap-2 bg-purple-600 hover:bg-purple-700 font-bold" onClick={handleRecordVideo} disabled={candles.length === 0}>
              <Video className="w-4 h-4" /> Video Replay
            </Button>
          </div>
        </div>
      </aside>

      {/* Canvas Main Area */}
      <main className="flex-1 bg-background relative flex flex-col">
        {/* Top Floating UI */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none z-20">
          <div className="flex items-center gap-3 bg-card/80 backdrop-blur-md border px-4 py-2 rounded-full shadow-xl">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
             <span className="text-[10px] font-bold tracking-[0.2em] text-foreground uppercase">Live Vector Engine</span>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-card/80 backdrop-blur-md border px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
               <span className="text-[10px] font-mono font-bold text-primary">{candles.length}</span>
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Candles</span>
            </div>
            {isRecording && (
              <div className="bg-destructive/10 border border-destructive/30 px-5 py-2 rounded-full backdrop-blur-md flex items-center gap-3 shadow-xl">
                <div className="w-2 h-2 rounded-full bg-destructive recording-pulse" />
                <span className="text-[10px] font-bold text-destructive tracking-[0.2em] uppercase">Recording 4K...</span>
              </div>
            )}
          </div>
        </div>

        {/* The Renderer */}
        <div className="flex-1 flex items-center justify-center p-8 bg-[#0b0e14]">
          <ChartRenderer 
            ref={chartRef}
            candles={candles} 
            settings={settings} 
            isAnimating={isAnimating}
            onAnimationComplete={() => {
              setIsAnimating(false);
            }}
          />
        </div>

        {/* Bottom Status Bar */}
        <div className="h-14 border-t bg-card/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex gap-8">
             <div className="flex flex-col">
               <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Resolution</span>
               <span className="text-[10px] font-bold">3840 x 2160 (4K)</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Output Mode</span>
               <span className="text-[10px] font-bold">Vector SVG / WebM Pro</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">System Ready</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </main>
    </div>
  );
}