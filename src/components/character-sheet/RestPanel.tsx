
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { Bed, Clock } from 'lucide-react';

interface RestPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const RestPanel: React.FC<RestPanelProps> = ({ character, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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

    // Особый случай для колдуна: восстанавливаем ячейки заклинаний
    if (character.class && ['колдун', 'warlock'].includes(character.class.toLowerCase()) && character.spellSlots) {
      const updatedSpellSlots = { ...(character.spellSlots || {}) };
      
      // Для колдуна все ячейки восстанавливаются после короткого отдыха
      Object.keys(updatedSpellSlots).forEach((level) => {
        const levelNum = parseInt(level);
        updatedSpellSlots[levelNum] = {
          ...updatedSpellSlots[levelNum],
          used: 0
        };
      });
      
      onUpdate({
        resources: updatedResources,
        hitDice: updatedHitDice,
        spellSlots: updatedSpellSlots
      });
      
      toast({
        title: "Короткий отдых завершен",
        description: "Восстановлены ресурсы и ячейки заклинаний колдуна",
      });
    } else {
      // Для всех остальных классов просто обновляем ресурсы
      onUpdate({
        resources: updatedResources,
        hitDice: updatedHitDice
      });
      
      toast({
        title: "Короткий отдых завершен",
        description: "Восстановлены ресурсы, связанные с коротким отдыхом",
      });
    }
    
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
      used: Math.max(0, updatedHitDice.used - hitDiceRecovery)
    };
    
    // Восстанавливаем ячейки заклинаний
    const updatedSpellSlots = { ...(character.spellSlots || {}) };
    Object.keys(updatedSpellSlots).forEach((level) => {
      updatedSpellSlots[Number(level)] = {
        ...updatedSpellSlots[Number(level)],
        used: 0
      };
    });

    // Восстанавливаем очки колдовства, если есть
    let updatedSorceryPoints = undefined;
    if (character.sorceryPoints) {
      updatedSorceryPoints = {
        ...character.sorceryPoints,
        current: character.sorceryPoints.max
      };
    }
    
    // Обновляем состояние персонажа
    onUpdate({
      currentHp: character.maxHp || 0, // Полное исцеление
      temporaryHp: 0,             // Сбрасываем временные хиты
      resources: updatedResources,
      hitDice: updatedHitDice,
      spellSlots: updatedSpellSlots,
      sorceryPoints: updatedSorceryPoints,
      deathSaves: { successes: 0, failures: 0 } // Сбрасываем спасброски от смерти
    });
    
    toast({
      title: "Длительный отдых завершен",
      description: "Здоровье полностью восстановлено, ресурсы и ячейки заклинаний обновлены",
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
            <Clock className="mr-2 h-4 w-4" />
            Короткий отдых
          </Button>
          <Button
            variant="default"
            className="w-full"
            onClick={handleLongRest}
            disabled={isProcessing}
          >
            <Bed className="mr-2 h-4 w-4" />
            Длительный отдых
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Короткий отдых:</strong> Восстанавливает некоторые ресурсы персонажа.</p>
          <p className="mt-1"><strong>Длительный отдых:</strong> Восстанавливает здоровье, все ячейки заклинаний и ресурсы.</p>
        </div>
        
        {character.class && ['колдун', 'warlock'].includes(character.class.toLowerCase()) && (
          <div className="text-sm border-t border-accent/20 pt-2 mt-2 text-muted-foreground">
            <p className="font-semibold">Особенность колдуна:</p>
            <p>Ячейки заклинаний восстанавливаются после короткого отдыха.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RestPanel;
