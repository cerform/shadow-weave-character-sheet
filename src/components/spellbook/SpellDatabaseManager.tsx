
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { spells as allSpells } from '@/data/spells';
import { checkDuplicateSpells, removeDuplicates, convertToSpellData } from '@/utils/spellProcessors';
import { SpellData } from '@/types/spells';

interface SpellDatabaseManagerProps {
  onClose: () => void;
}

const SpellDatabaseManager: React.FC<SpellDatabaseManagerProps> = ({ onClose }) => {
  const [localSpells, setLocalSpells] = useState<SpellData[]>([]);
  const [duplicateInfo, setDuplicateInfo] = useState<{count: number, duplicates: any[]}>({ count: 0, duplicates: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Загружаем список всех заклинаний
    const spellData = convertToSpellData(allSpells);
    setLocalSpells(spellData);
    
    // Проверяем на дубликаты
    const dupeCheck = checkDuplicateSpells(allSpells);
    setDuplicateInfo({ 
      count: dupeCheck.count,
      duplicates: dupeCheck.duplicates
    });
    
    console.log(`Загружено ${allSpells.length} заклинаний, найдено ${dupeCheck.count} дубликатов`);
  }, []);

  const handleRemoveDuplicates = () => {
    setIsProcessing(true);
    try {
      // Получаем заклинания без дубликатов
      const uniqueSpells = removeDuplicates(allSpells);
      
      // Обновляем информацию о количестве удаленных дубликатов
      const removedCount = allSpells.length - uniqueSpells.length;
      
      // Преобразуем в формат SpellData для отображения
      const spellData = convertToSpellData(uniqueSpells);
      setLocalSpells(spellData);
      
      // Обновляем информацию о дубликатах
      const dupeCheck = checkDuplicateSpells(uniqueSpells);
      setDuplicateInfo({
        count: dupeCheck.count,
        duplicates: dupeCheck.duplicates
      });
      
      toast({
        title: "Дубликаты удалены",
        description: `Успешно удалено ${removedCount} дубликатов заклинаний`,
        variant: "default",
      });
    } catch (error) {
      console.error("Ошибка при удалении дубликатов:", error);
      toast({
        title: "Ошибка обработки",
        description: "Не удалось удалить дубликаты заклинаний",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-accent bg-card/70">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Управление базой заклинаний</span>
          <Badge variant={duplicateInfo.count > 0 ? "destructive" : "outline"}>
            {duplicateInfo.count > 0 
              ? `Найдено ${duplicateInfo.count} дубликатов` 
              : "Дубликаты не найдены"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Всего заклинаний в базе: {localSpells.length}
              </p>
              {duplicateInfo.count > 0 && (
                <p className="text-sm text-destructive">
                  Рекомендуется удалить дубликаты для оптимальной работы
                </p>
              )}
            </div>
            
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Закрыть
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={handleRemoveDuplicates} 
                disabled={duplicateInfo.count === 0 || isProcessing}
              >
                {isProcessing ? "Обработка..." : "Удалить дубликаты"}
              </Button>
            </div>
          </div>
          
          {duplicateInfo.duplicates.length > 0 && (
            <div className="mt-4 border rounded p-2 max-h-[200px] overflow-y-auto">
              <h4 className="text-sm font-medium mb-2">Найденные дубликаты:</h4>
              <ul className="space-y-1">
                {duplicateInfo.duplicates.map((dupe, index) => (
                  <li key={index} className="text-xs text-muted-foreground">
                    {dupe.name} (уровень {dupe.level}) - {dupe.count} копий
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellDatabaseManager;
