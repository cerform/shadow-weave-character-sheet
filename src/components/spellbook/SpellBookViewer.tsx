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
import { spells, getSpellsByClass, getSpellsByLevel } from '@/data/spells';
import { CharacterSpell } from '@/types/character';

interface Theme {
  accent: string;
  textColor: string;
  background: string;
  foreground: string;
  primary: string;
  cardBackground: string;
  inputBackground?: string;
  mutedTextColor?: string;
}

const SpellBookViewer: React.FC = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [filteredSpells, setFilteredSpells] = useState<CharacterSpell[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [onlyRitual, setOnlyRitual] = useState(false);
  const [onlyConcentration, setOnlyConcentration] = useState(false);

  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    filterSpells();
  }, [searchTerm, selectedLevel, selectedClass, selectedSchool, onlyRitual, onlyConcentration]);

  const filterSpells = () => {
    let filtered = [...spells];

    // Фильтр по поисковому запросу
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по уровню
    if (selectedLevel !== 'all') {
      const level = parseInt(selectedLevel);
      filtered = filtered.filter(spell => spell.level === level);
    }

    // Фильтр по классу
    if (selectedClass !== 'all') {
      filtered = filtered.filter(spell => {
        if (Array.isArray(spell.classes)) {
          return spell.classes.some(cls => cls.toLowerCase() === selectedClass.toLowerCase());
        }
        return spell.classes?.toString().toLowerCase() === selectedClass.toLowerCase();
      });
    }

    // Фильтр по школе
    if (selectedSchool !== 'all') {
      filtered = filtered.filter(spell => 
        spell.school?.toLowerCase() === selectedSchool.toLowerCase()
      );
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

    setFilteredSpells(filtered);
  };

  const handleSpellClick = (spell: CharacterSpell) => {
    setSelectedSpell(spell);
    setIsDetailModalOpen(true);
  };

  const getSchoolsList = () => {
    const schools = new Set<string>();
    spells.forEach(spell => {
      if (spell.school) {
        schools.add(spell.school);
      }
    });
    return Array.from(schools).sort();
  };

  const getClassesList = () => {
    const classes = new Set<string>();
    spells.forEach(spell => {
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

  return (
    <div className="py-4">
      {/* Используйте проверку на наличие inputBackground с fallback на background */}
      <div 
        className="bg-card p-4 mb-6 rounded-lg border"
        style={{ backgroundColor: themeStyles?.inputBackground || themeStyles?.background }}
      >
        <div className="space-y-4">
          <h2 className="text-2xl font-bold" style={{ color: currentTheme.textColor }}>
            Поиск заклинаний
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Поиск по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ backgroundColor: currentTheme.inputBackground, color: currentTheme.textColor }}
              />
            </div>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger style={{ backgroundColor: currentTheme.inputBackground, color: currentTheme.textColor }}>
                <SelectValue placeholder="Уровень" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все уровни</SelectItem>
                <SelectItem value="0">Заговоры</SelectItem>
                <SelectItem value="1">1 уровень</SelectItem>
                <SelectItem value="2">2 уровень</SelectItem>
                <SelectItem value="3">3 уровень</SelectItem>
                <SelectItem value="4">4 уровень</SelectItem>
                <SelectItem value="5">5 уровень</SelectItem>
                <SelectItem value="6">6 уровень</SelectItem>
                <SelectItem value="7">7 уровень</SelectItem>
                <SelectItem value="8">8 уровень</SelectItem>
                <SelectItem value="9">9 уровень</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger style={{ backgroundColor: currentTheme.inputBackground, color: currentTheme.textColor }}>
                <SelectValue placeholder="Класс" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все классы</SelectItem>
                {getClassesList().map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger style={{ backgroundColor: currentTheme.inputBackground, color: currentTheme.textColor }}>
                <SelectValue placeholder="Школа магии" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все школы</SelectItem>
                {getSchoolsList().map(school => (
                  <SelectItem key={school} value={school}>{school}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant={onlyRitual ? "default" : "outline"}
                onClick={() => setOnlyRitual(!onlyRitual)}
                style={onlyRitual ? 
                  { backgroundColor: currentTheme.accent, color: currentTheme.background } : 
                  { backgroundColor: currentTheme.inputBackground, color: currentTheme.textColor }
                }
              >
                Только ритуалы
              </Button>
              
              <Button 
                variant={onlyConcentration ? "default" : "outline"}
                onClick={() => setOnlyConcentration(!onlyConcentration)}
                style={onlyConcentration ? 
                  { backgroundColor: currentTheme.accent, color: currentTheme.background } : 
                  { backgroundColor: currentTheme.inputBackground, color: currentTheme.textColor }
                }
              >
                Только концентрация
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Card className="p-6" style={{ backgroundColor: currentTheme.cardBackground }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: currentTheme.textColor }}>
          Результаты поиска ({filteredSpells.length})
        </h2>
        
        <ScrollArea className="h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpells.map(spell => (
              <Card 
                key={spell.id || spell.name} 
                className="p-4 cursor-pointer hover:border-accent transition-all"
                style={{ backgroundColor: currentTheme.background }}
                onClick={() => handleSpellClick(spell)}
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="font-bold" style={{ color: currentTheme.textColor }}>{spell.name}</h3>
                    <span style={{ color: currentTheme.mutedTextColor }}>
                      {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                    </span>
                  </div>
                  
                  <div className="text-sm" style={{ color: currentTheme.mutedTextColor }}>
                    <p>{spell.school || 'Школа неизвестна'}</p>
                    <p>
                      {spell.ritual && <span className="mr-2">Ритуал</span>}
                      {spell.concentration && <span>Концентрация</span>}
                    </p>
                  </div>
                  
                  <p className="text-xs truncate" style={{ color: currentTheme.mutedTextColor }}>
                    {typeof spell.description === 'string' 
                      ? spell.description.substring(0, 100) + (spell.description.length > 100 ? '...' : '')
                      : Array.isArray(spell.description) && spell.description.length > 0
                        ? spell.description[0].substring(0, 100) + (spell.description[0].length > 100 ? '...' : '')
                        : 'Нет описания'
                    }
                  </p>
                </div>
              </Card>
            ))}
            
            {filteredSpells.length === 0 && (
              <div 
                className="col-span-3 text-center py-8"
                style={{ color: currentTheme.mutedTextColor }}
              >
                Заклинания не найдены. Попробуйте изменить параметры поиска.
              </div>
            )}
          </div>
        </ScrollArea>
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
