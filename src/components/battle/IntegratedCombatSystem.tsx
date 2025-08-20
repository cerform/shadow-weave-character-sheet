// src/components/battle/IntegratedCombatSystem.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CombatUI } from '@/components/dnd5e/CombatUI';
import { CharacterSheet } from '@/components/dnd5e/CharacterSheet';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { BattleSystemAdapter } from '@/adapters/battleSystemAdapter';
import type { Character, CombatState } from '@/types/dnd5e';
import { DnD5eCombatSystem } from '@/systems/dnd5e/combat';
import { Swords, Users, Map, Settings } from 'lucide-react';

interface IntegratedCombatSystemProps {
  showMap?: boolean;
}

export const IntegratedCombatSystem: React.FC<IntegratedCombatSystemProps> = ({ 
  showMap = true 
}) => {
  const { 
    tokens, 
    combatStarted, 
    activeId,
    addCombatEvent,
    updateToken,
    selectToken
  } = useEnhancedBattleStore();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [combatSystem] = useState(() => new DnD5eCombatSystem());
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'combat' | 'characters'>('overview');

  // Синхронизация токенов с персонажами D&D 5e
  useEffect(() => {
    if (tokens.length > 0) {
      const newCharacters = BattleSystemAdapter.createDemoCharactersFromTokens(tokens);
      setCharacters(newCharacters);
    }
  }, [tokens]);

  // Обработчик изменений состояния боя D&D 5e
  const handleCombatStateChange = (newState: CombatState) => {
    setCombatState(newState);
    
    // Синхронизируем изменения обратно в токены
    newState.characters.forEach(character => {
      const token = tokens.find(t => t.id === character.id);
      if (token) {
        const updatedToken = BattleSystemAdapter.syncCharacterToToken(character, token);
        updateToken(character.id, updatedToken);
      }
    });

    // Устанавливаем активный токен
    if (newState.isActive && newState.turnOrder.length > 0) {
      const currentCharacterId = newState.turnOrder[newState.currentTurnIndex]?.characterId;
      if (currentCharacterId) {
        selectToken(currentCharacterId);
      }
    }
  };

  const startIntegratedCombat = () => {
    if (characters.length > 0) {
      combatSystem.startCombat(characters);
      const newState = combatSystem.getState();
      handleCombatStateChange(newState);
      setActiveTab('combat');
    }
  };

  const endIntegratedCombat = () => {
    combatSystem.endCombat();
    setCombatState(null);
    selectToken(null);
    setActiveTab('overview');
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <TabsList>
            <TabsTrigger value="overview">
              <Map className="w-4 h-4 mr-2" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="combat">
              <Swords className="w-4 h-4 mr-2" />
              Бой D&D 5e
            </TabsTrigger>
            <TabsTrigger value="characters">
              <Users className="w-4 h-4 mr-2" />
              Персонажи
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {combatState?.isActive && (
              <Badge variant="outline">
                Раунд {combatState.round}
              </Badge>
            )}
            
            {!combatState?.isActive ? (
              <Button onClick={startIntegratedCombat} disabled={characters.length === 0}>
                <Swords className="w-4 h-4 mr-2" />
                Начать бой D&D 5e
              </Button>
            ) : (
              <Button onClick={endIntegratedCombat} variant="destructive">
                Закончить бой
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="overview" className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Статистика боя */}
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Участников:</span>
                    <Badge>{tokens.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Активный бой:</span>
                    <Badge variant={combatState?.isActive ? 'default' : 'secondary'}>
                      {combatState?.isActive ? 'Да' : 'Нет'}
                    </Badge>
                  </div>
                  {combatState?.isActive && (
                    <>
                      <div className="flex justify-between">
                        <span>Раунд:</span>
                        <Badge variant="outline">{combatState.round}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Текущий ход:</span>
                        <Badge variant="outline">
                          {combatState.characters.find(
                            c => c.id === combatState.turnOrder[combatState.currentTurnIndex]?.characterId
                          )?.name || 'Неизвестно'}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Быстрый обзор участников */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Участники боя</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {characters.map(character => (
                    <div
                      key={character.id}
                      className={`p-3 rounded border ${
                        activeId === character.id ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{character.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Уровень {character.level}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            HP: {character.hitPoints}/{character.maxHitPoints}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            AC: {character.armorClass}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="combat" className="flex-1">
          {characters.length > 0 ? (
            <CombatUI 
              characters={characters}
              onStateChange={handleCombatStateChange}
            />
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Swords className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Нет участников боя</h3>
                <p className="text-muted-foreground">
                  Добавьте токены на карту, чтобы начать бой
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="characters" className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map(character => (
              <CharacterSheet 
                key={character.id} 
                character={character} 
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};