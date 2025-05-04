import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, X, ChevronDown, ChevronUp, Sparkles, Bookmark, BookmarkCheck, Book } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterSpell } from '@/types/character';
import SpellDescription from '../SpellDescription';
import { spells } from '@/data/spells';

// Добавляем утилиты для корректной обработки заклинаний
const safeJoin = (value: any): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === 'string') {
    return value;
  }
  return String(value || "");
};

const normalizeSpells = (spells: any[], allSpellsData: any[]): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    // Если это уже объект CharacterSpell
    if (typeof spell === 'object' && spell !== null) {
      return {
        ...spell,
        prepared: spell.prepared === undefined ? false : spell.prepared
      } as CharacterSpell;
    }
    
    // Если это строка, найти заклинание в базе данных
    if (typeof spell === 'string') {
      const foundSpell = allSpellsData.find(s => s.name === spell);
      if (foundSpell) {
        return {
          ...foundSpell,
          prepared: false // По умолчанию не подготовлено
        } as CharacterSpell;
      }
      // Если не найдено, создаем минимальный объект
      return {
        name: spell,
        level: 0,
        prepared: false
      } as CharacterSpell;
    }
    
    return {
      name: "Неизвестное заклинание",
      level: 0,
      prepared: false
    } as CharacterSpell;
  });
};

interface SpellsTabProps {
  character: any;
  onUpdate: (updates: any) => void;
}

export const SpellsTab = ({ character, onUpdate }: SpellsTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedSpells, setExpandedSpells] = useState<string[]>([]);

  // Ensure spells are in the correct format
  const normalizedSpells = normalizeSpells(character?.spells || [], spells);
  
  // Group spells by level
  const spellsByLevel = React.useMemo(() => {
    return normalizedSpells.reduce((acc: {[key: number]: CharacterSpell[]}, spell) => {
      const level = spell.level || 0;
      if (!acc[level]) acc[level] = [];
      acc[level].push(spell);
      return acc;
    }, {});
  }, [normalizedSpells]);
  
  // Filter spells based on search term and active tab
  const filteredSpells = React.useMemo(() => {
    return normalizedSpells.filter(spell => {
      const matchesSearch = searchTerm === '' || 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (spell.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesTab = activeTab === 'all' || 
        (activeTab === 'prepared' && spell.prepared) ||
        (activeTab === 'cantrips' && spell.level === 0) ||
        (activeTab === spell.level?.toString());
      
      return matchesSearch && matchesTab;
    });
  }, [normalizedSpells, searchTerm, activeTab]);
  
  // Toggle spell expanded state
  const toggleSpellExpanded = (spellId: string) => {
    setExpandedSpells(prev => 
      prev.includes(spellId) 
        ? prev.filter(id => id !== spellId)
        : [...prev, spellId]
    );
  };
  
  // Toggle spell prepared state
  const toggleSpellPrepared = (spellId: string | number | undefined) => {
    if (!character || !spellId) return;
    
    const updatedSpells = normalizedSpells.map(spell => {
      if ((spell.id?.toString() || '') === spellId.toString()) {
        return { ...spell, prepared: !spell.prepared };
      }
      return spell;
    });
    
    onUpdate({ ...character, spells: updatedSpells });
  };

  // Utility functions for UI rendering
  const getSpellBorderClass = (spell: CharacterSpell) => {
    if (spell.prepared) {
      return 'border-l-4 border-l-primary';
    }
    return '';
  };

  const getSchoolVariant = (school: string): "destructive" | "outline" | "secondary" | "default" => {
    switch (school?.toLowerCase()) {
      case 'воплощение': return 'destructive';
      case 'некромантия': return 'outline';
      case 'очарование': return 'secondary';
      case 'преобразование': return 'default';
      case 'прорицание': return 'default';
      case 'вызов': return 'secondary';
      case 'ограждение': return 'default';
      case 'иллюзия': return 'outline';
      default: return 'default';
    }
  };

  const getSpellLevelText = (level: number) => {
    if (level === 0) return 'Заговор';
    return `${level} уровень`;
  };

  // Render spell properties safely
  const renderSpellProperties = (spell: CharacterSpell) => {
    const components = [
      spell.verbal && 'В',
      spell.somatic && 'С',
      spell.material && 'М'
    ].filter(Boolean).join(', ');
    
    return (
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
        <div><span className="font-medium">Время накл.:</span> {spell.castingTime || 'Не указано'}</div>
        <div><span className="font-medium">Дальность:</span> {spell.range || 'Не указано'}</div>
        <div><span className="font-medium">Компоненты:</span> {components || 'Не указано'}</div>
        <div><span className="font-medium">Длительность:</span> {spell.duration || 'Не указано'}</div>
        <div className="col-span-2"><span className="font-medium">Классы:</span> {safeJoin(getSpellClasses(spell))}</div>
      </div>
    );
  };

  const renderSpellCard = (spell: CharacterSpell) => {
    return (
      <Card key={spell.id || spell.name} className={`spell-card transition-all ${getSpellBorderClass(spell)}`}>
        <div className="p-3 pb-1">
          <div className="flex justify-between items-start">
            <h3 className="text-base mr-2 font-semibold">{spell.name}</h3>
            <div className="flex items-center space-x-1">
              {spell.level > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleSpellPrepared(spell.id)}
                  title={spell.prepared ? "Убрать из подготовленных" : "Подготовить заклинание"}
                >
                  {spell.prepared ? 
                    <BookmarkCheck className="h-4 w-4 text-primary" /> : 
                    <Bookmark className="h-4 w-4" />
                  }
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleSpellExpanded(spell.id?.toString() || spell.name)}
              >
                {expandedSpells.includes(spell.id?.toString() || spell.name) ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <Badge variant={getSchoolVariant(spell.school || '')}>{spell.school}</Badge>
            <span>{getSpellLevelText(spell.level)}</span>
          </div>
        </div>
        
        <CardContent className="p-3 pt-1">
          <SpellDescription
            description={spell.description || ''}
            higherLevels={spell.higherLevels || spell.higherLevel || ""}
            expanded={expandedSpells.includes(spell.id?.toString() || spell.name)}
          />
          
          {expandedSpells.includes(spell.id?.toString() || spell.name) && (
            renderSpellProperties(spell)
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSpellsByLevel = () => {
    if (!normalizedSpells || normalizedSpells.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Book className="mx-auto h-12 w-12 mb-2 opacity-20" />
          <p>У вас пока нет заклинаний</p>
        </div>
      );
    }

    if (searchTerm) {
      return (
        <div className="space-y-3">
          {filteredSpells.length > 0 ? (
            filteredSpells.map(spell => renderSpellCard(spell))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>Заклинания не найдены</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab !== 'all') {
      return (
        <div className="space-y-3">
          {filteredSpells.length > 0 ? (
            filteredSpells.map(spell => renderSpellCard(spell))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>Заклинания не найдены</p>
            </div>
          )}
        </div>
      );
    }

    // Use typeguard to ensure spellsByLevel isn't unknown
    if (typeof spellsByLevel !== 'object' || spellsByLevel === null) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          <p>Ошибка загрузки заклинаний</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(spellsByLevel).sort(([a], [b]) => Number(a) - Number(b)).map(([level, spells]) => (
          <div key={level}>
            <h3 className="text-lg font-semibold mb-2">
              {Number(level) === 0 ? 'Заговоры' : `${level} уровень`}
            </h3>
            <div className="space-y-3">
              {Array.isArray(spells) && spells.map(spell => renderSpellCard(spell))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            Книга заклинаний
          </h2>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заклинаний..."
            className="pl-8 pr-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="prepared">Подготовленные</TabsTrigger>
          <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
          <TabsTrigger value="1">1 уровень</TabsTrigger>
          <TabsTrigger value="2">2 уровень</TabsTrigger>
          <TabsTrigger value="3">3 уровень</TabsTrigger>
          <TabsTrigger value="4">4 уровень</TabsTrigger>
          <TabsTrigger value="5">5 уровень</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-300px)]">
          {renderSpellsByLevel()}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

const getSpellClasses = (spell: any) => {
  if (!spell) return "";
  
  if (spell.classes) {
    if (Array.isArray(spell.classes)) {
      return spell.classes.join(", ");
    }
    return spell.classes;
  }
  return "";
};

const getSpellHigherLevels = (spell: any) => {
  return spell.higherLevels || spell.higherLevel || "";
};
