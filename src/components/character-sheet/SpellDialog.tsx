
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Character, CharacterSpell } from '@/types/character';
import { normalizeSpells } from '@/utils/spellHelpers';
import SpellDescription from './SpellDescription';
import { SpellData } from '@/types/spells';

interface SpellDialogProps {
  open: boolean;
  onClose: () => void;
  spell: SpellData | null;
  character?: Character;
}

const SpellDialog: React.FC<SpellDialogProps> = ({
  open,
  onClose,
  spell,
  character
}) => {
  // Check if the spell is prepared for the current character
  const isPrepared = React.useMemo(() => {
    if (!character || !spell) return false;
    
    // Get normalized spell list
    const characterSpells = character.spells ? normalizeSpells(character.spells) : [];
    
    // Check if this spell is in the character's prepared list
    return characterSpells.some(charSpell => 
      charSpell.name === spell.name && charSpell.prepared
    );
  }, [character, spell]);

  // Check if the character knows this spell
  const isKnown = React.useMemo(() => {
    if (!character || !spell) return false;
    
    // Get normalized spell list
    const characterSpells = character.spells ? normalizeSpells(character.spells) : [];
    
    // Check if this spell is in the character's list
    return characterSpells.some(charSpell => 
      charSpell.name === spell.name
    );
  }, [character, spell]);

  // If no spell is selected, don't render anything
  if (!spell) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{spell.name}</DialogTitle>
        </DialogHeader>
        
        <SpellDescription 
          spell={spell} 
          isPrepared={isPrepared}
          isKnown={isKnown}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SpellDialog;
