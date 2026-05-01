"use client";

import React, { useState, useRef, useEffect } from "react";
import { Candlestick, ChartSettings } from "@/lib/chart-types";
import { generateSVG, CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/chart-utils";
import ChartRenderer, { ChartRendererHandle } from "@/components/chart-renderer";
import ManualEditor from "@/components/manual-editor";
import PatternLibrary from "@/components/pattern-library";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Play, 
  Video, 
  Settings2, 
  Sparkles, 
  Maximize, 
  MousePointer2,
  FileCode,
  Layout
} from "lucide-react";
import { generatePatternFromDescription } from "@/ai/flows/generate-pattern-from-description-flow";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function PricePatternStudio() {
  const [candles, setCandles] = useState<Candlestick[]>([]);
  const [settings, setSettings] = useState<ChartSettings>({
    zoom: 1.0,
    spacing: 1.0,
    speed: 0.8,
    autoCenter: true
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const chartRef = useRef<ChartRendererHandle>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const handleAddCandle = (type: 'Bullish' | 'Bearish') => {
    const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 50;
    const bodySize = 5 + Math.random() * 5;
    const wickSize = 2 + Math.random() * 3;
    
    const newCandle: Candlestick = type === 'Bullish' 
      ? { open: lastClose, close: lastClose + bodySize, high: lastClose + bodySize + wickSize, low: lastClose - wickSize }
      : { open: lastClose, close: lastClose - bodySize, high: lastClose + wickSize, low: lastClose - bodySize - wickSize };
    
    setCandles([...candles, newCandle]);
  };

  const handleUpdateCandle = (index: number, updated: Candlestick) => {
    const newCandles = [...candles];
    newCandles[index] = updated;
    setCandles(newCandles);
  };

  const handleExportSVG = () => {
    if (candles.length === 0) return;
    const svg = generateSVG(candles);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-pattern-${Date.now()}.svg`;
    a.click();
    toast({ title: "SVG Exported", description: "Your pattern is ready for professional use." });
  };

  const handleRecordVideo = async () => {
    const canvas = chartRef.current?.getCanvas();
    if (!canvas || candles.length === 0) return;

    setIsRecording(true);
    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 30000000 // 30 Mbps
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `price-action-${Date.now()}.webm`;
      a.click();
      setIsRecording(false);
      toast({ title: "Recording Complete", description: "High-quality video saved." });
    };

    recorder.start();
    
    // Animate candles one by one
    const originalCandles = [...candles];
    setCandles([]);
    
    for (const c of originalCandles) {
      setCandles(prev => [...prev, c]);
      setIsAnimating(true);
      await new Promise(resolve => setTimeout(resolve, settings.speed * 1000 + 100));
    }
    
    recorder.stop();
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const result = await generatePatternFromDescription({ description: aiPrompt });
      setCandles(result.candlesticks);
      toast({ title: "Pattern Generated", description: "AI suggested a realistic scenario based on your prompt." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to generate pattern." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      {/* Header */}
      <header className="h-16 border-b bg-white dark:bg-zinc-950 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">PricePattern Studio</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">4K Candlestick Generator Pro</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-secondary rounded-lg p-1">
             <Button variant="ghost" size="sm" onClick={() => setIsAnimating(true)} disabled={candles.length === 0 || isAnimating}>
               <Play className="w-4 h-4 mr-2" /> Play
             </Button>
             <Button variant={isRecording ? "destructive" : "ghost"} size="sm" onClick={handleRecordVideo} disabled={candles.length === 0 || isRecording}>
               <Video className="w-4 h-4 mr-2" /> {isRecording ? "Recording..." : "Export 4K Video"}
             </Button>
          </div>
          <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/50" onClick={handleExportSVG} disabled={candles.length === 0}>
            <FileCode className="w-4 h-4 text-primary" /> SVG Vector
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[320px] border-r bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl flex flex-col p-6 gap-8 overflow-y-auto">
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="manual" className="text-xs">
                <MousePointer2 className="w-3.5 h-3.5 mr-2" /> Manual
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs">
                <Maximize className="w-3.5 h-3.5 mr-2" /> Patterns
              </TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
              <ManualEditor 
                candles={candles} 
                onChange={handleUpdateCandle} 
                onAdd={handleAddCandle}
                onRemove={(idx) => setCandles(candles.filter((_, i) => i !== idx))}
                onClear={() => setCandles([])}
              />
            </TabsContent>
            <TabsContent value="templates">
              <PatternLibrary onSelect={(p) => setCandles(p)} />
            </TabsContent>
          </Tabs>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Settings2 className="w-3 h-3" /> Chart Settings
              </h3>
              <div className="space-y-4 px-1">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-[11px] font-semibold">Visual Zoom</Label>
                    <span className="text-[11px] font-mono">{(settings.zoom * 100).toFixed(0)}%</span>
                  </div>
                  <Slider 
                    value={[settings.zoom]} 
                    min={0.2} max={3.0} step={0.1}
                    onValueChange={([val]) => setSettings({ ...settings, zoom: val })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-[11px] font-semibold">Animation Speed</Label>
                    <span className="text-[11px] font-mono">{settings.speed}s / candle</span>
                  </div>
                  <Slider 
                    value={[settings.speed]} 
                    min={0.2} max={2.5} step={0.1}
                    onValueChange={([val]) => setSettings({ ...settings, speed: val })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">AI Generation</span>
                </div>
                <Input 
                  placeholder="Describe a market trend..." 
                  className="bg-white text-xs border-primary/20 h-9" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <Button 
                  className="w-full h-9 text-xs font-semibold gap-2" 
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !aiPrompt}
                >
                  {isGenerating ? "Synthesizing..." : "Generate Scenario"}
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <section className="flex-1 bg-background flex flex-col p-8 overflow-hidden">
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <ChartRenderer 
              ref={chartRef}
              candles={candles} 
              settings={settings} 
              isAnimating={isAnimating}
              onAnimationComplete={() => setIsAnimating(false)}
            />
            
            {candles.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 pointer-events-none opacity-40">
                <Layout className="w-16 h-16 mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold">Studio Canvas Empty</h3>
                <p className="max-w-xs text-sm">Use the library or manual editor on the left to start building your price action pattern.</p>
              </div>
            )}
          </div>
          
          <div className="h-12 flex items-center justify-between px-4 mt-4 bg-white/50 border rounded-lg">
             <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
               <span>Resolution: 3840 x 2160 (4K)</span>
               <span>FPS: 60 (Native)</span>
               <span>Count: {candles.length} Candles</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
               <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Live Renderer Ready</span>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}