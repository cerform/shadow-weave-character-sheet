
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SpellData } from '@/types/spells';
import { componentsToString } from '@/utils/spellProcessors';

interface SpellDetailModalProps {
  spell: SpellData;
  isOpen: boolean;
  onClose: () => void;
  onAddSpell?: (spell: SpellData) => void;
  onRemoveSpell?: (spell: SpellData) => void;
  isAdded?: boolean;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({
  spell,
  isOpen,
  onClose,
  onAddSpell,
  onRemoveSpell,
  isAdded = false,
}) => {
  const handleAddSpell = () => {
    if (onAddSpell) onAddSpell(spell);
  };
  
  const handleRemoveSpell = () => {
    if (onRemoveSpell) onRemoveSpell(spell);
  };
  
  const getLevelName = (level: number) => {
    if (level === 0) return 'Заговор';
    if (level === 1) return '1-й уровень';
    if (level === 2) return '2-й уровень';
    if (level === 3) return '3-й уровень';
    return `${level}-й уровень`;
  };
  
  const formatSchool = (school: string = 'Универсальная') => {
    // Отображаем русское название школы магии
    const schoolMap: Record<string, string> = {
      'abjuration': 'Ограждение',
      'conjuration': 'Вызов',
      'divination': 'Прорицание',
      'enchantment': 'Очарование',
      'evocation': 'Воплощение',
      'illusion': 'Иллюзия',
      'necromancy': 'Некромантия',
      'transmutation': 'Преобразование',
    };
    
    return schoolMap[school.toLowerCase()] || school;
  };
  
  const formatDescription = (description: string | string[]) => {
    if (!description) return ['Нет описания'];
    
    if (Array.isArray(description)) {
      return description;
    }
    
    // Разбиваем длинное описание на абзацы
    return description.split('\n\n');
  };
  
  const formatClasses = (classes: string[] | string | undefined) => {
    if (!classes) return '';
    
    if (typeof classes === 'string') {
      return classes;
    }
    
    return classes.join(', ');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{spell.name}</DialogTitle>
          <DialogDescription>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline">{getLevelName(spell.level)}</Badge>
              <Badge variant="outline">{formatSchool(spell.school)}</Badge>
              {spell.ritual && <Badge variant="outline">Ритуал</Badge>}
              {spell.concentration && <Badge variant="outline">Концентрация</Badge>}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium">Время накладывания</div>
                <div>{spell.castingTime || '1 действие'}</div>
              </div>
              
              <div>
                <div className="font-medium">Дистанция</div>
                <div>{spell.range || 'На себя'}</div>
              </div>
              
              <div>
                <div className="font-medium">Компоненты</div>
                <div>
                  {spell.components || 
                   componentsToString({
                     verbal: spell.verbal,
                     somatic: spell.somatic,
                     material: spell.material,
                     materials: spell.materials
                   })}
                </div>
              </div>
              
              <div>
                <div className="font-medium">Длительность</div>
                <div>{spell.duration || 'Мгновенная'}</div>
              </div>
              
              {spell.classes && (
                <div className="col-span-2">
                  <div className="font-medium">Классы</div>
                  <div>{formatClasses(spell.classes)}</div>
                </div>
              )}
            </div>
            
            <div>
              <div className="font-medium mb-2">Описание</div>
              <div className="space-y-2 text-sm">
                {formatDescription(spell.description || '').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
            
            {spell.higherLevels && (
              <div>
                <div className="font-medium mb-2">На более высоких уровнях</div>
                <div className="text-sm">{spell.higherLevels}</div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-2 mt-4">
          {onAddSpell && !isAdded && (
            <Button onClick={handleAddSpell}>
              Добавить заклинание
            </Button>
          )}
          
          {onRemoveSpell && isAdded && (
            <Button variant="destructive" onClick={handleRemoveSpell}>
              Удалить заклинание
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
