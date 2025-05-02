
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
  
  // Определяем grid-template-rows и grid-template-columns динамически
  const gridTemplateRows = hasTopPanel || hasBottomPanel 
    ? "auto 1fr auto" 
    : "1fr";
    
  const gridTemplateColumns = `${hasLeftPanel ? leftPanelWidth : '0'} 1fr ${hasRightPanel ? rightPanelWidth : '0'}`;
  
  return (
    <div 
      className={cn("grid h-full w-full overflow-hidden", className)} 
      style={{
        gridTemplateRows,
        gridTemplateColumns
      }}
    >
      {topPanelContent && (
        <div className="col-span-3 border-b bg-muted/10 z-10">
          {topPanelContent}
        </div>
      )}
      
      {hasLeftPanel && (
        <div className="row-span-1 border-r bg-muted/10 h-full overflow-y-auto">
          {leftPanelContent}
        </div>
      )}
      
      <div className="w-full h-full relative overflow-hidden">
        {children}
      </div>
      
      {hasRightPanel && (
        <div className="border-l bg-muted/10 h-full overflow-y-auto">
          {rightPanelContent}
        </div>
      )}
      
      {bottomPanelContent && (
        <div className="col-span-3 border-t bg-muted/10">
          {bottomPanelContent}
        </div>
      )}
    </div>
  );
}
