
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useCharacter } from '@/contexts/CharacterContext';
import { calculateAvailableSpellsByClassAndLevel } from '@/utils/spellUtils';
import { getAllSpells } from '@/data/spells';
import { toast } from '@/hooks/use-toast';
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import SpellDetailModal from '@/components/spell-detail/SpellDetailModal';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Loader2, Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SpellSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSpellsSelected: (spells: CharacterSpell[]) => void;
  selectedSpells: CharacterSpell[];
}

export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
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
    source: spell.source,
    prepared: true,
  };
};

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  open,
  onClose,
  onSpellsSelected,
  selectedSpells = []
}) => {
  const { character } = useCharacter();
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpellIds, setSelectedSpellIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [detailSpell, setDetailSpell] = useState<SpellData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Загрузка заклинаний при открытии модального окна
  useEffect(() => {
    if (open) {
      setLoading(true);
      
      // Устанавливаем выбранные заклинания
      const newSelectedSpellIds = new Set<string>();
      selectedSpells.forEach(spell => {
        const id = spell.id?.toString() || `${spell.name}-${spell.level}`;
        newSelectedSpellIds.add(id);
      });
      setSelectedSpellIds(newSelectedSpellIds);

      // Загружаем доступные заклинания
      try {
        const allSpells = getAllSpells();
        
        // Если персонаж существует и у него есть класс, фильтруем заклинания
        if (character && character.class) {
          const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(character.class, character.level || 1);
          
          const characterClass = character.class.toLowerCase();
          const filteredSpells = allSpells.filter(spell => {
            // Проверяем, подходит ли заклинание для класса персонажа
            let isForClass = false;
            if (typeof spell.classes === 'string') {
              isForClass = spell.classes.toLowerCase().includes(characterClass);
            } else if (Array.isArray(spell.classes)) {
              isForClass = spell.classes.some(cls => 
                typeof cls === 'string' && cls.toLowerCase().includes(characterClass)
              );
            }

            // Проверяем уровень заклинания
            const isLevelAvailable = spell.level <= maxSpellLevel;
            
            return isForClass && isLevelAvailable;
          });
          
          setAvailableSpells(filteredSpells);
          setFilteredSpells(filteredSpells);
        } else {
          // Если персонажа нет или у него нет класса, показываем все заклинания
          setAvailableSpells(allSpells);
          setFilteredSpells(allSpells);
        }
      } catch (error) {
        console.error("Ошибка загрузки заклинаний:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить заклинания",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  }, [open, character, selectedSpells]);

  // Обработка изменений фильтров
  useEffect(() => {
    // Если нет доступных заклинаний, пропускаем
    if (!availableSpells.length) return;
    
    let filtered = [...availableSpells];
    
    // Фильтр по поисковому запросу
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(spell => 
        spell.name.toLowerCase().includes(searchLower) ||
        (typeof spell.description === 'string' && spell.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Фильтр по уровню
    if (levelFilter !== null) {
      filtered = filtered.filter(spell => spell.level === levelFilter);
    }
    
    // Фильтр по школе
    if (schoolFilter) {
      filtered = filtered.filter(spell => spell.school === schoolFilter);
    }
    
    setFilteredSpells(filtered);
  }, [availableSpells, searchTerm, levelFilter, schoolFilter]);

  // Обработчик выбора заклинания
  const handleSpellToggle = (spellId: string) => {
    const newSelectedSpellIds = new Set(selectedSpellIds);
    
    if (newSelectedSpellIds.has(spellId)) {
      newSelectedSpellIds.delete(spellId);
    } else {
      newSelectedSpellIds.add(spellId);
    }
    
    setSelectedSpellIds(newSelectedSpellIds);
  };

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setSearchTerm('');
    setLevelFilter(null);
    setSchoolFilter(null);
  };

  // Обработчик сохранения выбранных заклинаний
  const handleSave = () => {
    const selectedSpellsList = availableSpells
      .filter(spell => selectedSpellIds.has(spell.id.toString()))
      .map(spell => convertSpellDataToCharacterSpell(spell));
    
    onSpellsSelected(selectedSpellsList);
    onClose();
  };

  // Получение уникальных школ магии для фильтра
  const availableSchools = Array.from(new Set(availableSpells.map(spell => spell.school))).sort();
  
  // Получение уникальных уровней заклинаний для фильтра
  const availableLevels = Array.from(new Set(availableSpells.map(spell => spell.level))).sort((a, b) => a - b);

  // Обработчик просмотра детальной информации о заклинании
  const handleViewSpellDetails = (spell: SpellData) => {
    setDetailSpell(spell);
    setShowDetailModal(true);
  };

  // Обработчик закрытия модального окна с деталями заклинания
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
  };

  // Обработчик добавления заклинания из модального окна деталей
  const handleAddSpellFromDetail = (spell: SpellData) => {
    const spellId = spell.id.toString();
    const newSelectedSpellIds = new Set(selectedSpellIds);
    newSelectedSpellIds.add(spellId);
    setSelectedSpellIds(newSelectedSpellIds);
    setShowDetailModal(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose} modal={true}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Выбор заклинаний</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 overflow-hidden">
            {/* Фильтры */}
            <div className="flex flex-col md:flex-row gap-3 p-2 border rounded-md">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск заклинаний..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={levelFilter?.toString() || ''} onValueChange={(value) => setLevelFilter(value ? parseInt(value) : null)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все уровни</SelectItem>
                  {availableLevels.map(level => (
                    <SelectItem key={`level-${level}`} value={level.toString()}>
                      {level === 0 ? "Заговор" : `${level} уровень`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={schoolFilter || ''} onValueChange={(value) => setSchoolFilter(value || null)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Школа магии" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все школы</SelectItem>
                  {availableSchools.map(school => (
                    <SelectItem key={`school-${school}`} value={school}>{school}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                <Filter className="h-4 w-4 mr-1" />
                Сбросить
              </Button>
            </div>
            
            {/* Список заклинаний */}
            <div className="flex-grow overflow-auto min-h-[400px] max-h-[50vh]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Загрузка заклинаний...</span>
                </div>
              ) : filteredSpells.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  Заклинания не найдены. Попробуйте изменить фильтры.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredSpells.map(spell => (
                    <div 
                      key={spell.id} 
                      className="p-3 border rounded-md flex items-start gap-3 cursor-pointer hover:bg-muted/30"
                      style={{
                        borderColor: selectedSpellIds.has(spell.id.toString()) ? currentTheme.accent : ''
                      }}
                    >
                      <Checkbox 
                        id={`spell-${spell.id}`}
                        checked={selectedSpellIds.has(spell.id.toString())}
                        onCheckedChange={() => handleSpellToggle(spell.id.toString())}
                      />
                      <div className="flex-grow" onClick={() => handleViewSpellDetails(spell)}>
                        <div className="flex justify-between">
                          <label 
                            htmlFor={`spell-${spell.id}`}
                            className="font-medium text-base cursor-pointer"
                          >
                            {spell.name}
                          </label>
                          <Badge variant="outline">
                            {spell.level === 0 ? "Заговор" : `${spell.level} ур.`}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {spell.school}
                          {spell.ritual && " (Ритуал)"}
                          {spell.concentration && " (Концентрация)"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Кнопки */}
            <div className="flex justify-between pt-4 border-t">
              <div>
                Выбрано заклинаний: {selectedSpellIds.size}
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={onClose}>Отмена</Button>
                <Button onClick={handleSave}>Сохранить</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модальное окно с деталями заклинания */}
      <SpellDetailModal 
        spell={detailSpell} 
        open={showDetailModal} 
        onClose={handleCloseDetailModal}
        currentTheme={currentTheme}
        showAddButton={true}
        onAddSpell={handleAddSpellFromDetail}
        alreadyAdded={detailSpell ? selectedSpellIds.has(detailSpell.id.toString()) : false}
      />
    </>
  );
};

export default SpellSelectionModal;
