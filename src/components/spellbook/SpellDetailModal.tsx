
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CharacterSpell } from '@/types/character';
import { convertCharacterSpellToSpellData } from '@/types/spells';
import SpellDetailView from './SpellDetailView';
import { Theme } from '@/types/theme';

interface SpellDetailModalProps {
  spell: CharacterSpell;
  open: boolean;
  onClose: () => void;
  currentTheme: Theme;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({ 
  spell, 
  open, 
  onClose,
  currentTheme 
}) => {
  // Преобразуем CharacterSpell в SpellData для отображения
  const spellData = convertCharacterSpellToSpellData(spell);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none">
        <SpellDetailView 
          spell={spellData}
          onClose={onClose} 
          currentTheme={currentTheme}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
