
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Search, Filter, User, X, Book, ScrollText } from "lucide-react";
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
      className="w-64 shrink-0 overflow-hidden h-screen flex flex-col"
      style={{ 
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(5px)',
        borderRight: `1px solid ${currentTheme.accent}30` 
      }}
    >
      <div className="p-4">
        <h2 
          className="text-xl font-semibold mb-4 flex items-center"
          style={{ 
            color: currentTheme.accent,
            textShadow: `0 0 10px ${currentTheme.accent}60` 
          }}
        >
          <Book className="mr-2 h-5 w-5" />
          Справочник D&D
        </h2>
        
        <div className="relative mb-4">
          <Search 
            className="absolute left-2 top-2.5 h-4 w-4" 
            style={{ color: `${currentTheme.textColor}80` }}
          />
          <Input
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
            style={{ 
              background: 'rgba(0,0,0,0.4)', 
              borderColor: `${currentTheme.accent}30`,
              color: currentTheme.textColor 
            }}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-transparent"
              onClick={() => setSearchQuery('')}
              style={{ 
                color: `${currentTheme.textColor}80`,
              }}
            >
              <X size={14} />
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          <Button
            variant={activeSection === 'rules' ? 'default' : 'outline'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('rules')}
            style={activeSection === 'rules' ? {
              background: currentTheme.accent,
              color: currentTheme.buttonText || '#fff',
              boxShadow: `0 0 10px ${currentTheme.accent}80`
            } : {
              background: 'rgba(0,0,0,0.4)',
              borderColor: `${currentTheme.accent}50`,
              color: currentTheme.textColor
            }}
          >
            <Book className="mr-2 h-4 w-4" />
            Правила игры
          </Button>

          <Button
            variant={activeSection === 'races' ? 'default' : 'outline'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('races')}
            style={activeSection === 'races' ? {
              background: currentTheme.accent,
              color: currentTheme.buttonText || '#fff',
              boxShadow: `0 0 10px ${currentTheme.accent}80`
            } : {
              background: 'rgba(0,0,0,0.4)',
              borderColor: `${currentTheme.accent}50`,
              color: currentTheme.textColor
            }}
          >
            <User className="mr-2 h-4 w-4" />
            Расы
          </Button>
          
          <Button
            variant={activeSection === 'classes' ? 'default' : 'outline'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('classes')}
            style={activeSection === 'classes' ? {
              background: currentTheme.accent,
              color: currentTheme.buttonText || '#fff',
              boxShadow: `0 0 10px ${currentTheme.accent}80`
            } : {
              background: 'rgba(0,0,0,0.4)',
              borderColor: `${currentTheme.accent}50`,
              color: currentTheme.textColor
            }}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Классы
          </Button>
          
          <Button
            variant={activeSection === 'backgrounds' ? 'default' : 'outline'}
            className="w-full justify-start transition-all duration-300"
            onClick={() => setActiveSection('backgrounds')}
            style={activeSection === 'backgrounds' ? {
              background: currentTheme.accent,
              color: currentTheme.buttonText || '#fff',
              boxShadow: `0 0 10px ${currentTheme.accent}80`
            } : {
              background: 'rgba(0,0,0,0.4)',
              borderColor: `${currentTheme.accent}50`,
              color: currentTheme.textColor
            }}
          >
            <ScrollText className="mr-2 h-4 w-4" />
            Предыстории
          </Button>
        </div>
      </div>
      
      <Separator style={{ background: `${currentTheme.accent}30` }} />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 
            className="text-sm font-medium flex items-center"
            style={{ color: currentTheme.textColor }}
          >
            <Filter size={14} className="mr-1" />
            Источники
          </h3>
          
          {selectedSources.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs hover:bg-transparent"
              onClick={clearSources}
              style={{ 
                color: `${currentTheme.accent}`,
              }}
            >
              Очистить
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[calc(100vh-240px)]">
          <div className="space-y-2 pr-2">
            {sources.map((source) => {
              const isSelected = selectedSources.includes(source);
              
              return (
                <div 
                  key={source} 
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`source-${source}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleSource(source)}
                    style={{ 
                      borderColor: isSelected ? currentTheme.accent : `${currentTheme.accent}50`,
                      backgroundColor: isSelected ? currentTheme.accent : 'transparent',
                      boxShadow: isSelected ? `0 0 5px ${currentTheme.accent}` : 'none',
                    }}
                  />
                  <Label 
                    htmlFor={`source-${source}`} 
                    className="text-sm cursor-pointer transition-all duration-300"
                    style={{ 
                      color: isSelected ? currentTheme.accent : currentTheme.textColor,
                      fontWeight: isSelected ? 'bold' : 'normal',
                      textShadow: isSelected ? `0 0 5px ${currentTheme.accent}60` : 'none'
                    }}
                  >
                    {source === 'PHB' ? 'Книга игрока' : source}
                  </Label>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default HandbookSidebar;
