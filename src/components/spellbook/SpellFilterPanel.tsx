
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { SpellFilters } from '@/hooks/spellbook/types';
import { SchoolFilterMapping } from '@/hooks/spellbook/filterUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Separator } from '@/components/ui/separator';

interface SpellFilterPanelProps {
  filters: SpellFilters;
  setFilters: React.Dispatch<React.SetStateAction<SpellFilters>>;
}

const SpellFilterPanel: React.FC<SpellFilterPanelProps> = ({ filters, setFilters }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, name: e.target.value }));
  };

  const handleLevelChange = (value: string) => {
    setFilters(prev => ({ ...prev, level: value === 'any' ? '' : value }));
  };

  const handleSchoolChange = (value: string) => {
    setFilters(prev => ({ ...prev, school: value === 'any' ? '' : value }));
  };

  const handleClassChange = (value: string) => {
    setFilters(prev => ({ ...prev, characterClass: value === 'any' ? '' : value }));
  };

  const toggleRitual = (checked: boolean | string) => {
    setFilters(prev => ({ ...prev, ritual: Boolean(checked) }));
  };

  const toggleConcentration = (checked: boolean | string) => {
    setFilters(prev => ({ ...prev, concentration: Boolean(checked) }));
  };

  const handleResetFilters = () => {
    setFilters({
      name: '',
      level: '',
      school: '',
      characterClass: '',
      ritual: false,
      concentration: false
    });
  };

  // Классы для D&D 5e
  const classes = [
    'Бард', 'Варвар', 'Воин', 'Волшебник', 'Друид', 'Жрец', 
    'Колдун', 'Монах', 'Паладин', 'Плут', 'Следопыт', 'Чародей',
    'Искуситель'
  ];

  const fieldContainerClass = isMobile ? "mb-4" : "mb-6";
  
  return (
    <div className={`space-y-4 ${isMobile ? 'p-1' : 'p-4'} rounded-md bg-opacity-50 bg-black`}>
      <h2 className="text-lg font-semibold mb-3">Фильтры</h2>
      
      <Separator className="my-3" />
      
      <div className={fieldContainerClass}>
        <Label htmlFor="spell-name" className="mb-1 block">Название:</Label>
        <Input
          id="spell-name"
          placeholder="Поиск по названию..."
          value={filters.name}
          onChange={handleNameChange}
        />
      </div>
      
      <div className={fieldContainerClass}>
        <Label htmlFor="spell-level" className="mb-1 block">Уровень:</Label>
        <Select 
          value={filters.level || 'any'}
          onValueChange={handleLevelChange}
        >
          <SelectTrigger id="spell-level">
            <SelectValue placeholder="Любой уровень" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Любой уровень</SelectItem>
            <SelectItem value="0">Заговор</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
              <SelectItem key={level} value={level.toString()}>
                {level} уровень
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className={fieldContainerClass}>
        <Label htmlFor="spell-school" className="mb-1 block">Школа магии:</Label>
        <Select 
          value={filters.school || 'any'}
          onValueChange={handleSchoolChange}
        >
          <SelectTrigger id="spell-school">
            <SelectValue placeholder="Любая школа" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Любая школа</SelectItem>
            {Object.entries(SchoolFilterMapping).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className={fieldContainerClass}>
        <Label htmlFor="spell-class" className="mb-1 block">Класс:</Label>
        <Select 
          value={filters.characterClass || 'any'}
          onValueChange={handleClassChange}
        >
          <SelectTrigger id="spell-class">
            <SelectValue placeholder="Любой класс" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Любой класс</SelectItem>
            {classes.map(characterClass => (
              <SelectItem key={characterClass} value={characterClass}>{characterClass}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="ritual"
            checked={filters.ritual}
            onCheckedChange={toggleRitual}
          />
          <Label htmlFor="ritual" className="cursor-pointer">Ритуальное</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="concentration"
            checked={filters.concentration}
            onCheckedChange={toggleConcentration}
          />
          <Label htmlFor="concentration" className="cursor-pointer">Требует концентрации</Label>
        </div>
      </div>
      
      {isMobile && (
        <div className="pt-2">
          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-400 hover:text-blue-300 underline"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
};

export default SpellFilterPanel;
