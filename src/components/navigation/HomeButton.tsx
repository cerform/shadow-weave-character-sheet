
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';

interface HomeButtonProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "outline";
}

const HomeButton: React.FC<HomeButtonProps> = ({ 
  className = "", 
  showText = true,
  variant = "outline"
}) => {
  const { activeTheme } = useUserTheme();
  const themeKey = (activeTheme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Улучшенный стиль кнопки с эффектом свечения
  const buttonStyle = {
    borderColor: currentTheme.accent,
    boxShadow: `0 0 10px ${currentTheme.accent}40`,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1
  } as React.CSSProperties;
  
  const hoverStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    target.style.boxShadow = `0 0 15px ${currentTheme.accent}70`;
    target.style.transform = 'translateY(-2px)';
    target.style.borderColor = currentTheme.accent;
  };
  
  const leaveStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    target.style.boxShadow = buttonStyle.boxShadow as string;
    target.style.transform = 'translateY(0)';
  };
  
  return (
    <Button 
      variant={variant}
      className={`flex items-center gap-2 relative group ${className}`}
      asChild
      style={buttonStyle}
      onMouseEnter={hoverStyle}
      onMouseLeave={leaveStyle}
    >
      <Link to="/">
        <Home className="size-4 relative z-10" />
        {showText && (
          <span className="relative z-10">
            На главную
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </span>
        )}
        
        {/* Эффект свечения при наведении */}
        <span 
          className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-1"
          style={{
            background: `linear-gradient(90deg, transparent, ${currentTheme.accent}40, transparent)`,
          }}
        ></span>
      </Link>
    </Button>
  );
};

export default HomeButton;
