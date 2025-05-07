
// Create the SpellDialog component props interface
export interface SpellDialogProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  spell: CharacterSpell;
  onTogglePrepared?: () => void;
}

// Make sure the SpellCastingPanel has the correct props interface
export interface SpellCastingPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Use these interfaces in your component implementations
