
import React, { ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

interface MobileOptimizedLayoutProps {
  children: ReactNode;
  title: string;
  headerContent?: ReactNode;
  sidebarContent?: ReactNode;
  withBottomPadding?: boolean;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  title,
  headerContent,
  sidebarContent,
  withBottomPadding = true
}) => {
  const { themeStyles } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  return (
    <BackgroundWrapper>
      <div className={`min-h-screen ${withBottomPadding ? 'pb-20' : 'py-2'}`}>
        <div className="container mx-auto px-2">
          <header className="mb-4 flex justify-between items-center sticky top-0 z-10 py-2 bg-background/80 backdrop-blur-sm">
            <h1 
              className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold truncate`}
              style={{ color: themeStyles?.textColor }}
            >
              {title}
            </h1>
            
            {sidebarContent && isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="ml-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <div className="flex flex-col space-y-4 mt-6">
                    {sidebarContent}
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <div className="flex items-center space-x-2">
                {headerContent}
              </div>
            )}
          </header>
          
          {children}
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default MobileOptimizedLayout;
