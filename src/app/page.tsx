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
  X,
  Zap,
  Maximize,
  Palette,
  Layers
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
import { Separator } from "@/components/ui/separator";

export default function PricePatternStudio() {
  const [candles, setCandles] = useState<Candlestick[]>(TEMPLATES.FULL_BULLISH_WAVE);
  const [settings, setSettings] = useState<ChartSettings>({
    zoom: 1.0,
    spacing: 1.2,
    speed: 0.8,
    autoCenter: true,
    bullColor: "#00b386",
    bearColor: "#f23645",
    bodyRadius: 2,
    wickRadius: 4
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chartRef = useRef<ChartRendererHandle>(null);
  const { toast } = useToast();

  const handleTemplateLoad = (val: string) => {
    const template = TEMPLATES[val as keyof typeof TEMPLATES];
    if (template) {
      setCandles(template);
      toast({ title: "Pattern Applied", description: val.replace(/_/g, ' ') });
    }
  };

  const handleAddCandle = (type: 'Bullish' | 'Bearish') => {
    const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 300;
    const bodySize = Math.floor(Math.random() * 60) + 70; 
    const topWick = Math.floor(Math.random() * 20) + 10; 
    const botWick = Math.floor(Math.random() * 20) + 10; 
    
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
    const svg = generateSVG(candles, settings);
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
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 25000000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `animation_pro.webm`;
      a.click();
      setIsRecording(false);
      setIsAnimating(false);
      toast({ title: "Recording Finished", description: "Video saved." });
    };
    recorder.start();
    setIsAnimating(true);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#121212] text-white overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Pro Studio</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-24">
          <section className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Market Pattern</Label>
            <Select onValueChange={handleTemplateLoad}>
              <SelectTrigger className="bg-black border-white/10 h-8 text-[11px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c212f] border-white/10 text-white">
                <SelectGroup>
                  <SelectLabel>Single</SelectLabel>
                  <SelectItem value="HAMMER">🔨 Hammer</SelectItem>
                  <SelectItem value="SHOOTING_STAR">☄️ Shooting Star</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Structure</SelectLabel>
                  <SelectItem value="DOUBLE_BOTTOM">📈 Double Bottom</SelectItem>
                  <SelectItem value="DOUBLE_TOP">📉 Double Top</SelectItem>
                  <SelectItem value="FULL_BULLISH_WAVE">🌊 Wave</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-4 bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-3 h-3 text-primary" />
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Candle Design</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[9px] text-muted-foreground">Bull Color</Label>
                <input 
                  type="color" 
                  value={settings.bullColor} 
                  onChange={(e) => setSettings(s => ({...s, bullColor: e.target.value}))}
                  className="w-full h-6 rounded bg-black border-none cursor-pointer"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] text-muted-foreground">Bear Color</Label>
                <input 
                  type="color" 
                  value={settings.bearColor} 
                  onChange={(e) => setSettings(s => ({...s, bearColor: e.target.value}))}
                  className="w-full h-6 rounded bg-black border-none cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-[9px] text-muted-foreground">Body Radius</Label>
                <span className="text-[9px] font-mono text-primary">{settings.bodyRadius}px</span>
              </div>
              <Slider value={[settings.bodyRadius]} min={0} max={10} step={1} onValueChange={([v]) => setSettings(s => ({...s, bodyRadius: v}))} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-[9px] text-muted-foreground">Wick Rounding</Label>
                <span className="text-[9px] font-mono text-primary">{settings.wickRadius}px</span>
              </div>
              <Slider value={[settings.wickRadius]} min={0} max={12} step={1} onValueChange={([v]) => setSettings(s => ({...s, wickRadius: v}))} />
            </div>
          </section>

          <section className="space-y-4 bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Maximize className="w-3 h-3 text-primary" />
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Engine Tuning</Label>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-[9px] text-muted-foreground">Zoom Level</Label>
                <span className="text-[9px] font-mono text-primary">{settings.zoom.toFixed(2)}x</span>
              </div>
              <Slider value={[settings.zoom]} min={0.3} max={1.0} step={0.01} onValueChange={([v]) => setSettings(s => ({...s, zoom: v}))} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-[9px] text-muted-foreground">Candle Spacing</Label>
                <span className="text-[9px] font-mono text-primary">{settings.spacing.toFixed(1)}x</span>
              </div>
              <Slider value={[settings.spacing]} min={0.5} max={3.0} step={0.1} onValueChange={([v]) => setSettings(s => ({...s, spacing: v}))} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-[9px] text-muted-foreground">Anim Speed</Label>
                <span className="text-[9px] font-mono text-primary">{settings.speed}s</span>
              </div>
              <Slider value={[settings.speed]} min={0.1} max={2.0} step={0.05} onValueChange={([v]) => setSettings(s => ({...s, speed: v}))} />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Manual Dataset</Label>
              <Button variant="ghost" size="sm" onClick={() => setCandles([])} className="h-6 text-[9px] font-bold text-red-400 p-0">Clear</Button>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => handleAddCandle('Bullish')} className="flex-1 bg-[#089981] h-7 text-[9px] font-bold"><Plus className="w-2.5 h-2.5 mr-1" /> Bull</Button>
              <Button onClick={() => handleAddCandle('Bearish')} variant="destructive" className="flex-1 bg-[#f23645] h-7 text-[9px] font-bold"><Plus className="w-2.5 h-2.5 mr-1" /> Bear</Button>
            </div>

            <ManualEditor candles={candles} onChange={handleUpdateCandle} onRemove={(idx) => setCandles(candles.filter((_, i) => i !== idx))} />
          </section>
        </div>
      </ScrollArea>

      <div className="p-3 bg-[#161616] border-t border-white/5 space-y-2 sticky bottom-0">
        <Button className="w-full h-8 font-bold text-[10px] gap-2 bg-slate-700 hover:bg-slate-600" onClick={handleReplay} disabled={candles.length === 0 || isAnimating}><RefreshCw className={`w-2.5 h-2.5 ${isAnimating ? 'animate-spin' : ''}`} /> Preview Animation</Button>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-8 text-[10px] font-bold border-white/10" onClick={handleExportSVG} disabled={candles.length === 0}>SVG</Button>
          <Button className="flex-1 h-8 text-[10px] font-bold bg-purple-600 hover:bg-purple-700" onClick={handleRecordVideo} disabled={candles.length === 0}>4K Video</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#000000] overflow-hidden font-body select-none">
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-white/5 bg-[#121212]">
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="lg:hidden h-10 flex items-center justify-between px-4 border-b border-white/5 bg-[#121212] z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white h-8 w-8"><Menu className="w-4 h-4" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px] bg-[#121212] border-r border-white/10">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
            <Zap className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
            Studio Ready
          </div>
        </header>

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
          {isRecording && (
            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 px-3 py-1 rounded flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-red-500 recording-pulse" />
              <span className="text-[8px] font-bold text-red-400 uppercase tracking-tighter">Recording 4K...</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-hidden bg-black">
          <div className="w-full max-w-[1400px]">
            <ChartRenderer 
              ref={chartRef}
              candles={candles} 
              settings={settings} 
              isAnimating={isAnimating}
              onAnimationComplete={() => setIsAnimating(false)}
            />
          </div>
        </div>

        <footer className="h-8 bg-[#121212] border-t border-white/5 px-6 flex items-center justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
          <div className="flex gap-6">
            <span>Zoom: {settings.zoom.toFixed(2)}x</span>
            <span>Dataset: {candles.length} Bars</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="w-2.5 h-2.5" />
            <span className="hidden sm:inline">3840 x 2160 LOSSLESS</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
