"use client";

import React from "react";
import { 
  Crosshair, 
  Slash, 
  Minus, 
  Pencil, 
  Divide, 
  Share2, 
  Triangle, 
  Square, 
  ArrowUp, 
  MoreVertical,
  GripVertical
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ToolButton = ({ 
  icon: Icon, 
  label, 
  active = false, 
  custom = false 
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  custom?: boolean 
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button 
        className={`w-9 h-9 flex items-center justify-center rounded-md transition-all hover:bg-slate-100 ${active ? 'text-blue-600' : 'text-slate-800'}`}
      >
        {custom ? (
          <div className="w-5 h-5 flex items-center justify-center font-bold text-[10px]">{Icon}</div>
        ) : (
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
        )}
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="bg-slate-900 text-white text-[10px] border-none">
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);

const DrawingToolbar = () => {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-2xl border border-white/20 gap-0.5 pointer-events-auto">
        {/* Grip Handle */}
        <div className="px-1 text-slate-300">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Main Tools */}
        <ToolButton icon={Crosshair} label="Crosshair" active />
        <ToolButton icon={Slash} label="Trend Line" />
        
        {/* Custom SVG for Horizontal Ray */}
        <ToolButton 
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <line x1="4" y1="12" x2="20" y2="12" />
            </svg>
          } 
          label="Horizontal Line" 
          custom 
        />

        <ToolButton icon={Pencil} label="Brush" />
        
        {/* Parallel Channel Custom */}
        <ToolButton 
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <circle cx="6" cy="18" r="1.5" fill="currentColor" />
              <circle cx="18" cy="6" r="1.5" fill="currentColor" />
              <line x1="6" y1="18" x2="18" y2="6" />
              <line x1="10" y1="18" x2="22" y2="6" strokeDasharray="2 2" />
            </svg>
          } 
          label="Parallel Channel" 
          custom 
        />

        <ToolButton 
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="6" cy="12" r="1.5" fill="currentColor" />
              <line x1="6" y1="12" x2="20" y2="12" />
            </svg>
          } 
          label="Ray" 
          custom 
        />

        <ToolButton icon={Share2} label="Path" />

        {/* Elliott Wave Custom */}
        <ToolButton 
          icon={
            <div className="flex flex-col items-center leading-none">
              <span className="text-[7px] font-black">1 5</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M4 18l4-8 4 6 4-10 4 4" />
                <circle cx="4" cy="18" r="1" fill="currentColor" />
                <circle cx="8" cy="10" r="1" fill="currentColor" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
                <circle cx="16" cy="6" r="1" fill="currentColor" />
                <circle cx="20" cy="10" r="1" fill="currentColor" />
              </svg>
            </div>
          } 
          label="Elliott Impulse Wave (12345)" 
          custom 
        />

        <ToolButton icon={Triangle} label="Triangle" />

        {/* Fibonacci Retracement Custom */}
        <ToolButton 
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="10" x2="20" y2="10" />
              <line x1="4" y1="14" x2="20" y2="14" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="4" cy="18" r="1" fill="currentColor" />
              <circle cx="20" cy="6" r="1" fill="currentColor" />
            </svg>
          } 
          label="Fib Retracement" 
          custom 
        />

        {/* Long Position Custom */}
        <ToolButton 
          icon={
            <div className="relative border border-slate-800 rounded-sm w-5 h-5 flex items-center justify-center font-bold text-[8px]">
              L
              <div className="absolute left-0 bottom-0 w-1 h-2 bg-emerald-500"></div>
            </div>
          } 
          label="Long Position" 
          custom 
        />

        {/* Short Position Custom */}
        <ToolButton 
          icon={
            <div className="relative border border-slate-800 rounded-sm w-5 h-5 flex items-center justify-center font-bold text-[8px]">
              S
              <div className="absolute left-0 top-0 w-1 h-2 bg-red-500"></div>
            </div>
          } 
          label="Short Position" 
          custom 
        />

        <ToolButton icon={Square} label="Rectangle" />
        <ToolButton icon={ArrowUp} label="Measure Tool" />

        {/* Custom H-Line Arrow */}
        <ToolButton 
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="6" y1="12" x2="18" y2="12" />
              <path d="M18 12l-3-3m3 3l-3 3" />
              <circle cx="6" cy="12" r="1.5" fill="currentColor" />
            </svg>
          } 
          label="Arrow" 
          custom 
        />

        <div className="mx-1 w-[1px] h-6 bg-slate-200"></div>
        <ToolButton icon={MoreVertical} label="Settings" />
      </div>
    </TooltipProvider>
  );
};

export default DrawingToolbar;
