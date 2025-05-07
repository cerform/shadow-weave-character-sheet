import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getAbilityModifierString, getAbilityName } from '@/utils/abilityUtils';

interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [localStats, setLocalStats] = useState({
    strength: character.stats?.strength || 10,
    dexterity: character.stats?.dexterity || 10,
    constitution: character.stats?.constitution || 10,
    intelligence: character.stats?.intelligence || 10,
    wisdom: character.stats?.wisdom || 10,
    charisma: character.stats?.charisma || 10,
  });

  const handleStatChange = (ability: string, value: number) => {
    setLocalStats(prev => ({ ...prev, [ability]: value }));
  };

  const handleSaveStats = () => {
    onUpdate({ stats: localStats });
    setEditMode(false);
  };

  // Handle saving throw proficiency toggle
  const toggleSavingThrowProficiency = (ability: string) => {
    const currentProficiencies = character.savingThrowProficiencies || {};
    
    // Create a new object to avoid mutation
    const updatedProficiencies = { ...currentProficiencies };
    updatedProficiencies[ability] = !updatedProficiencies[ability];
    
    onUpdate({ savingThrowProficiencies: updatedProficiencies });
  };

  // Handle skill proficiency toggle
  const toggleSkillProficiency = (skill: string) => {
    const currentProficiencies = character.skillProficiencies || {};
    const currentExpertise = character.expertise || {};
    
    // Check if the skill has expertise before toggling proficiency
    const hasExpertise = Boolean(currentExpertise[skill]);
    
    // If the skill has expertise and we're removing proficiency,
    // we need to remove expertise too
    if (hasExpertise && currentProficiencies[skill]) {
      const updatedExpertise = { ...currentExpertise };
      delete updatedExpertise[skill];
      
      onUpdate({
        skillProficiencies: {
          ...currentProficiencies,
          [skill]: false
        },
        expertise: updatedExpertise
      });
    } else {
      onUpdate({
        skillProficiencies: {
          ...currentProficiencies,
          [skill]: !currentProficiencies[skill]
        }
      });
    }
  };

  // Handle expertise toggle
  const toggleExpertise = (skill: string) => {
    const currentExpertise = character.expertise || {};
    const currentProficiencies = character.skillProficiencies || {};
    
    // Expertise requires proficiency
    if (!currentProficiencies[skill]) {
      // Optionally, show a message or prevent toggling
      return;
    }
    
    const updatedExpertise = { ...currentExpertise };
    if (updatedExpertise[skill]) {
      delete updatedExpertise[skill];
    } else {
      updatedExpertise[skill] = true;
    }
    
    onUpdate({ expertise: updatedExpertise });
  };

  const skills = [
    { name: 'acrobatics', ability: 'dexterity', label: 'Акробатика' },
    { name: 'animalHandling', ability: 'wisdom', label: 'Уход за животными' },
    { name: 'arcana', ability: 'intelligence', label: 'Магия' },
    { name: 'athletics', ability: 'strength', label: 'Атлетика' },
    { name: 'deception', ability: 'charisma', label: 'Обман' },
    { name: 'history', ability: 'intelligence', label: 'История' },
    { name: 'insight', ability: 'wisdom', label: 'Проницательность' },
    { name: 'intimidation', ability: 'charisma', label: 'Запугивание' },
    { name: 'investigation', ability: 'intelligence', label: 'Расследование' },
    { name: 'medicine', ability: 'wisdom', label: 'Медицина' },
    { name: 'nature', ability: 'intelligence', label: 'Природа' },
    { name: 'perception', ability: 'wisdom', label: 'Внимательность' },
    { name: 'performance', ability: 'charisma', label: 'Выступление' },
    { name: 'persuasion', ability: 'charisma', label: 'Убеждение' },
    { name: 'religion', ability: 'intelligence', label: 'Религия' },
    { name: 'sleightOfHand', ability: 'dexterity', label: 'Ловкость рук' },
    { name: 'stealth', ability: 'dexterity', label: 'Скрытность' },
    { name: 'survival', ability: 'wisdom', label: 'Выживание' },
  ];

  const savingThrows = [
    'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Характеристики</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {Object.entries(localStats).map(([ability, value]) => (
            <div key={ability} className="space-y-2">
              <Label>{getAbilityName(ability)}</Label>
              {editMode ? (
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => handleStatChange(ability, parseInt(e.target.value))}
                />
              ) : (
                <div className="p-2 border rounded">{value} ({getAbilityModifierString(value)})</div>
              )}
            </div>
          ))}
        </CardContent>
        <div className="p-4 border-t">
          {editMode ? (
            <div className="flex justify-end">
              <button onClick={handleSaveStats} className="px-4 py-2 bg-green-500 text-white rounded">Сохранить</button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-blue-500 text-white rounded">Редактировать</button>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Спасброски</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {savingThrows.map(ability => (
              <div key={ability} className="flex items-center space-x-2">
                <Checkbox
                  id={`saving-throw-${ability}`}
                  checked={character.savingThrowProficiencies?.[ability] || false}
                  onCheckedChange={() => toggleSavingThrowProficiency(ability)}
                />
                <Label htmlFor={`saving-throw-${ability}`}>
                  {getAbilityName(ability)} ({getAbilityModifierString(localStats[ability] || 10)})
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Навыки</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {skills.map(skill => (
                <div key={skill.name} className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill.name}`}
                        checked={character.skillProficiencies?.[skill.name] || false}
                        onCheckedChange={() => toggleSkillProficiency(skill.name)}
                      />
                      <Label htmlFor={`skill-${skill.name}`}>
                        {skill.label} ({getAbilityModifierString(localStats[skill.ability] || 10)})
                      </Label>
                    </div>
                  </div>
                  <div>
                    {character.skillProficiencies?.[skill.name] && (
                      <Checkbox
                        id={`expertise-${skill.name}`}
                        checked={character.expertise?.[skill.name] || false}
                        onCheckedChange={() => toggleExpertise(skill.name)}
                        disabled={!character.skillProficiencies?.[skill.name]}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbilitiesTab;
