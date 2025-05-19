
import React, { useState, useEffect } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character, CharacterSpell } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Search, Plus } from 'lucide-react';
import { getAbilityModifier, calculateProficiencyBonus } from '@/utils/characterUtils';
import { canPrepareMoreSpells, getPreparedSpellsLimit } from '@/utils/spellUtils';
import SpellSelectionModal from '../SpellSelectionModal';
import SpellDetailModal from '../../spell-detail/SpellDetailModal';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';

interface SpellsTabProps {
  character: Character;
}

const SpellsTab: React.FC<SpellsTabProps> = ({ character }) => {
  const { updateCharacter } = useCharacter();
  
  // Состояния для отображения заклинаний
  const [spellsByLevel, setSpellsByLevel] = useState<Record<number, CharacterSpell[]>>({});
  const [expandedLevels, setExpandedLevels] = useState<number[]>([0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Состояния для модальных окон
  const [isSpellSelectionOpen, setIsSpellSelectionOpen] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isSpellDetailOpen, setIsSpellDetailOpen] = useState(false);
  
  // Состояние для заклинательной способности
  const [spellcastingAbility, setSpellcastingAbility] = useState('wisdom');
  const [saveDC, setSaveDC] = useState(10);
  const [attackBonus, setAttackBonus] = useState(0);
  
  // Группируем заклинания по уровням при изменении персонажа или поиске
  useEffect(() => {
    if (!character.spells || !Array.isArray(character.spells)) {
      setSpellsByLevel({});
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const grouped: Record<number, CharacterSpell[]> = {};
    
    character.spells.forEach(spell => {
      if (typeof spell === 'string') {
        // Если заклинание представлено строкой, пропускаем (нужен объект для поиска)
        return;
      }
      
      // Фильтрация по поисковому запросу
      if (searchTerm && !spell.name.toLowerCase().includes(searchTermLower)) {
        return;
      }
      
      const level = spell.level || 0;
      grouped[level] = [...(grouped[level] || []), spell];
    });
    
    // Сортируем заклинания внутри каждого уровня по имени
    Object.keys(grouped).forEach(level => {
      grouped[Number(level)].sort((a, b) => {
        // Сначала сортируем подготовленные, затем по имени
        if (a.prepared !== b.prepared) {
          return a.prepared ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    });
    
    setSpellsByLevel(grouped);
    
  }, [character.spells, searchTerm]);
  
  // Обработчик переключения развернутости уровня заклинаний
  const toggleLevelExpansion = (level: number) => {
    setExpandedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };
  
  // Обработчик переключения подготовки заклинания
  const toggleSpellPreparation = (spell: CharacterSpell) => {
    if (!character.spells) return;
    
    // Проверяем, можно ли подготовить еще заклинаний
    if (!spell.prepared && !canPrepareMoreSpells(character)) {
      return; // Достигнут лимит подготовленных заклинаний
    }
    
    // Обновляем состояние подготовки заклинания
    const updatedSpells = character.spells.map(s => {
      if (typeof s === 'string') return s;
      
      if (s.name === spell.name && s.level === spell.level) {
        return { ...s, prepared: !s.prepared };
      }
      return s;
    });
    
    updateCharacter({ spells: updatedSpells });
  };
  
  // Обработчик открытия подробностей о заклинании
  const openSpellDetail = (spell: CharacterSpell) => {
    setSelectedSpell(convertCharacterSpellToSpellData(spell));
    setIsSpellDetailOpen(true);
  };
  
  // Обработчик для удаления заклинания
  const removeSpell = (spell: CharacterSpell) => {
    if (!character.spells) return;
    
    const updatedSpells = character.spells.filter(s => {
      if (typeof s === 'string') return s !== spell.name;
      return !(s.name === spell.name && s.level === spell.level);
    });
    
    updateCharacter({ spells: updatedSpells });
  };
  
  // Определяем, является ли класс заклинателем
  const needsPreparation = () => {
    if (!character.class) return false;
    
    const preparingClasses = ['жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard', 'паладин', 'paladin', 'следопыт', 'ranger', 'изобретатель', 'artificer'];
    return preparingClasses.includes(character.class.toLowerCase());
  };
  
  // Получаем модификатор заклинательной способности
  const getSpellcastingModifier = () => {
    const abilityMap: Record<string, keyof Character> = {
      strength: 'strength',
      dexterity: 'dexterity',
      constitution: 'constitution',
      intelligence: 'intelligence',
      wisdom: 'wisdom',
      charisma: 'charisma'
    };
    
    const abilityScore = character[abilityMap[spellcastingAbility]] as number || 10;
    return getAbilityModifier(abilityScore);
  };
  
  // Обновляем заклинательную способность
  const updateSpellcasting = () => {
    const modifier = getSpellcastingModifier();
    const profBonus = calculateProficiencyBonus(character.level);
    const newSaveDC = 8 + modifier + profBonus;
    const newAttackBonus = modifier + profBonus;
    
    setSaveDC(newSaveDC);
    setAttackBonus(newAttackBonus);
    
    updateCharacter({
      spellcasting: {
        ability: spellcastingAbility,
        saveDC: newSaveDC,
        attackBonus: newAttackBonus,
        prepared: needsPreparation()
      }
    });
  };
  
  // Загружаем данные заклинаний при монтировании
  useEffect(() => {
    if (character.spellcasting) {
      setSpellcastingAbility(character.spellcasting.ability || getDefaultSpellcastingAbility());
      setSaveDC(character.spellcasting.saveDC || 10);
      setAttackBonus(character.spellcasting.attackBonus || 0);
    } else {
      // Устанавливаем значения по умолчанию
      const defaultAbility = getDefaultSpellcastingAbility();
      setSpellcastingAbility(defaultAbility);
      
      // Вычисляем значения
      setTimeout(() => updateSpellcasting(), 0);
    }
  }, [character.id]);
  
  // Получаем заклинательную способность по умолчанию в зависимости от класса
  const getDefaultSpellcastingAbility = () => {
    if (!character.class) return 'wisdom';
    
    const classLower = character.class.toLowerCase();
    if (['жрец', 'друид', 'следопыт', 'cleric', 'druid', 'ranger'].includes(classLower)) {
      return 'wisdom';
    }
    if (['волшебник', 'wizard', 'изобретатель', 'artificer'].includes(classLower)) {
      return 'intelligence';
    }
    return 'charisma'; // Бард, Чародей, Колдун, Паладин
  };
  
  // Получаем лимит подготовленных заклинаний
  const preparedLimit = needsPreparation() ? getPreparedSpellsLimit(character) : 0;
  
  // Счетчик текущих подготовленных заклинаний
  const preparedCount = character.spells
    ? character.spells.filter(spell => typeof spell !== 'string' && spell.prepared && spell.level > 0).length
    : 0;
  
  return (
    <div className="space-y-6">
      {/* Параметры заклинательной способности */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium mb-4">Параметры заклинаний</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="spellcasting-ability">Заклинательная способность</Label>
              <select
                id="spellcasting-ability"
                value={spellcastingAbility}
                onChange={(e) => setSpellcastingAbility(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              >
                <option value="strength">Сила</option>
                <option value="dexterity">Ловкость</option>
                <option value="constitution">Телосложение</option>
                <option value="intelligence">Интеллект</option>
                <option value="wisdom">Мудрость</option>
                <option value="charisma">Харизма</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="spell-save-dc">Сложность спасброска</Label>
              <Input
                id="spell-save-dc"
                type="number"
                value={saveDC}
                onChange={(e) => setSaveDC(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="spell-attack-bonus">Бонус атаки заклинанием</Label>
              <div className="flex items-center mt-1">
                <Input
                  id="spell-attack-bonus"
                  type="number"
                  value={attackBonus}
                  onChange={(e) => setAttackBonus(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <Button className="mt-4 w-full" onClick={updateSpellcasting}>
            Обновить параметры заклинаний
          </Button>
        </CardContent>
      </Card>
      
      {/* Поиск и добавление заклинаний */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск заклинаний..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Button onClick={() => setIsSpellSelectionOpen(true)} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> Добавить заклинания
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Информация о подготовке заклинаний */}
      {needsPreparation() && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span>Подготовленные заклинания</span>
              <Badge 
                variant={preparedCount >= preparedLimit ? "default" : "outline"}
              >
                {preparedCount}/{preparedLimit}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {character.class === 'Волшебник' || character.class === 'Wizard' 
                ? 'Волшебник должен готовить заклинания после отдыха, выбирая из своей книги заклинаний.'
                : 'Выберите заклинания, которые вы хотите подготовить после отдыха.'}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Список заклинаний по уровням */}
      {Object.keys(spellsByLevel).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">У вас пока нет заклинаний.</p>
            <Button onClick={() => setIsSpellSelectionOpen(true)} className="mt-4">
              Добавить заклинания
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.keys(spellsByLevel)
          .map(Number)
          .sort((a, b) => a - b)
          .map(level => (
            <Card key={`spell-level-${level}`}>
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleLevelExpansion(level)}
              >
                <div className="flex items-center">
                  <span className="font-medium">
                    {level === 0 ? 'Заговоры' : `Заклинания ${level} уровня`}
                  </span>
                  <Badge className="ml-2" variant="outline">
                    {spellsByLevel[level].length}
                  </Badge>
                </div>
                {expandedLevels.includes(level) ? (
                  <span className="text-lg">▼</span>
                ) : (
                  <span className="text-lg">▶</span>
                )}
              </div>
              
              {expandedLevels.includes(level) && (
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {spellsByLevel[level].map((spell, index) => (
                        <React.Fragment key={`spell-${level}-${index}`}>
                          {index > 0 && <Separator className="my-1" />}
                          <div className="flex justify-between items-center py-1">
                            <div 
                              className="flex-1 cursor-pointer" 
                              onClick={() => openSpellDetail(spell)}
                            >
                              <div className="font-medium">{spell.name}</div>
                              <div className="text-xs text-gray-500">
                                {spell.school || 'Универсальная'}
                                {spell.ritual && ', Ритуал'}
                                {spell.concentration && ', Концентрация'}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {/* Кнопка для переключения подготовки заклинания */}
                              {needsPreparation() && level > 0 && (
                                <Button
                                  variant={spell.prepared ? "default" : "outline"}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSpellPreparation(spell);
                                  }}
                                  disabled={!spell.prepared && preparedCount >= preparedLimit}
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {/* Кнопка для удаления заклинания */}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSpell(spell);
                                }}
                              >
                                Удалить
                              </Button>
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          ))
      )}
      
      {/* Модальное окно выбора заклинаний */}
      <SpellSelectionModal
        character={character}
        isOpen={isSpellSelectionOpen}
        onClose={() => setIsSpellSelectionOpen(false)}
      />
      
      {/* Модальное окно с подробностями о заклинании */}
      {selectedSpell && (
        <SpellDetailModal
          spell={selectedSpell}
          isOpen={isSpellDetailOpen}
          onClose={() => setIsSpellDetailOpen(false)}
        />
      )}
    </div>
  );
};

export default SpellsTab;
