import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Character } from '@/types/character';
import { 
  skillDefinitions, 
  getClassSkillProficiencies, 
  getClassSkillCount 
} from '@/utils/characterCalculations';

interface CharacterSkillSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterSkillSelection: React.FC<CharacterSkillSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [backgroundSkills, setBackgroundSkills] = useState<string[]>([]);
  
  const classSkills = character.class ? getClassSkillProficiencies(character.class) : [];
  const maxClassSkills = character.class ? getClassSkillCount(character.class) : 2;
  
  // Получаем навыки от предыстории
  useEffect(() => {
    if (character.background) {
      // Здесь должна быть логика получения навыков от предыстории
      // Пока что используем пустой массив
      setBackgroundSkills([]);
    }
  }, [character.background]);
  
  // Инициализируем выбранные навыки из персонажа
  useEffect(() => {
    if (character.skillProficiencies) {
      setSelectedSkills(character.skillProficiencies);
    }
  }, [character.skillProficiencies]);
  
  const handleSkillToggle = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      if (selectedSkills.length < maxClassSkills) {
        setSelectedSkills([...selectedSkills, skillName]);
      }
    }
  };
  
  const handleNext = () => {
    // Объединяем навыки от класса и предыстории
    const allSkills = [...selectedSkills, ...backgroundSkills];
    
    // Создаем объект навыков с информацией о владении
    const skillsObject: Record<string, { proficient: boolean; expertise?: boolean }> = {};
    
    skillDefinitions.forEach(skill => {
      skillsObject[skill.name] = {
        proficient: allSkills.includes(skill.name),
        expertise: false
      };
    });
    
    updateCharacter({
      skillProficiencies: allSkills,
      skills: skillsObject
    });
    
    nextStep();
  };
  
  const canProceed = selectedSkills.length === maxClassSkills;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Выбор навыков</h2>
        <p className="text-muted-foreground mb-6">
          Выберите {maxClassSkills} навык(а) из доступных для вашего класса {character.class}
        </p>
      </div>
      
      {character.class === 'Бард' && (
        <Alert>
          <AlertDescription>
            Как бард, вы можете выбрать любые 3 навыка из всего списка.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Доступные навыки класса</CardTitle>
          <CardDescription>
            Выбрано: {selectedSkills.length} из {maxClassSkills}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(character.class === 'Бард' ? skillDefinitions : skillDefinitions.filter(skill => classSkills.includes(skill.name))).map((skill) => (
              <div key={skill.name} className="flex items-center space-x-2">
                <Checkbox
                  id={skill.name}
                  checked={selectedSkills.includes(skill.name)}
                  onCheckedChange={() => handleSkillToggle(skill.name)}
                  disabled={!selectedSkills.includes(skill.name) && selectedSkills.length >= maxClassSkills}
                />
                <label
                  htmlFor={skill.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {skill.name} ({skill.ability === 'strength' ? 'Сила' : 
                              skill.ability === 'dexterity' ? 'Ловкость' :
                              skill.ability === 'constitution' ? 'Телосложение' :
                              skill.ability === 'intelligence' ? 'Интеллект' :
                              skill.ability === 'wisdom' ? 'Мудрость' : 'Харизма'})
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {backgroundSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Навыки от предыстории</CardTitle>
            <CardDescription>
              Эти навыки получены автоматически от вашей предыстории
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {backgroundSkills.map(skill => (
                <span key={skill} className="px-2 py-1 bg-primary/10 rounded text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Назад
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!canProceed}
        >
          Далее
        </Button>
      </div>
    </div>
  );
};

export default CharacterSkillSelection;