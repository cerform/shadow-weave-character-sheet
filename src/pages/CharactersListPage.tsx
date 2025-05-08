
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CharactersTable } from '@/components/characters/CharactersTable';
import { Character } from '@/types/character';
import { database } from '@/services/database';

const CharactersListPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const userCharacters = await database.getCharacters();
        setCharacters(userCharacters || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching characters:', err);
        setError('Не удалось загрузить персонажей');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const handleCreateCharacter = () => {
    navigate('/character-creation');
  };

  const handleViewCharacter = (id: string) => {
    navigate(`/character/${id}`);
  };

  const handleEditCharacter = (id: string) => {
    navigate(`/character/${id}/edit`);
  };

  const handleDeleteCharacter = async (id: string) => {
    try {
      await database.deleteCharacter(id);
      setCharacters(characters.filter(char => char.id !== id));
    } catch (err) {
      console.error('Error deleting character:', err);
      setError('Не удалось удалить персонажа');
    }
  };

  // Fixed function with a required argument and default value
  const handleSomeFunction = (arg: any = {}) => {
    console.log(arg);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl">Мои персонажи</CardTitle>
          <Button onClick={handleCreateCharacter}>Создать персонажа</Button>
        </CardHeader>
        <CardContent>
          <CharactersTable 
            characters={characters}
            loading={loading}
            error={error}
            onView={handleViewCharacter}
            onEdit={handleEditCharacter}
            onDelete={handleDeleteCharacter}
          />
          
          {/* Исправленный вызов функции с аргументом */}
          <Button onClick={() => handleSomeFunction({})}>Тест</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CharactersListPage;
