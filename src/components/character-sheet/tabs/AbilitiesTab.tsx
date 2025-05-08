import React, { useState, useEffect, useCallback } from 'react';
import { Character } from '@/types/character';
import { getAbilityModifier, getAbilityModifierString, hasSavingThrowProficiency } from '@/utils/abilityUtils';
import { calculateAbilityModifier } from '@/utils/characterUtils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { CheckCircle, Circle } from 'lucide-react';

interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  const [savingThrows, setSavingThrows] = useState<{ [key: string]: boolean }>({});
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    if (character && character.savingThrows) {
      setSavingThrows(character.savingThrows);
    }
  }, [character]);

  const handleAbilityChange = (ability: string, value: number) => {
    if (onUpdate && character) {
      const updatedAbilities = {
        ...character.abilities,
        [ability]: value,
      };
      onUpdate({ abilities: updatedAbilities });
    }
  };

  const handleSavingThrowChange = (ability: string, proficient: boolean) => {
    if (onUpdate && character) {
      const updatedSavingThrows = {
        ...character.savingThrows,
        [ability]: proficient,
      };
      onUpdate({ savingThrows: updatedSavingThrows });
      setSavingThrows(updatedSavingThrows);
    }
  };

  const getSavingThrowModifier = useCallback((ability: string) => {
    if (!character || !character.abilities) return '+0';
    const abilityScore = character.abilities[ability as keyof typeof character.abilities] || 10;
    let modifier = calculateAbilityModifier(abilityScore);
    if (hasSavingThrowProficiency(character, ability)) {
      modifier += (character.proficiencyBonus || 2);
    }
    return (modifier >= 0 ? '+' : '') + modifier;
  }, [character]);

  const getSkillModifier = useCallback((skill: string) => {
    if (!character || !character.abilities) return '+0';
    const abilityKey = skill.replace(/[^a-zA-Z]+/g, '').toLowerCase();
    const abilityMod = getAbilityModifierValue(
      typeof character.abilities[abilityKey] === 'number'
        ? character.abilities[abilityKey] as number
        : 10 // Default value if not a number
    );
    let modifier = abilityMod;
    if (character.skillProficiencies && character.skillProficiencies.includes(skill)) {
      modifier += (character.proficiencyBonus || 2);
    }
    return (modifier >= 0 ? '+' : '') + modifier;
  }, [character]);

  const getAbilityModifierValue = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const isSkillProficient = (skill: string): boolean => {
    return character.skillProficiencies?.includes(skill) || false;
  };

  const toggleSkillProficiency = (skill: string) => {
    if (!character || !onUpdate) return;

    const isCurrentlyProficient = isSkillProficient(skill);
    let updatedProficiencies = [...(character.skillProficiencies || [])];

    if (isCurrentlyProficient) {
      updatedProficiencies = updatedProficiencies.filter(prof => prof !== skill);
    } else {
      updatedProficiencies = [...updatedProficiencies, skill];
    }

    onUpdate({ skillProficiencies: updatedProficiencies });
  };

  const renderAbilityInput = (ability: string) => {
    const abilityLower = ability.toLowerCase();
    const abilityValue = character.abilities?.[abilityLower as keyof typeof character.abilities] || 10;

    return (
      <div key={ability} className="grid gap-2">
        <Label htmlFor={abilityLower}>{ability}</Label>
        <Input
          type="number"
          id={abilityLower}
          value={abilityValue}
          onChange={(e) => handleAbilityChange(abilityLower, Number(e.target.value))}
          style={{
            backgroundColor: currentTheme.cardBackground,
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        />
        <div className="text-center">
          {getAbilityModifier(abilityValue)}
        </div>
      </div>
    );
  };

  const renderSavingThrow = (ability: string) => {
    const isProficient = savingThrows[ability] || false;

    return (
      <div key={ability} className="flex items-center justify-between p-2 border rounded">
        <Label htmlFor={`savingThrow-${ability}`} className="mr-2">
          {ability} Спасбросок
        </Label>
        <div className="flex items-center">
          <span className="mr-2">{getSavingThrowModifier(ability)}</span>
          <Button
            variant={isProficient ? "default" : "outline"}
            size="sm"
            onClick={() => handleSavingThrowChange(ability, !isProficient)}
            style={{
              backgroundColor: isProficient ? currentTheme.accent : currentTheme.background,
              color: isProficient ? currentTheme.background : currentTheme.accent,
            }}
          >
            {isProficient ? <CheckCircle className="h-4 w-4 mr-2" /> : <Circle className="h-4 w-4 mr-2" />}
            {isProficient ? 'Владею' : 'Не владею'}
          </Button>
        </div>
      </div>
    );
  };

  const renderSkill = (skill: string) => {
    const isProficient = isSkillProficient(skill);

    return (
      <div key={skill} className="flex items-center justify-between p-2 border rounded">
        <Label htmlFor={`skill-${skill}`} className="mr-2">
          {skill}
        </Label>
        <div className="flex items-center">
          <span className="mr-2">{getSkillModifier(skill)}</span>
          <Button
            variant={isProficient ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSkillProficiency(skill)}
            style={{
              backgroundColor: isProficient ? currentTheme.accent : currentTheme.background,
              color: isProficient ? currentTheme.background : currentTheme.accent,
            }}
          >
            {isProficient ? <CheckCircle className="h-4 w-4 mr-2" /> : <Circle className="h-4 w-4 mr-2" />}
            {isProficient ? 'Владею' : 'Не владею'}
          </Button>
        </div>
      </div>
    );
  };

  // Define a proper interface for features
  interface CharacterFeature {
    name: string;
    description: string;
    level?: number;
  }

  // Helper function to normalize features (convert strings to objects)
  const normalizeFeature = (feature: string | CharacterFeature): CharacterFeature => {
    if (typeof feature === 'string') {
      return {
        name: feature,
        description: `Feature: ${feature}`,
        level: 1
      };
    }
    return feature;
  };

  // Helper function to normalize feats (convert strings to objects)
  const normalizeFeat = (feat: string | CharacterFeature): CharacterFeature => {
    if (typeof feat === 'string') {
      return {
        name: feat,
        description: `Feat: ${feat}`,
        level: 1
      };
    }
    return feat;
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Характеристики</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {renderAbilityInput('Strength')}
          {renderAbilityInput('Dexterity')}
          {renderAbilityInput('Constitution')}
          {renderAbilityInput('Intelligence')}
          {renderAbilityInput('Wisdom')}
          {renderAbilityInput('Charisma')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Спасброски</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {renderSavingThrow('Strength')}
          {renderSavingThrow('Dexterity')}
          {renderSavingThrow('Constitution')}
          {renderSavingThrow('Intelligence')}
          {renderSavingThrow('Wisdom')}
          {renderSavingThrow('Charisma')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Навыки</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {renderSkill('Acrobatics (Dex)')}
          {renderSkill('Animal Handling (Wis)')}
          {renderSkill('Arcana (Int)')}
          {renderSkill('Athletics (Str)')}
          {renderSkill('Deception (Cha)')}
          {renderSkill('History (Int)')}
          {renderSkill('Insight (Wis)')}
          {renderSkill('Intimidation (Cha)')}
          {renderSkill('Investigation (Int)')}
          {renderSkill('Medicine (Wis)')}
          {renderSkill('Nature (Int)')}
          {renderSkill('Perception (Wis)')}
          {renderSkill('Performance (Cha)')}
          {renderSkill('Persuasion (Cha)')}
          {renderSkill('Religion (Int)')}
          {renderSkill('Sleight of Hand (Dex)')}
          {renderSkill('Stealth (Dex)')}
          {renderSkill('Survival (Wis)')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Особенности расы</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full">
            <div className="space-y-2">
              {character.raceFeatures && character.raceFeatures.length > 0 ? (
                character.raceFeatures.map((feature, index) => {
                  const normalizedFeature = normalizeFeature(feature);
                  return (
                    <div key={`race-feature-${index}`} className="p-2 border rounded">
                      {normalizedFeature ? (
                        <div className="feature-card">
                          <h4>{normalizedFeature.name}</h4>
                          <p>{normalizedFeature.description}</p>
                        </div>
                      ) : (
                        <div className="feature-card">
                          <h4>Unknown Feature</h4>
                          <p>This feature has no data</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  Нет особенностей расы
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Особенности класса</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full">
            <div className="space-y-2">
              {character.classFeatures && character.classFeatures.length > 0 ? (
                character.classFeatures.map((feature, index) => {
                  const normalizedFeature = normalizeFeature(feature);
                  return (
                    <div key={`class-feature-${index}`} className="p-2 border rounded">
                      {normalizedFeature ? (
                        <div className="feature-card">
                          <h4>{normalizedFeature.name}</h4>
                          <p>{normalizedFeature.description}</p>
                        </div>
                      ) : (
                        <div className="feature-card">
                          <h4>Unknown Feature</h4>
                          <p>This feature has no data</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  Нет особенностей класса
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Особенности происхождения</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full">
            <div className="space-y-2">
              {character.backgroundFeatures && character.backgroundFeatures.length > 0 ? (
                character.backgroundFeatures.map((feature, index) => {
                  const normalizedFeature = normalizeFeature(feature);
                  return (
                    <div key={`background-feature-${index}`} className="p-2 border rounded">
                      {normalizedFeature ? (
                        <div className="feature-card">
                          <h4>{normalizedFeature.name}</h4>
                          <p>{normalizedFeature.description}</p>
                        </div>
                      ) : (
                        <div className="feature-card">
                          <h4>Unknown Feature</h4>
                          <p>This feature has no data</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  Нет особенностей происхождения
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle style={{ color: currentTheme.textColor }}>Черты</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full">
            <div className="space-y-2">
              {character.feats && character.feats.length > 0 ? (
                character.feats.map((feat, index) => {
                  const normalizedFeat = normalizeFeat(feat);
                  return (
                    <div key={`feat-${index}`} className="p-2 border rounded">
                      {normalizedFeat ? (
                        <div className="feature-card">
                          <h4>{normalizedFeat.name}</h4>
                          <p>{normalizedFeat.description}</p>
                        </div>
                      ) : (
                        <div className="feature-card">
                          <h4>Unknown Feat</h4>
                          <p>This feat has no data</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  Нет черт
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbilitiesTab;
