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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DiceRoller3D } from '@/components/dice/DiceRoller3D';
import { useEnhancedBattleStore, EnhancedToken } from '@/stores/enhancedBattleStore';
import { Target, Sword, Crosshair, Zap, Shield } from 'lucide-react';
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
  type: 'physical' | 'magical' | 'critical';
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

// D&D 5e stats (можно вынести в отдельный файл)
const dndStats = {
  strength: 16,
  dexterity: 14,
  constitution: 15,
  intelligence: 12,
  wisdom: 13,
  charisma: 10
};

const getModifier = (stat: number) => Math.floor((stat - 10) / 2);

export const AttackDialog: React.FC<AttackDialogProps> = ({ children, attacker }) => {
  const [open, setOpen] = useState(false);
  const [selectedAttackType, setSelectedAttackType] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [attackPhase, setAttackPhase] = useState<'select' | 'roll' | 'damage'>('select');
  const [attackRollResult, setAttackRollResult] = useState<number | null>(null);
  const [diceKey, setDiceKey] = useState(0);
  
  const { tokens, addCombatEvent, updateToken } = useEnhancedBattleStore();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Фильтруем цели (исключаем атакующего)
  const availableTargets = tokens.filter(token => 
    token.id !== attacker.id && token.isVisible
  );

  const calculateDistance = (pos1: [number, number, number], pos2: [number, number, number]) => {
    const dx = pos1[0] - pos2[0];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dz * dz);
  };

  const handleAttackTypeSelect = () => {
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

    setAttackPhase('roll');
    setDiceKey(prev => prev + 1);
  };

  const handleAttackRoll = (result: number) => {
    if (!selectedTarget || !selectedAttackType) return;
    
    const target = tokens.find(t => t.id === selectedTarget);
    const attackType = attackTypes.find(a => a.name === selectedAttackType);
    
    if (!target || !attackType) return;

    const stat = dndStats[attackType.stat];
    const modifier = getModifier(stat);
    const proficiencyBonus = 3;
    const totalResult = result + modifier + proficiencyBonus;
    
    setAttackRollResult(totalResult);
    
    const isHit = totalResult >= target.ac;
    
    // Логируем результат броска на попадание
    addCombatEvent({
      actor: attacker.name,
      action: 'Бросок атаки',
      target: target.name,
      description: `${attackType.name}: d20(${result}) + ${modifier + proficiencyBonus} = ${totalResult} vs AC ${target.ac} - ${isHit ? 'ПОПАДАНИЕ!' : 'ПРОМАХ'}`,
      diceRoll: {
        dice: `1d20+${modifier + proficiencyBonus}`,
        result: totalResult,
        breakdown: `${result}+${modifier + proficiencyBonus}`
      },
      playerName: 'ДМ'
    });

    if (isHit) {
      // Не переходим сразу к урону, показываем результат броска на несколько секунд
      setTimeout(() => {
        setAttackPhase('damage');
        setDiceKey(prev => prev + 1);
      }, 2500);
    } else {
      // Промах - закрываем диалог через задержку
      setTimeout(() => {
        setOpen(false);
        resetDialog();
      }, 3000);
    }
  };

  const handleDamageRoll = (result: number) => {
    if (!selectedTarget || !selectedAttackType) return;
    
    const target = tokens.find(t => t.id === selectedTarget);
    const attackType = attackTypes.find(a => a.name === selectedAttackType);
    
    if (!target || !attackType) return;

    const stat = dndStats[attackType.stat];
    const modifier = getModifier(stat);
    const totalDamage = result + modifier;
    
    // Применяем урон
    const newHp = Math.max(0, target.hp - totalDamage);
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
      damage: totalDamage,
      description: `${attackType.name}: ${totalDamage} урона (${target.hp} → ${newHp})${newHp === 0 ? ' - ЦЕЛЬ ПОВЕРЖЕНА!' : ''}`,
      diceRoll: {
        dice: `${attackType.damage}+${modifier}`,
        result: totalDamage,
        breakdown: `${result}+${modifier}`
      },
      playerName: 'ДМ'
    });

    // Закрываем диалог через небольшую задержку
    setTimeout(() => {
      setOpen(false);
      resetDialog();
    }, 2000);
  };

  const resetDialog = () => {
    setSelectedAttackType('');
    setSelectedTarget('');
    setAttackPhase('select');
    setAttackRollResult(null);
  };

  const renderSelectPhase = () => (
    <div className="space-y-6">
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
                  <Badge variant="secondary">
                    AC {token.ac}
                  </Badge>
                  <Badge variant="outline">
                    HP {token.hp}/{token.maxHp}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAttackType && selectedTarget && (
        <Card>
          <CardContent className="pt-4">
            <div className="text-center text-sm text-muted-foreground">
              Выберите тип атаки или заклинание
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderRollPhase = () => {
    const attackType = attackTypes.find(a => a.name === selectedAttackType);
    const target = tokens.find(t => t.id === selectedTarget);
    
    if (!attackType || !target) return null;

    const stat = dndStats[attackType.stat];
    const modifier = getModifier(stat);
    const proficiencyBonus = 3;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Бросок на попадание</h3>
          <p className="text-sm text-muted-foreground">
            {attackType.name} против {target.name} (AC {target.ac})
          </p>
          <div className="bg-blue-900/30 border border-blue-400/30 rounded-lg p-2 mt-2">
            <p className="text-xs text-blue-300 font-medium">
              1d20 + {modifier + proficiencyBonus} (модификатор + навык)
            </p>
          </div>
        </div>
        
        <div className="h-[300px] w-full bg-gradient-to-b from-blue-900/30 to-blue-800/20 rounded-lg border border-blue-400/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10" />
          <DiceRoller3D 
            key={diceKey}
            initialDice="d20"
            hideControls={true}
            onRollComplete={handleAttackRoll}
            themeColor={currentTheme.accent}
            fixedPosition={true}
          />
        </div>
      </div>
    );
  };

  const renderDamagePhase = () => {
    const attackType = attackTypes.find(a => a.name === selectedAttackType);
    const target = tokens.find(t => t.id === selectedTarget);
    
    if (!attackType || !target) return null;

    const stat = dndStats[attackType.stat];
    const modifier = getModifier(stat);

    // Парсим строку урона для определения типа кубика
    const diceMatch = attackType.damage.match(/(\d+)d(\d+)/);
    let diceType: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100' = 'd8';
    
    if (diceMatch) {
      const sides = diceMatch[2];
      switch (sides) {
        case '4': diceType = 'd4'; break;
        case '6': diceType = 'd6'; break;
        case '8': diceType = 'd8'; break;
        case '10': diceType = 'd10'; break;
        case '12': diceType = 'd12'; break;
        case '20': diceType = 'd20'; break;
        case '100': diceType = 'd100'; break;
        default: diceType = 'd8';
      }
    }

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-400">ПОПАДАНИЕ!</h3>
          <div className="bg-green-900/30 border border-green-400/30 rounded-lg p-3 mt-2">
            <div className="text-sm font-medium text-green-300">
              Результат атаки: {attackRollResult}
            </div>
            <div className="text-xs text-muted-foreground">
              Против AC {target.ac} • {attackRollResult >= target.ac ? 'Успех' : 'Неудача'}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Бросок урона: {attackType.damage} + {modifier}
          </p>
        </div>
        
        <div className="h-[300px] w-full bg-gradient-to-b from-red-900/30 to-red-800/20 rounded-lg border border-red-400/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10" />
          <DiceRoller3D 
            key={diceKey}
            initialDice={diceType}
            hideControls={true}
            onRollComplete={handleDamageRoll}
            themeColor={currentTheme.accent}
            fixedPosition={true}
          />
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

        {attackPhase === 'select' && renderSelectPhase()}
        {attackPhase === 'roll' && renderRollPhase()}
        {attackPhase === 'damage' && renderDamagePhase()}

        <DialogFooter>
          {attackPhase === 'select' && (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleAttackTypeSelect}
                disabled={!selectedAttackType || !selectedTarget}
                style={{ backgroundColor: currentTheme.accent }}
              >
                Атаковать
              </Button>
            </>
          )}
          {(attackPhase === 'roll' || attackPhase === 'damage') && (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};