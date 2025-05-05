
import React, { useState, useEffect } from 'react';
import type { Character } from "@/types/character";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { races } from '@/data/races';
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationButtons from "./NavigationButtons";
import SectionHeader from "@/components/ui/section-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCircle, Info } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface CharacterSubraceSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface Subrace {
  name: string;
  description: string;
  traits?: string[];
  abilityScoreIncrease?: Record<string, number>;
}

const CharacterSubraceSelection: React.FC<CharacterSubraceSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedSubrace, setSelectedSubrace] = useState<string>(character.subrace || '');
  const [availableSubraces, setAvailableSubraces] = useState<Subrace[]>([]);
  const [autoRedirectAttempted, setAutoRedirectAttempted] = useState<boolean>(false);

  // Получаем текущую тему
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;

  useEffect(() => {
    // Загрузка доступных подрас для выбранной расы
    if (character.race) {
      const raceData = races.find(r => r.name === character.race);
      if (raceData && raceData.subraces && raceData.subraces.length > 0) {
        // Преобразуем строки подрас в объекты с описаниями
        const subraceObjects = raceData.subraces.map(subraceName => {
          // Проверяем наличие subRaceDetails в объекте расы
          const details = 
            (raceData as any).subRaceDetails ? 
            (raceData as any).subRaceDetails[subraceName] || {} : 
            {};
            
          return {
            name: subraceName,
            description: details.description || `Подраса ${subraceName}`,
            traits: details.traits || [],
            abilityScoreIncrease: details.abilityScoreIncrease || {}
          };
        });
        setAvailableSubraces(subraceObjects);
        
        // Если подраса не была выбрана или не соответствует текущей расе, сбрасываем её
        if (!selectedSubrace || !raceData.subraces.some(sr => {
          // Проверяем, является ли sr объектом с полем name или строкой
          if (typeof sr === 'string') {
            return sr === selectedSubrace;
          } else if (typeof sr === 'object' && sr !== null) {
            return sr.name === selectedSubrace;
          }
          return false;
        })) {
          setSelectedSubrace('');
          updateCharacter({ subrace: '' });
        }
      } else {
        // Если нет подрас, устанавливаем пустой массив
        setAvailableSubraces([]);
      }
    }
  }, [character.race]);

  const handleSubraceSelect = (subraceName: string) => {
    setSelectedSubrace(subraceName);
    // Автоматически сохраняем выбор подрасы
    updateCharacter({ subrace: subraceName });
  };

  // Редирект только если у расы нет подрас и при первом рендере
  useEffect(() => {
    if (availableSubraces.length === 0 && character.race && !autoRedirectAttempted) {
      setAutoRedirectAttempted(true);
      nextStep();
    }
  }, [availableSubraces, character.race, autoRedirectAttempted, nextStep]);

  // Если нет подрас, показываем загрузочное сообщение
  if (availableSubraces.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader 
          title={`Выбор подрасы для ${character.race}`} 
          description="Некоторые расы имеют различные подрасы с уникальными особенностями и бонусами."
        />
        <Alert variant="default" className="bg-primary/10 border-primary/30">
          <Info className="h-5 w-5" />
          <AlertDescription>
            У расы {character.race} нет доступных подрас. Переход к следующему шагу...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Разновидность" 
        description={`Раса ${character.race} имеет несколько разновидностей. Выберите одну из них.`}
      />

      <ScrollArea className="h-[500px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableSubraces.map((subrace) => (
            <Card 
              key={subrace.name} 
              className={`cursor-pointer transition-all duration-300 ${
                selectedSubrace === subrace.name ? 'ring-2' : 'hover:bg-accent/10'
              }`}
              style={{ 
                background: selectedSubrace === subrace.name
                  ? `${currentTheme.cardBackground}`
                  : 'rgba(0, 0, 0, 0.6)',
                borderColor: selectedSubrace === subrace.name
                  ? currentTheme.accent
                  : 'rgba(255, 255, 255, 0.1)',
                boxShadow: selectedSubrace === subrace.name
                  ? `0 0 12px ${currentTheme.accent}80`
                  : 'none',
                color: currentTheme.textColor
              }}
              onClick={() => handleSubraceSelect(subrace.name)}
            >
              <CardHeader className="pb-2">
                <CardTitle style={{ color: currentTheme.accent }}>{subrace.name}</CardTitle>
                <CardDescription style={{ color: `${currentTheme.textColor}90` }}>
                  {subrace.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subrace.traits && subrace.traits.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold mb-2" style={{ color: currentTheme.accent }}>
                      Особенности:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: `${currentTheme.textColor}80` }}>
                      {subrace.traits.map((trait, idx) => (
                        <li key={idx}>{trait}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {subrace.abilityScoreIncrease && Object.keys(subrace.abilityScoreIncrease).length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold mb-2" style={{ color: currentTheme.accent }}>
                      Увеличение характеристик:
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(subrace.abilityScoreIncrease).map(([key, value]) => (
                        <div 
                          key={key} 
                          className="flex justify-between items-center p-1 text-xs rounded"
                          style={{ 
                            background: 'rgba(0, 0, 0, 0.3)', 
                            borderColor: `${currentTheme.accent}30`,
                            border: '1px solid'
                          }}
                        >
                          <span>
                            {key === 'strength' && 'Сила'}
                            {key === 'dexterity' && 'Ловкость'}
                            {key === 'constitution' && 'Телосложение'}
                            {key === 'intelligence' && 'Интеллект'}
                            {key === 'wisdom' && 'Мудрость'}
                            {key === 'charisma' && 'Харизма'}
                          </span>
                          <span style={{ color: currentTheme.accent }}>+{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <NavigationButtons
        allowNext={!!selectedSubrace}
        nextStep={nextStep}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterSubraceSelection;
