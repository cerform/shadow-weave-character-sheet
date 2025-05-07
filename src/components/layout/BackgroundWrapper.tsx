
import React, { ReactNode } from 'react';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';

interface BackgroundWrapperProps {
  children: ReactNode;
  className?: string;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children, className = '' }) => {
  const { activeTheme, currentTheme } = useUserTheme();
  const themeKey = (activeTheme || 'default') as keyof typeof themes;
  const theme = currentTheme || themes[themeKey] || themes.default;

  return (
    <div 
      className={`min-h-screen flex flex-col ${className}`}
      style={{
        background: `linear-gradient(to bottom, ${theme.background}, ${theme.cardBackground || 'rgba(0, 0, 0, 0.8)'})`,
        color: theme.textColor,
        backgroundAttachment: 'fixed',
      }}
    >
      {children}
    </div>
  );
};

export default BackgroundWrapper;
