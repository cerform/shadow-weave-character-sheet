
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SpellData } from '@/types/spells';
import { useToast } from '@/hooks/use-toast';

interface SpellImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (spells: SpellData[]) => void;
}

const SpellImportModal: React.FC<SpellImportModalProps> = ({ 
  open, 
  onOpenChange,
  onImport 
}) => {
  const [importText, setImportText] = useState('');
  const { toast } = useToast();

  const handleImport = () => {
    try {
      // Попытка распарсить JSON
      const parsedData = JSON.parse(importText.trim());
      
      // Проверяем, что это массив
      if (!Array.isArray(parsedData)) {
        toast({
          title: "Ошибка импорта",
          description: "Данные должны быть в формате массива заклинаний",
          variant: "destructive",
        });
        return;
      }
      
      // Проверяем первый элемент на соответствие структуре
      if (parsedData.length > 0 && (!parsedData[0].name || parsedData[0].level === undefined)) {
        toast({
          title: "Ошибка импорта",
          description: "Неверный формат данных заклинаний",
          variant: "destructive",
        });
        return;
      }
      
      // Вызываем callback с импортированными данными
      onImport(parsedData);
      
      // Очищаем поле ввода и закрываем модальное окно
      setImportText('');
      onOpenChange(false);
      
      toast({
        title: "Импорт успешен",
        description: `Импортировано ${parsedData.length} заклинаний`,
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Ошибка импорта",
        description: "Не удалось распарсить данные. Убедитесь, что это корректный JSON",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Импорт заклинаний</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Вставьте JSON с заклинаниями..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
        <DialogFooter className="sm:justify-between">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button type="button" onClick={handleImport}>
            Импортировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellImportModal;
