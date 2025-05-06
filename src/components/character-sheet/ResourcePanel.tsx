
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { Progress } from '@/components/ui/progress';

interface ResourcePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ character, onUpdate }) => {
  // Обработка хитов
  const handleUseHitDie = () => {
    if (!character.hitDice) return;
    
    // Проверка, что есть доступные кости хитов
    const usedHitDice = character.hitDice?.used || 0;
    const totalHitDice = character.hitDice?.total || 0;
    
    if (totalHitDice <= usedHitDice) return;
    
    // Обновляем количество использованных костей
    onUpdate({
      hitDice: {
        ...character.hitDice,
        used: usedHitDice + 1
      }
    });
  };
  
  // Восстановление костей хитов
  const handleRecoverHitDie = () => {
    if (!character.hitDice) return;
    
    const usedHitDice = character.hitDice?.used || 0;
    
    if (usedHitDice <= 0) return;
    
    // Обновляем количество использованных костей
    onUpdate({
      hitDice: {
        ...character.hitDice,
        used: usedHitDice - 1
      }
    });
  };
  
  // Изменение значения ресурса
  const handleResourceChange = (resourceKey: string, value: number) => {
    if (!character.resources) return;
    
    const resourceData = character.resources[resourceKey];
    if (!resourceData) return;
    
    // Проверка на допустимые границы
    const newValue = Math.max(0, Math.min(value, resourceData.max || 0));
    
    // Обновляем значение ресурса
    onUpdate({
      resources: {
        ...character.resources,
        [resourceKey]: {
          ...resourceData,
          used: newValue
        }
      }
    });
  };
  
  // Использование временных хитов
  const setTemporaryHitPoints = (value: number) => {
    onUpdate({
      temporaryHp: value
    });
  };
  
  // Отображение костей хитов
  const renderHitDice = () => {
    if (!character.hitDice) return null;
    
    const { total, used, dieType, value } = character.hitDice;
    const available = total - (used || 0);
    
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm">Кости хитов ({dieType || 'd8'})</span>
          <span className="text-sm font-medium">
            {available}/{total}
          </span>
        </div>
        
        <div className="flex space-x-1">
          <Progress 
            value={((total - used) / total) * 100} 
            className="h-2"
          />
        </div>
        
        <div className="flex justify-between mt-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleUseHitDie}
            disabled={available <= 0}
          >
            Использовать
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRecoverHitDie}
            disabled={used <= 0}
          >
            Восстановить
          </Button>
        </div>
      </div>
    );
  };

  // Отображение ячеек заклинаний
  const renderSpellSlots = () => {
    if (!character.spellSlots) return null;
    
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Ячейки заклинаний</h3>
        
        {Object.entries(character.spellSlots).map(([level, { max, used }]) => (
          <div key={`spell-slot-${level}`} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm">Уровень {level}</span>
              <span className="text-sm font-medium">{max - used}/{max}</span>
            </div>
            
            <Progress 
              value={((max - used) / max) * 100}
              className="h-1.5" 
            />
          </div>
        ))}
      </div>
    );
  };

  // Отображение других ресурсов
  const renderResources = () => {
    if (!character.resources || Object.keys(character.resources).length === 0) {
      return null;
    }
    
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Ресурсы</h3>
        
        {Object.entries(character.resources).map(([key, resource]) => {
          const { max = 0, used = 0 } = resource || {};
          const available = max - used;
          const percentage = max > 0 ? (available / max) * 100 : 0;
          
          return (
            <div key={`resource-${key}`} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm">{key}</span>
                <span className="text-sm font-medium">{available}/{max}</span>
              </div>
              
              <Progress value={percentage} className="h-1.5" />
              
              <div className="flex justify-between space-x-2 mt-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleResourceChange(key, used + 1)}
                  disabled={used >= max}
                >
                  -
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleResourceChange(key, used - 1)}
                  disabled={used <= 0}
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ресурсы</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Кости хитов */}
        {renderHitDice()}
        
        {/* Ячейки заклинаний */}
        {renderSpellSlots()}
        
        {/* Другие ресурсы */}
        {renderResources()}
      </CardContent>
    </Card>
  );
};

export default ResourcePanel;
