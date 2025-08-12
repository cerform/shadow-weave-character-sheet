import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import SmoothBattleMap, { Token as MapToken } from '@/components/battle/SmoothBattleMap';
import { useAssetsStore } from '@/stores/assetsStore';
import { useMapEntitiesStore } from '@/stores/mapEntitiesStore';

const GRID_SIZE = 50; // px per cell

const Synced2DMapPage: React.FC = () => {
  const { mapId } = useParams();
  const { assets, loadAll } = useAssetsStore();
  const { entities, loadEntities, subscribe, updateEntity } = useMapEntitiesStore();
  const [tokens, setTokens] = useState<MapToken[]>([]);

  useEffect(() => {
    document.title = '2D Карта (синхрониз.)';
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!mapId) return;
    loadEntities(mapId);
    const off = subscribe(mapId);
    return () => off();
  }, [mapId, loadEntities, subscribe]);

  // Map entities -> tokens for SmoothBattleMap
  useEffect(() => {
    const nameByAsset = new Map(assets.map(a => [a.id, a.name]));
    const tks: MapToken[] = entities.map(e => ({
      id: e.id,
      name: nameByAsset.get(e.asset_id) || 'Entity',
      x: (e.x || 0) * GRID_SIZE,
      y: (e.z || 0) * GRID_SIZE,
      color: '#64748b',
      size: 40,
      hp: (e.hp ?? 10),
      maxHp: (e.max_hp ?? 10),
      ac: (e.ac ?? 10),
      speed: 30,
      type: e.type === 'monster' ? 'monster' : e.type === 'character' ? 'player' : 'npc',
      controlledBy: e.owner_id ? 'player1' : 'dm',
    }));
    setTokens(tks);
  }, [entities, assets]);

  const onTokensChange = (next: MapToken[]) => {
    setTokens(next);
    // Detect moved tokens and update map_entities (x,z)
    const byId = new Map(tokens.map(t => [t.id, t]));
    next.forEach(t => {
      const prev = byId.get(t.id);
      if (!prev) return;
      if (prev.x !== t.x || prev.y !== t.y) {
        updateEntity(t.id, { x: t.x / GRID_SIZE, z: t.y / GRID_SIZE });
      }
    });
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-3">2D карта (реалтайм синхронизация)</h1>
      <SmoothBattleMap isDM={true} tokens={tokens} onTokensChange={onTokensChange} />
    </main>
  );
};

export default Synced2DMapPage;
