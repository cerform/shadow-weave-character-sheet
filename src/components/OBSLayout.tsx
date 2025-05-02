
// Путь: src/components/OBSLayout.tsx

import React, { PropsWithChildren } from "react";

interface OBSLayoutProps {
  children: React.ReactNode;
  leftPanelContent?: React.ReactNode; // добавляем опциональный контент для левой панели
}

export default function OBSLayout({ children, leftPanelContent }: OBSLayoutProps) {
  return (
    <div className="obs-grid">
      {leftPanelContent && (
        <div className="obs-left h-full">
          {leftPanelContent}
        </div>
      )}
      {children}
    </div>
  );
}
