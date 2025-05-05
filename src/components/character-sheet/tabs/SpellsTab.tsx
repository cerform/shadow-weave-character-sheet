
import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { SpellData } from '@/types/spells';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Trash2 } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import SpellSelectionModal from '../SpellSelectionModal'; // Changed to default import
import { SpellSlotsPopover } from '../SpellSlotsPopover';

interface SpellsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const SpellsTab: React.FC<SpellsTabProps> = ({ character, onUpdate }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [isSpellDetailOpen, setIsSpellDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Инициализация заклинаний персонажа, если они отсутствуют
  useEffect(() => {
    if (!character.spells) {
      onUpdate({ spells: [] });
    }
  }, [character, onUpdate]);

  // Инициализация слотов заклинаний, если они отсутствуют
  useEffect(() => {
    if (!character.spellSlots) {
      // Создаем базовую структуру слотов заклинаний в зависимости от уровня и класса
      const maxLevel = Math.min(9, Math.ceil((character.level || 1) / 2));
      const slots: { [key: number]: { max: number; used: number } } = {};
      
      for (let i = 1; i <= maxLevel; i++) {
        // Простая формула для определения количества слотов
        // В реальном приложении это должно быть основано на классе и уровне
        const maxSlots = Math.max(1, Math.min(4, Math.ceil((character.level || 1) / 3) + (i === 1 ? 2 : 0) - Math.floor(i / 2)));
        slots[i] = { max: maxSlots, used: 0 };
      }
      
      onUpdate({ spellSlots: slots });
    }
  }, [character, onUpdate]);

  // Фильтрация заклинаний по поисковому запросу и вкладке
  const filteredSpells = (character.spells || []).filter(spell => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'cantrips' && spell.level === 0) ||
                      (activeTab === 'prepared' && spell.prepared) ||
                      (Number(activeTab) === spell.level);
    return matchesSearch && matchesTab;
  });

  // Обработчик добавления заклинания
  const handleAddSpell = (spell: SpellData) => {
    const updatedSpells = [...(character.spells || [])];
    
    // Проверяем, есть ли уже такое заклинание
    const existingIndex = updatedSpells.findIndex(s => s.name === spell.name);
    
    if (existingIndex >= 0) {
      toast({
        title: "Заклинание уже добавлено",
        description: `${spell.name} уже есть в вашем списке заклинаний.`,
        variant: "destructive"
      });
      return;
    }
    
    // Добавляем заклинание с дополнительным полем prepared
    updatedSpells.push({
      ...spell,
      prepared: false
    });
    
    onUpdate({ spells: updatedSpells });
    
    toast({
      title: "Заклинание добавлено",
      description: `${spell.name} добавлено в ваш список заклинаний.`
    });
  };

  // Обработчик удаления заклинания
  const handleRemoveSpell = (spellToRemove: SpellData) => {
    const updatedSpells = (character.spells || []).filter(
      spell => spell.name !== spellToRemove.name
    );
    
    onUpdate({ spells: updatedSpells });
    
    toast({
      title: "Заклинание удалено",
      description: `${spellToRemove.name} удалено из вашего списка заклинаний.`
    });
    
    // Закрываем модальное окно, если оно открыто
    if (isSpellDetailOpen) {
      setIsSpellDetailOpen(false);
    }
  };

  // Обработчик переключения статуса "подготовлено"
  const togglePrepared = (spellToToggle: SpellData) => {
    const updatedSpells = (character.spells || []).map(spell => {
      if (spell.name === spellToToggle.name) {
        return { ...spell, prepared: !spell.prepared };
      }
      return spell;
    });
    
    onUpdate({ spells: updatedSpells });
    
    // Обновляем выбранное заклинание, если оно открыто
    if (selectedSpell && selectedSpell.name === spellToToggle.name) {
      setSelectedSpell({ ...selectedSpell, prepared: !selectedSpell.prepared });
    }
  };

  // Обработчик использования слота заклинания
  const handleUseSpellSlot = (level: number) => {
    if (!character.spellSlots) return;
    
    const slotInfo = character.spellSlots[level];
    if (!slotInfo || slotInfo.used >= slotInfo.max) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used + 1
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
    
    toast({
      title: "Слот заклинания использован",
      description: `Использован слот ${level} уровня`
    });
  };

  // Обработчик восстановления слота заклинания
  const handleRestoreSpellSlot = (level: number) => {
    if (!character.spellSlots) return;
    
    const slotInfo = character.spellSlots[level];
    if (!slotInfo || slotInfo.used <= 0) return;
    
    const updatedSpellSlots = { ...character.spellSlots };
    updatedSpellSlots[level] = {
      ...slotInfo,
      used: slotInfo.used - 1
    };
    
    onUpdate({ spellSlots: updatedSpellSlots });
    
    toast({
      title: "Слот заклинания восстановлен",
      description: `Восстановлен слот ${level} уровня`
    });
  };

  // Получение цвета для бейджа уровня заклинания
  const getSpellLevelBadgeColor = (level: number) => {
    if (currentTheme.badge && currentTheme.badge[level === 0 ? 'cantrip' : `level${level}`]) {
      return currentTheme.badge[level === 0 ? 'cantrip' : `level${level}`];
    }
    
    // Запасные цвета, если в теме не определены
    const fallbackColors = {
      0: '#6b7280', // Заговор
      1: '#10b981', // 1 уровень
      2: '#3b82f6', // 2 уровень
      3: '#8b5cf6', // 3 уровень
      4: '#ec4899', // 4 уровень
      5: '#f59e0b', // 5 уровень
      6: '#ef4444', // 6 уровень
      7: '#6366f1', // 7 уровень
      8: '#0ea5e9', // 8 уровень
      9: '#7c3aed', // 9 уровень
    };
    
    return fallbackColors[level as keyof typeof fallbackColors] || '#6b7280';
  };

  // Получение всех уровней заклинаний, которые есть у персонажа
  const getAvailableSpellLevels = () => {
    const levels = new Set<number>();
    
    // Добавляем все уровни из заклинаний персонажа
    (character.spells || []).forEach(spell => {
      levels.add(spell.level);
    });
    
    // Добавляем все уровни из слотов заклинаний
    if (character.spellSlots) {
      Object.keys(character.spellSlots).forEach(level => {
        levels.add(Number(level));
      });
    }
    
    // Преобразуем Set в массив и сортируем
    return Array.from(levels).sort((a, b) => a - b);
  };

  // Получаем доступные уровни заклинаний
  const availableSpellLevels = getAvailableSpellLevels();

  return (
    <div className="space-y-4">
      {/* Верхняя панель с поиском и кнопкой добавления */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заклинаний..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderColor: currentTheme.accent + '40'
            }}
          />
        </div>
        <Button 
          onClick={() => setIsSpellModalOpen(true)}
          style={{
            backgroundColor: currentTheme.accent,
            color: currentTheme.buttonText
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить заклинание
        </Button>
      </div>

      {/* Панель слотов заклинаний */}
      <Card style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderColor: currentTheme.accent + '40' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg" style={{ color: currentTheme.textColor }}>
            Слоты заклинаний
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {character.spellSlots && Object.entries(character.spellSlots)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([level, slotInfo]) => (
                <SpellSlotsPopover
                  key={`slot-${level}`}
                  level={Number(level)}
                  used={slotInfo.used}
                  max={slotInfo.max}
                  onUse={() => handleUseSpellSlot(Number(level))}
                  onRestore={() => handleRestoreSpellSlot(Number(level))}
                />
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Вкладки для фильтрации заклинаний */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-black/20 w-full flex overflow-x-auto">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="cantrips">Заговоры</TabsTrigger>
          <TabsTrigger value="prepared">Подготовленные</TabsTrigger>
          {availableSpellLevels.filter(level => level > 0).map(level => (
            <TabsTrigger key={`tab-${level}`} value={level.toString()}>
              {level} уровень
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Список заклинаний */}
      <ScrollArea className="h-[calc(100vh-24rem)] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSpells.length > 0 ? (
            filteredSpells.map(spell => (
              <Card 
                key={spell.name} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedSpell(spell);
                  setIsSpellDetailOpen(true);
                }}
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                  borderColor: spell.prepared ? currentTheme.accent : currentTheme.accent + '40',
                  borderWidth: spell.prepared ? '2px' : '1px'
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold" style={{ color: currentTheme.textColor }}>
                        {spell.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {spell.school}
                      </p>
                    </div>
                    <Badge 
                      style={{ 
                        backgroundColor: getSpellLevelBadgeColor(spell.level),
                        color: 'white'
                      }}
                    >
                      {spell.level === 0 ? "Заговор" : `${spell.level} ур.`}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className={spell.prepared ? "bg-accent/20" : "bg-black/20"}>
                      {spell.prepared ? "Подготовлено" : "Не подготовлено"}
                    </Badge>
                    {spell.concentration && (
                      <Badge variant="outline" className="bg-black/20">
                        Концентрация
                      </Badge>
                    )}
                    {spell.ritual && (
                      <Badge variant="outline" className="bg-black/20">
                        Ритуал
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              {searchTerm ? (
                <p>Заклинания не найдены. Попробуйте изменить поисковый запрос.</p>
              ) : (
                <p>У вас пока нет заклинаний. Нажмите "Добавить заклинание", чтобы начать.</p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Модальное окно выбора заклинаний */}
      <SpellSelectionModal
        isOpen={isSpellModalOpen}
        onClose={() => setIsSpellModalOpen(false)}
        onSelectSpell={handleAddSpell}
        existingSpells={character.spells || []}
      />

      {/* Модальное окно с деталями заклинания */}
      <Dialog open={isSpellDetailOpen} onOpenChange={setIsSpellDetailOpen}>
        {selectedSpell && (
          <DialogContent 
            className="max-w-2xl"
            style={{ 
              backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)',
              borderColor: currentTheme.accent
            }}
          >
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle className="text-2xl" style={{ color: currentTheme.textColor }}>
                  {selectedSpell.name}
                </DialogTitle>
                <Badge 
                  style={{ 
                    backgroundColor: getSpellLevelBadgeColor(selectedSpell.level),
                    color: 'white'
                  }}
                >
                  {selectedSpell.level === 0 ? "Заговор" : `${selectedSpell.level} уровень`}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-black/20">
                  {selectedSpell.school}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={selectedSpell.prepared ? "bg-accent/20" : "bg-black/20"}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePrepared(selectedSpell);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {selectedSpell.prepared ? "Подготовлено" : "Не подготовлено"}
                </Badge>
                {selectedSpell.concentration && (
                  <Badge variant="outline" className="bg-black/20">
                    Концентрация
                  </Badge>
                )}
                {selectedSpell.ritual && (
                  <Badge variant="outline" className="bg-black/20">
                    Ритуал
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: currentTheme.textColor }}>
                <div>
                  <span className="font-semibold">Время накладывания:</span> {selectedSpell.castingTime}
                </div>
                <div>
                  <span className="font-semibold">Дистанция:</span> {selectedSpell.range}
                </div>
                <div>
                  <span className="font-semibold">Компоненты:</span> {selectedSpell.components}
                </div>
                <div>
                  <span className="font-semibold">Длительность:</span> {selectedSpell.duration}
                </div>
              </div>

              <Separator style={{ backgroundColor: currentTheme.accent + '40' }} />

              <div style={{ color: currentTheme.textColor }}>
                {typeof selectedSpell.description === 'string' ? (
                  selectedSpell.description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-2">{paragraph}</p>
                  ))
                ) : Array.isArray(selectedSpell.description) ? (
                  selectedSpell.description.map((paragraph, idx) => (
                    <p key={idx} className="mb-2">{paragraph}</p>
                  ))
                ) : (
                  <p>Нет описания</p>
                )}
              </div>

              {selectedSpell.classes && (
                <div className="text-sm" style={{ color: currentTheme.mutedTextColor || '#9ca3af' }}>
                  <span className="font-semibold">Классы:</span> {
                    typeof selectedSpell.classes === 'string' 
                      ? selectedSpell.classes 
                      : Array.isArray(selectedSpell.classes) 
                        ? selectedSpell.classes.join(', ') 
                        : ''
                  }
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between items-center">
              <Button 
                variant="destructive" 
                onClick={() => handleRemoveSpell(selectedSpell)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить заклинание
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => togglePrepared(selectedSpell)}
                  style={{
                    borderColor: currentTheme.accent,
                    color: currentTheme.textColor
                  }}
                >
                  {selectedSpell.prepared ? "Снять подготовку" : "Подготовить"}
                </Button>
                <Button 
                  onClick={() => setIsSpellDetailOpen(false)}
                  style={{
                    backgroundColor: currentTheme.accent,
                    color: currentTheme.buttonText
                  }}
                >
                  Закрыть
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default SpellsTab;
