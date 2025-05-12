
import { useState, useEffect, useCallback } from 'react';
import { SpellData, SpellFilters } from '@/types/spells';
import { convertCharacterSpellToSpellData } from '@/types/spells';
import { 
  applyAllFilters, 
  searchSpellsByName, 
  filterSpellsByLevel, 
  filterSpellsBySchool, 
  filterSpellsByClass, 
  filterSpellsByRitual, 
  filterSpellsByConcentration 
} from './filterUtils';

export const useSpellbook = () => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  
  const [filters, setFilters] = useState<SpellFilters>({
    name: '',
    schools: [],
    levels: [],
    classes: [],
    ritual: null,
    concentration: null
  });

  const fetchSpells = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Example hardcoded spells for development
      const exampleSpells: SpellData[] = [
        {
          id: "1",
          name: "Огненный шар",
          level: 3,
          school: "Воплощение",
          castingTime: "1 действие",
          range: "150 футов",
          components: "В, С, М",
          duration: "Мгновенная",
          description: "Яркий луч вылетает из вашего указательного пальца в точку, выбранную вами в пределах дистанции, а затем расцветает низким ревом во взрыв пламени. Все существа в сфере с радиусом 20 футов с центром в этой точке должны совершить спасбросок Ловкости. Цель получает 8к6 урона огнём при провале или половину этого урона при успехе.",
          classes: ["Волшебник", "Чародей"],
          ritual: false,
          concentration: false,
          verbal: true,
          somatic: true,
          material: false,
          source: "PHB"
        },
        {
          id: "2",
          name: "Обнаружение магии",
          level: 1,
          school: "Прорицание",
          castingTime: "1 действие",
          range: "На себя",
          components: "В, С",
          duration: "Концентрация, вплоть до 10 минут",
          description: "Пока заклинание активно, вы чувствуете присутствие магии в пределах 30 футов от себя. Если вы чувствуете магию, вы можете действием увидеть слабую ауру вокруг видимого существа или объекта, несущего магию, и узнать его школу магии, если она есть.",
          classes: ["Бард", "Друид", "Волшебник", "Жрец", "Паладин", "Следопыт", "Чародей"],
          ritual: true,
          concentration: true,
          verbal: true,
          somatic: true,
          material: true,
          materials: "Щепотка пыли на основе ртути",
          source: "PHB"
        }
      ];
      
      setSpells(exampleSpells);
      setFilteredSpells(exampleSpells);
      setAvailableSpells(exampleSpells);
    } catch (err) {
      console.error("Error fetching spells:", err);
      setError("Не удалось загрузить заклинания");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpells();
  }, [fetchSpells]);

  // Filter spells when filters change
  useEffect(() => {
    setFilteredSpells(applyAllFilters(spells, filters));
  }, [spells, filters]);

  // Загрузка заклинаний для конкретного класса и уровня
  const loadSpellsForCharacter = useCallback((characterClass: string, characterLevel: number) => {
    console.log(`Loading spells for ${characterClass} (level ${characterLevel})`);
    // В реальном приложении здесь был бы запрос к API или фильтрация локальных данных
    // Пока просто установим availableSpells в текущий список заклинаний
    setAvailableSpells(spells.filter(spell => {
      // Фильтруем по классу
      const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      const matchesClass = spellClasses.some(c => c?.toLowerCase() === characterClass.toLowerCase());
      
      // Фильтруем по уровню (максимальный уровень заклинаний для персонажа)
      const maxLevel = Math.min(9, Math.ceil(characterLevel / 2));
      const matchesLevel = spell.level <= maxLevel;
      
      return matchesClass && matchesLevel;
    }));
  }, [spells]);

  const updateFilters = (newFilters: Partial<SpellFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      name: '',
      schools: [],
      levels: [],
      classes: [],
      ritual: null,
      concentration: null
    });
  };

  const getSpellById = (id: string | number): SpellData | undefined => {
    const idStr = id.toString();
    return spells.find(spell => spell.id.toString() === idStr);
  };

  return {
    spells,
    filteredSpells,
    loading,
    error,
    filters,
    availableSpells,
    updateFilters,
    resetFilters,
    fetchSpells,
    getSpellById,
    loadSpellsForCharacter
  };
};

export type SpellbookHook = ReturnType<typeof useSpellbook>;
export default useSpellbook;
