
import React, { useState, useEffect, useCallback } from 'react';
import { SpellData } from '@/types/spells';
import { Character } from '@/types/character';
import { calculateAvailableSpellsByClassAndLevel, getSpellcastingAbilityModifier } from '@/utils/spellUtils';
import { useSpellbook } from '@/contexts/SpellbookContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface CharacterSpellSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const { spells: allSpells, loadSpellsForClass } = useSpellbook();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Получаем модификатор способности для заклинаний
  const abilityModifier = getSpellcastingAbilityModifier(character);

  // Загружаем заклинания для класса
  useEffect(() => {
    if (character.class) {
      loadSpellsForClass(character.class);
    }
  }, [character.class, loadSpellsForClass]);

  // Инициализируем выбранные заклинания из персонажа
  useEffect(() => {
    if (character.spells && character.spells.length > 0) {
      const spellsData = character.spells.map(spell => {
        if (typeof spell === 'string') {
          const found = allSpells.find(s => s.name === spell);
          return found || { id: spell, name: spell, level: 0, school: '', classes: [] };
        }
        return spell;
      });
      setSelectedSpells(spellsData as SpellData[]);
    }
  }, [character.spells, allSpells]);

  // Обработчик выбора заклинания
  const handleSpellChange = (spell: SpellData, isAdding: boolean) => {
    let updatedSpells: SpellData[];
    
    if (isAdding) {
      updatedSpells = [...selectedSpells, spell];
    } else {
      updatedSpells = selectedSpells.filter(s => s.id !== spell.id);
    }
    
    setSelectedSpells(updatedSpells);
    
    // Обновляем персонажа
    updateCharacter({ 
      spells: updatedSpells.map(s => ({ 
        id: s.id,
        name: s.name,
        level: s.level,
        school: s.school,
        castingTime: s.castingTime,
        range: s.range,
        components: s.components,
        duration: s.duration,
        description: s.description,
        classes: s.classes,
        ritual: s.ritual,
        concentration: s.concentration
      }))
    });
  };

  if (!character.class || !character.level) {
    return <div>Необходимо выбрать класс и уровень персонажа для выбора заклинаний</div>;
  }

  // Вычисляем доступные заклинания
  const { maxSpellLevel, cantripsCount, knownSpells } = calculateAvailableSpellsByClassAndLevel(
    character.class,
    character.level || 1,
    abilityModifier
  );

  // Группируем заклинания по уровням
  const spellsByLevel = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
    const levelSpells = allSpells.filter(spell => spell.level === level && 
      (Array.isArray(spell.classes) 
        ? spell.classes.some(c => character.class?.toLowerCase().includes(c.toLowerCase()))
        : spell.classes?.toLowerCase().includes(character.class?.toLowerCase()))
    );
    return { level, spells: levelSpells };
  }).filter(group => group.spells.length > 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Выбор заклинаний</h2>
        <p className="text-sm text-muted-foreground">
          Для класса {character.class} (уровень {character.level || 1})
          <br />
          Доступно заговоров: {cantripsCount}, Доступно заклинаний: {knownSpells}, Максимальный уровень: {maxSpellLevel}
        </p>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Выбранные заклинания ({selectedSpells.length})</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSpells.length > 0 ? (
              selectedSpells.map(spell => (
                <Badge 
                  key={spell.id} 
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleSpellChange(spell, false)}
                >
                  {spell.name} ({spell.level === 0 ? 'Заговор' : `${spell.level} ур.`}) &times;
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">Нет выбранных заклинаний</span>
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
      </div>

      {spellsByLevel.map(group => (
        <div key={`level-${group.level}`} className="mb-6">
          <h3 className="text-lg font-medium mb-2">
            {group.level === 0 ? 'Заговоры' : `Заклинания ${group.level} уровня`}
          </h3>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {group.spells.map(spell => {
                const isSelected = selectedSpells.some(s => s.id === spell.id);
                return (
                  <Card 
                    key={spell.id} 
                    className={`cursor-pointer transition-colors hover:bg-accent/10 ${
                      isSelected ? 'border-accent' : ''
                    }`}
                    onClick={() => handleSpellChange(spell, !isSelected)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{spell.name}</span>
                        <Badge variant={isSelected ? "default" : "outline"}>
                          {isSelected ? 'Выбрано' : 'Добавить'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {spell.school}, {spell.castingTime}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      ))}

      <div className="flex justify-between pt-4">
        {prevStep && (
          <button 
            onClick={prevStep}
            className="px-4 py-2 border rounded text-sm"
          >
            Назад
          </button>
        )}
        {nextStep && (
          <button 
            onClick={nextStep}
            className="px-4 py-2 bg-accent text-accent-foreground rounded text-sm"
          >
            Далее
          </button>
        )}
      </div>
    </div>
  );
};

export default CharacterSpellSelection;
