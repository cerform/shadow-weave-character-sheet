
import React, { useEffect, useState } from 'react';
import { SpellbookProvider, useSpellbook } from '@/contexts/SpellbookContext';
import { getAllSpells, ensureSpellIds } from '@/data/spells/index';
import { toast } from 'sonner';
import { SpellData } from '@/types/spells';
import { createSpellId } from '@/utils/spellHelpers';

interface SpellProviderProps {
  children: React.ReactNode;
}

// Компонент-обертка для инициализации заклинаний
const SpellProviderContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { spells, setSpells, setFilteredSpells, setIsLoading } = useSpellbook();
  const [loadAttempted, setLoadAttempted] = useState(false);
  
  useEffect(() => {
    const loadSpells = async () => {
      console.log('SpellProvider: Начинаю загрузку заклинаний');
      setIsLoading(true);
      
      try {
        // Получаем все заклинания из файлов
        const allSpells = getAllSpells();
        console.log('SpellProvider: Загружено заклинаний:', allSpells.length);
        
        if (allSpells.length === 0) {
          console.error('SpellProvider: Список заклинаний пуст!');
          toast.error('Не удалось загрузить заклинания. Список пуст.');
          return;
        }
        
        // Убедимся, что все заклинания имеют уникальный ID
        const spellsWithIds = allSpells.map(spell => {
          if (!spell.id) {
            return { ...spell, id: createSpellId(spell.name) };
          }
          return spell;
        });
        
        // Устанавливаем заклинания в контекст
        setSpells(spellsWithIds);
        setFilteredSpells(spellsWithIds);
        console.log('SpellProvider: Заклинания установлены в контекст');
        
        // Сохраняем в локальное хранилище для быстрой загрузки
        try {
          localStorage.setItem('spellbook_cache_timestamp', Date.now().toString());
          localStorage.setItem('spellbook_cache', JSON.stringify(spellsWithIds.slice(0, 20)));
          console.log('SpellProvider: Кэш сохранен');
        } catch (storageError) {
          console.warn('SpellProvider: Не удалось сохранить кэш', storageError);
        }
      } catch (error) {
        console.error('SpellProvider: Ошибка загрузки заклинаний:', error);
        toast.error('Произошла ошибка при загрузке книги заклинаний');
        
        // Попытка восстановить из кэша
        try {
          const cachedSpells = localStorage.getItem('spellbook_cache');
          if (cachedSpells) {
            const parsedSpells = JSON.parse(cachedSpells) as SpellData[];
            if (parsedSpells.length > 0) {
              console.log('SpellProvider: Восстановлено из кэша:', parsedSpells.length);
              setSpells(parsedSpells);
              setFilteredSpells(parsedSpells);
              toast.info('Загружена кэшированная версия книги заклинаний');
            }
          }
        } catch (cacheError) {
          console.error('SpellProvider: Ошибка восстановления из кэша:', cacheError);
        }
      } finally {
        setIsLoading(false);
        setLoadAttempted(true);
        console.log('SpellProvider: Загрузка завершена');
      }
    };
    
    // Загружаем заклинания только если они еще не загружены
    if (!loadAttempted && spells.length === 0) {
      loadSpells();
    }
  }, [spells.length, setSpells, setFilteredSpells, setIsLoading, loadAttempted]);
  
  // Отображаем содержимое только после загрузки
  return <>{children}</>;
};

const SpellProvider: React.FC<SpellProviderProps> = ({ children }) => {
  return (
    <SpellbookProvider>
      <SpellProviderContent>
        {children}
      </SpellProviderContent>
    </SpellbookProvider>
  );
};

export default SpellProvider;
