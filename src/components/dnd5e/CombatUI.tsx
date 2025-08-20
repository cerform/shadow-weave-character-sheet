// src/components/dnd5e/CombatUI.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Character, CombatState, AbilityScore } from '@/types/dnd5e';
import { DnD5eCombatSystem } from '@/systems/dnd5e/combat';
import { SpellcastingSystem } from '@/systems/dnd5e/spells';
import { getModifier } from '@/systems/dnd5e/abilities';
import { Sword, Shield, Zap, Heart, Dice6 } from 'lucide-react';

interface CombatUIProps {
  characters: Character[];
  onStateChange: (state: CombatState) => void;
}

export const CombatUI: React.FC<CombatUIProps> = ({ characters, onStateChange }) => {
  const [combatSystem] = useState(() => new DnD5eCombatSystem());
  const [combatState, setCombatState] = useState<CombatState>(() => combatSystem.getState());
  const [selectedAction, setSelectedAction] = useState<'attack' | 'spell' | 'move' | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [selectedSpell, setSelectedSpell] = useState<string>('');

  const updateState = () => {
    const newState = combatSystem.getState();
    setCombatState(newState);
    onStateChange(newState);
  };

  const startCombat = () => {
    combatSystem.startCombat(characters);
    updateState();
  };

  const endTurn = () => {
    combatSystem.endTurn();
    updateState();
  };

  const endCombat = () => {
    combatSystem.endCombat();
    updateState();
  };

  const getCurrentCharacter = (): Character | undefined => {
    if (!combatState.isActive || combatState.turnOrder.length === 0) return undefined;
    const currentTurn = combatState.turnOrder[combatState.currentTurnIndex];
    return combatState.characters.find(char => char.id === currentTurn.characterId);
  };

  const handleAttack = () => {
    const currentChar = getCurrentCharacter();
    if (!currentChar || !selectedTarget) return;

    // Простое оружие для демонстрации
    const weapon = {
      name: 'Длинный меч',
      damage: '1d8',
      damageType: 'slashing' as const,
      properties: ['versatile' as const],
      attackBonus: 0
    };

    const result = combatSystem.makeWeaponAttack(currentChar.id, selectedTarget, weapon);
    console.log(result.description);
    updateState();
    setSelectedAction(null);
    setSelectedTarget('');
  };

  const handleCastSpell = () => {
    const currentChar = getCurrentCharacter();
    if (!currentChar || !selectedSpell) return;

    const result = SpellcastingSystem.castSpell(
      currentChar,
      selectedSpell,
      selectedTarget ? combatState.characters.find(c => c.id === selectedTarget) : undefined
    );
    
    console.log(result.description);
    updateState();
    setSelectedAction(null);
    setSelectedSpell('');
    setSelectedTarget('');
  };

  const currentCharacter = getCurrentCharacter();

  return (
    <div className="fixed top-4 right-4 w-96 space-y-4 max-h-screen overflow-y-auto">
      {/* Статус боя */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            D&D 5e Боевая Система
            {combatState.isActive && (
              <Badge variant="outline">Раунд {combatState.round}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!combatState.isActive ? (
            <Button onClick={startCombat} className="w-full">
              Начать бой
            </Button>
          ) : (
            <div className="space-y-2">
              <Button onClick={endTurn} className="w-full">
                Закончить ход
              </Button>
              <Button onClick={endCombat} variant="destructive" className="w-full">
                Закончить бой
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Порядок инициативы */}
      {combatState.isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Инициатива</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {combatState.turnOrder.map((turn, index) => {
                const character = combatState.characters.find(c => c.id === turn.characterId);
                const isCurrentTurn = index === combatState.currentTurnIndex;
                
                return (
                  <div
                    key={turn.characterId}
                    className={`flex items-center justify-between p-2 rounded ${
                      isCurrentTurn ? 'bg-primary/20' : 'bg-muted/50'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{character?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        HP: {character?.hitPoints}/{character?.maxHitPoints}
                      </div>
                    </div>
                    <Badge variant={isCurrentTurn ? 'default' : 'outline'}>
                      {turn.initiative}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Текущий персонаж */}
      {currentCharacter && (
        <Card>
          <CardHeader>
            <CardTitle>Ход: {currentCharacter.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Статистики */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>HP: {currentCharacter.hitPoints}/{currentCharacter.maxHitPoints}</div>
                <div>AC: {currentCharacter.armorClass}</div>
                <div>Движение: {currentCharacter.resources.movement}</div>
                <div>Уровень: {currentCharacter.level}</div>
              </div>

              <Separator />

              {/* Ресурсы */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Ресурсы хода:</div>
                <div className="flex gap-2">
                  <Badge variant={currentCharacter.resources.actionUsed ? 'destructive' : 'secondary'}>
                    Действие
                  </Badge>
                  <Badge variant={currentCharacter.resources.bonusActionUsed ? 'destructive' : 'secondary'}>
                    Бонус
                  </Badge>
                  <Badge variant={currentCharacter.resources.reactionUsed ? 'destructive' : 'secondary'}>
                    Реакция
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Действия */}
              <div className="space-y-2">
                <Button
                  onClick={() => setSelectedAction('attack')}
                  disabled={currentCharacter.resources.actionUsed}
                  className="w-full"
                  variant="outline"
                >
                  <Sword className="w-4 h-4 mr-2" />
                  Атака
                </Button>
                
                <Button
                  onClick={() => setSelectedAction('spell')}
                  disabled={currentCharacter.resources.actionUsed}
                  className="w-full"
                  variant="outline"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Заклинание
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Диалог атаки */}
      {selectedAction === 'attack' && (
        <Card>
          <CardHeader>
            <CardTitle>Выберите цель для атаки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите цель" />
                </SelectTrigger>
                <SelectContent>
                  {combatState.characters
                    .filter(char => char.id !== currentCharacter?.id)
                    .map(char => (
                      <SelectItem key={char.id} value={char.id}>
                        {char.name} (HP: {char.hitPoints}/{char.maxHitPoints})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button onClick={handleAttack} disabled={!selectedTarget}>
                  Атаковать
                </Button>
                <Button onClick={() => setSelectedAction(null)} variant="outline">
                  Отмена
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Диалог заклинания */}
      {selectedAction === 'spell' && (
        <Card>
          <CardHeader>
            <CardTitle>Применить заклинание</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={selectedSpell} onValueChange={setSelectedSpell}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите заклинание" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SpellcastingSystem.SPELLS).map(spellKey => (
                    <SelectItem key={spellKey} value={spellKey}>
                      {SpellcastingSystem.SPELLS[spellKey].name} ({SpellcastingSystem.SPELLS[spellKey].level} ур.)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedSpell && SpellcastingSystem.SPELLS[selectedSpell]?.attackRoll && (
                <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите цель" />
                  </SelectTrigger>
                  <SelectContent>
                    {combatState.characters
                      .filter(char => char.id !== currentCharacter?.id)
                      .map(char => (
                        <SelectItem key={char.id} value={char.id}>
                          {char.name} (HP: {char.hitPoints}/{char.maxHitPoints})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleCastSpell} disabled={!selectedSpell}>
                  Применить
                </Button>
                <Button onClick={() => setSelectedAction(null)} variant="outline">
                  Отмена
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};