
import React, { useState, useEffect } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SpellSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  character, 
  onUpdate 
}) => {
  // Временная реализация
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Выбор заклинаний</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Модальное окно для выбора заклинаний. Эта функциональность будет реализована позднее.
        </div>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogContent>
    </Dialog>
  );
};

export default SpellSelectionModal;
