
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { AbilityName, abilityNames, abilityFullNames } from '@/utils/abilityUtils';

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
  const [selectedAbilities, setSelectedAbilities] = useState<Record<string, boolean>>({});
  const [bonuses, setBonuses] = useState<Partial<Record<string, number>>>({});
  
  // Инициализация выбранных способностей и бонусов
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    const initialBonuses: Partial<Record<string, number>> = {};
    
    // Если есть фиксированные бонусы, применяем их
    if (abilityBonuses.fixed) {
      Object.entries(abilityBonuses.fixed).forEach(([ability, value]) => {
        initialBonuses[ability] = value;
      });
    }
    
    // Если есть выбранные ранее, инициализируем их
    if (abilityBonuses.options && character.selectedAbilities) {
      character.selectedAbilities.forEach(ability => {
        if (abilityBonuses.options?.includes(ability)) {
          initial[ability] = true;
          initialBonuses[ability] = 1; // По умолчанию +1
        }
      });
    }
    
    setSelectedAbilities(initial);
    setBonuses(initialBonuses);
  }, [abilityBonuses, character.selectedAbilities]);
  
  // При изменении бонусов обновляем персонажа
  useEffect(() => {
    // Создаем безопасную копию бонусов
    const safeInitBonuses: Partial<Record<string, number>> = {};
    
    abilityNames.forEach(ability => {
      safeInitBonuses[ability] = 0;
    });
    
    // Применяем бонусы
    const finalBonuses = { ...safeInitBonuses, ...bonuses };
    
    // Обновляем характеристики персонажа
    updateCharacter({
      abilityBonuses: finalBonuses as any,
      selectedAbilities: Object.keys(selectedAbilities).filter(key => selectedAbilities[key])
    });
    
  }, [bonuses, selectedAbilities, updateCharacter]);
  
  // Обработчик выбора способности
  const handleAbilitySelect = (ability: string) => {
    // Проверяем, можно ли выбрать еще одну способность
    const currentSelected = Object.values(selectedAbilities).filter(Boolean).length;
    
    // Если уже выбрано максимальное количество и пытаемся выбрать новую - отклоняем
    if (currentSelected >= abilityBonuses.amount && !selectedAbilities[ability]) {
      return;
    }
    
    setSelectedAbilities(prev => {
      const updated = { ...prev, [ability]: !prev[ability] };
      
      // Обновляем также бонусы
      setBonuses(bonuses => {
        const newBonuses = { ...bonuses };
        
        if (updated[ability]) {
          newBonuses[ability] = (newBonuses[ability] || 0) + 1;
        } else {
          newBonuses[ability] = (newBonuses[ability] || 0) - 1;
          if (newBonuses[ability] <= 0) {
            delete newBonuses[ability];
          }
        }
        
        return newBonuses;
      });
      
      return updated;
    });
  };
  
  // Отображаем интерфейс выбора только если есть что выбирать
  if (abilityBonuses.amount <= 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Бонусы к характеристикам</CardTitle>
        <CardDescription>
          {abilityBonuses.amount > 0
            ? `Выберите ${abilityBonuses.amount} характеристик для получения бонуса +1`
            : "Бонусы к характеристикам уже распределены"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Фиксированные бонусы */}
        {abilityBonuses.fixed && Object.keys(abilityBonuses.fixed).length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Фиксированные бонусы:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(abilityBonuses.fixed).map(([ability, value]) => (
                <div key={ability} className="flex items-center justify-between p-2 border rounded">
                  <span>{abilityFullNames[ability as AbilityName] || ability}</span>
                  <span className="text-green-500">+{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Выбираемые бонусы */}
        {abilityBonuses.amount > 0 && (
          <>
            <h4 className="text-sm font-medium mb-2">
              Выберите характеристики ({Object.values(selectedAbilities).filter(Boolean).length}/{abilityBonuses.amount}):
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(abilityBonuses.options || abilityNames).map(ability => (
                <Button
                  key={ability}
                  variant={selectedAbilities[ability] ? "default" : "outline"}
                  onClick={() => handleAbilitySelect(ability)}
                  className="justify-between"
                >
                  <span>{abilityFullNames[ability as AbilityName] || ability}</span>
                  {selectedAbilities[ability] && <span className="ml-2 text-green-500">+1</span>}
                </Button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AbilityBonusSelector;
