import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StorageModelsGallery from '@/components/admin/StorageModelsGallery';
import AssetsCategorizer from '@/components/admin/AssetsCategorizer';
import InteractiveZipImporter from '@/components/admin/InteractiveZipImporter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProtectedRoute } from '@/hooks/use-auth';

const AdminAssetsPage: React.FC = () => {
  const { toast } = useToast();
  const { isAdmin } = useProtectedRoute();

const callRpc = async (fn: 'clear_assets' | 'import_models_bucket_assets') => {
  try {
    const { data, error } = await (supabase as any).rpc(fn);
    if (error) throw error;
    toast({ title: 'Готово', description: `${fn} выполнена (${data ?? 0})` });
  } catch (e: any) {
    toast({ title: 'Ошибка', description: e?.message || String(e), variant: 'destructive' });
  }
};

  return (
    <main className="container mx-auto p-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Галерея ассетов (Storage models)</h1>
        <p className="text-muted-foreground">Просмотр загруженных в bucket "models" файлов, превью в 3D, копирование ссылок и удаление.</p>
      </header>

      {/* Админ‑действия: очистка/импорт ассетов из bucket */}
      <Card>
        <CardHeader>
          <CardTitle>Администрирование ассетов</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!isAdmin}
            onClick={() => callRpc('clear_assets')}
            title={isAdmin ? 'Очистить таблицу assets' : 'Доступно только админам'}
          >
            Очистить БД ассетов
          </Button>
          <Button
            disabled={!isAdmin}
            onClick={async () => {
              if (!isAdmin) return;
              try {
                // Полная очистка bucket models
                const listAll = async (prefix = ''): Promise<string[]> => {
                  const { data, error } = await supabase.storage.from('models').list(prefix, { limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } });
                  if (error) throw error;
                  const files: string[] = [];
                  for (const it of (data as any) || []) {
                    if (it.id) files.push(prefix ? `${prefix}/${it.name}` : it.name);
                    else {
                      const nested = await listAll(prefix ? `${prefix}/${it.name}` : it.name);
                      files.push(...nested);
                    }
                  }
                  return files;
                };
                const all = await listAll('');
                if (all.length) {
                  const { error } = await supabase.storage.from('models').remove(all);
                  if (error) throw error;
                }
                toast({ title: 'Готово', description: `Очистили bucket models (${all.length})` });
              } catch (e: any) {
                toast({ title: 'Ошибка очистки bucket', description: e?.message || String(e), variant: 'destructive' });
              }
            }}
            title={isAdmin ? 'Удалить все файлы из bucket models' : 'Доступно только админам'}
          >
            Очистить bucket models
          </Button>
          <Button
            disabled={!isAdmin}
            onClick={() => callRpc('import_models_bucket_assets')}
            title={isAdmin ? 'Импортировать все .glb/.gltf из bucket models (по папкам → категории)' : 'Доступно только админам'}
          >
            Импортировать из bucket models
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Интерактивный ZIP‑импорт</CardTitle>
        </CardHeader>
        <CardContent>
          <InteractiveZipImporter />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Файлы в bucket models</CardTitle>
        </CardHeader>
        <CardContent>
          <StorageModelsGallery />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Категоризация ассетов (БД)</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetsCategorizer />
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminAssetsPage;
