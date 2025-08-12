import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ASSETS_INDEX_URL, assetUrl } from '@/config/assets';
import { supabase } from '@/integrations/supabase/client';
import { useAssetsStore } from '@/stores/assetsStore';
import { useMapEntitiesStore } from '@/stores/mapEntitiesStore';

interface AssetEntry { name: string; path: string }
interface AssetIndex {
  creatures?: AssetEntry[];
  props?: AssetEntry[];
  heroes?: AssetEntry[];
  tiles?: AssetEntry[];
  items?: AssetEntry[];
  [key: string]: AssetEntry[] | undefined;
}

function groupToCategoryKey(group: string): string {
  switch (group) {
    case 'creatures': return 'creature';
    case 'heroes': return 'character';
    case 'tiles': return 'terrain';
    case 'props': return 'prop';
    case 'items': return 'prop';
    default: return 'prop';
  }
}

function groupToEntityType(group: string): 'character' | 'monster' | 'prop' | 'terrain' | 'fx' {
  switch (group) {
    case 'creatures': return 'monster';
    case 'heroes': return 'character';
    case 'tiles': return 'terrain';
    default: return 'prop';
  }
}

export const GithubAssetsLibrary: React.FC<{ mapId?: string }>= ({ mapId }) => {
  const { categories, reloadAssets } = useAssetsStore();
  const { addEntity } = useMapEntitiesStore();
  const [index, setIndex] = useState<AssetIndex | null>(null);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(ASSETS_INDEX_URL);
        const data = (await res.json()) as AssetIndex;
        if (isMounted) setIndex(data);
      } catch (e) {
        console.warn('Не удалось загрузить index.json из GitHub:', e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const flatList = useMemo(() => {
    if (!index) return [] as Array<{ group: string; item: AssetEntry }>;
    const out: Array<{ group: string; item: AssetEntry }> = [];
    for (const [group, items] of Object.entries(index)) {
      if (!items) continue;
      for (const item of items) out.push({ group, item });
    }
    return out
      .filter(({ item }) => !q || item.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 200);
  }, [index, q]);

  const catKeyToId = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.key, c.id);
    return map;
  }, [categories]);

  async function ensureAssetId(url: string, name: string, group: string): Promise<string | null> {
    // 1) try find existing by storage_path
    const { data: existing, error: findErr } = await supabase
      .from('assets')
      .select('id')
      .eq('storage_path', url)
      .maybeSingle();
    if (existing?.id) return existing.id as string;
    if (findErr && findErr.code !== 'PGRST116') {
      console.warn('Поиск ассета ошибка:', findErr.message);
    }

    // 2) create new
    const catKey = groupToCategoryKey(group);
    const category_id = catKeyToId.get(catKey) || Array.from(catKeyToId.values())[0];
    if (!category_id) {
      console.warn('Нет ни одной категории для создания ассета');
      return null;
    }
    const payload = { category_id, name, storage_path: url, approved: true };
    const { data: inserted, error } = await supabase
      .from('assets')
      .insert([payload])
      .select('id')
      .single();
    if (error) {
      console.warn('Ошибка создания ассета:', error.message);
      return null;
    }
    await reloadAssets();
    return inserted!.id as string;
  }

  async function onAdd(group: string, item: AssetEntry) {
    if (!mapId) return;
    const url = assetUrl(item.path);
    const assetId = await ensureAssetId(url, item.name, group);
    if (!assetId) return;

    await addEntity({
      map_id: mapId,
      asset_id: assetId,
      type: groupToEntityType(group),
      owner_id: null,
      x: 0, y: 0, z: 0,
      rot_x: 0, rot_y: 0, rot_z: 0,
      scale_x: 1, scale_y: 1, scale_z: 1,
      data: { source: 'github', relPath: item.path, url },
      is_locked: false,
    } as any);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub библиотека</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Поиск ассетов..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <ScrollArea className="h-64 pr-2">
          <div className="space-y-2">
            {loading && <div className="text-sm text-muted-foreground">Загрузка...</div>}
            {!loading && flatList.map(({ group, item }) => (
              <div key={`${group}:${item.path}`} className="flex items-center justify-between gap-2 border rounded px-2 py-1">
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{group}</div>
                </div>
                <Button size="sm" onClick={() => onAdd(group, item)} disabled={!mapId}>
                  Добавить
                </Button>
              </div>
            ))}
            {!loading && flatList.length === 0 && (
              <div className="text-sm text-muted-foreground">Ничего не найдено</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
