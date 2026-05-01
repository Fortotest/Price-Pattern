
"use client";

import React, { useState, useRef } from "react";
import { Candlestick, ChartSettings, DrawingTool } from "@/lib/chart-types";
import { generateSVG, TEMPLATES } from "@/lib/chart-utils";
import ChartRenderer, { ChartRendererHandle } from "@/components/chart-renderer";
import ManualEditor from "@/components/manual-editor";
import DrawingToolbar from "@/components/drawing-toolbar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  Video, 
  BarChart4,
  Play,
  Layers,
  Trash2,
  Plus,
  Monitor,
  RefreshCw
} from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PricePatternStudio() {
  const [candles, setCandles] = useState<Candlestick[]>(TEMPLATES.FULL_BULLISH_WAVE);
  const [settings, setSettings] = useState<ChartSettings>({
    zoom: 1.0,
    spacing: 1.0,
    speed: 0.8,
    autoCenter: true
  });
  
  const [activeTool, setActiveTool] = useState<DrawingTool>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chartRef = useRef<ChartRendererHandle>(null);
  const { toast } = useToast();

  const handleTemplateLoad = (val: string) => {
    if (val === 'custom') return;
    const template = TEMPLATES[val as keyof typeof TEMPLATES];
    if (template) {
      setCandles(template);
      setSettings(prev => ({ ...prev, zoom: 1.0 }));
      toast({ title: "Template Applied", description: `Loaded professional ${val} pattern.` });
    }
  };

  const handleAddCandle = (type: 'Bullish' | 'Bearish') => {
    const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 300;
    
    // Generate random but "neat" values (multiples of 5)
    // Scale: Body ~100, Wicks ~15-20
    const bodySize = Math.floor(Math.random() * 9 + 16) * 5; // 80 to 120
    const topWick = Math.floor(Math.random() * 4 + 3) * 5;   // 15 to 30
    const botWick = Math.floor(Math.random() * 4 + 3) * 5;   // 15 to 30
    
    const newCandle: Candlestick = type === 'Bullish' 
      ? { 
          open: lastClose, 
          close: lastClose + bodySize, 
          high: lastClose + bodySize + topWick, 
          low: lastClose - botWick, 
          offsetY: 0 
        }
      : { 
          open: lastClose, 
          close: lastClose - bodySize, 
          high: lastClose + topWick, 
          low: lastClose - bodySize - botWick, 
          offsetY: 0 
        };
    setCandles([...candles, newCandle]);
  };

  const handleUpdateCandle = (index: number, updated: Candlestick) => {
    const newCandles = [...candles];
    newCandles[index] = updated;
    // Maintain continuity
    for (let i = index + 1; i < newCandles.length; i++) {
      const prevClose = newCandles[i-1].close;
      const body = Math.abs(newCandles[i].close - newCandles[i].open);
      const isUp = newCandles[i].close >= newCandles[i].open;
      newCandles[i] = { ...newCandles[i], open: prevClose, close: isUp ? prevClose + body : prevClose - body };
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
    a.download = `PricePattern_Vector_Pro.svg`;
    a.click();
    toast({ title: "Vector Exported", description: "Professional SVG file downloaded." });
  };

  const handleReplay = () => {
    if (candles.length === 0) return;
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 100);
  };

  const handleRecordVideo = async () => {
    const canvas = chartRef.current?.getCanvas();
    if (!canvas || candles.length === 0) return;
    setIsRecording(true);
    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 20000000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Candlestick_Animation_4K.webm`;
      a.click();
      setIsRecording(false);
      setIsAnimating(false);
      toast({ title: "Recording Finished", description: "4K cinematic video saved." });
    };
    recorder.start();
    setIsAnimating(true);
  };

  return (
    <div className="flex h-screen w-full bg-[#0b0e14] text-foreground overflow-hidden font-body">
      {/* Sidebar */}
      <aside className={`w-[400px] h-screen flex flex-col border-r border-white/5 bg-[#121212] shrink-0 transition-opacity duration-300 ${isRecording ? 'opacity-20 pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <BarChart4 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Price<span className="text-primary">Pattern</span></h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Vector & Animation Pro</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <Layers className="w-3.5 h-3.5" /> Template Market
              </div>
              <Select onValueChange={handleTemplateLoad}>
                <SelectTrigger className="bg-black border-white/10 h-12 text-sm font-medium">
                  <SelectValue placeholder="Select a professional pattern..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1c212f] border-white/10 text-white">
                  <SelectGroup>
                    <SelectLabel>Single Bar Patterns</SelectLabel>
                    <SelectItem value="HAMMER">🔨 Bullish Hammer</SelectItem>
                    <SelectItem value="SHOOTING_STAR">☄️ Shooting Star</SelectItem>
                    <SelectItem value="BULLISH_MARUBOZU">🟩 Bullish Marubozu</SelectItem>
                    <SelectItem value="BEARISH_MARUBOZU">🟥 Bearish Marubozu</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Dual/Triple Bar Patterns</SelectLabel>
                    <SelectItem value="BULLISH_ENGULFING">📈 Bullish Engulfing</SelectItem>
                    <SelectItem value="BEARISH_ENGULFING">📉 Bearish Engulfing</SelectItem>
                    <SelectItem value="TWEEZER_BOTTOM">⚓ Tweezer Bottom</SelectItem>
                    <SelectItem value="MORNING_STAR">🌅 Morning Star</SelectItem>
                    <SelectItem value="EVENING_STAR">🌆 Evening Star</SelectItem>
                    <SelectItem value="THREE_WHITE_SOLDIERS">💂 Three Soldiers</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Market Structure</SelectLabel>
                    <SelectItem value="DOUBLE_BOTTOM">📈 Double Bottom (W)</SelectItem>
                    <SelectItem value="DOUBLE_TOP">📉 Double Top (M)</SelectItem>
                    <SelectItem value="HEAD_AND_SHOULDERS">👤 Head & Shoulders</SelectItem>
                    <SelectItem value="FULL_BULLISH_WAVE">🌊 Full Bullish Wave</SelectItem>
                    <SelectItem value="BULLISH_WEDGE">📐 Bullish Wedge</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </section>

            <section className="bg-white/5 rounded-2xl p-5 space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Zoom Level</Label>
                    <span className="text-[10px] font-mono text-primary font-bold">{settings.zoom.toFixed(1)}x</span>
                  </div>
                  <Slider value={[settings.zoom]} min={0.1} max={1.0} step={0.1} onValueChange={([val]) => setSettings(prev => ({ ...prev, zoom: val }))} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Animation Speed</Label>
                    <span className="text-[10px] font-mono text-primary font-bold">{settings.speed.toFixed(1)}s</span>
                  </div>
                  <Slider value={[settings.speed]} min={0.1} max={2.5} step={0.1} onValueChange={([val]) => setSettings(prev => ({ ...prev, speed: val }))} />
                </div>
              </div>
            </section>

            <section className="space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <Monitor className="w-3.5 h-3.5" /> Manual Tuning
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => chartRef.current?.clearDrawings()} className="h-6 text-[10px] font-bold text-blue-400 hover:text-blue-300">Clear Drawings</Button>
                  <Button variant="ghost" size="sm" onClick={() => setCandles([])} className="h-6 text-[10px] font-bold text-red-400 hover:text-red-300">
                    <Trash2 className="w-3 h-3 mr-1" /> Reset
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                <Button onClick={() => handleAddCandle('Bullish')} className="flex-1 bg-[#089981] hover:bg-[#089981]/90 h-10 text-xs font-bold gap-2"><Plus className="w-3 h-3" /> Bullish</Button>
                <Button onClick={() => handleAddCandle('Bearish')} variant="destructive" className="flex-1 bg-[#f23645] hover:bg-[#f23645]/90 h-10 text-xs font-bold gap-2"><Plus className="w-3 h-3" /> Bearish</Button>
              </div>

              <ManualEditor candles={candles} onChange={handleUpdateCandle} onAdd={handleAddCandle} onRemove={(idx) => setCandles(candles.filter((_, i) => i !== idx))} onClear={() => setCandles([])} />
            </section>
          </div>
        </ScrollArea>

        <div className="p-6 bg-[#161616] border-t border-white/5 space-y-3 shrink-0">
          <Button className="w-full h-11 font-bold gap-2 bg-slate-700 hover:bg-slate-600 text-white" onClick={handleReplay} disabled={candles.length === 0 || isAnimating}><RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} /> Replay Animation</Button>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 gap-2 border-primary/20 text-primary hover:bg-primary/5 font-bold" onClick={handleExportSVG} disabled={candles.length === 0}><Download className="w-4 h-4" /> SVG</Button>
            <Button className="flex-1 h-12 gap-2 bg-purple-600 hover:bg-purple-700 font-bold" onClick={handleRecordVideo} disabled={candles.length === 0}><Video className="w-4 h-4" /> 4K Video</Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen relative flex flex-col bg-[#000000]">
        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start pointer-events-none z-20">
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-full shadow-2xl">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
             <span className="text-[10px] font-bold tracking-[0.3em] text-white uppercase flex items-center gap-2">
               <Monitor className="w-3 h-3" /> Pro Vector Chart Engine
             </span>
          </div>
          
          {isRecording && (
            <div className="bg-red-500/10 border border-red-500/30 px-6 py-2.5 rounded-full backdrop-blur-xl flex items-center gap-3 shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-red-500 recording-pulse" />
              <span className="text-[10px] font-bold text-red-400 tracking-[0.3em] uppercase">Recording 4K Cinema...</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-hidden relative">
          <div className="mb-6 z-30">
            <DrawingToolbar activeTool={activeTool} onToolSelect={setActiveTool} />
          </div>

          <div className="w-full max-w-[1600px] z-10">
            <ChartRenderer 
              ref={chartRef}
              candles={candles} 
              settings={settings} 
              isAnimating={isAnimating}
              activeTool={activeTool}
              onAnimationComplete={() => setIsAnimating(false)}
            />
          </div>
        </div>

        <div className="h-14 border-t border-white/5 bg-[#121212] px-8 flex items-center justify-between shrink-0">
          <div className="flex gap-10">
             <div className="flex flex-col">
               <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Active Dataset</span>
               <span className="text-[10px] font-bold text-white font-mono">{candles.length} Candles</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Render Quality</span>
               <span className="text-[10px] font-bold text-white uppercase">3840 x 2160 (Lossless)</span>
             </div>
          </div>
          <div className="flex items-center gap-3 opacity-60">
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Engine Ready</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </main>
    </div>
  );
}
