
import React from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface RibbonBadgeProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  color?: string;
}

export const RibbonBadge: React.FC<RibbonBadgeProps> = ({
  name,
  description,
  icon,
  unlocked,
  color = "#8B5A2B"
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`relative rounded-full p-4 flex items-center justify-center cursor-help
                       ${unlocked 
                         ? 'bg-gradient-to-br from-black to-gray-900' 
                         : 'bg-gray-900 grayscale opacity-50'}`}
            style={{
              border: `2px solid ${unlocked ? color : 'rgba(75, 75, 75, 0.5)'}`,
              boxShadow: unlocked ? `0 0 10px ${color}80` : 'none'
            }}
          >
            <div className={`${unlocked ? 'text-' + color : 'text-gray-500'}`}>
              {icon}
            </div>
            
            {/* Лента для разблокированных значков */}
            {unlocked && (
              <div
                className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center rounded-full"
                style={{ 
                  backgroundColor: color,
                  boxShadow: `0 0 5px ${color}`
                }}
              >
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className={`border-0 ${unlocked ? '' : 'grayscale'}`}
          style={{ 
            background: 'rgba(0, 0, 0, 0.9)', 
            borderLeft: `3px solid ${unlocked ? color : 'rgba(75, 75, 75, 0.5)'}` 
          }}
        >
          <div className="py-2 px-3">
            <p className="font-bold text-white">{name}</p>
            <p className="text-sm text-gray-300">{description}</p>
            {!unlocked && (
              <p className="text-xs text-gray-400 mt-1">Не разблокировано</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
