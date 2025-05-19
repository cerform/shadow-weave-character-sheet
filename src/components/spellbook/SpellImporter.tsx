
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { importSpellsFromTextFormat } from '@/utils/updateSpellDatabase';
import { spells as allSpells } from '@/data/spells';
import { convertToSpellData } from '@/utils/spellProcessors';
import { Badge } from '@/components/ui/badge';
import { SpellData } from '@/types/spells';

interface SpellImporterProps {
  onClose: () => void;
  onImport?: (updatedSpells: SpellData[]) => void;
}

const SpellImporter: React.FC<SpellImporterProps> = ({ onClose, onImport }) => {
  const [inputText, setInputText] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duplicatesFound, setDuplicatesFound] = useState(0);
  const { toast } = useToast();

  const handleImport = () => {
    try {
      setIsProcessing(true);
      
      // Подсчитываем количество заклинаний до импорта
      const beforeCount = allSpells.length;
      
      // Создаем карту существующих заклинаний для проверки дубликатов
      const existingSpellsMap = new Map<string, SpellData>();
      allSpells.forEach(spell => {
        const key = `${spell.name.toLowerCase()}-${spell.level}`;
        existingSpellsMap.set(key, spell as SpellData);
      });
      
      // Подсчитываем количество уникальных заклинаний во входных данных
      const inputLines = inputText.split('\n').filter(line => line.trim() !== '');
      const inputSpellsCount = inputLines.length;
      
      // Импортируем заклинания
      const importedSpells = importSpellsFromTextFormat(inputText, allSpells);
      // Преобразуем в SpellData[]
      const updatedSpells = convertToSpellData(importedSpells);
      
      // Подсчитываем количество заклинаний после импорта
      const afterCount = updatedSpells.length;
      const newCount = afterCount - beforeCount;
      
      // Определяем количество дубликатов
      const duplicates = inputSpellsCount - newCount;
      setDuplicatesFound(duplicates > 0 ? duplicates : 0);
      
      setImportedCount(newCount > 0 ? newCount : 0);
      
      if (onImport) {
        onImport(updatedSpells);
      }
      
      toast({
        title: "Заклинания импортированы",
        description: `Добавлено ${newCount > 0 ? newCount : 0} новых заклинаний${duplicates > 0 ? `, пропущено ${duplicates} дубликатов` : ''}`,
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
            Успешно добавлено: {importedCount} заклинаний
            {duplicatesFound > 0 && (
              <Badge variant="outline" className="ml-2">
                Пропущено дубликатов: {duplicatesFound}
              </Badge>
            )}
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
