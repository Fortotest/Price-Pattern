
"use client";

import React, { useState, useRef, useCallback } from "react";
import { Candlestick, ChartSettings } from "@/lib/chart-types";
import { generateSVG, TEMPLATES } from "@/lib/chart-utils";
import ChartRenderer, { ChartRendererHandle } from "@/components/chart-renderer";
import ManualEditor from "@/components/manual-editor";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Plus,
  Monitor,
  RefreshCw,
  Zap,
  Maximize,
  Palette,
  Layers,
  Settings2
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
    zoom: 0.8,
    spacing: 1.0, 
    speed: 0.8,
    autoCenter: true,
    bullColor: "#00b386",
    bearColor: "#f23645",
    bodyRadius: 0, 
    wickRadius: 0  
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chartRef = useRef<ChartRendererHandle>(null);
  const { toast } = useToast();

  const handleTemplateLoad = (val: string) => {
    const template = TEMPLATES[val as keyof typeof TEMPLATES];
    if (template) {
      setCandles(template);
      toast({ title: "Template Applied", description: val.replace(/_/g, ' ') });
    }
  };

  const handleAddCandle = (type: 'Bullish' | 'Bearish') => {
    const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 300;
    const bodySize = 50; 
    const wickSize = 20;
    
    const newCandle: Candlestick = type === 'Bullish' 
      ? { 
          open: lastClose, 
          close: lastClose + bodySize, 
          high: lastClose + bodySize + wickSize, 
          low: lastClose - wickSize, 
          offsetY: 0 
        }
      : { 
          open: lastClose, 
          close: lastClose - bodySize, 
          high: lastClose + wickSize, 
          low: lastClose - bodySize - wickSize, 
          offsetY: 0 
        };
    
    setCandles(prev => [...prev, newCandle]);
  };

  const handleUpdateCandle = useCallback((index: number, updated: Candlestick) => {
    setCandles(prev => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }, []);

  const handleExportSVG = () => {
    if (candles.length === 0) return;
    const svg = generateSVG(candles, settings);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-vector.svg`;
    a.click();
    toast({ title: "SVG Exported", description: "File saved." });
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
      a.download = `chart-animation.webm`;
      a.click();
      setIsRecording(false);
      setIsAnimating(false);
      toast({ title: "Video Ready", description: "4K Render finished." });
    };
    recorder.start();
    setIsAnimating(true);
  };

  const PropertiesPanel = () => (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-[#1a1a1a] text-white overflow-hidden w-[280px]">
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Properties</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-12">
          <div className="space-y-3">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Library</Label>
            <Select onValueChange={handleTemplateLoad}>
              <SelectTrigger className="bg-black border-white/5 h-8 text-[10px] rounded-sm focus:ring-0">
                <SelectValue placeholder="Choose Template" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c212f] border-white/10 text-white">
                <SelectGroup>
                  <SelectLabel>Single Patterns</SelectLabel>
                  <SelectItem value="HAMMER">🔨 Hammer</SelectItem>
                  <SelectItem value="SHOOTING_STAR">💫 Shooting Star</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Multi Bar</SelectLabel>
                  <SelectItem value="BULLISH_ENGULFING">🔥 Engulfing Bull</SelectItem>
                  <SelectItem value="BEARISH_ENGULFING">❄️ Engulfing Bear</SelectItem>
                  <SelectItem value="DOUBLE_BOTTOM">🇼 Double Bottom</SelectItem>
                  <SelectItem value="DOUBLE_TOP">🇲 Double Top</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-white/5" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Maximize className="w-3 h-3 text-primary" />
              <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">View Controls</Label>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-0.5">
                  <Label className="text-[9px] text-muted-foreground">Zoom Level</Label>
                  <span className="text-[9px] font-mono text-primary">{settings.zoom.toFixed(2)}x</span>
                </div>
                <Slider 
                  value={[settings.zoom]} 
                  min={0.3} 
                  max={1.0} 
                  step={0.01} 
                  onValueChange={([v]) => setSettings(s => ({...s, zoom: v}))}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-0.5">
                  <Label className="text-[9px] text-muted-foreground">Candle Spacing</Label>
                  <span className="text-[9px] font-mono text-primary">{settings.spacing.toFixed(1)}x</span>
                </div>
                <Slider 
                  value={[settings.spacing]} 
                  min={0.5} 
                  max={3.0} 
                  step={0.05} 
                  onValueChange={([v]) => setSettings(s => ({...s, spacing: v}))}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-0.5">
                  <Label className="text-[9px] text-muted-foreground">Anim Speed</Label>
                  <span className="text-[9px] font-mono text-primary">{settings.speed}s</span>
                </div>
                <Slider 
                  value={[settings.speed]} 
                  min={0.1} 
                  max={2.0} 
                  step={0.05} 
                  onValueChange={([v]) => setSettings(s => ({...s, speed: v}))}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-white/5" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-3 h-3 text-primary" />
              <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Visual Styles</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-center h-8 rounded bg-black border border-white/5 relative overflow-hidden">
                  <input 
                    type="color" 
                    value={settings.bullColor} 
                    onInput={(e) => {
                      const val = e.currentTarget.value;
                      setSettings(s => ({...s, bullColor: val}));
                    }} 
                    className="absolute inset-0 w-full h-full opacity-100 cursor-pointer p-0 border-none bg-transparent" 
                  />
                </div>
                <Input 
                  value={settings.bullColor} 
                  onInput={(e) => {
                    const val = e.currentTarget.value;
                    setSettings(s => ({...s, bullColor: val}));
                  }}
                  className="h-6 text-[9px] font-mono uppercase bg-black border-white/5 px-2 text-center focus-visible:ring-0"
                  placeholder="#HEX"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center h-8 rounded bg-black border border-white/5 relative overflow-hidden">
                  <input 
                    type="color" 
                    value={settings.bearColor} 
                    onInput={(e) => {
                      const val = e.currentTarget.value;
                      setSettings(s => ({...s, bearColor: val}));
                    }} 
                    className="absolute inset-0 w-full h-full opacity-100 cursor-pointer p-0 border-none bg-transparent" 
                  />
                </div>
                <Input 
                  value={settings.bearColor} 
                  onInput={(e) => {
                    const val = e.currentTarget.value;
                    setSettings(s => ({...s, bearColor: val}));
                  }}
                  className="h-6 text-[9px] font-mono uppercase bg-black border-white/5 px-2 text-center focus-visible:ring-0"
                  placeholder="#HEX"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-0.5">
                <Label className="text-[9px] text-muted-foreground">Body Radius</Label>
                <span className="text-[9px] font-mono text-primary">{settings.bodyRadius}px</span>
              </div>
              <Slider 
                value={[settings.bodyRadius]} 
                min={0} 
                max={20} 
                step={1} 
                onValueChange={([v]) => setSettings(s => ({...s, bodyRadius: v}))}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-0.5">
                <Label className="text-[9px] text-muted-foreground">Wick Rounding</Label>
                <span className="text-[9px] font-mono text-primary">{settings.wickRadius}px</span>
              </div>
              <Slider 
                value={[settings.wickRadius]} 
                min={0} 
                max={10} 
                step={1} 
                onValueChange={([v]) => setSettings(s => ({...s, wickRadius: v}))}
              />
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-3 bg-[#0d0d0d] border-t border-white/5 space-y-2">
        <Button className="w-full h-8 font-bold text-[10px] gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-white/5" onClick={handleReplay} disabled={candles.length === 0 || isAnimating}>
          <RefreshCw className={`w-3 h-3 ${isAnimating ? 'animate-spin' : ''}`} /> Preview
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-8 text-[10px] font-bold border-white/5 bg-transparent" onClick={handleExportSVG} disabled={candles.length === 0}>SVG</Button>
          <Button className="flex-1 h-8 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 border-none" onClick={handleRecordVideo} disabled={candles.length === 0}>4K Video</Button>
        </div>
      </div>
    </div>
  );

  const LayersPanel = () => (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-[#1a1a1a] text-white overflow-hidden w-[260px]">
      <div className="p-3 border-b border-white/5 flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Layers</span>
      </div>
      
      <div className="p-3 bg-black/40 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => handleAddCandle('Bullish')} className="bg-[#00b386] hover:bg-[#00b386]/90 h-7 text-[9px] font-bold border-none"><Plus className="w-3 h-3 mr-1" /> Bull</Button>
          <Button onClick={() => handleAddCandle('Bearish')} variant="destructive" className="bg-[#f23645] hover:bg-[#f23645]/90 h-7 text-[9px] font-bold border-none"><Plus className="w-3 h-3 mr-1" /> Bear</Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 pb-8">
          <ManualEditor 
            candles={candles} 
            onChange={handleUpdateCandle} 
            onRemove={(idx) => setCandles(prev => prev.filter((_, i) => i !== idx))} 
          />
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#000000] overflow-hidden font-body select-none">
      <aside className="hidden lg:flex flex-col flex-shrink-0">
        <PropertiesPanel />
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-black">
        <header className="lg:hidden h-12 flex items-center justify-between px-4 border-b border-white/5 bg-[#0a0a0a] z-30">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white h-9 w-9"><Settings2 className="w-5 h-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] bg-[#0a0a0a] border-r border-white/5">
              <PropertiesPanel />
            </SheetContent>
          </Sheet>
          <div className="text-[10px] font-bold uppercase tracking-[2px] text-emerald-500 flex items-center gap-2">
            <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
            Studio
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white h-9 w-9"><Layers className="w-5 h-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[260px] bg-[#0a0a0a] border-l border-white/5">
              <LayersPanel />
            </SheetContent>
          </Sheet>
        </header>

        {isRecording && (
          <div className="absolute top-6 left-6 z-20 pointer-events-none">
            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 px-4 py-1.5 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 recording-pulse" />
              <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Rendering 4K...</span>
            </div>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-hidden bg-[#000]">
          <div className="w-full h-full flex items-center justify-center">
            <ChartRenderer 
              ref={chartRef}
              candles={candles} 
              settings={settings} 
              isAnimating={isAnimating}
              onAnimationComplete={() => setIsAnimating(false)}
            />
          </div>
        </div>

        <footer className="h-8 bg-[#0a0a0a] border-t border-white/5 px-4 flex items-center justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-[1px]">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Bars: {candles.length}</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Zoom: {settings.zoom.toFixed(2)}x</span>
          </div>
          <div className="flex items-center gap-3">
            <Monitor className="w-3 h-3" />
            <span className="hidden sm:inline text-emerald-500/50">Core 4K Active</span>
          </div>
        </footer>
      </main>

      <aside className="hidden lg:flex flex-col flex-shrink-0">
        <LayersPanel />
      </aside>
    </div>
  );
}
