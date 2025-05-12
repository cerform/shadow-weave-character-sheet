
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SpellData } from '@/types/spells';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface SpellDetailModalProps {
  spell: SpellData | null;
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
  if (!spell) return null;
  
  // Safely format classes array or string
  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return "Нет";
    if (typeof classes === 'string') return classes;
    if (Array.isArray(classes)) return classes.join(', ');
    return "Нет";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" style={{backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor}}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <span>{spell.name}</span>
            <Badge style={{backgroundColor: currentTheme.accent, color: currentTheme.textColor}}>
              {spell.level === 0 ? "Заговор" : `${spell.level}-й уровень`}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" style={{borderColor: currentTheme.accent}}>
              {spell.school}
            </Badge>
            {spell.ritual && (
              <Badge variant="outline" style={{borderColor: currentTheme.accent}}>
                Ритуал
              </Badge>
            )}
            {spell.concentration && (
              <Badge variant="outline" style={{borderColor: currentTheme.accent}}>
                Концентрация
              </Badge>
            )}
          </div>
          
          <Separator className="my-2" style={{backgroundColor: currentTheme.accent + '40'}} />
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-semibold">Время накладывания</p>
              <p>{spell.castingTime}</p>
            </div>
            
            <div>
              <p className="font-semibold">Дистанция</p>
              <p>{spell.range}</p>
            </div>
            
            <div>
              <p className="font-semibold">Компоненты</p>
              <p>{spell.components}</p>
            </div>
            
            <div>
              <p className="font-semibold">Длительность</p>
              <p>{spell.duration}</p>
            </div>
          </div>
          
          <div>
            <p className="font-semibold">Доступно классам: </p>
            <p>{formatClasses(spell.classes)}</p>
          </div>
          
          <Separator className="my-4" style={{backgroundColor: currentTheme.accent + '40'}} />
          
          <div className="prose prose-invert max-w-none" style={{color: currentTheme.textColor}}>
            {typeof spell.description === 'string' ? (
              <p>{spell.description}</p>
            ) : Array.isArray(spell.description) ? (
              spell.description.map((paragraph, index) => (
                <p key={index} className="mb-2">{paragraph}</p>
              ))
            ) : (
              <p>Нет описания</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
