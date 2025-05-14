
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import SpellDetailModal from './SpellDetailModal';
import { spells as allSpells, getSpellsByClass, getSpellsByLevel } from '@/data/spells/index';
import { CharacterSpell } from '@/types/character';
import SpellCard from './SpellCard';
import SpellTable from './SpellTable';
import SpellFilterPanel from './SpellFilterPanel';
import { useSpellTheme } from '@/hooks/spellbook/themeUtils';
import { filterSpells } from '@/data/spells/index';
import { Grid2X2, Rows3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SpellBookViewer: React.FC = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevels, setActiveLevels] = useState<number[]>([]);
  const [activeSchools, setActiveSchools] = useState<string[]>([]);
  const [activeClasses, setActiveClasses] = useState<string[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<CharacterSpell[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [onlyRitual, setOnlyRitual] = useState(false);
  const [onlyConcentration, setOnlyConcentration] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { getBadgeColor, getSchoolBadgeColor, currentTheme } = useSpellTheme();

  // Загружаем все заклинания при первой загрузке компонента
  useEffect(() => {
    console.log("Загружено заклинаний:", allSpells.length);
    filterSpellList();
  }, []);

  // Перефильтровываем заклинания при изменении фильтров
  useEffect(() => {
    filterSpellList();
  }, [searchTerm, activeLevels, activeSchools, activeClasses, onlyRitual, onlyConcentration]);

  const filterSpellList = () => {
    let filtered = [...allSpells];
    console.log("Начало фильтрации, всего заклинаний:", filtered.length);

    // Фильтр по поисковому запросу
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по уровню (множественный выбор)
    if (activeLevels.length > 0) {
      filtered = filtered.filter(spell => activeLevels.includes(spell.level));
    }

    // Фильтр по школе (множественный выбор)
    if (activeSchools.length > 0) {
      filtered = filtered.filter(spell => 
        activeSchools.includes(spell.school || '')
      );
    }

    // Фильтр по классу (множественный выбор)
    if (activeClasses.length > 0) {
      filtered = filtered.filter(spell => {
        if (Array.isArray(spell.classes)) {
          return spell.classes.some(cls => activeClasses.includes(cls));
        }
        return activeClasses.includes(spell.classes?.toString() || '');
      });
    }

    // Фильтр по ритуалам
    if (onlyRitual) {
      filtered = filtered.filter(spell => spell.ritual);
    }

    // Фильтр по концентрации
    if (onlyConcentration) {
      filtered = filtered.filter(spell => spell.concentration);
    }

    // Сортировка по уровню и имени
    filtered.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.name.localeCompare(b.name);
    });

    console.log("Отфильтровано заклинаний:", filtered.length);
    setFilteredSpells(filtered);
  };

  const handleSpellClick = (spell: CharacterSpell) => {
    setSelectedSpell(spell);
    setIsDetailModalOpen(true);
  };

  const getAllSchools = () => {
    const schools = new Set<string>();
    allSpells.forEach(spell => {
      if (spell.school) {
        schools.add(spell.school);
      }
    });
    return Array.from(schools).sort();
  };

  const getAllClasses = () => {
    const classes = new Set<string>();
    allSpells.forEach(spell => {
      if (Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => {
          if (cls) classes.add(cls);
        });
      } else if (spell.classes) {
        classes.add(spell.classes.toString());
      }
    });
    return Array.from(classes).sort();
  };

  const getAllLevels = () => {
    const levels = new Set<number>();
    allSpells.forEach(spell => {
      levels.add(spell.level);
    });
    return Array.from(levels).sort((a, b) => a - b);
  };

  const toggleLevel = (level: number) => {
    setActiveLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) 
        : [...prev, level]
    );
  };

  const toggleSchool = (school: string) => {
    setActiveSchools(prev => 
      prev.includes(school) 
        ? prev.filter(s => s !== school) 
        : [...prev, school]
    );
  };

  const toggleClass = (cls: string) => {
    setActiveClasses(prev => 
      prev.includes(cls) 
        ? prev.filter(c => c !== cls) 
        : [...prev, cls]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveLevels([]);
    setActiveSchools([]);
    setActiveClasses([]);
    setOnlyRitual(false);
    setOnlyConcentration(false);
    
    toast({
      title: "Фильтры сброшены",
      description: "Все фильтры заклинаний были сброшены"
    });
  };

  const formatClasses = (classes: string[] | string | undefined): string => {
    if (!classes) return "—";
    if (typeof classes === 'string') return classes;
    if (Array.isArray(classes)) return classes.join(', ');
    return "—";
  };

  return (
    <div className="py-4">
      <div 
        className="bg-card p-4 mb-6 rounded-lg border"
        style={{ 
          backgroundColor: currentTheme.inputBackground || currentTheme.background,
          borderColor: `${currentTheme.accent}30`
        }}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: currentTheme.textColor }}>
              Поиск заклинаний
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-accent/20' : ''}`}
                style={{
                  borderColor: currentTheme.accent,
                  color: viewMode === 'grid' ? currentTheme.accent : currentTheme.textColor
                }}
              >
                <Grid2X2 size={18} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' ? 'bg-accent/20' : ''}`}
                style={{
                  borderColor: currentTheme.accent,
                  color: viewMode === 'table' ? currentTheme.accent : currentTheme.textColor
                }}
              >
                <Rows3 size={18} />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Input
                placeholder="Поиск по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  backgroundColor: currentTheme.inputBackground, 
                  color: currentTheme.textColor,
                  borderColor: `${currentTheme.accent}30`
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant={onlyRitual ? "default" : "outline"}
              onClick={() => setOnlyRitual(!onlyRitual)}
              style={onlyRitual ? 
                { backgroundColor: currentTheme.accent, color: currentTheme.background } : 
                { backgroundColor: 'transparent', color: currentTheme.textColor, borderColor: `${currentTheme.accent}50` }
              }
            >
              Только ритуалы
            </Button>
            
            <Button 
              variant={onlyConcentration ? "default" : "outline"}
              onClick={() => setOnlyConcentration(!onlyConcentration)}
              style={onlyConcentration ? 
                { backgroundColor: currentTheme.accent, color: currentTheme.background } : 
                { backgroundColor: 'transparent', color: currentTheme.textColor, borderColor: `${currentTheme.accent}50` }
              }
            >
              Только концентрация
            </Button>
          </div>
        </div>
      </div>
      
      <SpellFilterPanel 
        activeLevel={activeLevels}
        activeSchool={activeSchools}
        activeClass={activeClasses}
        allLevels={getAllLevels()}
        allSchools={getAllSchools()}
        allClasses={getAllClasses()}
        toggleLevel={toggleLevel}
        toggleSchool={toggleSchool}
        toggleClass={toggleClass}
        clearFilters={clearFilters}
        getBadgeColor={getBadgeColor}
        getSchoolBadgeColor={getSchoolBadgeColor}
        currentTheme={currentTheme}
      />
      
      <Card className="p-6" style={{ 
        backgroundColor: currentTheme.cardBackground,
        borderColor: `${currentTheme.accent}30`
      }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: currentTheme.textColor }}>
          Результаты поиска ({filteredSpells.length})
        </h2>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {filteredSpells.length > 0 ? (
              filteredSpells.map((spell) => (
                <SpellCard
                  key={spell.id ? spell.id.toString() : spell.name}
                  spell={spell}
                  onClick={() => handleSpellClick(spell)}
                  currentTheme={currentTheme}
                />
              ))
            ) : (
              <div 
                className="col-span-full text-center py-12"
                style={{ color: currentTheme.mutedTextColor }}
              >
                Заклинания не найдены. Попробуйте изменить параметры поиска.
              </div>
            )}
          </div>
        ) : (
          <SpellTable 
            spells={filteredSpells}
            onSpellClick={handleSpellClick}
            currentTheme={currentTheme}
          />
        )}
      </Card>
      
      {selectedSpell && (
        <SpellDetailModal 
          spell={selectedSpell}
          open={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          currentTheme={currentTheme}
        />
      )}
    </div>
  );
};

export default SpellBookViewer;
