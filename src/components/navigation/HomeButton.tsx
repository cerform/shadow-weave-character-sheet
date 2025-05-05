
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
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
  
  return (
    <Button 
      variant={variant}
      className={`flex items-center gap-2 hover:shadow-[0_0_12px_rgba(var(--theme-accent-rgb),0.6)] ${className}`}
      asChild
      style={{
        '--theme-accent-rgb': currentTheme.accent.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(',')
      } as React.CSSProperties}
    >
      <Link to="/">
        <Shield className="size-4" />
        {showText && <span>На главную</span>}
      </Link>
    </Button>
  );
};

export default HomeButton;
