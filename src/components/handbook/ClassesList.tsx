
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

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
  // Получаем текущую тему
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;
  
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredClasses.map((cls) => (
        <Card 
          key={cls.name} 
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
              {cls.name}
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
                    <span>{cls.source || 'PHB'}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent style={{
                  background: 'rgba(20, 20, 30, 0.9)',
                  borderColor: `${currentTheme.accent}50`,
                  color: currentTheme.textColor
                }}>
                  <p>Источник: {cls.source === 'PHB' ? 'Книга игрока' : cls.source}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <p 
              className="text-sm line-clamp-3 min-h-[4.5rem]"
              style={{ color: currentTheme.textColor }}
            >
              {cls.description}
            </p>
            <div className="flex flex-wrap mt-2 mb-2 gap-2">
              <span 
                className="text-xs px-2 py-1 rounded"
                style={{ 
                  background: `${currentTheme.accent}20`,
                  color: currentTheme.textColor,
                  borderColor: `${currentTheme.accent}30`,
                  border: '1px solid'
                }}
              >
                Кость хитов: {cls.hitDie}
              </span>
              {cls.isMagicClass && (
                <span 
                  className="text-xs px-2 py-1 rounded"
                  style={{ 
                    background: `${currentTheme.accent}30`,
                    color: currentTheme.textColor,
                    borderColor: `${currentTheme.accent}40`,
                    border: '1px solid'
                  }}
                >
                  Магия
                </span>
              )}
            </div>
            <Button
              className="mt-4 w-full group transition-all duration-300"
              onClick={() => setSelectedClass(cls)}
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

      {filteredClasses.length === 0 && (
        <div 
          className="col-span-full text-center p-8 rounded-lg border"
          style={{
            background: `rgba(20, 20, 30, 0.6)`,
            borderColor: `${currentTheme.accent}20`,
            color: currentTheme.textColor
          }}
        >
          <p>Не найдено ни одного класса, соответствующего критериям поиска.</p>
        </div>
      )}
    </div>
  );
};

export default ClassesList;
