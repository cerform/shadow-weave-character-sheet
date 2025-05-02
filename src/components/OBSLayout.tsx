
import React, { PropsWithChildren } from "react";

interface OBSLayoutProps {
  children: React.ReactNode;
  leftPanelContent?: React.ReactNode;
  rightPanelContent?: React.ReactNode;
  topPanelContent?: React.ReactNode;
  bottomPanelContent?: React.ReactNode;
  className?: string;
}

export default function OBSLayout({ 
  children, 
  leftPanelContent,
  rightPanelContent,
  topPanelContent,
  bottomPanelContent,
  className = ""
}: OBSLayoutProps) {
  return (
    <div className={`grid h-full w-full ${className}`} style={{
      gridTemplateRows: topPanelContent || bottomPanelContent ? "auto 1fr auto" : "1fr",
      gridTemplateColumns: "auto 1fr auto"
    }}>
      {topPanelContent && (
        <div className="col-span-3 border-b bg-muted/10">
          {topPanelContent}
        </div>
      )}
      
      {leftPanelContent && (
        <div className="row-span-1 border-r bg-muted/10 h-full overflow-y-auto">
          {leftPanelContent}
        </div>
      )}
      
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>
      
      {rightPanelContent && (
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
