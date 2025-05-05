
import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { calculateKnownSpells, getMaxSpellLevel, normalizeSpells } from '@/utils/spellUtils';
import NavigationButtons from './NavigationButtons';
import CharacterSpellSelection from './CharacterSpellSelection';

interface CharacterSpellsProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterSpells: React.FC<CharacterSpellsProps> = ({
  character,
  onUpdate,
  nextStep = () => {},
  prevStep = () => {}
}) => {
  const [isMagicUser, setIsMagicUser] = useState(false);

  // Основные магические классы
  const magicClasses = [
    'Бард', 'Жрец', 'Друид', 'Волшебник', 'Колдун', 
    'Чародей', 'Паладин', 'Следопыт'
  ];

  useEffect(() => {
    // Проверяем, есть ли у персонажа доступ к заклинаниям
    if (character.class && magicClasses.includes(character.class)) {
      setIsMagicUser(true);
    } else {
      // Если класс не магический, сразу переходим к следующему шагу
      onUpdate({ spells: [] });
      nextStep();
    }
  }, [character.class]);

  if (!isMagicUser) {
    return null; // Ничего не рендерим, если класс не магический
  }

  return (
    <CharacterSpellSelection
      character={character}
      updateCharacter={onUpdate}
      nextStep={nextStep}
      prevStep={prevStep}
    />
  );
};

export default CharacterSpells;
