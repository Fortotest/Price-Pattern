
"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Candlestick, ChartSettings, ChartPage } from "@/lib/chart-types";
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
  Video,
  Instagram,
  Plus,
  Copy,
  MoreHorizontal
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const NOTIF_SOUND_URLS = [
  "https://raw.githubusercontent.com/Fortotest/Market.ai/aa1fd92abd82277252b6d10912a44c3146ade1ad/hey-antek-antek-asing-prabowo.mp3",
  "https://raw.githubusercontent.com/Fortotest/Market.ai/055e319fa2c7c1e028057e8c69556c303b827848/hidup-jokowi.mp3"
];

// --- Sub-Components ---

interface PanelProps {
  settings: ChartSettings;
  updateSettings: (newSettings: Partial<ChartSettings>) => void;
  onClose: () => void;
}

const PropertiesPanel = ({ 
  settings, 
  updateSettings, 
  onClose
}: PanelProps) => {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-hidden w-full lg:w-[280px]">
      <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Configuration</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 hover:bg-white/5 flex">
          <X className="w-3 h-3" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-12">
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

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-3 h-3 text-primary" />
              <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Brand Identity</Label>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
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
                  />
                </div>

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
                  />
                </div>
              </div>
            </div>

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
  onClose: () => void;
}

const LayersPanel = ({ candles, onAddCandle, onUpdateCandle, onRemoveCandle, onClearAll, onTemplateLoad, onClose }: LayersPanelProps) => (
  <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-hidden w-full">
    <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20">
      <div className="flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Layer Stack</span>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 hover:bg-white/5 flex">
        <X className="w-3 h-3" />
      </Button>
    </div>
    
    <div className="p-3 bg-black/40 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Market Templates</Label>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAll} 
            disabled={candles.length === 0}
            className="h-5 px-1.5 text-[8px] font-bold hover:bg-red-500/10 hover:text-red-400 text-muted-foreground gap-1"
          >
            <Trash2 className="w-2.5 h-2.5" /> CLEAR ALL
          </Button>
        </div>
        <select 
          onChange={(e) => onTemplateLoad(e.target.value)} 
          className="flex w-full items-center justify-between rounded-md border ring-offset-background h-10 text-[10px] bg-black border-white/5 font-bold p-1 px-2 focus:ring-0 text-white outline-none"
        >
          <option value="custom">Kosongkan Layer</option>
          <optgroup label="General Patterns">
            <option value="spinning_tops">😐 Spinning Tops</option>
            <option value="shooting_star">😰 Shooting Star</option>
            <option value="hammer">😤 Hammer</option>
            <option value="doji">😐 Doji</option>
            <option value="bullish_engulfing">😎 Bullish Engulfing</option>
            <option value="bearish_engulfing">😱 Bearish Engulfing</option>
            <option value="evening_star">😴 Evening Star</option>
            <option value="morning_star">🤩 Morning Star</option>
            <option value="three_soldiers">🫡 3 Soldiers</option>
            <option value="three_crows">🧟 3 Crows</option>
          </optgroup>
          <optgroup label="Macro Market Structures">
            <option value="bullish_snr_3_valleys">📈 SNR Bullish (3 Valleys)</option>
            <option value="bearish_snr_3_peaks">📉 SNR Bearish (3 Peaks)</option>
          </optgroup>
          <optgroup label="Advanced Price Action">
            <option value="trend_reversal_v_shape">🔄 V-Shape Reversal</option>
            <option value="bullish_fakeout_trap">🤡 Fakeout / Bull Trap</option>
            <option value="valid_breakout_retest">🧐 Breakout & Retest</option>
            <option value="strong_momentum_run">🥵 Strong Momentum</option>
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

// --- Small Preview Helper for Navigator ---
const PagePreview = ({ candles, settings }: { candles: Candlestick[], settings: ChartSettings }) => {
  if (candles.length === 0) return <div className="w-full h-full flex items-center justify-center opacity-10"><Zap className="w-5 h-5 text-white/50" /></div>;
  
  const bounds = getChartBounds(candles);
  const range = Math.max(bounds.max - bounds.min, 1);
  const width = 120;
  const height = 80;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-hidden preserve-3d opacity-80">
      {candles.map((c, i) => {
        const x = (i / Math.max(1, candles.length - 1)) * (width - 30) + 15;
        const getY = (p: number) => height - ((p - bounds.min) / range) * (height - 30) - 15;
        const yOpen = getY(c.open + (c.offsetY || 0));
        const yClose = getY(c.close + (c.offsetY || 0));
        const yHigh = getY(c.high + (c.offsetY || 0));
        const yLow = getY(c.low + (c.offsetY || 0));
        const isBullish = c.close >= c.open;
        const color = isBullish ? settings.bullColor : settings.bearColor;

        return (
          <g key={c.id}>
            <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="2" strokeLinecap="round" />
            <rect 
              x={x - 3} 
              y={Math.min(yOpen, yClose)} 
              width="6" 
              height={Math.max(2, Math.abs(yOpen - yClose))} 
              fill={color}
              rx="1.5"
            />
          </g>
        );
      })}
    </svg>
  );
};

export default function PricePattern() {
  const [pages, setPages] = useState<ChartPage[]>([
    { id: createId(), name: "Page 1", candles: createTemplateWithNewIds(TEMPLATES.bullish_snr_3_valleys) }
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  
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
  const [showProperties, setShowProperties] = useState(true);
  const [layersPanelWidth, setLayersPanelWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [notification, setNotification] = useState<{title: string, emoji: string} | null>(null);
  
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  
  const chartRef = useRef<ChartRendererHandle>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const activePage = useMemo(() => pages[activePageIndex], [pages, activePageIndex]);
  const candles = activePage.candles;

  const audioInitializedRef = useRef(false);
  const unlockAudio = useCallback(() => {
    if (audioInitializedRef.current) return;
    const silentAudio = new Audio();
    silentAudio.play().catch(() => {});
    audioInitializedRef.current = true;
  }, []);

  const playNotifSound = useCallback(() => {
    const randomUrl = NOTIF_SOUND_URLS[Math.floor(Math.random() * NOTIF_SOUND_URLS.length)];
    const audio = new Audio(randomUrl);
    audio.volume = 1.0; 
    audio.play().catch(e => console.warn("Audio play failed:", e));
  }, []);

  const showNotification = useCallback((title: string, emoji: string) => {
    setNotification({ title, emoji });
    playNotifSound();
    setTimeout(() => setNotification(null), 5000);
  }, [playNotifSound]);

  const updateSettings = useCallback((newSettings: Partial<ChartSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const updateActivePageCandles = useCallback((newCandles: Candlestick[]) => {
    setPages(prev => {
      const updated = [...prev];
      updated[activePageIndex] = { ...updated[activePageIndex], candles: newCandles };
      return updated;
    });
  }, [activePageIndex]);

  const handleTemplateLoad = useCallback((val: string) => {
    if (val === "custom") {
      updateActivePageCandles([]);
      return;
    }
    const template = TEMPLATES[val as keyof typeof TEMPLATES];
    if (template) {
      updateActivePageCandles(createTemplateWithNewIds(template));
    }
  }, [updateActivePageCandles]);

  const handleAddCandle = useCallback((type: 'Bullish' | 'Bearish' | 'Doji') => {
    unlockAudio();
    const currentCandles = pages[activePageIndex].candles;
    const lastClose = currentCandles.length > 0 ? currentCandles[currentCandles.length - 1].close : 300;
    const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    let open = lastClose;
    let close, high, low;

    if (type === 'Bullish') {
      const bodySize = randomRange(50, 150);
      const topWick = randomRange(25, 60);
      const botWick = randomRange(20, 70);
      close = open + bodySize;
      high = close + topWick;
      low = open - botWick;
    } else if (type === 'Bearish') {
      const bodySize = randomRange(50, 150);
      const topWick = randomRange(25, 60);
      const botWick = randomRange(20, 70);
      close = open - bodySize;
      high = open + topWick;
      low = close - botWick;
    } else { 
      const bodySize = randomRange(10, 25); 
      const isBullish = Math.random() > 0.5;
      const topWick = randomRange(25, 50);
      const botWick = randomRange(25, 50);
      close = isBullish ? open + bodySize : open - bodySize; 
      high = Math.max(open, close) + topWick;
      low = Math.min(open, close) - botWick;
    }

    const newCandle: Candlestick = { id: createId(), open, close, high, low, offsetY: 0 };
    updateActivePageCandles([...currentCandles, newCandle]);
  }, [activePageIndex, pages, unlockAudio, updateActivePageCandles]);

  const handleUpdateCandle = useCallback((index: number, updated: Candlestick) => {
    const next = [...pages[activePageIndex].candles];
    if (!next[index]) return;
    next[index] = { ...updated };
    updateActivePageCandles(next);
  }, [activePageIndex, pages, updateActivePageCandles]);

  const handleRemoveCandle = useCallback((idx: number) => {
    updateActivePageCandles(pages[activePageIndex].candles.filter((_, i) => i !== idx));
  }, [activePageIndex, pages, updateActivePageCandles]);

  const handleClearAll = useCallback(() => {
    updateActivePageCandles([]);
  }, [updateActivePageCandles]);

  const handleAddPage = useCallback(() => {
    const newPage: ChartPage = {
      id: createId(),
      name: `Page ${pages.length + 1}`,
      candles: createTemplateWithNewIds(TEMPLATES.bullish_snr_3_valleys)
    };
    setPages(prev => [...prev, newPage]);
    setActivePageIndex(pages.length);
  }, [pages]);

  const handleDuplicatePage = useCallback((index: number) => {
    const pageToDup = pages[index];
    const newPage: ChartPage = {
      id: createId(),
      name: `${pageToDup.name} (Copy)`,
      candles: createTemplateWithNewIds(pageToDup.candles)
    };
    const updated = [...pages];
    updated.splice(index + 1, 0, newPage);
    setPages(updated);
    setActivePageIndex(index + 1);
  }, [pages]);

  const handleDeletePage = useCallback((index: number) => {
    if (pages.length <= 1) return;
    setPages(prev => prev.filter((_, i) => i !== index));
    if (activePageIndex >= index && activePageIndex > 0) {
      setActivePageIndex(prev => prev - 1);
    }
  }, [pages.length, activePageIndex]);

  const handleExportSVG = useCallback(() => {
    unlockAudio();
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
      svgContent += `<rect x="${x - wickWidth / 2}" y="${Math.min(yHigh, yLow)}" width="${wickWidth}" height="${Math.abs(yHigh - yLow)}" rx="${settings.wickRadius}" fill="${color}" />`;
      svgContent += `<rect x="${x - bodyWidth / 2}" y="${Math.min(yOpen, yClose)}" width="${bodyWidth}" height="${Math.max(2, Math.abs(yOpen - yClose))}" rx="${settings.bodyRadius}" fill="${color}" />`;
    });
    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PricePattern_SVG_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("Berhasil di unduh", "🥳");
  }, [candles, settings, showNotification, unlockAudio]);

  const handleReplay = useCallback(() => {
    unlockAudio();
    if (candles.length === 0) return;
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 50);
  }, [candles.length, unlockAudio]);

  const handleRecordVideo = async () => {
    unlockAudio();
    const canvas = chartRef.current?.getCanvas();
    if (!canvas || candles.length === 0) return;
    setIsAnimating(false);
    setTimeout(() => {
      const stream = canvas.captureStream(30); 
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 15000000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      recorder.onstop = () => {
        if (chunks.length === 0) return;
        const url = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `PricePattern_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsAnimating(false);
        showNotification("Berhasil di unduh", "🤩");
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsAnimating(true);
    }, 100);
  };

  const handleAnimationComplete = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
      recorderRef.current = null;
    } else {
      setIsAnimating(false);
    }
  }, []);

  const handleResizeStart = (e: React.PointerEvent) => {
    setIsResizing(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!isResizing) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 200 && newWidth <= 600) setLayersPanelWidth(newWidth);
  };

  const handleResizeEnd = (e: React.PointerEvent) => {
    setIsResizing(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex h-screen w-full bg-[#000000] overflow-hidden font-body select-none text-white" onClick={unlockAudio}>
      <aside className={cn("flex-col flex-shrink-0 bg-[#0a0a0a] border-r border-white/5 transition-all duration-300 ease-in-out lg:flex", showProperties ? "w-[280px]" : "w-0 overflow-hidden border-none")}>
        <div className="w-[280px]">
          <PropertiesPanel settings={settings} updateSettings={updateSettings} onClose={() => setShowProperties(false)} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-black transition-all duration-300">
        <header className="h-12 flex items-center justify-between px-4 border-b border-white/5 bg-[#0a0a0a] z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setShowProperties(!showProperties)} className="hidden lg:flex text-white hover:bg-white/5"><Menu className="w-5 h-5" /></Button>
            <Sheet open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden text-white h-9 w-9"><Settings2 className="w-5 h-5" /></Button></SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] bg-[#0a0a0a] border-r border-white/5 [&>button]:hidden">
                <PropertiesPanel settings={settings} updateSettings={updateSettings} onClose={() => setIsConfigOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="text-[10px] font-bold uppercase tracking-[2px] text-emerald-500 flex items-center gap-2">
              <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
              <span className="hidden xs:inline">PricePattern</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sheet open={isLayersOpen} onOpenChange={setIsLayersOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden text-white h-9 w-9"><Layers className="w-5 h-5" /></Button></SheetTrigger>
              <SheetContent side="right" className="p-0 w-[280px] bg-[#0a0a0a] border-l border-white/5 [&>button]:hidden">
                <LayersPanel candles={candles} onAddCandle={handleAddCandle} onUpdateCandle={handleUpdateCandle} onRemoveCandle={handleRemoveCandle} onClearAll={handleClearAll} onTemplateLoad={handleTemplateLoad} onClose={() => setIsLayersOpen(false)} />
              </SheetContent>
            </Sheet>
            <a href="https://www.instagram.com/masffadil/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 group transition-all"><Instagram className="w-3.5 h-3.5 text-pink-500 group-hover:scale-110 transition-transform" /><span className="text-[10px] font-bold tracking-wider text-white/80 group-hover:text-white hidden sm:inline">masffadil</span></a>
          </div>
        </header>

        {/* --- Top Page Navigator --- */}
        <div className="h-[105px] bg-[#0a0a0a]/50 backdrop-blur-md border-b border-white/5 flex flex-col z-20 shrink-0">
          <ScrollArea className="flex-1 w-full px-4">
            <div className="flex items-center gap-4 py-3">
              {pages.map((page, idx) => (
                <div 
                  key={page.id} 
                  className={cn(
                    "group relative flex flex-col items-center gap-1.5 cursor-pointer transition-all shrink-0",
                    activePageIndex === idx ? "opacity-100 scale-100" : "opacity-40 hover:opacity-100 scale-95 hover:scale-100"
                  )}
                  onClick={() => setActivePageIndex(idx)}
                >
                  <div className={cn(
                    "w-22 h-16 rounded-lg border-2 flex flex-col items-center justify-center bg-black overflow-hidden transition-all shadow-2xl relative",
                    activePageIndex === idx ? "border-emerald-500 ring-4 ring-emerald-500/20" : "border-white/10 hover:border-white/30"
                  )}>
                    <PagePreview candles={page.candles} settings={settings} />
                    
                    {/* Page Index Label - Bottom Left */}
                    <div className="absolute bottom-1 left-2 z-10 pointer-events-none">
                      <span className="text-[11px] font-black text-white/90 uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Corner Menu Pill - Top Right */}
                    <div className="absolute top-1 right-1 z-20">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-8 rounded-full bg-transparent hover:bg-emerald-500 data-[state=open]:bg-emerald-500 text-white flex items-center justify-center transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/10 text-white min-w-[120px]">
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleDuplicatePage(idx); }}
                            className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 focus:bg-white/5 focus:text-emerald-500 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> DUPLICATE
                          </DropdownMenuItem>
                          {pages.length > 1 && (
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleDeletePage(idx); }}
                              className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 text-red-500 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> DELETE
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-22 h-16 border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-emerald-500/50 flex flex-col gap-1 shrink-0 rounded-lg transition-all group"
                onClick={handleAddPage}
              >
                <Plus className="w-4 h-4 text-white/20 group-hover:text-emerald-500 group-hover:scale-110 transition-all" />
                <span className="text-[7px] font-black text-white/20 uppercase tracking-widest group-hover:text-emerald-500">New Page</span>
              </Button>
            </div>
            <ScrollBar orientation="horizontal" className="bg-white/5" />
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative bg-black overflow-hidden">
          {notification && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                <span className="text-lg">🥳</span>
                <span className="text-xs font-bold tracking-wider text-white uppercase">{notification.title}</span>
              </div>
            </div>
          )}
          
          <div className="flex-1 w-full h-full flex items-center justify-center p-4">
            <div className="w-full h-full max-w-full max-h-full flex items-center justify-center overflow-hidden">
               <ChartRenderer 
                ref={chartRef}
                candles={candles} 
                settings={settings} 
                isAnimating={isAnimating}
                onAnimationComplete={handleAnimationComplete}
                onSettingsChange={updateSettings}
              />
            </div>
          </div>

          {/* --- Unified Bottom Action Bar --- */}
          <div className="w-full bg-[#0a0a0a] border-t border-white/5 px-6 py-4 flex items-center justify-center gap-4 shrink-0 z-30">
            {/* Status BARS - Left Side of Preview */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/5 mr-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase">
                BARS: {candles.length}
              </span>
            </div>

            {isAnimating ? (
              <Button className="min-w-[100px] h-10 font-bold text-[11px] gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-all" onClick={() => setIsAnimating(false)}>
                <X className="w-4 h-4" /> <span>STOP</span>
              </Button>
            ) : (
              <Button className="min-w-[100px] h-10 font-bold text-[11px] gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-all" onClick={handleReplay} disabled={candles.length === 0}>
                <RefreshCw className="w-4 h-4" /> <span>PREVIEW</span>
              </Button>
            )}
            <Separator orientation="vertical" className="h-6 bg-white/10" />
            <Button variant="outline" className="h-10 px-6 text-[11px] font-bold border-white/10 bg-transparent hover:bg-white/5 gap-2" onClick={handleExportSVG} disabled={candles.length === 0}>
              <FileCode className="w-4 h-4" /> <span>SVG</span>
            </Button>
            <Button className="min-w-[120px] h-10 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 border-none gap-2" onClick={handleRecordVideo} disabled={candles.length === 0}>
              <Video className="w-4 h-4" /> <span>VIDEO</span>
            </Button>
          </div>
        </div>

        {/* --- Status Bar --- */}
        <div className="h-6 flex items-center justify-between px-4 text-[8px] font-bold text-muted-foreground uppercase tracking-[1px] bg-[#050505] border-t border-white/5 shrink-0">
          <div className="flex gap-4">
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500" /> PAGE: {activePageIndex + 1} / {pages.length}</span>
            <span className="flex items-center gap-2 hidden xs:flex"><div className="w-1 h-1 rounded-full bg-emerald-500" /> ACTIVE_ENGINE: PRO_V2</span>
          </div>
          <div className="flex items-center gap-3"><Monitor className="w-3 h-3" /><span className="hidden sm:inline text-emerald-500/50">Core 4K Precision Active</span></div>
        </div>
      </main>

      <aside className="hidden lg:flex flex-row flex-shrink-0 bg-[#0a0a0a] border-l border-white/5" style={{ width: `${layersPanelWidth}px` }}>
        <div className="w-1.5 h-full cursor-col-resize hover:bg-emerald-500/30 transition-colors z-50 bg-white/5" onPointerDown={handleResizeStart} onPointerMove={handleResizeMove} onPointerUp={handleResizeEnd} />
        <div className="flex-1 h-full overflow-hidden">
          <LayersPanel candles={candles} onAddCandle={handleAddCandle} onUpdateCandle={handleUpdateCandle} onRemoveCandle={handleRemoveCandle} onClearAll={handleClearAll} onTemplateLoad={handleTemplateLoad} onClose={() => setIsLayersOpen(false)} />
        </div>
      </aside>
    </div>
  );
}
