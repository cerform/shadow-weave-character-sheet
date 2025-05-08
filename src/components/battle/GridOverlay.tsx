
import React from 'react';
import { Line, Group } from 'react-konva';

interface GridOverlayProps {
  rows: number;
  cols: number;
  width: number;
  height: number;
  zoom: number;
}

const GridOverlay: React.FC<GridOverlayProps> = ({
  rows,
  cols,
  width,
  height,
  zoom
}) => {
  const cellWidth = width / cols;
  const cellHeight = height / rows;
  
  const lines = [];
  
  // Горизонтальные линии
  for (let i = 0; i <= rows; i++) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i * cellHeight, width, i * cellHeight]}
        stroke="rgba(200, 200, 200, 0.3)"
        strokeWidth={1}
      />
    );
  }
  
  // Вертикальные линии
  for (let i = 0; i <= cols; i++) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i * cellWidth, 0, i * cellWidth, height]}
        stroke="rgba(200, 200, 200, 0.3)"
        strokeWidth={1}
      />
    );
  }

  return (
    <Group>
      {lines}
    </Group>
  );
};

export default GridOverlay;
