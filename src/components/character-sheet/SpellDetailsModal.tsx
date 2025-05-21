
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';
import { SpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellDetailsModalProps {
  spell: SpellData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SpellDetailsModal: React.FC<SpellDetailsModalProps> = ({ spell, open, onOpenChange }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Format spell level
  const formatSpellLevel = (level: number): string => {
    if (level === 0) return "Заговор";
    if (level === 1) return "1-й уровень";
    if (level === 2) return "2-й уровень";
    if (level === 3) return "3-й уровень";
    return `${level}-й уровень`;
  };

  // Format array or string
  const formatText = (text: string | string[] | undefined): React.ReactNode => {
    if (!text) return null;
    
    if (Array.isArray(text)) {
      return text.map((paragraph, index) => (
        <p key={index} className="mb-2">{paragraph}</p>
      ));
    }
    
    return text.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-2">{paragraph}</p>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[80vh] overflow-y-auto" 
        style={{
          backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)',
          borderColor: currentTheme.accent,
          color: currentTheme.textColor
        }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{spell.name}</DialogTitle>
            <Badge 
              variant="outline"
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              {formatSpellLevel(spell.level)}
            </Badge>
          </div>
          <DialogDescription className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="bg-black/30">{spell.school}</Badge>
            {spell.ritual && <Badge variant="outline" className="bg-black/30">Ритуал</Badge>}
            {spell.concentration && <Badge variant="outline" className="bg-black/30">Концентрация</Badge>}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 text-sm" style={{color: currentTheme.textColor}}>
          <div>
            <span className="font-semibold">Время накладывания:</span> {spell.castingTime || 'Действие'}
          </div>
          <div>
            <span className="font-semibold">Дистанция:</span> {spell.range || 'На себя'}
          </div>
          <div>
            <span className="font-semibold">Компоненты:</span> {spell.components || ''}
          </div>
          <div>
            <span className="font-semibold">Длительность:</span> {spell.duration || 'Мгновенная'}
          </div>
        </div>

        <Separator style={{backgroundColor: `${currentTheme.accent}40`}} className="my-4" />

        <div className="text-sm prose prose-invert" style={{color: currentTheme.textColor}}>
          {formatText(spell.description)}
        </div>

        {spell.higherLevels && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">На более высоких уровнях:</h4>
            <div className="text-sm" style={{color: currentTheme.textColor}}>
              {formatText(spell.higherLevels)}
            </div>
          </div>
        )}

        {spell.classes && (
          <div className="mt-2 text-xs" style={{color: currentTheme.mutedTextColor || '#9ca3af'}}>
            <span className="font-semibold">Классы:</span> {
              typeof spell.classes === 'string' 
                ? spell.classes 
                : Array.isArray(spell.classes) 
                  ? spell.classes.join(', ') 
                  : ''
            }
          </div>
        )}

        {spell.source && (
          <div className="mt-1 text-xs" style={{color: currentTheme.mutedTextColor || '#9ca3af'}}>
            <span className="font-semibold">Источник:</span> {spell.source}
          </div>
        )}

        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)}
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.buttonText
            }}
          >
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailsModal;
