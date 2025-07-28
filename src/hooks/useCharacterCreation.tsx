
import { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { useNavigate } from 'react-router-dom';
import { createDefaultCharacter } from '@/utils/characterUtils';
import { useCharacter } from '@/contexts/CharacterContext';

// Определяем тип возвращаемых значений из хука
export interface UseCharacterCreationReturn {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  createCharacter: () => Promise<void>;
  isMagicClass: boolean;
  convertToCharacter: (data: any) => Character;
  nextStep: () => void;
  prevStep: () => void;
}

export const useCharacterCreation = (): UseCharacterCreationReturn => {
  const { saveCharacter } = useCharacter();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [character, setCharacter] = useState<Character>(createDefaultCharacter());

  // При монтировании компонента инициализируем персонажа
  useEffect(() => {
    // Проверяем, есть ли сохраненный процесс создания
    const savedCharacterCreation = localStorage.getItem('character_creation_progress');
    if (savedCharacterCreation) {
      try {
        const parsedData = JSON.parse(savedCharacterCreation);
        setCharacter(parsedData.character);
        setCurrentStep(parsedData.step);
      } catch (error) {
        console.error('Ошибка при загрузке процесса создания:', error);
        // В случае ошибки используем дефолтные значения
        setCharacter(createDefaultCharacter());
      }
    }
  }, []);

  // Сохраняем прогресс создания персонажа при каждом изменении
  useEffect(() => {
    // Сохраняем данные в localStorage
    try {
      localStorage.setItem('character_creation_progress', JSON.stringify({
        character,
        step: currentStep
      }));
    } catch (error) {
      console.error('Ошибка при сохранении прогресса:', error);
    }
  }, [character, currentStep]);

  // Проверяем, является ли выбранный класс магическим
  const isMagicClass = !!character.class && ['Волшебник', 'Колдун', 'Чародей', 'Бард', 'Друид', 'Жрец', 'Паладин', 'Следопыт'].includes(character.class);

  // Функция для обновления данных персонажа
  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => ({ ...prev, ...updates }));
  };

  // Функция для создания персонажа
  const createCharacter = async () => {
    try {
      // Убедимся, что у персонажа есть имя
      if (!character.name || character.name.trim() === '') {
        alert('Пожалуйста, укажите имя персонажа');
        return;
      }

      // Сохраняем персонажа
      const savedCharacter = await saveCharacter(character);

      // Очищаем данные о процессе создания
      localStorage.removeItem('character_creation_progress');

      // Переходим на страницу просмотра персонажа
      if (savedCharacter && savedCharacter.id) {
        navigate(`/characters/${savedCharacter.id}`);
      } else {
        console.error('Не удалось получить ID сохраненного персонажа');
        navigate('/characters');
      }
    } catch (error) {
      console.error('Ошибка при создании персонажа:', error);
      alert('Произошла ошибка при создании персонажа');
    }
  };

  // Функция для конвертации данных в объект Character
  const convertToCharacter = (data: any): Character => {
    // Создаем базовый объект персонажа
    const baseCharacter = createDefaultCharacter();
    
    // Объединяем с переданными данными, заменяя undefined на значения по умолчанию
    const merged = { ...baseCharacter, ...data };
    
    // Проходимся по всем полям и заменяем undefined на значения по умолчанию
    const result: any = {};
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined) {
        result[key] = value;
      } else if (key in baseCharacter) {
        result[key] = (baseCharacter as any)[key];
      }
    }
    
    // Исправляем характеристики - берем из stats если основные поля пустые
    if (result.stats) {
      result.strength = result.strength !== 10 ? result.strength : (result.stats.strength || 10);
      result.dexterity = result.dexterity !== 10 ? result.dexterity : (result.stats.dexterity || 10);
      result.constitution = result.constitution !== 10 ? result.constitution : (result.stats.constitution || 10);
      result.intelligence = result.intelligence !== 10 ? result.intelligence : (result.stats.intelligence || 10);
      result.wisdom = result.wisdom !== 10 ? result.wisdom : (result.stats.wisdom || 10);
      result.charisma = result.charisma !== 10 ? result.charisma : (result.stats.charisma || 10);
      
      // Обновляем stats объект тоже
      result.stats = {
        strength: result.strength,
        dexterity: result.dexterity,
        constitution: result.constitution,
        intelligence: result.intelligence,
        wisdom: result.wisdom,
        charisma: result.charisma,
      };
    }
    
    // Обеспечиваем обязательные поля
    result.name = result.name || '';
    result.race = result.race || '';
    result.class = result.class || '';
    result.level = result.level || 1;
    result.userId = result.userId || '';
    result.spells = result.spells || [];
    result.equipment = result.equipment || [];
    result.money = result.money || { gp: 0, sp: 0, cp: 0 };
    
    console.log('🔄 Конвертированный персонаж:', result);
    
    return result as Character;
  };

  // Функция для перехода к следующему шагу
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  // Функция для перехода к предыдущему шагу
  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  return {
    currentStep,
    setCurrentStep,
    character,
    updateCharacter,
    createCharacter,
    isMagicClass,
    convertToCharacter,
    nextStep,
    prevStep
  };
};
