import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Book, X } from "lucide-react";
import { useSpellbook } from '@/hooks/spellbook';
import { SpellData } from '@/hooks/spellbook/types'; 
import SpellImporter from './SpellImporter';
import { useTheme } from '@/hooks/use-theme';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';
import SpellDetailModal from '../spell-detail/SpellDetailModal';
import SpellFilters from './SpellFilters';
import SpellList from './SpellList';

const SpellBookViewer: React.FC = () => {
  const { theme } = useTheme();
  const { activeTheme } = useUserTheme();
  const themeKey = (activeTheme || theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const { 
    allSpells, 
    filteredSpells, 
    searchTerm, 
    setSearchTerm, 
    levelFilters, 
    toggleFilter,
    schoolFilters,
    classFilters,
    extractClasses,
    formatClasses
  } = useSpellbook();

  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  
  // Получаем все доступные школы магии
  const schools = React.useMemo(() => {
    const uniqueSchools = new Set<string>();
    allSpells.forEach(spell => {
      if (spell.school) uniqueSchools.add(spell.school);
    });
    return Array.from(uniqueSchools).sort();
  }, [allSpells]);
  
  // Получаем все доступные классы
  const classes = React.useMemo(() => extractClasses(), [extractClasses]);
  
  // Получаем статистику по заклинаниям по уровням
  const spellCountByLevel = React.useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 0; i <= 9; i++) {
      counts[i] = allSpells.filter(spell => spell.level === i).length;
    }
    return counts;
  }, [allSpells]);

  // Функция для получения цвета бейджа уровня заклинаний
  const getBadgeColor = (level: number): string => {
    switch (level) {
      case 0: return currentTheme.accent + '70';  // Заговоры
      case 1: return '#3b82f6';  // Синий
      case 2: return '#10b981';  // Зеленый
      case 3: return '#f59e0b';  // Оранжевый
      case 4: return '#8b5cf6';  // Фиолетовый
      case 5: return '#ec4899';  // Розовый
      case 6: return '#f43f5e';  // Красный
      case 7: return '#0ea5e9';  // Голубой
      case 8: return '#9333ea';  // Темно-фиолетовый
      case 9: return '#dc2626';  // Темно-красный
      default: return '#6b7280';  // Серый
    }
  };

  // Функция для получения цвета бейджа школы
  const getSchoolBadgeColor = (school: string): string => {
    switch (school?.toLowerCase()) {
      case 'воплощение': return '#ef4444'; // Красный
      case 'некромантия': return '#6b7280'; // Серый
      case 'очарование': return '#ec4899'; // Розовый
      case 'преобразование': return '#3b82f6'; // Голубой
      case 'прорицание': return '#8b5cf6'; // Фиолетовый
      case 'вызов': return '#10b981'; // Зеленый
      case 'ограждение': return '#f59e0b'; // Оранжевый
      case 'иллюзия': return '#8b5cf6'; // Фиолетовый
      default: return '#6b7280'; // Серый по умолчанию
    }
  };

  // Обработчик открытия детальной информации о заклинании
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
  };

  // Функция для очистки всех фильтров
  const clearFilters = () => {
    setSearchTerm('');
  };

  return (
    <div 
      className="container mx-auto p-4"
      style={{ 
        background: 'transparent',
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Левая панель с фильтрами */}
        <div className="md:col-span-1">
          <Card className="border-accent w-full bg-black/70 backdrop-blur-sm border-accent/30">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-xl flex items-center" style={{ color: '#9b87f5' }}>
                <Book className="mr-2 h-5 w-5" style={{ color: '#9b87f5' }} /> 
                Поиск
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-3">
              <SpellFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeLevel={levelFilters}
                toggleLevel={(level) => toggleFilter('level', level)}
                activeSchool={schoolFilters}
                toggleSchool={(school) => toggleFilter('school', school)}
                activeClass={classFilters}
                toggleClass={(className) => toggleFilter('class', className)}
                clearFilters={() => {
                  setSearchTerm('');
                }}
                allLevels={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
                allSchools={extractClasses()}
                allClasses={extractClasses()}
                getBadgeColor={(level) => level === 0 ? '#9b87f550' : '#9b87f5'}
                getSchoolBadgeColor={() => '#9b87f5'}
                totalFound={filteredSpells.length}
                totalSpells={allSpells.length}
              />
            </CardContent>
          </Card>

          <div className="mt-4 space-y-2">
            <Button 
              onClick={() => setShowImporter(true)} 
              className="w-full"
              style={{
                backgroundColor: '#9b87f580',
                color: 'white',
                borderColor: '#9b87f5'
              }}
            >
              Импорт заклинаний
            </Button>
          </div>
        </div>
        
        {/* Правая панель со списком заклинаний */}
        <div className="md:col-span-2">
          <ScrollArea className="h-[calc(100vh-130px)]">
            <SpellList 
              spells={filteredSpells}
              getBadgeColor={(level) => level === 0 ? '#9b87f550' : '#9b87f5'}
              getSchoolBadgeColor={() => '#9b87f5'}
              currentTheme={{textColor: 'white', accent: '#9b87f5', cardBackground: 'rgba(0, 0, 0, 0.75)'}}
              handleOpenSpell={setSelectedSpell}
              formatClasses={formatClasses}
              totalShown={`${filteredSpells.length} из ${allSpells.length}`}
            />
          </ScrollArea>
        </div>
      </div>
      
      {/* Модальное окно с детальной информацией о заклинании */}
      {selectedSpell && (
        <SpellDetailModal 
          spell={selectedSpell}
          isOpen={!!selectedSpell}
          onClose={() => setSelectedSpell(null)}
        />
      )}
      
      {/* Компонент для импорта заклинаний */}
      {showImporter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <SpellImporter 
            onClose={() => setShowImporter(false)}
          />
        </div>
      )}
    </div>
  );
};

export default SpellBookViewer;
