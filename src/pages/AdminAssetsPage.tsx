import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssetsStore } from '@/stores/assetsStore';
import { useProtectedRoute } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

const AdminAssetsPage: React.FC = () => {
  const { isAdmin } = useProtectedRoute();
  const { categories, assets, loadAll, addCategory, removeCategory, createAsset, setApproved } = useAssetsStore();

  const [newCatKey, setNewCatKey] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const [assetName, setAssetName] = useState('');
  const [assetCategoryId, setAssetCategoryId] = useState<string>('');
  const [assetPath, setAssetPath] = useState('');

  useEffect(() => {
    document.title = 'Ассеты 3D — Админ';
    loadAll();
  }, [loadAll]);

  const categoryById = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  const getModelUrl = (path: string) => supabase.storage.from('models').getPublicUrl(path).data.publicUrl;

  return (
    <main className="container mx-auto p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Управление ассетами 3D</h1>
        <p className="text-muted-foreground">Категории, ассеты, одобрение. Доступ только администратору.</p>
      </header>

      {/* Категории */}
      <Card>
        <CardHeader>
          <CardTitle>Категории</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isAdmin && (
            <div className="flex gap-2 items-center">
              <Input placeholder="key (characters, monsters, props...)" value={newCatKey} onChange={e => setNewCatKey(e.target.value)} />
              <Input placeholder="Название" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
              <Button onClick={() => { if (newCatKey && newCatName) { addCategory({ key: newCatKey, name: newCatName }); setNewCatKey(''); setNewCatName(''); }}}>Добавить</Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <div key={c.id} className="flex items-center gap-2 border rounded px-2 py-1">
                <Badge variant="secondary">{c.key}</Badge>
                <span>{c.name}</span>
                {isAdmin && (
                  <Button size="sm" variant="ghost" onClick={() => removeCategory(c.id)}>Удалить</Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Создание записи ассета */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Добавить ассет (метаданные)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <Input placeholder="Название" value={assetName} onChange={e => setAssetName(e.target.value)} />
            <Select value={assetCategoryId} onValueChange={setAssetCategoryId}>
              <SelectTrigger><SelectValue placeholder="Категория" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="storage path в models (например: orc.glb)" value={assetPath} onChange={e => setAssetPath(e.target.value)} />
            <Button onClick={() => {
              if (!assetName || !assetCategoryId || !assetPath) return;
              createAsset({ name: assetName, category_id: assetCategoryId, storage_path: assetPath, description: null, preview_url: null, tags: [], scale_x: 1, scale_y: 1, scale_z: 1, pivot: { x:0, y:0, z:0 }, approved: false } as any);
              setAssetName(''); setAssetCategoryId(''); setAssetPath('');
            }}>Создать</Button>
          </CardContent>
        </Card>
      )}

      {/* Список ассетов */}
      <Card>
        <CardHeader>
          <CardTitle>Ассеты</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Путь</TableHead>
                <TableHead>Ссылка</TableHead>
                <TableHead>Одобрено</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{categoryById.get(a.category_id)?.name || '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{a.storage_path}</TableCell>
                  <TableCell>
                    <a className="text-primary underline" href={getModelUrl(a.storage_path)} target="_blank" rel="noreferrer">Открыть</a>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={a.approved} onCheckedChange={(v) => setApproved(a.id, v)} />
                      <span className="text-sm text-muted-foreground">{a.approved ? 'Да' : 'Нет'}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Подсказка про загрузчик */}
      <Card>
        <CardHeader>
          <CardTitle>Загрузка моделей</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">Используйте загрузчик моделей на главной админ-странице для загрузки .glb/.gltf в bucket "models". Затем укажите путь файла в поле выше.</p>
          <p className="text-sm text-muted-foreground">Поддерживается публичное чтение из buckets: models, previews, map-images.</p>
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminAssetsPage;
