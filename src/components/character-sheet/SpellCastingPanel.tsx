
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Character, CharacterSpell } from '@/types/character';
import SpellDialog from './SpellDialog';
import { useToast } from '@/hooks/use-toast';

interface SpellCastingPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellCastingPanel: React.FC<SpellCastingPanelProps> = ({ character, onUpdate }) => {
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [showSpellDetails, setShowSpellDetails] = useState(false);
  const { toast } = useToast();
  
  // Группируем заклинания по уровням
  const spellsByLevel = React.useMemo(() => {
    const spells = character.spells || [];
    return spells.reduce((acc, spell) => {
      if (typeof spell === 'string') {
        // Если заклинание представлено строкой, создаем минимальный объект
        const basicSpell: CharacterSpell = {
          id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
          name: spell,
          level: 0,
          school: 'Универсальная',
          castingTime: '1 действие',
          range: 'На себя',
          components: '',
          duration: 'Мгновенная',
          description: 'Нет описания',
          prepared: true
        };
        const level = 0;
        if (!acc[level]) acc[level] = [];
        acc[level].push(basicSpell);
      } else {
        const level = spell.level || 0;
        if (!acc[level]) acc[level] = [];
        acc[level].push(spell);
      }
      return acc;
    }, {} as Record<number, CharacterSpell[]>);
  }, [character.spells]);

  // Обработчик подготовки заклинания
  const togglePrepareSpell = (spell: CharacterSpell) => {
    const updatedSpells = (character.spells || []).map(s => {
      if (typeof s === 'string') return s;
      
      if (s.id === spell.id || s.name === spell.name) {
        return { ...s, prepared: !s.prepared };
      }
      return s;
    });
    
    onUpdate({ spells: updatedSpells });
    
    // Обновляем выбранное заклинание, если оно отображается в диалоге
    if (selectedSpell && (selectedSpell.id === spell.id || selectedSpell.name === spell.name)) {
      setSelectedSpell({ ...selectedSpell, prepared: !selectedSpell.prepared });
    }
    
    toast({
      title: spell.prepared ? "Заклинание убрано из подготовленных" : "Заклинание подготовлено",
      description: spell.name,
    });
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
              key={spell.id || spell.name} 
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
                    togglePrepareSpell(spell);
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
          onTogglePrepared={() => togglePrepareSpell(selectedSpell)}
        />
      )}
    </div>
  );
};

export default SpellCastingPanel;
