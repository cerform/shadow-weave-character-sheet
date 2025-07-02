
import React, { ReactNode, useEffect, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface BackgroundWrapperProps {
  children: ReactNode;
  withOverlay?: boolean;
  opacity?: number;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ 
  children, 
  withOverlay = true,
  opacity = 0.8
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: currentTheme.background,
        backgroundImage: `url('/lovable-uploads/fedf4d87-93ed-4c26-a401-c2ced1b62cdd.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Накладываем тематический градиент поверх фона */}
      {withOverlay && (
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{ 
            background: currentTheme.backgroundGradient || 
              `linear-gradient(to bottom, rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, ${opacity - 0.1}))`,
            opacity: opacity
          }}
        />
      )}
      
      {/* Контент страницы */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;
