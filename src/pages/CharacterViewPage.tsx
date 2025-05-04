
import React from 'react';
import { useParams } from 'react-router-dom';
import NotFound from './NotFound';
import CharacterSheet from '@/components/character-sheet/CharacterSheet';
import { useCharacter } from '@/contexts/CharacterContext';

const CharacterViewPage: React.FC = () => {
  const { character, characters } = useCharacter();
  const { id } = useParams<{ id: string }>();

  // Ищем персонажа по id в списке персонажей
  const selectedCharacter = character || characters.find(char => char.id === id) || null;

  if (!selectedCharacter && id) {
    return <NotFound />;
  }

  return (
    <div>
      {selectedCharacter ? (
        <CharacterSheet character={selectedCharacter} />
      ) : (
        <p>Выберите персонажа или создайте нового.</p>
      )}
    </div>
  );
};

export default CharacterViewPage;
