import React, { useCallback } from 'react';

interface MapTextureProps {
  imageUrl: string | null;
  width: number;
  height: number;
  onDrop?: (file: File) => void;
}

export function MapTexture({ imageUrl, width, height, onDrop }: MapTextureProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((f) => f.type.startsWith('image/'));

      if (imageFile && onDrop) {
        onDrop(imageFile);
      }
    },
    [onDrop]
  );

  if (!imageUrl) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-muted transition-colors hover:bg-muted/80"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="text-center text-muted-foreground pointer-events-none">
          <p className="text-lg font-medium">Карта не загружена</p>
          <p className="text-sm">Перетащите изображение сюда</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Battle Map"
      className="absolute inset-0 w-full h-full object-cover pointer-events-auto"
      draggable={false}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ userSelect: 'none' }}
    />
  );
}
