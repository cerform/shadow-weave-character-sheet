import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/components/ui/use-toast';
import { spells } from '@/data/spells'; // Import directly from spells
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  importSpellsFromTextFormat, 
  checkDuplicateSpells,
  removeDuplicates
} from '@/utils/updateSpellDatabase';
import { SpellData } from '@/types/spells';
import { parseComponents } from '@/utils/spellProcessors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Check, Trash } from 'lucide-react';

const SpellDatabaseManager: React.FC = () => {
  const [rawData, setRawData] = useState('');
  const [processedSpells, setProcessedSpells] = useState<SpellData[]>([]);
  const [allSpells, setAllSpells] = useState<SpellData[]>([]);
  const [duplicatesInfo, setDuplicatesInfo] = useState<{ 
    hasDuplicates: boolean; 
    count: number;
    duplicates: Array<{name: string, level: number, count: number}>
  }>({ hasDuplicates: false, count: 0, duplicates: [] });
  
  const { toast } = useToast();

  useEffect(() => {
    setAllSpells(spells); // Use the imported spells array directly
    
    // Проверяем наличие дубликатов при загрузке
    const dupes = checkDuplicateSpells(spells);
    setDuplicatesInfo(dupes);
  }, []);
  
  const handleImport = () => {
    if (!rawData.trim()) {
      toast({
        title: "Ошибка импорта",
        description: "Пожалуйста, введите данные заклинаний для импорта",
        variant: "destructive"
      });
      return;
    }

    try {
      // Подсчитываем количество строк во входных данных
      const inputLines = rawData.split('\n').filter(line => line.trim() !== '');
      const inputSpellsCount = inputLines.length;
      
      // Количество заклинаний до импорта
      const beforeCount = allSpells.length;
      
      // Импортируем заклинания
      const updated = importSpellsFromTextFormat(rawData, allSpells);
      
      // Количество заклинаний после импорта
      const afterCount = updated.length;
      
      // Определяем новые заклинания
      const newSpells = updated.slice(beforeCount);
      
      // Подсчитываем дубликаты
      const duplicates = inputSpellsCount - (afterCount - beforeCount);
      
      setProcessedSpells(newSpells);
      setAllSpells(updated);
      
      // Проверяем наличие дубликатов
      const dupes = checkDuplicateSpells(updated);
      setDuplicatesInfo(dupes);
      
      toast({
        title: "Импорт успешен",
        description: `Добавлено ${newSpells.length} новых заклинаний${duplicates > 0 ? `, пропущено ${duplicates} дубликатов` : ''}`,
      });
    } catch (error) {
      toast({
        title: "Ошибка обработки",
        description: `Произошла ошибка: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  };

  const handleRemoveDuplicates = () => {
    const deduplicatedSpells = removeDuplicates(allSpells);
    const removedCount = allSpells.length - deduplicatedSpells.length;
    
    setAllSpells(deduplicatedSpells);
    
    // Обновляем информацию о дубликатах
    const dupes = checkDuplicateSpells(deduplicatedSpells);
    setDuplicatesInfo(dupes);
    
    toast({
      title: "Дубликаты удалены",
      description: `Удалено ${removedCount} дублирующихся заклинаний`,
      variant: "success"
    });
  };

  const getSpellsByLevel = (level: number): SpellData[] => {
    return allSpells.filter(spell => spell.level === level);
  };

  const getLevelCompletion = (level: number): number => {
    const spells = getSpellsByLevel(level);
    if (spells.length === 0) return 0;
    
    const withComponents = spells.filter(
      spell => spell.verbal !== undefined || spell.somatic !== undefined || spell.material !== undefined
    );
    
    return Math.round((withComponents.length / spells.length) * 100);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Управление базой заклинаний</h2>
      
      <Tabs defaultValue="import">
        <TabsList>
          <TabsTrigger value="import">Импорт заклинаний</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
          <TabsTrigger value="duplicates">Дубликаты</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import" className="space-y-4 pt-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Импорт заклинаний</h3>
            <p className="text-sm text-muted-foreground">
              Вставьте список заклинаний в формате [уровень] Название заклинания ВСМ
            </p>
            <Textarea 
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              placeholder="Пример: [0] Брызги кислоты ВС."
              className="min-h-[200px]"
            />
            <Button onClick={handleImport}>Обработать</Button>
          </div>
          
          {duplicatesInfo.hasDuplicates && (
            <Alert variant="warning" className="bg-yellow-50 border-yellow-300">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Обнаружено {duplicatesInfo.count} дублирующихся заклинаний в базе. 
                Перейдите на вкладку "Дубликаты" для очистки.
              </AlertDescription>
            </Alert>
          )}

          {processedSpells.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Обработанные заклинания ({processedSpells.length})</h3>
              <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Уровень</th>
                      <th className="text-left p-2">Название</th>
                      <th className="text-left p-2">Компоненты</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedSpells.map((spell, index) => (
                      <tr key={index} className="border-b hover:bg-secondary/20">
                        <td className="p-2">{spell.level}</td>
                        <td className="p-2">{spell.name}</td>
                        <td className="p-2">
                          {spell.verbal ? 'В ' : ''}
                          {spell.somatic ? 'С ' : ''}
                          {spell.material ? 'М ' : ''}
                          {spell.ritual ? 'Р ' : ''}
                          {spell.concentration ? 'К ' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4 pt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Статистика базы заклинаний</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Общая статистика</h4>
                <div className="space-y-2">
                  <p>Всего заклинаний: {allSpells.length}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                        <Badge key={level} variant="outline" className="text-xs">
                          {level}: {getSpellsByLevel(level).length}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Полнота данных</h4>
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                    <div key={level} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Уровень {level === 0 ? "0 (заговоры)" : level}</span>
                        <span>{getLevelCompletion(level)}%</span>
                      </div>
                      <Progress value={getLevelCompletion(level)} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Распределение по уровням</h4>
              <ul className="list-disc pl-5 space-y-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                <li>Заговоры (0): {getSpellsByLevel(0).length}</li>
                <li>1 уровень: {getSpellsByLevel(1).length}</li>
                <li>2 уровень: {getSpellsByLevel(2).length}</li>
                <li>3 уровень: {getSpellsByLevel(3).length}</li>
                <li>4 уровень: {getSpellsByLevel(4).length}</li>
                <li>5 уровень: {getSpellsByLevel(5).length}</li>
                <li>6 уровень: {getSpellsByLevel(6).length}</li>
                <li>7 уровень: {getSpellsByLevel(7).length}</li>
                <li>8 уровень: {getSpellsByLevel(8).length}</li>
                <li>9 уровень: {getSpellsByLevel(9).length}</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="duplicates" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Проверка дубликатов</h3>
              {duplicatesInfo.hasDuplicates && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleRemoveDuplicates}
                  className="flex items-center gap-2"
                >
                  <Trash className="h-4 w-4" />
                  <span>Удалить все дубликаты</span>
                </Button>
              )}
            </div>
            
            {duplicatesInfo.hasDuplicates ? (
              <>
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Найдены дубликаты</AlertTitle>
                  <AlertDescription>
                    В базе данных заклинаний обнаружено {duplicatesInfo.count} дубликатов. 
                    Рекомендуется их удалить для повышения производительности и избежания ошибок.
                  </AlertDescription>
                </Alert>
                
                <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Уровень</th>
                        <th className="text-left p-2">Название</th>
                        <th className="text-left p-2">Количество дубликатов</th>
                      </tr>
                    </thead>
                    <tbody>
                      {duplicatesInfo.duplicates.map((dupe, index) => (
                        <tr key={index} className="border-b hover:bg-secondary/20">
                          <td className="p-2">{dupe.level === 0 ? 'Заговор' : `${dupe.level} уровень`}</td>
                          <td className="p-2">{dupe.name}</td>
                          <td className="p-2">{dupe.count} копий</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <Alert>
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Дубликатов не обнаружено! База данных заклинаний содержит только уникальные записи.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpellDatabaseManager;
