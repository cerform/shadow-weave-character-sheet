
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { importSpellsFromText } from '@/utils/spellHelpers';
import { CharacterSpell } from '@/types/character';
import { getAllSpells } from '@/data/spells';

interface SpellImporterProps {
  onImport: (spells: CharacterSpell[]) => void;
  existingSpells?: CharacterSpell[];
}

const SpellImporter: React.FC<SpellImporterProps> = ({ onImport, existingSpells = [] }) => {
  const [inputText, setInputText] = useState('');
  const [parseResults, setParseResults] = useState<CharacterSpell[]>([]);

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const parseSpells = () => {
    if (!inputText.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите текст для импорта заклинаний.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const parsedSpells = importSpellsFromText(inputText, existingSpells);
      const newSpells = parsedSpells.filter(spell => 
        !existingSpells.some(existing => 
          existing.name === spell.name
        )
      );

      if (newSpells.length === 0) {
        toast({
          title: 'Внимание',
          description: 'Не найдено новых заклинаний или все заклинания уже добавлены.',
          variant: 'destructive'
        });
        return;
      }

      setParseResults(newSpells);
      toast({
        title: 'Заклинания найдены',
        description: `Найдено ${newSpells.length} новых заклинаний.`,
      });
    } catch (error) {
      console.error('Error parsing spells:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось распознать заклинания из текста.',
        variant: 'destructive'
      });
    }
  };

  const confirmImport = () => {
    if (parseResults.length === 0) {
      toast({
        title: 'Предупреждение',
        description: 'Нет заклинаний для импорта.',
        variant: 'destructive'
      });
      return;
    }

    onImport(parseResults);
    toast({
      title: 'Успех',
      description: `Импортировано ${parseResults.length} заклинаний.`,
    });
    setInputText('');
    setParseResults([]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Импорт заклинаний</h2>
        <p className="text-sm text-gray-500 mb-4">
          Вставьте текст с заклинаниями для импорта. Каждое заклинание должно быть на отдельной строке.
        </p>
        <Textarea
          value={inputText}
          onChange={handleTextInput}
          rows={10}
          placeholder="Вставьте список заклинаний..."
          className="font-mono"
        />
        <Button onClick={parseSpells} className="mt-2">
          Проверить заклинания
        </Button>
      </div>

      {parseResults.length > 0 && (
        <div className="border p-4 rounded-md">
          <h3 className="font-semibold mb-2">Найдено {parseResults.length} заклинаний:</h3>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {parseResults.map((spell, index) => (
              <div key={index} className="text-sm p-1 border-b">
                <span className="font-medium">{spell.name}</span>
                <span className="ml-2 text-gray-500">
                  ({spell.level === 0 ? 'Заговор' : `${spell.level} уровень`})
                </span>
                {spell.school && <span className="ml-2 text-gray-500">{spell.school}</span>}
              </div>
            ))}
          </div>
          <div className="mt-4 space-x-2">
            <Button onClick={confirmImport}>Импортировать</Button>
            <Button variant="outline" onClick={() => setParseResults([])}>
              Отмена
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpellImporter;
