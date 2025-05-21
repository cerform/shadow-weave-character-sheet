
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
  createCharacter: () => void;
  isMagicClass: boolean;
  convertToCharacter: (data: any) => Character;
  nextStep: () => void;
  prevStep: () => void;
}

export const useCharacterCreation = (): UseCharacterCreationReturn => {
  const { saveCharacter } = useCharacter();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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
  const createCharacter = () => {
    try {
      // Убедимся, что у персонажа есть имя
      if (!character.name || character.name.trim() === '') {
        alert('Пожалуйста, укажите имя персонажа');
        return;
      }

      // Сохраняем персонажа
      const savedCharacter = saveCharacter(character);

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
    // Простая реализация - копируем все свойства
    return {
      ...createDefaultCharacter(),
      ...data,
    };
  };

  // Функция для перехода к следующему шагу
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  // Функция для перехода к предыдущему шагу
  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
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
