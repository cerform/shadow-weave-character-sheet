import React from 'react';
import { Character, SkillProficiency } from '@/types/character';

interface SkillsPanelProps {
  character: Character | null;
  onUpdate: (updates: any) => void;
}

const SkillsPanel: React.FC<SkillsPanelProps> = ({ character, onUpdate }) => {
  // Fix type issue by using an object instead of array
  const characterSkills = character?.skills || {} as { [key: string]: SkillProficiency };

  const handleSkillChange = (skillName: string, isProficient: boolean) => {
    const updatedSkills = {
      ...characterSkills,
      [skillName]: {
        ...characterSkills[skillName],
        isProficient: isProficient,
      },
    };
    onUpdate({ ...character, skills: updatedSkills });
  };

  return (
    <div className="p-4 bg-card/30 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Навыки</h3>
      <div className="space-y-2">
        {Object.entries(characterSkills).map(([skillName, skill]) => (
          <div key={skillName} className="flex items-center justify-between">
            <span>{skillName}</span>
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded-sm border-gray-700 focus:ring-2 focus:ring-offset-0 focus:ring-primary"
                checked={skill?.isProficient || false}
                onChange={(e) => handleSkillChange(skillName, e.target.checked)}
              />
              <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Proficient
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsPanel;
