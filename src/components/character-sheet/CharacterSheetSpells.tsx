
import React, { useState, useEffect } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character, CharacterSpell } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { canPrepareMoreSpells, getPreparedSpellsLimit } from '@/utils/spellUtils';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { ChevronDown, ChevronUp, BookOpen, Star } from 'lucide-react';
import SpellCastingPanel from './SpellCastingPanel';
import SpellSlotManager from './SpellSlotManager';
import { safeToString } from '@/utils/stringUtils';

interface CharacterSheetSpellsProps {
  character?: Character;
}

const CharacterSheetSpells: React.FC<CharacterSheetSpellsProps> = ({ character: propCharacter }) => {
  const { character: contextCharacter, updateCharacter } = useCharacter();
  const { theme } = useTheme();
  
  const character = propCharacter || contextCharacter;
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [spellsByLevel, setSpellsByLevel] = useState<Record<number, CharacterSpell[]>>({});
  const [expandedLevels, setExpandedLevels] = useState<number[]>([]);
  
  // Группируем заклинания по уровням
  useEffect(() => {
    if (character?.spells && Array.isArray(character.spells)) {
      const grouped: Record<number, CharacterSpell[]> = {};
      
      character.spells.forEach(spell => {
        if (typeof spell === 'string') {
          // Если заклинание представлено строкой, создаем минимальный объект
          const basicSpell: CharacterSpell = {
            id: `spell-${safeToString(spell).toLowerCase().replace(/\s+/g, '-')}`,
            name: spell,
            level: 0,
            school: 'Универсальная',
            prepared: true
          };
          
          grouped[0] = [...(grouped[0] || []), basicSpell];
        } else {
          // Работаем с объектом заклинания
          const level = spell.level || 0;
          grouped[level] = [...(grouped[level] || []), spell];
        }
      });
      
      // Сортируем заклинания внутри каждого уровня по имени
      Object.keys(grouped).forEach(level => {
        grouped[Number(level)].sort((a, b) => a.name.localeCompare(b.name));
      });
      
      setSpellsByLevel(grouped);
      
      // По умолчанию разворачиваем уровень заговоров
      if (!expandedLevels.includes(0) && grouped[0]) {
        setExpandedLevels([0]);
      }
    }
  }, [character?.spells]);
  
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
    // Проверяем, можно ли подготовить еще заклинаний
    if (!spell.prepared && !canPrepareMoreSpells(character)) {
      return; // Достигнут лимит подготовленных заклинаний
    }
    
    // Обновляем состояние подготовки заклинания
    if (character && character.spells) {
      const updatedSpells = character.spells.map(s => {
        if (typeof s === 'string') {
          return {
            id: `spell-${safeToString(s).toLowerCase().replace(/\s+/g, '-')}`,
            name: s,
            level: 0,
            school: 'Универсальная',
            prepared: false
          };
        }
        
        if (s.id === spell.id) {
          return { ...s, prepared: !s.prepared };
        }
        return s;
      });
      
      updateCharacter({ spells: updatedSpells });
    }
  };
  
  // Проверяем, является ли класс заклинателем, который должен готовить заклинания
  const needsPreparation = () => {
    if (!character || !character.class) return false;
    
    const preparingClasses = ['жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard', 'паладин', 'paladin', 'следопыт', 'ranger', 'изобретатель', 'artificer'];
    return preparingClasses.includes(safeToString(character.class).toLowerCase());
  };
  
  // Проверяем, является ли класс магическим
  const isMagicClass = () => {
    if (!character?.class) return false;
    
    const magicClasses = ['жрец', 'волшебник', 'бард', 'друид', 'колдун', 'чародей', 'паладин', 'следопыт', 'изобретатель',
                        'cleric', 'wizard', 'bard', 'druid', 'warlock', 'sorcerer', 'paladin', 'ranger', 'artificer'];
    return magicClasses.includes(safeToString(character.class).toLowerCase());
  };
  
  // Если у персонажа нет заклинаний или он не заклинатель, не отображаем компонент
  if (!character || !isMagicClass() || !character.spells || character.spells.length === 0) {
    return null;
  }
  
  // Получаем лимит подготовленных заклинаний
  const preparedLimit = needsPreparation() ? getPreparedSpellsLimit(character) : 0;
  
  // Счетчик текущих подготовленных заклинаний
  const preparedCount = character.spells
    .filter(spell => typeof spell !== 'string' && spell.prepared && spell.level > 0)
    .length;
  
  return (
    <div className="space-y-4">
      {/* Панель использования заклинаний */}
      <SpellCastingPanel character={character} />
      
      {/* Панель ячеек заклинаний */}
      <SpellSlotManager character={character} />
      
      {/* Информация о подготовке заклинаний */}
      {needsPreparation() && (
        <Card className="border-accent/30 mb-4" style={{ backgroundColor: currentTheme.cardBackground }}>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <span style={{ color: currentTheme.textColor }}>Подготовленные заклинания</span>
              <Badge 
                style={{ 
                  backgroundColor: preparedCount >= preparedLimit ? currentTheme.accent : 'transparent',
                  color: preparedCount >= preparedLimit ? 'white' : currentTheme.accent,
                  borderColor: currentTheme.accent
                }}
                variant={preparedCount >= preparedLimit ? "default" : "outline"}
              >
                {preparedCount}/{preparedLimit}
              </Badge>
            </div>
            <p className="text-sm" style={{ color: currentTheme.mutedTextColor }}>
              {character.class === 'Волшебник' || character.class === 'Wizard' 
                ? 'Волшебник должен готовить заклинания после отдыха, выбирая из своей книги заклинаний.'
                : 'Выберите заклинания, которые вы хотите подготовить после отдыха.'}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Список заклинаний по уровням */}
      {Object.keys(spellsByLevel)
        .map(Number)
        .sort((a, b) => a - b)
        .map(level => (
          <Card 
            key={`spell-level-${level}`} 
            className="border-accent/30" 
            style={{ backgroundColor: currentTheme.cardBackground }}
          >
            <div 
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleLevelExpansion(level)}
              style={{ color: currentTheme.textColor }}
            >
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {level === 0 ? 'Заговоры' : `Заклинания ${level} уровня`}
                </span>
                <Badge className="ml-2" variant="outline" style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}>
                  {spellsByLevel[level].length}
                </Badge>
              </div>
              {expandedLevels.includes(level) ? (
                <ChevronUp className="w-5 h-5" style={{ color: currentTheme.accent }} />
              ) : (
                <ChevronDown className="w-5 h-5" style={{ color: currentTheme.accent }} />
              )}
            </div>
            
            {expandedLevels.includes(level) && (
              <CardContent>
                <div className="space-y-2">
                  {spellsByLevel[level].map((spell, index) => (
                    <React.Fragment key={`spell-${level}-${index}`}>
                      {index > 0 && <Separator className="my-1" />}
                      <div className="flex justify-between items-center py-1">
                        <div>
                          <div className="font-medium" style={{ color: currentTheme.textColor }}>
                            {spell.name}
                          </div>
                          <div className="text-xs" style={{ color: currentTheme.mutedTextColor }}>
                            {spell.school || 'Универсальная'}
                            {spell.ritual && ', Ритуал'}
                            {spell.concentration && ', Концентрация'}
                          </div>
                        </div>
                        {needsPreparation() && level > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSpellPreparation(spell);
                            }}
                            className={`p-1 ${spell.prepared ? 'bg-primary/20' : ''}`}
                          >
                            <Star className={`h-4 w-4 ${spell.prepared ? 'fill-primary' : ''}`} />
                          </Button>
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
    </div>
  );
};

export default CharacterSheetSpells;
