
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area'; 
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Info } from 'lucide-react';

interface CharacterRaceProps {
  character: any;
  races: any[];
  onUpdate: (updates: any) => void;
}

const CharacterRace: React.FC<CharacterRaceProps> = ({ 
  character, 
  races, 
  onUpdate 
}) => {
  const [selectedRace, setSelectedRace] = useState(character.race || '');
  const [hasSubraces, setHasSubraces] = useState<boolean>(false);
  const [subraces, setSubraces] = useState<any[]>([]);
  const [selectedSubrace, setSelectedSubrace] = useState(character.subrace || '');
  
  // Получаем текущую тему
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;

  useEffect(() => {
    // При изменении выбранной расы проверяем наличие подрас
    if (selectedRace) {
      const raceData = races.find(r => r.name === selectedRace);
      const subracesList = raceData?.subraces || [];
      
      // Проверяем наличие подрас у выбранной расы
      setHasSubraces(subracesList.length > 0);
      setSubraces(subracesList);
      
      // Если выбираем расу впервые, сбрасываем выбранную подрасу
      if (character.race !== selectedRace) {
        setSelectedSubrace('');
        
        // Обновляем персонажа
        onUpdate({
          race: selectedRace,
          subrace: ''
        });
      }
    }
  }, [selectedRace, races, character.race]);

  const handleRaceSelect = (raceName: string) => {
    setSelectedRace(raceName);
  };
  
  const handleSubraceSelect = (subraceName: string) => {
    setSelectedSubrace(subraceName);
    
    onUpdate({
      race: selectedRace,
      subrace: subraceName
    });
  };
  
  const getRaceDescription = (raceName: string) => {
    const raceData = races.find(r => r.name === raceName);
    if (!raceData) return "Описание отсутствует";
    
    if (typeof raceData.description === 'string') {
      // Ограничиваем длину описания для отображения в карточке
      return raceData.description.length > 150
        ? `${raceData.description.substring(0, 150)}...`
        : raceData.description;
    }
    
    return "Подробное описание";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2" style={{ color: currentTheme.accent }}>
          Выберите расу
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Раса определяет базовые характеристики и возможности вашего персонажа
        </p>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="grid grid-cols-1 gap-4">
          {races.map((race) => (
            <Card 
              key={race.name}
              className={`cursor-pointer overflow-hidden transition-all duration-300 ${selectedRace === race.name ? 'ring-2' : 'hover:bg-accent/10'}`}
              style={{ 
                background: selectedRace === race.name 
                  ? `${currentTheme.cardBackground}` 
                  : 'rgba(0, 0, 0, 0.6)',
                borderColor: selectedRace === race.name 
                  ? currentTheme.accent 
                  : 'rgba(255, 255, 255, 0.1)',
                boxShadow: selectedRace === race.name 
                  ? `0 0 12px ${currentTheme.accent}80` 
                  : 'none',
                color: currentTheme.textColor,
                ringColor: currentTheme.accent
              }}
              onClick={() => handleRaceSelect(race.name)}
            >
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle style={{ color: currentTheme.accent }}>{race.name}</CardTitle>
                  {race.subraces && race.subraces.length > 0 && (
                    <Badge 
                      variant="outline" 
                      className="ml-2"
                      style={{ 
                        borderColor: currentTheme.accent,
                        color: currentTheme.accent
                      }}
                    >
                      Есть подрасы
                    </Badge>
                  )}
                </div>
                <CardDescription style={{ color: `${currentTheme.textColor}80` }}>
                  {getRaceDescription(race.name)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {race.abilityScoreIncrease && typeof race.abilityScoreIncrease === 'object' && (
                    <>
                      {Object.entries(race.abilityScoreIncrease).map(([key, value]) => (
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
                            {key === 'all' && 'Все характеристики'}
                          </span>
                          <span 
                            className="font-semibold"
                            style={{ color: currentTheme.accent }}
                          >
                            +{value}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      {/* Отображаем выбор подрасы, если она есть у выбранной расы */}
      {selectedRace && hasSubraces && subraces.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Info size={18} style={{ color: currentTheme.accent }} />
            <h3 className="text-xl font-bold" style={{ color: currentTheme.accent }}>
              Выберите подрасу для {selectedRace}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subraces.map((subrace) => {
              const subraceName = typeof subrace === 'string' ? subrace : subrace.name;
              
              return (
                <Card 
                  key={subraceName}
                  className={`cursor-pointer transition-all duration-300 ${selectedSubrace === subraceName ? 'ring-2' : 'hover:bg-accent/10'}`}
                  style={{ 
                    background: selectedSubrace === subraceName 
                      ? `${currentTheme.cardBackground}` 
                      : 'rgba(0, 0, 0, 0.6)',
                    borderColor: selectedSubrace === subraceName 
                      ? currentTheme.accent 
                      : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: selectedSubrace === subraceName 
                      ? `0 0 8px ${currentTheme.accent}80` 
                      : 'none',
                    color: currentTheme.textColor,
                    ringColor: currentTheme.accent
                  }}
                  onClick={() => handleSubraceSelect(subraceName)}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg" style={{ color: currentTheme.accent }}>
                      {subraceName}
                    </CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterRace;
