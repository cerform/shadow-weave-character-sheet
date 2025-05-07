
// Замените импорт на правильный
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { getAllSpells } from '@/data/spells';
import { CharacterSpell } from '@/types/character';

const SpellDatabaseManager: React.FC = () => {
  const [spells, setSpells] = useState<CharacterSpell[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<CharacterSpell[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Используем функцию getAllSpells вместо прямого импорта
      const allSpells = getAllSpells();
      setSpells(allSpells);
      setFilteredSpells(allSpells);
      setLoading(false);
    } catch (error) {
      console.error('Error loading spells:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить базу данных заклинаний.',
        variant: 'destructive'
      });
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = spells.filter(
        spell => spell.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSpells(filtered);
    } else {
      setFilteredSpells(spells);
    }
  }, [searchTerm, spells]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="search">Поиск заклинаний</Label>
        <Input
          id="search"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Введите название заклинания..."
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Результаты ({filteredSpells.length})</h2>
        <div className="space-y-2">
          {filteredSpells.map(spell => (
            <div key={spell.id || spell.name} className="p-2 border rounded">
              <h3 className="font-semibold">{spell.name}</h3>
              <p className="text-sm text-gray-500">
                {spell.level === 0 ? 'Заговор' : `Уровень ${spell.level}`} - {spell.school}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpellDatabaseManager;
