
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dices } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { PlayerDicePanel } from './components/character-sheet/PlayerDicePanel';

export const AppDiceButton: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Исключаем страницы, на которых не нужно показывать плавающую кнопку кубиков
  const excludedPaths = [
    '/auth' // Можно добавить другие пути, где кнопка не нужна
  ];
  
  // Проверяем, не находимся ли мы на странице из исключений
  const shouldRenderButton = !excludedPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  
  if (!shouldRenderButton) {
    return null;
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <Button 
          size="lg" 
          className="rounded-full shadow-lg" 
          style={{ 
            width: '80px', // Увеличено с 70px до 80px
            height: '80px', // Увеличено с 70px до 80px
            backgroundColor: `${currentTheme.accent}`,
            color: currentTheme.textColor,
            boxShadow: `0 0 20px ${currentTheme.accent}80` // Добавлено свечение для кнопки
          }}
          onClick={() => setIsOpen(true)}
        >
          <Dices className="h-12 w-12" /> {/* Увеличено с 10 до 12 */}
        </Button>
        
        <SheetContent side="right" className="sm:max-w-md md:max-w-lg w-[95%] bg-black/95 border-white/20 p-0 pt-4">
          <SheetHeader className="px-6">
            <SheetTitle className="text-white text-2xl font-bold">Кубики</SheetTitle>
            <SheetDescription className="text-white/90 text-base">
              Используйте виртуальные кубики для бросков
            </SheetDescription>
          </SheetHeader>
          <div className="py-2 h-[calc(100vh-120px)] overflow-y-auto px-6"> {/* Увеличен боковой отступ с 4 до 6 */}
            <PlayerDicePanel />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AppDiceButton;
