
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ClassesListProps {
  classes: any[];
  searchQuery: string;
  selectedSources: string[];
  setSelectedClass: (cls: any) => void;
}

const ClassesList: React.FC<ClassesListProps> = ({
  classes,
  searchQuery,
  selectedSources,
  setSelectedClass
}) => {
  // Фильтрация классов по поисковому запросу и выбранным источникам
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = searchQuery === '' || 
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = selectedSources.length === 0 || 
      selectedSources.includes(cls.source || 'PHB');
    
    return matchesSearch && matchesSource;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredClasses.map((cls) => (
        <Card key={cls.name} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle>{cls.name}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center text-xs bg-gray-200 px-2 py-1 rounded">
                    <Book size={14} className="mr-1" />
                    <span>{cls.source || 'PHB'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Источник: {cls.source === 'PHB' ? 'Книга игрока' : cls.source}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-3">{cls.description}</p>
            <div className="flex items-center mt-2 mb-2">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded mr-2">Кость хитов: {cls.hitDie}</span>
              {cls.isMagicClass && (
                <span className="text-xs bg-purple-100 px-2 py-1 rounded">Магия</span>
              )}
            </div>
            <button
              className="mt-2 text-blue-500 hover:underline"
              onClick={() => setSelectedClass(cls)}
            >
              Подробнее
            </button>
          </CardContent>
        </Card>
      ))}

      {filteredClasses.length === 0 && (
        <div className="col-span-full text-center p-8 text-gray-500">
          <p>Не найдено ни одного класса, соответствующего критериям поиска.</p>
        </div>
      )}
    </div>
  );
};

export default ClassesList;
