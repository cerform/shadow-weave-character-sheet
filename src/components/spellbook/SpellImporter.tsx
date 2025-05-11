
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CharacterSpell } from '@/types/character';
import { importSpellsFromText } from '@/utils/spellBatchImporter';
import { extractSpellDetailsFromText, generateSpellId } from '@/utils/spellHelpers';

interface SpellImporterProps {
  onImport: (spells: CharacterSpell[]) => void;
  existingSpells: CharacterSpell[];
}

const SpellImporter: React.FC<SpellImporterProps> = ({ onImport, existingSpells }) => {
  const [textInput, setTextInput] = useState('');
  const { toast } = useToast();

  const handleImport = () => {
    if (!textInput.trim()) {
      toast({
        description: "Введите текст с описанием заклинаний",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use the utility to import spells from text
      const importedSpells = importSpellsFromText(textInput, existingSpells);
      
      // Count the new spells
      const newSpellsCount = importedSpells.length - existingSpells.length;
      
      if (newSpellsCount > 0) {
        onImport(importedSpells);
        setTextInput('');
        
        toast({
          description: `Добавлено ${newSpellsCount} новых заклинаний`,
          variant: "default"
        });
      } else {
        toast({
          description: "Не удалось импортировать заклинания или все заклинания уже есть в списке",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        description: "Ошибка при импорте заклинаний. Проверьте формат текста.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Импорт заклинаний</h3>
      <p className="text-sm text-muted-foreground">
        Вставьте текст с описанием заклинаний. Каждое заклинание должно быть отделено пустой строкой.
      </p>
      
      <Textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Название заклинания
Школа магии, уровень
Время накладывания: 1 действие
Дистанция: 30 футов
Компоненты: В, С, М
Длительность: Мгновенная

Описание заклинания..."
        className="min-h-[200px]"
      />
      
      <div className="flex justify-end">
        <Button onClick={handleImport}>
          Импортировать
        </Button>
      </div>
    </div>
  );
};

export default SpellImporter;
