import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ExternalLink, Trash2, Copy, RefreshCcw, Users, Swords, Building, Shield, User, ArrowLeft, Home } from 'lucide-react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { supabase } from '@/integrations/supabase/client';
import { useProtectedRoute } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { convertGltfFromStorageToGlb } from '@/utils/convertGltfFromStorageToGlb';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { publicModelUrl } from '@/utils/storageUrls';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function ModelPreview({ path }: { path: string }) {
  const url = useMemo(() => publicModelUrl(path), [path]);

  useEffect(() => {
    let isMounted = true;
    
    fetch(url, { method: 'GET' })
      .then((r) => {
        if (!isMounted) return;
        const msg = `Storage check ${r.status} for ${url}`;
        if (!r.ok) console.error(msg);
        else console.info(msg);
      })
      .catch((e) => {
        if (!isMounted) return;
        console.error('Storage fetch failed', url, e);
      });
    
    return () => {
      isMounted = false;
    };
  }, [url]);

  const gltf: any = useLoader(GLTFLoader as any, url, (loader: any) => {
    loader.setCrossOrigin('anonymous');
    const draco = new DRACOLoader();
    draco.setDecoderPath('/draco/');
    // @ts-ignore - setDRACOLoader is available at runtime
    loader.setDRACOLoader(draco);
  });
  return <primitive object={gltf.scene} position={[0, -0.6, 0]} />;
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
  // Dialog state for linking .bin from any folder
  const [linkOpen, setLinkOpen] = useState(false);
  const [targetGltf, setTargetGltf] = useState<string | null>(null);
  const [binPrefix, setBinPrefix] = useState<string>('');
  const [binFiles, setBinFiles] = useState<FileItem[]>([]);
  const [binQuery, setBinQuery] = useState('');
  const [selectedBin, setSelectedBin] = useState<string>('');

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
            const url = publicModelUrl(fullPath);
            const res = await fetch(url);
            const json = await res.json();
            const deps: string[] = [];
            if (Array.isArray(json.buffers)) {
              json.buffers.forEach((b: any) => b?.uri && deps.push(String(b.uri)));
            }
            if (Array.isArray(json.images)) {
              json.images.forEach((img: any) => img?.uri && deps.push(String(img.uri)));
            }
            // consider only relative deps (ignore absolute URLs like https://)
            const missing = deps
              .filter((u) => !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(u))
              .map((u) => u.split('/').pop() as string)
              .filter((n) => n && !names.has(n));
            results[fullPath] = { missing, checked: true };
          } catch (e) {
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
  const url = publicModelUrl(name);
  try {
    await navigator.clipboard.writeText(url);
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

  const openLinkDialog = (gltfPath: string) => {
    setTargetGltf(gltfPath);
    setLinkOpen(true);
    setBinPrefix('');
    setSelectedBin('');
    setBinQuery('');
  };

  const loadBinFiles = async (p: string = binPrefix) => {
    const { data, error } = await supabase.storage.from('models').list(p, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) {
      console.error('Ошибка получения списка .bin:', error);
      return;
    }
    setBinFiles((data as any) || []);
  };

  useEffect(() => {
    if (linkOpen) {
      loadBinFiles(binPrefix);
    }
  }, [linkOpen, binPrefix]);

  const filteredBin = binFiles.filter((f) => f.name.toLowerCase().includes(binQuery.toLowerCase()));
  const selectedBinFullPath = selectedBin || '';

  const linkBinToGltf = async () => {
    if (!targetGltf || !selectedBinFullPath) return;
    try {
      const gltfUrl = publicModelUrl(targetGltf);
      const res = await fetch(gltfUrl, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`GLTF ${res.status}`);
      const json = await res.json();

      if (!Array.isArray(json.buffers) || json.buffers.length === 0) {
        json.buffers = [{ uri: '' }];
      }

      const binUrl = publicModelUrl(selectedBinFullPath);
      json.buffers = json.buffers.map((b: any, i: number) => (i === 0 ? { ...b, uri: binUrl } : b));

      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const { error } = await supabase.storage.from('models').upload(targetGltf, blob, {
        upsert: true,
        contentType: 'model/gltf+json',
        cacheControl: '3600',
      });
      if (error) throw error;

      toast({ title: 'BIN привязан', description: `${selectedBinFullPath} → ${targetGltf}` });
      setLinkOpen(false);
      const data = await listFiles(prefix);
      if (data) await validateFiles(data, prefix);
    } catch (e: any) {
      toast({ title: 'Ошибка привязки', description: e.message || String(e), variant: 'destructive' });
    }
  };

  // Список категорий для отображения
  const categories = [
    { key: 'monsters', name: 'Монстры', icon: Users, description: 'Существа и монстры' },
    { key: 'characters', name: 'Персонажи', icon: User, description: 'Игровые персонажи' },
    { key: 'structures', name: 'Строения', icon: Building, description: 'Здания и сооружения' },
    { key: 'armor', name: 'Одежда', icon: Shield, description: 'Броня и одежда' },
    { key: 'weapons', name: 'Оружие', icon: Swords, description: 'Оружие и инструменты' },
  ];

  // Если prefix пустой - показываем категории
  const showCategories = !prefix;

  return (
    <div className="space-y-4">
      {/* Навигационная панель */}
      {prefix && (
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPrefix('')}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к категориям
          </Button>
          <div className="text-sm text-muted-foreground">
            Текущая папка: <span className="font-mono text-foreground">{prefix}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по имени файла" className="max-w-md" />
        <div className="flex items-center gap-2">
          <Button
            variant={prefix === 'trash' ? 'default' : 'outline'}
            onClick={() => setPrefix('trash')}
            title="Показать содержимое папки корзины (models/trash)"
          >
            Корзина
          </Button>
          {!showCategories && (
            <Button
              variant="outline"
              onClick={() => setPrefix('')}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              К категориям
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

      {showCategories ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.key} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setPrefix(category.key)}>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((f) => {
            const fullPath = prefix ? `${prefix}/${f.name}` : f.name;
            const publicUrl = publicModelUrl(fullPath);
            const lower = f.name.toLowerCase();
            const isFolder = !f.id && !/\.[a-z0-9]+$/i.test(f.name);
            const v = validations[fullPath];
            const isGltf = lower.endsWith('.gltf');
            const isGlb = lower.endsWith('.glb');
            const isImage = /(\.png|\.jpg|\.jpeg|\.webp|\.gif|\.bmp|\.svg)$/.test(lower);
            const hasMissing = isGltf && ((v?.missing?.length ?? 0) > 0);
            const canPreview3D = !isFolder && (isGlb || (isGltf && !hasMissing));
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
                    ) : isImage ? (
                      <img
                        src={publicUrl}
                        alt={`Предпросмотр изображения ${f.name} из хранилища models`}
                        loading="lazy"
                        className="w-full h-48 object-contain"
                        onError={() => console.error('Image preview failed', publicUrl)}
                      />
                    ) : canPreview3D ? (
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
                        Превью доступно для .png/.jpg/.webp, .glb и валидных .gltf.
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
                      <>
                        <Button size="sm" variant="outline" onClick={() => convertToGlb(fullPath)} disabled={loading}>
                          В GLB
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openLinkDialog(fullPath)} disabled={loading}>
                          Привязать .bin
                        </Button>
                      </>
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
      )}

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Привязать .bin файл к GLTF</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Цель: <code>{targetGltf}</code>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Папка для поиска .bin</label>
                <Input
                  value={binPrefix}
                  onChange={(e) => setBinPrefix(e.target.value)}
                  placeholder="Оставьте пустым для корня"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Поиск .bin файлов</label>
                <Input
                  value={binQuery}
                  onChange={(e) => setBinQuery(e.target.value)}
                  placeholder="Фильтр по имени"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto border rounded p-2">
              {filteredBin.map((bin) => {
                const binPath = binPrefix ? `${binPrefix}/${bin.name}` : bin.name;
                const isSelected = selectedBin === binPath;
                return (
                  <div
                    key={binPath}
                    className={`p-2 cursor-pointer rounded ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedBin(binPath)}
                  >
                    {binPath}
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkOpen(false)}>
              Отмена
            </Button>
            <Button onClick={linkBinToGltf} disabled={!selectedBinFullPath}>
              Привязать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StorageModelsGallery;
