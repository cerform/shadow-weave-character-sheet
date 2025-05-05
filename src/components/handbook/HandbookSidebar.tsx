
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Search, Filter, User, X } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface HandbookSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sources: string[];
  selectedSources: string[];
  setSelectedSources: (sources: string[]) => void;
}

const HandbookSidebar: React.FC<HandbookSidebarProps> = ({
  activeSection,
  setActiveSection,
  searchQuery,
  setSearchQuery,
  sources,
  selectedSources,
  setSelectedSources
}) => {
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;
  
  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter(s => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };
  
  const clearSources = () => {
    setSelectedSources([]);
  };
  
  return (
    <div 
      className="w-64 bg-gray-800 border-r border-gray-700 shrink-0 overflow-hidden h-screen flex flex-col"
      style={{ 
        background: `${currentTheme.cardBackground}`, 
        borderColor: `${currentTheme.accent}30` 
      }}
    >
      <div className="p-4">
        <h2 
          className="text-xl font-semibold mb-4 text-white"
          style={{ color: currentTheme.textColor }}
        >
          Справочник D&D
        </h2>
        
        <div className="relative mb-4">
          <Search 
            className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" 
            style={{ color: `${currentTheme.textColor}80` }}
          />
          <Input
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-gray-700 border-gray-600 text-gray-200"
            style={{ 
              background: 'rgba(0,0,0,0.2)', 
              borderColor: `${currentTheme.accent}30`,
              color: currentTheme.textColor 
            }}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6 p-0 text-gray-400 hover:text-white"
              onClick={() => setSearchQuery('')}
              style={{ 
                color: `${currentTheme.textColor}80`,
                '&:hover': { color: currentTheme.textColor } as any
              }}
            >
              <X size={14} />
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          <Button
            variant={activeSection === 'races' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setActiveSection('races')}
            style={activeSection === 'races' ? {
              background: currentTheme.accent,
              color: currentTheme.buttonText || '#fff'
            } : {
              background: 'transparent',
              borderColor: `${currentTheme.accent}50`,
              color: currentTheme.textColor
            }}
          >
            <User className="mr-2 h-4 w-4" />
            Расы
          </Button>
          
          <Button
            variant={activeSection === 'classes' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setActiveSection('classes')}
            style={activeSection === 'classes' ? {
              background: currentTheme.accent,
              color: currentTheme.buttonText || '#fff'
            } : {
              background: 'transparent',
              borderColor: `${currentTheme.accent}50`,
              color: currentTheme.textColor
            }}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Классы
          </Button>
          
          <Button
            variant={activeSection === 'backgrounds' ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => setActiveSection('backgrounds')}
            style={activeSection === 'backgrounds' ? {
              background: currentTheme.accent,
              color: currentTheme.buttonText || '#fff'
            } : {
              background: 'transparent',
              borderColor: `${currentTheme.accent}50`,
              color: currentTheme.textColor
            }}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Предыстории
          </Button>
        </div>
      </div>
      
      <Separator 
        className="bg-gray-700" 
        style={{ background: `${currentTheme.accent}30` }}
      />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 
            className="text-sm font-medium text-gray-300 flex items-center"
            style={{ color: currentTheme.textColor }}
          >
            <Filter size={14} className="mr-1" />
            Источники
          </h3>
          
          {selectedSources.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-gray-400 hover:text-white"
              onClick={clearSources}
              style={{ 
                color: `${currentTheme.textColor}80`,
                '&:hover': { color: currentTheme.textColor } as any
              }}
            >
              Очистить
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[calc(100vh-240px)]">
          <div className="space-y-2 pr-2">
            {sources.map((source) => (
              <div 
                key={source} 
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`source-${source}`}
                  checked={selectedSources.includes(source)}
                  onCheckedChange={() => toggleSource(source)}
                  className="border-gray-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  style={{ 
                    borderColor: `${currentTheme.accent}50`,
                    ['--tw-bg-opacity' as any]: 'data-[state=checked]:1',
                    background: `data-[state=checked]:${currentTheme.accent}`
                  }}
                />
                <Label 
                  htmlFor={`source-${source}`} 
                  className="text-sm text-gray-300 cursor-pointer"
                  style={{ color: currentTheme.textColor }}
                >
                  {source === 'PHB' ? 'Книга игрока' : source}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default HandbookSidebar;
