
import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/use-theme';

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  variant = 'primary',
  position = 'bottom-right',
  className
}) => {
  const { themeStyles } = useTheme();
  
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };
  
  const variantStyles = {
    primary: {
      bg: themeStyles?.accent || '#8B5A2B',
      text: '#FFFFFF',
      border: themeStyles?.accent || '#8B5A2B'
    },
    secondary: {
      bg: 'transparent',
      text: themeStyles?.textColor || '#FFFFFF',
      border: themeStyles?.accent || '#8B5A2B'
    },
    outline: {
      bg: 'transparent',
      text: themeStyles?.accent || '#8B5A2B',
      border: themeStyles?.accent || '#8B5A2B'
    }
  };
  
  const currentStyle = variantStyles[variant];
  
  return (
    <Button
      className={cn(
        "fixed shadow-lg z-50 flex items-center gap-2 rounded-full px-4 py-6 transition-all duration-300 animate-fade-in",
        positionClasses[position],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: currentStyle.bg,
        color: currentStyle.text,
        borderColor: currentStyle.border,
        boxShadow: `0 4px 12px ${themeStyles?.accent}40`
      }}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
};

export default FloatingActionButton;
