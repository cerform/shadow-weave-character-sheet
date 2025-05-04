
import { useState, useMemo } from 'react';
import { Character } from '@/contexts/CharacterContext';
import { RacialTraits, ClassFeatures, Background, ABILITY_SCORE_CAPS } from '@/types/character';
import { simpleArray } from '@/lib/simpleArray';
import { useToast } from './use-toast';
import { racialTraits } from '@/data/racialTraits';
import { classFeatures } from '@/data/classFeatures';
import { backgrounds } from '@/data/backgrounds';
import { useNavigate } from 'react-router-dom';

export const useCharacterCreation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Базовое состояние персонажа
  const [character, setCharacter] = useState<Character>({
    name: '',
    race: '',
    class: '',
    level: 1,
    abilities: {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      strength: 10,
      dexterity: 10,
      constitution: 10, 
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    proficiencies: [],
    equipment: [],
    spells: [],
    languages: [],
    gender: '',
    alignment: '',
    background: '',
    backstory: ''
  });

  // Обновление характеристик персонажа
  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prev => ({ ...prev, ...updates }));
  };

  // Обработчик смены уровня персонажа
  const handleLevelChange = (level: number) => {
    // Проверяем, что уровень в допустимом диапазоне (1-20)
    const validLevel = Math.max(1, Math.min(20, level));
    setCharacter(prev => ({ ...prev, level: validLevel }));
  };

  // Расчет модификатора характеристики
  const getModifier = (abilityScore: number | undefined) => {
    if (!abilityScore) return 0;
    return Math.floor((abilityScore - 10) / 2);
  };

  // Проверка, является ли класс магическим
  const isMagicClass = () => {
    const magicClasses = ['Бард', 'Волшебник', 'Жрец', 'Колдун', 'Паладин', 'Следопыт', 'Чародей', 'Друид'];
    return magicClasses.includes(character.class);
  };

  // Расчет количества очков характеристик на основе уровня
  const getAbilityScorePointsByLevel = (basePoints: number) => {
    // При достижении 4, 8, 12, 16 и 19 уровней персонаж получает +2 очка характеристик
    const levelBonuses = [4, 8, 12, 16, 19];
    
    // Считаем, сколько уровней из бонусных уже достигнуто
    const bonusesApplied = levelBonuses.filter(lvl => character.level >= lvl).length;
    
    // Каждый бонус дает +2 очка к базовому значению
    return basePoints + (bonusesApplied * 2);
  };
  
  // Получение расовых особенностей
  const getRacialTraits = (): RacialTraits | undefined => {
    return racialTraits.find(r => r.race === character.race);
  };
  
  // Получение особенностей класса
  const getClassFeatures = (): ClassFeatures | undefined => {
    return classFeatures.find(c => c.name === character.class);
  };
  
  // Получение деталей предыстории
  const getBackgroundDetails = (): Background | undefined => {
    return backgrounds.find(b => b.name === character.background);
  };

  // Проверка готовности персонажа
  const isCharacterValid = useMemo(() => {
    const requiredFields = [
      character.name,
      character.race,
      character.class,
      character.background,
      character.gender,
      character.alignment,
      character.backstory
    ];
    
    return requiredFields.every(field => field && field.trim() !== '');
  }, [character]);
  
  // Функция для сохранения персонажа
  const saveCharacter = async () => {
    if (!isCharacterValid) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля персонажа",
        variant: "destructive"
      });
      return;
    }
    
    // TODO: Сохранение персонажа в базу данных или локальное хранилище
    
    toast({
      title: "Успех",
      description: "Персонаж успешно создан",
    });
    
    // Перенаправление на экран листа персонажа
    navigate(`/character-sheet/${character.id || 'new'}`);
  };
  
  // Возвращаем все нужные данные и функции
  return {
    character,
    updateCharacter,
    getModifier,
    isMagicClass,
    handleLevelChange,
    getAbilityScorePointsByLevel,
    getRacialTraits,
    getClassFeatures,
    getBackgroundDetails,
    isCharacterValid,
    saveCharacter
  };
};
