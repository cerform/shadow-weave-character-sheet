
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface RacesListProps {
  races: any[];
  searchQuery: string;
  selectedSources: string[];
  setSelectedRace: (race: any) => void;
}

const RacesList: React.FC<RacesListProps> = ({
  races,
  searchQuery,
  selectedSources,
  setSelectedRace
}) => {
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;
  
  // Фильтрация рас по поисковому запросу и выбранным источникам
  const filteredRaces = races.filter(race => {
    const matchesSearch = searchQuery === '' || 
      race.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      race.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      race.traits.some((trait: string) => trait.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSource = selectedSources.length === 0 || 
      selectedSources.includes(race.source || 'PHB');
    
    return matchesSearch && matchesSource;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRaces.map((race) => (
        <Card 
          key={race.name} 
          className="cursor-pointer hover:shadow-md transition-all overflow-hidden hover:scale-105 duration-300"
          style={{
            background: `rgba(20, 20, 30, 0.8)`,
            backdropFilter: 'blur(5px)',
            borderColor: `${currentTheme.accent}40`,
            color: currentTheme.textColor,
            boxShadow: `0 0 5px ${currentTheme.accent}40`,
          }}
        >
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle 
              className="text-xl font-bold"
              style={{ color: currentTheme.accent, textShadow: `0 0 5px ${currentTheme.accent}40` }}
            >
              {race.name}
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div 
                    className="flex items-center text-xs px-2 py-1 rounded border"
                    style={{
                      background: `${currentTheme.accent}20`,
                      borderColor: `${currentTheme.accent}50`
                    }}
                  >
                    <Book size={14} className="mr-1" />
                    <span>{race.source || 'PHB'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent style={{
                  background: 'rgba(20, 20, 30, 0.9)',
                  borderColor: `${currentTheme.accent}50`,
                  color: currentTheme.textColor
                }}>
                  <p>Источник: {race.source === 'PHB' ? 'Книга игрока' : race.source}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <p 
              className="text-sm line-clamp-3 min-h-[4.5rem]"
              style={{ color: currentTheme.textColor }}
            >
              {race.description}
            </p>
            <Button
              className="mt-4 w-full group transition-all duration-300"
              onClick={() => setSelectedRace(race)}
              style={{
                background: `${currentTheme.accent}80`,
                borderColor: `${currentTheme.accent}50`,
                color: currentTheme.buttonText || '#fff',
              }}
            >
              ПОДРОБНЕЕ
              <ChevronRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      ))}

      {filteredRaces.length === 0 && (
        <div 
          className="col-span-full text-center p-8 rounded-lg border"
          style={{
            background: `rgba(20, 20, 30, 0.6)`,
            borderColor: `${currentTheme.accent}20`,
            color: currentTheme.textColor
          }}
        >
          <p>Не найдено ни одной расы, соответствующей критериям поиска.</p>
        </div>
      )}
    </div>
  );
};

export default RacesList;
