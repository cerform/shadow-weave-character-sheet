import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FogRenderer } from './fog/FogRenderer';
import { FogInteractionLayer } from './fog/FogInteractionLayer';
import { useFogOfWarCanvas } from '@/hooks/combat/useFogOfWarCanvas';
import type { LightSource, TokenPosition, FogRenderConfig } from '@/types/fog';

interface FogOfWarProps {
  gridSize: { rows: number; cols: number };
  revealedCells: { [key: string]: boolean };
  onRevealCell: (row: number, col: number) => void;
  active: boolean;
  lightSources?: LightSource[];
  tokenPositions?: TokenPosition[];
  isDM?: boolean;
  isDynamicLighting?: boolean;
  imageSize?: { width: number; height: number };
  showFullFogForPlayers?: boolean; // Показывать полный туман для игроков
}

const defaultRenderConfig: FogRenderConfig = {
  darknesOpacity: 0.85,
  revealOpacity: 0.9,
  lightSourceOpacity: 0.95,
  gradientIntensity: 0.8
};

export default function FogOfWar({
  gridSize,
  revealedCells,
  onRevealCell,
  active,
  lightSources = [],
  tokenPositions = [],
  isDM = false,
  isDynamicLighting = false,
  imageSize,
  showFullFogForPlayers = false
}: FogOfWarProps) {
  const [renderer, setRenderer] = useState<FogRenderer | null>(null);
  const [selectedArea, setSelectedArea] = useState<{
    startX: number; startY: number; endX: number; endY: number;
  } | null>(null);

  const {
    canvasRef,
    canvasState,
    getMouseGridPosition,
    getPixelPosition,
    getCellsInArea
  } = useFogOfWarCanvas({
    gridRows: gridSize.rows,
    gridCols: gridSize.cols,
    imageSize
  });

  // Создание рендерера при готовности canvas
  useEffect(() => {
    if (canvasRef.current && canvasState.width > 0 && canvasState.height > 0) {
      try {
        const fogRenderer = new FogRenderer(canvasRef.current, defaultRenderConfig);
        setRenderer(fogRenderer);
      } catch (error) {
        console.error('Failed to create FogRenderer:', error);
      }
    }
  }, [canvasState.width, canvasState.height]);

  // Основной рендеринг
  useEffect(() => {
    console.log('🌫️ FogOfWar: render effect triggered', {
      renderer: !!renderer,
      active,
      canvasState,
      revealedCellsCount: Object.keys(revealedCells).length,
      lightSourcesCount: lightSources.length,
      tokenPositionsCount: tokenPositions.length
    });

    if (!renderer || !active || canvasState.width === 0 || canvasState.height === 0) {
      console.log('🚫 FogOfWar: skipping render', {
        hasRenderer: !!renderer,
        active,
        canvasWidth: canvasState.width,
        canvasHeight: canvasState.height
      });
      return;
    }

    const renderFrame = () => {
      console.log('🎨 FogOfWar: actually rendering', { showFullFogForPlayers, isDM });
      
      // Для игроков с включенным showFullFogForPlayers показываем полный туман
      const effectiveRevealedCells = (showFullFogForPlayers && !isDM) 
        ? {} // Пустой объект = все ячейки под туманом
        : revealedCells;
      
      renderer.render(
        canvasState,
        effectiveRevealedCells,
        lightSources,
        tokenPositions,
        isDM,
        isDynamicLighting,
        selectedArea
      );
    };

    renderFrame();
  }, [
    renderer,
    active,
    canvasState,
    revealedCells,
    lightSources,
    tokenPositions,
    isDM,
    isDynamicLighting,
    selectedArea,
    showFullFogForPlayers
  ]);

  // Обработка клика по ячейке
  const handleCellClick = useCallback((row: number, col: number) => {
    console.log('✨ FogOfWar: Cell clicked', { row, col });
    onRevealCell(row, col);
  }, [onRevealCell]);

  // Обработка выделения области
  const handleAreaSelect = useCallback((cells: Array<{ row: number; col: number }>) => {
    console.log('📦 FogOfWar: Area selected', { cellCount: cells.length, cells });
    cells.forEach(cell => {
      onRevealCell(cell.row, cell.col);
    });
  }, [onRevealCell]);

  // Мемоизированные стили
  const canvasStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'fill' as const,
    pointerEvents: active ? 'auto' as const : 'none' as const
  }), [active]);

  if (!active) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10">
      {/* Canvas для рендеринга тумана */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        width={canvasState.width}
        height={canvasState.height}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'fill'
        }}
      />
      
      {/* Слой взаимодействия */}
      <FogInteractionLayer
        canvasRef={canvasRef}
        canvasState={canvasState}
        active={active}
        onCellClick={handleCellClick}
        onAreaSelect={handleAreaSelect}
        getMouseGridPosition={getMouseGridPosition}
        getCellsInArea={getCellsInArea}
        onSelectionChange={setSelectedArea}
      />
    </div>
  );
}