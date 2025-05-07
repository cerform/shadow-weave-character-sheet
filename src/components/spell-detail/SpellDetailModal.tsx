
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, Book, Clock, Target, Component, Timer, Sparkles, Zap, Users } from 'lucide-react';
import { SpellData } from '@/types/spells';

interface SpellDetailModalProps {
  spell: SpellData;
  open: boolean;
  onClose: () => void;
  currentTheme: any;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({
  spell,
  open,
  onClose,
  currentTheme
}) => {
  const getLevelName = (level: number) => {
    return level === 0 ? 'Заговор' : `${level} уровень`;
  };
  
  // Получение цвета для уровня заклинания из текущей темы
  const getLevelColor = (level: number) => {
    if (currentTheme.spellLevels && currentTheme.spellLevels[level]) {
      return currentTheme.spellLevels[level];
    }
    // Запасные цвета, если в теме не определены
    const fallbackColors: Record<number, string> = {
      0: '#6b7280', // gray-500
      1: '#3b82f6', // blue-500
      2: '#8b5cf6', // violet-500
      3: '#ec4899', // pink-500
      4: '#f97316', // orange-500
      5: '#ef4444', // red-500
      6: '#14b8a6', // teal-500
      7: '#6366f1', // indigo-500
      8: '#ca8a04', // yellow-600
      9: '#059669'  // emerald-600
    };
    return fallbackColors[level] || '#6b7280';
  };
  
  // Форматирование описания
  const renderDescription = () => {
    if (!spell.description) return <p>Нет описания</p>;
    
    if (typeof spell.description === 'string') {
      return (
        <p style={{ color: currentTheme.textColor }}>
          {spell.description}
        </p>
      );
    }
    
    if (Array.isArray(spell.description)) {
      return spell.description.map((paragraph, index) => (
        <p key={index} className="mb-3" style={{ color: currentTheme.textColor }}>
          {paragraph}
        </p>
      ));
    }
    
    return <p>Невозможно отобразить описание</p>;
  };
  
  // Форматирование классов
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return "Нет информации";
    if (typeof classes === 'string') return classes;
    return classes.join(', ');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] p-0 overflow-hidden"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          borderColor: currentTheme.accent,
          boxShadow: `0 0 20px ${currentTheme.accent}30`
        }}
      >
        <div
          className="h-2 w-full"
          style={{ backgroundColor: getLevelColor(spell.level) }}
        />
        
        <DialogHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle 
                className="text-2xl font-bold flex items-center gap-2"
                style={{ color: currentTheme.textColor }}
              >
                {spell.name}
                <Badge
                  className="ml-2"
                  style={{ 
                    backgroundColor: getLevelColor(spell.level),
                    color: '#fff',
                    boxShadow: `0 0 5px ${getLevelColor(spell.level)}80`
                  }}
                >
                  {getLevelName(spell.level)}
                </Badge>
              </DialogTitle>
              
              <DialogDescription className="text-base mt-1" style={{ color: currentTheme.accent }}>
                {spell.school}
                {(spell.ritual || spell.concentration) && (
                  <span className="ml-2">
                    {spell.ritual && (
                      <Badge variant="outline" className="mr-1" style={{ borderColor: currentTheme.accent }}>
                        <Book className="h-3 w-3 mr-1" style={{ color: currentTheme.accent }} />
                        <span style={{ color: currentTheme.accent }}>Ритуал</span>
                      </Badge>
                    )}
                    {spell.concentration && (
                      <Badge variant="outline" style={{ borderColor: currentTheme.accent }}>
                        <Sparkles className="h-3 w-3 mr-1" style={{ color: currentTheme.accent }} />
                        <span style={{ color: currentTheme.accent }}>Концентрация</span>
                      </Badge>
                    )}
                  </span>
                )}
              </DialogDescription>
            </div>
            
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onClose}
              style={{ color: currentTheme.accent }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <Separator style={{ backgroundColor: currentTheme.accent + '30' }} />
        
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-xs uppercase font-semibold" style={{ color: currentTheme.accent }}>
              Время накладывания
            </div>
            <div className="flex items-center" style={{ color: currentTheme.textColor }}>
              <Clock className="h-4 w-4 mr-1" style={{ color: currentTheme.accent + '80' }} />
              <span>{spell.castingTime || 'Не указано'}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs uppercase font-semibold" style={{ color: currentTheme.accent }}>
              Дистанция
            </div>
            <div className="flex items-center" style={{ color: currentTheme.textColor }}>
              <Target className="h-4 w-4 mr-1" style={{ color: currentTheme.accent + '80' }} />
              <span>{spell.range || 'Не указано'}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs uppercase font-semibold" style={{ color: currentTheme.accent }}>
              Компоненты
            </div>
            <div className="flex items-center" style={{ color: currentTheme.textColor }}>
              <Component className="h-4 w-4 mr-1" style={{ color: currentTheme.accent + '80' }} />
              <span>{spell.components || 'Не указано'}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs uppercase font-semibold" style={{ color: currentTheme.accent }}>
              Длительность
            </div>
            <div className="flex items-center" style={{ color: currentTheme.textColor }}>
              <Timer className="h-4 w-4 mr-1" style={{ color: currentTheme.accent + '80' }} />
              <span>{spell.duration || 'Не указано'}</span>
            </div>
          </div>
        </div>
        
        <Separator style={{ backgroundColor: currentTheme.accent + '30' }} />
        
        <ScrollArea className="flex-1 p-4" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: currentTheme.accent }}>Описание</h3>
              <div className="space-y-2">
                {renderDescription()}
              </div>
            </div>
            
            {spell.higherLevel && (
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: currentTheme.accent }}>На более высоких уровнях</h3>
                <p style={{ color: currentTheme.textColor }}>
                  {spell.higherLevel}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-4 border-t" style={{ borderColor: currentTheme.accent + '30' }}>
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center" style={{ color: currentTheme.textColor }}>
              <Users className="h-4 w-4 mr-2" style={{ color: currentTheme.accent }} />
              <span>Доступно классам: </span>
              <span className="ml-1 font-semibold">{formatClasses(spell.classes)}</span>
            </div>
            
            <Button onClick={onClose} style={{ backgroundColor: currentTheme.accent, color: '#fff' }}>
              Закрыть
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
