import { useState, useCallback, useMemo } from 'react';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import type { EnhancedToken } from '@/stores/enhancedBattleStore';
import { useBattleTokensSync } from '@/hooks/useBattleTokensSync';
import { useBattleTokensToSupabase } from '@/hooks/useBattleTokensToSupabase';
import { useToast } from '@/hooks/use-toast';
import { snap, GRID } from '../utils';
import { uid } from '../utils/constants';
import { stableSort } from '../utils/stableSort';

export function useBattleTokens(sessionId: string, isDM: boolean) {
  const { toast } = useToast();
  const { tokens, addToken, updateToken, removeToken } = useEnhancedBattleStore();
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Sync tokens with Supabase
  useBattleTokensSync(sessionId);
  useBattleTokensToSupabase(sessionId, isDM);

  // Stable sorted tokens to prevent Error #185
  const sortedTokens = useMemo(
    () => stableSort(tokens, (a, b) => a.id.localeCompare(b.id)),
    [tokens]
  );

  // Valid tokens with proper positions
  const validTokens = useMemo(
    () =>
      sortedTokens.filter(
        (t) =>
          t.position &&
          typeof t.position[0] === "number" &&
          typeof t.position[1] === "number" &&
          !isNaN(t.position[0]) &&
          !isNaN(t.position[1])
      ),
    [sortedTokens]
  );

  const selectedToken = useMemo(
    () => validTokens.find((t) => t.id === selectedId),
    [validTokens, selectedId]
  );

  const handleAddToken = useCallback(
    (token: Partial<EnhancedToken>) => {
      const newToken: EnhancedToken = {
        id: uid('token'),
        name: token.name || 'New Token',
        hp: token.hp || 10,
        maxHp: token.maxHp || 10,
        ac: token.ac || 10,
        speed: token.speed || 30,
        color: token.color || '#3b82f6',
        position: token.position || [320, 320, 0],
        initiative: token.initiative || 0,
        conditions: token.conditions || [],
        modelUrl: token.modelUrl,
        size: token.size || 1,
        isEnemy: token.isEnemy || false,
        isVisible: token.isVisible !== false,
        avatarUrl: token.avatarUrl,
        image_url: token.image_url,
      };
      
      addToken(newToken);
      toast({
        title: "Токен добавлен",
        description: `${newToken.name} добавлен на карту`,
      });
    },
    [addToken, toast]
  );

  const handleMoveToken = useCallback(
    (tokenId: string, newPosition: [number, number, number]) => {
      const snappedPosition: [number, number, number] = [
        snap(newPosition[0]),
        snap(newPosition[1]),
        newPosition[2],
      ];
      updateToken(tokenId, { position: snappedPosition });
    },
    [updateToken]
  );

  const handleUpdateToken = useCallback(
    (tokenId: string, updates: Partial<EnhancedToken>) => {
      updateToken(tokenId, updates);
    },
    [updateToken]
  );

  const handleRemoveToken = useCallback(
    (tokenId: string) => {
      removeToken(tokenId);
      if (selectedId === tokenId) {
        setSelectedId(null);
      }
      toast({
        title: "Токен удален",
        description: "Токен удален с карты",
      });
    },
    [removeToken, selectedId, toast]
  );

  const handleSelectToken = useCallback((tokenId: string | null) => {
    setSelectedId(tokenId);
  }, []);

  return {
    tokens,
    sortedTokens,
    validTokens,
    selectedId,
    selectedToken,
    draggedId,
    setDraggedId,
    handleAddToken,
    handleMoveToken,
    handleUpdateToken,
    handleRemoveToken,
    handleSelectToken,
  };
}
