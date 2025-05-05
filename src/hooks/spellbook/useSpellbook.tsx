
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { getSpellsByClass, getSpellsByLevel, spells } from '@/data/spells';
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

export const useSpellbook = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [activeSchool, setActiveSchool] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Получаем все уникальные уровни из списка заклинаний
  const allLevels = Array.from(new Set(spells.map(spell => spell.level))).sort((a, b) => a - b);
  
  // Получаем все уникальные школы из списка заклинаний
  const allSchools = Array.from(new Set(spells.map(spell => spell.school || ''))).filter(Boolean);
  
  // Получаем все уникальные классы из списка заклинаний
  const allClasses = Array.from(
    new Set(
      spells.flatMap(spell => {
        if (!spell.classes) return [];
        return Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      })
    )
  ).filter(Boolean);
  
  // Фильтрация заклинаний
  const filteredSpells = spells.filter(spell => {
    // Фильтр по поиску
    const matchesSearch = searchTerm === '' || 
      spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Фильтр по уровню
    const matchesLevel = activeLevel.length === 0 || activeLevel.includes(spell.level);
    
    // Фильтр по школе
    const matchesSchool = activeSchool.length === 0 || 
      (spell.school && activeSchool.includes(spell.school));
    
    // Фильтр по классу
    const matchesClass = activeClass.length === 0 || 
      (spell.classes && Array.isArray(spell.classes) 
        ? spell.classes.some(cls => activeClass.includes(cls))
        : activeClass.includes(spell.classes || ''));
    
    return matchesSearch && matchesLevel && matchesSchool && matchesClass;
  });
  
  // Функции для управления фильтрами
  const toggleLevel = (level: number) => {
    setActiveLevel(
      activeLevel.includes(level)
        ? activeLevel.filter(l => l !== level)
        : [...activeLevel, level]
    );
  };
  
  const toggleSchool = (school: string) => {
    setActiveSchool(
      activeSchool.includes(school)
        ? activeSchool.filter(s => s !== school)
        : [...activeSchool, school]
    );
  };
  
  const toggleClass = (cls: string) => {
    setActiveClass(
      activeClass.includes(cls)
        ? activeClass.filter(c => c !== cls)
        : [...activeClass, cls]
    );
  };
  
  const clearFilters = () => {
    setActiveLevel([]);
    setActiveSchool([]);
    setActiveClass([]);
    setSearchTerm('');
  };
  
  // Управление модальным окном с детальной информацией
  const handleOpenSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };
  
  const handleClose = () => {
    setIsModalOpen(false);
  };
  
  return {
    filteredSpells,
    searchTerm,
    setSearchTerm,
    activeLevel,
    activeSchool,
    activeClass,
    currentTheme,
    allLevels,
    allSchools,
    allClasses,
    toggleLevel,
    toggleSchool,
    toggleClass,
    clearFilters,
    selectedSpell,
    isModalOpen,
    handleOpenSpell,
    handleClose
  };
};
