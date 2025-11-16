import React from 'react';
import VTTToolbar from '@/components/battle/vtt/VTTToolbar';
import type { VTTTool } from '../types';

interface ToolbarProps {
  currentTool: VTTTool;
  onToolChange: (tool: VTTTool) => void;
}

export function Toolbar({ currentTool, onToolChange }: ToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10">
      <VTTToolbar activeTool={currentTool} onToolChange={onToolChange} />
    </div>
  );
}
