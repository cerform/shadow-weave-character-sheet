
import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface OBSLayoutProps {
  children: React.ReactNode;
  leftPanelContent?: React.ReactNode;
  rightPanelContent?: React.ReactNode;
  topPanelContent?: React.ReactNode;
  bottomPanelContent?: React.ReactNode;
  className?: string;
  leftPanelWidth?: string;
  rightPanelWidth?: string;
}

export default function OBSLayout({ 
  children, 
  leftPanelContent,
  rightPanelContent,
  topPanelContent,
  bottomPanelContent,
  className = "",
  leftPanelWidth = "250px",
  rightPanelWidth = "300px"
}: OBSLayoutProps) {
  const hasTopPanel = !!topPanelContent;
  const hasBottomPanel = !!bottomPanelContent;
  const hasLeftPanel = !!leftPanelContent;
  const hasRightPanel = !!rightPanelContent;
  
  const { theme } = useTheme();
  const currentThemeId = theme || 'default';
  const currentTheme = themes[currentThemeId as keyof typeof themes] || themes.default;
  
  return (
    <div className={cn("grid h-full w-full", className)}>
      {/* Верхняя панель, фиксированная и растянутая на всю ширину */}
      {topPanelContent && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b"
          style={{ 
            borderColor: `${currentTheme.accent}30`,
            boxShadow: `0 0 10px ${currentTheme.accent}20`
          }}
        >
          {topPanelContent}
        </div>
      )}
      
      {/* Основная сетка с учетом отступа под верхнюю панель */}
      <div 
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `${hasLeftPanel ? leftPanelWidth : '0'} 1fr ${hasRightPanel ? rightPanelWidth : '0'}`,
          marginTop: hasTopPanel ? '56px' : '0', 
          height: hasTopPanel ? 'calc(100% - 56px)' : '100%'
        }}
      >
        {hasLeftPanel && (
          <div 
            className="h-full overflow-y-auto bg-muted/10 border-r"
            style={{ 
              borderColor: `${currentTheme.accent}20`,
              boxShadow: `inset -4px 0 10px ${currentTheme.accent}05`
            }}
          >
            {leftPanelContent}
          </div>
        )}
        
        <div className="w-full h-full relative overflow-y-auto">
          {children}
        </div>
        
        {hasRightPanel && (
          <div 
            className="h-full overflow-y-auto bg-muted/10 border-l"
            style={{ 
              borderColor: `${currentTheme.accent}20`,
              boxShadow: `inset 4px 0 10px ${currentTheme.accent}05`
            }}
          >
            {rightPanelContent}
          </div>
        )}
      </div>
      
      {bottomPanelContent && (
        <div 
          className="fixed bottom-0 left-0 right-0 border-t bg-muted/10"
          style={{ 
            borderColor: `${currentTheme.accent}20`,
            boxShadow: `0 -4px 10px ${currentTheme.accent}10`
          }}
        >
          {bottomPanelContent}
        </div>
      )}
    </div>
  );
}
