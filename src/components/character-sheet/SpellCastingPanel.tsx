import React, { useState, useEffect } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character, CharacterSpell } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import SpellSlotManager from './SpellSlotManager';

interface SpellCastingPanelProps {
  character?: Character;
}

const SpellCastingPanel: React.FC<SpellCastingPanelProps> = ({ character: propCharacter }) => {
  const { character: contextCharacter, updateCharacter, onUpdate } = useCharacter();
  const { theme } = useTheme();
  const { toast } = useToast();
  
  const character = propCharacter || contextCharacter;
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [spellsByLevel, setSpellsByLevel] = useState<Record<number, CharacterSpell[]>>({});
  const [spellDialogOpen, setSpellDialogOpen] = useState(false);
  
  // Группируем заклинания по уровням
  useEffect(() => {
    if (character?.spells && Array.isArray(character.spells)) {
      const grouped: Record<number, CharacterSpell[]> = {};
      
      character.spells.forEach(spell => {
        if (typeof spell === 'string') {
          // Если заклинание представлено строкой, создаем минимальный объект
          const basicSpell: CharacterSpell = {
            name: spell,
            level: 0, // По умолчанию считаем заговором
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
    }
  }, [character?.spells]);
  
  // Обработчик выбора заклинания для просмотра/использования
  const handleSelectSpell = (spell: CharacterSpell) => {
    setSelectedSpell(spell);
    setSpellDialogOpen(true);
  };
  
  // Обработчик использования заклинания
  const handleCastSpell = (level: number) => {
    if (!character || !selectedSpell) return;
    
    // Проверяем наличие ячеек заклинаний выбранного уровня
    const spellSlots = character.spellSlots;
    
    if (!spellSlots || !spellSlots[level]) {
      toast({
        title: "Невозможно использовать заклинание",
        description: `У вас нет ячеек заклинаний ${level} уровня.`,
        variant: "destructive"
      });
      return;
    }
    
    // Проверяем, есть ли доступные ячейки
    if (spellSlots[level].used >= spellSlots[level].max) {
      toast({
        title: "Невозможно использовать заклинание",
        description: `У вас закончились ячейки заклинаний ${level} уровня.`,
        variant: "destructive"
      });
      return;
    }
    
    // Используем ячейку заклинания
    const newSpellSlots = { ...character.spellSlots };
    newSpellSlots[level].used++;
    
    // Обновляем персонажа
    updateSpellSlots(newSpellSlots);
    
    // Сообщаем об использовании заклинания
    toast({
      title: `Заклинание ${selectedSpell.name} использовано`,
      description: `Использована ячейка заклинаний ${level} уровня.`,
    });
    
    // Закрываем диалог
    setSpellDialogOpen(false);
  };
  
  // Обработчик обновления характеристики для заклинаний
  const handleAbilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAbility = e.target.value;
    const currentChar = character;
    
    if (!currentChar || !currentChar.spellcasting) {
      return;
    }
    
    // Создаем копию спеллкастинг-объекта с новой характеристикой
    const updatedSpellcasting = {
      ...currentChar.spellcasting,
      ability: newAbility
    };
    
    // Обновляем персонажа с новым спеллкастинг-объектом
    const updatedCharacter = {
      ...currentChar,
      spellcasting: updatedSpellcasting
    };
    
    updateCharacter(updatedCharacter);
  };
  
  // Обработчик сброса слотов заклинаний после короткого отдыха
  const handleResetAfterShortRest = () => {
    const currentChar = character;
    
    if (!currentChar) return;
    
    // Магический архетип воина, колдун и некоторые другие классы восстанавливают слоты после короткого отдыха
    if (['колдун', 'warlock'].includes(currentChar.class?.toLowerCase() || '')) {
      const updatedCharacter = { ...currentChar };
      
      if (!updatedCharacter.spellSlots) {
        updatedCharacter.spellSlots = {};
      }
      
      // Сбрасываем использованные слоты
      Object.keys(updatedCharacter.spellSlots).forEach(level => {
        if (parseInt(level) <= 9) {
          updatedCharacter.spellSlots[parseInt(level)] = {
            ...updatedCharacter.spellSlots[parseInt(level)],
            used: 0
          };
        }
      });
      
      // Используем onUpdate вместо updateCharacter
      onUpdate(updatedCharacter);
      toast({
        title: "Слоты заклинаний восстановлены",
        description: `Восстановлены слоты заклинаний для ${currentChar.name}`,
      });
    }
  };
  
  // Проверяем, является ли класс магическим
  const isMagicClass = () => {
    if (!character?.class) return false;
    
    const magicClasses = ['жрец', 'волшебник', 'бард', 'друид', 'колдун', 'чародей', 'паладин', 'следопыт', 'изобретатель'];
    return magicClasses.includes(character.class.toLowerCase());
  };
  
  // Если персонаж не является заклинателем, не отображаем панель
  if (!character || !isMagicClass() || !character.spells || character.spells.length === 0) {
    return null;
  }
  
  return (
    <Card className="mb-4 border-accent/30" style={{ backgroundColor: currentTheme.cardBackground }}>
      <CardHeader>
        <CardTitle style={{ color: currentTheme.textColor }}>Книга заклинаний</CardTitle>
      </CardHeader>
      <CardContent>
        <SpellSlotManager character={character} showTitle={false} />
        
        <div className="mt-4">
          {/* Отображаем заклинания, сгруппированные по уровню */}
          {Object.keys(spellsByLevel)
            .map(Number)
            .sort((a, b) => a - b)
            .map(level => (
              <div key={`spell-level-${level}`} className="mb-4">
                <h4 className="text-lg font-semibold mb-2" style={{ color: currentTheme.textColor }}>
                  {level === 0 ? 'Заговоры' : `Заклинания ${level} уровня`}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {spellsByLevel[level].map((spell, index) => (
                    <Card 
                      key={`spell-${level}-${index}`}
                      className="p-2 cursor-pointer hover:border-accent transition-all"
                      style={{ 
                        backgroundColor: currentTheme.background,
                        borderColor: spell.prepared ? currentTheme.accent : currentTheme.cardBackground
                      }}
                      onClick={() => handleSelectSpell(spell)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium" style={{ color: currentTheme.textColor }}>
                          {spell.name}
                        </span>
                        {spell.prepared && (
                          <span className="text-xs px-1 rounded-sm" style={{ backgroundColor: currentTheme.accent + '30', color: currentTheme.accent }}>
                            Подготовлено
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground" style={{ color: currentTheme.mutedTextColor }}>
                        {spell.school || 'Универсальная'}, {spell.castingTime || '1 действие'}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
      
      {/* Диалог для просмотра и использования заклинания */}
      <Dialog open={spellDialogOpen} onOpenChange={setSpellDialogOpen}>
        <DialogContent style={{ backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor }}>
          <DialogHeader>
            <DialogTitle style={{ color: currentTheme.accent }}>{selectedSpell?.name}</DialogTitle>
          </DialogHeader>
          
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-accent/20 rounded-sm text-xs">
                {selectedSpell?.level === 0 ? 'Заговор' : `${selectedSpell?.level} уровень`}
              </span>
              {selectedSpell?.school && (
                <span className="px-2 py-1 bg-accent/20 rounded-sm text-xs">
                  {selectedSpell.school}
                </span>
              )}
              {selectedSpell?.ritual && (
                <span className="px-2 py-1 bg-accent/20 rounded-sm text-xs">
                  Ритуал
                </span>
              )}
              {selectedSpell?.concentration && (
                <span className="px-2 py-1 bg-accent/20 rounded-sm text-xs">
                  Концентрация
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div>
                <strong>Время накладывания:</strong> {selectedSpell?.castingTime || '1 действие'}
              </div>
              <div>
                <strong>Дистанция:</strong> {selectedSpell?.range || 'На себя'}
              </div>
              <div>
                <strong>Компоненты:</strong> {selectedSpell?.components || 'В, С'}
              </div>
              <div>
                <strong>Длительность:</strong> {selectedSpell?.duration || 'Мгновенная'}
              </div>
            </div>
            
            <ScrollArea className="h-[200px] mb-4">
              <div className="text-sm whitespace-pre-line">
                {typeof selectedSpell?.description === 'string' 
                  ? selectedSpell.description 
                  : Array.isArray(selectedSpell?.description) 
                    ? selectedSpell.description.join('\n\n') 
                    : 'Описание отсутствует'}
              </div>
            </ScrollArea>
            
            {/* Кнопки использования заклинания для разных уровней ячеек */}
            {selectedSpell && selectedSpell.level > 0 && character.spellSlots && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Использовать заклинание:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(character.spellSlots)
                    .map(Number)
                    .filter(slotLevel => slotLevel >= selectedSpell.level)
                    .map(slotLevel => {
                      const slot = character.spellSlots![slotLevel];
                      const remainingSlots = slot.max - slot.used;
                      
                      return (
                        <Button
                          key={`cast-level-${slotLevel}`}
                          variant="outline"
                          disabled={remainingSlots <= 0}
                          onClick={() => handleCastSpell(slotLevel)}
                          style={{ 
                            borderColor: currentTheme.accent,
                            color: remainingSlots > 0 ? currentTheme.accent : currentTheme.mutedTextColor
                          }}
                        >
                          {slotLevel} уровень ({remainingSlots}/{slot.max})
                        </Button>
                      );
                    })}
                </div>
              </div>
            )}
            
            {/* Для заговоров просто кнопка использования */}
            {selectedSpell && selectedSpell.level === 0 && (
              <div className="mt-4">
                <Button 
                  onClick={() => {
                    toast({
                      title: `Заклинание ${selectedSpell.name} использовано`,
                      description: `Заговор не расходует ячейки заклинаний.`,
                    });
                    setSpellDialogOpen(false);
                  }}
                  style={{ 
                    backgroundColor: currentTheme.accent,
                    color: currentTheme.cardBackground
                  }}
                >
                  Использовать заговор
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// Fix the updateCharacter calls that use partial characters
const updateSpellSlots = (slots: any) => {
  if (character) {
    const updatedCharacter = { ...character, spellSlots: slots };
    updateCharacter(updatedCharacter);
  }
};

export default SpellCastingPanel;
