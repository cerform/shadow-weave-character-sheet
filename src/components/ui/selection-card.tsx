
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface SelectionCardProps {
  title: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
  badges?: React.ReactNode;
  subOptions?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  description,
  selected = false,
  onClick,
  badges,
  subOptions,
  className,
  disabled = false,
  children,
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        "relative p-5 rounded-lg border transition-all duration-300",
        "hover:shadow-md hover:border-primary/50 cursor-pointer",
        selected ? "border-primary ring-1 ring-primary bg-primary/10" : "border-border/50 bg-card/30",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      style={{
        borderColor: selected ? currentTheme.accent : undefined,
        boxShadow: selected ? `0 0 10px ${currentTheme.accent}40` : undefined,
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-foreground">{title}</h3>
        {selected && <Check className="text-primary h-5 w-5" />}
      </div>
      
      {badges && <div className="flex flex-wrap gap-1.5 mb-2">{badges}</div>}
      
      {description && (
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
      )}
      
      {children}
      
      {subOptions && <div className="mt-3">{subOptions}</div>}
    </div>
  );
};

export const SelectionCardBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <span 
      className={cn(
        "px-2 py-1 text-xs rounded bg-primary/20 text-foreground inline-block",
        className
      )}
    >
      {children}
    </span>
  );
};

export const SelectionCardGrid: React.FC<{
  children: React.ReactNode;
  cols?: number;
  className?: string;
}> = ({ children, cols = 2, className }) => {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 md:grid-cols-2",
        cols === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SelectionSubOption: React.FC<{
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ label, selected = false, onClick, className }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded text-sm font-medium transition-all",
        selected 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "bg-secondary/50 hover:bg-secondary text-foreground",
        className
      )}
      style={{
        backgroundColor: selected ? currentTheme.accent : undefined,
        color: selected ? '#fff' : undefined,
      }}
    >
      {label}
    </button>
  );
};

export const SelectionSubOptionsContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {children}
    </div>
  );
};

export default SelectionCard;
