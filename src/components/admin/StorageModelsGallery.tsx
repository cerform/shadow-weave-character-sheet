import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ExternalLink, Trash2, Copy, RefreshCcw } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { supabase } from '@/integrations/supabase/client';
import { useProtectedRoute } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { convertGltfFromStorageToGlb } from '@/utils/convertGltfFromStorageToGlb';

function ModelPreview({ path }: { path: string }) {
  const url = useMemo(() => supabase.storage.from('models').getPublicUrl(path).data.publicUrl, [path]);
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={[0, -0.6, 0]} />;
}

interface FileItem { name: string; id?: string; updated_at?: string; created_at?: string; }

const StorageModelsGallery: React.FC = () => {
  const { isAdmin } = useProtectedRoute();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [validations, setValidations] = useState<Record<string, { missing: string[]; checked: boolean }>>({});
  const [prefix, setPrefix] = useState<string>('');

  const joinPath = (a: string, b: string) => (a ? `${a.replace(/\\/g, '/').replace(/\/$/, '')}/${b}` : b);
  const parentPrefix = (p: string) => {
    const n = p.replace(/\\/g, '/').replace(/\/$/, '');
    const idx = n.lastIndexOf('/');
    return idx >= 0 ? n.slice(0, idx) : '';
  };

  const listFiles = async (p: string = prefix): Promise<FileItem[] | undefined> => {
    setLoading(true);
    const { data, error } = await supabase.storage.from('models').list(p, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) {
      console.error('Ошибка получения списка моделей:', error);
      toast({ title: 'Ошибка загрузки', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    } else {
      setFiles((data as any) || []);
      setLoading(false);
      return (data as any) || [];
    }
  };

  const validateFiles = async (items: FileItem[], p: string = prefix) => {
    const names = new Set(items.map((i) => i.name));
    const results: Record<string, { missing: string[]; checked: boolean }> = {};

    await Promise.all(
      items.map(async (f) => {
        const fullPath = joinPath(p, f.name);
        const lower = f.name.toLowerCase();
        if (lower.endsWith('.glb')) {
          results[fullPath] = { missing: [], checked: true };
          return;
        }
        if (lower.endsWith('.gltf')) {
          try {
            const { data } = supabase.storage.from('models').getPublicUrl(fullPath);
            const res = await fetch(data.publicUrl);
            const json = await res.json();
            const deps: string[] = [];
            if (Array.isArray(json.buffers)) {
              json.buffers.forEach((b: any) => b?.uri && deps.push(String(b.uri)));
            }
            if (Array.isArray(json.images)) {
              json.images.forEach((img: any) => img?.uri && deps.push(String(img.uri)));
            }
            // check only basenames in the same folder
            const missing = deps
              .map((u) => u.split('/').pop() as string)
              .filter((n) => n && !names.has(n));
            results[fullPath] = { missing, checked: true };
          } catch (e) {
            // Не смогли прочитать gltf — пометим как требующий проверку
            results[fullPath] = { missing: ['.bin/текстуры?'], checked: true };
          }
          return;
        }
        // Other files and folders
        results[fullPath] = { missing: [], checked: true };
      })
    );

    setValidations(results);
  };

  useEffect(() => {
    (async () => {
      const data = await listFiles(prefix);
      if (data) await validateFiles(data, prefix);
    })();
  }, [prefix]);

  const filtered = files.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

  const copyUrl = async (name: string) => {
    const { data } = supabase.storage.from('models').getPublicUrl(name);
    try {
      await navigator.clipboard.writeText(data.publicUrl);
      toast({ title: 'Ссылка скопирована' });
    } catch {}
  };

  const remove = async (name: string) => {
    if (!isAdmin) return;
    setLoading(true);
    const { error } = await supabase.storage.from('models').remove([name]);
    if (error) toast({ title: 'Ошибка удаления', description: error.message, variant: 'destructive' });
    else toast({ title: 'Удалено', description: name });
    await listFiles();
    setLoading(false);
  };

  const convertToGlb = async (name: string) => {
    try {
      const res = await convertGltfFromStorageToGlb(name);
      if (!res) {
        toast({ title: 'Конвертация', description: 'Не удалось создать GLB', variant: 'destructive' });
        return;
      }
      // upload GLB next to .gltf
      const { error } = await supabase.storage.from('models').upload(res.name, res.blob, {
        contentType: 'model/gltf-binary',
        upsert: true,
        cacheControl: '3600',
      });
      if (error) throw error;
      toast({ title: 'Готово', description: `Создан ${res.name}` });
      await listFiles();
    } catch (e: any) {
      toast({ title: 'Ошибка конвертации', description: e.message || String(e), variant: 'destructive' });
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по имени файла" className="max-w-md" />
        <div className="flex items-center gap-2">
          {prefix && (
            <Button
              variant="outline"
              onClick={() => setPrefix(parentPrefix(prefix))}
              disabled={loading}
            >
              Вверх
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={async () => {
              const data = await listFiles();
              if (data) await validateFiles(data);
            }}
            disabled={loading}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />Обновить
          </Button>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((f) => {
          const fullPath = prefix ? `${prefix}/${f.name}` : f.name;
          const publicUrl = supabase.storage.from('models').getPublicUrl(fullPath).data.publicUrl;
          const lower = f.name.toLowerCase();
          const isFolder = !f.id && !/\.[a-z0-9]+$/i.test(f.name);
          const v = validations[fullPath];
          const isGltf = lower.endsWith('.gltf');
          const isGlb = lower.endsWith('.glb');
          const hasMissing = isGltf && ((v?.missing?.length ?? 0) > 0);
          const canPreview = !isFolder && (isGlb || (isGltf && !hasMissing));
          return (
            <Card key={fullPath} className="overflow-hidden">
              <CardHeader className="p-3 flex items-center justify-between">
                <CardTitle className="text-sm font-semibold truncate" title={f.name}>{f.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary">models</Badge>
                  {isFolder && <Badge variant="outline">folder</Badge>}
                  {isGltf && <Badge variant="outline">gltf</Badge>}
                  {isGlb && <Badge variant="outline">glb</Badge>}
                  {hasMissing && (
                    <Badge variant="destructive" title={`Отсутствует: ${v?.missing?.join(', ')}`}>
                      deps
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-48 bg-muted/40">
                  {isFolder ? (
                    <div className="w-full h-full flex items-center justify-center text-[11px] text-muted-foreground p-3 text-center">
                      Папка. Откройте для просмотра содержимого.
                    </div>
                  ) : hasMissing ? (
                    <div className="w-full h-full flex items-center justify-center text-[11px] text-muted-foreground p-3 text-center">
                      Не хватает файлов: {v?.missing?.slice(0, 3).join(', ') || '—'}. Загрузите их или воспользуйтесь кнопкой «В GLB».
                    </div>
                  ) : canPreview ? (
                    <ErrorBoundary fallback={<div className="w-full h-full flex items-center justify-center text-[11px] text-muted-foreground p-3 text-center">Не удалось загрузить 3D-превью. Для .gltf нужен сопутствующий .bin и текстуры. Рекомендуется загружать .glb.</div>}>
                      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Загрузка...</div>}>
                        <Canvas camera={{ position: [1.6, 1.6, 1.6], fov: 50 }}>
                          <ambientLight intensity={0.8} />
                          <directionalLight position={[2, 2, 2]} intensity={0.6} />
                          <Suspense fallback={null}>
                            <ModelPreview path={fullPath} />
                          </Suspense>
                          <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2.2} />
                        </Canvas>
                      </Suspense>
                    </ErrorBoundary>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[11px] text-muted-foreground p-3 text-center">
                      Превью доступно только для .glb и валидных .gltf.
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isFolder ? (
                    <Button size="sm" variant="secondary" onClick={() => setPrefix(joinPath(prefix, f.name))}>
                      Открыть папку
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="secondary" asChild>
                        <a href={publicUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />Открыть
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => copyUrl(fullPath)}>
                        <Copy className="h-3 w-3 mr-1" />Копировать URL
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isFolder && isGltf && (
                    <Button size="sm" variant="outline" onClick={() => convertToGlb(fullPath)} disabled={loading}>
                      В GLB
                    </Button>
                  )}
                  {!isFolder && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(fullPath)} disabled={!isAdmin || loading}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StorageModelsGallery;
