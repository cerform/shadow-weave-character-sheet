import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { CheckCheck, ChevronsUpDown } from 'lucide-react';
import { CharacterContext, useCharacter } from '@/contexts/CharacterContext';
import { CharacterAbilities } from '@/types/character';

interface SkillsPanelProps {
  character?: any;
  onUpdate?: (updates: any) => void;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({ character, onUpdate }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { updateCharacter } = useCharacter();
  
  // Список навыков и соответствующих характеристик
  const skillsList = [
    { name: "Акробатика", ability: "dexterity" },
    { name: "Анализ", ability: "intelligence" },
    { name: "Атлетика", ability: "strength" },
    { name: "Внимательность", ability: "wisdom" },
    { name: "Выживание", ability: "wisdom" },
    { name: "Выступление", ability: "charisma" },
    { name: "Запугивание", ability: "charisma" },
    { name: "История", ability: "intelligence" },
    { name: "Ловкость рук", ability: "dexterity" },
    { name: "Медицина", ability: "wisdom" },
    { name: "Обман", ability: "charisma" },
    { name: "Природа", ability: "intelligence" },
    { name: "Проницательность", ability: "wisdom" },
    { name: "Религия", ability: "intelligence" },
    { name: "Скрытность", ability: "dexterity" },
    { name: "Убеждение", ability: "charisma" },
    { name: "Уход за животными", ability: "wisdom" }
  ];
  
  // Функция для определения характеристики, связанной с навыком
  const getSkillAbility = (skillName: string): string => {
    const skill = skillsList.find(s => s.name === skillName);
    return skill ? skill.ability : "strength"; // По умолчанию сила
  };
  
  // Функция для переключения владения навыком
  const toggleSkillProficiency = (skillName: string) => {
    if (!character) return;
    
    const updatedSkills = character.skills ? [...character.skills] : [];
    const skillIndex = updatedSkills.findIndex(s => s.name === skillName);
    
    if (skillIndex >= 0) {
      // Навык уже есть в списке, переключаем владение
      const updatedSkill = { ...updatedSkills[skillIndex] };
      updatedSkill.proficient = !updatedSkill.proficient;
      updatedSkills[skillIndex] = updatedSkill;
    } else {
      // Добавляем новый навык
      const ability = getSkillAbility(skillName);
      updatedSkills.push({
        name: skillName,
        ability: ability as keyof CharacterAbilities,
        proficient: true,
        expertise: false
      });
    }
    
    // Используем правильное поле skills вместо skillProficiencies
    updateCharacter({ skills: updatedSkills });
  };
  
  // Функция для получения списка владений навыками
  const getSkillProficiencies = (): string[] => {
    return character?.skills?.filter(skill => skill.proficient).map(skill => skill.name) || [];
  };
  
  // Получаем список владений
  const skillProficiencies = getSkillProficiencies();
  
  return (
    <Card className="border-t-4 border-t-primary/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Навыки</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillsList.map((skill) => (
            <div 
              key={skill.name} 
              className="flex items-center justify-between p-3 border-b"
              style={{ borderColor: `${currentTheme.accent}30` }}
            >
              <span style={{ color: currentTheme.textColor }}>{skill.name}</span>
              <button
                onClick={() => toggleSkillProficiency(skill.name)}
                className={`p-1 rounded-full transition-colors ${
                  skillProficiencies.includes(skill.name)
                    ? "bg-green-500 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {skillProficiencies.includes(skill.name) ? (
                  <CheckCheck className="h-4 w-4" />
                ) : (
                  <ChevronsUpDown className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
