import { useState } from "react";
import { useBattleUIStore } from "@/stores/battleUIStore";
import { useEnhancedBattleStore } from "@/stores/enhancedBattleStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dice6, 
  Zap, 
  Sword, 
  Shield, 
  Eye, 
  EyeOff,
  Heart,
  Settings,
  Move,
  Target,
  Wand2,
  Scroll,
  Plus
} from "lucide-react";

// D&D 5e stats and modifiers
const getModifier = (stat: number) => Math.floor((stat - 10) / 2);

const dndStats = {
  strength: 16,
  dexterity: 14,
  constitution: 15,
  intelligence: 12,
  wisdom: 13,
  charisma: 10
};

const attackTypes = [
  { name: "Рукопашная атака", stat: "strength", damage: "1d8", type: "physical" },
  { name: "Дальняя атака", stat: "dexterity", damage: "1d6", type: "physical" },
  { name: "Атака заклинанием", stat: "intelligence", damage: "1d10", type: "magical" },
  { name: "Критический удар", stat: "strength", damage: "2d8", type: "critical" }
];

const spells = [
  { name: "Огненный шар", level: 3, damage: "8d6", type: "fire", stat: "intelligence" },
  { name: "Лечение ран", level: 1, healing: "1d8+3", type: "healing", stat: "wisdom" },
  { name: "Магическая стрела", level: 1, damage: "1d4+1", type: "force", stat: "intelligence" },
  { name: "Щит", level: 1, effect: "+5 AC", type: "protection", stat: "intelligence" },
  { name: "Молния", level: 3, damage: "8d6", type: "lightning", stat: "intelligence" }
];

const healingOptions = [
  { name: "Зелье лечения", healing: "2d4+2", type: "potion" },
  { name: "Лечение ран", healing: "1d8+3", type: "spell", stat: "wisdom" },
  { name: "Массовое лечение", healing: "3d8+5", type: "spell", stat: "wisdom" },
  { name: "Второе дыхание", healing: "1d10+5", type: "ability" }
];

export default function EnhancedBattleActionPanel() {
  const [selectedAttack, setSelectedAttack] = useState("");
  const [selectedSpell, setSelectedSpell] = useState("");
  const [selectedHealing, setSelectedHealing] = useState("");
  const [rollType, setRollType] = useState("");
  
  const { fogEnabled, toggleFog, addCombatEvent, activeId, tokens } = useBattleUIStore();
  const { 
    showMovementGrid, 
    setShowMovementGrid, 
    tokens: enhancedTokens,
    activeId: enhancedActiveId,
    addCombatEvent: addEnhancedCombatEvent,
    nextTurn,
    combatStarted,
    initiativeOrder
  } = useEnhancedBattleStore();
  
  const activeToken = tokens.find(t => t.id === activeId);
  const enhancedActiveToken = enhancedTokens.find(t => t.id === enhancedActiveId);

  const rollDice = (sides: number, count: number = 1, modifier: number = 0) => {
    let total = 0;
    const rolls = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }
    return { total: total + modifier, rolls, modifier };
  };

  const parseDiceString = (diceStr: string) => {
    // Parse strings like "1d8+3", "2d6", "3d4-1"
    const match = diceStr.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return { count: 1, sides: 6, modifier: 0 };
    
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;
    
    return { count, sides, modifier };
  };

  const handleStatRoll = (statName: string) => {
    const stat = dndStats[statName as keyof typeof dndStats];
    const modifier = getModifier(stat);
    const { total, rolls } = rollDice(20, 1, modifier);
    
    if (activeToken) {
      addEnhancedCombatEvent({
        actor: activeToken.name,
        action: 'Бросок кубика',
        description: `Проверка ${statName}: ${total} (${rolls[0]}${modifier >= 0 ? '+' : ''}${modifier})`,
        diceRoll: {
          dice: `1d20${modifier >= 0 ? '+' : ''}${modifier}`,
          result: total,
          breakdown: `${rolls[0]}${modifier >= 0 ? '+' : ''}${modifier}`
        },
        playerName: activeToken.name
      });
    }
  };

  const handleAttack = () => {
    if (!activeToken || !selectedAttack) return;
    
    const attack = attackTypes.find(a => a.name === selectedAttack);
    if (!attack) return;

    const stat = dndStats[attack.stat as keyof typeof dndStats];
    const modifier = getModifier(stat);
    const proficiencyBonus = 3; // Assume level 5-8 character
    
    // Attack roll
    const attackRoll = rollDice(20, 1, modifier + proficiencyBonus);
    
    // Damage roll
    const { count, sides, modifier: damageModifier } = parseDiceString(attack.damage);
    const damageRoll = rollDice(sides, count, modifier + damageModifier);

    addEnhancedCombatEvent({
      actor: activeToken.name,
      action: 'Атака',
      target: 'Противник',
      damage: damageRoll.total,
      description: `${attack.name}: попадание ${attackRoll.total}, урон ${damageRoll.total}`,
      diceRoll: {
        dice: `1d20+${modifier + proficiencyBonus}`,
        result: attackRoll.total,
        breakdown: `${attackRoll.rolls[0]}+${modifier + proficiencyBonus}`
      },
      playerName: activeToken.name
    });

    setSelectedAttack("");
  };

  const handleCastSpell = () => {
    if (!activeToken || !selectedSpell) return;
    
    const spell = spells.find(s => s.name === selectedSpell);
    if (!spell) return;

    const stat = dndStats[spell.stat as keyof typeof dndStats];
    const modifier = getModifier(stat);
    
    if (spell.damage) {
      const { count, sides, modifier: damageModifier } = parseDiceString(spell.damage);
      const damageRoll = rollDice(sides, count, modifier + damageModifier);
      
      addEnhancedCombatEvent({
        actor: activeToken.name,
        action: 'Заклинание',
        target: 'Противник',
        damage: damageRoll.total,
        description: `${spell.name} (${spell.level} ур.): урон ${damageRoll.total}`,
        diceRoll: {
          dice: spell.damage,
          result: damageRoll.total,
          breakdown: `${damageRoll.rolls.join('+')}${damageModifier !== 0 ? (damageModifier >= 0 ? '+' : '') + damageModifier : ''}`
        },
        playerName: activeToken.name
      });
    } else if (spell.healing) {
      const { count, sides, modifier: healingModifier } = parseDiceString(spell.healing);
      const healingRoll = rollDice(sides, count, healingModifier);
      
      addEnhancedCombatEvent({
        actor: activeToken.name,
        action: 'Лечение',
        target: activeToken.name,
        description: `${spell.name}: восстановлено ${healingRoll.total} HP`,
        diceRoll: {
          dice: spell.healing,
          result: healingRoll.total,
          breakdown: `${healingRoll.rolls.join('+')}+${healingModifier}`
        },
        playerName: activeToken.name
      });
    } else {
      addEnhancedCombatEvent({
        actor: activeToken.name,
        action: 'Заклинание',
        description: `${spell.name}: ${spell.effect}`,
        playerName: activeToken.name
      });
    }

    setSelectedSpell("");
  };

  const handleHeal = () => {
    if (!activeToken || !selectedHealing) return;
    
    const healing = healingOptions.find(h => h.name === selectedHealing);
    if (!healing) return;

    const { count, sides, modifier } = parseDiceString(healing.healing);
    const healingRoll = rollDice(sides, count, modifier);
    
    addEnhancedCombatEvent({
      actor: activeToken.name,
      action: 'Лечение',
      target: activeToken.name,
      description: `${healing.name}: восстановлено ${healingRoll.total} HP`,
      diceRoll: {
        dice: healing.healing,
        result: healingRoll.total,
        breakdown: `${healingRoll.rolls.join('+')}${modifier !== 0 ? (modifier >= 0 ? '+' : '') + modifier : ''}`
      },
      playerName: activeToken.name
    });

    setSelectedHealing("");
  };

  const handleMovement = () => {
    if (enhancedActiveToken && !enhancedActiveToken.hasMovedThisTurn) {
      setShowMovementGrid(!showMovementGrid);
      if (activeToken) {
        addEnhancedCombatEvent({
          actor: activeToken.name,
          action: 'Перемещение',
          description: `${activeToken.name} ${showMovementGrid ? 'отключает' : 'включает'} режим перемещения`,
          playerName: activeToken.name
        });
      }
    }
  };

  const handleEndTurn = () => {
    if (activeToken) {
      addEnhancedCombatEvent({
        actor: activeToken.name,
        action: 'Завершение хода',
        description: `${activeToken.name} завершает свой ход`,
        playerName: activeToken.name
      });
      
      // Переключаем на следующего игрока
      nextTurn();
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 w-80 bg-card/95 backdrop-blur-sm border-border shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-primary">
          {activeToken ? `Ход: ${activeToken.name}` : 'Боевые действия'}
        </CardTitle>
        {activeToken && (
          <div className="space-y-2">
            <div className="flex justify-center gap-2">
              <Badge variant="outline">
                {activeToken.hp}/{activeToken.maxHp} HP
              </Badge>
              <Badge variant="secondary">
                AC {enhancedActiveToken?.ac || 10}
              </Badge>
            </div>
            
            {/* Показать порядок инициативы */}
            {combatStarted && initiativeOrder.length > 0 && (
              <div className="text-xs text-center text-muted-foreground">
                Инициатива: {initiativeOrder.map((tokenId, index) => {
                  const token = enhancedTokens.find(t => t.id === tokenId);
                  const isActive = tokenId === enhancedActiveId;
                  return (
                    <span key={tokenId} className={isActive ? 'text-primary font-bold' : ''}>
                      {token?.name || 'Unknown'}
                      {index < initiativeOrder.length - 1 && ' → '}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Проверки характеристик */}
        <div>
          <h4 className="text-sm font-medium mb-2">Проверки характеристик</h4>
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(dndStats).map(([stat, value]) => (
              <Button
                key={stat}
                variant="outline"
                size="sm"
                onClick={() => handleStatRoll(stat)}
                className="text-xs"
              >
                <Dice6 className="w-3 h-3 mr-1" />
                {stat.slice(0, 3).toUpperCase()}
                <span className="ml-1 text-muted-foreground">
                  {getModifier(value) >= 0 ? '+' : ''}{getModifier(value)}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Атаки */}
        <div>
          <h4 className="text-sm font-medium mb-2">Атаки</h4>
          <div className="space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Sword className="w-4 h-4 mr-2" />
                  Атака
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Выбор типа атаки</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={selectedAttack} onValueChange={setSelectedAttack}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип атаки" />
                    </SelectTrigger>
                    <SelectContent>
                      {attackTypes.map((attack) => (
                        <SelectItem key={attack.name} value={attack.name}>
                          {attack.name} ({attack.damage})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAttack} 
                    disabled={!selectedAttack}
                    className="w-full"
                  >
                    Выполнить атаку
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Заклинания */}
        <div>
          <h4 className="text-sm font-medium mb-2">Магия</h4>
          <div className="space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Заклинание
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Доступные заклинания</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={selectedSpell} onValueChange={setSelectedSpell}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите заклинание" />
                    </SelectTrigger>
                    <SelectContent>
                      {spells.map((spell) => (
                        <SelectItem key={spell.name} value={spell.name}>
                          {spell.name} ({spell.level} ур.)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleCastSpell} 
                    disabled={!selectedSpell}
                    className="w-full"
                  >
                    Сотворить заклинание
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Лечение */}
        <div>
          <h4 className="text-sm font-medium mb-2">Лечение</h4>
          <div className="space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Лечение
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Доступное лечение</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={selectedHealing} onValueChange={setSelectedHealing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите способ лечения" />
                    </SelectTrigger>
                    <SelectContent>
                      {healingOptions.map((healing) => (
                        <SelectItem key={healing.name} value={healing.name}>
                          {healing.name} ({healing.healing})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleHeal} 
                    disabled={!selectedHealing}
                    className="w-full"
                  >
                    Применить лечение
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Separator />

        {/* Завершение хода */}
        <div>
          <Button
            onClick={handleEndTurn}
            disabled={!activeToken || !combatStarted}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Target className="w-4 h-4 mr-2" />
            Завершить ход
          </Button>
        </div>

        <Separator />

        {/* Дополнительные действия */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (activeToken) {
                addEnhancedCombatEvent({
                  actor: activeToken.name,
                  action: 'Защита',
                  description: `${activeToken.name} принимает оборонительную позицию`,
                  playerName: activeToken.name
                });
              }
            }}
          >
            <Shield className="w-4 h-4 mr-1" />
            Защита
          </Button>

          <Button
            variant={showMovementGrid ? "default" : "outline"}
            onClick={handleMovement}
            disabled={enhancedActiveToken?.hasMovedThisTurn}
          >
            <Move className="w-4 h-4 mr-1" />
            Ходьба
          </Button>
        </div>

        {/* Управление туманом */}
        <Button
          variant="ghost"
          onClick={() => toggleFog()}
          className="w-full"
        >
          {fogEnabled ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Скрыть туман
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Показать туман
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}