
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SpellData } from '@/types/spells';
import { Character } from '@/types/character';
import { getSpellcastingAbilityModifier } from '@/utils/spellUtils';
import { Separator } from '@/components/ui/separator';

export interface SpellDialogProps {
  spell: SpellData;
  character: Character;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SpellDialog: React.FC<SpellDialogProps> = ({ 
  spell, 
  character, 
  open, 
  onOpenChange 
}) => {
  const abilityModifier = getSpellcastingAbilityModifier(character);
  const proficiencyBonus = character.proficiencyBonus || Math.ceil(1 + (character.level || 1) / 4);
  
  // Вычисляем СЛ заклинания и бонус атаки
  const spellSaveDC = 8 + abilityModifier + proficiencyBonus;
  const spellAttackBonus = abilityModifier + proficiencyBonus;
  
  // Форматирование описания
  const formattedDescription = React.useMemo(() => {
    if (!spell.description) return '';
    if (typeof spell.description === 'string') return spell.description;
    if (Array.isArray(spell.description)) return spell.description.join('\n\n');
    return '';
  }, [spell.description]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{spell.name}</span>
            <Badge className="ml-2">
              {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
            </Badge>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant="outline">{spell.school}</Badge>
            {spell.ritual && <Badge variant="outline">Ритуал</Badge>}
            {spell.concentration && <Badge variant="outline">Концентрация</Badge>}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <strong>Время накладывания:</strong> {spell.castingTime}
            </div>
            <div>
              <strong>Дистанция:</strong> {spell.range}
            </div>
            <div>
              <strong>Компоненты:</strong> {spell.components}
            </div>
            <div>
              <strong>Длительность:</strong> {spell.duration}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <div className="mb-2 text-center">
              <strong>СЛ заклинания:</strong> {spellSaveDC} | <strong>Бонус атаки:</strong> +{spellAttackBonus}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <div className="text-sm whitespace-pre-wrap">
              {formattedDescription}
            </div>
          </div>
          
          {spell.classes && spell.classes.length > 0 && (
            <>
              <Separator />
              <div className="text-xs text-muted-foreground">
                <strong>Классы:</strong> {Array.isArray(spell.classes) ? spell.classes.join(', ') : spell.classes}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDialog;
