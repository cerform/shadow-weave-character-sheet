
import React from 'react';
import { Search, Menu, X, Book, User, Briefcase, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [filtersVisible, setFiltersVisible] = React.useState(false);

  const toggleSourceSelection = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter(s => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  return (
    <>
      {/* Кнопка для открытия/закрытия сайдбара на мобильных устройствах */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-purple-900/60 text-white border-purple-500/50 hover:bg-purple-800"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Сайдбар */}
      <div 
        className={cn(
          "w-64 bg-gray-900 border-r border-purple-700/30 shrink-0 overflow-hidden transition-all duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 fixed md:static inset-y-0 left-0 z-40"
        )}
      >
        <div className="p-4 flex flex-col h-full">
          <h1 className="text-2xl font-bold mb-6 text-center text-white">
            Справочник
          </h1>

          {/* Поисковая строка */}
          <div className="relative mb-6">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-gray-800 border-purple-700/30 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
            />
          </div>

          {/* Секции справочника */}
          <div className="space-y-2 mb-6">
            <Button
              variant={activeSection === 'races' ? 'default' : 'outline'}
              className={cn(
                "w-full justify-start gap-2",
                activeSection === 'races' 
                  ? "bg-purple-800 hover:bg-purple-700 text-white" 
                  : "bg-gray-800 hover:bg-gray-700 text-white border-purple-700/30"
              )}
              onClick={() => setActiveSection('races')}
            >
              <User size={16} />
              <span>Расы</span>
            </Button>
            <Button
              variant={activeSection === 'classes' ? 'default' : 'outline'}
              className={cn(
                "w-full justify-start gap-2",
                activeSection === 'classes' 
                  ? "bg-purple-800 hover:bg-purple-700 text-white" 
                  : "bg-gray-800 hover:bg-gray-700 text-white border-purple-700/30"
              )}
              onClick={() => setActiveSection('classes')}
            >
              <Book size={16} />
              <span>Классы</span>
            </Button>
            <Button
              variant={activeSection === 'backgrounds' ? 'default' : 'outline'}
              className={cn(
                "w-full justify-start gap-2",
                activeSection === 'backgrounds' 
                  ? "bg-purple-800 hover:bg-purple-700 text-white" 
                  : "bg-gray-800 hover:bg-gray-700 text-white border-purple-700/30"
              )}
              onClick={() => setActiveSection('backgrounds')}
            >
              <Briefcase size={16} />
              <span>Предыстории</span>
            </Button>
          </div>

          {/* Кнопка фильтров */}
          <Button
            variant="outline"
            className="w-full justify-start gap-2 mb-4 bg-gray-800 hover:bg-gray-700 text-white border-purple-700/30"
            onClick={toggleFilters}
          >
            <Filter size={16} />
            <span>Источники</span>
          </Button>

          {/* Фильтры по источникам */}
          {filtersVisible && (
            <ScrollArea className="flex-grow pr-3">
              <div className="space-y-2">
                <h3 className="font-semibold text-white mb-2">Источники</h3>
                {sources.map((source) => (
                  <div key={source} className="flex items-center space-x-2">
                    <Checkbox
                      id={`source-${source}`}
                      checked={selectedSources.includes(source)}
                      onCheckedChange={() => toggleSourceSelection(source)}
                      className="border-purple-700/50 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <Label
                      htmlFor={`source-${source}`}
                      className="text-gray-300 cursor-pointer"
                    >
                      {source === 'PHB' ? 'Книга игрока' : source}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Оверлей для закрытия сайдбара на мобильных устройствах */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default HandbookSidebar;
