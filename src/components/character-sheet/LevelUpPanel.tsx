
import React, { useState, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CharacterContext } from '@/contexts/CharacterContext';
import { ArrowUp, ArrowDown, Award } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export const LevelUpPanel = () => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { toast } = useToast();
  const [showLevelUpDialog, setShowLevelUpDialog] = useState(false);
  const [showLevelDownDialog, setShowLevelDownDialog] = useState(false);
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const handleLevelUp = () => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран",
        variant: "destructive"
      });
      return;
    }

    if (character.level >= 20) {
      toast({
        title: "Максимальный уровень",
        description: "Персонаж уже достиг максимального уровня",
      });
      return;
    }

    // Получаем следующий уровень
    const newLevel = (character.level || 1) + 1;
    
    // Рассчитываем дополнительные HP на основе класса и телосложения
    const conModifier = character.abilities?.CON 
      ? Math.floor((character.abilities.CON - 10) / 2) 
      : 0;
    
    let hitDie = 8; // По умолчанию d8
    
    // Определяем Hit Die на основе класса
    if (character.className?.toLowerCase().includes('варвар')) {
      hitDie = 12;
    } else if (
      character.className?.toLowerCase().includes('воин') ||
      character.className?.toLowerCase().includes('паладин') ||
      character.className?.toLowerCase().includes('следопыт')
    ) {
      hitDie = 10;
    } else if (
      character.className?.toLowerCase().includes('волшебник') ||
      character.className?.toLowerCase().includes('чародей')
    ) {
      hitDie = 6;
    }
    
    // Минимум 1 HP за уровень
    const hpGain = Math.max(1, Math.ceil(hitDie / 2) + conModifier);
    const newMaxHp = (character.maxHp || 0) + hpGain;
    
    // Обновляем слоты заклинаний, если персонаж заклинатель
    let updatedSpellSlots = { ...character.spellSlots };
    
    // Простая логика обновления слотов заклинаний на основе уровня
    // (в реальном приложении здесь будет более сложная логика на основе класса)
    if (
      character.className?.toLowerCase().includes('волшебник') ||
      character.className?.toLowerCase().includes('чародей') ||
      character.className?.toLowerCase().includes('жрец') ||
      character.className?.toLowerCase().includes('друид') ||
      character.className?.toLowerCase().includes('бард')
    ) {
      // Полный заклинатель получает новые слоты на основе таблицы из книги правил
      updatedSpellSlots = updateFullCasterSpellSlots(newLevel, updatedSpellSlots);
    } else if (
      character.className?.toLowerCase().includes('паладин') ||
      character.className?.toLowerCase().includes('следопыт')
    ) {
      // Полу-заклинатель (половина уровня персонажа для расчета)
      updatedSpellSlots = updateHalfCasterSpellSlots(newLevel, updatedSpellSlots);
    }
    
    // Обновляем персонажа
    updateCharacter({
      level: newLevel,
      maxHp: newMaxHp,
      currentHp: newMaxHp,
      spellSlots: updatedSpellSlots
    });
    
    // Уведомляем игрока
    toast({
      title: "Уровень повышен!",
      description: `Персонаж достиг ${newLevel} уровня. +${hpGain} к максимальному здоровью!`,
    });
    
    setShowLevelUpDialog(false);
  };

  const handleLevelDown = () => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран",
        variant: "destructive"
      });
      return;
    }

    if (character.level <= 1) {
      toast({
        title: "Минимальный уровень",
        description: "Персонаж уже на минимальном уровне",
      });
      return;
    }

    // Получаем предыдущий уровень
    const newLevel = (character.level || 2) - 1;
    
    // Примерный расчет HP для предыдущего уровня
    // (в реальном приложении здесь нужно хранить историю повышений уровня)
    const conModifier = character.abilities?.CON 
      ? Math.floor((character.abilities.CON - 10) / 2) 
      : 0;
    
    let hitDie = 8; // По умолчанию d8
    
    // Определяем Hit Die на основе класса
    if (character.className?.toLowerCase().includes('варвар')) {
      hitDie = 12;
    } else if (
      character.className?.toLowerCase().includes('воин') ||
      character.className?.toLowerCase().includes('паладин') ||
      character.className?.toLowerCase().includes('следопыт')
    ) {
      hitDie = 10;
    } else if (
      character.className?.toLowerCase().includes('волшебник') ||
      character.className?.toLowerCase().includes('чародей')
    ) {
      hitDie = 6;
    }
    
    // Минимум 1 HP за уровень
    const hpLoss = Math.max(1, Math.ceil(hitDie / 2) + conModifier);
    const newMaxHp = Math.max(1, (character.maxHp || 0) - hpLoss);
    const newCurrentHp = Math.min(newMaxHp, character.currentHp || 0);
    
    // Обновляем слоты заклинаний, если персонаж заклинатель
    let updatedSpellSlots = { ...character.spellSlots };
    
    // Простая логика обновления слотов заклинаний на основе уровня
    if (
      character.className?.toLowerCase().includes('волшебник') ||
      character.className?.toLowerCase().includes('чародей') ||
      character.className?.toLowerCase().includes('жрец') ||
      character.className?.toLowerCase().includes('друид') ||
      character.className?.toLowerCase().includes('бард')
    ) {
      // Полный заклинатель получает новые слоты на основе таблицы из книги правил
      updatedSpellSlots = updateFullCasterSpellSlots(newLevel, updatedSpellSlots);
    } else if (
      character.className?.toLowerCase().includes('паладин') ||
      character.className?.toLowerCase().includes('следопыт')
    ) {
      // Полу-заклинатель (половина уровня персонажа для расчета)
      updatedSpellSlots = updateHalfCasterSpellSlots(newLevel, updatedSpellSlots);
    }
    
    // Обновляем персонажа
    updateCharacter({
      level: newLevel,
      maxHp: newMaxHp,
      currentHp: newCurrentHp,
      spellSlots: updatedSpellSlots
    });
    
    // Уведомляем игрока
    toast({
      title: "Уровень понижен",
      description: `Персонаж понижен до ${newLevel} уровня.`,
    });
    
    setShowLevelDownDialog(false);
  };

  // Вспомогательная функция для обновления слотов заклинаний полных заклинателей
  const updateFullCasterSpellSlots = (level: number, currentSlots: Record<number, { max: number; used: number }>) => {
    // Таблица слотов заклинаний для полных заклинателей из книги правил
    const spellSlotTable = [
      {},
      { 1: 2 }, // 1 уровень персонажа
      { 1: 3 }, // 2
      { 1: 4, 2: 2 }, // 3
      { 1: 4, 2: 3 }, // 4
      { 1: 4, 2: 3, 3: 2 }, // 5
      { 1: 4, 2: 3, 3: 3 }, // 6
      { 1: 4, 2: 3, 3: 3, 4: 1 }, // 7
      { 1: 4, 2: 3, 3: 3, 4: 2 }, // 8
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 }, // 9
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 }, // 10
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 }, // 11
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 }, // 12
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 }, // 13
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 }, // 14
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 }, // 15
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 }, // 16
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 }, // 17
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 }, // 18
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 }, // 19
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 }, // 20
    ];

    if (level <= 0 || level > 20) {
      return currentSlots;
    }

    const newSlotsTable = spellSlotTable[level] as Record<string, number> || {};
    const newSlots: Record<number, { max: number; used: number }> = {};

    // Копируем текущее использование слотов, обновляя максимальные значения
    for (let i = 1; i <= 9; i++) {
      if (newSlotsTable[i]) {
        newSlots[i] = {
          max: newSlotsTable[i],
          used: currentSlots[i] ? Math.min(currentSlots[i].used, newSlotsTable[i]) : 0
        };
      } else {
        newSlots[i] = { max: 0, used: 0 };
      }
    }

    return newSlots;
  };

  // Вспомогательная функция для обновления слотов заклинаний полу-заклинателей (паладины, следопыты)
  const updateHalfCasterSpellSlots = (level: number, currentSlots: Record<number, { max: number; used: number }>) => {
    // Таблица слотов для полу-заклинателей (уровень заклинателя = уровень/2, округленный вниз)
    const halfCasterLevel = Math.floor(level / 2);
    
    // Паладины и следопыты начинают получать слоты заклинаний со 2-го уровня
    if (level < 2) {
      return { 1: { max: 0, used: 0 } };
    }
    
    // Используем ту же таблицу, что и для полных заклинателей, но с половинным уровнем заклинателя
    return updateFullCasterSpellSlots(halfCasterLevel, currentSlots);
  };

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.textColor }}>
        <Award className="inline mr-2" />
        Уровень персонажа: {character?.level || 1}
      </h3>
      
      <div className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => setShowLevelUpDialog(true)}
          disabled={character?.level === 20}
          style={{
            borderColor: currentTheme.accent,
            color: character?.level === 20 ? `${currentTheme.mutedTextColor}80` : currentTheme.textColor
          }}
        >
          <ArrowUp className="mr-2 h-4 w-4" />
          Повысить уровень
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => setShowLevelDownDialog(true)}
          disabled={character?.level === 1}
          style={{
            borderColor: currentTheme.accent,
            color: character?.level === 1 ? `${currentTheme.mutedTextColor}80` : currentTheme.textColor
          }}
        >
          <ArrowDown className="mr-2 h-4 w-4" />
          Понизить уровень
        </Button>
      </div>

      <Dialog open={showLevelUpDialog} onOpenChange={setShowLevelUpDialog}>
        <DialogContent 
          style={{
            backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'}`,
            borderColor: currentTheme.accent
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: currentTheme.textColor }}>
              Повышение уровня
            </DialogTitle>
            <DialogDescription style={{ color: currentTheme.mutedTextColor }}>
              Вы уверены, что хотите повысить уровень персонажа?
              Это увеличит здоровье и может открыть новые способности.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowLevelUpDialog(false)}
              style={{
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleLevelUp}
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              Повысить уровень
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLevelDownDialog} onOpenChange={setShowLevelDownDialog}>
        <DialogContent 
          style={{
            backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'}`,
            borderColor: currentTheme.accent
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: currentTheme.textColor }}>
              Понижение уровня
            </DialogTitle>
            <DialogDescription style={{ color: currentTheme.mutedTextColor }}>
              Вы уверены, что хотите понизить уровень персонажа?
              Это уменьшит здоровье и может ограничить доступные способности.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowLevelDownDialog(false)}
              style={{
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleLevelDown}
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              Понизить уровень
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LevelUpPanel;
