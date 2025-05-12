
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Character } from '@/types/character';
import { getAllBackgrounds } from '@/data/backgrounds';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface CharacterBackgroundSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
}

const CharacterBackgroundSelection: React.FC<CharacterBackgroundSelectionProps> = ({ character, updateCharacter }) => {
  const [backgrounds, setBackgrounds] = useState(getAllBackgrounds());
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    setBackgrounds(getAllBackgrounds());
  }, []);

  // При обработке профессий, создаем правильную структуру объекта
  const handleBackgroundSelection = (backgroundName: string) => {
    const selectedBackground = backgrounds.find(bg => bg.name === backgroundName);
    if (!selectedBackground) return;

    // Ensure proficiencies object is properly structured
    const existingProficiencies = character.proficiencies || {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    };
    
    // Safe access to background properties
    const backgroundProficiencies = selectedBackground.proficiencies || {};
    const weaponProfs = Array.isArray(backgroundProficiencies.weapons) ? backgroundProficiencies.weapons : [];
    const toolProfs = Array.isArray(backgroundProficiencies.tools) ? backgroundProficiencies.tools : [];
    const languageProfs = Array.isArray(backgroundProficiencies.languages) ? backgroundProficiencies.languages : [];
    
    updateCharacter({
      background: backgroundName,
      proficiencies: {
        ...existingProficiencies,
        weapons: [...existingProficiencies.weapons, ...weaponProfs],
        tools: [...existingProficiencies.tools, ...toolProfs],
        languages: [...existingProficiencies.languages, ...languageProfs]
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Выберите предысторию персонажа</CardTitle>
        <CardDescription>
          Предыстория дает вашему персонажу навыки, владения и снаряжение.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup defaultValue={character.background} onValueChange={handleBackgroundSelection}>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {backgrounds.map((background) => (
              <div key={background.name} className="space-y-2">
                <Label htmlFor={background.name} className="cursor-pointer">
                  <Card
                    className="transition-colors duration-200 hover:bg-secondary/50"
                    style={{
                      backgroundColor: currentTheme.cardBackground,
                      borderColor: currentTheme.accent,
                      color: currentTheme.textColor
                    }}
                  >
                    <CardContent className="flex items-center space-x-4 p-3">
                      <RadioGroupItem value={background.name} id={background.name} className="opacity-0 absolute" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{background.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {background.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default CharacterBackgroundSelection;
