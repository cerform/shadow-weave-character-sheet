
import React from 'react';
import { SpellData } from '@/hooks/spellbook/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useUserTheme } from '@/hooks/use-user-theme';

interface SpellDetailModalProps {
  spell: SpellData;
  isOpen: boolean;
  onClose: () => void;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({ spell, isOpen, onClose }) => {
  const { theme } = useTheme();
  const { activeTheme } = useUserTheme();
  const themeKey = (activeTheme || theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Format spell classes for display
  const formatClasses = (classes: string[] | string | undefined) => {
    if (!classes) return '';
    if (Array.isArray(classes)) {
      return classes.join(', ');
    }
    return classes;
  };

  // Format components for display
  const formatComponents = (components: string) => {
    if (!components) return 'Нет';
    return components;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]" style={{
        backgroundColor: currentTheme.cardBackground || 'rgba(20, 20, 20, 0.95)',
        color: currentTheme.textColor,
        borderColor: currentTheme.accent
      }}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold" style={{ color: currentTheme.textColor }}>
              {spell.name}
            </span>
            <Badge 
              variant="outline"
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              {spell.level === 0 ? "Заговор" : `${spell.level}-й уровень`}
            </Badge>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary">{spell.school}</Badge>
            {spell.ritual && <Badge variant="outline">Ритуал</Badge>}
            {spell.concentration && <Badge variant="outline">Концентрация</Badge>}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="mt-4 max-h-[60vh]">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            <div>
              <span className="font-semibold">Время накладывания:</span> {spell.castingTime}
            </div>
            <div>
              <span className="font-semibold">Дистанция:</span> {spell.range}
            </div>
            <div>
              <span className="font-semibold">Компоненты:</span> {formatComponents(spell.components || '')}
            </div>
            <div>
              <span className="font-semibold">Длительность:</span> {spell.duration}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Классы:</span> {formatClasses(spell.classes)}
            </div>
          </div>
          
          <Separator className="my-4" style={{ backgroundColor: `${currentTheme.accent}40` }} />
          
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">Описание</h4>
              <p style={{ color: currentTheme.mutedTextColor || currentTheme.textColor }}>{spell.description}</p>
            </div>
            
            {spell.higherLevels && (
              <div>
                <h4 className="font-bold mb-2">На более высоких уровнях</h4>
                <p style={{ color: currentTheme.mutedTextColor || currentTheme.textColor }}>{spell.higherLevels}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
