
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { importSpellsFromText } from '@/utils/spellBatchImporter';
import { importSpellsFromDetailedText } from '@/hooks/spellbook/importUtils';
import { allSpells } from '@/data/allSpells';
import { SpellData } from '@/hooks/spellbook/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterSpell } from '@/types/character';

interface SpellImporterProps {
  onClose: () => void;
  onImport?: (updatedSpells: CharacterSpell[] | SpellData[]) => void;
}

const SpellImporter: React.FC<SpellImporterProps> = ({ onClose, onImport }) => {
  const [inputText, setInputText] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("simple");
  const { toast } = useToast();

  const handleSimpleImport = () => {
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

  const handleDetailedImport = () => {
    try {
      setIsProcessing(true);
      
      const newSpells = importSpellsFromDetailedText(inputText);
      setImportedCount(newSpells.length);
      
      if (onImport && newSpells.length > 0) {
        // Объединяем существующие и новые заклинания
        const combinedSpells = [...allSpells];
        
        // Добавляем только те заклинания, которых еще нет
        newSpells.forEach(newSpell => {
          const exists = combinedSpells.some(
            existing => existing.name === newSpell.name && existing.level === newSpell.level
          );
          
          if (!exists) {
            combinedSpells.push(newSpell);
          }
        });
        
        onImport(combinedSpells);
      }
      
      toast({
        title: "Заклинания импортированы",
        description: `Импортировано ${newSpells.length} заклинаний из текстового формата`,
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
    <Card className="border-accent bg-card/70 w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Импорт заклинаний</CardTitle>
        <CardDescription>
          Вы можете импортировать заклинания из разных форматов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="simple" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="simple" className="flex-1">Простой формат</TabsTrigger>
            <TabsTrigger value="detailed" className="flex-1">Подробный формат</TabsTrigger>
          </TabsList>
          
          <TabsContent value="simple">
            <CardDescription className="mb-2">
              Вставьте заклинания в формате: [уровень] название компоненты
            </CardDescription>
            <CardDescription className="mb-4">
              Например: [3] Огненный шар ВСМ
            </CardDescription>
            
            <Textarea
              placeholder="Вставьте заклинания по одному на строке..."
              className="h-[200px] mb-4"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <Button 
              onClick={handleSimpleImport} 
              disabled={isProcessing || !inputText.trim()}
              className="w-full"
            >
              {isProcessing ? "Импортирую..." : "Импортировать"}
            </Button>
          </TabsContent>
          
          <TabsContent value="detailed">
            <CardDescription className="mb-2">
              Вставьте заклинания в подробном формате из учебника:
            </CardDescription>
            <CardDescription className="mb-4 text-xs">
              Название
              <br/>Заговор или N-й уровень
              <br/>Школа
              <br/>Время накладывания: 1 действие
              <br/>Дистанция: X футов
              <br/>Компоненты: ВСМ
              <br/>Длительность: Мгновенная
              <br/>Классы: Волшебник, Чародей
            </CardDescription>
            
            <Textarea
              placeholder="Вставьте текст заклинаний из учебника..."
              className="h-[200px] mb-4"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <Button 
              onClick={handleDetailedImport} 
              disabled={isProcessing || !inputText.trim()}
              className="w-full"
            >
              {isProcessing ? "Импортирую..." : "Импортировать в книгу заклинаний"}
            </Button>
          </TabsContent>
        </Tabs>
        
        {importedCount > 0 && (
          <div className="bg-green-500/10 text-green-500 p-2 rounded-md mt-4">
            Успешно импортировано: {importedCount} заклинаний
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Закрыть
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpellImporter;
