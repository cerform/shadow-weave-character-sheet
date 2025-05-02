
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
import { cantrips } from '@/data/spells/level0';
import { level1 } from '@/data/spells/level1';
import { level2 } from '@/data/spells/level2';
import { level3 } from '@/data/spells/level3';
import { level4 } from '@/data/spells/level4';
import { level5 } from '@/data/spells/level5';
import { level6 } from '@/data/spells/level6';
import { level7 } from '@/data/spells/level7';
import { level8 } from '@/data/spells/level8';

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

  const allSpells = useMemo(() => [
    ...cantrips,
    ...level1,
    ...level2,
    ...level3,
    ...level4,
    ...level5,
    ...level6,
    ...level7,
    ...level8,
  ], []);

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
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Книга заклинаний</h1>
      
      <div className="bg-card p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Фильтры</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Input
              placeholder="Поиск заклинания..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
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
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Найдено заклинаний: {filteredSpells.length} из {allSpells.length}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpells.map((spell, index) => (
          <Card key={`${spell.name}-${index}`} className="p-4">
            <div className="flex justify-between">
              <h3 className="font-bold">{spell.name}</h3>
              <span className="text-sm bg-secondary text-secondary-foreground px-2 rounded-md">
                {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{spell.school}</p>
            <p className="text-sm mb-1">
              <span className="font-medium">Время накладывания:</span> {spell.castingTime}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Дистанция:</span> {spell.range}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Компоненты:</span> {spell.components}
              {spell.ritual && " (ритуал)"}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Длительность:</span> {spell.duration}
              {spell.concentration && " (концентрация)"}
            </p>
            <div className="mt-2">
              <p className="text-sm line-clamp-3" title={spell.description}>
                {spell.description}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {spell.classes?.map(className => (
                <span key={className} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {className}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
      
      {filteredSpells.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium">Заклинания не найдены</p>
          <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
        </div>
      )}
    </div>
  );
};

export default SpellBookViewer;
