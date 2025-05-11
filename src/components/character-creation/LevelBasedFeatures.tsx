
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Character } from "@/types/character";
import useLevelFeatures from "@/hooks/useLevelFeatures";
import { getNumericModifier } from "@/utils/characterUtils";

// Define a type for proficiencies that allows both string[] and the structured object format
type ProficienciesType = string[] | {
  armor?: string[];
  weapons?: string[];
  tools?: string[];
  languages?: string[];
};

// Update the character parameter to use Character type
const LevelBasedFeatures = ({
  character,
  onCharacterUpdate,
}: {
  character: Character;
  onCharacterUpdate: (updates: Partial<Character>) => void;
}) => {
  const {
    availableFeatures,
    selectedFeatures,
    selectFeature,
    getHitDiceInfo,
    getSubclassLevel,
    availableLanguages,
    availableSkills,
    availableTools,
    availableWeaponTypes,
    availableArmorTypes,
    handleLanguageSelection,
    handleSkillSelection,
    handleToolSelection,
    handleWeaponTypeSelection,
    handleArmorTypeSelection
  } = useLevelFeatures(character);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedWeaponTypes, setSelectedWeaponTypes] = useState<string[]>([]);
  const [selectedArmorTypes, setSelectedArmorTypes] = useState<string[]>([]);

  const handleUpdate = () => {
    const newProficiencies: any = {
      languages: selectedLanguages,
      skills: selectedSkills,
      tools: selectedTools,
      weapons: selectedWeaponTypes,
      armor: selectedArmorTypes,
    };

    onCharacterUpdate({ proficiencies: newProficiencies });
  };

  return (
    <div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Навыки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableSkills.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={selectedSkills.includes(skill)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedSkills([...selectedSkills, skill]);
                    } else {
                      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
                    }
                  }}
                />
                <Label htmlFor={`skill-${skill}`}>{skill}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Языки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableLanguages.map((language) => (
              <div key={language} className="flex items-center space-x-2">
                <Checkbox
                  id={`language-${language}`}
                  checked={selectedLanguages.includes(language)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedLanguages([...selectedLanguages, language]);
                    } else {
                      setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
                    }
                  }}
                />
                <Label htmlFor={`language-${language}`}>{language}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Инструменты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableTools.map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={`tool-${tool}`}
                  checked={selectedTools.includes(tool)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTools([...selectedTools, tool]);
                    } else {
                      setSelectedTools(selectedTools.filter((t) => t !== tool));
                    }
                  }}
                />
                <Label htmlFor={`tool-${tool}`}>{tool}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Типы оружия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableWeaponTypes.map((weaponType) => (
              <div key={weaponType} className="flex items-center space-x-2">
                <Checkbox
                  id={`weaponType-${weaponType}`}
                  checked={selectedWeaponTypes.includes(weaponType)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedWeaponTypes([...selectedWeaponTypes, weaponType]);
                    } else {
                      setSelectedWeaponTypes(selectedWeaponTypes.filter((wt) => wt !== weaponType));
                    }
                  }}
                />
                <Label htmlFor={`weaponType-${weaponType}`}>{weaponType}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Типы брони</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableArmorTypes.map((armorType) => (
              <div key={armorType} className="flex items-center space-x-2">
                <Checkbox
                  id={`armorType-${armorType}`}
                  checked={selectedArmorTypes.includes(armorType)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedArmorTypes([...selectedArmorTypes, armorType]);
                    } else {
                      setSelectedArmorTypes(selectedArmorTypes.filter((at) => at !== armorType));
                    }
                  }}
                />
                <Label htmlFor={`armorType-${armorType}`}>{armorType}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <button onClick={handleUpdate}>Сохранить</button>
    </div>
  );
};

export default LevelBasedFeatures;
