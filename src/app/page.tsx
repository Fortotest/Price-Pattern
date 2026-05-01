
"use client";

import React, { useState, useRef } from "react";
import { Candlestick, ChartSettings, MarketPattern, AIGeneratorParams } from "@/lib/chart-types";
import { generateSVG } from "@/lib/chart-utils";
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
  Layout,
  Wand2,
  BarChart4
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
} from "@/components/ui/select";

export default function PricePatternStudio() {
  const [candles, setCandles] = useState<Candlestick[]>([]);
  const [settings, setSettings] = useState<ChartSettings>({
    zoom: 1.0,
    spacing: 1.0,
    speed: 0.5,
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
  
  const chartRef = useRef<ChartRendererHandle>(null);
  const { toast } = useToast();

  const handleAddCandle = (type: 'Bullish' | 'Bearish') => {
    const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 100;
    const bodySize = 10;
    const wickSize = 5;
    
    const newCandle: Candlestick = type === 'Bullish' 
      ? { open: lastClose, close: lastClose + bodySize, high: lastClose + bodySize + wickSize, low: lastClose - 2, offsetY: 0 }
      : { open: lastClose, close: lastClose - bodySize, high: lastClose + 2, low: lastClose - bodySize - wickSize, offsetY: 0 };
    
    setCandles([...candles, newCandle]);
  };

  const handleUpdateCandle = (index: number, updated: Candlestick) => {
    const newCandles = [...candles];
    newCandles[index] = updated;
    // Auto-snap following candles as per PRD logic
    for (let i = index + 1; i < newCandles.length; i++) {
      const diff = newCandles[i-1].close - newCandles[i].open;
      newCandles[i] = {
        ...newCandles[i],
        open: newCandles[i-1].close,
        close: newCandles[i].close + diff,
        high: newCandles[i].high + diff,
        low: newCandles[i].low + diff
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
    a.download = `price-pattern-${Date.now()}.svg`;
    a.click();
    toast({ title: "SVG Exported", description: "Infinite resolution vector saved." });
  };

  const handleRecordVideo = async () => {
    const canvas = chartRef.current?.getCanvas();
    if (!canvas || candles.length === 0) return;

    setIsRecording(true);
    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 50000000 // 50Mbps for 4K quality
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `price-action-replay-${Date.now()}.webm`;
      a.click();
      setIsRecording(false);
      toast({ title: "Video Exported", description: "4K cinematic replay saved." });
    };

    recorder.start();
    
    const originalCandles = [...candles];
    setCandles([]);
    
    // Playback interval logic based on PRD: max(20, 3000 / count)
    const interval = Math.max(20, 3000 / originalCandles.length);

    for (const c of originalCandles) {
      setCandles(prev => [...prev, c]);
      setIsAnimating(true);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    setTimeout(() => recorder.stop(), 1500); // 1.5s delay after completion as per PRD
  };

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePattern(aiParams);
      if (result && result.candlesticks) {
        setCandles(result.candlesticks);
        
        // Auto-zoom logic from PRD
        let newZoom = 1.0;
        const generatedCount = result.candlesticks.length;
        if (generatedCount > 100) newZoom = 0.3;
        else if (generatedCount > 50) newZoom = 0.5;
        else if (generatedCount > 20) newZoom = 0.8;
        else newZoom = 1.5;

        setSettings(prev => ({ ...prev, zoom: newZoom }));
        
        toast({ 
          title: "Structure Synthesized", 
          description: `Created ${generatedCount} candles in ${aiParams.pattern} formation.` 
        });
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast({ 
        variant: "destructive", 
        title: "AI Generation Failed",
        description: "Check your connection or API key limits."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EBF1F4] font-body selection:bg-primary/20">
      {/* Header */}
      <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5590C0] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <BarChart4 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-[#2D3E50]">PricePattern Studio Pro</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Hybrid AI + Manual Designer</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-secondary/50 rounded-lg p-1 border">
             <Button variant={isRecording ? "destructive" : "ghost"} size="sm" className="h-8 text-xs font-semibold" onClick={handleRecordVideo} disabled={candles.length === 0 || isRecording}>
               <Video className="w-3.5 h-3.5 mr-2" /> {isRecording ? "MEREKAM VIDEO..." : "Export 4K Replay"}
             </Button>
          </div>
          <Button variant="outline" className="h-10 gap-2 border-[#5590C0]/20 text-[#5590C0]" onClick={handleExportSVG} disabled={candles.length === 0}>
            <Download className="w-4 h-4" /> PNG Snapshot
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[380px] border-r bg-white/40 backdrop-blur-xl flex flex-col p-6 gap-6 overflow-y-auto">
          <section className="space-y-4">
             <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">AI Auto-Generator</h3>
             </div>
             <div className="p-4 rounded-2xl bg-white border shadow-sm space-y-5">
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <Label className="text-[11px] font-bold">Candle Count</Label>
                    <span className="text-[11px] font-mono text-primary">{aiParams.count}</span>
                  </div>
                  <Slider 
                    value={[aiParams.count]} 
                    min={2} max={200} step={1}
                    onValueChange={([val]) => setAiParams({ ...aiParams, count: val })}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[11px] font-bold">Market Pattern</Label>
                  <Select 
                    value={aiParams.pattern} 
                    onValueChange={(val: MarketPattern) => setAiParams({ ...aiParams, pattern: val })}
                  >
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="Select Pattern" />
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

                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <Label className="text-[11px] font-bold">Volatility (Noise)</Label>
                    <span className="text-[11px] font-mono text-primary">{aiParams.volatility.toFixed(1)}</span>
                  </div>
                  <Slider 
                    value={[aiParams.volatility]} 
                    min={0.1} max={2.0} step={0.1}
                    onValueChange={([val]) => setAiParams({ ...aiParams, volatility: val })}
                  />
                </div>

                <Button 
                  className="w-full h-10 text-xs font-bold gap-2 bg-[#5590C0] hover:bg-[#5590C0]/90" 
                  onClick={handleAiGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "GENERATE STRUKTUR"}
                </Button>
             </div>
          </section>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 h-11 p-1 bg-secondary/50 border">
              <TabsTrigger value="manual" className="text-xs font-bold">
                <MousePointer2 className="w-3.5 h-3.5 mr-2" /> Manual
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs font-bold">
                <Settings2 className="w-3.5 h-3.5 mr-2" /> Canvas
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
            <TabsContent value="settings" className="space-y-6 pt-4">
                <div className="space-y-5">
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <Label className="text-[11px] font-bold">Zoom Scale</Label>
                      <span className="text-[11px] font-mono text-primary">{(settings.zoom * 100).toFixed(0)}%</span>
                    </div>
                    <Slider 
                      value={[settings.zoom]} 
                      min={0.2} max={3.0} step={0.1}
                      onValueChange={([val]) => setSettings({ ...settings, zoom: val })}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <Label className="text-[11px] font-bold">Replay Speed</Label>
                      <span className="text-[11px] font-mono text-primary">{settings.speed}s</span>
                    </div>
                    <Slider 
                      value={[settings.speed]} 
                      min={0.1} max={1.0} step={0.1}
                      onValueChange={([val]) => setSettings({ ...settings, speed: val })}
                    />
                  </div>
                </div>
            </TabsContent>
          </Tabs>
        </aside>

        {/* Canvas Area */}
        <section className="flex-1 bg-white/20 flex flex-col p-8 overflow-hidden relative">
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <ChartRenderer 
              ref={chartRef}
              candles={candles} 
              settings={settings} 
              isAnimating={isAnimating}
              onAnimationComplete={() => setIsAnimating(false)}
            />
            
            {candles.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-white/50 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white">
                   <Layout className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-extrabold text-[#2D3E50] mb-2">Studio Canvas Empty</h3>
                <p className="max-w-xs text-sm text-muted-foreground font-medium">Use the AI generator or add candles manually to start building your visual analysis.</p>
              </div>
            )}

            {isRecording && (
              <div className="absolute top-6 right-6 flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive px-5 py-2.5 rounded-full backdrop-blur-md animate-pulse">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest">RECORDING 4K VIDEO</span>
              </div>
            )}

            {/* Indicator from PRD */}
            <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md border px-4 py-2 rounded-xl shadow-sm">
               <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider">{candles.length} Candles</span>
            </div>
          </div>
          
          <div className="h-14 flex items-center justify-between px-6 mt-6 bg-white/80 border rounded-2xl shadow-sm backdrop-blur-md">
             <div className="flex items-center gap-8 text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
               <div className="flex flex-col">
                 <span className="text-[9px] opacity-60">Engine</span>
                 <span className="text-[#2D3E50]">60 FPS Canvas v2.1</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[9px] opacity-60">Output</span>
                 <span className="text-[#2D3E50]">WebM (VP9) / 4K UHD</span>
               </div>
             </div>
             <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold text-[#089981] uppercase tracking-widest">Renderer Ready</span>
               <div className="w-2.5 h-2.5 rounded-full bg-[#089981] shadow-[0_0_10px_rgba(8,153,129,0.5)]" />
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
