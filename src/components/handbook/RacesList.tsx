
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

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
          className="cursor-pointer hover:shadow-md transition-shadow border border-purple-700/20 bg-gray-900/80 text-white overflow-hidden"
        >
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-xl font-bold">{race.name}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center text-xs bg-purple-900/60 px-2 py-1 rounded border border-purple-500/50">
                    <Book size={14} className="mr-1" />
                    <span>{race.source || 'PHB'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Источник: {race.source === 'PHB' ? 'Книга игрока' : race.source}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300 line-clamp-3 min-h-[4.5rem]">{race.description}</p>
            <Button
              className="mt-4 w-full bg-purple-800/80 hover:bg-purple-700 text-white border border-purple-500/50 group"
              onClick={() => setSelectedRace(race)}
            >
              ПОДРОБНЕЕ
              <ChevronRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100" />
            </Button>
          </CardContent>
        </Card>
      ))}

      {filteredRaces.length === 0 && (
        <div className="col-span-full text-center p-8 text-gray-300 bg-gray-900/50 rounded-lg border border-purple-700/20">
          <p>Не найдено ни одной расы, соответствующей критериям поиска.</p>
        </div>
      )}
    </div>
  );
};

export default RacesList;
