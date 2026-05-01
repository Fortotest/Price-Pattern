"use client";

import React, { useState, useRef } from "react";
import { Candlestick, ChartSettings } from "@/lib/chart-types";
import { generateSVG, TEMPLATES } from "@/lib/chart-utils";
import ChartRenderer, { ChartRendererHandle } from "@/components/chart-renderer";
import ManualEditor from "@/components/manual-editor";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  Video, 
  Trash2,
  Plus,
  Monitor,
  RefreshCw,
  Menu,
  X
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function PricePatternStudio() {
  const [candles, setCandles] = useState<Candlestick[]>(TEMPLATES.FULL_BULLISH_WAVE);
  const [settings, setSettings] = useState<ChartSettings>({
    zoom: 1.0,
    spacing: 1.0,
    speed: 0.8,
    autoCenter: true
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const chartRef = useRef<ChartRendererHandle>(null);
  const { toast } = useToast();

  const handleTemplateLoad = (val: string) => {
    const template = TEMPLATES[val as keyof typeof TEMPLATES];
    if (template) {
      setCandles(template);
      setSettings(prev => ({ ...prev, zoom: 1.0 }));
      toast({ title: "Pattern Applied", description: val.replace(/_/g, ' ') });
    }
  };

  const handleAddCandle = (type: 'Bullish' | 'Bearish') => {
    const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 300;
    const bodySize = Math.floor(Math.random() * 41 + 80); // 80 - 120
    const topWick = Math.floor(Math.random() * 16 + 15); // 15 - 30
    const botWick = Math.floor(Math.random() * 16 + 15); // 15 - 30
    
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
    a.download = `pattern.svg`;
    a.click();
    toast({ title: "Exported", description: "SVG saved." });
  };

  const handleReplay = () => {
    if (candles.length === 0) return;
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 50);
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
      a.download = `animation_4k.webm`;
      a.click();
      setIsRecording(false);
      setIsAnimating(false);
      toast({ title: "Recording Finished", description: "Video saved." });
    };
    recorder.start();
    setIsAnimating(true);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#121212] text-white">
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-6">
          <section className="space-y-3">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Pattern Market</Label>
            <Select onValueChange={handleTemplateLoad}>
              <SelectTrigger className="bg-black border-white/10 h-10 text-xs">
                <SelectValue placeholder="Select Pattern" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c212f] border-white/10 text-white">
                <SelectGroup>
                  <SelectLabel>Common Patterns</SelectLabel>
                  <SelectItem value="HAMMER">Hammer</SelectItem>
                  <SelectItem value="SHOOTING_STAR">Shooting Star</SelectItem>
                  <SelectItem value="BULLISH_ENGULFING">Engulfing Bull</SelectItem>
                  <SelectItem value="BEARISH_ENGULFING">Engulfing Bear</SelectItem>
                  <SelectItem value="MORNING_STAR">Morning Star</SelectItem>
                  <SelectItem value="EVENING_STAR">Evening Star</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Structures</SelectLabel>
                  <SelectItem value="DOUBLE_BOTTOM">Double Bottom</SelectItem>
                  <SelectItem value="DOUBLE_TOP">Double Top</SelectItem>
                  <SelectItem value="HEAD_AND_SHOULDERS">H&S Pattern</SelectItem>
                  <SelectItem value="FULL_BULLISH_WAVE">Wave (11 Bars)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Speed</Label>
              <span className="text-[10px] font-mono text-primary">{settings.speed}s</span>
            </div>
            <Slider value={[settings.speed]} min={0.1} max={2.0} step={0.1} onValueChange={([v]) => setSettings(s => ({...s, speed: v}))} />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Manual Tuning</Label>
              <Button variant="ghost" size="sm" onClick={() => setCandles([])} className="h-6 text-[10px] font-bold text-red-400 p-0">Reset</Button>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => handleAddCandle('Bullish')} className="flex-1 bg-[#089981] hover:bg-[#089981]/90 h-9 text-xs font-bold"><Plus className="w-3 h-3 mr-1" /> Bull</Button>
              <Button onClick={() => handleAddCandle('Bearish')} variant="destructive" className="flex-1 bg-[#f23645] hover:bg-[#f23645]/90 h-9 text-xs font-bold"><Plus className="w-3 h-3 mr-1" /> Bear</Button>
            </div>

            <ManualEditor candles={candles} onChange={handleUpdateCandle} onAdd={handleAddCandle} onRemove={(idx) => setCandles(candles.filter((_, i) => i !== idx))} onClear={() => setCandles([])} />
          </section>
        </div>
      </ScrollArea>

      <div className="p-4 bg-[#161616] border-t border-white/5 space-y-2">
        <Button className="w-full h-10 font-bold text-xs gap-2 bg-slate-700 hover:bg-slate-600" onClick={handleReplay} disabled={candles.length === 0 || isAnimating}><RefreshCw className={`w-3 h-3 ${isAnimating ? 'animate-spin' : ''}`} /> Replay</Button>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-10 text-xs font-bold border-white/10" onClick={handleExportSVG} disabled={candles.length === 0}><Download className="w-3 h-3" /> SVG</Button>
          <Button className="flex-1 h-10 text-xs font-bold bg-purple-600 hover:bg-purple-700" onClick={handleRecordVideo} disabled={candles.length === 0}><Video className="w-3 h-3" /> 4K</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#000000] overflow-hidden font-body select-none">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[320px] border-r border-white/5 bg-[#121212] transition-all duration-300">
        <SidebarContent />
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Mobile Header / Toggle */}
        <header className="lg:hidden h-12 flex items-center justify-between px-4 border-b border-white/5 bg-[#121212] z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white"><Menu className="w-5 h-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[300px] bg-[#121212] border-r border-white/10">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Engine Ready</div>
        </header>

        {/* Visual Overlay Labels */}
        <div className="absolute top-4 lg:top-8 left-4 lg:left-8 flex flex-col gap-2 z-20 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg inline-flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Pro Chart Renderer</span>
          </div>
          {isRecording && (
            <div className="bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 recording-pulse" />
              <span className="text-[9px] font-bold text-red-400 uppercase">Recording 4K...</span>
            </div>
          )}
        </div>

        {/* Chart Viewport */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-12 overflow-hidden">
          <div className="w-full max-w-[1400px] transition-transform duration-500">
            <ChartRenderer 
              ref={chartRef}
              candles={candles} 
              settings={settings} 
              isAnimating={isAnimating}
              onAnimationComplete={() => setIsAnimating(false)}
            />
          </div>
        </div>

        {/* Compact Footer Status */}
        <footer className="h-10 bg-[#121212] border-t border-white/5 px-6 flex items-center justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
          <div className="flex gap-6">
            <span>Dataset: {candles.length} Candles</span>
            <span className="hidden sm:inline">Render: 3840x2160 (Lossless)</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="w-3 h-3" />
            <span>High Fidelity Engine</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
