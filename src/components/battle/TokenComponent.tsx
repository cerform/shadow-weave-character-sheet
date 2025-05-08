
import React from 'react';
import { Group, Circle, Image as KonvaImage, Text } from 'react-konva';
import { Token } from '@/types/battle';
import useImage from 'use-image';
import TokenHealthBar from './TokenHealthBar';

interface TokenComponentProps {
  token: Token;
  isSelected: boolean;
  isActive: boolean;
}

const TokenComponent: React.FC<TokenComponentProps> = ({ token, isSelected, isActive }) => {
  const [image] = useImage(token.img);
  const size = (token.size || 1) * 50;
  
  // Определяем цвет границы на основе типа токена
  const getBorderColor = () => {
    switch (token.type) {
      case 'player': return '#4CAF50';
      case 'boss': return '#F44336';
      case 'monster': return '#FF9800';
      case 'npc': return '#2196F3';
      default: return '#FFFFFF';
    }
  };

  return (
    <Group>
      {/* Внешний круг для выделения */}
      {isSelected && (
        <Circle
          x={size / 2}
          y={size / 2}
          radius={size / 2 + 4}
          stroke="white"
          strokeWidth={2}
          dash={[5, 5]}
        />
      )}
      
      {/* Круг для активного хода */}
      {isActive && (
        <Circle
          x={size / 2}
          y={size / 2}
          radius={size / 2 + 8}
          stroke="#FFD700"
          strokeWidth={2}
          dash={[2, 2]}
        />
      )}
      
      {/* Основной круг токена */}
      <Circle
        x={size / 2}
        y={size / 2}
        radius={size / 2}
        fill="black"
        stroke={getBorderColor()}
        strokeWidth={3}
      />
      
      {/* Изображение */}
      <KonvaImage
        x={2}
        y={2}
        image={image}
        width={size - 4}
        height={size - 4}
        cornerRadius={size / 2}
      />
      
      {/* Отображение HP */}
      {token.hp !== undefined && token.maxHp !== undefined && (
        <Group y={size + 5}>
          {/* Фон полоски HP */}
          <Circle
            x={size / 2}
            y={5}
            radius={5}
            fill="rgba(0,0,0,0.5)"
          />
          
          {/* Процент HP */}
          <Text
            x={0}
            y={0}
            width={size}
            text={`${token.hp}/${token.maxHp}`}
            fontSize={10}
            fill="white"
            align="center"
          />
        </Group>
      )}
      
      {/* Имя токена */}
      <Text
        x={0}
        y={size + 15}
        width={size}
        text={token.name}
        fontSize={12}
        fill="white"
        align="center"
      />
    </Group>
  );
};

export default TokenComponent;
