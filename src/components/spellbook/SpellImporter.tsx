
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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

  // Import spells from text function
  const importSpellsFromText = (text: string): CharacterSpell[] => {
    if (!text.trim()) return [];
    
    const spells: CharacterSpell[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Match pattern like [3] Огненный шар ВСМ
      const levelMatch = line.match(/^\[(\d+)\]\s+(.*?)(?:\s+([ВСМ]+))?$/);
      if (levelMatch) {
        const level = parseInt(levelMatch[1], 10);
        const name = levelMatch[2].trim();
        const components = levelMatch[3] || '';
        
        // Create basic spell
        const newSpell: CharacterSpell = {
          name,
          level,
          school: 'Универсальная', // Default
          castingTime: '1 действие', // Default
          range: '60 футов', // Default
          components,
          duration: 'Мгновенная', // Default
          description: 'Описание отсутствует', // Default
          prepared: false,
          verbal: components.includes('В'),
          somatic: components.includes('С'),
          material: components.includes('М'),
          ritual: false,
          concentration: false,
        };
        
        spells.push(newSpell);
      }
    }
    
    return spells;
  };

  const handleImport = () => {
    try {
      setIsProcessing(true);
      const updatedSpells = importSpellsFromText(inputText);
      const newCount = updatedSpells.length;
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
