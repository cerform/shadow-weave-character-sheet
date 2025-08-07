import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';

interface HomeButtonProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "outline";
}

const HomeButton: React.FC<HomeButtonProps> = ({ className = "", showText = true, variant = "default" }) => {
  const { themeStyles } = useTheme();
  
  return (
    <Button 
      variant={variant}
      className={`inline-flex items-center gap-2 transition-colors ${className}`}
      style={{ 
        color: themeStyles?.textColor || '#E2E8F0',
        borderColor: variant === "outline" ? themeStyles?.accent || '#8B5CF6' : 'transparent'
      }}
      asChild
    >
      <Link to="/">
        <Shield className="w-4 h-4" />
        {showText && <span>На главную</span>}
      </Link>
    </Button>
  );
};

export default HomeButton;