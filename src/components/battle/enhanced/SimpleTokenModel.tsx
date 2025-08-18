import React from 'react';
import { useMemo } from 'react';

// Простые 3D модели для токенов когда внешние модели не загружаются

interface SimpleModelProps {
  type: 'humanoid' | 'creature' | 'large';
  color: string;
  size: number;
  emissive?: string;
  emissiveIntensity?: number;
}

export const SimpleTokenModel: React.FC<SimpleModelProps> = ({ 
  type, 
  color, 
  size, 
  emissive = '#000000', 
  emissiveIntensity = 0 
}) => {
  const geometry = useMemo(() => {
    switch (type) {
      case 'humanoid':
        // Гуманоид - капсула для человекоподобных существ
        return (
          <>
            {/* Тело */}
            <mesh position={[0, size * 0.6, 0]}>
              <capsuleGeometry args={[size * 0.25, size * 0.8, 4, 8]} />
              <meshStandardMaterial 
                color={color} 
                emissive={emissive} 
                emissiveIntensity={emissiveIntensity} 
              />
            </mesh>
            {/* Голова */}
            <mesh position={[0, size * 1.1, 0]}>
              <sphereGeometry args={[size * 0.15, 8, 8]} />
              <meshStandardMaterial 
                color={color} 
                emissive={emissive} 
                emissiveIntensity={emissiveIntensity} 
              />
            </mesh>
            {/* Глаза */}
            <mesh position={[size * 0.08, size * 1.15, size * 0.12]}>
              <sphereGeometry args={[size * 0.02, 4, 4]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-size * 0.08, size * 1.15, size * 0.12]}>
              <sphereGeometry args={[size * 0.02, 4, 4]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </>
        );
      
      case 'creature':
        // Существо - более животное/монстр-подобное
        return (
          <>
            {/* Основное тело */}
            <mesh position={[0, size * 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[size * 0.3, size * 0.8, 4, 8]} />
              <meshStandardMaterial 
                color={color} 
                emissive={emissive} 
                emissiveIntensity={emissiveIntensity} 
              />
            </mesh>
            {/* Голова */}
            <mesh position={[0, size * 0.4, size * 0.6]}>
              <sphereGeometry args={[size * 0.2, 8, 8]} />
              <meshStandardMaterial 
                color={color} 
                emissive={emissive} 
                emissiveIntensity={emissiveIntensity} 
              />
            </mesh>
            {/* Хвост */}
            <mesh position={[0, size * 0.3, -size * 0.5]} rotation={[Math.PI / 4, 0, 0]}>
              <cylinderGeometry args={[size * 0.05, size * 0.1, size * 0.4, 6]} />
              <meshStandardMaterial 
                color={color} 
                emissive={emissive} 
                emissiveIntensity={emissiveIntensity} 
              />
            </mesh>
          </>
        );
      
      case 'large':
        // Большое существо
        return (
          <mesh>
            <dodecahedronGeometry args={[size * 0.6, 0]} />
            <meshStandardMaterial 
              color={color} 
              emissive={emissive} 
              emissiveIntensity={emissiveIntensity}
              roughness={0.8} 
            />
          </mesh>
        );
      
      default:
        return (
          <mesh>
            <boxGeometry args={[size * 0.6, size * 1.2, size * 0.6]} />
            <meshStandardMaterial 
              color={color} 
              emissive={emissive} 
              emissiveIntensity={emissiveIntensity} 
            />
          </mesh>
        );
    }
  }, [type, color, size, emissive, emissiveIntensity]);

  return <>{geometry}</>;
};

// Определяет тип простой модели на основе типа токена
export function getSimpleModelType(tokenName: string, isEnemy?: boolean): 'humanoid' | 'creature' | 'large' {
  const name = tokenName.toLowerCase();
  
  // Большие существа
  if (name.includes('дракон') || name.includes('dragon') ||
      name.includes('голем') || name.includes('golem') ||
      name.includes('элементаль') || name.includes('elemental')) {
    return 'large';
  }
  
  // Животные и монстры
  if (name.includes('волк') || name.includes('wolf') ||
      name.includes('медведь') || name.includes('bear') ||
      name.includes('гоблин') || name.includes('goblin') ||
      name.includes('орк') || name.includes('orc')) {
    return 'creature';
  }
  
  // По умолчанию гуманоид (люди, эльфы, нежить в человеческой форме)
  return 'humanoid';
}