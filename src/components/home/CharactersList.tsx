
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { User, Swords, Shield } from "lucide-react";
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';

const CharactersList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { getUserCharacters, loading: charactersLoading } = useCharacter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCharacters = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('CharactersList: Загрузка персонажей');
        const userCharacters = await getUserCharacters();
        console.log(`CharactersList: Получено ${userCharacters.length} персонажей`);
        setCharacters(userCharacters);
        setError(null);
      } catch (err) {
        console.error('CharactersList: Ошибка при загрузке персонажей', err);
        setError('Не удалось загрузить персонажей');
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, [isAuthenticated, getUserCharacters]);

  if (!isAuthenticated) {
    return (
      <Card className="shadow-lg border border-gray-800/30 bg-black/30 backdrop-blur-sm mt-8">
        <CardHeader>
          <CardTitle className="text-xl text-center">Персонажи</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>Войдите в систему, чтобы увидеть своих персонажей</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/auth"><User className="mr-2 h-4 w-4" /> Войти</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (loading || charactersLoading) {
    return (
      <Card className="shadow-lg border border-gray-800/30 bg-black/30 backdrop-blur-sm mt-8">
        <CardHeader>
          <CardTitle className="text-xl text-center">Загрузка персонажей...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border border-red-800/30 bg-black/30 backdrop-blur-sm mt-8">
        <CardHeader>
          <CardTitle className="text-xl text-center text-red-500">Ошибка</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>{error}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="destructive" onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (characters.length === 0) {
    return (
      <Card className="shadow-lg border border-gray-800/30 bg-black/30 backdrop-blur-sm mt-8">
        <CardHeader>
          <CardTitle className="text-xl text-center">Персонажи</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>У вас пока нет персонажей</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/character-creation"><Swords className="mr-2 h-4 w-4" /> Создать персонажа</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-philosopher mb-4">Ваши персонажи</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <Card 
            key={character.id} 
            className="shadow-lg border border-purple-700/30 bg-black/30 backdrop-blur-sm hover:shadow-purple-700/10 hover:border-purple-700/50 transition-all duration-300"
          >
            <CardHeader>
              <div className="flex items-center">
                <Shield className="h-6 w-6 mr-2 text-purple-500" />
                <CardTitle className="text-lg">{character.name || 'Безымянный герой'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Уровень: {character.level || 1}</p>
              <p>Класс: {character.class || '—'}</p>
              <p>Раса: {character.race || '—'}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link to={`/character/${character.id}`}>Открыть</Link>
              </Button>
              <Button asChild>
                <Link to={`/character/${character.id}`}>Играть</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        <Card className="shadow-lg border border-dashed border-gray-700 bg-black/20 backdrop-blur-sm hover:border-purple-700/50 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center h-full py-10">
            <Swords className="h-12 w-12 mb-4 text-gray-500" />
            <p className="text-center mb-4">Создать нового персонажа</p>
            <Button asChild>
              <Link to="/character-creation">Создать</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CharactersList;
