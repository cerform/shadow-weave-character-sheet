
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BackgroundsListProps {
  backgrounds: any[];
  searchQuery: string;
  selectedSources: string[];
  setSelectedBackground: (bg: any) => void;
}

const BackgroundsList: React.FC<BackgroundsListProps> = ({
  backgrounds,
  searchQuery,
  selectedSources,
  setSelectedBackground
}) => {
  // Фильтрация предысторий по поисковому запросу и выбранным источникам
  const filteredBackgrounds = backgrounds.filter(bg => {
    const matchesSearch = searchQuery === '' || 
      bg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bg.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = selectedSources.length === 0 || 
      selectedSources.includes(bg.source || 'PHB');
    
    return matchesSearch && matchesSource;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredBackgrounds.map((bg) => (
        <Card key={bg.name} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle>{bg.name}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center text-xs bg-gray-200 px-2 py-1 rounded">
                    <Book size={14} className="mr-1" />
                    <span>{bg.source || 'PHB'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Источник: {bg.source === 'PHB' ? 'Книга игрока' : bg.source}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-3">{bg.description}</p>
            <div className="flex flex-wrap mt-2 mb-2 gap-1">
              {bg.proficiencies && bg.proficiencies.skills && bg.proficiencies.skills.map((skill: string, index: number) => (
                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">{skill}</span>
              ))}
            </div>
            <button
              className="mt-2 text-blue-500 hover:underline"
              onClick={() => setSelectedBackground(bg)}
            >
              Подробнее
            </button>
          </CardContent>
        </Card>
      ))}

      {filteredBackgrounds.length === 0 && (
        <div className="col-span-full text-center p-8 text-gray-500">
          <p>Не найдено ни одной предыстории, соответствующей критериям поиска.</p>
        </div>
      )}
    </div>
  );
};

export default BackgroundsList;
