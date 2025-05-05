
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Character } from '@/types/character';

interface RestPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const RestPanel: React.FC<RestPanelProps> = ({ character, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleShortRest = () => {
    setIsProcessing(true);
    // Восстанавливаем ресурсы, которые восстанавливаются после короткого отдыха
    
    // Создаем копии ресурсов и хитдайсов
    const updatedResources = { ...(character.resources || {}) };
    const updatedHitDice = character.hitDice ? { ...character.hitDice } : { total: character.level, used: 0, dieType: 'd8', value: '1d8' };
    
    // Восстанавливаем ресурсы с типом восстановления "short" или "short-rest"
    Object.keys(updatedResources).forEach((key) => {
      const resource = updatedResources[key];
      if (resource.recoveryType === 'short' || resource.recoveryType === 'short-rest') {
        updatedResources[key] = { ...resource, used: 0 };
      }
    });
    
    // Обновляем состояние персонажа
    onUpdate({
      resources: updatedResources,
      hitDice: updatedHitDice
    });
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 500);
  };

  const handleLongRest = () => {
    setIsProcessing(true);
    // Восстанавливаем ресурсы и здоровье после длительного отдыха
    
    // Создаем копии ресурсов и хитдайсов
    const updatedResources = { ...(character.resources || {}) };
    let updatedHitDice = character.hitDice ? { ...character.hitDice } : { total: character.level, used: 0, dieType: 'd8', value: '1d8' };
    
    // Восстанавливаем все ресурсы
    Object.keys(updatedResources).forEach((key) => {
      updatedResources[key] = { ...updatedResources[key], used: 0 };
    });
    
    // Восстанавливаем хитдайсы (до половины максимума)
    const hitDiceRecovery = Math.max(1, Math.floor(updatedHitDice.total / 2));
    updatedHitDice = {
      ...updatedHitDice,
      used: Math.max(0, updatedHitDice.used - hitDiceRecovery),
      dieType: updatedHitDice.dieType,
      value: updatedHitDice.value
    };
    
    // Восстанавливаем ячейки заклинаний
    const updatedSpellSlots = { ...(character.spellSlots || {}) };
    Object.keys(updatedSpellSlots).forEach((level) => {
      updatedSpellSlots[Number(level)] = {
        ...updatedSpellSlots[Number(level)],
        used: 0
      };
    });
    
    // Обновляем состояние персонажа
    onUpdate({
      currentHp: character.maxHp,
      temporaryHp: 0,
      resources: updatedResources,
      hitDice: updatedHitDice,
      spellSlots: updatedSpellSlots,
      deathSaves: { successes: 0, failures: 0 }
    });
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Отдых</CardTitle>
        <CardDescription>
          Восстановите силы и ресурсы вашего персонажа
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleShortRest}
            disabled={isProcessing}
          >
            Короткий отдых
          </Button>
          <Button
            variant="default"
            className="w-full"
            onClick={handleLongRest}
            disabled={isProcessing}
          >
            Продолжительный отдых
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Короткий отдых:</strong> Восстанавливает определенные ресурсы и позволяет использовать Кости Хитов.</p>
          <p><strong>Продолжительный отдых:</strong> Восстанавливает здоровье до максимума, все ресурсы и половину потраченных Костей Хитов.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestPanel;
