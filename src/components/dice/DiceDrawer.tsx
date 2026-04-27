
import React, { useState } from 'react';
import { Dice6, X } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const DiceDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const currentThemeId = theme || 'default';
  const currentTheme = themes[currentThemeId as keyof typeof themes] || themes.default;
  
  // Определяем, используем ли мобильное устройство
  const isMobile = useIsMobile();

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  // Стили для кнопки открытия панели кубиков
  const buttonStyle = {
    backgroundColor: 'rgba(5, 5, 10, 0.8)',
    borderColor: '#a855f7', // Purple-500
    color: '#d8b4fe', // Purple-300
    boxShadow: `0 0 15px rgba(168, 85, 247, 0.4)`,
    borderWidth: '2px'
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  style={buttonStyle}
                  className="relative hover:shadow-lg transition-all hover:scale-105"
                >
                  <Dice6 className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="sr-only">Открыть кубики</span>
                  <div 
                    className="absolute bottom-0 right-0 h-2 w-2 rounded-full" 
                    style={{ backgroundColor: currentTheme.accent }}
                  />
                </Button>
              </DrawerTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Кубики</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DrawerContent style={{ backgroundColor: 'rgba(15, 15, 15, 0.95)' }}>
          <div className="flex justify-between items-center px-4 pt-4">
            <DrawerHeader className="p-0">
              <DrawerTitle style={{ color: currentTheme.textColor }}>Кубики</DrawerTitle>
              <DrawerDescription style={{ color: `${currentTheme.textColor}80` }}>
                Бросайте кубики и отслеживайте результаты
              </DrawerDescription>
            </DrawerHeader>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCloseDrawer}
              style={{ color: currentTheme.accent }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-120px)] px-4">
            <PlayerDicePanel />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                style={buttonStyle}
                className="relative hover:shadow-lg transition-all hover:scale-105"
              >
                <Dice6 className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="sr-only">Открыть кубики</span>
                <div 
                  className="absolute bottom-0 right-0 h-2 w-2 rounded-full" 
                  style={{ backgroundColor: currentTheme.accent }}
                />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Кубики</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SheetContent 
        side="right" 
        style={contentStyle}
        className="w-[350px] sm:w-[400px] md:w-[450px] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-2">
          <SheetHeader className="p-0">
            <SheetTitle style={{ color: currentTheme.textColor }}>Кубики</SheetTitle>
            <SheetDescription style={{ color: `${currentTheme.textColor}80` }}>
              Бросайте кубики и отслеживайте результаты
            </SheetDescription>
          </SheetHeader>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCloseDrawer}
            style={{ color: currentTheme.accent }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <PlayerDicePanel />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default DiceDrawer;
