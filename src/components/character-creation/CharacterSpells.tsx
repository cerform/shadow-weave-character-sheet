
import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { calculateAvailableSpellsByClassAndLevel, getMaxSpellLevel } from '@/utils/spellUtils';
import NavigationButtons from './NavigationButtons';
import CharacterSpellSelection from './CharacterSpellSelection';
import { useSpellbook } from '@/hooks/spellbook';

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
  const { loadSpellsForCharacter } = useSpellbook();

  // Основные магические классы
  const magicClasses = [
    'Бард', 'Жрец', 'Друид', 'Волшебник', 'Колдун', 
    'Чародей', 'Паладин', 'Следопыт'
  ];

  useEffect(() => {
    // Проверяем, есть ли у персонажа доступ к заклинаниям
    if (character && character.class && magicClasses.includes(character.class)) {
      setIsMagicUser(true);
      
      // Явно загружаем заклинания для класса персонажа с задержкой для стабильности
      const timer = setTimeout(() => {
        if (character.class && character.level) {
          console.log(`Загрузка заклинаний для ${character.class} (уровень ${character.level})`);
          loadSpellsForCharacter(character.class, character.level);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      // Если класс не магический, сразу переходим к следующему шагу
      onUpdate({ spells: [] });
      nextStep();
    }
  }, [character?.class, character?.level, magicClasses, nextStep, onUpdate, loadSpellsForCharacter]);

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
