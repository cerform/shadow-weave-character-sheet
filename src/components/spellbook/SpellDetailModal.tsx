
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Separator } from '@/components/ui/separator';

interface SpellDetailModalProps {
  spell: SpellData | null;
  open: boolean;
  onClose: () => void;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({ spell, open, onClose }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  if (!spell) return null;

  // Преобразуем описание в удобный для отображения формат
  const formattedDescription = typeof spell.description === 'string'
    ? spell.description
    : Array.isArray(spell.description)
      ? spell.description.join('\n\n')
      : '';

  // Форматирование уровня заклинания
  const spellLevelText = spell.level === 0
    ? "Заговор"
    : `${spell.level}-й уровень`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              {spellLevelText}
            </Badge>
          </div>
          <DialogDescription className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="bg-black/30">{spell.school}</Badge>
            {(spell.ritual || spell.isRitual) && <Badge variant="outline" className="bg-black/30">Ритуал</Badge>}
            {(spell.concentration || spell.isConcentration) && <Badge variant="outline" className="bg-black/30">Концентрация</Badge>}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 text-sm" style={{color: currentTheme.textColor}}>
          <div>
            <span className="font-semibold">Время накладывания:</span> {spell.castingTime}
          </div>
          <div>
            <span className="font-semibold">Дистанция:</span> {spell.range}
          </div>
          <div>
            <span className="font-semibold">Компоненты:</span> {spell.components}
          </div>
          <div>
            <span className="font-semibold">Длительность:</span> {spell.duration}
          </div>
        </div>

        <Separator style={{backgroundColor: `${currentTheme.accent}40`}} />

        <div className="mt-4 text-sm prose prose-invert" style={{color: currentTheme.textColor}}>
          {formattedDescription.split('\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

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
          <DialogClose asChild>
            <Button 
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              Закрыть
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
