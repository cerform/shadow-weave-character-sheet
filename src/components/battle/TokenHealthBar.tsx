
import React from 'react';
import { Rect, Group, Text } from 'react-konva';

interface TokenHealthBarProps {
  currentHP: number;
  maxHP: number;
  width: number;
  x: number;
  y: number;
  fontSize?: number;
}

const TokenHealthBar: React.FC<TokenHealthBarProps> = ({
  currentHP,
  maxHP,
  width,
  x,
  y,
  fontSize = 12,
}) => {
  // Вычисляем процент оставшегося здоровья
  const healthPercent = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
  const fillWidth = (width * healthPercent) / 100;
  
  // Определяем цвет полоски здоровья
  const getHealthColor = () => {
    if (healthPercent > 66) return '#4CAF50'; // Зеленый
    if (healthPercent > 33) return '#FFEB3B'; // Желтый
    return '#F44336'; // Красный
  };

  return (
    <Group x={x} y={y}>
      {/* Фон полоски здоровья */}
      <Rect
        width={width}
        height={10}
        fill="#333333"
        cornerRadius={5}
        stroke="#000000"
        strokeWidth={1}
      />
      
      {/* Заполненная часть полоски здоровья */}
      <Rect
        width={fillWidth}
        height={8}
        fill={getHealthColor()}
        cornerRadius={4}
        y={1}
        x={1}
      />
      
      {/* Текст со значением здоровья */}
      <Text
        text={`${currentHP}/${maxHP}`}
        fontSize={fontSize}
        fill="white"
        width={width}
        align="center"
        y={-15}
        shadowColor="black"
        shadowBlur={2}
        shadowOffset={{ x: 1, y: 1 }}
        shadowOpacity={0.8}
      />
    </Group>
  );
};

export default TokenHealthBar;
