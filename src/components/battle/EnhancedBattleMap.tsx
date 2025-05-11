
import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Group } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Token, InitiativeItem, EnhancedBattleMapProps } from '@/types/battle';
import TokenComponent from './TokenComponent';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const EnhancedBattleMap: React.FC<EnhancedBattleMapProps> = ({
  tokens,
  updateTokenPosition,
  background,
  width = 800,
  height = 600,
  gridSize = 50,
  initiative = [],
  selectedTokenId = null,
  onSelectToken,
  battleActive = false,
  fogOfWar = false,
  revealedCells = [],
  onRevealCell,
  gridVisible = true,
  gridOpacity = 0.3,
  zoom = 1,
  isDM = false,
  lightSources = [],
  isDynamicLighting = false,
  className = "",
  showPlayerView = false
}) => {
  const stageRef = useRef<any>(null);
  const [internalSelectedTokenId, setInternalSelectedTokenId] = useState<number | null>(selectedTokenId);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Find the active token in initiative
  const activeToken = tokens.find(token => {
    return initiative.some(init => init.tokenId === token.id && init.isActive);
  });

  // Handle token selection
  const handleTokenClick = (id: number) => {
    const newSelectedId = id === internalSelectedTokenId ? null : id;
    setInternalSelectedTokenId(newSelectedId);
    
    if (onSelectToken) {
      onSelectToken(newSelectedId);
    }
  };

  // Handle token position update
  const handleTokenDragEnd = (id: number, e: KonvaEventObject<DragEvent>) => {
    const pos = e.target.position();
    
    // Snap to grid if gridSize is provided
    if (gridSize) {
      const snappedX = Math.round(pos.x / gridSize) * gridSize;
      const snappedY = Math.round(pos.y / gridSize) * gridSize;
      updateTokenPosition(id, snappedX, snappedY);
      return;
    }
    
    updateTokenPosition(id, pos.x, pos.y);
  };
  
  // Draw grid
  const renderGrid = () => {
    if (!gridSize || !gridVisible) return null;
    
    const gridLines = [];
    
    // Horizontal lines
    for (let y = 0; y < height; y += gridSize) {
      gridLines.push(
        <Rect
          key={`h-${y}`}
          x={0}
          y={y}
          width={width}
          height={1}
          fill={`rgba(255, 255, 255, ${gridOpacity})`}
        />
      );
    }
    
    // Vertical lines
    for (let x = 0; x < width; x += gridSize) {
      gridLines.push(
        <Rect
          key={`v-${x}`}
          x={x}
          y={0}
          width={1}
          height={height}
          fill={`rgba(255, 255, 255, ${gridOpacity})`}
        />
      );
    }
    
    return <Group>{gridLines}</Group>;
  };

  // Create a backgroundPatternImage only if we have a background string
  let backgroundImage = null;
  if (background) {
    const image = new Image();
    image.src = background;
    backgroundImage = image;
  }

  return (
    <motion.div 
      className={`relative border border-accent rounded-lg overflow-hidden ${className}`}
      style={{ borderColor: currentTheme.accent }}
    >
      <Stage width={width} height={height} ref={stageRef}>
        <Layer>
          {/* Background */}
          {backgroundImage && (
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fillPatternImage={backgroundImage}
              fillPatternRepeat="no-repeat"
              fillPatternScale={{ x: 1, y: 1 }}
            />
          )}
          
          {/* Grid */}
          {renderGrid()}
          
          {/* Tokens */}
          {tokens.map((token) => {
            const isActive = initiative.some(
              (init) => init.tokenId === token.id && init.isActive
            );
            
            return (
              <Group
                key={token.id}
                x={token.x}
                y={token.y}
                draggable
                onDragEnd={(e) => handleTokenDragEnd(token.id, e)}
                onClick={() => handleTokenClick(token.id)}
                onTap={() => handleTokenClick(token.id)}
              >
                <TokenComponent
                  token={token}
                  isSelected={token.id === (selectedTokenId ?? internalSelectedTokenId)}
                  isActive={isActive}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </motion.div>
  );
};

export default EnhancedBattleMap;
