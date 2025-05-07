
import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AbilityBonusSelectorProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  abilityBonuses: {
    amount: number;
    options?: string[];
    fixed?: Record<string, number>;
  };
}

const AbilityBonusSelector: React.FC<AbilityBonusSelectorProps> = ({
  character,
  updateCharacter,
  abilityBonuses
}) => {
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
  const [availablePoints, setAvailablePoints] = useState<number>(abilityBonuses.amount || 0);
  
  // Список доступных характеристик
  const abilities = [
    { id: 'strength', name: 'Сила', key: 'strength' },
    { id: 'dexterity', name: 'Ловкость', key: 'dexterity' },
    { id: 'constitution', name: 'Телосложение', key: 'constitution' },
    { id: 'intelligence', name: 'Интеллект', key: 'intelligence' },
    { id: 'wisdom', name: 'Мудрость', key: 'wisdom' },
    { id: 'charisma', name: 'Харизма', key: 'charisma' }
  ];

  // Применяем фиксированные бонусы при инициализации
  useEffect(() => {
    if (abilityBonuses.fixed) {
      const updates: Partial<Character> = {};
      
      Object.entries(abilityBonuses.fixed).forEach(([ability, bonus]) => {
        const currentValue = character.abilities?.[ability as keyof typeof character.abilities] || 10;
        updates[ability as keyof Character] = currentValue + bonus;
        
        if (character.abilities) {
          updates.abilities = {
            ...character.abilities,
            [ability]: currentValue + bonus
          };
        }
      });
      
      updateCharacter(updates);
    }
  }, [abilityBonuses.fixed]);

  // Обработчик выбора характеристики
  const handleAbilitySelect = (ability: string, index: number) => {
    const newSelected = [...selectedAbilities];
    
    // Если характеристика уже была выбрана в другом селекторе, удаляем ее оттуда
    if (newSelected.includes(ability)) {
      const existingIndex = newSelected.indexOf(ability);
      if (existingIndex !== index) {
        newSelected[existingIndex] = '';
      }
    }
    
    // Обновляем выбор
    newSelected[index] = ability;
    setSelectedAbilities(newSelected);
    
    // Применяем бонусы
    applyAbilityBonuses(newSelected);
  };

  // Применение бонусов к характеристикам
  const applyAbilityBonuses = (selected: string[]) => {
    // Сначала сбрасываем все бонусы от расы
    const resetUpdates: Partial<Character> = {};
    const baseAbilities = character.abilities || {
      strength: 10, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10
    };
    
    // Применяем фиксированные бонусы
    const updates: Partial<Character> = { abilities: { ...baseAbilities } };
    if (abilityBonuses.fixed) {
      Object.entries(abilityBonuses.fixed).forEach(([ability, bonus]) => {
        const abilityKey = ability as keyof typeof baseAbilities;
        updates.abilities![abilityKey] = baseAbilities[abilityKey] + bonus;
        updates[abilityKey] = baseAbilities[abilityKey] + bonus;
      });
    }
    
    // Применяем выбранные бонусы
    selected.forEach(ability => {
      if (ability) {
        const abilityKey = ability as keyof typeof baseAbilities;
        updates.abilities![abilityKey] = (updates.abilities![abilityKey] || baseAbilities[abilityKey]) + 1;
        updates[abilityKey] = (updates[abilityKey] as number || baseAbilities[abilityKey]) + 1;
      }
    });
    
    updateCharacter(updates);
  };

  // Сколько осталось распределить бонусов
  const remainingBonuses = abilityBonuses.amount - selectedAbilities.filter(Boolean).length;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Увеличение характеристик</CardTitle>
        <CardDescription>
          {abilityBonuses.fixed && Object.entries(abilityBonuses.fixed).length > 0 && (
            <div className="mb-2">
              <p>Фиксированные бонусы:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(abilityBonuses.fixed).map(([ability, bonus]) => (
                  <Badge key={ability} variant="outline" className="bg-amber-900/20">
                    {abilities.find(a => a.key === ability)?.name} +{bonus}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {abilityBonuses.amount > 0 && (
            <p className="mt-2">
              Выберите {abilityBonuses.amount} {abilityBonuses.amount === 1 ? 'характеристику' : 
                abilityBonuses.amount < 5 ? 'характеристики' : 'характеристик'} 
              для увеличения на +1
              {remainingBonuses > 0 && 
                ` (осталось выбрать: ${remainingBonuses})`
              }
            </p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {Array.from({ length: abilityBonuses.amount }, (_, i) => (
          <div key={i} className="mb-4">
            <Label htmlFor={`ability-bonus-${i}`}>Характеристика {i + 1}</Label>
            <Select
              value={selectedAbilities[i] || ''}
              onValueChange={(value) => handleAbilitySelect(value, i)}
            >
              <SelectTrigger id={`ability-bonus-${i}`}>
                <SelectValue placeholder="Выберите характеристику" />
              </SelectTrigger>
              <SelectContent>
                {abilities.map((ability) => {
                  // Определяем, доступна ли эта характеристика для выбора
                  const isAvailable = !selectedAbilities.includes(ability.id) || 
                                      selectedAbilities[i] === ability.id;
                  
                  // Если характеристика ограничена опциями, проверяем её наличие в списке
                  const isInOptions = !abilityBonuses.options || 
                                     abilityBonuses.options.includes(ability.id);
                  
                  return isInOptions && (
                    <SelectItem 
                      key={ability.id} 
                      value={ability.id}
                      disabled={!isAvailable}
                    >
                      {ability.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AbilityBonusSelector;
