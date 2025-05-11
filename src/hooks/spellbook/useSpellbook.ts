// Предполагаемый код useSpellbook.ts с исправлением для строки 201
// Исправляем преобразование CharacterSpell[] в SpellData[]

import { useState, useEffect, useCallback } from 'react';
import { SpellData, CharacterSpell } from '@/types/spells';

// Определите интерфейс для фильтров
interface SpellFilters {
  name?: string;
  level?: number | null;
  school?: string;
  class?: string;
  concentration?: boolean;
  ritual?: boolean;
}

const useSpellbook = (initialSpells: SpellData[] = []) => {
  const [spells, setSpells] = useState<SpellData[]>(initialSpells);
  const [characterSpells, setCharacterSpells] = useState<CharacterSpell[]>([]);
  const [spellFilters, setSpellFilters] = useState<SpellFilters>({});
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>(initialSpells);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpellbookOpen, setIsSpellbookOpen] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isAddingSpell, setIsAddingSpell] = useState(false);
  const [isRemovingSpell, setIsRemovingSpell] = useState(false);
  const [isSpellInSpellbook, setIsSpellInSpellbook] = useState(false);

  // Функция для открытия спеллбука
  const openSpellbook = () => {
    setIsSpellbookOpen(true);
  };

  // Функция для закрытия спеллбука
  const closeSpellbook = () => {
    setIsSpellbookOpen(false);
  };

  // Функция для установки выбранного спелла
  const selectSpell = (spell: SpellData | null) => {
    setSelectedSpell(spell);
  };

  // Функция для очистки выбранного спелла
  const clearSelectedSpell = () => {
    setSelectedSpell(null);
  };

  // Функция для добавления спелла в спеллбук
  const addSpellToSpellbook = async (spell: SpellData) => {
    setIsAddingSpell(true);
    try {
      // Проверка, есть ли уже спелл в спеллбуке
      const spellInSpellbook = characterSpells.find(s => s.id === spell.id);
      if (spellInSpellbook) {
        setIsSpellInSpellbook(true);
        setError('Этот спелл уже есть в спеллбуке');
        return;
      }

      // Добавление спелла в массив characterSpells
      setCharacterSpells([...characterSpells, spell]);
      setFilteredSpells([...filteredSpells, spell]);
      setIsSpellInSpellbook(false);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsAddingSpell(false);
    }
  };

  // Функция для удаления спелла из спеллбука
  const removeSpellFromSpellbook = async (spellId: string) => {
    setIsRemovingSpell(true);
    try {
      // Удаление спелла из массива characterSpells
      setCharacterSpells(characterSpells.filter(s => s.id !== spellId));
      setFilteredSpells(filteredSpells.filter(s => s.id !== spellId));
      setIsSpellInSpellbook(false);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsRemovingSpell(false);
    }
  };

  // Функция для проверки, есть ли спелл в спеллбуке
  const checkSpellInSpellbook = useCallback((spellId: string) => {
    const spellInSpellbook = characterSpells.find(s => s.id === spellId);
    setIsSpellInSpellbook(!!spellInSpellbook);
  }, [characterSpells]);

  // Функция для загрузки спеллов из API или другого источника
  const loadSpells = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Здесь нужно заменить на реальный запрос к API или другому источнику данных
      // const response = await fetch('/api/spells');
      // const data = await response.json();
      // setSpells(data);
      // setFilteredSpells(data);

      // Пока что используем заглушку
      setSpells([
        {
          id: '1',
          name: 'Фаербол',
          level: 3,
          school: 'Воплощение',
          castingTime: '1 действие',
          range: '150 футов',
          components: 'В, С, М (шарик из гуано летучей мыши и серы)',
          duration: 'Мгновенная',
          description: 'Вы бросаете взрывающийся шар огня...',
          classes: ['Волшебник', 'Чародей'],
          source: 'Книга игрока',
          ritual: false,
          concentration: false,
          verbal: true,
          somatic: true,
          material: true,
          materials: 'шарик из гуано летучей мыши и серы',
          prepared: false,
          higherLevel: 'Если вы накладываете это заклинание, используя ячейку 4-го уровня или выше, урон увеличивается на 1d6 за каждый уровень ячейки выше 3-го.',
          higherLevels: 'Если вы накладываете это заклинание, используя ячейку 4-го уровня или выше, урон увеличивается на 1d6 за каждый уровень ячейки выше 3-го.'
        },
        {
          id: '2',
          name: 'Лечение ран',
          level: 1,
          school: 'Воплощение',
          castingTime: '1 действие',
          range: 'Касание',
          components: 'В, С',
          duration: 'Мгновенная',
          description: 'Существо, которого вы касаетесь, восстанавливает хиты в размере 1d8 + ваш модификатор Мудрости.',
          classes: ['Жрец', 'Паладин'],
          source: 'Книга игрока',
          ritual: false,
          concentration: false,
          verbal: true,
          somatic: true,
          material: false,
          prepared: false,
          higherLevel: 'Если вы накладываете это заклинание, используя ячейку 2-го уровня или выше, лечение увеличивается на 1d8 за каждый уровень ячейки выше 1-го.',
          higherLevels: 'Если вы накладываете это заклинание, используя ячейку 2-го уровня или выше, лечение увеличивается на 1d8 за каждый уровень ячейки выше 1-го.'
        }
      ]);
      setFilteredSpells([
        {
          id: '1',
          name: 'Фаербол',
          level: 3,
          school: 'Воплощение',
          castingTime: '1 действие',
          range: '150 футов',
          components: 'В, С, М (шарик из гуано летучей мыши и серы)',
          duration: 'Мгновенная',
          description: 'Вы бросаете взрывающийся шар огня...',
          classes: ['Волшебник', 'Чародей'],
          source: 'Книга игрока',
          ritual: false,
          concentration: false,
          verbal: true,
          somatic: true,
          material: true,
          materials: 'шарик из гуано летучей мыши и серы',
          prepared: false,
          higherLevel: 'Если вы накладываете это заклинание, используя ячейку 4-го уровня или выше, урон увеличивается на 1d6 за каждый уровень ячейки выше 3-го.',
          higherLevels: 'Если вы накладываете это заклинание, используя ячейку 4-го уровня или выше, урон увеличивается на 1d6 за каждый уровень ячейки выше 3-го.'
        },
        {
          id: '2',
          name: 'Лечение ран',
          level: 1,
          school: 'Воплощение',
          castingTime: '1 действие',
          range: 'Касание',
          components: 'В, С',
          duration: 'Мгновенная',
          description: 'Существо, которого вы касаетесь, восстанавливает хиты в размере 1d8 + ваш модификатор Мудрости.',
          classes: ['Жрец', 'Паладин'],
          source: 'Книга игрока',
          ritual: false,
          concentration: false,
          verbal: true,
          somatic: true,
          material: false,
          prepared: false,
          higherLevel: 'Если вы накладываете это заклинание, используя ячейку 2-го уровня или выше, лечение увеличивается на 1d8 за каждый уровень ячейки выше 1-го.',
          higherLevels: 'Если вы накладываете это заклинание, используя ячейку 2-го уровня или выше, лечение увеличивается на 1d8 за каждый уровень ячейки выше 1-го.'
        }
      ]);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Функция для загрузки спеллов персонажа из API или другого источника
  const loadCharacterSpells = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Здесь нужно заменить на реальный запрос к API или другому источнику данных
      // const response = await fetch('/api/characters/123/spells');
      // const data = await response.json();
      // setCharacterSpells(data);
      // setFilteredSpells(data);

      // Пока что используем заглушку
      setCharacterSpells([
        {
          id: '1',
          name: 'Фаербол',
          level: 3,
          school: 'Воплощение',
          castingTime: '1 действие',
          range: '150 футов',
          components: 'В, С, М (шарик из гуано летучей мыши и серы)',
          duration: 'Мгновенная',
          description: 'Вы бросаете взрывающийся шар огня...',
          classes: ['Волшебник', 'Чародей'],
          source: 'Книга игрока',
          ritual: false,
          concentration: false,
          verbal: true,
          somatic: true,
          material: true,
          materials: 'шарик из гуано летучей мыши и серы',
          prepared: false,
          higherLevel: 'Если вы накладываете это заклинание, используя ячейку 4-го уровня или выше, урон увеличивается на 1d6 за каждый уровень ячейки выше 3-го.',
          higherLevels: 'Если вы накладываете это заклинание, используя ячейку 4-го уровня или выше, урон увеличивается на 1d6 за каждый уровень ячейки выше 3-го.'
        }
      ]);

      // В проблемном месте вызываем функцию конвертации
      // setSpells(characterSpells) меняется на:
      setSpells(convertCharacterSpellsToSpellData(characterSpells));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Функция для применения фильтров к спеллам
  const applyFilters = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      // Применение фильтров к спеллам
      let filtered = spells;
      if (spellFilters.name) {
        filtered = filtered.filter(spell => spell.name.toLowerCase().includes(spellFilters.name!.toLowerCase()));
      }
      if (spellFilters.level) {
        filtered = filtered.filter(spell => spell.level === spellFilters.level);
      }
      if (spellFilters.school) {
        filtered = filtered.filter(spell => spell.school === spellFilters.school);
      }
      if (spellFilters.class) {
        filtered = filtered.filter(spell => spell.classes.includes(spellFilters.class));
      }
      if (spellFilters.concentration) {
        filtered = filtered.filter(spell => spell.concentration === spellFilters.concentration);
      }
      if (spellFilters.ritual) {
        filtered = filtered.filter(spell => spell.ritual === spellFilters.ritual);
      }
      setFilteredSpells(filtered);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [spells, spellFilters]);

  // Функция для установки фильтров
  const setFilters = (filters: SpellFilters) => {
    setSpellFilters(filters);
  };

  // Очистка фильтров
  const clearFilters = () => {
    setSpellFilters({});
  };

  // Эффект при монтировании компонента
  useEffect(() => {
    loadSpells();
    loadCharacterSpells();
  }, [loadSpells, loadCharacterSpells]);

  // Эффект при изменении фильтров
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Функция для конвертации CharacterSpell[] в SpellData[]
  const convertCharacterSpellsToSpellData = (spells: CharacterSpell[]): SpellData[] => {
    return spells.map(spell => ({
      id: spell.id || `spell-${Math.random().toString(36).substring(2, 11)}`,
      name: spell.name || '',
      level: spell.level,
      school: spell.school || 'Универсальная',
      castingTime: spell.castingTime || '1 действие',
      range: spell.range || 'Касание',
      components: spell.components || '',
      duration: spell.duration || 'Мгновенная',
      description: spell.description || '',
      classes: spell.classes || [],
      source: spell.source || '',
      ritual: !!spell.ritual,
      concentration: !!spell.concentration,
      verbal: !!spell.verbal,
      somatic: !!spell.somatic,
      material: !!spell.material,
      prepared: !!spell.prepared,
      materials: spell.materials || '',
      higherLevel: spell.higherLevel || '',
      higherLevels: spell.higherLevels || ''
    }));
  };

  return {
    spells,
    characterSpells,
    filteredSpells,
    spellFilters,
    loading,
    error,
    isSpellbookOpen,
    selectedSpell,
    isAddingSpell,
    isRemovingSpell,
    isSpellInSpellbook,
    openSpellbook,
    closeSpellbook,
    selectSpell,
    clearSelectedSpell,
    addSpellToSpellbook,
    removeSpellFromSpellbook,
    checkSpellInSpellbook,
    loadSpells,
    loadCharacterSpells,
    setFilters,
    clearFilters,
    setSpells,
    setFilteredSpells,
    setCharacterSpells
  };
};

export default useSpellbook;
