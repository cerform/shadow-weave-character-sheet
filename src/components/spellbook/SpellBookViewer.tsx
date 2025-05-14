
import React, { useEffect, useState } from 'react';
import SpellCard from './SpellCard';
import SpellFilterPanel from './SpellFilterPanel';
import SpellDetailModal from './SpellDetailModal';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import SpellDatabaseManager from './SpellDatabaseManager';
import { CharacterSpell } from '@/types/character';
import { useSpellbook } from '@/hooks/spellbook';
import { ScrollArea } from "@/components/ui/scroll-area"

const SpellBookViewer: React.FC = () => {
  const { themeStyles } = useTheme();
  const { spells, filteredSpells, selectSpell } = useSpellbook();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);

  useEffect(() => {
    console.log("SpellBookViewer: Загружено заклинаний", spells.length);
  }, [spells]);

  const handleSpellClick = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Фильтры */}
      <aside className="lg:w-1/4">
        <SpellFilterPanel />
        <SpellDatabaseManager />
      </aside>

      {/* Список заклинаний */}
      <div className="lg:w-3/4">
        <ScrollArea className="h-[600px] w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpells.map(spell => (
              <SpellCard
                key={spell.id}
                spell={spell}
                onClick={() => handleSpellClick(spell)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Модальное окно с деталями */}
      <SpellDetailModal
        open={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        spell={selectedSpell}
      />
    </div>
  );
};

export default SpellBookViewer;
