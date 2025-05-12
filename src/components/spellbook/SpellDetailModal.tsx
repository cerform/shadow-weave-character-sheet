
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CharacterSpell } from '@/types/character';
import { componentsToString } from '@/utils/spellProcessors';

interface SpellDetailModalProps {
  spell: CharacterSpell | any;
  open: boolean;
  onClose: () => void;
  currentTheme: any;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({ spell, open, onClose, currentTheme }) => {
  const getComponentsString = () => {
    if (spell.components) {
      return spell.components;
    } else {
      return componentsToString({
        verbal: spell.verbal,
        somatic: spell.somatic,
        material: spell.material,
        ritual: spell.ritual,
        concentration: spell.concentration
      });
    }
  };

  const parseDescription = () => {
    if (!spell.description) return 'Нет описания';
    
    if (typeof spell.description === 'string') {
      return spell.description;
    } else if (Array.isArray(spell.description)) {
      return spell.description.join('\n\n');
    }
    
    return String(spell.description);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        style={{ 
          backgroundColor: currentTheme.cardBackground, 
          color: currentTheme.textColor,
          borderColor: currentTheme.borderColor || currentTheme.accent + '40' 
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-2xl flex items-center justify-between"
            style={{ color: currentTheme.textColor }}
          >
            <span>{spell.name}</span>
            <span className="text-base font-normal" style={{ color: currentTheme.mutedTextColor }}>
              {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
            </span>
          </DialogTitle>
          <DialogDescription style={{ color: currentTheme.mutedTextColor }}>
            {spell.school || 'Школа неизвестна'} • {spell.castingTime || '1 действие'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {spell.ritual && (
              <span 
                className="px-2 py-1 text-xs rounded-md"
                style={{ backgroundColor: currentTheme.accent + '20', color: currentTheme.accent }}
              >
                Ритуал
              </span>
            )}
            {spell.concentration && (
              <span 
                className="px-2 py-1 text-xs rounded-md"
                style={{ backgroundColor: currentTheme.accent + '20', color: currentTheme.accent }}
              >
                Концентрация
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>
                Дистанция
              </h4>
              <p>{spell.range || 'Касание'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>
                Компоненты
              </h4>
              <p>{getComponentsString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>
                Длительность
              </h4>
              <p>{spell.duration || 'Мгновенная'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>
                Классы
              </h4>
              <p>
                {Array.isArray(spell.classes) 
                  ? spell.classes.join(', ') 
                  : spell.classes || 'Неизвестно'}
              </p>
            </div>
          </div>

          {spell.materials && (
            <div>
              <h4 className="text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>
                Материальные компоненты
              </h4>
              <p>{spell.materials}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>
              Описание
            </h4>
            <div className="whitespace-pre-wrap">
              {parseDescription()}
            </div>
          </div>

          {spell.higherLevels && (
            <div>
              <h4 className="text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>
                На более высоких уровнях
              </h4>
              <p>{spell.higherLevels}</p>
            </div>
          )}

          <div className="text-xs text-right" style={{ color: currentTheme.mutedTextColor }}>
            Источник: {spell.source || 'Книга игрока'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
