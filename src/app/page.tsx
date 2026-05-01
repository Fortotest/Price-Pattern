
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Candlestick, ChartSettings } from "@/lib/chart-types";
import { generateSVG, TEMPLATES } from "@/lib/chart-utils";
import ChartRenderer, { ChartRendererHandle } from "@/components/chart-renderer";
import ManualEditor from "@/components/manual-editor";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  Download,
  Video,
  Dices
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
import { cn } from "@/lib/utils";

// --- Sub-Components ---

interface PanelProps {
  settings: ChartSettings;
  updateSettings: (newSettings: Partial<ChartSettings>) => void;
  onTemplateLoad: (val: string) => void;
  onApplyVolatility: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const PropertiesPanel = ({ 
  settings, 
  updateSettings, 
  onTemplateLoad,
  onApplyVolatility,
  isOpen,
  onClose
}: PanelProps) => {
  const [localSpeed, setLocalSpeed] = useState(settings.speed);
  const [localBodyRadius, setLocalBodyRadius] = useState(settings.bodyRadius);
  const [localWickRadius, setLocalWickRadius] = useState(settings.wickRadius);
  const [localVolatility, setLocalVolatility] = useState(settings.volatility || 0.5);

  useEffect(() => {
    setLocalSpeed(settings.speed);
    setLocalBodyRadius(settings.bodyRadius);
    setLocalWickRadius(settings.wickRadius);
    setLocalVolatility(settings.volatility || 0.5);
  }, [settings.speed, settings.bodyRadius, settings.wickRadius, settings.volatility]);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const syncSettings = (newVal: Partial<ChartSettings>) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => updateSettings(newVal), 40);
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/5 text-white overflow-hidden w-[260px] animate-in slide-in-from-left duration-300">
      <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Properties</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 hover:bg-white/5">
          <X className="w-3 h-3" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-12">
          <div className="space-y-3">
            <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Library</Label>
            <Select onValueChange={onTemplateLoad}>
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
              <Zap className="w-3 h-3 text-primary" />
              <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Animation</Label>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-0.5">
                  <Label className="text-[9px] text-muted-foreground">Anim Speed</Label>
                  <span className="text-[9px] font-mono text-primary">{localSpeed}s</span>
                </div>
                <Slider 
                  value={[localSpeed]} 
                  min={0.1} 
                  max={2.0} 
                  step={0.05} 
                  onValueChange={(val) => {
                    setLocalSpeed(val[0]);
                    syncSettings({ speed: val[0] });
                  }}
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
                <div className="flex items-center justify-center h-10 rounded bg-black border border-white/5 relative overflow-hidden transition-all hover:border-white/10">
                  <input 
                    type="color" 
                    value={settings.bullColor} 
                    onInput={(e) => {
                      const val = e.currentTarget.value;
                      updateSettings({ bullColor: val });
                    }} 
                    className="absolute inset-0 w-full h-full opacity-100 cursor-pointer p-0 border-none bg-transparent scale-110" 
                  />
                </div>
                <Input 
                  value={settings.bullColor} 
                  onInput={(e) => {
                    const val = e.currentTarget.value;
                    updateSettings({ bullColor: val });
                  }}
                  className="h-6 text-[9px] font-mono uppercase bg-black border-white/5 px-2 text-center focus-visible:ring-0"
                  placeholder="#HEX"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center h-10 rounded bg-black border border-white/5 relative overflow-hidden transition-all hover:border-white/10">
                  <input 
                    type="color" 
                    value={settings.bearColor} 
                    onInput={(e) => {
                      const val = e.currentTarget.value;
                      updateSettings({ bearColor: val });
                    }} 
                    className="absolute inset-0 w-full h-full opacity-100 cursor-pointer p-0 border-none bg-transparent scale-110" 
                  />
                </div>
                <Input 
                  value={settings.bearColor} 
                  onInput={(e) => {
                    const val = e.currentTarget.value;
                    updateSettings({ bearColor: val });
                  }}
                  className="h-6 text-[9px] font-mono uppercase bg-black border-white/5 px-2 text-center focus-visible:ring-0"
                  placeholder="#HEX"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-0.5">
                <Label className="text-[9px] text-muted-foreground">Body Radius</Label>
                <span className="text-[9px] font-mono text-primary">{localBodyRadius}px</span>
              </div>
              <Slider 
                value={[localBodyRadius]} 
                min={0} 
                max={20} 
                step={1} 
                onValueChange={(val) => {
                  setLocalBodyRadius(val[0]);
                  syncSettings({ bodyRadius: val[0] });
                }}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-0.5">
                <Label className="text-[9px] text-muted-foreground">Wick Rounding</Label>
                <span className="text-[9px] font-mono text-primary">{localWickRadius}px</span>
              </div>
              <Slider 
                value={[localWickRadius]} 
                min={0} 
                max={10} 
                step={1} 
                onValueChange={(val) => {
                  setLocalWickRadius(val[0]);
                  syncSettings({ wickRadius: val[0] });
                }}
              />
            </div>

            <Separator className="bg-white/5 !my-4" />

            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Market Volatility</Label>
                  <span className="text-[9px] font-mono text-primary">{(localVolatility * 100).toFixed(0)}%</span>
               </div>
               <Slider 
                value={[localVolatility]} 
                min={0.1} 
                max={2.0} 
                step={0.1} 
                onValueChange={(val) => {
                  setLocalVolatility(val[0]);
                  syncSettings({ volatility: val[0] });
                }}
              />
              <Button 
                onClick={onApplyVolatility} 
                className="w-full h-9 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold gap-2 group transition-all"
              >
                <Dices className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                APPLY VOLATILITY
              </Button>
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
}

const LayersPanel = ({ candles, onAddCandle, onUpdateCandle, onRemoveCandle, onClearAll }: LayersPanelProps) => (
  <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-white/5 text-white overflow-hidden w-[260px]">
    <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20">
      <div className="flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Layers</span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onClearAll} 
        disabled={candles.length === 0}
        className="h-6 px-2 text-[8px] font-bold hover:bg-red-500/10 hover:text-red-400 text-muted-foreground gap-1.5"
      >
        <Trash2 className="w-2.5 h-2.5" /> CLEAR
      </Button>
    </div>
    
    <div className="p-3 bg-black/40 space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        <Button onClick={() => onAddCandle('Bullish')} className="bg-[#00b386] hover:bg-[#00b386]/90 h-7 text-[8px] font-bold border-none">BULL</Button>
        <Button onClick={() => onAddCandle('Bearish')} variant="destructive" className="bg-[#f23645] hover:bg-[#f23645]/90 h-7 text-[8px] font-bold border-none">BEAR</Button>
        <Button onClick={() => onAddCandle('Doji')} variant="outline" className="bg-[#333] hover:bg-[#444] h-7 text-[8px] font-bold border-none">DOJI</Button>
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

// --- Main Page Component ---

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
    wickRadius: 0,
    volatility: 0.5
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showProperties, setShowProperties] = useState(true);
  
  const chartRef = useRef<ChartRendererHandle>(null);
  const { toast } = useToast();

  const updateSettings = useCallback((newSettings: Partial<ChartSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleTemplateLoad = useCallback((val: string) => {
    const template = TEMPLATES[val as keyof typeof TEMPLATES];
    if (template) {
      setCandles(template);
    }
  }, []);

  const handleAddCandle = useCallback((type: 'Bullish' | 'Bearish' | 'Doji') => {
    const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 300;
    const isDoji = type === 'Doji';
    const bodySize = isDoji ? 10 : 50; 
    const wickSize = 20;
    
    let newCandle: Candlestick;
    
    if (isDoji) {
      newCandle = {
        open: lastClose,
        close: lastClose + 10,
        high: lastClose + 30,
        low: lastClose - 20,
        offsetY: 0
      };
    } else if (type === 'Bullish') {
      newCandle = { 
        open: lastClose, 
        close: lastClose + bodySize, 
        high: lastClose + bodySize + wickSize, 
        low: lastClose - wickSize, 
        offsetY: 0 
      };
    } else {
      newCandle = { 
        open: lastClose, 
        close: lastClose - bodySize, 
        high: lastClose + wickSize, 
        low: lastClose - bodySize - wickSize, 
        offsetY: 0 
      };
    }
    
    setCandles(prev => [...prev, newCandle]);
  }, [candles]);

  const handleUpdateCandle = useCallback((index: number, updated: Candlestick) => {
    setCandles(prev => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }, []);

  const handleRemoveCandle = useCallback((idx: number) => {
    setCandles(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleClearAll = useCallback(() => {
    setCandles([]);
  }, []);

  const handleApplyVolatility = useCallback(() => {
    if (candles.length === 0) return;
    
    setCandles(prev => prev.map(c => {
      const bodyMax = Math.max(c.open, c.close);
      const bodyMin = Math.min(c.open, c.close);
      const noiseLevel = settings.volatility || 0.5;
      
      const randomTop = (Math.random() * 60 + 5) * noiseLevel;
      const randomBot = (Math.random() * 60 + 5) * noiseLevel;
      
      return {
        ...c,
        high: bodyMax + randomTop,
        low: bodyMin - randomBot
      };
    }));
  }, [candles.length, settings.volatility]);

  const handleExportSVG = useCallback(() => {
    if (candles.length === 0) return;
    const svg = generateSVG(candles, settings);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-vector.svg`;
    a.click();
    toast({ title: "SVG Exported", description: "File saved." });
  }, [candles, settings, toast]);

  const handleReplay = useCallback(() => {
    if (candles.length === 0) return;
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 20);
  }, [candles.length]);

  const handleStopAnimation = useCallback(() => {
    setIsAnimating(false);
  }, []);

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

  return (
    <div className="flex h-screen w-full bg-[#000000] overflow-hidden font-body select-none">
      {/* Desktop Properties Sidebar */}
      <aside className={cn("hidden lg:flex flex-col flex-shrink-0 transition-all duration-300", !showProperties && "w-0 overflow-hidden")}>
        <PropertiesPanel 
          settings={settings}
          updateSettings={updateSettings}
          onTemplateLoad={handleTemplateLoad}
          onApplyVolatility={handleApplyVolatility}
          isOpen={showProperties}
          onClose={() => setShowProperties(false)}
        />
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-black">
        <header className="h-12 flex items-center justify-between px-4 border-b border-white/5 bg-[#0a0a0a] z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowProperties(!showProperties)}
              className="hidden lg:flex text-white hover:bg-white/5"
            >
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
                  onTemplateLoad={handleTemplateLoad}
                  onApplyVolatility={handleApplyVolatility}
                  isOpen={true}
                  onClose={() => {}}
                />
              </SheetContent>
            </Sheet>
            
            <div className="text-[10px] font-bold uppercase tracking-[2px] text-emerald-500 flex items-center gap-2">
              <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
              Studio
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white h-9 w-9 lg:hidden">
                  <Layers className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-[260px] bg-[#0a0a0a] border-l border-white/5">
                <LayersPanel 
                  candles={candles}
                  onAddCandle={handleAddCandle}
                  onUpdateCandle={handleUpdateCandle}
                  onRemoveCandle={handleRemoveCandle}
                  onClearAll={handleClearAll}
                />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {isRecording && (
          <div className="absolute top-16 left-6 z-20 pointer-events-none">
            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 px-4 py-1.5 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 recording-pulse" />
              <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Rendering 4K...</span>
            </div>
          </div>
        )}

        {/* Chart Area */}
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
          
          {/* Action Toolbar Below Canvas */}
          <div className="mt-6 flex items-center gap-4 bg-[#0a0a0a] p-3 rounded-xl border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isAnimating ? (
              <Button 
                className="min-w-[120px] h-10 font-bold text-[11px] gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-all active:scale-95" 
                onClick={handleStopAnimation} 
              >
                <X className="w-3.5 h-3.5" /> Stop
              </Button>
            ) : (
              <Button 
                className="min-w-[120px] h-10 font-bold text-[11px] gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95" 
                onClick={handleReplay} 
                disabled={candles.length === 0}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Preview
              </Button>
            )}
            
            <Separator orientation="vertical" className="h-6 bg-white/10" />
            
            <Button 
              variant="outline" 
              className="h-10 px-6 text-[11px] font-bold border-white/10 bg-transparent hover:bg-white/5 gap-2" 
              onClick={handleExportSVG} 
              disabled={candles.length === 0}
            >
              <Download className="w-3.5 h-3.5" /> SVG
            </Button>
            
            <Button 
              className="min-w-[140px] h-10 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 border-none gap-2 shadow-lg shadow-emerald-900/20" 
              onClick={handleRecordVideo} 
              disabled={candles.length === 0}
            >
              <Video className="w-3.5 h-3.5" /> Render 4K Video
            </Button>
          </div>
        </div>

        <footer className="h-8 bg-[#0a0a0a] border-t border-white/5 px-4 flex items-center justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-[1px]">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Bars: {candles.length}</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> Professional Axis Enabled</span>
          </div>
          <div className="flex items-center gap-3">
            <Monitor className="w-3 h-3" />
            <span className="hidden sm:inline text-emerald-500/50">Core 4K Active</span>
          </div>
        </footer>
      </main>

      {/* Desktop Layers Sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0">
        <LayersPanel 
          candles={candles}
          onAddCandle={handleAddCandle}
          onUpdateCandle={handleUpdateCandle}
          onRemoveCandle={handleRemoveCandle}
          onClearAll={handleClearAll}
        />
      </aside>
    </div>
  );
}
