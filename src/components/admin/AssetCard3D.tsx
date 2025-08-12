import React, { Suspense, useMemo, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, ExternalLink } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { supabase } from '@/integrations/supabase/client';
import type { AssetItem, AssetCategory } from '@/stores/assetsStore';

function ModelPreview({ path }: { path: string }) {
  const url = useMemo(() => supabase.storage.from('models').getPublicUrl(path).data.publicUrl, [path]);
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={[0, -0.6, 0]} />;
}

const AssetCard3D: React.FC<{
  asset: AssetItem;
  category?: AssetCategory;
  onToggleApproved: (approved: boolean) => void;
  onDelete: () => void;
}> = ({ asset, category, onToggleApproved, onDelete }) => {
  const modelUrl = supabase.storage.from('models').getPublicUrl(asset.storage_path).data.publicUrl;
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold truncate">{asset.name}</CardTitle>
          <Badge variant="secondary">{category?.key || '—'}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-48 bg-muted/40">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Загрузка...</div>}>
            {!error ? (
              <Canvas camera={{ position: [1.6, 1.6, 1.6], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[2, 2, 2]} intensity={0.6} />
                <Suspense fallback={null}>
                  <ModelPreview path={asset.storage_path} />
                </Suspense>
                <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2.2} />
              </Canvas>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-destructive text-xs">{error}</div>
            )}
          </Suspense>
        </div>
      </CardContent>
      <CardFooter className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={asset.approved} onCheckedChange={onToggleApproved} />
          <span className="text-xs text-muted-foreground">{asset.approved ? 'Одобрено' : 'На модерации'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" asChild>
            <a href={modelUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />Открыть
            </a>
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AssetCard3D;
