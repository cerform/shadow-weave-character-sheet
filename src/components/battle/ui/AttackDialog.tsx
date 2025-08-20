import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DiceRoller3D } from '@/components/dice/DiceRoller3D';
import { useEnhancedBattleStore, EnhancedToken } from '@/stores/enhancedBattleStore';
import { Target, Sword, Crosshair, Zap } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface AttackDialogProps {
  children: React.ReactNode;
  attacker: EnhancedToken;
}

interface AttackType {
  name: string;
  stat: 'strength' | 'dexterity' | 'intelligence' | 'wisdom' | 'charisma' | 'constitution';
  damage: string;
  type: 'physical' | 'magical';
  range: number;
  icon: any;
}

const attackTypes: AttackType[] = [
  { 
    name: "Рукопашная атака", 
    stat: "strength", 
    damage: "1d8", 
    type: "physical", 
    range: 1,
    icon: Sword
  },
  { 
    name: "Дальняя атака", 
    stat: "dexterity", 
    damage: "1d6", 
    type: "physical", 
    range: 6,
    icon: Crosshair
  },
  { 
    name: "Атака заклинанием", 
    stat: "intelligence", 
    damage: "1d10", 
    type: "magical", 
    range: 12,
    icon: Zap
  },
];

// D&D 5e stats
const dndStats = {
  strength: 16,
  dexterity: 14,
  constitution: 15,
  intelligence: 12,
  wisdom: 13,
  charisma: 10
};

const getModifier = (stat: number) => Math.floor((stat - 10) / 2);

type AttackPhase = 'setup' | 'rolling' | 'hit-result' | 'damage-rolling' | 'damage-result' | 'complete';

export const AttackDialog: React.FC<AttackDialogProps> = ({ children, attacker }) => {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<AttackPhase>('setup');
  const [selectedAttackType, setSelectedAttackType] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [diceKey, setDiceKey] = useState(0);
  const [hitRoll, setHitRoll] = useState<number>(0);
  const [hitTotal, setHitTotal] = useState<number>(0);
  const [damageRoll, setDamageRoll] = useState<number>(0);
  const [damageTotal, setDamageTotal] = useState<number>(0);
  const [isHit, setIsHit] = useState<boolean>(false);
  
  const { tokens, addCombatEvent, updateToken } = useEnhancedBattleStore();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  const availableTargets = tokens.filter(token => 
    token.id !== attacker.id && token.isVisible
  );

  const calculateDistance = (pos1: [number, number, number], pos2: [number, number, number]) => {
    const dx = pos1[0] - pos2[0];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dz * dz);
  };

  const resetDialog = () => {
    setPhase('setup');
    setSelectedAttackType('');
    setSelectedTarget('');
    setHitRoll(0);
    setHitTotal(0);
    setDamageRoll(0);
    setDamageTotal(0);
    setIsHit(false);
    setDiceKey(0);
  };

  const startAttackRoll = () => {
    if (!selectedAttackType || !selectedTarget) return;
    
    const attackType = attackTypes.find(a => a.name === selectedAttackType);
    const target = tokens.find(t => t.id === selectedTarget);
    
    if (!attackType || !target) return;

    // Проверяем дистанцию
    const distance = calculateDistance(attacker.position, target.position);
    if (distance > attackType.range) {
      addCombatEvent({
        actor: attacker.name,
        action: 'Атака',
        target: target.name,
        description: `Цель слишком далеко! Расстояние: ${distance.toFixed(1)}, дальность: ${attackType.range}`,
        playerName: 'ДМ'
      });
      return;
    }

    setPhase('rolling');
    // Сбрасываем ключ кубика для принудительного пересоздания
    setTimeout(() => {
      setDiceKey(1);
    }, 100);
  };

  const handleHitRoll = (roll: number) => {
    const attackType = attackTypes.find(a => a.name === selectedAttackType);
    const target = tokens.find(t => t.id === selectedTarget);
    
    if (!attackType || !target) return;

    const stat = dndStats[attackType.stat];
    const modifier = getModifier(stat);
    const proficiencyBonus = 3;
    const total = roll + modifier + proficiencyBonus;
    const hit = total >= target.ac;
    
    setHitRoll(roll);
    setHitTotal(total);
    setIsHit(hit);
    setPhase('hit-result');

    // Логируем результат
    addCombatEvent({
      actor: attacker.name,
      action: 'Бросок атаки',
      target: target.name,
      description: `${attackType.name}: d20(${roll}) + ${modifier + proficiencyBonus} = ${total} vs AC ${target.ac} - ${hit ? 'ПОПАДАНИЕ!' : 'ПРОМАХ'}`,
      diceRoll: {
        dice: `1d20+${modifier + proficiencyBonus}`,
        result: total,
        breakdown: `${roll}+${modifier + proficiencyBonus}`
      },
      playerName: 'ДМ'
    });

    // Автоматический переход к следующей фазе
    setTimeout(() => {
      if (hit) {
        setPhase('damage-rolling');
        setTimeout(() => {
          setDiceKey(1);
        }, 100);
      } else {
        setPhase('complete');
        setTimeout(() => {
          setOpen(false);
          resetDialog();
        }, 2000);
      }
    }, 2500);
  };

  const handleDamageRoll = (roll: number) => {
    const attackType = attackTypes.find(a => a.name === selectedAttackType);
    const target = tokens.find(t => t.id === selectedTarget);
    
    if (!attackType || !target) return;

    const stat = dndStats[attackType.stat];
    const modifier = getModifier(stat);
    const total = roll + modifier;
    
    setDamageRoll(roll);
    setDamageTotal(total);
    setPhase('damage-result');

    // Применяем урон
    const newHp = Math.max(0, target.hp - total);
    updateToken(target.id, { hp: newHp });
    
    // Проверяем на потерю сознания
    if (newHp === 0) {
      updateToken(target.id, { 
        conditions: [...target.conditions, "Без сознания"]
      });
    }

    // Логируем урон
    addCombatEvent({
      actor: attacker.name,
      action: 'Урон',
      target: target.name,
      damage: total,
      description: `${attackType.name}: ${attackType.damage}(${roll}) + ${modifier} = ${total} урона (${target.hp} → ${newHp})${newHp === 0 ? ' - ЦЕЛЬ ПОВЕРЖЕНА!' : ''}`,
      diceRoll: {
        dice: `${attackType.damage}+${modifier}`,
        result: total,
        breakdown: `${roll}+${modifier}`
      },
      playerName: 'ДМ'
    });

    // Закрываем диалог через задержку
    setTimeout(() => {
      setOpen(false);
      resetDialog();
    }, 3000);
  };

  const getDiceTypeFromDamage = (damageString: string): 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100' => {
    const match = damageString.match(/d(\d+)/);
    if (!match) return 'd8';
    
    const sides = match[1];
    switch (sides) {
      case '4': return 'd4';
      case '6': return 'd6';
      case '8': return 'd8';
      case '10': return 'd10';
      case '12': return 'd12';
      case '20': return 'd20';
      case '100': return 'd100';
      default: return 'd8';
    }
  };

  const renderSetupPhase = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Тип атаки</label>
        <Select value={selectedAttackType} onValueChange={setSelectedAttackType}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип атаки" />
          </SelectTrigger>
          <SelectContent>
            {attackTypes.map((attackType) => {
              const Icon = attackType.icon;
              return (
                <SelectItem key={attackType.name} value={attackType.name}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{attackType.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {attackType.damage}
                    </Badge>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Цель</label>
        <Select value={selectedTarget} onValueChange={setSelectedTarget}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите цель" />
          </SelectTrigger>
          <SelectContent>
            {availableTargets.map((token) => (
              <SelectItem key={token.id} value={token.id}>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>{token.name}</span>
                  <Badge variant="secondary">AC {token.ac}</Badge>
                  <Badge variant="outline">HP {token.hp}/{token.maxHp}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderRollingPhase = () => {
    const attackType = attackTypes.find(a => a.name === selectedAttackType);
    const target = tokens.find(t => t.id === selectedTarget);
    
    if (!attackType || !target) return null;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Бросок на попадание</h3>
          <p className="text-sm text-muted-foreground">
            {attackType.name} против {target.name} (AC {target.ac})
          </p>
        </div>
        
        <div className="h-[280px] w-full bg-gradient-to-b from-blue-900/20 to-blue-800/10 rounded-lg border border-blue-400/30 overflow-hidden relative">
          <div className="absolute top-2 left-2 z-10 bg-black/70 rounded px-2 py-1">
            <span className="text-xs text-white font-medium">d20 - Бросок на попадание</span>
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
            <Button 
              onClick={() => setDiceKey(prev => prev + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              🎲 Бросить d20
            </Button>
          </div>
          <DiceRoller3D 
            key={`hit-${diceKey}`}
            initialDice="d20"
            hideControls={true}
            onRollComplete={handleHitRoll}
            themeColor={currentTheme.accent}
            fixedPosition={true}
            forceReroll={diceKey > 0}
          />
        </div>
      </div>
    );
  };

  const renderHitResultPhase = () => {
    const attackType = attackTypes.find(a => a.name === selectedAttackType);
    const target = tokens.find(t => t.id === selectedTarget);
    
    if (!attackType || !target) return null;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className={`text-xl font-bold ${isHit ? 'text-green-400' : 'text-red-400'}`}>
            {isHit ? 'ПОПАДАНИЕ!' : 'ПРОМАХ!'}
          </h3>
          
          <Card className={`mt-3 ${isHit ? 'border-green-400/30 bg-green-900/20' : 'border-red-400/30 bg-red-900/20'}`}>
            <CardContent className="pt-4">
              <div className="text-lg font-semibold">
                Результат: {hitTotal}
              </div>
              <div className="text-sm text-muted-foreground">
                d20({hitRoll}) + модификаторы = {hitTotal}
              </div>
              <div className="text-sm text-muted-foreground">
                vs AC {target.ac} • {isHit ? 'Попал' : 'Промазал'}
              </div>
            </CardContent>
          </Card>
          
          {isHit && (
            <p className="text-sm text-green-300 mt-3">
              Переходим к броску урона...
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderDamageRollingPhase = () => {
    const attackType = attackTypes.find(a => a.name === selectedAttackType);
    
    if (!attackType) return null;

    const diceType = getDiceTypeFromDamage(attackType.damage);

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-orange-400">Бросок урона</h3>
          <p className="text-sm text-muted-foreground">
            {attackType.damage} + модификатор
          </p>
        </div>
        
        <div className="h-[280px] w-full bg-gradient-to-b from-orange-900/20 to-red-800/10 rounded-lg border border-orange-400/30 overflow-hidden relative">
          <div className="absolute top-2 left-2 z-10 bg-black/70 rounded px-2 py-1">
            <span className="text-xs text-white font-medium">{diceType} - Бросок урона</span>
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
            <Button 
              onClick={() => setDiceKey(prev => prev + 1)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
            >
              🎲 Бросить {diceType}
            </Button>
          </div>
          <DiceRoller3D 
            key={`damage-${diceKey}`}
            initialDice={diceType}
            hideControls={true}
            onRollComplete={handleDamageRoll}
            themeColor="#f97316"
            fixedPosition={true}
            forceReroll={diceKey > 0}
          />
        </div>
      </div>
    );
  };

  const renderDamageResultPhase = () => {
    const attackType = attackTypes.find(a => a.name === selectedAttackType);
    const target = tokens.find(t => t.id === selectedTarget);
    
    if (!attackType || !target) return null;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-orange-400">УРОН НАНЕСЕН!</h3>
          
          <Card className="mt-3 border-orange-400/30 bg-orange-900/20">
            <CardContent className="pt-4">
              <div className="text-lg font-semibold">
                Урон: {damageTotal}
              </div>
              <div className="text-sm text-muted-foreground">
                {attackType.damage}({damageRoll}) + модификатор = {damageTotal}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {target.name}: {target.hp}/{target.maxHp} HP
                {target.hp === 0 && (
                  <span className="text-red-400 font-bold ml-2">ПОВЕРЖЕН!</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sword className="w-5 h-5" />
            Атака - {attacker.name}
          </DialogTitle>
        </DialogHeader>

        {phase === 'setup' && renderSetupPhase()}
        {phase === 'rolling' && renderRollingPhase()}
        {phase === 'hit-result' && renderHitResultPhase()}
        {phase === 'damage-rolling' && renderDamageRollingPhase()}
        {phase === 'damage-result' && renderDamageResultPhase()}

        <DialogFooter>
          {phase === 'setup' && (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button 
                onClick={startAttackRoll}
                disabled={!selectedAttackType || !selectedTarget}
                style={{ backgroundColor: currentTheme.accent }}
              >
                Бросок на попадание
              </Button>
            </>
          )}
          {phase !== 'setup' && (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Закрыть
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};