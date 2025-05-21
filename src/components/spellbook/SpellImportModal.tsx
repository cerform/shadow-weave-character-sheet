
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CharacterSpell } from '@/types/character';
import { useToast } from '@/hooks/use-toast';

interface SpellImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (spells: CharacterSpell[]) => void;
}

const SpellImportModal: React.FC<SpellImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [importText, setImportText] = useState('');
  const { toast } = useToast();

  const handleImport = () => {
    try {
      let spells: CharacterSpell[] = [];
      
      try {
        // Try to parse as JSON first
        spells = JSON.parse(importText);
      } catch (jsonError) {
        // If not valid JSON, try as spell batch format
        try {
          const spellsWithoutPrepared = JSON.parse(importText);
          spells = spellsWithoutPrepared.map((spell: any) => ({
            ...spell,
            prepared: true
          }));
        } catch (error) {
          throw new Error('Неверный формат данных');
        }
      }
      
      if (!Array.isArray(spells)) {
        throw new Error('Данные должны быть массивом заклинаний');
      }
      
      onImport(spells);
      setImportText('');
      onClose(); // Закрываем модальное окно после успешного импорта
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Ошибка импорта',
        description: error instanceof Error ? error.message : 'Не удалось импортировать заклинания',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Импорт заклинаний</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Вставьте JSON-данные заклинаний для импорта в вашу книгу заклинаний.
          </p>
          
          <Textarea 
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder="Вставьте JSON-данные заклинаний здесь..."
            className="min-h-[200px]"
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleImport}>
              Импортировать
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellImportModal;
