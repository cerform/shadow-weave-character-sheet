
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';

interface ResourcePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();
  
  // Вспомогательная функция для получения информации о костях хитов
  const getHitDiceInfo = () => {
    const hitDice = character.hitDice || { total: 0, used: 0, dieType: 'd6', value: '0d6' };
    const available = Math.max(0, hitDice.total - hitDice.used);
    return { hitDice, available };
  };
  
  // Вспомогательная функция для форматирования костей хитов
  const formatHitDice = (hitDice: Character['hitDice']) => {
    if (!hitDice) return '0d6';
    const available = Math.max(0, hitDice.total - hitDice.used);
    return `${available}${hitDice.dieType}`;
  };
  
  // Обработчик использования кости хитов
  const handleUseHitDie = () => {
    const { hitDice, available } = getHitDiceInfo();
    
    if (available <= 0) {
      toast({
        title: "Нет доступных костей хитов",
        description: "У вас не осталось неиспользованных костей хитов.",
        variant: "destructive",
      });
      return;
    }
    
    // Генерируем случайное число в зависимости от типа кости
    let max = 6;
    switch (hitDice.dieType) {
      case 'd6':
        max = 6;
        break;
      case 'd8':
        max = 8;
        break;
      case 'd10':
        max = 10;
        break;
      case 'd12':
        max = 12;
        break;
      default:
        max = 6;
    }
    
    const roll = Math.floor(Math.random() * max) + 1;
    const constitutionMod = Math.floor((character.constitution - 10) / 2);
    const healing = Math.max(1, roll + constitutionMod);
    
    // Обновляем здоровье и количество использованных костей хитов
    const newHp = Math.min(character.maxHp, character.currentHp + healing);
    const newHitDice = {
      ...hitDice,
      used: hitDice.used + 1,
      value: formatHitDice({ ...hitDice, used: hitDice.used + 1 })
    };
    
    onUpdate({
      currentHp: newHp,
      hitDice: newHitDice
    });
    
    toast({
      title: "Кость хитов использована",
      description: `Восстановлено ${healing} хитов (${roll}${hitDice.dieType} + ${constitutionMod}).`
    });
  };
  
  // Обработчик короткого отдыха
  const handleShortRest = () => {
    // Восстанавливаем часть костей хитов (половина от уровня, минимум 1)
    const { hitDice } = getHitDiceInfo();
    const recoveredDice = Math.max(1, Math.floor(character.level / 2));
    const newUsed = Math.max(0, hitDice.used - recoveredDice);
    
    const updatedHitDice = {
      ...hitDice,
      used: newUsed,
      value: `${hitDice.total - newUsed}${hitDice.dieType}`
    };
    
    // Восстанавливаем ресурсы, если у них есть свойство recoveryType === 'shortRest'
    const updatedResources = { ...character.resources };
    if (updatedResources) {
      Object.keys(updatedResources).forEach(key => {
        const resource = updatedResources[key];
        if (resource && resource.recoveryType === 'shortRest') {
          updatedResources[key] = {
            ...resource,
            used: 0
          };
        }
      });
    }
    
    onUpdate({
      hitDice: updatedHitDice,
      resources: updatedResources
    });
    
    toast({
      title: "Короткий отдых",
      description: `Восстановлено ${recoveredDice} костей хитов и некоторые ресурсы персонажа.`
    });
  };
  
  // Обработчик продолжительного отдыха
  const handleLongRest = () => {
    // Восстанавливаем все хиты
    const newHp = character.maxHp;
    
    // Восстанавливаем кости хитов (половина от общего количества, минимум 1)
    const { hitDice } = getHitDiceInfo();
    const recoveredDice = Math.max(1, Math.floor(hitDice.total / 2));
    const newUsed = Math.max(0, hitDice.used - recoveredDice);
    
    const updatedHitDice = {
      ...hitDice,
      used: newUsed,
      value: `${hitDice.total - newUsed}${hitDice.dieType}`
    };
    
    // Восстанавливаем все ресурсы
    const updatedResources = { ...character.resources };
    if (updatedResources) {
      Object.keys(updatedResources).forEach(key => {
        updatedResources[key] = {
          ...updatedResources[key],
          used: 0
        };
      });
    }
    
    onUpdate({
      currentHp: newHp,
      temporaryHp: 0,
      hitDice: updatedHitDice,
      resources: updatedResources
    });
    
    toast({
      title: "Продолжительный отдых",
      description: "Полностью восстановлены хиты, частично восстановлены кости хитов, восстановлены все ресурсы персонажа."
    });
  };
  
  const { hitDice, available } = getHitDiceInfo();
  const percentAvailable = hitDice.total > 0 ? (available / hitDice.total * 100) : 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Ресурсы</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Кости хитов */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Кости хитов</span>
            <span className="text-sm">{available}/{hitDice.total}{hitDice.dieType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={percentAvailable} className="flex-grow" />
            <Button 
              size="sm"
              variant="secondary"
              onClick={handleUseHitDie}
              disabled={available <= 0}
              className="h-8 px-3"
            >
              Использовать
            </Button>
          </div>
        </div>
        
        {/* Кнопки отдыха */}
        <div className="flex flex-col space-y-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShortRest}
          >
            Короткий отдых
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleLongRest}
          >
            Продолжительный отдых
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcePanel;
