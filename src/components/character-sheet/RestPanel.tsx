import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useContext } from 'react';
import { CharacterContext } from '@/contexts/CharacterContext';
import { Character } from '@/contexts/CharacterContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface RestPanelProps {
  character: Character | null;
  onHitPointsChange: (newHp: number) => void;
  onHitDiceChange: (newHitDice: any) => void;
  onSpellSlotsChange: (newSpellSlots: any) => void;
  onSorceryPointsChange: (newSorceryPoints: any) => void;
}

const RestPanel: React.FC<RestPanelProps> = ({ character, onHitPointsChange, onHitDiceChange, onSpellSlotsChange, onSorceryPointsChange }) => {
  const { updateCharacter } = useContext(CharacterContext);
  const { toast } = useToast();
  const [tempHp, setTempHp] = useState('');
  const theme = useTheme();
  const themeKey = (theme.theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const handleHeal = (amount: number) => {
    if (!character) return;

    const newHp = Math.min((character.currentHp || 0) + amount, character.maxHp || 1);
    updateCharacter({ currentHp: newHp });

    toast({
      title: "Здоровье восстановлено",
      description: `Восстановлено ${amount} HP. Текущее здоровье: ${newHp}`,
    });

    onHitPointsChange(newHp);
  };

  const handleDamage = (amount: number) => {
    if (!character) return;

    const newHp = Math.max((character.currentHp || 0) - amount, 0);
    updateCharacter({ currentHp: newHp });

    toast({
      title: "Получен урон",
      description: `Получено ${amount} урона. Текущее здоровье: ${newHp}`,
    });

    onHitPointsChange(newHp);
  };

  const handleSetTempHp = () => {
    if (!character) return;

    const amount = parseInt(tempHp);
    if (isNaN(amount)) {
      toast({
        title: "Ошибка",
        description: "Введите корректное значение временных HP.",
        variant: "destructive",
      });
      return;
    }

    updateCharacter({ temporaryHp: amount });
    toast({
      title: "Временные HP установлены",
      description: `Установлено ${amount} временных HP.`,
    });

    onHitPointsChange(character.currentHp);
  };

  const handleLongRest = () => {
    if (!character) return;

    // Восстанавливаем все HP
    updateCharacter({ currentHp: character.maxHp, temporaryHp: 0 });

    // Восстанавливаем все хиты кости
    updateCharacter({
      hitDice: {
        ...character.hitDice,
        used: 0,
      },
    });

    // Восстанавливаем все ячейки заклинаний
    if (character.spellSlots) {
      const updatedSpellSlots = {};
      for (const level in character.spellSlots) {
        updatedSpellSlots[level] = {
          max: character.spellSlots[level].max,
          used: 0,
        };
      }
      updateCharacter({ spellSlots: updatedSpellSlots });
    }

    // Восстанавливаем очки чародейства
    const updatedCharacter: Partial<Character> = {};
    if (character.sorceryPoints) {
      if ('current' in character.sorceryPoints) {
        updatedCharacter.sorceryPoints = {
          ...character.sorceryPoints,
          current: character.sorceryPoints.max
        };
      } else {
        updatedCharacter.sorceryPoints = {
          ...character.sorceryPoints,
          used: 0
        };
      }
    }

    updateCharacter(updatedCharacter);

    toast({
      title: "Длительный отдых завершен",
      description: "Здоровье, хиты кости и ячейки заклинаний восстановлены.",
    });

    onHitPointsChange(character.maxHp);
    onHitDiceChange({ used: 0 });
    onSpellSlotsChange({});
    onSorceryPointsChange({ current: character.sorceryPoints.max });
  };

  const handleShortRest = () => {
    if (!character) return;

    toast({
      title: "Короткий отдых завершен",
      description: "Персонаж отдохнул.",
    });
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20 p-4">
      <CardHeader>
        <CardTitle style={{ color: currentTheme.textColor }}>Отдых и восстановление</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="healAmount" style={{ color: currentTheme.textColor }}>Восстановить HP</Label>
          <div className="flex mt-2">
            <Button
              onClick={() => handleHeal(5)}
              className="mr-2"
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              +5 HP
            </Button>
            <Button
              onClick={() => handleHeal(10)}
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              +10 HP
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="damageAmount" style={{ color: currentTheme.textColor }}>Получить урон</Label>
          <div className="flex mt-2">
            <Button
              onClick={() => handleDamage(5)}
              className="mr-2"
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              -5 HP
            </Button>
            <Button
              onClick={() => handleDamage(10)}
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              -10 HP
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="tempHpAmount" style={{ color: currentTheme.textColor }}>Временные HP</Label>
          <div className="flex mt-2 items-center">
            <Input
              id="tempHpAmount"
              type="number"
              placeholder="Количество"
              value={tempHp}
              onChange={(e) => setTempHp(e.target.value)}
              className="mr-2"
              style={{
                backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.5)'}`,
                color: currentTheme.textColor,
                borderColor: currentTheme.accent
              }}
            />
            <Button
              onClick={handleSetTempHp}
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              Установить
            </Button>
          </div>
        </div>
        <div>
          <Button
            onClick={handleLongRest}
            className="w-full"
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.buttonText
            }}
          >
            Длительный отдых
          </Button>
          <Button
            onClick={handleShortRest}
            className="w-full mt-2"
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.buttonText
            }}
          >
            Короткий отдых
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestPanel;
