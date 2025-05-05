
import { useState, useEffect, useCallback } from 'react';
import { races } from '@/data/races';
import { SubraceProps } from '@/components/character-creation/SubraceCard';

interface UseSubraceSelectionProps {
  race: string;
  initialSubrace: string;
  onSubraceSelect: (subrace: string) => void;
}

export const useSubraceSelection = ({ 
  race, 
  initialSubrace, 
  onSubraceSelect 
}: UseSubraceSelectionProps) => {
  const [selectedSubrace, setSelectedSubrace] = useState<string>(initialSubrace || '');
  const [availableSubraces, setAvailableSubraces] = useState<Omit<SubraceProps, 'selected' | 'onClick'>[]>([]);
  const [autoRedirectAttempted, setAutoRedirectAttempted] = useState<boolean>(false);
  const [hasSubraces, setHasSubraces] = useState<boolean>(false);

  // Функция для преобразования данных подрасы
  const mapSubraceData = useCallback((subrace: any, raceData: any) => {
    if (typeof subrace === 'string') {
      const details = (raceData as any).subRaceDetails ? 
        (raceData as any).subRaceDetails[subrace] || {} : 
        {};
          
      return {
        name: subrace,
        description: details.description || `Подраса ${subrace}`,
        traits: details.traits || [],
        abilityScoreIncrease: details.abilityScoreIncrease || {}
      };
    } else {
      return {
        name: subrace.name || 'Неизвестная подраса',
        description: typeof subrace.description === 'string' 
          ? subrace.description 
          : 'Подробное описание',
        traits: Array.isArray(subrace.traits) ? subrace.traits : [],
        abilityScoreIncrease: subrace.abilityScoreIncrease || {}
      };
    }
  }, []);

  // Проверка валидности подрасы
  const isValidSubrace = useCallback((raceName: string, subraceName: string) => {
    if (!raceName || !subraceName) return false;
    
    const raceData = races.find(r => r.name === raceName);
    if (!raceData || !raceData.subraces) return false;
    
    return raceData.subraces.some(sr => {
      if (typeof sr === 'string') {
        return sr === subraceName;
      } else if (typeof sr === 'object' && sr !== null) {
        return sr.name === subraceName;
      }
      return false;
    });
  }, []);

  // Загрузка доступных подрас при изменении расы
  useEffect(() => {
    if (!race) {
      setAvailableSubraces([]);
      setHasSubraces(false);
      return;
    }

    const raceData = races.find(r => r.name === race);
    if (!raceData || !raceData.subraces || raceData.subraces.length === 0) {
      setAvailableSubraces([]);
      setHasSubraces(false);
      return;
    }
    
    // Преобразование подрас в объекты с описаниями
    const subraceObjects = raceData.subraces.map(subrace => 
      mapSubraceData(subrace, raceData)
    );
    
    setAvailableSubraces(subraceObjects);
    setHasSubraces(true);
    
    // Проверяем, валидна ли текущая подраса для новой расы
    // Делаем это только при изменении расы, чтобы избежать циклов
    if (!isValidSubrace(race, selectedSubrace) && selectedSubrace !== '') {
      console.log("Resetting invalid subrace:", selectedSubrace);
      // Устанавливаем значения напрямую, без использования setState, чтобы избежать повторного рендеринга
      setTimeout(() => {
        setSelectedSubrace('');
        onSubraceSelect('');
      }, 0);
    }
    // Убираем selectedSubrace из зависимостей, чтобы избежать циклических обновлений
  }, [race, onSubraceSelect, mapSubraceData, isValidSubrace]);

  // При изменении initialSubrace (если пользователь выбрал вариант из другого места)
  useEffect(() => {
    if (initialSubrace && initialSubrace !== selectedSubrace && isValidSubrace(race, initialSubrace)) {
      setSelectedSubrace(initialSubrace);
    }
  }, [initialSubrace, race, isValidSubrace, selectedSubrace]);

  const handleSubraceSelect = useCallback((subraceName: string) => {
    console.log("Selected subrace:", subraceName);
    setSelectedSubrace(subraceName);
    // Вызываем callback после небольшой задержки, чтобы избежать лишних циклов рендеринга
    setTimeout(() => {
      onSubraceSelect(subraceName);
    }, 0);
  }, [onSubraceSelect]);

  return {
    selectedSubrace,
    availableSubraces,
    autoRedirectAttempted,
    setAutoRedirectAttempted,
    hasSubraces,
    handleSubraceSelect
  };
};
