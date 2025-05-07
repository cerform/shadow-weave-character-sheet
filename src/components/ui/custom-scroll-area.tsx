
import React from 'react';
import { ScrollArea as BaseScrollArea } from '@/components/ui/scroll-area';

interface CustomScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

// Обертка для ScrollArea, которая правильно обрабатывает children
export const CustomScrollArea: React.FC<CustomScrollAreaProps> = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <BaseScrollArea className={className} {...props}>
      <div className="p-1">
        {children}
      </div>
    </BaseScrollArea>
  );
};

export default CustomScrollArea;
