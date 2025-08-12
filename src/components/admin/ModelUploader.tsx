import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProtectedRoute } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
}

export const ModelUploader: React.FC = () => {
  const { isAdmin } = useProtectedRoute();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const listFiles = async () => {
    const { data, error } = await supabase.storage.from('models').list('', {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) {
      console.error('Ошибка получения списка моделей:', error);
      return;
    }
    setFiles(data as any);
  };

  useEffect(() => {
    listFiles();
  }, []);

  const onUpload = async () => {
    if (!file) {
      toast({ title: 'Файл не выбран', variant: 'destructive' });
      return;
    }
    if (!isAdmin) {
      toast({ title: 'Недостаточно прав', description: 'Загрузка доступна только администратору', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const contentType = ext === 'glb' ? 'model/gltf-binary' : 'model/gltf+json';
      const path = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('models').upload(path, file, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      toast({ title: 'Загружено', description: path });
      setFile(null);
      await listFiles();
    } catch (e: any) {
      toast({ title: 'Ошибка загрузки', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getPublicUrl = (name: string) => {
    const { data } = supabase.storage.from('models').getPublicUrl(name);
    return data.publicUrl;
  };

  const onCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Ссылка скопирована' });
    } catch {}
  };

  const onDelete = async (name: string) => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const { error } = await supabase.storage.from('models').remove([name]);
      if (error) throw error;
      toast({ title: 'Удалено', description: name });
      await listFiles();
    } catch (e: any) {
      toast({ title: 'Ошибка удаления', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление 3D ассетами (GLB/GLTF)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <Input type="file" accept=".glb,.gltf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button onClick={onUpload} disabled={!file || !isAdmin || loading}>
            <Upload className="h-4 w-4 mr-2" /> Загрузить
          </Button>
          {!isAdmin && (
            <Badge variant="destructive">Только админ</Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Загруженные файлы</div>
          {files.length === 0 ? (
            <div className="text-sm text-muted-foreground">Пока пусто</div>
          ) : (
            <ul className="space-y-2">
              {files.map((f) => {
                const url = getPublicUrl(f.name);
                return (
                  <li key={f.name} className="flex items-center justify-between border rounded p-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm truncate">{f.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{url}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="secondary" onClick={() => onCopy(url)}>
                        <Copy className="h-3 w-3 mr-1" />Копировать URL
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(f.name)} disabled={!isAdmin || loading}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
