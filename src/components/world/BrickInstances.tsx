import { Instances, Instance } from "@react-three/drei";
import { useWorldStore, type Brick } from "@/stores/worldStore";

export default function BrickInstances() {
  const bricks = useWorldStore(s => s.bricks);

  // Группируем по типам для отдельных наборов инстансов
  const groups = bricks.reduce<Record<string, Brick[]>>((acc,b) => {
    (acc[b.t] ??= []).push(b); 
    return acc;
  }, {});

  return (
    <>
      {/* Стены - кубы 1×1×1 */}
      {(groups["wall"] ?? []).length > 0 && (
        <Instances limit={5000}>
          <boxGeometry args={[1,1,1]} />
          <meshStandardMaterial color="#8b7355" />
          {(groups["wall"] ?? []).map((b) => (
            <Instance 
              key={b.id} 
              position={[b.x, b.y + 0.5, b.z]} 
              rotation={[0,(b.rot*Math.PI)/180,0]} 
            />
          ))}
        </Instances>
      )}

      {/* Пол - тонкие плитки */}
      {(groups["floor"] ?? []).length > 0 && (
        <Instances limit={5000}>
          <boxGeometry args={[1,0.2,1]} />
          <meshStandardMaterial color="#6b7280" />
          {(groups["floor"] ?? []).map((b) => (
            <Instance 
              key={b.id} 
              position={[b.x, b.y + 0.1, b.z]} 
              rotation={[0,(b.rot*Math.PI)/180,0]} 
            />
          ))}
        </Instances>
      )}

      {/* Столбы - высокие кубы */}
      {(groups["pillar"] ?? []).length > 0 && (
        <Instances limit={5000}>
          <boxGeometry args={[0.8,2,0.8]} />
          <meshStandardMaterial color="#5a4a3a" />
          {(groups["pillar"] ?? []).map((b) => (
            <Instance 
              key={b.id} 
              position={[b.x, b.y + 1, b.z]} 
              rotation={[0,(b.rot*Math.PI)/180,0]} 
            />
          ))}
        </Instances>
      )}

      {/* Лестницы */}
      {(groups["stairs"] ?? []).length > 0 && (
        <Instances limit={5000}>
          <boxGeometry args={[1,0.5,1]} />
          <meshStandardMaterial color="#7c6f5f" />
          {(groups["stairs"] ?? []).map((b) => (
            <Instance 
              key={b.id} 
              position={[b.x, b.y + 0.25, b.z]} 
              rotation={[0,(b.rot*Math.PI)/180,0]} 
            />
          ))}
        </Instances>
      )}

      {/* Крыши */}
      {(groups["roof"] ?? []).length > 0 && (
        <Instances limit={5000}>
          <boxGeometry args={[1,0.3,1]} />
          <meshStandardMaterial color="#8b4513" />
          {(groups["roof"] ?? []).map((b) => (
            <Instance 
              key={b.id} 
              position={[b.x, b.y + 0.15, b.z]} 
              rotation={[0,(b.rot*Math.PI)/180,0]} 
            />
          ))}
        </Instances>
      )}

      {/* Пропы/декор */}
      {(groups["prop"] ?? []).length > 0 && (
        <Instances limit={5000}>
          <boxGeometry args={[0.6,0.6,0.6]} />
          <meshStandardMaterial color="#4ade80" />
          {(groups["prop"] ?? []).map((b) => (
            <Instance 
              key={b.id} 
              position={[b.x, b.y + 0.3, b.z]} 
              rotation={[0,(b.rot*Math.PI)/180,0]} 
            />
          ))}
        </Instances>
      )}
    </>
  );
}