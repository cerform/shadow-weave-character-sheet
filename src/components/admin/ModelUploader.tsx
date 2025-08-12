import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Copy } from 'lucide-react';
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { useProtectedRoute } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { convertGltfZipToGlb } from '@/utils/convertGltfZipToGlb';

interface FileItem {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
}

export const ModelUploader: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useProtectedRoute();
  const { toast } = useToast();
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoConvert, setAutoConvert] = useState(true);

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
    if (!isAdmin) {
      toast({ title: 'Недостаточно прав', description: 'Загрузка доступна только администратору', variant: 'destructive' });
      return;
    }
    if (!filesToUpload || filesToUpload.length === 0) {
      toast({ title: 'Файлы не выбраны', variant: 'destructive' });
      return;
    }

    const MAX_SIZE = 100 * 1024 * 1024; // 100MB

    const isAllowedZipAsset = (name: string) => /\.(glb|gltf|bin|png|jpg|jpeg|webp|ktx2|gif|bmp|tga|svg)$/i.test(name);

    const getContentType = (ext?: string) => {
      switch ((ext || '').toLowerCase()) {
        case 'glb':
          return 'model/gltf-binary';
        case 'gltf':
          return 'model/gltf+json';
        case 'bin':
          return 'application/octet-stream';
        case 'png':
          return 'image/png';
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'webp':
          return 'image/webp';
        case 'gif':
          return 'image/gif';
        case 'bmp':
          return 'image/bmp';
        case 'svg':
          return 'image/svg+xml';
        case 'ktx2':
          return 'application/octet-stream';
        case 'tga':
          return 'application/octet-stream';
        default:
          return 'application/octet-stream';
      }
    };

    const uploadExact = async (targetPath: string, data: Blob) => {
      const ext = targetPath.split('.').pop();
      const contentType = getContentType(ext);
      const { error } = await supabase.storage.from('models').upload(targetPath, data, {
        contentType,
        cacheControl: '3600',
        upsert: true, // перезаписываем, чтобы не появлялись суффиксы (1)
      });
      if (error) throw error;
      return targetPath;
    };

  const processZipFile = async (zipFile: File) => {
    const zip = await JSZip.loadAsync(zipFile);
    const entries = Object.values(zip.files) as any[];

    // Вычисляем общий верхний каталог (если в архиве всё лежит внутри одной папки) и отбрасываем его
    const allFilePaths = entries
      .filter((e: any) => !e.dir)
      .map((e: any) => String(e.name).replace(/\\/g, '/'));
    const firstSeg = allFilePaths.length ? allFilePaths[0].split('/')[0] : '';
    const hasCommonRoot = !!firstSeg && allFilePaths.every((p) => p.startsWith(firstSeg + '/'));
    const stripPrefix = hasCommonRoot ? firstSeg + '/' : '';

    let uploaded = 0;
    for (const entry of entries) {
      if ((entry as any).dir) continue;
      let rawPath = String((entry as any).name).replace(/\\/g, '/');
      let relPath = stripPrefix && rawPath.startsWith(stripPrefix) ? rawPath.slice(stripPrefix.length) : rawPath;
      relPath = relPath.replace(/^\.\//, '');
      const basename = relPath.split('/').pop() || relPath;
      if (!isAllowedZipAsset(basename)) continue;
      const blob = await (entry as any).async('blob');
      await uploadExact(relPath, blob);
      uploaded++;
    }

    let converted = 0;
    if (autoConvert) {
      try {
        const glbs = await convertGltfZipToGlb(zip);
        for (const g of glbs) {
          await uploadExact(g.name, g.blob);
          converted++;
        }
      } catch (e) {
        console.error('Ошибка автоконвертации в GLB:', e);
      }
    }

    return { uploaded, converted };
  };
    setLoading(true);
    try {
      let totalUploaded = 0; let totalConverted = 0;
      for (const f of filesToUpload) {
        if (f.size > MAX_SIZE) {
          toast({ title: 'Файл пропущен (слишком большой)', description: `${f.name} > 100MB`, variant: 'destructive' });
          continue;
        }
        const ext = f.name.split('.').pop()?.toLowerCase();
        if (ext === 'zip') {
          const res = await processZipFile(f);
          totalUploaded += res.uploaded;
          totalConverted += res.converted;
        } else if (isAllowedZipAsset(f.name)) {
          await uploadExact(f.name, f);
          totalUploaded += 1;
        } else {
          toast({ title: 'Неподдерживаемый формат', description: f.name, variant: 'destructive' });
        }
      }
      toast({ title: 'Загрузка завершена', description: `Загружено файлов: ${totalUploaded}. Конвертировано в GLB: ${totalConverted}` });
      setFilesToUpload([]);
      await listFiles();
    } catch (e: any) {
      toast({ title: 'Ошибка загрузки', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getPublicUrl = (name: string) => {
    return publicModelUrl(name);
  }
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
        <CardTitle>Управление 3D ассетами (GLB/GLTF/ZIP)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <Input type="file" accept=".glb,.gltf,.bin,.png,.jpg,.jpeg,.webp,.ktx2,.gif,.bmp,.tga,.svg,.zip" multiple onChange={(e) => setFilesToUpload(Array.from(e.target.files || []))} />
          <Button onClick={onUpload} disabled={filesToUpload.length === 0 || !isAdmin || loading}>
            <Upload className="h-4 w-4 mr-2" /> Загрузить
          </Button>
          {!isAdmin && (
            <Badge variant="destructive">Только админ</Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Switch id="auto-glb" checked={autoConvert} onCheckedChange={setAutoConvert} />
          <Label htmlFor="auto-glb" className="text-sm cursor-pointer select-none">Автоконвертировать glTF (+bin, текстуры) → один .glb</Label>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Список файлов перемещён в галерею</div>
          <Button variant="secondary" onClick={() => navigate('/admin/assets')}>Открыть галерею ассетов</Button>
        </div>
      </CardContent>
    </Card>
  );
};
