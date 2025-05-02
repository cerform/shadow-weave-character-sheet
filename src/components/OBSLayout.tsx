
import React from "react";
import { cn } from "@/lib/utils";

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
  
  return (
    <div className={cn("grid h-full w-full", className)}>
      {/* Верхняя панель, фиксированная и растянутая на всю ширину */}
      {topPanelContent && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          {topPanelContent}
        </div>
      )}
      
      {/* Основная сетка с учетом отступа под верхнюю панель */}
      <div 
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `${hasLeftPanel ? leftPanelWidth : '0'} 1fr ${hasRightPanel ? rightPanelWidth : '0'}`,
          marginTop: hasTopPanel ? '56px' : '0', // отступ под верхнюю панель
          height: hasTopPanel ? 'calc(100% - 56px)' : '100%'
        }}
      >
        {hasLeftPanel && (
          <div className="h-full overflow-y-auto bg-muted/10 border-r">
            {leftPanelContent}
          </div>
        )}
        
        <div className="w-full h-full relative overflow-hidden">
          {children}
        </div>
        
        {hasRightPanel && (
          <div className="h-full overflow-y-auto bg-muted/10 border-l">
            {rightPanelContent}
          </div>
        )}
      </div>
      
      {bottomPanelContent && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-muted/10">
          {bottomPanelContent}
        </div>
      )}
    </div>
  );
}
