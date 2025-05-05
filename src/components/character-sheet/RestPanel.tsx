
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Character } from '@/types/character';

export interface RestPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const RestPanel: React.FC<RestPanelProps> = ({ character, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Handle short rest
  const handleShortRest = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      // 1. Calculate hit dice recovery
      const hitDice = character.hitDice || { total: character.level || 1, used: 0, dieType: 'd8', value: `${character.level || 1}d8` };
      
      // 2. Reset features that recover on a short rest
      // Class-specific recoveries would go here (e.g., warlock spell slots)
      
      // 3. Update character
      onUpdate({
        hitDice: {
          ...hitDice,
          // No hit dice recovery on short rest by default, user needs to manually use them
        }
      });
      
      toast({
        title: "Короткий отдых",
        description: "Персонаж завершил короткий отдых. Вы можете использовать кости хитов для восстановления здоровья.",
      });
      
      setIsProcessing(false);
    }, 500);
  };
  
  // Handle long rest
  const handleLongRest = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      // 1. Restore hit points to maximum
      const fullHealth = character.maxHp || 1;
      
      // 2. Recover hit dice (up to half of total hit dice, minimum of 1)
      const maxHitDice = character.level || 1;
      const hitDiceUsed = character.hitDice?.used || 0;
      const hitDiceRecovery = Math.max(1, Math.floor(maxHitDice / 2));
      const newHitDiceUsed = Math.max(0, hitDiceUsed - hitDiceRecovery);
      
      // 3. Reset all features and spell slots that recover on a long rest
      const updatedSpellSlots = { ...character.spellSlots };
      if (updatedSpellSlots) {
        // Reset all spell slots
        Object.keys(updatedSpellSlots).forEach(level => {
          if (updatedSpellSlots[Number(level)]) {
            updatedSpellSlots[Number(level)].used = 0;
          }
        });
      }
      
      // Reset death saving throws
      const resetDeathSaves = { successes: 0, failures: 0 };
      
      // 4. Update character
      onUpdate({
        currentHp: fullHealth,
        temporaryHp: 0, // Remove any temporary hit points
        hitDice: {
          ...character.hitDice,
          used: newHitDiceUsed
        },
        spellSlots: updatedSpellSlots,
        deathSaves: resetDeathSaves
      });
      
      // Reset any class resources
      if (character.resources) {
        const updatedResources = { ...character.resources };
        
        // Reset all resources
        Object.keys(updatedResources).forEach(key => {
          if (updatedResources[key]) {
            updatedResources[key].used = 0;
          }
        });
        
        onUpdate({ resources: updatedResources });
      }
      
      toast({
        title: "Продолжительный отдых",
        description: "Персонаж полностью восстановился после продолжительного отдыха.",
      });
      
      setIsProcessing(false);
    }, 800);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Отдых</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Короткий отдых (1 час)</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Восстанавливает некоторые способности и позволяет использовать кости хитов для лечения.
          </p>
          <Button 
            onClick={handleShortRest} 
            disabled={isProcessing}
            variant="outline"
            className="w-full"
          >
            {isProcessing ? "Обработка..." : "Короткий отдых"}
          </Button>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Продолжительный отдых (8 часов)</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Полностью восстанавливает здоровье, половину костей хитов и все способности.
          </p>
          <Button 
            onClick={handleLongRest}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? "Обработка..." : "Продолжительный отдых"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
