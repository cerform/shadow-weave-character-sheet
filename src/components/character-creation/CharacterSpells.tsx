
import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { calculateAvailableSpellsByClassAndLevel, getMaxSpellLevel } from '@/utils/spellUtils';
import NavigationButtons from './NavigationButtons';
import CharacterSpellSelection from './CharacterSpellSelection';
import { useSpellbook } from '@/contexts/SpellbookContext';
import { getAllSpells, getSpellsByClass } from '@/data/spells';

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
  const { loadSpells } = useSpellbook();

  // Основные магические классы
  const magicClasses = [
    'Бард', 'Жрец', 'Друид', 'Волшебник', 'Колдун', 
    'Чародей', 'Паладин', 'Следопыт'
  ];

  useEffect(() => {
    // Проверяем, есть ли у персонажа доступ к заклинаниям
    if (character.class && magicClasses.includes(character.class)) {
      setIsMagicUser(true);
      
      // Явно загружаем заклинания для класса персонажа
      if (character.class && character.level) {
        console.log(`Загрузка заклинаний для ${character.class} (уровень ${character.level})`);
        loadSpells();
      }
    } else {
      // Если класс не магический, сразу переходим к следующему шагу
      onUpdate({ spells: [] });
      nextStep();
    }
  }, [character.class, character.level, magicClasses, nextStep, onUpdate, loadSpells]);

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
