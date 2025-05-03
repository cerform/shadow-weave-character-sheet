
import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  return (
    <div className={cn("mb-6", className)}>
      <h2 
        className={cn("text-2xl font-bold mb-2", titleClassName)}
        style={{ color: currentTheme.textColor || 'inherit' }}
      >
        {title}
      </h2>
      
      {description && (
        <p className={cn("text-muted-foreground", descriptionClassName)}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
