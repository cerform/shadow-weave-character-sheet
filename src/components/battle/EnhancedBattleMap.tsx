import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stage, Layer, Image, Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Token, InitiativeItem } from '@/types/battle'; // Импортируем из types/battle
import TokenComponent from './TokenComponent';
import GridOverlay from './GridOverlay';

interface EnhancedBattleMapProps {
  backgroundImage: string | null;
  tokens: Token[];
  selectedTokenId: number | null;
  onSelectToken: (id: number | null) => void;
  onUpdateTokenPosition: (id: number, x: number, y: number) => void;
  gridVisible: boolean;
  gridSize: { rows: number; cols: number };
  zoom: number;
  fogOfWar: boolean;
  revealedAreas: { x: number; y: number; radius: number }[];
  isDM?: boolean;
}

const EnhancedBattleMap: React.FC<EnhancedBattleMapProps> = ({
  backgroundImage,
  tokens,
  selectedTokenId,
  onSelectToken,
  onUpdateTokenPosition,
  gridVisible,
  gridSize,
  zoom,
  fogOfWar,
  revealedAreas,
  isDM = true
}) => {
  const stageRef = useRef<any>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  
  // Load background image
  useEffect(() => {
    if (backgroundImage) {
      const img = new Image();
      img.src = backgroundImage;
      img.onload = () => {
        setImageElement(img);
      };
    } else {
      setImageElement(null);
    }
  }, [backgroundImage]);
  
  // Update stage size on zoom or grid size change
  useEffect(() => {
    const calculateStageSize = () => {
      const width = gridSize.cols * 100 * zoom;
      const height = gridSize.rows * 100 * zoom;
      setStageSize({ width, height });
    };
    
    calculateStageSize();
  }, [gridSize, zoom]);
  
  // Handle token drag and drop
  const handleTokenDragEnd = (e: KonvaEventObject<any>, id: number) => {
    const x = Math.round(e.target.x() / (100 * zoom)) * 100 * zoom;
    const y = Math.round(e.target.y() / (100 * zoom)) * 100 * zoom;
    onUpdateTokenPosition(id, x, y);
  };
  
  // Handle stage click to select tokens
  const handleStageClick = (e: KonvaEventObject<any>) => {
    if (e.target === stageRef.current) {
      onSelectToken(null);
    }
  };
  
  return (
    <div className="relative">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        onClick={handleStageClick}
      >
        <Layer>
          {imageElement && (
            <Image
              image={imageElement}
              width={stageSize.width}
              height={stageSize.height}
            />
          )}
          {gridVisible && (
            <GridOverlay
              rows={gridSize.rows}
              cols={gridSize.cols}
              width={stageSize.width}
              height={stageSize.height}
              zoom={zoom}
            />
          )}
          {fogOfWar && (
            <motion.Rect
              x={0}
              y={0}
              width={stageSize.width}
              height={stageSize.height}
              fill="black"
              opacity={0.8}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.3 }}
            />
          )}
          {fogOfWar && revealedAreas && revealedAreas.map((area, index) => (
            <Circle
              key={index}
              x={area.x}
              y={area.y}
              radius={area.radius * zoom}
              fill="white"
              opacity={1}
              blendMode="destination-out"
            />
          ))}
          {tokens.map((token) => (
            <TokenComponent
              key={token.id}
              token={token}
              isSelected={selectedTokenId === token.id}
              onSelect={() => onSelectToken(token.id)}
              onDragEnd={(e) => handleTokenDragEnd(e, token.id)}
              draggable={isDM}
              zoom={zoom}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default EnhancedBattleMap;
