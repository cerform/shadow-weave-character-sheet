import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useAssetsStore } from '@/stores/assetsStore';
import { useMapEntitiesStore } from '@/stores/mapEntitiesStore';
import { supabase } from '@/integrations/supabase/client';

function GLTFModel({ path, position = [0,0,0], rotation = [0,0,0], scale = [1,1,1] }: any) {
  const url = supabase.storage.from('models').getPublicUrl(path).data.publicUrl;
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={position} rotation={rotation} scale={scale} />;
}

const PlayerMapPage: React.FC = () => {
  const { mapId } = useParams();
  const { assets, loadAll } = useAssetsStore();
  const { entities, loadEntities, subscribe } = useMapEntitiesStore();

  useEffect(() => {
    document.title = '3D карта — Игрок';
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!mapId) return;
    loadEntities(mapId);
    const off = subscribe(mapId);
    return () => off();
  }, [mapId, loadEntities, subscribe]);

  return (
    <main className="container mx-auto p-4 space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Просмотр карты</h1>
        <p className="text-muted-foreground">Вы можете видеть карту и ваши объекты в реальном времени.</p>
      </header>
      <section className="h-[70vh] border rounded overflow-hidden">
        <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={0.8} />

          <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
            <planeGeometry args={[50, 50, 50, 50]} />
            <meshStandardMaterial color="#777" wireframe />
          </mesh>

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

export default PlayerMapPage;
