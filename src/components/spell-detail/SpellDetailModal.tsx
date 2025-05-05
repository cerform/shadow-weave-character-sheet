
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SpellData } from '@/types/spells';
import { Scroll, Sparkles, BookOpen, Clock, Target, Component, Timer } from 'lucide-react';

interface SpellDetailModalProps {
  spell: SpellData;
  open: boolean;
  onClose: () => void;
  currentTheme: any;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({ spell, open, onClose, currentTheme }) => {
  // Преобразование описания в текст для отображения
  const description = typeof spell.description === 'string' 
    ? spell.description 
    : Array.isArray(spell.description) 
      ? spell.description.join('\n\n') 
      : '';
  
  // Преобразование классов для отображения
  const classesText = typeof spell.classes === 'string' 
    ? spell.classes 
    : Array.isArray(spell.classes) 
      ? spell.classes.join(', ') 
      : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)',
          borderColor: currentTheme.accent,
          boxShadow: `0 0 20px ${currentTheme.accent}40`,
          color: currentTheme.textColor
        }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold" style={{ color: currentTheme.accent }}>
              {spell.name}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge
                className="px-3 py-1"
                style={{ 
                  backgroundColor: currentTheme.accent,
                  color: '#fff'
                }}
              >
                {spell.level === 0 ? "Заговор" : `${spell.level}-й уровень`}
              </Badge>
              <Badge
                variant="outline"
                className="px-3 py-1"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderColor: currentTheme.accent,
                  color: currentTheme.textColor
                }}
              >
                {spell.school}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <div className="pt-2">
          <div className="flex flex-wrap gap-2 mb-4">
            {(spell.ritual || spell.isRitual) && (
              <Badge className="flex items-center gap-1"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderColor: currentTheme.accent,
                  color: currentTheme.textColor
                }}
              >
                <Scroll className="h-3.5 w-3.5 mr-1" />
                Ритуал
              </Badge>
            )}
            
            {(spell.concentration || spell.isConcentration) && (
              <Badge className="flex items-center gap-1"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderColor: currentTheme.accent,
                  color: currentTheme.textColor
                }}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Концентрация
              </Badge>
            )}
            
            <Badge className="flex items-center gap-1"
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              {spell.source || 'PHB'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 flex-shrink-0" style={{ color: currentTheme.accent }} />
              <div>
                <h4 className="text-sm font-medium" style={{ color: `${currentTheme.textColor}90` }}>Время накладывания</h4>
                <p>{spell.castingTime}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 flex-shrink-0" style={{ color: currentTheme.accent }} />
              <div>
                <h4 className="text-sm font-medium" style={{ color: `${currentTheme.textColor}90` }}>Дистанция</h4>
                <p>{spell.range}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Component className="h-5 w-5 flex-shrink-0" style={{ color: currentTheme.accent }} />
              <div>
                <h4 className="text-sm font-medium" style={{ color: `${currentTheme.textColor}90` }}>Компоненты</h4>
                <p>{spell.components}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 flex-shrink-0" style={{ color: currentTheme.accent }} />
              <div>
                <h4 className="text-sm font-medium" style={{ color: `${currentTheme.textColor}90` }}>Длительность</h4>
                <p>{spell.duration}</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" style={{ backgroundColor: `${currentTheme.accent}40` }} />
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2" style={{ color: currentTheme.accent }}>Описание</h3>
            <div className="whitespace-pre-line" style={{ color: currentTheme.textColor }}>
              {description}
            </div>
          </div>
          
          {classesText && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-1" style={{ color: currentTheme.accent }}>Доступно классам</h3>
              <p>{classesText}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            onClick={onClose}
            style={{ 
              backgroundColor: currentTheme.accent,
              color: '#fff'
            }}
          >
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
