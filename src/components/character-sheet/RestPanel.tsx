import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoonStar, Sun } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Character } from '@/types/character.d';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";

interface RestPanelProps {
  character: Character | null;
  onUpdate: (updates: Partial<Character>) => void;
}

const RestPanel = ({ character, onUpdate }: RestPanelProps) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { toast } = useToast();
  
  const handleShortRest = () => {
    if (!character) return;
    
    // Восстанавливаем использованные кубики хитов (но не более половины от максимума)
    const hitDice = character.hitDice || { total: character.level || 1, used: 0, value: 'd8' };
    
    // Восстанавливаем часть кубиков хитов и позволяем игроку использовать их
    const message = `Вы можете использовать кубики хитов для восстановления здоровья.`;
    
    toast({
      title: "Короткий отдых",
      description: message,
    });
  };
  
  const handleLongRest = () => {
    if (!character) return;
    
    // Восстанавливаем все хиты
    const maxHp = character.maxHp || 0;
    
    // Восстанавливаем половину кубиков хитов (минимум 1)
    const hitDice = character.hitDice || { total: character.level || 1, used: 0, value: 'd8' };
    const regainedHitDice = Math.max(1, Math.floor(hitDice.total / 2));
    const newUsedHitDice = Math.max(0, hitDice.used - regainedHitDice);
    
    // Восстанавливаем все слоты заклинаний, если они есть
    const updatedSpellSlots = character.spellSlots ? { ...character.spellSlots } : {};
    if (character.spellSlots) {
      Object.keys(character.spellSlots).forEach(level => {
        const slotInfo = character.spellSlots?.[level];
        if (slotInfo) {
          updatedSpellSlots[level] = {
            ...slotInfo,
            used: 0
          };
        }
      });
    }
    
    // Обновляем персонажа после длительного отдыха
    onUpdate({
      currentHp: maxHp,
      temporaryHp: 0,
      hitDice: {
        ...hitDice,
        used: newUsedHitDice
      },
      spellSlots: updatedSpellSlots
    });
    
    toast({
      title: "Длительный отдых",
      description: "Вы полностью восстановили здоровье, часть кубиков хитов и все слоты заклинаний.",
    });
  };
  
  return (
    <Card className={`bg-card/30 backdrop-blur-sm border-primary/20 theme-${theme}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <MoonStar className="h-5 w-5 mr-2 text-indigo-400" />
          Отдых
        </CardTitle>
      </CardHeader>
      <CardContent>
        {character && (
          <div className="mb-4">
            <div className="text-sm font-medium">
              {character.currentHp}/{character.maxHp} HP
            </div>
            <Progress 
              value={(character.currentHp || 0) / (character.maxHp || 1) * 100} 
              className="h-2 mt-1"
            />
          </div>
        )}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              className="flex flex-col py-6"
              onClick={handleShortRest}
              style={{ borderColor: currentTheme.accent }}
            >
              <Sun className="h-6 w-6 mb-2" />
              <span>Короткий отдых</span>
              <span className="text-xs text-muted-foreground mt-1">Восстанавливает ресурсы</span>
            </Button>
            
            <Button 
              variant="outline"
              className="flex flex-col py-6"
              onClick={handleLongRest}
              style={{ borderColor: currentTheme.accent }}
            >
              <MoonStar className="h-6 w-6 mb-2" />
              <span>Длительный отдых</span>
              <span className="text-xs text-muted-foreground mt-1">Полное восстановление</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestPanel;
