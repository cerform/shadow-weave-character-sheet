
import React, { useState } from 'react';
import { Dices } from 'lucide-react';
import { 
  Drawer, 
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { PlayerDicePanel } from '@/components/character-sheet/PlayerDicePanel';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useMediaQuery } from '@/hooks/use-media-query';

const DiceDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const currentThemeId = theme || 'default';
  const currentTheme = themes[currentThemeId as keyof typeof themes] || themes.default;
  
  // Определяем, используем ли мобильное устройство
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  // Стили для кнопки открытия панели кубиков
  const buttonStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: currentTheme.accent,
    color: currentTheme.textColor,
    boxShadow: `0 0 8px ${currentTheme.accent}50`,
  };

  // Стиль для контента панели
  const contentStyle = {
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    borderLeft: `2px solid ${currentTheme.accent}`,
    borderBottom: `2px solid ${currentTheme.accent}`,
    boxShadow: `0 0 15px ${currentTheme.accent}30`,
  };

  // В зависимости от разрешения экрана используем Drawer (мобильные) или Sheet (десктоп)
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            style={buttonStyle}
            className="relative"
          >
            <Dices className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            <span className="sr-only">Открыть кубики</span>
            <div 
              className="absolute bottom-0 right-0 h-2 w-2 rounded-full" 
              style={{ backgroundColor: currentTheme.accent }}
            />
          </Button>
        </DrawerTrigger>
        <DrawerContent style={{ backgroundColor: 'rgba(15, 15, 15, 0.95)' }}>
          <DrawerHeader>
            <DrawerTitle style={{ color: currentTheme.textColor }}>Кубики</DrawerTitle>
            <DrawerDescription style={{ color: `${currentTheme.textColor}80` }}>
              Бросайте кубики и отслеживайте результаты
            </DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="h-[60vh] px-4">
            <PlayerDicePanel />
          </ScrollArea>
          <DrawerFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseDrawer}
              style={{ borderColor: currentTheme.accent, color: currentTheme.textColor }}
            >
              Закрыть
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          style={buttonStyle}
          className="relative"
        >
          <Dices className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Открыть кубики</span>
          <div 
            className="absolute bottom-0 right-0 h-2 w-2 rounded-full" 
            style={{ backgroundColor: currentTheme.accent }}
          />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        style={contentStyle}
        className="w-[400px] sm:w-[540px] md:w-[600px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle style={{ color: currentTheme.textColor }}>Кубики</SheetTitle>
          <SheetDescription style={{ color: `${currentTheme.textColor}80` }}>
            Бросайте кубики и отслеживайте результаты
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-180px)] px-4 py-6">
          <PlayerDicePanel />
        </ScrollArea>
        <SheetFooter>
          <Button 
            variant="outline" 
            onClick={handleCloseDrawer}
            style={{ borderColor: currentTheme.accent, color: currentTheme.textColor }}
          >
            Закрыть
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default DiceDrawer;
