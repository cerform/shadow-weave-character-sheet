
import React, { ReactNode } from 'react';
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
      className="min-h-screen"
      style={{ 
        backgroundImage: withOverlay 
          ? `linear-gradient(to bottom, rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, ${opacity - 0.1})), url('/lovable-uploads/91719f56-2b3a-49c7-904f-35af06f9d3b3.png')`
          : `url('/lovable-uploads/91719f56-2b3a-49c7-904f-35af06f9d3b3.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        color: currentTheme.textColor
      }}
    >
      {children}
    </div>
  );
};

export default BackgroundWrapper;
