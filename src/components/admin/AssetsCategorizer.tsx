import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAssetsStore } from '@/stores/assetsStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const defaultCategories = [
  { key: 'character', name: 'Персонаж' },
  { key: 'monster', name: 'Монстры' },
  { key: 'structure', name: 'Строения' },
] as const;

const AssetsCategorizer: React.FC = () => {
  const { categories, assets, loadAll, addCategory, reloadAssets, reloadCategories } = useAssetsStore();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    const init = async () => {
      setInitializing(true);
      await loadAll();

      // Ensure default categories exist (admin only; RLS will enforce)
      const cats = useAssetsStore.getState().categories;
      const existingKeys = new Set(cats.map((c) => c.key));
      const missing = defaultCategories.filter((c) => !existingKeys.has(c.key));
      if (missing.length) {
        try {
          await Promise.all(missing.map((m) => addCategory({ key: m.key, name: m.name })));
          await reloadCategories();
          toast({ title: 'Категории добавлены', description: 'Созданы стандартные категории.' });
        } catch {
          // ignore, RLS may block if not admin
        }
      }
      setInitializing(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoriesById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) =>
      [a.name, a.description ?? '', a.storage_path]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [assets, query]);

  const handleAssign = async (assetId: string, categoryId: string) => {
    setSavingId(assetId);
    const { error } = await supabase.from('assets').update({ category_id: categoryId }).eq('id', assetId);
    if (error) {
      toast({ title: 'Ошибка', description: error.message });
    } else {
      toast({ title: 'Сохранено', description: 'Категория присвоена.' });
      await reloadAssets();
    }
    setSavingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <Label htmlFor="search">Поиск</Label>
          <Input
            id="search"
            placeholder="Название, описание или путь"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => loadAll()} disabled={initializing}>
            Обновить
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((asset) => (
          <Card key={asset.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                <div className="font-medium leading-tight">{asset.name}</div>
                <div className="text-sm text-muted-foreground break-all">{asset.storage_path}</div>
              </div>

              <div className="flex items-center gap-3">
                <Label className="min-w-24">Категория</Label>
                <Select
                  value={asset.category_id ?? ''}
                  onValueChange={(val) => handleAssign(asset.id, val)}
                  disabled={savingId === asset.id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выбрать категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-muted-foreground">
                Текущая: {asset.category_id ? categoriesById.get(asset.category_id) ?? '—' : '—'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssetsCategorizer;
