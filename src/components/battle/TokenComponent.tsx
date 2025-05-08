
import React from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Circle, Group, Image, Text } from 'react-konva';
import { Token } from '@/types/battle';

interface TokenComponentProps {
  token: Token;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: KonvaEventObject<any>) => void;
  draggable: boolean;
  zoom: number;
}

const TokenComponent: React.FC<TokenComponentProps> = ({
  token,
  isSelected,
  onSelect,
  onDragEnd,
  draggable,
  zoom
}) => {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  
  React.useEffect(() => {
    const img = new Image();
    img.src = token.img;
    img.onload = () => {
      setImage(img);
    };
  }, [token.img]);
  
  const size = (token.size || 1) * 50 * zoom;
  const strokeWidth = 2 * zoom;
  
  // Определение цвета рамки в зависимости от типа токена
  const getStrokeColor = () => {
    switch (token.type) {
      case 'player':
        return '#4CAF50';
      case 'monster':
        return '#FF9800';
      case 'boss':
        return '#F44336';
      default:
        return '#CCCCCC';
    }
  };

  return (
    <Group
      x={token.x}
      y={token.y}
      draggable={draggable}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    >
      {/* Круглая подсветка для выбранного токена */}
      {isSelected && (
        <Circle
          radius={size / 2 + 5 * zoom}
          fill="rgba(255, 255, 0, 0.3)"
          stroke="yellow"
          strokeWidth={strokeWidth / 2}
        />
      )}
      
      {/* Сам токен */}
      {image && (
        <Group>
          <Circle
            radius={size / 2}
            fill="#333"
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth}
          />
          <Image
            image={image}
            width={size}
            height={size}
            offsetX={size / 2}
            offsetY={size / 2}
            cornerRadius={size / 2}
          />
        </Group>
      )}
      
      {/* Метка с именем */}
      <Text
        text={token.name}
        fill="white"
        fontSize={12 * zoom}
        offsetX={0}
        offsetY={-10 * zoom}
        align="center"
        width={size}
        x={-size / 2}
        y={size / 2 + 5 * zoom}
        shadowColor="black"
        shadowBlur={2}
        shadowOffset={{ x: 1, y: 1 }}
        shadowOpacity={0.8}
      />
      
      {/* Индикатор здоровья */}
      {token.hp !== undefined && token.maxHp !== undefined && (
        <Group y={size / 2 + 20 * zoom}>
          {/* Фон полоски здоровья */}
          <Circle
            radius={size / 4}
            fill={token.hp > token.maxHp * 0.5 ? "#4CAF50" : 
                 token.hp > token.maxHp * 0.25 ? "#FFC107" : "#F44336"}
            x={0}
            y={0}
          />
          <Text
            text={`${token.hp}/${token.maxHp}`}
            fontSize={10 * zoom}
            fill="white"
            align="center"
            width={size}
            x={-size / 2}
            y={-5 * zoom}
            shadowColor="black"
            shadowBlur={2}
            shadowOffset={{ x: 1, y: 1 }}
            shadowOpacity={0.8}
          />
        </Group>
      )}
    </Group>
  );
};

export default TokenComponent;
