
"use client";

import React, { useState, useRef, useCallback } from "react";
import { Candlestick, ChartSettings } from "@/lib/chart-types";
import { TEMPLATES, createTemplateWithNewIds, createId, CANVAS_WIDTH, CANVAS_HEIGHT, getChartBounds } from "@/lib/chart-utils";
import ChartRenderer, { ChartRendererHandle } from "@/components/chart-renderer";
import ManualEditor from "@/components/manual-editor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Monitor,
  RefreshCw,
  Zap,
  Palette,
  Layers,
  Settings2,
  Trash2,
  Menu,
  X,
  FileCode,
  Video
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// --- Sub-Components ---

interface PanelProps {
  settings: ChartSettings;
  updateSettings: (newSettings: Partial<ChartSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const PropertiesPanel = ({ 
  settings, 
  updateSettings, 
  isOpen,
  onClose
}: PanelProps) => {
  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/5 text-white overflow-hidden w-[280px] animate-in slide-in-from-left duration-300">
      <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Studio Configuration</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 hover:bg-white/5">
          <X className="w-3 h-3" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-12">
          {/* Viewport Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-3 h-3 text-primary" />
              <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Viewport & Layout</Label>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/70 font-medium">Viewport Scale</span>
                <span className="text-[10px] font-mono text-primary">{(settings.zoom || 0.8).toFixed(2)}x</span>
              </div>
              <Slider 
                value={[settings.zoom || 0.8]} 
                min={0.1} 
                max={2.0} 
                step={0.01} 
                onValueChange={([v]) => updateSettings({ zoom: v })}
                className="py-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/70 font-medium">Horizontal Density</span>
                <span className="text-[10px] font-mono text-primary">{(settings.spacing || 1.2).toFixed(2)}x</span>
              </div>
              <Slider 
                value={[settings.spacing || 1.2]} 
                min={0.5} 
                max={5.0} 
                step={0.1} 
                onValueChange={([v]) => updateSettings({ spacing: v })}
                className="py-2"
              />
            </div>
          </div>

          <Separator className="bg-white/5" />

          {/* Animation Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Motion Sequence</Label>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/70 font-medium">Sequence Duration</span>
                <span className="text-[10px] font-mono text-primary">{(settings.speed || 0.8).toFixed(1)}s</span>
              </div>
              <Slider 
                value={[settings.speed || 0.8]} 
                min={0.1} 
                max={3.0} 
                step={0.1} 
                onValueChange={([v]) => updateSettings({ speed: v })}
                className="py-2"
              />
            </div>
          </div>

          <Separator className="bg-white/5" />

          {/* Color Profiles - Re-branded as Brand Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-3 h-3 text-primary" />
              <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Brand Identity</Label>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {/* Bullish Color Row */}
                <div className="flex items-center justify-between gap-3 bg-black/40 p-2 rounded-lg border border-white/5 focus-within:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border border-white/10 relative overflow-hidden bg-black/20">
                      <input 
                        type="color" 
                        value={settings.bullColor} 
                        onChange={(e) => updateSettings({ bullColor: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-100 cursor-pointer p-0 border-none bg-transparent scale-[2]" 
                      />
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tight">Bullish</span>
                  </div>
                  <input 
                    type="text"
                    value={settings.bullColor}
                    onChange={(e) => updateSettings({ bullColor: e.target.value })}
                    className="bg-transparent border-none text-[10px] font-mono text-white/70 w-20 text-right focus:ring-0 outline-none p-0 uppercase"
                    placeholder="#FFFFFF"
                  />
                </div>

                {/* Bearish Color Row */}
                <div className="flex items-center justify-between gap-3 bg-black/40 p-2 rounded-lg border border-white/5 focus-within:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border border-white/10 relative overflow-hidden bg-black/20">
                      <input 
                        type="color" 
                        value={settings.bearColor} 
                        onChange={(e) => updateSettings({ bearColor: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-100 cursor-pointer p-0 border-none bg-transparent scale-[2]" 
                      />
                    </div>
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-tight">Bearish</span>
                  </div>
                  <input 
                    type="text"
                    value={settings.bearColor}
                    onChange={(e) => updateSettings({ bearColor: e.target.value })}
                    className="bg-transparent border-none text-[10px] font-mono text-white/70 w-20 text-right focus:ring-0 outline-none p-0 uppercase"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>

            {/* Geometry Styles */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/70 font-medium">Body Radius</span>
                <span className="text-[10px] font-mono text-primary">{settings.bodyRadius}px</span>
              </div>
              <Slider 
                value={[settings.bodyRadius || 0]} 
                min={0} 
                max={20} 
                step={1} 
                onValueChange={([v]) => updateSettings({ bodyRadius: v })}
                className="py-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/70 font-medium">Wick Radius</span>
                <span className="text-[10px] font-mono text-primary">{settings.wickRadius}px</span>
              </div>
              <Slider 
                value={[settings.wickRadius || 0]} 
                min={0} 
                max={10} 
                step={1} 
                onValueChange={([v]) => updateSettings({ wickRadius: v })}
                className="py-2"
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

interface LayersPanelProps {
  candles: Candlestick[];
  onAddCandle: (type: 'Bullish' | 'Bearish' | 'Doji') => void;
  onUpdateCandle: (index: number, updated: Candlestick) => void;
  onRemoveCandle: (index: number) => void;
  onClearAll: () => void;
  onTemplateLoad: (val: string) => void;
}

const LayersPanel = ({ candles, onAddCandle, onUpdateCandle, onRemoveCandle, onClearAll, onTemplateLoad }: LayersPanelProps) => (
  <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-hidden w-full">
    <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20">
      <div className="flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Layer Stack</span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onClearAll} 
        disabled={candles.length === 0}
        className="h-6 px-2 text-[8px] font-bold hover:bg-red-500/10 hover:text-red-400 text-muted-foreground gap-1.5"
      >
        <Trash2 className="w-2.5 h-2.5" /> PURGE
      </Button>
    </div>
    
    <div className="p-3 bg-black/40 space-y-3">
      <div className="space-y-2">
        <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Market Templates</Label>
        <select 
          onChange={(e) => onTemplateLoad(e.target.value)} 
          className="flex w-full items-center justify-between rounded-md border ring-offset-background h-10 text-[10px] bg-black border-white/5 font-bold p-1 px-2 focus:ring-0 text-white outline-none"
        >
          <option value="custom">Kosongkan Layer</option>
          <optgroup label="General Patterns">
            <option value="spinning_tops">Spinning Tops</option>
            <option value="shooting_star">Shooting Star</option>
            <option value="hammer">Hammer</option>
            <option value="doji">Doji</option>
            <option value="bullish_engulfing">Bullish Engulfing</option>
            <option value="bearish_engulfing">Bearish Engulfing</option>
            <option value="evening_star">Evening Star</option>
            <option value="morning_star">Morning Star</option>
            <option value="three_soldiers">3 Soldiers</option>
            <option value="three_crows">3 Crows</option>
          </optgroup>
          <optgroup label="Market Structure (SNR)">
            <option value="bullish_snr_3_valleys">📈 Bullish SNR (3 Valleys)</option>
            <option value="bearish_snr_3_peaks">📉 Bearish SNR (3 Peaks)</option>
          </optgroup>
          <optgroup label="Advanced Price Action">
            <option value="trend_reversal_v_shape">🔄 V-Shape Reversal</option>
            <option value="bullish_fakeout_trap">🪤 Fakeout / Bull Trap</option>
            <option value="valid_breakout_retest">🚀 Breakout & Retest</option>
            <option value="strong_momentum_run">🔥 Strong Momentum (Marubozu)</option>
          </optgroup>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <Button onClick={() => onAddCandle('Bullish')} className="bg-[#00b386] hover:bg-[#00b386]/90 h-7 text-[8px] font-bold border-none uppercase">Bull</Button>
        <Button onClick={() => onAddCandle('Bearish')} variant="destructive" className="bg-[#f23645] hover:bg-[#f23645]/90 h-7 text-[8px] font-bold border-none uppercase">Bear</Button>
        <Button onClick={() => onAddCandle('Doji')} variant="outline" className="bg-[#333] hover:bg-[#444] h-7 text-[8px] font-bold border-none uppercase">Doji</Button>
      </div>
    </div>

    <ScrollArea className="flex-1">
      <div className="p-2 pb-8">
        <ManualEditor 
          candles={candles} 
          onChange={onUpdateCandle} 
          onRemove={onRemoveCandle} 
        />
      </div>
    </ScrollArea>
  </div>
);

export default function PricePatternStudio() {
  const [candles, setCandles] = useState<Candlestick[]>(TEMPLATES.bullish_snr_3_valleys);
  const [settings, setSettings] = useState<ChartSettings>({
    zoom: 0.8,
    spacing: 1.2, 
    speed: 0.8,
    autoCenter: true,
    bullColor: "#00b386",
    bearColor: "#f23645",
    bodyRadius: 0, 
    wickRadius: 0
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showProperties, setShowProperties] = useState(true);
  const [layersPanelWidth, setLayersPanelWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  
  const chartRef = useRef<ChartRendererHandle>(null);
  const { toast } = useToast();

  const updateSettings = useCallback((newSettings: Partial<ChartSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleTemplateLoad = useCallback((val: string) => {
    if (val === "custom") {
      setCandles([]);
      return;
    }
    const template = TEMPLATES[val as keyof typeof TEMPLATES];
    if (template) {
      setCandles(createTemplateWithNewIds(template));
    }
  }, []);

  const handleAddCandle = useCallback((type: 'Bullish' | 'Bearish' | 'Doji') => {
    setCandles(prev => {
      const lastClose = prev.length > 0 ? prev[prev.length - 1].close : 300;
      const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
      
      let open = lastClose;
      let close, high, low;

      if (type === 'Bullish') {
        const bodySize = randomRange(25, 65);
        const topWick = randomRange(5, 30);
        const botWick = randomRange(5, 30);
        close = open + bodySize;
        high = close + topWick;
        low = open - botWick;
      } else if (type === 'Bearish') {
        const bodySize = randomRange(25, 65);
        const topWick = randomRange(5, 30);
        const botWick = randomRange(5, 30);
        close = open - bodySize;
        high = open + topWick;
        low = close - botWick;
      } else { // Super-Random Doji
        const bodySize = randomRange(10, 25); 
        const isBullish = Math.random() > 0.5;
        const topWick = randomRange(25, 50);
        const botWick = randomRange(25, 50);
        
        close = isBullish ? open + bodySize : open - bodySize; 
        high = Math.max(open, close) + topWick;
        low = Math.min(open, close) - botWick;
      }

      const newCandle: Candlestick = { 
        id: createId(),
        open, 
        close, 
        high, 
        low, 
        offsetY: 0 
      };

      return [...prev, newCandle];
    });
  }, []);

  const handleUpdateCandle = useCallback((index: number, updated: Candlestick) => {
    setCandles(prev => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...updated };
      return next;
    });
  }, []);

  const handleRemoveCandle = useCallback((idx: number) => {
    setCandles(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleClearAll = useCallback(() => {
    setCandles([]);
  }, []);

  const handleExportSVG = useCallback(() => {
    if (candles.length === 0) return;
    
    const bounds = getChartBounds(candles);
    const range = Math.max(bounds.max - bounds.min, 1);
    const zoom = settings.zoom || 0.8;
    const spacingMultiplier = settings.spacing || 1.2;
    
    const Y_AXIS_WIDTH = 240;
    const X_AXIS_HEIGHT = 160;
    const chartAreaWidth = CANVAS_WIDTH - Y_AXIS_WIDTH;
    const chartAreaHeight = CANVAS_HEIGHT - X_AXIS_HEIGHT;
    const effectiveCount = Math.max(12, candles.length);
    const bodyWidth = (chartAreaWidth / effectiveCount) * 0.8 * zoom;
    const baseWidth = ((chartAreaWidth / effectiveCount) * 0.8) * spacingMultiplier;
    const actualWidth = (candles.length - 1) * baseWidth;
    const startX = (chartAreaWidth / 2) - (actualWidth / 2);
    const centerY = chartAreaHeight / 2;

    const getY = (price: number) => {
      const midPrice = (bounds.max + bounds.min) / 2;
      const scaledY = ((price - midPrice) / range) * (chartAreaHeight * 0.85);
      return centerY - scaledY;
    };

    let svgContent = `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">`;
    
    candles.forEach((c, i) => {
      const x = startX + (i * baseWidth);
      const priceOffset = c.offsetY || 0;
      const yOpen = getY(c.open + priceOffset);
      const yClose = getY(c.close + priceOffset);
      const yHigh = getY(c.high + priceOffset);
      const yLow = getY(c.low + priceOffset);
      
      const isBullish = c.close >= c.open;
      const color = isBullish ? settings.bullColor : settings.bearColor;
      const wickWidth = Math.max(10, bodyWidth * 0.15);
      const rectY = Math.min(yOpen, yClose);
      const rectHeight = Math.max(2, Math.abs(yOpen - yClose));
      const wickRectY = Math.min(yHigh, yLow);
      const wickRectHeight = Math.abs(yHigh - yLow);
      
      // Draw Wick
      svgContent += `<rect x="${x - wickWidth / 2}" y="${wickRectY}" width="${wickWidth}" height="${wickRectHeight}" rx="${settings.wickRadius}" fill="${color}" />`;
      
      // Draw Body
      svgContent += `<rect x="${x - bodyWidth / 2}" y="${rectY}" width="${bodyWidth}" height="${rectHeight}" rx="${settings.bodyRadius}" fill="${color}" />`;
    });

    svgContent += `<text x="${chartAreaWidth + 40}" y="${chartAreaHeight / 2}" fill="#888888" font-family="monospace" font-size="42" font-weight="bold">PRICE TICKER</text>`;
    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price-pattern-vector.svg`;
    a.click();
    toast({ title: "Vector Export", description: "SVG saved with transparent background." });
  }, [candles, settings, toast]);

  const handleReplay = useCallback(() => {
    if (candles.length === 0) return;
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 50);
  }, [candles.length]);

  const handleRecordVideo = async () => {
    const canvas = chartRef.current?.getCanvas();
    if (!canvas || candles.length === 0) return;
    setIsRecording(true);
    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 30000000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sequence-render.webm`;
      a.click();
      setIsRecording(false);
      setIsAnimating(false);
      toast({ title: "Video Export", description: "Alpha channel video saved." });
    };
    recorder.start();
    setIsAnimating(true);
  };

  const handleResizeStart = (e: React.PointerEvent) => {
    setIsResizing(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!isResizing) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 200 && newWidth <= 600) {
      setLayersPanelWidth(newWidth);
    }
  };

  const handleResizeEnd = (e: React.PointerEvent) => {
    setIsResizing(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex h-screen w-full bg-[#000000] overflow-hidden font-body select-none text-white">
      <aside className={cn("hidden lg:flex flex-col flex-shrink-0 transition-all duration-300", !showProperties && "w-0 overflow-hidden")}>
        <PropertiesPanel 
          settings={settings}
          updateSettings={updateSettings}
          isOpen={showProperties}
          onClose={() => setShowProperties(false)}
        />
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-black">
        <header className="h-12 flex items-center justify-between px-4 border-b border-white/5 bg-[#0a0a0a] z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowProperties(!showProperties)} className="hidden lg:flex text-white hover:bg-white/5">
              <Menu className="w-5 h-5" />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white h-9 w-9">
                  <Settings2 className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] bg-[#0a0a0a] border-r border-white/5">
                <PropertiesPanel 
                  settings={settings}
                  updateSettings={updateSettings}
                  isOpen={true}
                  onClose={() => {}}
                />
              </SheetContent>
            </Sheet>
            
            <div className="text-[10px] font-bold uppercase tracking-[2px] text-emerald-500 flex items-center gap-2">
              <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
              PricePattern Studio
            </div>
          </div>
        </header>

        {isRecording && (
          <div className="absolute top-16 left-6 z-20 pointer-events-none">
            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 px-4 py-1.5 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 recording-pulse" />
              <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Rendering Motion...</span>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 overflow-hidden bg-[#000]">
          <div className="w-full h-full flex items-center justify-center relative">
            <ChartRenderer 
              ref={chartRef}
              candles={candles} 
              settings={settings} 
              isAnimating={isAnimating}
              onAnimationComplete={() => setIsAnimating(false)}
              onSettingsChange={updateSettings}
            />
          </div>
          
          <div className="mt-6 flex items-center gap-4 bg-[#0a0a0a] p-3 rounded-xl border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isAnimating ? (
              <Button className="min-w-[120px] h-10 font-bold text-[11px] gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-all active:scale-95" onClick={() => setIsAnimating(false)}>
                <X className="w-3.5 h-3.5" /> Stop
              </Button>
            ) : (
              <Button className="min-w-[120px] h-10 font-bold text-[11px] gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95" onClick={handleReplay} disabled={candles.length === 0}>
                <RefreshCw className="w-3.5 h-3.5" /> Preview
              </Button>
            )}
            
            <Separator orientation="vertical" className="h-6 bg-white/10" />
            
            <Button variant="outline" className="h-10 px-6 text-[11px] font-bold border-white/10 bg-transparent hover:bg-white/5 gap-2" onClick={handleExportSVG} disabled={candles.length === 0}>
              <FileCode className="w-3.5 h-3.5" /> SVG
            </Button>
            
            <Button className="min-w-[140px] h-10 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 border-none gap-2 shadow-lg shadow-emerald-900/20" onClick={handleRecordVideo} disabled={candles.length === 0}>
              <Video className="w-3.5 h-3.5" /> Video
            </Button>
          </div>
        </div>

        <footer className="h-8 bg-[#0a0a0a] border-t border-white/5 px-4 flex items-center justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-[1px]">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Bars: {candles.length}</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Vector Protocol Active</span>
          </div>
          <div className="flex items-center gap-3">
            <Monitor className="w-3 h-3" />
            <span className="hidden sm:inline text-emerald-500/50">Core 4K Precision Active</span>
          </div>
        </footer>
      </main>

      <aside 
        className="hidden lg:flex flex-row flex-shrink-0 bg-[#0a0a0a] border-l border-white/5"
        style={{ width: `${layersPanelWidth}px` }}
      >
        <div 
          className="w-1.5 h-full cursor-col-resize hover:bg-emerald-500/30 transition-colors z-50 bg-white/5 active:bg-emerald-500/50"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
        />
        <div className="flex-1 h-full overflow-hidden">
          <LayersPanel 
            candles={candles}
            onAddCandle={handleAddCandle}
            onUpdateCandle={handleUpdateCandle}
            onRemoveCandle={handleRemoveCandle}
            onClearAll={handleClearAll}
            onTemplateLoad={handleTemplateLoad}
          />
        </div>
      </aside>
    </div>
  );
}
