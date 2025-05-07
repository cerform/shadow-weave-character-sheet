import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SpellData } from '@/types/spells';
import { Badge } from '@/components/ui/badge';

export interface SpellDialogProps {
  spell: SpellData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTogglePrepared?: () => void;
}

const SpellDialog: React.FC<SpellDialogProps> = ({ spell, open, onOpenChange, onTogglePrepared }) => {
  // Get spell level name
  const getSpellLevelName = (level: number): string => {
    if (level === 0) return "Заговор";
    if (level === 1) return "1-й уровень";
    if (level === 2) return "2-й уровень";
    if (level === 3) return "3-й уровень";
    return `${level}-й уровень`;
  };

  // Get school translation
  const getSchoolTranslation = (school: string): string => {
    const schools: Record<string, string> = {
      'Abjuration': 'Ограждение',
      'Conjuration': 'Вызов',
      'Divination': 'Прорицание',
      'Enchantment': 'Очарование',
      'Evocation': 'Воплощение',
      'Illusion': 'Иллюзия',
      'Necromancy': 'Некромантия',
      'Transmutation': 'Преобразование',
      'Universal': 'Универсальная'
    };
    
    return schools[school] || school;
  };

  // Format components
  const formatComponents = (): string => {
    const components = [];
    if (spell.verbal) components.push('В');
    if (spell.somatic) components.push('С');
    if (spell.material) components.push('М');
    return components.join(', ');
  };

  // Format classes
  const formatClasses = (): string => {
    if (!spell.classes) return 'Нет данных';
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.join(', ');
    }
    
    return spell.classes;
  };

  // Format description
  const formatDescription = (): string => {
    if (Array.isArray(spell.description)) {
      return spell.description.join('\n\n');
    }
    return spell.description?.toString() || 'Нет описания';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{spell.name}</DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">{getSpellLevelName(spell.level)}</Badge>
            <Badge variant="outline">{getSchoolTranslation(spell.school || 'Universal')}</Badge>
            {spell.ritual && <Badge variant="outline">Ритуал</Badge>}
            {spell.concentration && <Badge variant="outline">Концентрация</Badge>}
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 my-4">
          <div>
            <p className="text-sm font-medium mb-1 text-muted-foreground">Время накладывания</p>
            <p>{spell.castingTime || '1 действие'}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1 text-muted-foreground">Дистанция</p>
            <p>{spell.range || 'На себя'}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1 text-muted-foreground">Компоненты</p>
            <p>{formatComponents()}</p>
            {spell.material && spell.materials && (
              <p className="text-xs text-muted-foreground mt-1">{spell.materials}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium mb-1 text-muted-foreground">Длительность</p>
            <p>{spell.duration || 'Мгновенная'}</p>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">Описание</h3>
          <p className="text-sm whitespace-pre-line">{formatDescription()}</p>
        </div>
        
        {(spell.higherLevel || spell.higherLevels) && (
          <div className="pt-4 border-t mt-4">
            <h3 className="font-medium mb-2">На более высоких уровнях</h3>
            <p className="text-sm">{spell.higherLevel || spell.higherLevels}</p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Классы: {formatClasses()}
          </p>
          {spell.source && (
            <p className="text-xs text-muted-foreground mt-1">
              Источник: {spell.source}
            </p>
          )}
        </div>
        
        <div className="flex justify-between mt-4">
          {onTogglePrepared && (
            <Button 
              variant={spell.prepared ? "default" : "outline"}
              onClick={onTogglePrepared}
            >
              {spell.prepared ? 'Отменить подготовку' : 'Подготовить заклинание'}
            </Button>
          )}
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDialog;
