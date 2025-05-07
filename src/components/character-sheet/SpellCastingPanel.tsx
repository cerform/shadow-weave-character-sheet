
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SpellDialog } from './SpellDialog';
import { Character } from '@/types/character';

// Определяем тип CharacterSpell
export interface CharacterSpell {
  id: string | number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared?: boolean;
  alwaysPrepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  classes?: string[];
  source?: string;
}

// Создаем интерфейсы для пропсов компонентов
export interface SpellDialogProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  spell: CharacterSpell;
  onTogglePrepared?: () => void;
}

// Интерфейс для панели заклинаний
export interface SpellCastingPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const SpellCastingPanel: React.FC<SpellCastingPanelProps> = ({ character, onUpdate }) => {
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [showSpellDetails, setShowSpellDetails] = useState(false);

  // Группируем заклинания по уровням
  const spellsByLevel = React.useMemo(() => {
    const spells = character.spells || [];
    return spells.reduce((acc, spell) => {
      const level = spell.level || 0;
      if (!acc[level]) acc[level] = [];
      acc[level].push(spell);
      return acc;
    }, {} as Record<number, CharacterSpell[]>);
  }, [character.spells]);

  // Обработчик подготовки заклинания
  const togglePrepareSpell = (spellId: string | number) => {
    const updatedSpells = (character.spells || []).map(spell => {
      if (spell.id === spellId) {
        return { ...spell, prepared: !spell.prepared };
      }
      return spell;
    });
    
    onUpdate({ spells: updatedSpells });
  };

  // Открытие диалога детальной информации о заклинании
  const openSpellDetails = (spell: CharacterSpell) => {
    setSelectedSpell(spell);
    setShowSpellDetails(true);
  };

  // Рендер заклинаний по уровням
  const renderSpellsByLevel = () => {
    return Object.entries(spellsByLevel).map(([level, spells]) => (
      <div key={level} className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          {level === '0' ? 'Заговоры' : `Уровень ${level}`}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {spells.map((spell) => (
            <div 
              key={spell.id} 
              className={`p-2 rounded-md cursor-pointer border flex justify-between items-center ${
                spell.prepared ? 'bg-primary/10 border-primary' : 'bg-card border-border'
              }`}
              onClick={() => openSpellDetails(spell)}
            >
              <div>
                <span className="font-medium">{spell.name}</span>
                <div className="text-xs text-muted-foreground">
                  {spell.school} • {spell.castingTime}
                </div>
              </div>
              {Number(level) > 0 && !spell.alwaysPrepared && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePrepareSpell(spell.id);
                  }}
                >
                  {spell.prepared ? 'Подготовлено' : 'Подготовить'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Заклинания</h2>
      
      {/* Показываем сообщение, если нет заклинаний */}
      {Object.keys(spellsByLevel).length === 0 ? (
        <div className="text-center p-4 bg-muted rounded-md">
          <p>У персонажа нет заклинаний.</p>
        </div>
      ) : (
        renderSpellsByLevel()
      )}
      
      {/* Диалог для отображения деталей заклинания */}
      {selectedSpell && (
        <SpellDialog
          open={showSpellDetails}
          onOpenChange={setShowSpellDetails}
          spell={selectedSpell}
          onTogglePrepared={() => togglePrepareSpell(selectedSpell.id)}
        />
      )}
    </div>
  );
};

export default SpellCastingPanel;
