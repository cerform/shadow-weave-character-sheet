
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SpellData } from '@/types/spells'; 
import SpellDetailView from './SpellDetailView';
import { useTheme } from '@/hooks/use-theme'; 

interface SpellDetailModalProps {
  spell: SpellData | null;
  open: boolean;
  onClose: () => void;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({ 
  spell, 
  open, 
  onClose
}) => {
  const { themeStyles, theme } = useTheme();

  if (!spell) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none">
        <SpellDetailView 
          spell={spell}
          onClose={onClose} 
          currentTheme={themeStyles}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
