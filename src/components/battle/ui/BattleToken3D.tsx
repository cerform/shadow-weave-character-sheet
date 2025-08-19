import { Html } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { useBattleUIStore, Token } from "@/stores/battleUIStore";
import StatusIcons from "./StatusIcons";

const GRID = 1; // размер клетки для снаппинга

export default function BattleToken3D({ token }: { token: Token }) {
  const meshRef = useRef<any>(null);
  const ringRef = useRef<any>(null);
  const updateToken = useBattleUIStore((s) => s.updateToken);
  const activeId = useBattleUIStore((s) => s.activeId);
  const addCombatEvent = useBattleUIStore((s) => s.addCombatEvent);
  
  const isActive = activeId === token.id;
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const color = token.isEnemy ? "#dc2626" : "#ea580c"; // enemy red / ally orange
  const hpPercent = Math.max(0, Math.min(100, (token.hp / token.maxHp) * 100));

  // Анимация активного токена
  useFrame((state) => {
    if (ringRef.current && isActive) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
    if (meshRef.current) {
      meshRef.current.position.set(...token.position);
      // Небольшое покачивание при наведении
      if (hovered && !dragging) {
        meshRef.current.position.y = 0.05 + Math.sin(state.clock.elapsedTime * 3) * 0.02;
      }
    }
  });

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDragging(true);
  };

  const onPointerUp = () => {
    setDragging(false);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return;
    e.stopPropagation();
    const point = e.point;
    const snap = (v: number) => Math.round(v / GRID) * GRID;
    updateToken(token.id, { position: [snap(point.x), 0, snap(point.z)] });
  };

  const onTokenClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!dragging) {
      // Логика выбора токена или действий
      console.log(`Token ${token.name} clicked`);
    }
  };

  return (
    <group>
      {/* Основной токен */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onTokenClick}
      >
        {/* Модель токена - цилиндр */}
        <cylinderGeometry args={[0.4, 0.4, 0.8, 16]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.1}
          roughness={0.8}
          emissive={hovered ? "#333" : "#000"}
        />
      </mesh>

      {/* Кольцо активного токена */}
      {isActive && (
        <mesh ref={ringRef} position={[...token.position]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial 
            color="hsl(var(--primary))" 
            transparent 
            opacity={0.8}
          />
        </mesh>
      )}

      {/* HP-бар и UI - только если не перетаскиваем */}
      {!dragging && (
        <Html 
          center 
          distanceFactor={15} 
          position={[token.position[0], token.position[1] + 1.5, token.position[2]]}
        >
          <div className="min-w-20 text-center select-none pointer-events-none">
            {/* Имя токена */}
            <div className="text-xs font-bold text-primary mb-1 drop-shadow-md">
              {token.name}
            </div>
            
            {/* HP-бар */}
            <div className="w-24 h-2 bg-destructive/20 rounded-full border border-border/50 backdrop-blur-sm">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  hpPercent > 60 ? 'bg-green-500' : 
                  hpPercent > 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${hpPercent}%` }}
                title={`${token.hp}/${token.maxHp} HP`}
              />
            </div>
            
            {/* Числовые HP */}
            <div className="text-xs text-muted-foreground mt-0.5">
              {token.hp}/{token.maxHp}
            </div>

            {/* Иконки состояний */}
            <StatusIcons conditions={token.conditions} />
          </div>
        </Html>
      )}
    </group>
  );
}