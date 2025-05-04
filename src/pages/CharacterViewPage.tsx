
import React from 'react';
import { useParams } from 'react-router-dom';
import NotFound from './NotFound';
import CharacterSheet from '@/components/character-sheet/CharacterSheet';
import { useCharacter } from '@/contexts/CharacterContext';
import HomeButton from '@/components/navigation/HomeButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CharacterViewPage: React.FC = () => {
  const { character, characters } = useCharacter();
  const { id } = useParams<{ id: string }>();

  // Ищем персонажа по id в списке персонажей
  const selectedCharacter = character || characters.find(char => char.id === id) || null;

  if (!selectedCharacter && id) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!selectedCharacter ? (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Персонаж не выбран</span>
              <HomeButton />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Выберите персонажа или создайте нового.</p>
          </CardContent>
        </Card>
      ) : (
        <CharacterSheet character={selectedCharacter} />
      )}
    </div>
  );
};

export default CharacterViewPage;
