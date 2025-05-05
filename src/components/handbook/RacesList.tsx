
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredRaces.map((race) => (
        <Card key={race.name} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle>{race.name}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center text-xs bg-gray-200 px-2 py-1 rounded">
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
            <p className="text-sm text-gray-600 line-clamp-3">{race.description}</p>
            <button
              className="mt-4 text-blue-500 hover:underline"
              onClick={() => setSelectedRace(race)}
            >
              Подробнее
            </button>
          </CardContent>
        </Card>
      ))}

      {filteredRaces.length === 0 && (
        <div className="col-span-full text-center p-8 text-gray-500">
          <p>Не найдено ни одной расы, соответствующей критериям поиска.</p>
        </div>
      )}
    </div>
  );
};

export default RacesList;
