
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useContext } from 'react';
import { CharacterContext } from '@/contexts/CharacterContext';

interface RestPanelProps {
  character?: any;
  onUpdate?: (updates: any) => void;
}

const RestPanel: React.FC<RestPanelProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();
  const { updateCharacter } = useContext(CharacterContext);

  const takeShortRest = () => {
    if (!character) return;

    // Восстановление части хитов за счет костей хитов
    if (character.hitDice && character.hitDice.used < character.hitDice.total) {
      // Бросаем кость хитов (здесь нужна логика броска кости)
      const dieSize = character.hitDice.size ? parseInt(character.hitDice.size.slice(1)) : 8;
      const healAmount = Math.floor(Math.random() * dieSize) + 1;

      // Увеличиваем текущее количество хитов, но не выше максимального
      const newCurrentHp = Math.min((character.currentHp || 0) + healAmount, character.maxHp || 1);

      // Увеличиваем количество использованных костей хитов
      const newUsedHitDice = (character.hitDice.used || 0) + 1;

      updateCharacter({
        currentHp: newCurrentHp,
        hitDice: {
          ...character.hitDice,
          used: newUsedHitDice
        }
      });

      toast({
        title: "Короткий отдых",
        description: `Восстановлено ${healAmount} хитов. Использовано костей хитов: ${newUsedHitDice}/${character.hitDice.total}`,
      });
    } else {
      toast({
        title: "Короткий отдых",
        description: "Недостаточно костей хитов для восстановления",
      });
    }
  };

  const takeLongRest = () => {
    if (!character) return;

    // Полное восстановление хитов
    updateCharacter({ currentHp: character.maxHp });

    // Восстановление всех использованных костей хитов
    resetHitDice();

    toast({
      title: "Длительный отдых",
      description: "Хиты и кости хитов полностью восстановлены",
    });
  };

  // В функции resetHitDice, обработаем возможные форматы hitDice:
  const resetHitDice = () => {
    if (!character) return;
    
    // Стандартизируем формат hitDice
    let updatedHitDice;
    
    if (!character.hitDice) {
      // Если hitDice нет, создаем его
      updatedHitDice = {
        total: character.level || 1,
        used: 0,
        size: getHitDieSize(character.class || "Воин")
      };
    } else if ('value' in character.hitDice) {
      // Если есть поле value вместо size, приводим к нужному формату
      updatedHitDice = {
        total: character.level || 1,
        used: 0,
        size: (character.hitDice as any).value || getHitDieSize(character.class || "Воин")
      };
    } else {
      // Стандартный формат - просто сбрасываем used
      updatedHitDice = {
        ...character.hitDice,
        used: 0
      };
    }
    
    updateCharacter({ hitDice: updatedHitDice });
    
    toast({
      title: "Отдых завершен",
      description: "Кости хитов восстановлены",
    });
  };

  // Вспомогательная функция для определения размера кости хитов
  const getHitDieSize = (className: string): string => {
    const hitDiceByClass: {[key: string]: string} = {
      "Варвар": "d12",
      "Воин": "d10",
      "Паладин": "d10",
      "Следопыт": "d10",
      "Монах": "d8",
      "Плут": "d8",
      "Бард": "d8",
      "Жрец": "d8",
      "Друид": "d8",
      "Волшебник": "d6",
      "Чародей": "d6",
      "Колдун": "d8"
    };
    
    return hitDiceByClass[className] || "d8";
  };

  return (
    <Card className="border-t-4 border-t-primary/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Отдых</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <Button onClick={takeShortRest} variant="outline">
            Короткий отдых
          </Button>
          <Button onClick={takeLongRest} variant="outline">
            Длительный отдых
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestPanel;
