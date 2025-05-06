
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
    });
    
    toast({
      title: "Короткий отдых",
      description: "Ваш персонаж отдохнул. Ресурсы короткого отдыха восстановлены.",
    });
  };
  
  // Функция для длительного отдыха
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
    
    // Восстанавливаем здоровье
    const maxHp = character.maxHp || 0;
    
    // Обновляем персонажа
    onUpdate({
      resources: updatedResources,
      currentHp: maxHp,
      tempHp: 0,
      temporaryHp: 0,
    });
    
    toast({
      title: "Длительный отдых",
      description: "Ваш персонаж хорошо отдохнул. Все ресурсы и здоровье восстановлены.",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Отдых</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Короткий отдых (1 час)</h3>
          <p className="text-sm text-muted-foreground">
            Восстановление ресурсов с меткой "short-rest"
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-center"
            onClick={handleShortRest}
          >
            <Moon className="mr-2 h-4 w-4" />
            Короткий отдых
          </Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Длительный отдых (8 часов)</h3>
          <p className="text-sm text-muted-foreground">
            Восстановление здоровья и всех ресурсов
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-center"
            onClick={handleLongRest}
          >
            <Sun className="mr-2 h-4 w-4" />
            Длительный отдых
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestPanel;
