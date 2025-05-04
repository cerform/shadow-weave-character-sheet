
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { importSpellsFromText } from '@/utils/spellBatchImporter';
import { spells as allSpells } from '@/data/spells';
import { CharacterSpell } from '@/types/character';

interface SpellImporterProps {
  onClose: () => void;
  onImport?: (updatedSpells: CharacterSpell[]) => void;
}

const SpellImporter: React.FC<SpellImporterProps> = ({ onClose, onImport }) => {
  const [inputText, setInputText] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImport = () => {
    try {
      setIsProcessing(true);
      // Ensure all spells have the required prepared field
      const spellsWithPreparedField = allSpells.map(spell => {
        if (spell.prepared === undefined) {
          return {...spell, prepared: false};
        }
        return spell;
      });
      
      const updatedSpells = importSpellsFromText(inputText, spellsWithPreparedField);
      const newCount = updatedSpells.length - spellsWithPreparedField.length;
      setImportedCount(newCount > 0 ? newCount : 0);
      
      if (onImport) {
        onImport(updatedSpells);
      }
      
      toast({
        title: "Заклинания импортированы",
        description: `Добавлено или обновлено ${newCount > 0 ? newCount : 'несколько'} заклинаний`,
        variant: "default",
      });
      
      // Очистим поле ввода после успешного импорта
      setInputText('');
    } catch (error) {
      console.error("Ошибка при импорте заклинаний:", error);
      toast({
        title: "Ошибка импорта",
        description: "Не удалось импортировать заклинания. Проверьте формат ввода.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-accent bg-card/70">
      <CardHeader>
        <CardTitle>Импорт заклинаний</CardTitle>
        <CardDescription>
          Вставьте заклинания в формате: [уровень] название компоненты
        </CardDescription>
        <CardDescription>
          Например: [3] Огненный шар ВСМ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Вставьте заклинания по одному на строке..."
          className="h-[200px] mb-4"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        
        {importedCount > 0 && (
          <div className="bg-green-500/10 text-green-500 p-2 rounded-md mb-4">
            Успешно добавлено или обновлено: {importedCount} заклинаний
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button 
          onClick={handleImport} 
          disabled={isProcessing || !inputText.trim()}
        >
          {isProcessing ? "Импортирую..." : "Импортировать"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpellImporter;
