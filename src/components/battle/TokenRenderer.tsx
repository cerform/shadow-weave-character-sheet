import React from 'react';
import { Circle, Text, Group, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { EnhancedToken } from '@/stores/enhancedBattleStore';

interface TokenRendererProps {
  token: EnhancedToken;
  gridSize?: number;
}

export const TokenRenderer: React.FC<TokenRendererProps> = ({ token, gridSize = 25 }) => {
  const [avatarImage] = useImage(token.avatarUrl || '');

  const x = token.position[0] * gridSize + gridSize / 2;
  const y = token.position[2] * gridSize + gridSize / 2;
  const radius = 12;

  return (
    <Group>
      {/* Круг токена */}
      <Circle
        x={x}
        y={y}
        radius={radius}
        fill={token.color || (token.isEnemy ? "#ef4444" : "#22c55e")}
        stroke="hsl(var(--border))"
        strokeWidth={2}
        opacity={0.8}
      />

      {/* Аватар если есть */}
      {avatarImage && (
        <KonvaImage
          image={avatarImage}
          x={x - radius}
          y={y - radius}
          width={radius * 2}
          height={radius * 2}
          cornerRadius={radius}
          clipFunc={(ctx) => {
            ctx.arc(x, y, radius, 0, Math.PI * 2, false);
          }}
        />
      )}

      {/* Индикатор призванного существа */}
      {token.is_summoned && (
        <Circle
          x={x + radius - 4}
          y={y - radius + 4}
          radius={4}
          fill="#8b5cf6"
          stroke="#ffffff"
          strokeWidth={1}
        />
      )}
      
      {/* Имя токена */}
      <Text
        x={x}
        y={y + radius + 5}
        text={token.name}
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
            x={x}
            y={y - radius - 6}
            radius={8}
            fill="hsl(var(--destructive))"
            opacity={0.3}
          />
          
          {/* HP бар */}
          <Circle
            x={x}
            y={y - radius - 6}
            radius={8 * (token.hp / token.maxHp)}
            fill="hsl(var(--destructive))"
            opacity={0.8}
          />
          
          {/* Текст HP */}
          <Text
            x={x}
            y={y - radius - 10}
            text={`${token.hp}/${token.maxHp}`}
            fontSize={8}
            fill="hsl(var(--foreground))"
            width={30}
            align="center"
            offsetX={15}
          />
        </>
      )}
    </Group>
  );
};
