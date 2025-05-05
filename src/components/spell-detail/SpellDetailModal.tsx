
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import SpellCard from './SpellCard';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellDetailModalProps {
  spell: any;
  open: boolean;
  onClose: () => void;
}

const SpellDetailModal: React.FC<SpellDetailModalProps> = ({ spell, open, onClose }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  if (!spell) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.9)'}`,
          borderColor: currentTheme.accent,
          boxShadow: `0 0 15px ${currentTheme.accent}80`
        }}
        onInteractOutside={onClose}
      >
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle 
              className="text-2xl font-bold" 
              style={{color: currentTheme.textColor}}
            >
              {spell.name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              style={{color: currentTheme.textColor}}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <div className="px-6 py-4 overflow-y-auto">
          <SpellCard spell={spell} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDetailModal;
