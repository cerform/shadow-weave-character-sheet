import { useState } from "react";
import { useBattleUIStore } from "@/stores/battleUIStore";
import { useEnhancedBattleStore } from "@/stores/enhancedBattleStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Plus,
  Crosshair,
  Activity
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
  { name: "Рукопашная атака", stat: "strength", damage: "1d8", type: "physical", range: 1 },
  { name: "Дальняя атака", stat: "dexterity", damage: "1d6", type: "physical", range: 6 },
  { name: "Атака заклинанием", stat: "intelligence", damage: "1d10", type: "magical", range: 12 },
  { name: "Критический удар", stat: "strength", damage: "2d8", type: "critical", range: 1 }
];

const spells = [
  { name: "Огненный шар", level: 3, damage: "8d6", type: "fire", stat: "intelligence", range: 20, aoe: true },
  { name: "Лечение ран", level: 1, healing: "1d8+3", type: "healing", stat: "wisdom", range: 1 },
  { name: "Магическая стрела", level: 1, damage: "1d4+1", type: "force", stat: "intelligence", range: 12 },
  { name: "Щит", level: 1, effect: "+5 AC", type: "protection", stat: "intelligence", range: 0, duration: 10 },
  { name: "Молния", level: 3, damage: "8d6", type: "lightning", stat: "intelligence", range: 20 }
];

const healingOptions = [
  { name: "Зелье лечения", healing: "2d4+2", type: "potion", range: 0 },
  { name: "Лечение ран", healing: "1d8+3", type: "spell", stat: "wisdom", range: 1 },
  { name: "Массовое лечение", healing: "3d8+5", type: "spell", stat: "wisdom", range: 6 },
  { name: "Второе дыхание", healing: "1d10+5", type: "ability", range: 0 }
];

const conditions = [
  { name: "Отравлен", effect: "Помеха к атакам и проверкам характеристик", duration: 10 },
  { name: "Парализован", effect: "Неспособен действовать", duration: 1 },
  { name: "Сон", effect: "Без сознания", duration: 1 },
  { name: "Испуган", effect: "Помеха к атакам", duration: 1 },
  { name: "Ослеплен", effect: "Не видит, помеха к атакам", duration: 1 }
];

const savingThrows = [
  { name: "Сила", stat: "strength" },
  { name: "Ловкость", stat: "dexterity" },
  { name: "Телосложение", stat: "constitution" },
  { name: "Интеллект", stat: "intelligence" },
  { name: "Мудрость", stat: "wisdom" },
  { name: "Харизма", stat: "charisma" }
];

export default function CompleteBattleActionPanel() {
  const [selectedAttack, setSelectedAttack] = useState("");
  const [selectedSpell, setSelectedSpell] = useState("");
  const [selectedHealing, setSelectedHealing] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [selectedSavingThrow, setSelectedSavingThrow] = useState("");
  const [customDamage, setCustomDamage] = useState("");
  const [dcValue, setDcValue] = useState("15");
  const [attackRollResult, setAttackRollResult] = useState<{result: number, target: string, attack: string} | null>(null);
  
  const { fogEnabled, toggleFog, addCombatEvent, activeId, tokens } = useBattleUIStore();
  const { 
    showMovementGrid, 
    setShowMovementGrid, 
    tokens: enhancedTokens,
    activeId: enhancedActiveId,
    addCombatEvent: addEnhancedCombatEvent,
    updateToken,
    nextTurn,
    combatStarted,
    initiativeOrder
  } = useEnhancedBattleStore();
  
  const activeToken = tokens.find(t => t.id === activeId);
  const enhancedActiveToken = enhancedTokens.find(t => t.id === enhancedActiveId);
  
  // Get potential targets
  const potentialTargets = enhancedTokens.filter(t => t.id !== enhancedActiveId);

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
    const match = diceStr.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return { count: 1, sides: 6, modifier: 0 };
    
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;
    
    return { count, sides, modifier };
  };

  const calculateDistance = (pos1: [number, number, number], pos2: [number, number, number]) => {
    const dx = pos1[0] - pos2[0];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dz * dz);
  };

  const handleStatRoll = (statName: string) => {
    const stat = dndStats[statName as keyof typeof dndStats];
    const modifier = getModifier(stat);
    const { total, rolls } = rollDice(20, 1, modifier);
    
    if (activeToken) {
      addEnhancedCombatEvent({
        actor: activeToken.name,
        action: 'Проверка характеристики',
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

  const handleSavingThrow = () => {
    if (!selectedSavingThrow || !selectedTarget) return;
    
    const save = savingThrows.find(s => s.name === selectedSavingThrow);
    const target = enhancedTokens.find(t => t.id === selectedTarget);
    if (!save || !target) return;

    const stat = dndStats[save.stat as keyof typeof dndStats];
    const modifier = getModifier(stat);
    const proficiencyBonus = 3;
    const { total, rolls } = rollDice(20, 1, modifier + proficiencyBonus);
    
    const dc = parseInt(dcValue);
    const success = total >= dc;
    
    if (activeToken) {
      addEnhancedCombatEvent({
        actor: target.name,
        action: 'Спасбросок',
        description: `${selectedSavingThrow}: ${total} против DC ${dc} - ${success ? 'УСПЕХ' : 'ПРОВАЛ'}`,
        diceRoll: {
          dice: `1d20+${modifier + proficiencyBonus}`,
          result: total,
          breakdown: `${rolls[0]}+${modifier + proficiencyBonus}`
        },
        playerName: target.name
      });
    }

    setSelectedSavingThrow("");
    setSelectedTarget("");
  };

  const handleAttackRoll = () => {
    if (!activeToken || !selectedAttack || !selectedTarget) return;
    
    const attack = attackTypes.find(a => a.name === selectedAttack);
    const target = enhancedTokens.find(t => t.id === selectedTarget);
    if (!attack || !target) return;

    // Check range
    const distance = calculateDistance(
      enhancedActiveToken?.position || [0, 0, 0], 
      target.position
    );
    
    if (distance > attack.range) {
      addEnhancedCombatEvent({
        actor: activeToken.name,
        action: 'Атака',
        target: target.name,
        description: `Цель слишком далеко! Расстояние: ${distance.toFixed(1)}, дальность: ${attack.range}`,
        playerName: activeToken.name
      });
      return;
    }

    const stat = dndStats[attack.stat as keyof typeof dndStats];
    const modifier = getModifier(stat);
    const proficiencyBonus = 3;
    
    // Attack roll
    const attackRoll = rollDice(20, 1, modifier + proficiencyBonus);
    const hitTarget = attackRoll.total >= target.ac;
    
    // Log attack roll result
    addEnhancedCombatEvent({
      actor: activeToken.name,
      action: 'Бросок атаки',
      target: target.name,
      description: `${attack.name}: бросок на попадание ${attackRoll.total} vs AC ${target.ac} - ${hitTarget ? 'ПОПАДАНИЕ!' : 'ПРОМАХ'}`,
      diceRoll: {
        dice: `1d20+${modifier + proficiencyBonus}`,
        result: attackRoll.total,
        breakdown: `${attackRoll.rolls[0]}+${modifier + proficiencyBonus}`
      },
      playerName: activeToken.name
    });

    if (hitTarget) {
      // Store attack roll result for damage selection
      setAttackRollResult({
        result: attackRoll.total,
        target: selectedTarget,
        attack: selectedAttack
      });
    } else {
      // Miss - clear selections
      setSelectedAttack("");
      setSelectedTarget("");
    }
  };

  const handleDamageRoll = () => {
    if (!activeToken || !attackRollResult) return;
    
    const attack = attackTypes.find(a => a.name === attackRollResult.attack);
    const target = enhancedTokens.find(t => t.id === attackRollResult.target);
    if (!attack || !target) return;

    const stat = dndStats[attack.stat as keyof typeof dndStats];
    const modifier = getModifier(stat);
    
    // Damage roll
    const { count, sides, modifier: damageModifier } = parseDiceString(attack.damage);
    const damageRoll = rollDice(sides, count, modifier + damageModifier);
    
    // Apply damage
    const newHp = Math.max(0, target.hp - damageRoll.total);
    updateToken(target.id, { hp: newHp });
    
    // Check if target is unconscious
    if (newHp === 0) {
      updateToken(target.id, { 
        conditions: [...target.conditions, "Без сознания"]
      });
    }

    addEnhancedCombatEvent({
      actor: activeToken.name,
      action: 'Урон',
      target: target.name,
      damage: damageRoll.total,
      description: `${attack.name}: урон ${damageRoll.total} (${target.hp} → ${newHp})${newHp === 0 ? ' - ЦЕЛЬ ПОВЕРЖЕНА!' : ''}`,
      diceRoll: {
        dice: attack.damage,
        result: damageRoll.total,
        breakdown: `${damageRoll.rolls.join('+')}+${modifier + damageModifier}`
      },
      playerName: activeToken.name
    });

    // Clear all attack state
    setSelectedAttack("");
    setSelectedTarget("");
    setAttackRollResult(null);
  };

  const handleCastSpell = () => {
    if (!activeToken || !selectedSpell) return;
    
    const spell = spells.find(s => s.name === selectedSpell);
    if (!spell) return;

    const stat = dndStats[spell.stat as keyof typeof dndStats];
    const modifier = getModifier(stat);
    
    if (spell.healing) {
      // Healing spell
      const target = spell.range === 0 ? enhancedActiveToken : enhancedTokens.find(t => t.id === selectedTarget);
      if (!target) return;

      const { count, sides, modifier: healingModifier } = parseDiceString(spell.healing);
      const healingRoll = rollDice(sides, count, healingModifier);
      
      const newHp = Math.min(target.maxHp, target.hp + healingRoll.total);
      updateToken(target.id, { hp: newHp });
      
      // Remove unconscious condition if healed above 0
      if (target.hp === 0 && newHp > 0) {
        updateToken(target.id, {
          conditions: target.conditions.filter(c => c !== "Без сознания")
        });
      }
      
      addEnhancedCombatEvent({
        actor: activeToken.name,
        action: 'Лечение',
        target: target.name,
        description: `${spell.name}: восстановлено ${healingRoll.total} HP (${target.hp} → ${newHp})`,
        diceRoll: {
          dice: spell.healing,
          result: healingRoll.total,
          breakdown: `${healingRoll.rolls.join('+')}+${healingModifier}`
        },
        playerName: activeToken.name
      });
    } else if (spell.damage) {
      // Damage spell
      if (!selectedTarget && !spell.aoe) return;
      
      if (spell.aoe) {
        // Area of effect spell
        const targets = enhancedTokens.filter(t => t.id !== enhancedActiveId);
        targets.forEach(target => {
          const { count, sides, modifier: damageModifier } = parseDiceString(spell.damage!);
          const damageRoll = rollDice(sides, count, modifier + damageModifier);
          
          const newHp = Math.max(0, target.hp - damageRoll.total);
          updateToken(target.id, { hp: newHp });
          
          if (newHp === 0) {
            updateToken(target.id, { 
              conditions: [...target.conditions, "Без сознания"]
            });
          }
        });
        
        addEnhancedCombatEvent({
          actor: activeToken.name,
          action: 'Заклинание AOE',
          description: `${spell.name}: поражает всех врагов`,
          playerName: activeToken.name
        });
      } else {
        // Single target spell
        const target = enhancedTokens.find(t => t.id === selectedTarget);
        if (!target) return;

        const { count, sides, modifier: damageModifier } = parseDiceString(spell.damage);
        const damageRoll = rollDice(sides, count, modifier + damageModifier);
        
        const newHp = Math.max(0, target.hp - damageRoll.total);
        updateToken(target.id, { hp: newHp });
        
        if (newHp === 0) {
          updateToken(target.id, { 
            conditions: [...target.conditions, "Без сознания"]
          });
        }
        
        addEnhancedCombatEvent({
          actor: activeToken.name,
          action: 'Заклинание',
          target: target.name,
          damage: damageRoll.total,
          description: `${spell.name}: урон ${damageRoll.total}`,
          diceRoll: {
            dice: spell.damage,
            result: damageRoll.total,
            breakdown: `${damageRoll.rolls.join('+')}+${damageModifier}`
          },
          playerName: activeToken.name
        });
      }
    } else {
      // Buff/utility spell
      const target = spell.range === 0 ? enhancedActiveToken : enhancedTokens.find(t => t.id === selectedTarget);
      if (!target) return;

      if (spell.effect?.includes("AC")) {
        const acBonus = parseInt(spell.effect.match(/\d+/)?.[0] || "0");
        updateToken(target.id, { ac: target.ac + acBonus });
      }
      
      addEnhancedCombatEvent({
        actor: activeToken.name,
        action: 'Заклинание',
        target: target.name,
        description: `${spell.name}: ${spell.effect}`,
        playerName: activeToken.name
      });
    }

    setSelectedSpell("");
    setSelectedTarget("");
  };

  const handleDirectDamage = () => {
    if (!customDamage || !selectedTarget) return;
    
    const target = enhancedTokens.find(t => t.id === selectedTarget);
    if (!target) return;

    const damage = parseInt(customDamage);
    if (isNaN(damage)) return;

    const newHp = Math.max(0, target.hp - damage);
    updateToken(target.id, { hp: newHp });
    
    if (newHp === 0) {
      updateToken(target.id, { 
        conditions: [...target.conditions, "Без сознания"]
      });
    }

    if (activeToken) {
      addEnhancedCombatEvent({
        actor: activeToken.name,
        action: 'Прямой урон',
        target: target.name,
        damage: damage,
        description: `Нанесён урон: ${damage} (${target.hp} → ${newHp})`,
        playerName: activeToken.name
      });
    }

    setCustomDamage("");
    setSelectedTarget("");
  };

  const handleAddCondition = () => {
    if (!selectedCondition || !selectedTarget) return;
    
    const target = enhancedTokens.find(t => t.id === selectedTarget);
    const condition = conditions.find(c => c.name === selectedCondition);
    if (!target || !condition) return;

    if (!target.conditions.includes(condition.name)) {
      updateToken(target.id, {
        conditions: [...target.conditions, condition.name]
      });

      if (activeToken) {
        addEnhancedCombatEvent({
          actor: activeToken.name,
          action: 'Состояние',
          target: target.name,
          description: `Применено состояние: ${condition.name} (${condition.effect})`,
          playerName: activeToken.name
        });
      }
    }

    setSelectedCondition("");
    setSelectedTarget("");
  };

  const handleHeal = () => {
    if (!activeToken || !selectedHealing) return;
    
    const healing = healingOptions.find(h => h.name === selectedHealing);
    if (!healing) return;

    const target = healing.range === 0 ? enhancedActiveToken : enhancedTokens.find(t => t.id === selectedTarget);
    if (!target) return;

    const { count, sides, modifier } = parseDiceString(healing.healing);
    const healingRoll = rollDice(sides, count, modifier);
    
    const newHp = Math.min(target.maxHp, target.hp + healingRoll.total);
    updateToken(target.id, { hp: newHp });
    
    // Remove unconscious condition if healed above 0
    if (target.hp === 0 && newHp > 0) {
      updateToken(target.id, {
        conditions: target.conditions.filter(c => c !== "Без сознания")
      });
    }
    
    addEnhancedCombatEvent({
      actor: activeToken.name,
      action: 'Лечение',
      target: target.name,
      description: `${healing.name}: восстановлено ${healingRoll.total} HP (${target.hp} → ${newHp})`,
      diceRoll: {
        dice: healing.healing,
        result: healingRoll.total,
        breakdown: `${healingRoll.rolls.join('+')}${modifier !== 0 ? (modifier >= 0 ? '+' : '') + modifier : ''}`
      },
      playerName: activeToken.name
    });

    setSelectedHealing("");
    setSelectedTarget("");
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
      // Reset movement for current token
      if (enhancedActiveToken) {
        updateToken(enhancedActiveToken.id, { hasMovedThisTurn: false });
      }
      
      addEnhancedCombatEvent({
        actor: activeToken.name,
        action: 'Завершение хода',
        description: `${activeToken.name} завершает свой ход`,
        playerName: activeToken.name
      });
      
      // Switch to next player
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
            
            {/* Initiative order */}
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
      
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {/* Ability Checks */}
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

        {/* Attacks */}
        <div>
          <h4 className="text-sm font-medium mb-2">Атаки</h4>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Sword className="w-4 h-4 mr-2" />
                Атака
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Атака</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Тип атаки</Label>
                  <Select value={selectedAttack} onValueChange={setSelectedAttack}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип атаки" />
                    </SelectTrigger>
                    <SelectContent>
                      {attackTypes.map((attack) => (
                        <SelectItem key={attack.name} value={attack.name}>
                          {attack.name} ({attack.damage}, дальность {attack.range})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Цель</Label>
                  <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите цель" />
                    </SelectTrigger>
                    <SelectContent>
                      {potentialTargets.map((token) => (
                        <SelectItem key={token.id} value={token.id}>
                          {token.name} (AC {token.ac}, HP {token.hp}/{token.maxHp})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {!attackRollResult ? (
                  <Button 
                    onClick={handleAttackRoll} 
                    disabled={!selectedAttack || !selectedTarget}
                    className="w-full"
                  >
                    <Crosshair className="w-4 h-4 mr-2" />
                    Бросок на попадание
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-center text-green-600 font-medium">
                      ПОПАДАНИЕ! Выберите тип атаки или заклинание:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={handleDamageRoll}
                        variant="destructive"
                        size="sm"
                      >
                        <Sword className="w-3 h-3 mr-1" />
                        Урон
                      </Button>
                      <Button 
                        onClick={() => {
                          setAttackRollResult(null);
                          setSelectedAttack("");
                          setSelectedTarget("");
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Spells */}
        <div>
          <h4 className="text-sm font-medium mb-2">Заклинания</h4>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Заклинание
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Сотворить заклинание</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Заклинание</Label>
                  <Select value={selectedSpell} onValueChange={setSelectedSpell}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите заклинание" />
                    </SelectTrigger>
                    <SelectContent>
                      {spells.map((spell) => (
                        <SelectItem key={spell.name} value={spell.name}>
                          {spell.name} ({spell.level} ур.{spell.aoe ? ', AOE' : ''})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedSpell && !spells.find(s => s.name === selectedSpell)?.aoe && 
                 spells.find(s => s.name === selectedSpell)?.range !== 0 && (
                  <div>
                    <Label>Цель</Label>
                    <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите цель" />
                      </SelectTrigger>
                      <SelectContent>
                        {potentialTargets.map((token) => (
                          <SelectItem key={token.id} value={token.id}>
                            {token.name} (HP {token.hp}/{token.maxHp})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
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

        {/* Healing */}
        <div>
          <h4 className="text-sm font-medium mb-2">Лечение</h4>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                Лечение
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Лечение</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Способ лечения</Label>
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
                </div>
                
                {selectedHealing && healingOptions.find(h => h.name === selectedHealing)?.range !== 0 && (
                  <div>
                    <Label>Цель</Label>
                    <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите цель" />
                      </SelectTrigger>
                      <SelectContent>
                        {enhancedTokens.map((token) => (
                          <SelectItem key={token.id} value={token.id}>
                            {token.name} (HP {token.hp}/{token.maxHp})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
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

        <Separator />

        {/* Advanced Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Дополнительные действия</h4>
          
          {/* Saving Throws */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Dice6 className="w-3 h-3 mr-2" />
                Спасбросок
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Спасбросок</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Тип спасброска</Label>
                  <Select value={selectedSavingThrow} onValueChange={setSelectedSavingThrow}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите характеристику" />
                    </SelectTrigger>
                    <SelectContent>
                      {savingThrows.map((save) => (
                        <SelectItem key={save.name} value={save.name}>
                          {save.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Цель</Label>
                  <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите цель" />
                    </SelectTrigger>
                    <SelectContent>
                      {enhancedTokens.map((token) => (
                        <SelectItem key={token.id} value={token.id}>
                          {token.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>DC (Класс сложности)</Label>
                  <Input 
                    type="number" 
                    value={dcValue} 
                    onChange={(e) => setDcValue(e.target.value)}
                    min="10"
                    max="30"
                  />
                </div>
                
                <Button 
                  onClick={handleSavingThrow} 
                  disabled={!selectedSavingThrow || !selectedTarget}
                  className="w-full"
                >
                  Выполнить спасбросок
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Direct Damage */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Crosshair className="w-3 h-3 mr-2" />
                Прямой урон
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Нанести урон</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Цель</Label>
                  <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите цель" />
                    </SelectTrigger>
                    <SelectContent>
                      {potentialTargets.map((token) => (
                        <SelectItem key={token.id} value={token.id}>
                          {token.name} (HP {token.hp}/{token.maxHp})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Урон</Label>
                  <Input 
                    type="number" 
                    placeholder="Введите количество урона"
                    value={customDamage}
                    onChange={(e) => setCustomDamage(e.target.value)}
                    min="1"
                  />
                </div>
                
                <Button 
                  onClick={handleDirectDamage} 
                  disabled={!customDamage || !selectedTarget}
                  className="w-full"
                >
                  Нанести урон
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Condition */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Activity className="w-3 h-3 mr-2" />
                Состояние
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Применить состояние</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Состояние</Label>
                  <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите состояние" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.name} value={condition.name}>
                          {condition.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Цель</Label>
                  <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите цель" />
                    </SelectTrigger>
                    <SelectContent>
                      {enhancedTokens.map((token) => (
                        <SelectItem key={token.id} value={token.id}>
                          {token.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleAddCondition} 
                  disabled={!selectedCondition || !selectedTarget}
                  className="w-full"
                >
                  Применить состояние
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Separator />

        {/* End Turn */}
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

        {/* Basic Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (activeToken) {
                addEnhancedCombatEvent({
                  actor: activeToken.name,
                  action: 'Защита',
                  description: `${activeToken.name} принимает оборонительную позицию (+2 AC до следующего хода)`,
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

        {/* Fog Control */}
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