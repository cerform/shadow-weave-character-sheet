

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
    
    // Восстанавливаем здоровье персонажа до максимума
    const updatedCharacter: Partial<Character> = {
      currentHp: character.maxHp,
      resources: updatedResources
    };
    
    // Сбрасываем использованные кости хитов, если они есть
    if (character.hitDice) {
      updatedCharacter.hitDice = {
        ...character.hitDice,
        used: 0
      };
    }
    
    // Обновляем персонажа
    onUpdate(updatedCharacter);
    
    // Отправляем уведомление
    toast({
      title: "Продолжительный отдых",
      description: "Персонаж полностью отдохнул и восстановил здоровье и все ресурсы.",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Отдых</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline"
            onClick={handleShortRest}
            className="flex flex-col items-center gap-2 p-6"
          >
            <Moon className="h-8 w-8" />
            <span>Короткий отдых</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleLongRest}
            className="flex flex-col items-center gap-2 p-6"
          >
            <Sun className="h-8 w-8" />
            <span>Продолжительный отдых</span>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4">
          Короткий отдых восстанавливает некоторые ресурсы, продолжительный - все ресурсы и здоровье.
        </p>
      </CardContent>
    </Card>
  );
};

export default RestPanel;
