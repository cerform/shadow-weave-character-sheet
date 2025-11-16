import React from 'react';
import { createPortal } from 'react-dom';
import ContextMenu from '@/components/battle/vtt/ContextMenu';
import type { ContextMenuState } from '../types';

interface ContextMenuPortalProps {
  contextMenu: ContextMenuState;
  onClose: () => void;
  onAction: (action: string, tokenId?: string) => void;
}

export function ContextMenuPortal({ contextMenu, onClose, onAction }: ContextMenuPortalProps) {
  if (!contextMenu.visible) return null;

  return createPortal(
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      onClose={onClose}
      onDelete={() => onAction('delete', contextMenu.tokenId)}
    />,
    document.body
  );
}
