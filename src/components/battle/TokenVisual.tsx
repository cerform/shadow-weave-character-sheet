import React, { useRef, useEffect } from 'react';
import { getMonsterAvatar } from '@/data/monsterAvatarSystem';

interface Token {
  id: string;
  name: string;
  color: string;
  imageUrl?: string;
  modelUrl?: string;
  modelScale?: number;
}

interface TokenVisualProps {
  token: Token;
  use3D: boolean;
  modelReady: boolean;
  onModelError: (id: string, msg: string) => void;
}

const isValidModelUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
};

// ==================== Компонент отображения токена ====================
export const TokenVisual = React.memo<TokenVisualProps>(({ token, use3D, modelReady, onModelError }) => {
  // Проверяем, что model-viewer определен в customElements
  const isModelViewerDefined = typeof window !== 'undefined' && 
    window.customElements && 
    window.customElements.get('model-viewer');
  
  const can3D = use3D && modelReady && isValidModelUrl(token.modelUrl) && isModelViewerDefined;
  const ref = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!can3D || !ref.current) return;
    const el = ref.current as unknown as HTMLElement & { addEventListener: any; removeEventListener: any };
    const onErr = () => onModelError(token.id, "Ошибка загрузки модели (model-viewer)");
    const onLoad = () => {};
    el.addEventListener("error", onErr); el.addEventListener("load", onLoad);
    return () => { el.removeEventListener("error", onErr); el.removeEventListener("load", onLoad); };
  }, [can3D, token.id, onModelError]);

  if (!can3D) {
    // Сначала проверяем пользовательское изображение
    if (token.imageUrl) {
      return (
        <div className={`w-full h-full ${token.color} bg-opacity-90 flex items-center justify-center overflow-hidden rounded`}>
          <img 
            src={token.imageUrl} 
            alt={token.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Если изображение не загрузилось, показываем эмодзи
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.textContent = getMonsterAvatar(token.name).emoji;
            }}
          />
        </div>
      );
    }
    
    // Затем используем систему аватаров по умолчанию
    const avatarData = getMonsterAvatar(token.name);
    const image = avatarData.image || avatarData.emoji;
    
    if (avatarData.image) {
      // Отображаем изображение
      return (
        <div className={`w-full h-full ${token.color} bg-opacity-90 flex items-center justify-center overflow-hidden rounded`}>
          <img 
            src={avatarData.image} 
            alt={token.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      // Отображаем эмодзи
      return (
        <div className={`w-full h-full ${token.color} bg-opacity-90 flex items-center justify-center text-lg select-none`}>
          {avatarData.emoji}
        </div>
      );
    }
  }
  
  // Fallback if model URL is invalid
  if (!token.modelUrl) {
    return (
      <div className={`w-full h-full ${token.color} bg-opacity-90 flex items-center justify-center text-lg select-none`}>
        ?
      </div>
    );
  }
  
  return (
    <model-viewer
      ref={ref as any}
      src={token.modelUrl}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      autoplay
      exposure={0.9}
      shadow-intensity={0.8}
      interaction-prompt="none"
      camera-controls
      disable-zoom
      ar-modes="webxr scene-viewer quick-look"
      scale={`${token.modelScale ?? 1} ${token.modelScale ?? 1} ${token.modelScale ?? 1}`}
    />
  );
});

TokenVisual.displayName = 'TokenVisual';
