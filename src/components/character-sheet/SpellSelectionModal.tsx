
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Character, CharacterSpell } from '@/types/character';
import { useSpellbook } from '@/hooks/spellbook';
import { SpellData } from '@/types/spells';
import { useToast } from '@/hooks/use-toast';
import { convertToSpellData } from '@/utils/spellProcessors';

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
  const { spells, filteredSpells, setClassFilter, setLevelFilter } = useSpellbook();
  const { toast } = useToast();
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);

  // Инициализируем выбранные заклинания
  useEffect(() => {
    if (character && character.spells) {
      // Конвертируем CharacterSpell[] в SpellData[]
      if (Array.isArray(character.spells)) {
        const spellDataArray = convertToSpellData(character.spells);
        setSelectedSpells(spellDataArray);
      }
    }
  }, [character]);

  // Когда модальное окно открывается, устанавливаем фильтры
  useEffect(() => {
    if (open && character) {
      const characterClass = character.class || '';
      if (characterClass) {
        setClassFilter([characterClass]);
      }
      
      // Установим фильтр по уровню основываясь на уровне персонажа
      if (character.level) {
        const maxSpellLevel = Math.ceil(character.level / 2);
        setLevelFilter(Array.from({ length: maxSpellLevel + 1 }, (_, i) => i));
      }
    }
  }, [open, character, setClassFilter, setLevelFilter]);

  // Функция для добавления заклинания
  const handleAddSpell = (spell: SpellData) => {
    // Проверяем, выбрано ли уже это заклинание
    if (selectedSpells.some(s => s.id === spell.id)) {
      toast({
        title: "Заклинание уже выбрано",
        description: `Заклинание "${spell.name}" уже добавлено в список`,
        variant: "destructive"
      });
      return;
    }

    // Добавляем заклинание в список выбранных
    setSelectedSpells(prev => [...prev, spell]);
  };

  // Функция для удаления заклинания
  const handleRemoveSpell = (spellId: string) => {
    setSelectedSpells(prev => prev.filter(s => s.id !== spellId));
  };

  // Функция для сохранения заклинаний персонажа
  const handleSaveSpells = () => {
    if (!character) return;

    // Конвертируем SpellData[] в CharacterSpell[]
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
      classes: spell.classes,
      verbal: spell.verbal,
      somatic: spell.somatic,
      material: spell.material,
      materials: spell.materials,
      prepared: true, // По умолчанию все заклинания подготовлены
      source: spell.source
    }));

    onUpdate({ spells: characterSpells });
    toast({
      title: "Заклинания сохранены",
      description: `${characterSpells.length} заклинаний добавлено в книгу заклинаний персонажа`
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onclose => !onclose && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выбор заклинаний</DialogTitle>
        </DialogHeader>

        {/* Здесь будет интерфейс выбора заклинаний */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Левая колонка: доступные заклинания */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Доступные заклинания</h3>
            <div className="space-y-2">
              {filteredSpells.length > 0 ? (
                filteredSpells.map((spell) => (
                  <div key={spell.id} className="flex justify-between items-center border p-2 rounded">
                    <div>
                      <div className="font-medium">{spell.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`} • {spell.school}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAddSpell(spell)}>
                      Добавить
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  Нет доступных заклинаний для вашего класса
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка: выбранные заклинания */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Выбранные заклинания</h3>
            <div className="space-y-2">
              {selectedSpells.length > 0 ? (
                selectedSpells.map((spell) => (
                  <div key={spell.id} className="flex justify-between items-center border p-2 rounded">
                    <div>
                      <div className="font-medium">{spell.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`} • {spell.school}
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveSpell(spell.id)}>
                      Удалить
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  Вы еще не выбрали ни одного заклинания
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSaveSpells}>
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellSelectionModal;
