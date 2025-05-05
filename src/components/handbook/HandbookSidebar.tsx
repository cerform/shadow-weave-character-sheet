
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

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
  const handleSourceToggle = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter(s => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  return (
    <div className="w-64 border-r bg-gray-100/50 h-full">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h2 className="mb-2 font-semibold text-lg">Справочник</h2>
          <Separator className="mb-4" />
          
          {/* Поиск */}
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-white"
            />
          </div>
          
          {/* Основные разделы */}
          <div className="space-y-2 mb-4">
            <button
              className={`w-full text-left py-2 px-3 rounded-md hover:bg-gray-200 ${activeSection === 'races' ? 'bg-gray-200 font-medium' : ''}`}
              onClick={() => setActiveSection('races')}
            >
              Расы
            </button>
            <button
              className={`w-full text-left py-2 px-3 rounded-md hover:bg-gray-200 ${activeSection === 'classes' ? 'bg-gray-200 font-medium' : ''}`}
              onClick={() => setActiveSection('classes')}
            >
              Классы
            </button>
            <button
              className={`w-full text-left py-2 px-3 rounded-md hover:bg-gray-200 ${activeSection === 'backgrounds' ? 'bg-gray-200 font-medium' : ''}`}
              onClick={() => setActiveSection('backgrounds')}
            >
              Предыстории
            </button>
          </div>
          
          {/* Фильтр по источникам */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Источники</h3>
            <div className="space-y-1">
              {sources.map(source => (
                <div key={source} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`source-${source}`}
                    checked={selectedSources.includes(source)}
                    onChange={() => handleSourceToggle(source)}
                    className="mr-2"
                  />
                  <label htmlFor={`source-${source}`} className="text-sm">{source}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default HandbookSidebar;
