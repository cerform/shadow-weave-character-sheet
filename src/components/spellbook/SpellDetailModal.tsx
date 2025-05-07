
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { CharacterSpell } from '@/types/character';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useTheme } from '@/hooks/use-theme';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SpellDetailModalProps {
  children: React.ReactNode;
  spell: CharacterSpell;
}

export const SpellDetailModal: React.FC<SpellDetailModalProps> = ({ children, spell }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { themeStyles } = useTheme();

  // Геттер для отображения уровня заклинания
  const getLevelDisplay = () => {
    return spell.level === 0 ? 'Заговор' : `${spell.level} уровень`;
  };

  // Определяем класс школы заклинания для стилей
  const getSchoolColor = () => {
    const schools: Record<string, string> = {
      'Ограждение': 'bg-blue-700',
      'Вызов': 'bg-purple-700',
      'Прорицание': 'bg-cyan-700',
      'Очарование': 'bg-pink-700',
      'Воплощение': 'bg-red-700',
      'Иллюзия': 'bg-indigo-700',
      'Некромантия': 'bg-green-700',
      'Преобразование': 'bg-yellow-700',
      'Познание': 'bg-orange-700',
    };
    return schools[spell.school] || 'bg-gray-700';
  };

  // Общий контент диалога
  const Content = () => (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className={`${getSchoolColor()} text-white`}>
          {spell.school}
        </Badge>
        <span className="text-sm">{getLevelDisplay()}</span>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <h4 className="text-sm font-medium opacity-70">Время накладывания</h4>
            <p>{spell.castingTime}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium opacity-70">Дистанция</h4>
            <p>{spell.range}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium opacity-70">Компоненты</h4>
            <p>{spell.components}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium opacity-70">Длительность</h4>
            <p>{spell.duration}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium opacity-70">Классы</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {spell.classes?.map((className) => (
              <Badge key={className} variant="secondary" className="text-xs">
                {className}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium opacity-70">Дополнительно</h4>
          <div className="flex gap-x-4 gap-y-1 flex-wrap mt-1">
            {spell.ritual && (
              <span className="text-sm">Ритуал</span>
            )}
            {spell.concentration && (
              <span className="text-sm">Концентрация</span>
            )}
            {spell.verbal && (
              <span className="text-sm">Вербальный</span>
            )}
            {spell.somatic && (
              <span className="text-sm">Соматический</span>
            )}
            {spell.material && (
              <span className="text-sm">Материальный</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium opacity-70">Описание</h4>
          <p className="mt-1 whitespace-pre-line">{spell.description}</p>
        </div>
      </div>
    </>
  );

  // Мобильный вариант использует Drawer (выдвижную панель снизу)
  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          {children}
        </DrawerTrigger>
        <DrawerContent style={{ 
          backgroundColor: themeStyles?.cardBackground || 'rgba(0, 0, 0, 0.95)',
          borderTop: `2px solid ${themeStyles?.accent || '#8B5A2B'}`
        }}>
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle className="text-xl">{spell.name}</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          
          <ScrollArea className="h-[70vh] px-4 pb-8">
            <Content />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  // Десктопный вариант использует Dialog (модальное окно)
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto" style={{ 
        backgroundColor: themeStyles?.cardBackground || 'rgba(0, 0, 0, 0.95)',
        borderColor: themeStyles?.accent || '#8B5A2B' 
      }}>
        <DialogHeader>
          <DialogTitle className="text-xl">{spell.name}</DialogTitle>
        </DialogHeader>
        <Content />
      </DialogContent>
    </Dialog>
  );
};
