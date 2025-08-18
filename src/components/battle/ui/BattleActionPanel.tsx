import { useBattleUIStore } from "@/stores/battleUIStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dice6, 
  Zap, 
  Sword, 
  Shield, 
  Eye, 
  EyeOff,
  Heart,
  Settings
} from "lucide-react";

export default function BattleActionPanel() {
  const { fogEnabled, toggleFog, addCombatEvent, activeId, tokens } = useBattleUIStore();
  
  const activeToken = tokens.find(t => t.id === activeId);

  const handleDiceRoll = () => {
    if (activeToken) {
      addCombatEvent({
        actor: activeToken.name,
        action: "Dice Roll",
        description: `${activeToken.name} бросает кубик`
      });
    }
  };

  const handleAttack = () => {
    if (activeToken) {
      addCombatEvent({
        actor: activeToken.name,
        action: "Attack",
        target: "Цель",
        damage: Math.floor(Math.random() * 12) + 1,
        description: `${activeToken.name} атакует`
      });
    }
  };

  const handleCastSpell = () => {
    if (activeToken) {
      addCombatEvent({
        actor: activeToken.name,
        action: "Spell",
        target: "Цель",
        damage: Math.floor(Math.random() * 20) + 1,
        description: `${activeToken.name} использует заклинание`
      });
    }
  };

  const handleDefend = () => {
    if (activeToken) {
      addCombatEvent({
        actor: activeToken.name,
        action: "Defend",
        description: `${activeToken.name} принимает оборонительную позицию`
      });
    }
  };

  const handleHeal = () => {
    if (activeToken) {
      addCombatEvent({
        actor: activeToken.name,
        action: "Heal",
        description: `${activeToken.name} лечится`
      });
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 bg-card/90 backdrop-blur-sm border-border shadow-xl">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Информация об активном токене */}
          {activeToken && (
            <div className="text-center pb-2 border-b border-border">
              <div className="text-sm font-medium text-primary">
                Ход: {activeToken.name}
              </div>
              <Badge variant="outline" className="mt-1">
                {activeToken.hp}/{activeToken.maxHp} HP
              </Badge>
            </div>
          )}

          {/* Основные действия */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="default"
              onClick={handleDiceRoll}
              className="flex items-center gap-2"
            >
              <Dice6 className="h-4 w-4" />
              Бросок
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleAttack}
              className="flex items-center gap-2"
            >
              <Sword className="h-4 w-4" />
              Атака
            </Button>

            <Button
              variant="secondary"
              onClick={handleCastSpell}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Магия
            </Button>

            <Button
              variant="outline"
              onClick={handleDefend}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Защита
            </Button>
          </div>

          {/* Дополнительные действия */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={handleHeal}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Лечение
            </Button>

            <Button
              variant="outline"
              onClick={() => toggleFog()}
              className="flex items-center gap-2"
            >
              {fogEnabled ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Скрыть
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Показать
                </>
              )}
            </Button>
          </div>

          {/* Настройки */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center gap-2 mt-2"
          >
            <Settings className="h-4 w-4" />
            Настройки
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}