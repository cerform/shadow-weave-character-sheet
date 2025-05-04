
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import AbilityRollingPanel from './AbilityRollingPanel';
import StandardArrayPanel from './StandardArrayPanel';
import PointBuyPanel from './PointBuyPanel';
import ManualInputPanel, { getMaxAbilityScore } from './ManualInputPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ABILITY_SCORE_CAPS } from '@/constants/abilityScores';
import { AbilityScores } from '@/types/character';

const CharacterAbilityScores: React.FC = () => {
  const { character, updateCharacter } = useCharacterCreation();
  const [selectedMethod, setSelectedMethod] = useState<'roll' | 'standard' | 'point'>('roll');
  const [maxAbilityScore, setMaxAbilityScore] = useState<number | undefined>(undefined);
  const level = character?.level || 1;

  useEffect(() => {
    // Initialize abilities with default values if they are not already set
    if (!character || !character.abilities) {
      const defaultAbilities = {
        strength: ABILITY_SCORE_CAPS.DEFAULT,
        dexterity: ABILITY_SCORE_CAPS.DEFAULT,
        constitution: ABILITY_SCORE_CAPS.DEFAULT,
        intelligence: ABILITY_SCORE_CAPS.DEFAULT,
        wisdom: ABILITY_SCORE_CAPS.DEFAULT,
        charisma: ABILITY_SCORE_CAPS.DEFAULT,
        STR: ABILITY_SCORE_CAPS.DEFAULT,
        DEX: ABILITY_SCORE_CAPS.DEFAULT,
        CON: ABILITY_SCORE_CAPS.DEFAULT,
        INT: ABILITY_SCORE_CAPS.DEFAULT,
        WIS: ABILITY_SCORE_CAPS.DEFAULT,
        CHA: ABILITY_SCORE_CAPS.DEFAULT
        // Removing the problematic index signature here
      } as AbilityScores;
      
      updateCharacter({
        abilities: defaultAbilities
      });
    }
  }, [updateCharacter, character]);

  const handleAbilityChange = (ability: string, value: number) => {
    if (!character?.abilities) return;

    const updatedAbilities = {
      ...character.abilities,
      [ability]: value,
      [ability.toLowerCase()]: value
      // Removing the problematic index signature here
    } as AbilityScores;

    updateCharacter({
      abilities: updatedAbilities
    });
  };

  // Helper function to convert modifier to string format
  const getModifierString = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Характеристики</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="roll" className="w-full">
          <TabsList>
            <TabsTrigger value="roll" onClick={() => setSelectedMethod('roll')}>Бросок</TabsTrigger>
            <TabsTrigger value="standard" onClick={() => setSelectedMethod('standard')}>Стандартный набор</TabsTrigger>
            <TabsTrigger value="point" onClick={() => setSelectedMethod('point')}>Покупка очков</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <TabsContent value="roll">
              <AbilityRollingPanel
                stats={character?.abilities || {} as Record<string, number>}
                onAssignDiceToStat={handleAbilityChange}
                diceResults={[]}
                assignedDice={{}}
                onRollAllAbilities={() => {}}
                getModifier={getModifierString}
              />
            </TabsContent>
            <TabsContent value="standard">
              <StandardArrayPanel
                stats={character?.abilities || {} as Record<string, number>}
                getModifier={getModifierString}
              />
            </TabsContent>
            <TabsContent value="point">
              <PointBuyPanel
                stats={character?.abilities || {} as Record<string, number>}
                pointsLeft={27}
                incrementStat={(stat) => handleAbilityChange(stat, (character?.abilities?.[stat] || 8) + 1)}
                decrementStat={(stat) => handleAbilityChange(stat, (character?.abilities?.[stat] || 8) - 1)}
                getModifier={getModifierString}
                abilityScorePoints={27}
                maxAbilityScore={maxAbilityScore || ABILITY_SCORE_CAPS.BASE_CAP}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CharacterAbilityScores;
