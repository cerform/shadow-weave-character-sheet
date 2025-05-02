
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { processSpellEntries } from '@/utils/spellImporter';
import { useToast } from '@/components/ui/use-toast';
import { CharacterSpell } from '@/types/character';
import { cantrips } from '@/data/spells/level0';
import { level1 } from '@/data/spells/level1';
import { level2 } from '@/data/spells/level2';
import { level3 } from '@/data/spells/level3';
import { level4 } from '@/data/spells/level4';
import { level5 } from '@/data/spells/level5';
import { level6 } from '@/data/spells/level6';
import { level7 } from '@/data/spells/level7';
import { level8 } from '@/data/spells/level8';

const SpellDatabaseManager: React.FC = () => {
  const [rawData, setRawData] = useState('');
  const [processedSpells, setProcessedSpells] = useState<Array<any>>([]);
  const { toast } = useToast();

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
      const processed = processSpellEntries(rawData);
      setProcessedSpells(processed);
      
      toast({
        title: "Импорт успешен",
        description: `Обработано ${processed.length} заклинаний`,
      });
    } catch (error) {
      toast({
        title: "Ошибка обработки",
        description: `Произошла ошибка: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  };

  const getAllSpells = (): CharacterSpell[] => {
    return [
      ...cantrips,
      ...level1,
      ...level2,
      ...level3,
      ...level4,
      ...level5,
      ...level6,
      ...level7,
      ...level8,
    ];
  };

  const getSpellsByLevel = (level: number): CharacterSpell[] => {
    return getAllSpells().filter(spell => spell.level === level);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Управление базой заклинаний</h2>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Импорт заклинаний</h3>
        <Textarea 
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
          placeholder="Вставьте список заклинаний в формате [уровень] Название заклинания ВСМ"
          className="min-h-[200px]"
        />
        <Button onClick={handleImport}>Обработать</Button>
      </div>

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
                      {spell.components.verbal ? 'В ' : ''}
                      {spell.components.somatic ? 'С ' : ''}
                      {spell.components.material ? 'М ' : ''}
                      {spell.components.ritual ? 'Р ' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Текущая база заклинаний</h3>
        <div>
          <p>Всего заклинаний: {getAllSpells().length}</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
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
    </div>
  );
};

export default SpellDatabaseManager;
