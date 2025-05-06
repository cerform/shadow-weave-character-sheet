
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { ArrowDown01, ArrowDownUp, ArrowUp01, Plus, Minus } from 'lucide-react';

interface ResourcePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();
  const [temporaryHp, setTemporaryHp] = useState<number>(0);
  
  // Обработка изменений костей хитов
  const handleHitDiceChange = (action: 'use' | 'recover') => {
    // Если костей хитов нет, ничего не делаем
    if (!character.hitDice) return;
    
    const currentHitDice = character.hitDice;
    
    if (action === 'use' && currentHitDice.used < currentHitDice.total) {
      onUpdate({
        hitDice: {
          ...currentHitDice,
          used: currentHitDice.used + 1
        }
      } as Partial<Character>);
      
      toast({
        title: "Кость хитов использована",
        description: `Осталось костей хитов: ${currentHitDice.total - (currentHitDice.used + 1)}`,
      });
    } else if (action === 'recover' && currentHitDice.used > 0) {
      onUpdate({
        hitDice: {
          ...currentHitDice,
          used: currentHitDice.used - 1
        }
      } as Partial<Character>);
      
      toast({
        title: "Кость хитов восстановлена",
        description: `Осталось костей хитов: ${currentHitDice.total - (currentHitDice.used - 1)}`,
      });
    }
  };
  
  // Обработка изменений очков заклинаний
  const handleSpellSlotChange = (level: number, action: 'use' | 'recover') => {
    if (!character.spellSlots) return;
    
    const currentSpellSlots = character.spellSlots[level];
    if (!currentSpellSlots) return;
    
    if (action === 'use' && currentSpellSlots.used < currentSpellSlots.max) {
      onUpdate({
        spellSlots: {
          ...character.spellSlots,
          [level]: {
            ...currentSpellSlots,
            used: currentSpellSlots.used + 1
          }
        }
      });
      
      toast({
        title: `Ячейка заклинания ${level} уровня использована`,
        description: `Осталось ячеек: ${currentSpellSlots.max - (currentSpellSlots.used + 1)}`,
      });
    } else if (action === 'recover' && currentSpellSlots.used > 0) {
      onUpdate({
        spellSlots: {
          ...character.spellSlots,
          [level]: {
            ...currentSpellSlots,
            used: currentSpellSlots.used - 1
          }
        }
      });
      
      toast({
        title: `Ячейка заклинания ${level} уровня восстановлена`,
        description: `Осталось ячеек: ${currentSpellSlots.max - (currentSpellSlots.used - 1)}`,
      });
    }
  };
  
  // Обработка изменений других ресурсов
  const handleResourceChange = (resourceKey: string, action: 'use' | 'recover') => {
    if (!character.resources) return;
    
    const resource = character.resources[resourceKey];
    if (!resource) return;
    
    if (action === 'use' && resource.used < resource.max) {
      onUpdate({
        resources: {
          ...character.resources,
          [resourceKey]: {
            ...resource,
            used: resource.used + 1
          }
        }
      } as Partial<Character>);
      
      toast({
        title: `Ресурс ${resourceKey} использован`,
        description: `Осталось: ${resource.max - (resource.used + 1)}`,
      });
    } else if (action === 'recover' && resource.used > 0) {
      onUpdate({
        resources: {
          ...character.resources,
          [resourceKey]: {
            ...resource,
            used: resource.used - 1
          }
        }
      } as Partial<Character>);
      
      toast({
        title: `Ресурс ${resourceKey} восстановлен`,
        description: `Осталось: ${resource.max - (resource.used - 1)}`,
      });
    }
  };
  
  // Добавление временных хитов
  const addTemporaryHp = () => {
    if (temporaryHp <= 0) return;
    
    onUpdate({
      temporaryHp: temporaryHp
    } as Partial<Character>);
    
    toast({
      title: "Временные хиты добавлены",
      description: `+${temporaryHp} временных хитов`,
    });
    
    setTemporaryHp(0);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Ресурсы</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Кости хитов */}
        {character.hitDice && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Кости хитов ({character.hitDice.dieType}):</span>
              <span>{character.hitDice.total - character.hitDice.used}/{character.hitDice.total}</span>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleHitDiceChange('use')}
                disabled={!character.hitDice || character.hitDice.used >= character.hitDice.total}
                className="flex-1"
              >
                <ArrowDown01 className="h-4 w-4 mr-1" />
                Использовать
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleHitDiceChange('recover')}
                disabled={!character.hitDice || character.hitDice.used <= 0}
                className="flex-1"
              >
                <ArrowUp01 className="h-4 w-4 mr-1" />
                Восстановить
              </Button>
            </div>
          </div>
        )}
        
        {/* Ячейки заклинаний */}
        {character.spellSlots && Object.entries(character.spellSlots).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Ячейки заклинаний:</h4>
            
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(character.spellSlots).map(([level, slots]) => (
                <div key={`spell-slot-${level}`} className="border p-2 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{level} уровень:</span>
                    <span className="text-sm">{slots.max - slots.used}/{slots.max}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSpellSlotChange(Number(level), 'use')}
                      disabled={slots.used >= slots.max}
                      className="flex-1 p-1 h-7 text-xs"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSpellSlotChange(Number(level), 'recover')}
                      disabled={slots.used <= 0}
                      className="flex-1 p-1 h-7 text-xs"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Другие ресурсы */}
        {character.resources && Object.keys(character.resources).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Прочие ресурсы:</h4>
            
            <div className="space-y-2">
              {Object.entries(character.resources).map(([key, resource]) => (
                <div key={`resource-${key}`} className="border p-2 rounded">
                  <div className="flex justify-between mb-1">
                    <span>{key}:</span>
                    <span>{resource.max - resource.used}/{resource.max}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleResourceChange(key, 'use')}
                      disabled={resource.used >= resource.max}
                      className="flex-1"
                    >
                      Использовать
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleResourceChange(key, 'recover')}
                      disabled={resource.used <= 0}
                      className="flex-1"
                    >
                      Восстановить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Временные хиты */}
        <div className="space-y-2">
          <h4 className="font-medium">Временные хиты:</h4>
          
          <div className="flex space-x-2">
            <Input 
              type="number" 
              value={temporaryHp}
              onChange={(e) => setTemporaryHp(parseInt(e.target.value) || 0)}
              min={0}
              className="flex-1"
            />
            <Button 
              onClick={addTemporaryHp}
              disabled={temporaryHp <= 0}
            >
              Добавить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcePanel;
