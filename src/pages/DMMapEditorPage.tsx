import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAssetsStore } from '@/stores/assetsStore';
import { useMapEntitiesStore } from '@/stores/mapEntitiesStore';
import { supabase } from '@/integrations/supabase/client';
import { publicModelUrl } from '@/utils/storageUrls';
import { SafeGLTFLoader } from '@/components/battle/SafeGLTFLoader';

function GLTFModel({ path, position = [0,0,0], rotation = [0,0,0], scale = [1,1,1] }: any) {
  const url = useMemo(() => publicModelUrl(path), [path]);
  return (
    <SafeGLTFLoader 
      url={url} 
      position={position} 
      scale={scale}
      fallback={
        <mesh position={position}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      }
    />
  );
}

const DMMapEditorPage: React.FC = () => {
  const { mapId } = useParams();
  const { categories, assets, loadAll } = useAssetsStore();
  const { entities, loadEntities, subscribe, addEntity } = useMapEntitiesStore();

  useEffect(() => {
    document.title = 'Редактор 3D карты — DM';
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!mapId) return;
    loadEntities(mapId);
    const off = subscribe(mapId);
    return () => off();
  }, [mapId, loadEntities, subscribe]);

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.key])), [categories]);

  const toEntityType = (catKey?: string): any => {
    switch (catKey) {
      case 'characters': return 'character';
      case 'monsters': return 'monster';
      case 'props': return 'prop';
      case 'terrain': return 'terrain';
      case 'fx': return 'fx';
      default: return 'prop';
    }
  };

  return (
    <main className="container mx-auto p-4 grid gap-4 md:grid-cols-12">
      <section className="md:col-span-3 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Палитра ассетов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {assets.filter(a => a.approved).map(a => (
              <div key={a.id} className="flex items-center justify-between gap-2 border rounded px-2 py-1">
                <div>
                  <div className="font-medium text-sm">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{categoryMap.get(a.category_id) || '—'}</div>
                </div>
                <Button size="sm" onClick={() => {
                  if (!mapId) return;
                  const catKey = categoryMap.get(a.category_id);
                  const type = toEntityType(catKey);
                  addEntity({
                    map_id: mapId,
                    asset_id: a.id,
                    type,
                    owner_id: null,
                    x: 0, y: 0, z: 0,
                    rot_x: 0, rot_y: 0, rot_z: 0,
                    scale_x: a.scale_x ?? 1,
                    scale_y: a.scale_y ?? 1,
                    scale_z: a.scale_z ?? 1,
                    data: {},
                    is_locked: false,
                  } as any);
                }}>Добавить</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Информация</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Карта: {mapId || 'не выбрана'}</p>
            <p className="text-sm text-muted-foreground">Сущностей: {entities.length}</p>
          </CardContent>
        </Card>
      </section>

      <section className="md:col-span-9 h-[70vh] border rounded overflow-hidden">
        <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} />

          {/* Плоскость карты (1 unit = 1 cell) */}
          <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
            <planeGeometry args={[50, 50, 50, 50]} />
            <meshStandardMaterial color="#777" wireframe />
          </mesh>

          {/* Сущности */}
          {entities.map(e => (
            <group key={e.id} position={[e.x, e.y, e.z]} rotation={[e.rot_x || 0, e.rot_y || 0, e.rot_z || 0]}>
              <GLTFModel
                path={(assets.find(a => a.id === e.asset_id)?.storage_path) || ''}
                position={[0,0,0]}
                rotation={[0,0,0]}
                scale={[e.scale_x || 1, e.scale_y || 1, e.scale_z || 1]}
              />
            </group>
          ))}

          <OrbitControls maxPolarAngle={Math.PI / 2.2} />
        </Canvas>
      </section>
    </main>
  );
};

export default DMMapEditorPage;
