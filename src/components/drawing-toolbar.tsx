"use client";

import React from "react";
import { 
  Crosshair, 
  Slash, 
  Square, 
  Pencil, 
  MoreVertical,
  GripVertical,
  MousePointer2
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DrawingTool } from "@/lib/chart-types";

interface DrawingToolbarProps {
  activeTool: DrawingTool;
  onToolSelect: (tool: DrawingTool) => void;
}

const ToolButton = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick,
  custom = false 
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  onClick: () => void,
  custom?: boolean 
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button 
        onClick={onClick}
        className={`w-9 h-9 flex items-center justify-center rounded-md transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-800 hover:bg-slate-100'}`}
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

const DrawingToolbar = ({ activeTool, onToolSelect }: DrawingToolbarProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-2xl border border-white/20 gap-0.5 pointer-events-auto">
        <div className="px-1 text-slate-300">
          <GripVertical className="w-4 h-4" />
        </div>

        <ToolButton 
          icon={MousePointer2} 
          label="Cursor" 
          active={activeTool === null} 
          onClick={() => onToolSelect(null)} 
        />
        
        <ToolButton 
          icon={Crosshair} 
          label="Crosshair" 
          active={activeTool === 'crosshair'} 
          onClick={() => onToolSelect('crosshair')} 
        />

        <ToolButton 
          icon={Slash} 
          label="Trend Line" 
          active={activeTool === 'trendline'} 
          onClick={() => onToolSelect('trendline')} 
        />
        
        <ToolButton 
          icon={Square} 
          label="Rectangle" 
          active={activeTool === 'rectangle'} 
          onClick={() => onToolSelect('rectangle')} 
        />

        <ToolButton 
          icon={Pencil} 
          label="Brush" 
          active={activeTool === 'brush'} 
          onClick={() => onToolSelect('brush')} 
        />

        <ToolButton 
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="6" y1="12" x2="18" y2="12" />
              <path d="M18 12l-3-3m3 3l-3 3" />
            </svg>
          } 
          label="Arrow" 
          active={activeTool === 'arrow'}
          onClick={() => onToolSelect('arrow')}
          custom 
        />

        <div className="mx-1 w-[1px] h-6 bg-slate-200"></div>
        <ToolButton icon={MoreVertical} label="Settings" onClick={() => {}} />
      </div>
    </TooltipProvider>
  );
};

export default DrawingToolbar;
