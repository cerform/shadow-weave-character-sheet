// Путь: shadow/src/components/OBSLayout.tsx

import React, { PropsWithChildren } from "react";

export default function OBSLayout({ children }: PropsWithChildren) {
  return <div className="obs-grid">{children}</div>;
}
