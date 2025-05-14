
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { updateSpellsFromText } from '@/utils/updateSpellsWithInput';
import { spells } from '@/data/spells';
import { useNavigate } from 'react-router-dom';

interface SpellImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpellImportModal: React.FC<SpellImportModalProps> = ({
  isOpen,
  onClose
}) => {
  const [importText, setImportText] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImport = () => {
    if (!importText.trim()) {
      toast({
        title: "Ошибка импорта",
        description: "Введите данные для импорта",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      
      // Обрабатываем заклинания из текста
      const updatedSpells = updateSpellsFromText(importText, spells);
      
      // В реальном приложении тут было бы сохранение в БД или localStorage
      console.log('Импортировано заклинаний:', updatedSpells.length - spells.length);
      
      toast({
        title: "Заклинания импортированы",
        description: `Успешно обработано ${updatedSpells.length - spells.length} заклинаний`,
      });
      
      // Закрываем модальное окно и очищаем текст
      setImportText('');
      onClose();
      
      // Перезагружаем страницу для обновления списка заклинаний
      // В реальном приложении вместо перезагрузки можно было бы обновить состояние
      setTimeout(() => {
        navigate(0);
      }, 1500);
      
    } catch (error) {
      console.error('Ошибка импорта заклинаний:', error);
      toast({
        title: "Ошибка обработки",
        description: "Не удалось импортировать заклинания. Проверьте формат данных.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Пример формата для импорта
  const importExample = `[0] Брызги кислоты ВС.
[1] Благословение ВСМ
[2] Вечный огонь ВСМ`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Импорт заклинаний</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Вставьте список заклинаний в формате:
            </p>
            <pre className="bg-accent/10 p-2 rounded text-xs">
              {importExample}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              [уровень] название компоненты
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              где компоненты: В - вербальный, С - соматический, М - материальный, 
              Р - ритуальное, К - концентрация
            </p>
          </div>
          
          <Textarea
            placeholder="Вставьте заклинания здесь..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button 
            onClick={handleImport} 
            disabled={processing || !importText.trim()}
          >
            {processing ? "Импорт..." : "Импортировать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpellImportModal;
