import React, { useState } from 'react';
import { Circle, Text, Group, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { EnhancedToken } from '@/stores/enhancedBattleStore';
import { useAuth } from '@/hooks/use-auth';

interface TokenRendererProps {
  token: EnhancedToken;
  gridSize?: number;
  onDragEnd?: (newPosition: [number, number, number]) => void;
}

export const TokenRenderer: React.FC<TokenRendererProps> = ({ 
  token, 
  gridSize = 25,
  onDragEnd
}) => {
  const { user } = useAuth();
  const [avatarImage] = useImage(token.image_url || token.avatarUrl || '');
  const [isDragging, setIsDragging] = useState(false);

  const x = token.position[0] * gridSize + gridSize / 2;
  const y = token.position[2] * gridSize + gridSize / 2;
  const radius = 12;

  // Игрок может перемещать только свои токены
  const canDrag = token.owner_id === user?.id;

  const handleDragStart = () => {
    if (canDrag) {
      setIsDragging(true);
    }
  };

  const handleDragEnd = (e: any) => {
    if (!canDrag) return;
    
    setIsDragging(false);
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    // Snap to grid
    const newX = Math.round((pointerPosition.x - gridSize / 2) / gridSize);
    const newY = Math.round((pointerPosition.y - gridSize / 2) / gridSize);
    
    if (onDragEnd) {
      onDragEnd([newX, 0, newY]);
    }
  };

  return (
    <Group
      x={x}
      y={y}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      opacity={isDragging ? 0.7 : 1}
    >
      {/* Подсветка своего токена */}
      {canDrag && (
        <Circle
          radius={radius + 4}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dash={[5, 5]}
          opacity={0.6}
        />
      )}

      {/* Круг токена */}
      <Circle
        radius={radius}
        fill={token.color || (token.isEnemy ? "#ef4444" : "#22c55e")}
        stroke={canDrag ? "hsl(var(--primary))" : "hsl(var(--border))"}
        strokeWidth={2}
        opacity={0.8}
      />

      {/* Аватар если есть */}
      {avatarImage && (
        <KonvaImage
          image={avatarImage}
          x={-radius}
          y={-radius}
          width={radius * 2}
          height={radius * 2}
          cornerRadius={radius}
          clipFunc={(ctx) => {
            ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
          }}
        />
      )}

      {/* Индикатор призванного существа */}
      {token.is_summoned && (
        <Circle
          x={radius - 4}
          y={-radius + 4}
          radius={4}
          fill="#8b5cf6"
          stroke="#ffffff"
          strokeWidth={1}
        />
      )}
      
      {/* Имя токена */}
      <Text
        y={radius + 5}
        text={String(token.name || 'Token')}
        fontSize={10}
        fill="hsl(var(--foreground))"
        width={50}
        align="center"
        offsetX={25}
      />

      {/* HP индикатор */}
      {token.hp !== undefined && token.maxHp !== undefined && (
        <>
          {/* Фон HP бара */}
          <Circle
            y={-radius - 6}
            radius={8}
            fill="hsl(var(--destructive))"
            opacity={0.3}
          />
          
          {/* HP бар */}
          <Circle
            y={-radius - 6}
            radius={8 * (token.hp / token.maxHp)}
            fill={
              token.hp / token.maxHp > 0.5 
                ? "#22c55e" 
                : token.hp / token.maxHp > 0.25 
                ? "#eab308" 
                : "#ef4444"
            }
            opacity={0.8}
          />
          
          {/* Текст HP */}
          <Text
            y={-radius - 10}
            text={`${Number(token.hp || 0)}/${Number(token.maxHp || 1)}`}
            fontSize={8}
            fill="hsl(var(--foreground))"
            width={30}
            align="center"
            offsetX={15}
          />
        </>
      )}

      {/* Индикатор текущего хода */}
      {token.initiative !== undefined && (
        <Text
          x={radius + 2}
          y={-radius - 2}
          text={`⚔️${token.initiative}`}
          fontSize={8}
          fill="hsl(var(--primary))"
        />
      )}

      {/* Курсор указателя для своих токенов */}
      {canDrag && !isDragging && (
        <Circle
          radius={radius}
          fill="transparent"
        />
      )}
    </Group>
  );
};
