import { useState, useCallback, useMemo } from 'react';
import type { ContextMenuState } from '../types';

export function useBattleContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    tokenId: undefined,
  });

  const handleShowContextMenu = useCallback(
    (x: number, y: number, tokenId?: string) => {
      setContextMenu({
        visible: true,
        x,
        y,
        tokenId,
      });
    },
    []
  );

  const handleHideContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  return useMemo(() => ({
    contextMenu,
    handleShowContextMenu,
    handleHideContextMenu,
  }), [contextMenu, handleShowContextMenu, handleHideContextMenu]);
}
