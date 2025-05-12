import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getModifierFromAbilityScore } from '@/utils/characterUtils';

interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Add helper to safely convert array types
const convertToRecord = (arr: string[] | undefined): Record<string, boolean> => {
  if (!arr) return {};
  const record: Record<string, boolean> = {};
  arr.forEach(item => {
    record[item] = true;
  });
  return record;
};

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const [strength, setStrength] = useState(character.strength || 10);
  const [dexterity, setDexterity] = useState(character.dexterity || 10);
  const [constitution, setConstitution] = useState(character.constitution || 10);
  const [intelligence, setIntelligence] = useState(character.intelligence || 10);
  const [wisdom, setWisdom] = useState(character.wisdom || 10);
  const [charisma, setCharisma] = useState(character.charisma || 10);

  // Fix type conversions for savingThrows - make sure they're booleans
  const savingThrows: Record<string, boolean> = {};
  (character.savingThrowProficiencies || []).forEach(ability => {
    if (typeof ability === 'string') {
      savingThrows[ability] = true;
    }
  });

  // Fix type conversions for skillBonuses - ensure they're numbers
  const skillBonuses: Record<string, number> = {};
  if (character.skillBonuses) {
    Object.entries(character.skillBonuses).forEach(([skill, bonus]) => {
      skillBonuses[skill] = typeof bonus === 'string' ? parseInt(bonus, 10) : Number(bonus);
    });
  }

  useEffect(() => {
    setStrength(character.strength || 10);
    setDexterity(character.dexterity || 10);
    setConstitution(character.constitution || 10);
    setIntelligence(character.intelligence || 10);
    setWisdom(character.wisdom || 10);
    setCharisma(character.charisma || 10);
  }, [character.strength, character.dexterity, character.constitution, character.intelligence, character.wisdom, character.charisma]);

  const handleAbilityChange = (ability: string, value: number) => {
    const updates: Partial<Character> = {
      [ability]: value,
      abilities: {
        ...character.abilities,
        [ability]: value,
      },
      stats: {
        ...character.stats,
        [ability]: value,
      },
    };
    onUpdate(updates);
  };

  const handleSavingThrowChange = (ability: string, proficient: boolean) => {
    const updatedSavingThrows = {
      ...character.savingThrowProficiencies,
      [ability]: proficient,
    };
    onUpdate({ savingThrowProficiencies: updatedSavingThrows });
  };

  const handleSkillChange = (skill: string, proficient: boolean) => {
    const updatedSkills = {
      ...character.skills,
      [skill]: { proficient },
    };
    onUpdate({ skills: updatedSkills });
  };

  const handleSkillBonusChange = (skill: string, bonus: number) => {
    const updatedSkillBonuses = {
      ...character.skillBonuses,
      [skill]: bonus,
    };
    onUpdate({ skillBonuses: updatedSkillBonuses });
  };

  // Fix iterating over proficiencies by ensuring it's an object with arrays
  const renderProficiencies = () => {
    if (!character.proficiencies) return null;
    
    // Ensure proficiencies is an object with expected properties
    const { languages = [], tools = [], weapons = [], armor = [] } = 
      typeof character.proficiencies === 'object' && character.proficiencies !== null ? 
        character.proficiencies : { languages: [], tools: [], weapons: [], armor: [] };

    return (
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-semibold">Владение языками</h4>
          <Textarea
            placeholder="Языки, которыми владеет персонаж"
            value={languages.join(', ') || ""}
            onChange={(e) => onUpdate({ proficiencies: { ...character.proficiencies, languages: e.target.value.split(', ') } })}
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Владение инструментами</h4>
          <Textarea
            placeholder="Инструменты, которыми владеет персонаж"
            value={tools.join(', ') || ""}
            onChange={(e) => onUpdate({ proficiencies: { ...character.proficiencies, tools: e.target.value.split(', ') } })}
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Владение оружием</h4>
          <Textarea
            placeholder="Оружие, которым владеет персонаж"
            value={weapons.join(', ') || ""}
            onChange={(e) => onUpdate({ proficiencies: { ...character.proficiencies, weapons: e.target.value.split(', ') } })}
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Владение доспехами</h4>
          <Textarea
            placeholder="Доспехи, которыми владеет персонаж"
            value={armor.join(', ') || ""}
            onChange={(e) => onUpdate({ proficiencies: { ...character.proficiencies, armor: e.target.value.split(', ') } })}
          />
        </div>
      </div>
    );
  };

  // Fix Boolean call issue by using proper boolean conversion
  const isProficient = (skill: string): boolean => {
    // Convert string 'true'/'false' or actual boolean to boolean
    if (typeof character.skills === 'object' && character.skills !== null) {
      const skillValue = character.skills[skill];
      if (typeof skillValue === 'boolean') {
        return skillValue;
      } else if (typeof skillValue === 'object' && skillValue !== null) {
        return Boolean(skillValue.proficient);
      }
    }
    return false;
  };

  // Fix feature categories by initializing them if they don't exist
  const raceFeatures = character.raceFeatures || [];
  const classFeatures = character.classFeatures || [];
  const backgroundFeatures = character.backgroundFeatures || [];
  const feats = character.feats || [];

  return (
    <ScrollArea className="h-[65vh]">
      <div className="space-y-6 p-4">
        <Card className="mb-4" style={{ backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.accent, color: currentTheme.textColor }}>
          <CardHeader>
            <CardTitle>Характеристики</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="strength">Сила</Label>
              <Input
                type="number"
                id="strength"
                value={strength}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setStrength(value);
                  handleAbilityChange('strength', value);
                }}
                style={{ backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.accent, color: currentTheme.textColor }}
              />
              <p className="text-sm text-muted-foreground">Модификатор: {getModifierFromAbilityScore(strength)}</p>
            </div>
            <div>
              <Label htmlFor="dexterity">Ловкость</Label>
              <Input
                type="number"
                id="dexterity"
                value={dexterity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setDexterity(value);
                  handleAbilityChange('dexterity', value);
                }}
                style={{ backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.accent, color: currentTheme.textColor }}
              />
              <p className="text-sm text-muted-foreground">Модификатор: {getModifierFromAbilityScore(dexterity)}</p>
            </div>
            <div>
              <Label htmlFor="constitution">Телосложение</Label>
              <Input
                type="number"
                id="constitution"
                value={constitution}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setConstitution(value);
                  handleAbilityChange('constitution', value);
                }}
                style={{ backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.accent, color: currentTheme.textColor }}
              />
              <p className="text-sm text-muted-foreground">Модификатор: {getModifierFromAbilityScore(constitution)}</p>
            </div>
            <div>
              <Label htmlFor="intelligence">Интеллект</Label>
              <Input
                type="number"
                id="intelligence"
                value={intelligence}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setIntelligence(value);
                  handleAbilityChange('intelligence', value);
                }}
                style={{ backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.accent, color: currentTheme.textColor }}
              />
              <p className="text-sm text-muted-foreground">Модификатор: {getModifierFromAbilityScore(intelligence)}</p>
            </div>
            <div>
              <Label htmlFor="wisdom">Мудрость</Label>
              <Input
                type="number"
                id="wisdom"
                value={wisdom}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setWisdom(value);
                  handleAbilityChange('wisdom', value);
                }}
                style={{ backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.accent, color: currentTheme.textColor }}
              />
              <p className="text-sm text-muted-foreground">Модификатор: {getModifierFromAbilityScore(wisdom)}</p>
            </div>
            <div>
              <Label htmlFor="charisma">Харизма</Label>
              <Input
                type="number"
                id="charisma"
                value={charisma}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setCharisma(value);
                  handleAbilityChange('charisma', value);
                }}
                style={{ backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.accent, color: currentTheme.textColor }}
              />
              <p className="text-sm text-muted-foreground">Модификатор: {getModifierFromAbilityScore(charisma)}</p>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.accent, color: currentTheme.textColor }}>
          <CardHeader>
            <CardTitle>Спасброски</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="strength-save" className="flex items-center">
                <Checkbox
                  id="strength-save"
                  checked={character.savingThrowProficiencies?.strength || false}
                  onCheckedChange={(checked) => handleSavingThrowChange('strength', checked as boolean)}
                />
                <span className="ml-2">Сила</span>
              </Label>
            </div>
            <div>
              <Label htmlFor="dexterity-save" className="flex items-center">
                <Checkbox
                  id="dexterity-save"
                  checked={character.savingThrowProficiencies?.dexterity || false}
                  onCheckedChange={(checked) => handleSavingThrowChange('dexterity', checked as boolean)}
                />
                <span className="ml-2">Ловкость</span>
              </Label>
            </div>
            <div>
              <Label htmlFor="constitution-save" className="flex items-center">
                <Checkbox
                  id="constitution-save"
                  checked={character.savingThrowProficiencies?.constitution || false}
                  onCheckedChange={(checked) => handleSavingThrowChange('constitution', checked as boolean)}
                />
                <span className="ml-2">Телосложение</span>
              </Label>
            </div>
            <div>
              <Label htmlFor="intelligence-save" className="flex items-center">
                <Checkbox
                  id="intelligence-save"
                  checked={character.savingThrowProficiencies?.intelligence || false}
                  onCheckedChange={(checked) => handleSavingThrowChange('intelligence', checked as boolean)}
                />
                <span className="ml-2">Интеллект</span>
              </Label>
            </div>
            <div>
              <Label htmlFor="wisdom-save" className="flex items-center">
                <Checkbox
                  id="wisdom-save"
                  checked={character.savingThrowProficiencies?.wisdom || false}
                  onCheckedChange={(checked) => handleSavingThrowChange('wisdom', checked as boolean)}
                />
                <span className="ml-2">Мудрость</span>
              </Label>
            </div>
            <div>
              <Label htmlFor="charisma-save" className="flex items-center">
                <Checkbox
                  id="charisma-save"
                  checked={character.savingThrowProficiencies?.charisma || false}
                  onCheckedChange={(checked) => handleSavingThrowChange('charisma', checked as boolean)}
                />
                <span className="ml-2">Харизма</span>
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.accent, color: currentTheme.textColor }}>
          <CardHeader>
            <CardTitle>Навыки</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(character.skills || {}).map(([skill, value]) => (
              <div key={skill}>
                <Label htmlFor={`skill-${skill}`} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox
                      id={`skill-${skill}`}
                      checked={isProficient(skill)}
                      onCheckedChange={(checked) => handleSkillChange(skill, checked as boolean)}
                    />
                    <span className="ml-2">{skill}</span>
                  </div>
                  <Input
                    type="number"
                    className="w-20"
                    value={skillBonuses[skill] || 0}
                    onChange={(e) => {
                      const bonus = parseInt(e.target.value);
                      handleSkillBonusChange(skill, bonus);
                    }}
                    style={{ backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.accent, color: currentTheme.textColor }}
                  />
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.accent, color: currentTheme.textColor }}>
          <CardHeader>
            <CardTitle>Владения</CardTitle>
          </CardHeader>
          <CardContent>
            {renderProficiencies()}
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.accent, color: currentTheme.textColor }}>
          <CardHeader>
            <CardTitle>Особенности</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <h4 className="text-sm font-semibold">Расовые особенности</h4>
              {raceFeatures.length > 0 ? (
                <ul className="list-disc pl-4">
                  {raceFeatures.map((feature, index) => (
                    <li key={`race-feature-${index}`}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Нет расовых особенностей</p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold">Классовые особенности</h4>
              {classFeatures.length > 0 ? (
                <ul className="list-disc pl-4">
                  {classFeatures.map((feature, index) => (
                    <li key={`class-feature-${index}`}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Нет классовых особенностей</p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold">Особенности предыстории</h4>
              {backgroundFeatures.length > 0 ? (
                <ul className="list-disc pl-4">
                  {backgroundFeatures.map((feature, index) => (
                    <li key={`background-feature-${index}`}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Нет особенностей предыстории</p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold">Черты</h4>
              {feats.length > 0 ? (
                <ul className="list-disc pl-4">
                  {feats.map((feat, index) => (
                    <li key={`feat-${index}`}>{feat}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Нет черт</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default AbilitiesTab;
