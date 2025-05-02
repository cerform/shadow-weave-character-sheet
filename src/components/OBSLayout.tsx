
import React, { PropsWithChildren } from "react";

interface OBSLayoutProps {
  children: React.ReactNode;
  leftPanelContent?: React.ReactNode;
}

export default function OBSLayout({ children, leftPanelContent }: OBSLayoutProps) {
  return (
    <div className="flex h-full w-full">
      {leftPanelContent && (
        <div className="w-72 border-r bg-muted/10 h-full">
          {leftPanelContent}
        </div>
      )}
      <div className="flex-1 relative">
        {children}
      </div>
    </div>
  );
}
