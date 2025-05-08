
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { calculateAvailableSpellsByClassAndLevel } from '@/utils/spellUtils';

interface SpellbookContextType {
  selectedSpells: SpellData[];
  availableSpells: SpellData[];
  loading: boolean;
  error: Error | null;
  addSpell: (spell: SpellData) => void;
  removeSpell: (spellId: string) => void;
  getSpellLimits: (characterClass: string, level: number, modifier?: number) => { 
    maxSpellLevel: number;
    cantripsCount: number;
    knownSpells: number;
  };
  getSelectedSpellCount: (level?: number) => number;
  resetSpells: () => void;
  saveCharacterSpells: () => void;
  loadSpellsForCharacter: (characterClass: string, level: number) => Promise<SpellData[]>;
}

const SpellbookContext = createContext<SpellbookContextType>({
  selectedSpells: [],
  availableSpells: [],
  loading: false,
  error: null,
  addSpell: () => {},
  removeSpell: () => {},
  getSpellLimits: () => ({ maxSpellLevel: 0, cantripsCount: 0, knownSpells: 0 }),
  getSelectedSpellCount: () => 0,
  resetSpells: () => {},
  saveCharacterSpells: () => {},
  loadSpellsForCharacter: async () => []
});

export const SpellbookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Добавление заклинания в список выбранных
  const addSpell = useCallback((spell: SpellData) => {
    setSelectedSpells(prev => {
      // Проверяем, есть ли заклинание уже в списке
      const exists = prev.some(s => s.id === spell.id || s.name === spell.name);
      if (exists) return prev;
      return [...prev, spell];
    });
  }, []);
  
  // Удаление заклинания из списка выбранных
  const removeSpell = useCallback((spellId: string) => {
    setSelectedSpells(prev => 
      prev.filter(spell => spell.id !== spellId && spell.name !== spellId)
    );
  }, []);
  
  // Получение лимитов заклинаний на основе класса и уровня
  const getSpellLimits = useCallback((characterClass: string, level: number, modifier: number = 0) => {
    return calculateAvailableSpellsByClassAndLevel(characterClass, level, modifier);
  }, []);
  
  // Получение количества выбранных заклинаний определенного уровня
  const getSelectedSpellCount = useCallback((level?: number) => {
    if (level === undefined) return selectedSpells.length;
    return selectedSpells.filter(spell => spell.level === level).length;
  }, [selectedSpells]);
  
  // Сброс выбранных заклинаний
  const resetSpells = useCallback(() => {
    setSelectedSpells([]);
  }, []);
  
  // Сохранение выбранных заклинаний персонажу
  const saveCharacterSpells = useCallback(() => {
    // Здесь можно добавить логику сохранения заклинаний в localStorage, базу данных или другое хранилище
    console.log('Сохранение заклинаний:', selectedSpells);
  }, [selectedSpells]);
  
  // Загрузка заклинаний для определенного класса и уровня
  const loadSpellsForCharacter = useCallback(async (characterClass: string, level: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Заглушка для демонстрации
      // В реальном приложении здесь должен быть запрос к API или базе данных
      console.log(`Загрузка заклинаний для ${characterClass} (уровень ${level})`);
      
      // Добавляем задержку для имитации загрузки с сервера
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(characterClass, level);
      
      // Здесь должна быть логика получения заклинаний для класса
      // Пример простых заклинаний для демонстрации
      const mockSpells: SpellData[] = [
        {
          id: 'spell-light',
          name: 'Свет',
          level: 0,
          school: 'Вызов',
          castingTime: '1 действие',
          range: 'Касание',
          components: 'ВМ',
          duration: '1 час',
          description: ['Вы касаетесь одного объекта, не превышающего 10 футов в любом измерении. До окончания заклинания объект испускает яркий свет в радиусе 20 футов.'],
          classes: ['Бард', 'Волшебник', 'Жрец']
        },
        {
          id: 'spell-mage-hand',
          name: 'Волшебная рука',
          level: 0,
          school: 'Вызов',
          castingTime: '1 действие',
          range: '30 футов',
          components: 'ВС',
          duration: '1 минута',
          description: ['Призрачная плавающая рука появляется в указанной вами точке.'],
          classes: ['Бард', 'Волшебник', 'Чародей']
        },
        {
          id: 'spell-mage-armor',
          name: 'Волшебная броня',
          level: 1,
          school: 'Ограждение',
          castingTime: '1 действие',
          range: 'Касание',
          components: 'ВСМ',
          duration: '8 часов',
          description: ['Вы касаетесь согласного существа, не носящего доспехи. Пока заклинание активно, КД существа равно 13 + его модификатор Ловкости.'],
          classes: ['Волшебник']
        },
        {
          id: 'spell-healing-word',
          name: 'Лечащее слово',
          level: 1,
          school: 'Вызов',
          castingTime: '1 бонусное действие',
          range: '60 футов',
          components: 'В',
          duration: 'Мгновенная',
          description: ['Вы произносите слово исцеления и существо на ваш выбор, видимое вами в радиусе действия, восстанавливает 1d4 + ваш модификатор базовой характеристики хиты.'],
          classes: ['Бард', 'Жрец', 'Друид']
        }
      ];
      
      setAvailableSpells(mockSpells);
      return mockSpells;
    } catch (err) {
      console.error('Ошибка загрузки заклинаний:', err);
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка при загрузке заклинаний'));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  const value: SpellbookContextType = {
    selectedSpells,
    availableSpells,
    loading,
    error,
    addSpell,
    removeSpell,
    getSpellLimits,
    getSelectedSpellCount,
    resetSpells,
    saveCharacterSpells,
    loadSpellsForCharacter
  };
  
  return (
    <SpellbookContext.Provider value={value}>
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => useContext(SpellbookContext);
