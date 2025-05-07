import React from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';

export interface SpellCastingPanelProps {
  character: Character;
  onUpdate?: (updates: Partial<Character>) => void;
}

const SpellCastingPanel: React.FC<SpellCastingPanelProps> = ({ character, onUpdate }) => {
  const updateSpellSlot = (level: number, used: number) => {
    if (!character.spellSlots || !onUpdate) return;
  
    const spellSlots = { ...character.spellSlots };
    
    // Обновляем количество использованных слотов
    if (spellSlots[level]) {
      spellSlots[level] = {
        ...spellSlots[level],
        used
      };
    }
    
    onUpdate({
      spellSlots
    });
  };

  // Получаем тему для стилизации
  const { theme } = useTheme();
  
  // Определяем класс персонажа для отображения соответствующей информации
  const characterClass = character.class?.toLowerCase() || '';
  
  // Определяем, является ли класс заклинателем
  const isSpellcaster = ['волшебник', 'жрец', 'друид', 'бард', 'чародей', 'колдун', 'паладин', 'следопыт', 'wizard', 'cleric', 'druid', 'bard', 'sorcerer', 'warlock', 'paladin', 'ranger'].includes(characterClass);
  
  // Если персонаж не заклинатель, не отображаем панель
  if (!isSpellcaster) {
    return null;
  }
  
  // Получаем информацию о ячейках заклинаний
  const spellSlots = character.spellSlots || {};
  
  // Определяем максимальный уровень заклинаний для отображения
  const maxSpellLevel = 9;
  
  // Определяем характеристику заклинаний
  let spellcastingAbility = 'intelligence';
  if (['жрец', 'друид', 'cleric', 'druid'].includes(characterClass)) {
    spellcastingAbility = 'wisdom';
  } else if (['бард', 'чародей', 'колдун', 'паладин', 'bard', 'sorcerer', 'warlock', 'paladin'].includes(characterClass)) {
    spellcastingAbility = 'charisma';
  }
  
  // Получаем модификатор характеристики заклинаний
  const getAbilityModifier = (ability: string): number => {
    const abilityScore = character.abilities?.[ability as keyof typeof character.abilities] || 10;
    return Math.floor((abilityScore - 10) / 2);
  };
  
  const spellcastingModifier = getAbilityModifier(spellcastingAbility);
  
  // Рассчитываем СЛ заклинаний и бонус атаки
  const spellSaveDC = 8 + (character.proficiencyBonus || 2) + spellcastingModifier;
  const spellAttackBonus = (character.proficiencyBonus || 2) + spellcastingModifier;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Заклинательные ячейки</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-2 border rounded-md">
            <div className="text-sm text-muted-foreground">Характеристика</div>
            <div className="font-bold">
              {spellcastingAbility === 'intelligence' ? 'Интеллект' : 
               spellcastingAbility === 'wisdom' ? 'Мудрость' : 'Харизма'}
            </div>
          </div>
          
          <div className="text-center p-2 border rounded-md">
            <div className="text-sm text-muted-foreground">СЛ заклинаний</div>
            <div className="font-bold">{spellSaveDC}</div>
          </div>
          
          <div className="text-center p-2 border rounded-md">
            <div className="text-sm text-muted-foreground">Бонус атаки</div>
            <div className="font-bold">+{spellAttackBonus}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map(level => {
            const slot = spellSlots[level] || { max: 0, used: 0 };
            
            // Если у персонажа нет ячеек этого уровня, не отображаем
            if (slot.max === 0) return null;
            
            return (
              <div key={level} className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Уровень {level}</div>
                <div className="flex justify-center space-x-1">
                  {Array.from({ length: slot.max }, (_, i) => {
                    const isUsed = i < slot.used;
                    return (
                      <button
                        key={i}
                        className={`w-6 h-6 rounded-full border ${
                          isUsed ? 'bg-muted border-muted-foreground' : 'bg-background border-primary'
                        }`}
                        onClick={() => onUpdate && updateSpellSlot(level, isUsed ? i : i + 1)}
                        disabled={!onUpdate}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Дополнительные ресурсы для определенных классов */}
        {characterClass === 'чародей' || characterClass === 'sorcerer' ? (
          <div className="mt-4 p-2 border rounded-md">
            <div className="text-sm text-muted-foreground mb-1">Очки чародейства</div>
            <div className="flex items-center justify-between">
              <span>Текущие: {character.sorceryPoints?.current || 0}</span>
              <span>Максимум: {character.sorceryPoints?.max || character.level}</span>
            </div>
          </div>
        ) : null}
        
        {/* Для колдуна показываем восстановление ячеек на коротком отдыхе */}
        {(characterClass === 'колдун' || characterClass === 'warlock') && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Ячейки восстанавливаются после короткого отдыха
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpellCastingPanel;
