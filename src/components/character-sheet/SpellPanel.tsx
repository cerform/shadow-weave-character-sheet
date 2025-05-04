import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CharacterSpell } from '@/types/character';
import { Character } from '@/contexts/CharacterContext';
import { Book, Search, X, ChevronDown, ChevronUp, Sparkles, Bookmark, BookmarkCheck } from 'lucide-react';
import SpellDescription from './SpellDescription';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { normalizeSpells, safeJoin } from '@/utils/spellUtils';

interface SpellPanelProps {
  character: Character | null;
  onUpdate: (character: Character) => void;
}

const SpellPanel = ({ character, onUpdate }: SpellPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedSpells, setExpandedSpells] = useState<string[]>([]);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Группировка заклинаний по уровням
  const spellsByLevel = React.useMemo(() => {
    if (!character?.spells) return {};

    const normalizedSpells = normalizeSpells(character.spells);

    return normalizedSpells.reduce((acc: {[key: number]: CharacterSpell[]}, spell) => {
      const level = spell.level || 0;
      if (!acc[level]) acc[level] = [];
      acc[level].push(spell);
      return acc;
    }, {});
  }, [character?.spells]);

  // Фильтрация заклинаний по поиску и вкладке
  const filteredSpells = React.useMemo(() => {
    if (!character?.spells) return [];

    const normalizedSpells = normalizeSpells(character.spells);

    return normalizedSpells.filter(spell => {
      const matchesSearch = searchTerm === '' || 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (spell.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesTab = activeTab === 'all' || 
        (activeTab === 'prepared' && spell.prepared) ||
        (activeTab === 'cantrips' && spell.level === 0) ||
        (activeTab === spell.level.toString());
      
      return matchesSearch && matchesTab;
    });
  }, [character?.spells, searchTerm, activeTab]);

  // Обработчик переключения развернутого состояния заклинания
  const toggleSpellExpanded = (spellId: string) => {
    setExpandedSpells(prev => 
      prev.includes(spellId) 
        ? prev.filter(id => id !== spellId)
        : [...prev, spellId]
    );
  };

  // Обработчик переключения подготовленного состояния заклинания
  const toggleSpellPrepared = (spellId: string | number | undefined) => {
    if (!character || !spellId) return;
    
    const normalizedSpells = normalizeSpells(character.spells);
    const updatedSpells = normalizedSpells.map(spell => {
      if ((spell.id?.toString() || '') === spellId.toString()) {
        return { ...spell, prepared: !spell.prepared };
      }
      return spell;
    });
    
    // Конвертируем обратно в строки, если необходимо
    if (Array.isArray(character.spells) && character.spells.length > 0 && typeof character.spells[0] === 'string') {
      onUpdate({ ...character, spells: updatedSpells.map(spell => spell.name) });
    } else {
      onUpdate({ ...character, spells: updatedSpells });
    }
  };

  // Получение класса для границы карточки заклинания
  const getSpellBorderClass = (spell: CharacterSpell) => {
    if (spell.prepared) {
      return 'border-l-4 border-l-primary';
    }
    return '';
  };

  // Получение варианта для бейджа школы магии
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

  // Получение текстового представления уровня заклинания
  const getSpellLevelText = (level: number) => {
    if (level === 0) return 'Заговор';
    return `${level} уровень`;
  };

  // Рендер свойств заклинания
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
        <div className="col-span-2"><span className="font-medium">Классы:</span> {safeJoin(spell.classes)}</div>
      </div>
    );
  };

  // Рендер карточки заклинания
  const renderSpellCard = (spell: CharacterSpell) => {
    return (
      <Card key={spell.id || spell.name} className={`spell-card transition-all ${getSpellBorderClass(spell)}`}>
        <CardHeader className="p-3 pb-1">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base mr-2">{spell.name}</CardTitle>
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
        </CardHeader>
        
        <CardContent className="p-3 pt-1">
          <SpellDescription
            description={spell.description || ''}
            higherLevels={spell.higherLevels || ''}
            expanded={expandedSpells.includes(spell.id?.toString() || spell.name)}
          />
          
          {expandedSpells.includes(spell.id?.toString() || spell.name) && (
            renderSpellProperties(spell)
          )}
        </CardContent>
      </Card>
    );
  };

  // Получение количества подготовленных заклинаний
  function getPreparedSpellsCount() {
    if (!character?.spells) return 0;
    
    const normalizedSpells = normalizeSpells(character.spells);
    return normalizedSpells.filter(spell => spell.prepared && spell.level > 0).length;
  }

  // Получение максимального количества подготовленных заклинаний
  function getMaxPreparedSpells() {
    if (!character) return 0;
    
    const spellcastingAbility = character.className === 'Волшебник' ? 'intelligence' : 
                               character.className === 'Жрец' || character.className === 'Друид' ? 'wisdom' : 
                               'charisma';
    
    const abilityModifier = Math.floor((character.abilities?.[spellcastingAbility] - 10) / 2);
    const classLevel = character.level || 1;
    
    return Math.max(1, abilityModifier + classLevel);
  }

  // Получение информации о ячейках заклинаний
  function getSpellSlotInfo() {
    if (!character?.spellSlots) return null;
    
    return Object.entries(character.spellSlots)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([level, slots]) => ({
        level: Number(level),
        used: slots.used || 0,
        max: slots.max || 0
      }))
      .filter(slot => slot.max > 0);
  }

  // Обработчик изменения использованных ячеек заклинаний
  function handleSpellSlotChange(level: number, used: number) {
    if (!character?.spellSlots) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = { 
      ...updatedSpellSlots[level],
      used: Math.max(0, Math.min(used, updatedSpellSlots[level].max))
    };
    
    onUpdate({ ...character, spellSlots: updatedSpellSlots });
  }

  // Рендер информации о ячейках заклинаний
  function renderSpellSlots() {
    const spellSlots = getSpellSlotInfo();
    if (!spellSlots || spellSlots.length === 0) return null;
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
        {spellSlots.map(slot => (
          <div key={slot.level} className="flex flex-col items-center p-2 border rounded-md">
            <div className="text-xs text-muted-foreground mb-1">{slot.level} уровень</div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => handleSpellSlotChange(slot.level, slot.used - 1)}
                disabled={slot.used <= 0}
              >
                <span>-</span>
              </Button>
              <span className="text-sm font-medium">
                {slot.used}/{slot.max}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => handleSpellSlotChange(slot.level, slot.used + 1)}
                disabled={slot.used >= slot.max}
              >
                <span>+</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Рендер списка заклинаний по уровням
  function renderSpellsByLevel() {
    if (!character?.spells || character.spells.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Book className="mx-auto h-12 w-12 mb-2 opacity-20" />
          <p>У вас пока нет заклинаний</p>
        </div>
      );
    }

    // Если есть поиск, показываем все заклинания в одном списке
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

    // Если выбрана конкретная вкладка, показываем только эти заклинания
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

    // Иначе группируем по уровням
    return (
      <div className="space-y-6">
        {Object.entries(spellsByLevel).sort(([a], [b]) => Number(a) - Number(b)).map(([level, spells]) => (
          <div key={level}>
            <h3 className="text-lg font-semibold mb-2">
              {Number(level) === 0 ? 'Заговоры' : `${level} уровень`}
            </h3>
            <div className="space-y-3">
              {spells.map(spell => renderSpellCard(spell))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            Книга заклинаний
          </h2>
          <p className="text-sm text-muted-foreground">
            Подготовлено: {getPreparedSpellsCount()}/{getMaxPreparedSpells()}
          </p>
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

      {renderSpellSlots()}

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

export default SpellPanel;
