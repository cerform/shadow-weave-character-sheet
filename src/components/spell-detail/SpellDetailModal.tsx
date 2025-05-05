
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SpellData } from '@/types/spells';
import { Clock, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
  // Получаем цвет для бейджа уровня заклинания
  const getSpellLevelColor = (level: number): string => {
    const colors = {
      0: "#6b7280", // Заговор - серый
      1: "#10b981", // 1 уровень - зеленый
      2: "#3b82f6", // 2 уровень - синий
      3: "#8b5cf6", // 3 уровень - фиолетовый
      4: "#ec4899", // 4 уровень - розовый
      5: "#f59e0b", // 5 уровень - оранжевый
      6: "#ef4444", // 6 уровень - красный
      7: "#6366f1", // 7 уровень - индиго
      8: "#0ea5e9", // 8 уровень - голубой
      9: "#7c3aed"  // 9 уровень - насыщенный фиолетовый
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  // Форматируем описание для отображения
  const description = typeof spell.description === 'string' 
    ? spell.description 
    : Array.isArray(spell.description) 
      ? spell.description.join('\n\n') 
      : '';
  
  const higherLevels = spell.higherLevels || spell.higherLevel || '';

  // Форматируем классы для отображения
  const classesText = typeof spell.classes === 'string' 
    ? spell.classes 
    : Array.isArray(spell.classes) 
      ? spell.classes.join(', ') 
      : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-hidden"
        style={{ 
          backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)', 
          borderColor: getSpellLevelColor(spell.level),
          boxShadow: `0 0 20px ${getSpellLevelColor(spell.level)}50`
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xl font-bold" style={{ color: currentTheme.textColor }}>
              {spell.name}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge style={{ 
                backgroundColor: getSpellLevelColor(spell.level),
                color: '#ffffff' 
              }}>
                {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
              </Badge>
              <Badge variant="outline" style={{ 
                borderColor: currentTheme.accent,
                color: currentTheme.textColor 
              }}>
                {spell.school}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <span className="text-sm text-gray-400">Время накладывания</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-300" />
              <span style={{ color: currentTheme.textColor }}>{spell.castingTime}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm text-gray-400">Дальность</span>
            <div className="flex items-center gap-1">
              <ArrowRight className="h-4 w-4 text-gray-300" />
              <span style={{ color: currentTheme.textColor }}>{spell.range}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm text-gray-400">Компоненты</span>
            <div className="flex items-center gap-1">
              <span style={{ color: currentTheme.textColor }}>{spell.components}</span>
              <div className="flex space-x-1 ml-2">
                {spell.verbal && (
                  <Badge variant="outline" size="sm" className="px-1.5 h-5">В</Badge>
                )}
                {spell.somatic && (
                  <Badge variant="outline" size="sm" className="px-1.5 h-5">С</Badge>
                )}
                {spell.material && (
                  <Badge variant="outline" size="sm" className="px-1.5 h-5">М</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm text-gray-400">Длительность</span>
            <div className="flex items-center flex-wrap gap-1">
              <span style={{ color: currentTheme.textColor }}>{spell.duration}</span>
              <div className="flex space-x-1 ml-2">
                {(spell.concentration || spell.isConcentration) && (
                  <Badge variant="outline" style={{ 
                    borderColor: currentTheme.accent,
                    color: currentTheme.textColor 
                  }}>
                    Концентрация
                  </Badge>
                )}
                {(spell.ritual || spell.isRitual) && (
                  <Badge variant="outline" style={{ 
                    borderColor: currentTheme.accent,
                    color: currentTheme.textColor 
                  }}>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Ритуал
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-span-full space-y-1">
            <span className="text-sm text-gray-400">Классы</span>
            <div className="flex flex-wrap gap-1">
              {Array.isArray(spell.classes) ? (
                spell.classes.map((cls, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    style={{
                      backgroundColor: `${currentTheme.accent}30`,
                      color: currentTheme.textColor
                    }}
                  >
                    {cls}
                  </Badge>
                ))
              ) : (
                spell.classes && (
                  <Badge 
                    variant="secondary"
                    style={{
                      backgroundColor: `${currentTheme.accent}30`,
                      color: currentTheme.textColor
                    }}
                  >
                    {spell.classes}
                  </Badge>
                )
              )}
            </div>
          </div>
        </div>
        
        <Separator style={{ backgroundColor: `${currentTheme.accent}40` }} />
        
        <div className="space-y-2 pt-2">
          <span className="text-sm text-gray-400">Описание</span>
          <ScrollArea className="h-[200px] pr-4">
            <div 
              style={{ color: currentTheme.textColor }}
              className="whitespace-pre-line text-sm"
            >
              {description}
            </div>
            
            {higherLevels && (
              <>
                <h4 className="text-sm text-gray-400 mt-4 mb-1">На более высоких уровнях</h4>
                <div 
                  style={{ color: currentTheme.textColor }}
                  className="text-sm"
                >
                  {higherLevels}
                </div>
              </>
            )}
          </ScrollArea>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={onClose}
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.buttonText || 'white'
            }}
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
