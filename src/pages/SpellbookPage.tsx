
import React from 'react';
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import { useTheme } from '@/hooks/use-theme';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const SpellbookPage: React.FC = () => {
  const { themeStyles } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Мобильная версия с боковым меню
  if (isMobile) {
    return (
      <BackgroundWrapper>
        <div className="min-h-screen py-2">
          <div className="container mx-auto px-2">
            <header className="mb-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold truncate" style={{ color: themeStyles?.textColor }}>
                Книга заклинаний
              </h1>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="ml-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <div className="flex flex-col space-y-4 mt-6">
                    <ThemeSelector />
                    <SheetClose asChild>
                      <div>
                        <NavigationButtons />
                      </div>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </header>
            
            <SpellBookViewer />
          </div>
        </div>
        <FloatingDiceButton />
      </BackgroundWrapper>
    );
  }

  // Десктопная версия (оставляем как есть)
  return (
    <BackgroundWrapper>
      <div className="min-h-screen py-4">
        <div className="container mx-auto px-4">
          <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-3xl font-bold mb-4 sm:mb-0" style={{ color: themeStyles?.textColor }}>
              Книга заклинаний D&D 5e
            </h1>
            <div className="flex items-center space-x-4">
              <ThemeSelector />
              <NavigationButtons />
            </div>
          </header>
          
          <SpellBookViewer />
        </div>
      </div>
      <FloatingDiceButton />
    </BackgroundWrapper>
  );
};

export default SpellbookPage;
