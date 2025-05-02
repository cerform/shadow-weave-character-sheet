
// Путь: src/components/OBSLayout.tsx

import React, { PropsWithChildren } from "react";

interface OBSLayoutProps {
  children: React.ReactNode;
}

export default function OBSLayout({ children }: OBSLayoutProps) {
  return <div className="obs-grid">{children}</div>;
}
