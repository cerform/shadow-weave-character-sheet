
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { getAllSpells } from '@/data/spells';
import { normalizeSpells, canPrepareMoreSpells } from '@/utils/spellUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { safeToString } from '@/utils/stringUtils';

interface SpellSelectionModalProps {
  character: Character;
  onClose: () => void;
  onSave: (spells: CharacterSpell[]) => void;
  buttonText?: string;
  triggerButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  character,
  onClose,
  onSave,
  buttonText = "Выбрать заклинания",
  triggerButtonVariant = "default"
}) => {
  const [allSpells, setAllSpells] = useState<SpellData[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [open, setOpen] = useState(false);

  // Загружаем все заклинания и инициализируем выбранные
  useEffect(() => {
    // Получаем все заклинания из данных
    const spells = getAllSpells();
    setAllSpells(spells);
    
    // Инициализируем выбранные заклинания из персонажа
    if (character && character.spells) {
      const characterSpells = normalizeSpells(character);
      // Convert to SpellData for consistent state management
      const convertedSpells = characterSpells.map(spell => ({
        id: spell.id || `spell-${safeToString(spell.name).toLowerCase().replace(/\s+/g, '-')}`,
        name: spell.name,
        level: spell.level || 0,
        school: spell.school || 'Универсальная',
        castingTime: spell.castingTime || '1 действие',
        range: spell.range || 'На себя',
        components: spell.components || '',
        duration: spell.duration || 'Мгновенная',
        description: spell.description || '',
        prepared: spell.prepared || false,
        classes: spell.classes,
        ritual: spell.ritual,
        concentration: spell.concentration,
        verbal: spell.verbal,
        somatic: spell.somatic,
        material: spell.material,
        materials: spell.materials,
        source: spell.source
      } as SpellData));
      
      setSelectedSpells(convertedSpells);
    }
  }, [character]);

  // Фильтрация заклинаний
  const filteredSpells = React.useMemo(() => {
    let filtered = allSpells;
    
    // Фильтр по поисковому запросу
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(spell => {
        const nameMatch = safeToString(spell.name).toLowerCase().includes(searchLower);
        const schoolMatch = safeToString(spell.school).toLowerCase().includes(searchLower);
        let descMatch = false;
        
        if (typeof spell.description === 'string') {
          descMatch = spell.description.toLowerCase().includes(searchLower);
        } else if (Array.isArray(spell.description)) {
          descMatch = spell.description.join(' ').toLowerCase().includes(searchLower);
        }
        
        return nameMatch || schoolMatch || descMatch;
      });
    }
    
    // Фильтр по уровню (вкладке)
    if (activeTab !== 'all') {
      const level = activeTab === 'cantrips' ? 0 : parseInt(activeTab, 10);
      filtered = filtered.filter(spell => spell.level === level);
    }
    
    // Фильтр по классу персонажа
    if (character.class) {
      const characterClass = safeToString(character.class).toLowerCase();
      filtered = filtered.filter(spell => {
        if (Array.isArray(spell.classes)) {
          return spell.classes.some(c => safeToString(c).toLowerCase().includes(characterClass));
        }
        if (typeof spell.classes === 'string') {
          return safeToString(spell.classes).toLowerCase().includes(characterClass);
        }
        return false;
      });
    }
    
    return filtered;
  }, [allSpells, searchTerm, activeTab, character.class]);

  // Проверяем, выбрано ли заклинание
  const isSelected = (spellId: string) => {
    return selectedSpells.some(s => String(s.id) === String(spellId));
  };

  // Добавление или удаление заклинания
  const toggleSpell = (spell: SpellData) => {
    const isAlreadySelected = isSelected(spell.id);
    
    if (isAlreadySelected) {
      setSelectedSpells(selectedSpells.filter(s => String(s.id) !== String(spell.id)));
    } else {
      // Check if the character can prepare more spells
      if (spell.level > 0 && !canPrepareMoreSpells(character)) {
        // If limit reached, just add without marking as prepared
        setSelectedSpells([...selectedSpells, { ...spell, prepared: false }]);
      } else {
        setSelectedSpells([...selectedSpells, { ...spell, prepared: true }]);
      }
    }
  };

  // Сохранение изменений
  const handleSave = () => {
    // Convert back to CharacterSpell[]
    const characterSpells: CharacterSpell[] = selectedSpells.map(spell => ({
      id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime,
      range: spell.range,
      components: spell.components,
      duration: spell.duration,
      description: spell.description,
      prepared: spell.prepared || false,
      classes: spell.classes,
      ritual: spell.ritual,
      concentration: spell.concentration,
      verbal: spell.verbal,
      somatic: spell.somatic,
      material: spell.material,
      materials: spell.materials,
      source: spell.source
    }));
    
    onSave(characterSpells);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerButtonVariant}>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Выбор заклинаний для {character.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <Input
            placeholder="Поиск заклинаний..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4 grid grid-cols-6 gap-2">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
            <TabsTrigger value="1">1 ур.</TabsTrigger>
            <TabsTrigger value="2">2 ур.</TabsTrigger>
            <TabsTrigger value="3">3 ур.</TabsTrigger>
            <TabsTrigger value="4">4+ ур.</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
              {filteredSpells.length > 0 ? filteredSpells.map(spell => (
                <div
                  key={spell.id}
                  className={`border p-2 rounded cursor-pointer ${
                    isSelected(spell.id) ? 'border-primary bg-primary/10' : ''
                  }`}
                  onClick={() => toggleSpell(spell)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{spell.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {spell.school}, {spell.level === 0 ? "Заговор" : `${spell.level} уровень`}
                      </div>
                    </div>
                    <Checkbox checked={isSelected(spell.id)} />
                  </div>
                </div>
              )) : (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  Нет заклинаний, соответствующих критериям поиска
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <Badge variant="outline">
              Выбрано: {selectedSpells.length}
            </Badge>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellSelectionModal;
