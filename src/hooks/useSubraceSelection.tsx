
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Load available subraces for the selected race
    if (race) {
      const raceData = races.find(r => r.name === race);
      if (raceData && raceData.subraces && raceData.subraces.length > 0) {
        // Convert subrace strings to objects with descriptions
        const subraceObjects = raceData.subraces.map(subrace => {
          // Check if subrace is already an object or just a string
          if (typeof subrace === 'string') {
            // Check if subRaceDetails exists in the race object
            const details = 
              (raceData as any).subRaceDetails ? 
              (raceData as any).subRaceDetails[subrace] || {} : 
              {};
              
            return {
              name: subrace,
              description: details.description || `Подраса ${subrace}`,
              traits: details.traits || [],
              abilityScoreIncrease: details.abilityScoreIncrease || {}
            };
          } else {
            // It's already an object, ensure proper typing
            return {
              name: subrace.name || 'Неизвестная подраса',
              description: typeof subrace.description === 'string' 
                ? subrace.description 
                : 'Подробное описание',
              traits: Array.isArray(subrace.traits) ? subrace.traits : [],
              abilityScoreIncrease: subrace.abilityScoreIncrease || {}
            };
          }
        });
        
        setAvailableSubraces(subraceObjects);
        setHasSubraces(true);
        
        // If subrace was not selected or doesn't match current race, reset it
        if (!selectedSubrace || !raceData.subraces.some(sr => {
          // Check if sr is an object with name field or a string
          if (typeof sr === 'string') {
            return sr === selectedSubrace;
          } else if (typeof sr === 'object' && sr !== null) {
            return sr.name === selectedSubrace;
          }
          return false;
        })) {
          setSelectedSubrace('');
          onSubraceSelect('');
        }
      } else {
        // If no subraces, set empty array
        setAvailableSubraces([]);
        setHasSubraces(false);
      }
    }
  }, [race, selectedSubrace, onSubraceSelect]);

  const handleSubraceSelect = (subraceName: string) => {
    setSelectedSubrace(subraceName);
    // Automatically save subrace selection
    onSubraceSelect(subraceName);
  };

  return {
    selectedSubrace,
    availableSubraces,
    autoRedirectAttempted,
    setAutoRedirectAttempted,
    hasSubraces,
    handleSubraceSelect
  };
};
