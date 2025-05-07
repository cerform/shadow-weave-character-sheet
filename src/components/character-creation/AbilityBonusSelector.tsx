
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
  
  // Используем правильный тип для availablePoints
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
    // Исправляем проверку на наличие fixed бонусов
    const fixedBonuses = abilityBonuses.fixed;
    if (!fixedBonuses) {
      return;
    }
    
    const updates: Partial<Character> = {};
    const updatedAbilities = { ...character.abilities } || {
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
      strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
    };
    
    // Теперь мы знаем, что fixed существует и имеет ключи
    Object.entries(fixedBonuses).forEach(([ability, bonus]) => {
      const abilityKey = ability as keyof typeof updatedAbilities;
      if (abilityKey in updatedAbilities) {
        const currentValue = updatedAbilities[abilityKey] || 10;
        updatedAbilities[abilityKey] = currentValue + bonus;
        
        const shortKeyMap: Record<string, string> = {
          'strength': 'STR', 'dexterity': 'DEX', 'constitution': 'CON', 
          'intelligence': 'INT', 'wisdom': 'WIS', 'charisma': 'CHA'
        };
        
        const longKeyMap: Record<string, string> = {
          'STR': 'strength', 'DEX': 'dexterity', 'CON': 'constitution', 
          'INT': 'intelligence', 'WIS': 'wisdom', 'CHA': 'charisma'
        };
        
        if (abilityKey in shortKeyMap) {
          const shortKey = shortKeyMap[abilityKey as string] as keyof typeof updatedAbilities;
          updatedAbilities[shortKey] = currentValue + bonus;
        } else if (abilityKey in longKeyMap) {
          const longKey = longKeyMap[abilityKey as string] as keyof typeof updatedAbilities;
          updatedAbilities[longKey] = currentValue + bonus;
        }
      }
    });
    
    updates.abilities = updatedAbilities;
    updateCharacter(updates);
  }, [abilityBonuses.fixed, character.abilities, updateCharacter]);

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
    // Получаем базовые характеристики (с учетом уже примененных фиксированных бонусов)
    const baseAbilities = character.abilities || {
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
      strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
    };
    
    // Создаем копию для обновления
    const updatedAbilities = { ...baseAbilities };
    
    // Сбрасываем все "выборные" бонусы (не фиксированные)
    // Для этого нам нужно знать, какие характеристики были ранее выбраны,
    // но поскольку мы не храним это состояние, мы будем применять все бонусы заново
    
    // Применяем фиксированные бонусы (если есть)
    if (abilityBonuses.fixed && Object.keys(abilityBonuses.fixed).length > 0) {
      Object.entries(abilityBonuses.fixed).forEach(([ability, bonus]) => {
        const abilityKey = ability as keyof typeof updatedAbilities;
        if (abilityKey in updatedAbilities) {
          const baseValue = abilityKey.includes('STR') || 
                          abilityKey.includes('DEX') || 
                          abilityKey.includes('CON') || 
                          abilityKey.includes('INT') || 
                          abilityKey.includes('WIS') || 
                          abilityKey.includes('CHA') ? 10 : 10;
          updatedAbilities[abilityKey] = baseValue + bonus;
        }
      });
    }
    
    // Применяем выбранные бонусы
    selected.forEach(ability => {
      if (ability) {
        const abilityKey = ability as keyof typeof updatedAbilities;
        const shortKey = ability === 'strength' ? 'STR' : 
                       ability === 'dexterity' ? 'DEX' : 
                       ability === 'constitution' ? 'CON' : 
                       ability === 'intelligence' ? 'INT' : 
                       ability === 'wisdom' ? 'WIS' : 
                       ability === 'charisma' ? 'CHA' : '';
        
        if (abilityKey in updatedAbilities) {
          updatedAbilities[abilityKey] = (updatedAbilities[abilityKey] || 10) + 1;
          
          // Обновляем также короткое имя свойства
          if (shortKey && shortKey in updatedAbilities) {
            updatedAbilities[shortKey as keyof typeof updatedAbilities] = 
              (updatedAbilities[shortKey as keyof typeof updatedAbilities] || 10) + 1;
          }
        }
      }
    });
    
    updateCharacter({ abilities: updatedAbilities });
  };

  // Сколько осталось распределить бонусов
  const remainingBonuses = abilityBonuses.amount - selectedAbilities.filter(Boolean).length;

  // Проверяем наличие фиксированных бонусов
  const hasFixedBonuses = !!abilityBonuses.fixed && Object.keys(abilityBonuses.fixed).length > 0;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Увеличение характеристик</CardTitle>
        <CardDescription>
          {hasFixedBonuses && (
            <div className="mb-2">
              <p>Фиксированные бонусы:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(abilityBonuses.fixed!).map(([ability, bonus]) => (
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
