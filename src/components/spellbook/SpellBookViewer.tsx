import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CharacterSpell } from '@/types/character';
import { spells, getAllSpells } from '@/data/spells';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationButtons from '@/components/ui/NavigationButtons';
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { Separator } from '@/components/ui/separator';

const spellSchools = [
  "Вызов",
  "Воплощение",
  "Иллюзия",
  "Некромантия",
  "Ограждение",
  "Очарование",
  "Преобразование",
  "Прорицание",
];

const spellClasses = [
  "Бард",
  "Волшебник",
  "Друид",
  "Жрец",
  "Колдун",
  "Паладин",
  "Следопыт",
  "Чародей",
  "Искуситель"
];

const SpellBookViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [showRitualOnly, setShowRitualOnly] = useState(false);
  const [showConcentrationOnly, setShowConcentrationOnly] = useState(false);
  const [showVerbalOnly, setShowVerbalOnly] = useState(false);
  const [showSomaticOnly, setShowSomaticOnly] = useState(false);
  const [showMaterialOnly, setShowMaterialOnly] = useState(false);
  
  const { theme } = useTheme();
  // Добавляем защиту от undefined
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const allSpells = useMemo(() => getAllSpells(), []);

  const filteredSpells = useMemo(() => {
    return allSpells.filter(spell => {
      // Text search
      if (searchTerm && !spell.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Level filter
      if (selectedLevel !== 'all' && spell.level !== parseInt(selectedLevel, 10)) {
        return false;
      }
      
      // School filter
      if (selectedSchool !== 'all' && spell.school !== selectedSchool) {
        return false;
      }
      
      // Class filter
      if (selectedClass !== 'all' && !spell.classes.includes(selectedClass)) {
        return false;
      }
      
      // Component filters
      if (showRitualOnly && !spell.ritual) {
        return false;
      }
      
      if (showConcentrationOnly && !spell.concentration) {
        return false;
      }
      
      if (showVerbalOnly && !spell.verbal) {
        return false;
      }
      
      if (showSomaticOnly && !spell.somatic) {
        return false;
      }
      
      if (showMaterialOnly && !spell.material) {
        return false;
      }
      
      return true;
    });
  }, [
    searchTerm, 
    selectedLevel, 
    selectedSchool, 
    selectedClass,
    showRitualOnly,
    showConcentrationOnly,
    showVerbalOnly,
    showSomaticOnly,
    showMaterialOnly,
    allSpells
  ]);

  // Функция для группировки заклинаний по уро��ням
  const spellsByLevel = useMemo(() => {
    const grouped: { [key: string]: CharacterSpell[] } = {};
    
    filteredSpells.forEach(spell => {
      const level = spell.level;
      const levelKey = level === 0 ? 'cantrips' : `level-${level}`;
      
      if (!grouped[levelKey]) {
        grouped[levelKey] = [];
      }
      
      grouped[levelKey].push(spell);
    });
    
    // Сортируем заклинания внутри каждого уровня по имени
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return grouped;
  }, [filteredSpells]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedLevel('all');
    setSelectedSchool('all');
    setSelectedClass('all');
    setShowRitualOnly(false);
    setShowConcentrationOnly(false);
    setShowVerbalOnly(false);
    setShowSomaticOnly(false);
    setShowMaterialOnly(false);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center" style={{ color: currentTheme.textColor }}>D&D 5e Книга заклинаний</h1>
        <NavigationButtons className="mt-4" />
      </div>
      
      <div className="bg-background/25 backdrop-blur-sm p-6 rounded-lg shadow-md border border-primary/20 mb-6">
        <Tabs defaultValue="by-level" className="w-full">
          <TabsList className="mb-4 mx-auto">
            <TabsTrigger value="by-level">По уровням</TabsTrigger>
            <TabsTrigger value="all">Все заклинания</TabsTrigger>
            <TabsTrigger value="search">Поиск</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>Поиск по названию</label>
                <Input
                  placeholder="Поиск заклинания..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>Фильтр по уровню</label>
                <Select
                  value={selectedLevel}
                  onValueChange={setSelectedLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Уровень" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все уровни</SelectItem>
                    <SelectItem value="0">Заговоры</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                      <SelectItem key={level} value={level.toString()}>
                        {level} уровень
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>Фильтр по школе</label>
                <Select
                  value={selectedSchool}
                  onValueChange={setSelectedSchool}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Школа" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все школы</SelectItem>
                    {spellSchools.map(school => (
                      <SelectItem key={school} value={school}>
                        {school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>Фильтр по классу</label>
                <Select
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Класс" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все классы</SelectItem>
                    {spellClasses.map(className => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ritual" 
                  checked={showRitualOnly}
                  onCheckedChange={(checked) => setShowRitualOnly(checked as boolean)}
                />
                <label htmlFor="ritual" className="text-sm font-medium">
                  Только ритуалы
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="concentration" 
                  checked={showConcentrationOnly}
                  onCheckedChange={(checked) => setShowConcentrationOnly(checked as boolean)}
                />
                <label htmlFor="concentration" className="text-sm font-medium">
                  Требует концентрации
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="verbal" 
                  checked={showVerbalOnly}
                  onCheckedChange={(checked) => setShowVerbalOnly(checked as boolean)}
                />
                <label htmlFor="verbal" className="text-sm font-medium">
                  Вербальный компонент
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="somatic" 
                  checked={showSomaticOnly}
                  onCheckedChange={(checked) => setShowSomaticOnly(checked as boolean)}
                />
                <label htmlFor="somatic" className="text-sm font-medium">
                  Соматический компонент
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="material" 
                  checked={showMaterialOnly}
                  onCheckedChange={(checked) => setShowMaterialOnly(checked as boolean)}
                />
                <label htmlFor="material" className="text-sm font-medium">
                  Материальный компонент
                </label>
              </div>
            </div>
            
            <Button onClick={resetFilters} variant="outline">
              Сбросить все фильтры
            </Button>
            
            <div className="mb-4 mt-6">
              <p className="text-sm" style={{ color: currentTheme.mutedTextColor }}>
                Найдено заклинаний: {filteredSpells.length} из {allSpells.length}
              </p>
            </div>
            
            {filteredSpells.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg font-medium">Заклинания не найдены</p>
                <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(spellsByLevel).map(([levelKey, levelSpells]) => (
                  <div key={levelKey} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: currentTheme.accent }}>
                      {levelKey === 'cantrips' ? 'Заговоры' : `${levelKey.split('-')[1]} уровень`}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {levelSpells.map((spell) => (
                        <SpellCard key={spell.name} spell={spell} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="by-level">
            <div className="space-y-8">
              {/* Заговоры */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2" style={{ color: currentTheme.accent }}>
                  Заговоры (0 уровень)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-4">
                  {allSpells
                    .filter(spell => spell.level === 0)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(spell => (
                      <SpellLinkCard key={spell.name} spell={spell} />
                    ))}
                </div>
              </div>
              
              {/* 1-9 уровни */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                const levelSpells = allSpells.filter(spell => spell.level === level);
                if (levelSpells.length === 0) return null;
                
                return (
                  <div key={level}>
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2" style={{ color: currentTheme.accent }}>
                      {level} уровень
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-4">
                      {levelSpells
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(spell => (
                          <SpellLinkCard key={spell.name} spell={spell} />
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="all">
            <ScrollArea className="h-[calc(100vh-300px)] pr-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allSpells
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((spell) => (
                      <SpellCard key={spell.name} spell={spell} />
                    ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Компонент для отображения подробной карточки заклинания
const SpellCard: React.FC<{ spell: CharacterSpell }> = ({ spell }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const getComponentString = () => {
    const components = [];
    if (spell.verbal) components.push('В');
    if (spell.somatic) components.push('С');
    if (spell.material) components.push('М');
    
    let result = components.join(', ');
    
    // Check if components string contains material component indicator without checking materialComponents
    if (spell.material) {
      // We don't have materialComponents property, so we just indicate there's a material component
      result += ' (материальные компоненты)';
    }
    
    return result;
  };

  return (
    <Card className="p-4 h-full border border-primary/20 bg-background/40 backdrop-blur-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold" style={{ color: currentTheme.accent }}>{spell.name}</h3>
        <Badge 
          className="text-xs"
          style={{ 
            backgroundColor: `${currentTheme.cardBackground || "rgba(0, 0, 0, 0.2)"}`,
            color: currentTheme.textColor
          }}
        >
          {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
        </Badge>
      </div>
      
      <p className="text-sm mb-2" style={{ color: currentTheme.mutedTextColor }}>{spell.school}</p>
      
      <div className="space-y-1 mb-3">
        <p className="text-sm">
          <span className="font-medium">Время накладывания:</span> {spell.castingTime}
          {spell.ritual && <span className="ml-1 italic">(ритуал)</span>}
        </p>
        
        <p className="text-sm">
          <span className="font-medium">Дистанция:</span> {spell.range}
        </p>
        
        <p className="text-sm">
          <span className="font-medium">Компоненты:</span> {getComponentString()}
        </p>
        
        <p className="text-sm">
          <span className="font-medium">Длительность:</span> {spell.duration}
          {spell.concentration && <span className="ml-1 italic">(концентрация)</span>}
        </p>
      </div>
      
      <Separator className="my-2" style={{ backgroundColor: currentTheme.accent + '40' }} />
      
      <div className="mt-2">
        <p className="text-sm line-clamp-3" title={spell.description}>
          {spell.description}
        </p>
      </div>
      
      {spell.higherLevels && (
        <div className="mt-2">
          <p className="text-sm font-medium">На более высоком уровне:</p>
          <p className="text-sm line-clamp-2" title={spell.higherLevels}>
            {spell.higherLevels}
          </p>
        </div>
      )}
      
      <div className="mt-2 flex flex-wrap gap-1">
        {spell.classes?.map(className => (
          <span 
            key={className} 
            className="text-xs px-2 py-0.5 rounded"
            style={{ 
              backgroundColor: `${currentTheme.accent}20`,
              color: currentTheme.accent
            }}
          >
            {className}
          </span>
        ))}
      </div>
    </Card>
  );
};

// Компонент для отображения сокращённой карточки заклинания в списке по уровням
const SpellLinkCard: React.FC<{ spell: CharacterSpell }> = ({ spell }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Формируем строку компонентов (В, С, М)
  const getComponentIcons = () => {
    let result = '';
    if (spell.verbal) result += 'В';
    if (spell.somatic) result += 'С';
    if (spell.material) result += 'М';
    return result;
  };
  
  // Добавляем индикаторы для ритуалов и концентрации
  const getAdditionalIcons = () => {
    let result = '';
    if (spell.ritual) result += ' Р';
    if (spell.concentration) result += ' К';
    return result;
  };

  return (
    <div 
      className="p-2 rounded border flex justify-between items-center hover:bg-background/50 transition-colors"
      style={{ borderColor: `${currentTheme.accent}30` }}
    >
      <div className="flex flex-col">
        <span className="font-medium" style={{ color: currentTheme.textColor }}>{spell.name}</span>
        <span className="text-xs" style={{ color: currentTheme.mutedTextColor }}>{spell.school}</span>
      </div>
      <div className="flex items-center gap-2">
        <span 
          className="text-xs px-2 py-1 rounded"
          style={{ 
            backgroundColor: `${currentTheme.accent}20`,
            color: currentTheme.accent
          }}
        >
          {getComponentIcons()}{getAdditionalIcons()}
        </span>
      </div>
    </div>
  );
};

export default SpellBookViewer;
