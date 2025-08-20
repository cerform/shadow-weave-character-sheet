// src/pages/DnD5ePage.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CombatUI } from '@/components/dnd5e/CombatUI';
import { CharacterSheet } from '@/components/dnd5e/CharacterSheet';
import type { Character, CombatState } from '@/types/dnd5e';

// Демонстрационные персонажи
const DEMO_CHARACTERS: Character[] = [
  {
    id: '1',
    name: 'Аратор Паладин',
    level: 5,
    hitPoints: 45,
    maxHitPoints: 45,
    armorClass: 18,
    speed: 30,
    abilities: {
      strength: 16,
      dexterity: 10,
      constitution: 14,
      intelligence: 11,
      wisdom: 13,
      charisma: 15
    },
    proficiencyBonus: 3,
    savingThrows: {
      wisdom: 4,
      charisma: 5
    },
    skills: {
      athletics: 6,
      insight: 4,
      religion: 3
    },
    conditions: [],
    position: { x: 0, y: 0, z: 0 },
    resources: {
      actionUsed: false,
      bonusActionUsed: false,
      reactionUsed: false,
      movement: 30,
      spellSlots: {
        1: { used: 0, max: 4 },
        2: { used: 0, max: 2 }
      }
    }
  },
  {
    id: '2',
    name: 'Лира Плутовка',
    level: 5,
    hitPoints: 38,
    maxHitPoints: 38,
    armorClass: 15,
    speed: 30,
    abilities: {
      strength: 10,
      dexterity: 18,
      constitution: 13,
      intelligence: 14,
      wisdom: 12,
      charisma: 16
    },
    proficiencyBonus: 3,
    savingThrows: {
      dexterity: 7,
      intelligence: 5
    },
    skills: {
      stealth: 10,
      sleight_of_hand: 7,
      acrobatics: 7,
      perception: 4
    },
    conditions: [],
    position: { x: 1, y: 0, z: 0 },
    resources: {
      actionUsed: false,
      bonusActionUsed: false,
      reactionUsed: false,
      movement: 30,
      spellSlots: {}
    }
  },
  {
    id: '3',
    name: 'Гримболд Волшебник',
    level: 5,
    hitPoints: 28,
    maxHitPoints: 28,
    armorClass: 12,
    speed: 30,
    abilities: {
      strength: 8,
      dexterity: 14,
      constitution: 13,
      intelligence: 18,
      wisdom: 15,
      charisma: 11
    },
    proficiencyBonus: 3,
    savingThrows: {
      intelligence: 7,
      wisdom: 5
    },
    skills: {
      arcana: 7,
      history: 7,
      investigation: 7,
      insight: 5
    },
    conditions: [],
    position: { x: 2, y: 0, z: 0 },
    resources: {
      actionUsed: false,
      bonusActionUsed: false,
      reactionUsed: false,
      movement: 30,
      spellSlots: {
        1: { used: 0, max: 4 },
        2: { used: 0, max: 3 },
        3: { used: 0, max: 2 }
      }
    }
  },
  {
    id: '4',
    name: 'Орк Воин',
    level: 3,
    hitPoints: 32,
    maxHitPoints: 32,
    armorClass: 16,
    speed: 30,
    abilities: {
      strength: 18,
      dexterity: 12,
      constitution: 16,
      intelligence: 8,
      wisdom: 10,
      charisma: 9
    },
    proficiencyBonus: 2,
    savingThrows: {
      strength: 6,
      constitution: 5
    },
    skills: {
      intimidation: 1,
      athletics: 6
    },
    conditions: [],
    position: { x: 3, y: 0, z: 0 },
    resources: {
      actionUsed: false,
      bonusActionUsed: false,
      reactionUsed: false,
      movement: 30,
      spellSlots: {}
    }
  }
];

export default function DnD5ePage() {
  const [characters, setCharacters] = useState<Character[]>(DEMO_CHARACTERS);
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string>(characters[0].id);

  const handleStateChange = (newState: CombatState) => {
    setCombatState(newState);
    // Обновляем персонажей с изменениями из боя
    setCharacters(newState.characters);
  };

  const selectedChar = characters.find(c => c.id === selectedCharacter);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">D&D 5e Боевая Система</h1>
          <p className="text-muted-foreground">
            Полноценная система боя Dungeons & Dragons 5-го издания с инициативой, 
            действиями, заклинаниями и спасбросками.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка - Список персонажей */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Персонажи</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {characters.map(char => (
                    <Button
                      key={char.id}
                      variant={selectedCharacter === char.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCharacter(char.id)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{char.name}</div>
                        <div className="text-sm opacity-70">
                          Уровень {char.level} • HP: {char.hitPoints}/{char.maxHitPoints}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Информация о системе */}
            <Card>
              <CardHeader>
                <CardTitle>Особенности системы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>✓ Инициатива (d20 + Ловкость)</div>
                  <div>✓ Действия и бонусные действия</div>
                  <div>✓ Атаки с модификаторами</div>
                  <div>✓ Система заклинаний</div>
                  <div>✓ Спасброски</div>
                  <div>✓ Отслеживание ресурсов</div>
                  <div>✓ Пошаговый бой</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Центральная колонка - Лист персонажа */}
          <div>
            {selectedChar && (
              <CharacterSheet character={selectedChar} />
            )}
          </div>

          {/* Правая колонка будет содержать CombatUI */}
        </div>

        {/* Боевая система как overlay */}
        <CombatUI 
          characters={characters}
          onStateChange={handleStateChange}
        />

        {/* Статус боя */}
        {combatState?.isActive && (
          <Card className="fixed bottom-4 left-4 w-96">
            <CardHeader>
              <CardTitle>Статус боя</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>Раунд: {combatState.round}</div>
                <div>
                  Текущий ход: {
                    combatState.characters.find(
                      c => c.id === combatState.turnOrder[combatState.currentTurnIndex]?.characterId
                    )?.name
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Инициатива: {combatState.turnOrder[combatState.currentTurnIndex]?.initiative}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}