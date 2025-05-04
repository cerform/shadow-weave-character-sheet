import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import AbilityRollingPanel from './AbilityRollingPanel';
import StandardArrayPanel from './StandardArrayPanel';
import PointBuyPanel from './PointBuyPanel';
import { getMaxAbilityScore } from './ManualInputPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ABILITY_SCORE_CAPS } from '@/types/character';

const CharacterAbilityScores: React.FC = () => {
  const { abilities, setAbilities, level } = useCharacterCreation();
  const [selectedMethod, setSelectedMethod] = useState<'roll' | 'standard' | 'point'>('roll');
  const [maxAbilityScore, setMaxAbilityScore] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Initialize abilities with default values if they are not already set
    if (!abilities) {
      setAbilities({
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
        CHA: ABILITY_SCORE_CAPS.DEFAULT,
      });
    }
  }, [setAbilities, abilities]);

  const handleAbilityChange = (ability: string, value: number) => {
    setAbilities(prevAbilities => {
      if (!prevAbilities) return prevAbilities;

      const updatedAbilities = {
        ...prevAbilities,
        [ability]: value,
        [ability.toLowerCase()]: value,
      };
      return updatedAbilities;
    });
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
                abilities={abilities}
                onAbilityChange={handleAbilityChange}
                getMaxAbilityScore={getMaxAbilityScore}
                level={level}
                maxAbilityScoreOverride={maxAbilityScore}
                setMaxAbilityScoreOverride={setMaxAbilityScore}
              />
            </TabsContent>
            <TabsContent value="standard">
              <StandardArrayPanel
                abilities={abilities}
                onAbilityChange={handleAbilityChange}
                getMaxAbilityScore={getMaxAbilityScore}
                level={level}
                maxAbilityScoreOverride={maxAbilityScore}
                setMaxAbilityScoreOverride={setMaxAbilityScore}
              />
            </TabsContent>
            <TabsContent value="point">
              <PointBuyPanel
                abilities={abilities}
                onAbilityChange={handleAbilityChange}
                getMaxAbilityScore={getMaxAbilityScore}
                level={level}
                maxAbilityScoreOverride={maxAbilityScore}
                setMaxAbilityScoreOverride={setMaxAbilityScore}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CharacterAbilityScores;
