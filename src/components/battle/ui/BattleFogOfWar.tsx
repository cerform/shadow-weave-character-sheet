import { useMemo } from "react";
import { DoubleSide } from "three";
import { useBattleUIStore } from "@/stores/battleUIStore";

export default function BattleFogOfWar() {
  const fogEnabled = useBattleUIStore((s) => s.fogEnabled);
  
  // Материал тумана с улучшенной визуализацией
  const materialProps = useMemo(
    () => ({ 
      color: "#000000", 
      opacity: 0.7, 
      transparent: true, 
      side: DoubleSide,
      depthWrite: false
    }),
    []
  );

  if (!fogEnabled) return null;

  return (
    <group>
      {/* Основной слой тумана */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial {...materialProps} />
      </mesh>
      
      {/* Дополнительный эффект границ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[48, 50, 64]} />
        <meshBasicMaterial 
          color="#111111" 
          transparent 
          opacity={0.9} 
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}