
// Обновлен файл SpellBookViewer.tsx для добавления адаптивности
// Обратите внимание: я не меняю логику, а только UI для мобильных устройств
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SpellList from './SpellList';
import SpellFilterPanel from './SpellFilterPanel';
import { useSpellbook } from '@/hooks/spellbook';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';
import {
  Sheet, 
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const SpellBookViewer: React.FC = () => {
  const { spells, loadSpells, isLoading, filters, setFilters } = useSpellbook();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    loadSpells();
  }, []);

  const handleRefresh = () => {
    loadSpells();
  };

  // Группируем заклинания по уровням для табов
  const spellsByLevel: Record<string, any[]> = {
    'all': spells,
    '0': spells.filter(spell => spell.level === 0),
    '1': spells.filter(spell => spell.level === 1),
    '2': spells.filter(spell => spell.level === 2),
    '3': spells.filter(spell => spell.level === 3),
    '4': spells.filter(spell => spell.level === 4),
    '5': spells.filter(spell => spell.level === 5),
    '6': spells.filter(spell => spell.level === 6),
    '7': spells.filter(spell => spell.level === 7),
    '8': spells.filter(spell => spell.level === 8),
    '9': spells.filter(spell => spell.level === 9),
  };

  return (
    <div className="relative">
      {isMobile ? (
        // Мобильная версия
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Фильтры
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] sm:w-[350px]">
                <div className="py-4">
                  <SpellFilterPanel 
                    filters={filters} 
                    setFilters={setFilters} 
                  />
                </div>
              </SheetContent>
            </Sheet>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Загрузка...' : 'Обновить'}
            </Button>
          </div>
          
          <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto pb-2">
              <TabsList className="h-9 w-auto inline-flex whitespace-nowrap">
                <TabsTrigger value="all" className="h-8">Все</TabsTrigger>
                <TabsTrigger value="0" className="h-8">Заговоры</TabsTrigger>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                  <TabsTrigger key={level} value={level.toString()} className="h-8">
                    {level} ур.
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {Object.keys(spellsByLevel).map(level => (
              <TabsContent key={level} value={level} className="mt-2">
                <SpellList 
                  spells={spellsByLevel[level]} 
                  isLoading={isLoading} 
                  compactMode={isMobile} 
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      ) : (
        // Десктопная версия
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SpellFilterPanel 
              filters={filters} 
              setFilters={setFilters}
            />
            <div className="mt-4">
              <Button 
                onClick={handleRefresh} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Загрузка...' : 'Обновить список'}
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Все заклинания</TabsTrigger>
                <TabsTrigger value="0">Заговоры</TabsTrigger>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                  <TabsTrigger key={level} value={level.toString()}>
                    {level} уровень
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Object.keys(spellsByLevel).map(level => (
                <TabsContent key={level} value={level}>
                  <SpellList 
                    spells={spellsByLevel[level]} 
                    isLoading={isLoading}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpellBookViewer;
