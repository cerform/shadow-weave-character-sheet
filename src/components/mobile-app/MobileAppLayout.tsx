
import React, { ReactNode } from 'react';
import ResponsiveNavBar from '@/components/layout/ResponsiveNavBar';
import { useTheme } from '@/hooks/use-theme';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileAppLayoutProps {
  children: ReactNode;
  className?: string;
  fullHeight?: boolean;
}

const MobileAppLayout: React.FC<MobileAppLayoutProps> = ({ 
  children, 
  className = "",
  fullHeight = false
}) => {
  const { themeStyles } = useTheme();
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-background/90 to-background"
      style={{
        backgroundImage: `linear-gradient(to bottom, 
          ${themeStyles?.accent}10, 
          ${themeStyles?.cardBackground || 'var(--background)'}
        )`
      }}
    >
      <ResponsiveNavBar />
      
      <main className={`container mx-auto px-4 py-6 ${fullHeight ? 'h-[calc(100vh-3.5rem)]' : ''} ${className}`}>
        {fullHeight ? (
          <ScrollArea className="h-full rounded-lg">
            <div className="p-1">
              {children}
            </div>
          </ScrollArea>
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default MobileAppLayout;
