
import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SpellData } from '@/types/spells';

interface SpellFiltersProps {
  allSpells: SpellData[];
  setFilteredSpells: (spells: SpellData[]) => void;
}

const SpellFilters: React.FC<SpellFiltersProps> = ({ allSpells, setFilteredSpells }) => {
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isRitual, setIsRitual] = useState<boolean | null>(null);
  const [isConcentration, setIsConcentration] = useState<boolean | null>(null);
  
  // Собираем уникальные школы магии
  const uniqueSchools = [...new Set(allSpells.map(spell => spell.school))].sort();
  
  // Собираем уникальные классы
  const uniqueClasses = [...new Set(
    allSpells.flatMap(spell => {
      if (typeof spell.classes === 'string') {
        return [spell.classes];
      }
      return Array.isArray(spell.classes) ? spell.classes : [];
    })
  )].sort();

  const applyFilters = () => {
    let filtered = [...allSpells];
    
    // Фильтр по школе магии
    if (selectedSchools.length > 0) {
      filtered = filtered.filter(spell => selectedSchools.includes(spell.school));
    }
    
    // Фильтр по уровню
    if (selectedLevel !== null) {
      filtered = filtered.filter(spell => spell.level === selectedLevel);
    }
    
    // Фильтр по классу
    if (selectedClass) {
      filtered = filtered.filter(spell => {
        if (typeof spell.classes === 'string') {
          return spell.classes === selectedClass;
        }
        return Array.isArray(spell.classes) && spell.classes.includes(selectedClass);
      });
    }
    
    // Фильтр по ритуалу
    if (isRitual !== null) {
      filtered = filtered.filter(spell => spell.ritual === isRitual);
    }
    
    // Фильтр по концентрации
    if (isConcentration !== null) {
      filtered = filtered.filter(spell => spell.concentration === isConcentration);
    }
    
    setFilteredSpells(filtered);
  };
  
  const resetFilters = () => {
    setSelectedSchools([]);
    setSelectedLevel(null);
    setSelectedClass(null);
    setIsRitual(null);
    setIsConcentration(null);
    setFilteredSpells(allSpells);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Фильтры
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Фильтры заклинаний</h4>
          <Separator />
          
          <div className="space-y-2">
            <Label>Школа магии</Label>
            <Command>
              <CommandInput placeholder="Поиск школы..." />
              <CommandEmpty>Школа не найдена</CommandEmpty>
              <CommandGroup className="max-h-40 overflow-auto">
                {uniqueSchools.map(school => (
                  <CommandItem
                    key={school}
                    onSelect={() => {
                      if (selectedSchools.includes(school)) {
                        setSelectedSchools(selectedSchools.filter(s => s !== school));
                      } else {
                        setSelectedSchools([...selectedSchools, school]);
                      }
                    }}
                  >
                    <Checkbox
                      checked={selectedSchools.includes(school)}
                      className="mr-2"
                    />
                    {school}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </div>
          
          <div className="space-y-2">
            <Label>Уровень заклинания</Label>
            <Select
              value={selectedLevel?.toString() || ''}
              onValueChange={(value) => setSelectedLevel(value ? parseInt(value) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите уровень" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все уровни</SelectItem>
                <SelectItem value="0">Заговор</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                  <SelectItem key={level} value={level.toString()}>
                    {level} уровень
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Класс</Label>
            <Select
              value={selectedClass || ''}
              onValueChange={(value) => setSelectedClass(value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите класс" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все классы</SelectItem>
                {uniqueClasses.map(className => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ritual"
              checked={isRitual === true}
              onCheckedChange={(checked) => {
                if (checked === 'indeterminate') return;
                setIsRitual(isRitual === true ? null : true);
              }}
            />
            <Label htmlFor="ritual">Только ритуальные</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="concentration"
              checked={isConcentration === true}
              onCheckedChange={(checked) => {
                if (checked === 'indeterminate') return;
                setIsConcentration(isConcentration === true ? null : true);
              }}
            />
            <Label htmlFor="concentration">Только с концентрацией</Label>
          </div>
          
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={resetFilters}>
              Сбросить
            </Button>
            <Button onClick={applyFilters}>
              Применить
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SpellFilters;
