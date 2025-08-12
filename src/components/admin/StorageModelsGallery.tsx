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

  const listFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from('models').list('', {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) {
      console.error('Ошибка получения списка моделей:', error);
      toast({ title: 'Ошибка загрузки', description: error.message, variant: 'destructive' });
    } else {
      setFiles((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => { listFiles(); }, []);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по имени файла" className="max-w-md" />
        <Button variant="secondary" onClick={listFiles} disabled={loading}>
          <RefreshCcw className="h-4 w-4 mr-2" />Обновить
        </Button>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((f) => {
          const publicUrl = supabase.storage.from('models').getPublicUrl(f.name).data.publicUrl;
          return (
            <Card key={f.name} className="overflow-hidden">
              <CardHeader className="p-3 flex items-center justify-between">
                <CardTitle className="text-sm font-semibold truncate" title={f.name}>{f.name}</CardTitle>
                <Badge variant="secondary">models</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-48 bg-muted/40">
                  <ErrorBoundary fallback={<div className="w-full h-full flex items-center justify-center text-[11px] text-muted-foreground p-3 text-center">Не удалось загрузить 3D-превью. Для .gltf нужен сопутствующий .bin и текстуры. Рекомендуется загружать .glb.</div>}>
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Загрузка...</div>}>
                      <Canvas camera={{ position: [1.6, 1.6, 1.6], fov: 50 }}>
                        <ambientLight intensity={0.8} />
                        <directionalLight position={[2, 2, 2]} intensity={0.6} />
                        <Suspense fallback={null}>
                          <ModelPreview path={f.name} />
                        </Suspense>
                        <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2.2} />
                      </Canvas>
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </CardContent>
              <CardFooter className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" asChild>
                    <a href={publicUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />Открыть
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyUrl(f.name)}>
                    <Copy className="h-3 w-3 mr-1" />Копировать URL
                  </Button>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(f.name)} disabled={!isAdmin || loading}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StorageModelsGallery;
