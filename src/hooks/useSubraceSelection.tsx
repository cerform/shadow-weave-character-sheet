
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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Функция для преобразования данных подрасы
  const mapSubraceData = useCallback((subrace: any, raceData: any) => {
    console.log('Mapping subrace data:', subrace);
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
    
    console.log(`Checking if subrace "${subraceName}" is valid for race "${raceName}"`);
    
    const raceData = races.find(r => r.name === raceName);
    if (!raceData || !raceData.subraces) {
      console.log('Race data not found or no subraces available');
      return false;
    }
    
    const isValid = raceData.subraces.some(sr => {
      if (typeof sr === 'string') {
        return sr === subraceName;
      } else if (typeof sr === 'object' && sr !== null) {
        return sr.name === subraceName;
      }
      return false;
    });
    
    console.log(`Subrace "${subraceName}" is ${isValid ? 'valid' : 'invalid'} for race "${raceName}"`);
    return isValid;
  }, []);

  // Загрузка доступных подрас при изменении расы
  useEffect(() => {
    if (!race) {
      console.log('No race selected, clearing subraces');
      setAvailableSubraces([]);
      setHasSubraces(false);
      return;
    }

    console.log(`Loading subraces for race: ${race}`);
    const raceData = races.find(r => r.name === race);
    if (!raceData) {
      console.log(`Race data not found for "${race}"`);
      setAvailableSubraces([]);
      setHasSubraces(false);
      return;
    }
    
    console.log('Race data:', raceData);
    if (!raceData.subraces || raceData.subraces.length === 0) {
      console.log(`No subraces found for race "${race}"`);
      setAvailableSubraces([]);
      setHasSubraces(false);
      return;
    }
    
    console.log('Available subraces:', raceData.subraces);
    
    // Преобразование подрас в объекты с описаниями
    const subraceObjects = raceData.subraces.map(subrace => 
      mapSubraceData(subrace, raceData)
    );
    
    console.log('Mapped subrace objects:', subraceObjects);
    
    setAvailableSubraces(subraceObjects);
    setHasSubraces(true);
    
    // Проверяем, валидна ли текущая подраса для новой расы
    if (!isValidSubrace(race, selectedSubrace) && selectedSubrace !== '') {
      console.log(`Resetting invalid subrace: "${selectedSubrace}" for race "${race}"`);
      // Используем setIsProcessing для предотвращения повторных сбросов
      setIsProcessing(true);
      setSelectedSubrace('');
      
      // Используем setTimeout, чтобы избежать циклических вызовов
      setTimeout(() => {
        onSubraceSelect('');
        setIsProcessing(false);
      }, 50);
    }
  }, [race, mapSubraceData, isValidSubrace, selectedSubrace, onSubraceSelect]);

  // При изменении initialSubrace (если пользователь выбрал вариант из другого места)
  useEffect(() => {
    if (!isProcessing && initialSubrace && initialSubrace !== selectedSubrace && isValidSubrace(race, initialSubrace)) {
      console.log(`Updating selected subrace to "${initialSubrace}" from initialSubrace prop`);
      setSelectedSubrace(initialSubrace);
    }
  }, [initialSubrace, race, isValidSubrace, selectedSubrace, isProcessing]);

  const handleSubraceSelect = useCallback((subraceName: string) => {
    console.log(`User selected subrace: "${subraceName}"`);
    
    // Предотвращаем повторные вызовы во время обработки
    if (isProcessing) {
      console.log('Ignoring selection while processing');
      return;
    }
    
    setIsProcessing(true);
    setSelectedSubrace(subraceName);
    
    // Используем setTimeout для предотвращения циклических обновлений
    setTimeout(() => {
      onSubraceSelect(subraceName);
      setIsProcessing(false);
    }, 50);
  }, [onSubraceSelect, isProcessing]);

  return {
    selectedSubrace,
    availableSubraces,
    autoRedirectAttempted,
    setAutoRedirectAttempted,
    hasSubraces,
    handleSubraceSelect
  };
};
