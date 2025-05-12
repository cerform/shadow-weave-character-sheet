
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { getAllSpells } from '@/data/spells';
import { useToast } from '@/hooks/use-toast';
import SpellDetailModal from '../spellbook/SpellDetailModal';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellSelectionModalProps {
  open: boolean;
  onClose: () => void;
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  open,
  onClose,
  character,
  onUpdate
}) => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxLevel, setMaxLevel] = useState(9);
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    loadSpells();
    
    if (character.level) {
      calculateMaxLevel(character.level);
    }
  }, [character.class, character.level]);

  useEffect(() => {
    if (searchTerm) {
      filterSpells(searchTerm);
    } else {
      setFilteredSpells(spells);
    }
  }, [searchTerm, spells]);

  // Загрузка заклинаний из данных
  const loadSpells = () => {
    try {
      const allSpells = getAllSpells();
      
      // Если есть класс, фильтруем заклинания для него
      if (character.class) {
        const classSpells = allSpells.filter(spell => {
          if (!spell.classes) return false;
          
          // Преобразуем classes к массиву, если это строка
          const spellClasses = typeof spell.classes === 'string' 
            ? [spell.classes.toLowerCase()] 
            : Array.isArray(spell.classes) ? spell.classes.map(c => 
                typeof c === 'string' ? c.toLowerCase() : ''
              ) : [];
          
          // Проверяем соответствие класса (русские и английские названия)
          const characterClassLower = character.class.toLowerCase();
          return spellClasses.some(cls => {
            return cls === characterClassLower || 
              (characterClassLower === 'жрец' && cls === 'cleric') ||
              (characterClassLower === 'волшебник' && cls === 'wizard') ||
              (characterClassLower === 'друид' && cls === 'druid') ||
              (characterClassLower === 'бард' && cls === 'bard') ||
              (characterClassLower === 'колдун' && cls === 'warlock') ||
              (characterClassLower === 'чародей' && cls === 'sorcerer') ||
              (characterClassLower === 'паладин' && cls === 'paladin');
          });
        });
        
        setSpells(classSpells);
        setFilteredSpells(classSpells);
      } else {
        setSpells(allSpells);
        setFilteredSpells(allSpells);
      }
    } catch (error) {
      console.error('Ошибка при загрузке заклинаний:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список заклинаний',
        variant: 'destructive'
      });
    }
  };

  // Фильтрация заклинаний по строке поиска
  const filterSpells = (term: string) => {
    const filtered = spells.filter(spell => 
      spell.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredSpells(filtered);
  };

  // Определение максимального уровня заклинаний в зависимости от уровня персонажа
  const calculateMaxLevel = (characterLevel: number) => {
    // Упрощенная формула определения доступных уровней заклинаний
    // Для полных заклинателей
    if (['жрец', 'волшебник', 'друид', 'чародей', 'бард', 'cleric', 'wizard', 'druid', 'sorcerer', 'bard'].includes(character.class.toLowerCase())) {
      if (characterLevel < 3) setMaxLevel(1);
      else if (characterLevel < 5) setMaxLevel(2);
      else if (characterLevel < 7) setMaxLevel(3);
      else if (characterLevel < 9) setMaxLevel(4);
      else if (characterLevel < 11) setMaxLevel(5);
      else if (characterLevel < 13) setMaxLevel(6);
      else if (characterLevel < 15) setMaxLevel(7);
      else if (characterLevel < 17) setMaxLevel(8);
      else setMaxLevel(9);
    } 
    // Для полузаклинателей (паладин, следопыт, воин элдрич найт)
    else if (['паладин', 'следопыт', 'paladin', 'ranger'].includes(character.class.toLowerCase())) {
      if (characterLevel < 5) setMaxLevel(1);
      else if (characterLevel < 9) setMaxLevel(2);
      else if (characterLevel < 13) setMaxLevel(3);
      else if (characterLevel < 17) setMaxLevel(4);
      else setMaxLevel(5);
    }
    // Для остальных классов оставляем 9
    else {
      setMaxLevel(9);
    }
  };

  // Добавление заклинания в список заклинаний персонажа
  const addSpellToCharacter = (spell: SpellData) => {
    if (!character.spells) {
      character.spells = [];
    }
    
    // Проверяем, есть ли уже такое заклинание у персонажа
    const exists = character.spells.some(existingSpell => {
      if (typeof existingSpell === 'string') {
        return existingSpell === spell.name;
      } else {
        return existingSpell.name === spell.name;
      }
    });
    
    if (exists) {
      toast({
        title: 'Заклинание уже добавлено',
        description: `${spell.name} уже есть в списке заклинаний персонажа`,
        variant: 'destructive'
      });
      return;
    }
    
    // Создаем объект заклинания персонажа
    const characterSpell: CharacterSpell = {
      id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime,
      range: spell.range,
      components: spell.components,
      duration: spell.duration,
      description: spell.description,
      classes: spell.classes,
      ritual: spell.ritual,
      concentration: spell.concentration,
      verbal: spell.verbal,
      somatic: spell.somatic,
      material: spell.material,
      materials: spell.materials,
      prepared: spell.level === 0 || character.class.toLowerCase() === 'колдун' || character.class.toLowerCase() === 'warlock',
      source: spell.source
    };
    
    // Добавляем заклинание
    const updatedSpells = [...character.spells, characterSpell];
    onUpdate({ spells: updatedSpells });
    
    toast({
      title: 'Заклинание добавлено',
      description: `${spell.name} добавлено в список заклинаний`,
    });
  };
  
  // Открытие модального окна с деталями заклинания
  const handleOpenDetails = (spell: SpellData) => {
    setSelectedSpell(spell);
    setDetailsOpen(true);
  };

  // Показывает название уровня заклинания
  const getSpellLevelName = (level: number) => {
    if (level === 0) return 'Заговор';
    return `${level} уровень`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выбор заклинаний</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Поиск заклинаний..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpells.filter(spell => spell.level <= maxLevel).map(spell => (
              <div 
                key={spell.id} 
                className="border rounded-md p-3 hover:bg-accent/20 cursor-pointer"
                onClick={() => handleOpenDetails(spell)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{spell.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getSpellLevelName(spell.level)} • {spell.school}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation(); // Предотвращаем открытие деталей
                      addSpellToCharacter(spell);
                    }}
                  >
                    Добавить
                  </Button>
                </div>
                <p className="text-xs mt-2 text-muted-foreground truncate">
                  {typeof spell.description === 'string' 
                    ? spell.description.substring(0, 100) + (spell.description.length > 100 ? '...' : '') 
                    : Array.isArray(spell.description) && spell.description.length > 0 
                      ? spell.description[0].substring(0, 100) + (spell.description[0].length > 100 ? '...' : '')
                      : 'Нет описания'}
                </p>
              </div>
            ))}
            
            {filteredSpells.filter(spell => spell.level <= maxLevel).length === 0 && (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                Нет заклинаний, соответствующих поисковому запросу
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      
      {selectedSpell && (
        <SpellDetailModal 
          spell={selectedSpell}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          currentTheme={currentTheme}
        />
      )}
    </Dialog>
  );
};

export default SpellSelectionModal;
