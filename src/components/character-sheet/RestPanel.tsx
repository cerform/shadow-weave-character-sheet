
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun } from 'lucide-react';

interface RestPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const RestPanel: React.FC<RestPanelProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();
  
  // Функция для короткого отдыха
  const handleShortRest = () => {
    // Обновляем ресурсы, которые восстанавливаются после короткого отдыха
    const updatedResources = { ...(character.resources || {}) };
    
    // Восстанавливаем ресурсы с типом short-rest или short
    if (character.resources) {
      Object.keys(character.resources).forEach(resourceKey => {
        const resource = character.resources?.[resourceKey];
        if (resource && (resource.recoveryType === 'short-rest' || resource.recoveryType === 'short')) {
          updatedResources[resourceKey] = { ...resource, used: 0 };
        }
      });
    }
    
    // Обновляем персонажа
    onUpdate({
      resources: updatedResources
    } as Partial<Character>);
    
    // Отправляем уведомление
    toast({
      title: "Короткий отдых",
      description: "Персонаж отдохнул и восстановил все ресурсы, которые восстанавливаются после короткого отдыха.",
    });
  };
  
  // Функция для продолжительного отдыха
  const handleLongRest = () => {
    // Восстанавливаем все ресурсы
    const updatedResources = { ...(character.resources || {}) };
    
    if (character.resources) {
      Object.keys(character.resources).forEach(resourceKey => {
        const resource = character.resources?.[resourceKey];
        if (resource) {
          updatedResources[resourceKey] = { ...resource, used: 0 };
        }
      });
    }
    
    // Восстанавливаем хит-поинты
    const maxHp = character.maxHp || 0;
    
    // Восстанавливаем кости хитов (половину от максимума, минимум 1)
    let updatedHitDice = character.hitDice;
    if (updatedHitDice) {
      const recoveredDice = Math.max(1, Math.floor(updatedHitDice.total / 2));
      const newUsed = Math.max(0, updatedHitDice.used - recoveredDice);
      updatedHitDice = { ...updatedHitDice, used: newUsed };
    }
    
    // Восстанавливаем ячейки заклинаний
    const updatedSpellSlots = { ...character.spellSlots };
    if (character.spellSlots) {
      Object.keys(character.spellSlots).forEach(level => {
        const slot = character.spellSlots?.[Number(level)];
        if (slot) {
          updatedSpellSlots[Number(level)] = { ...slot, used: 0 };
        }
      });
    }
    
    // Восстанавливаем очки колдовства (если есть)
    let updatedSorceryPoints = character.sorceryPoints;
    if (updatedSorceryPoints) {
      updatedSorceryPoints = { 
        max: updatedSorceryPoints.max,
        current: updatedSorceryPoints.max
      };
    }
    
    // Обновляем персонажа
    onUpdate({
      currentHp: maxHp,
      temporaryHp: 0,
      resources: updatedResources,
      hitDice: updatedHitDice,
      spellSlots: updatedSpellSlots,
      sorceryPoints: updatedSorceryPoints
    } as Partial<Character>);
    
    // Отправляем уведомление
    toast({
      title: "Продолжительный отдых",
      description: "Персонаж отдохнул и восстановил здоровье, ресурсы и половину костей хитов.",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Отдых</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Короткий отдых</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Восстанавливает ресурсы, которые восстанавливаются после короткого отдыха, и дает возможность
            использовать кости хитов для восстановления здоровья.
          </p>
          <Button 
            variant="outline" 
            onClick={handleShortRest}
            className="w-full"
          >
            <Moon className="h-4 w-4 mr-2" />
            Короткий отдых
          </Button>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Продолжительный отдых</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Восстанавливает все здоровье, все ресурсы и половину максимального количества костей хитов (минимум 1).
          </p>
          <Button 
            variant="default" 
            onClick={handleLongRest}
            className="w-full"
          >
            <Sun className="h-4 w-4 mr-2" />
            Продолжительный отдых
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestPanel;
