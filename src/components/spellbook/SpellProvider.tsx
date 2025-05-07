
import React, { useEffect, useState, useCallback } from 'react';
import { SpellbookProvider, useSpellbook } from '@/contexts/SpellbookContext';
import { getAllSpells } from '@/data/spells/index';
import { toast } from 'sonner';
import { SpellData } from '@/types/spells';

interface SpellProviderProps {
  children: React.ReactNode;
}

// Компонент-обертка для инициализации заклинаний
const SpellProviderContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { spells, setSpells, setFilteredSpells, setIsLoading } = useSpellbook();
  const [loadAttempted, setLoadAttempted] = useState(false);
  
  const loadSpellsData = useCallback(async () => {
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
      
      // Проверяем наличие id в заклинаниях
      const validSpells = allSpells.filter(spell => !!spell.id);
      if (validSpells.length !== allSpells.length) {
        console.warn(`SpellProvider: Найдено ${allSpells.length - validSpells.length} заклинаний без ID`);
      }
      
      // Устанавливаем заклинания в контекст
      setSpells(validSpells);
      setFilteredSpells(validSpells);
      console.log('SpellProvider: Заклинания установлены в контекст:', validSpells.length);
      
      // Сохраняем в локальное хранилище для быстрой загрузки
      try {
        localStorage.setItem('spellbook_cache_timestamp', Date.now().toString());
        localStorage.setItem('spellbook_cache', JSON.stringify(validSpells.slice(0, 50)));
        console.log('SpellProvider: Кэш сохранен');
      } catch (storageError) {
        console.warn('SpellProvider: Не удалось сохранить кэш', storageError);
      }

      // Показываем уведомление об успешной загрузке
      toast.success(`Загружено ${validSpells.length} заклинаний`);
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
  }, [setSpells, setFilteredSpells, setIsLoading]);
  
  useEffect(() => {
    // Загружаем заклинания только если они еще не загружены
    if (!loadAttempted && spells.length === 0) {
      loadSpellsData();
    }
  }, [spells.length, loadAttempted, loadSpellsData]);

  // Добавляем возможность принудительно перезагрузить заклинания
  const handleRefresh = useCallback(() => {
    setLoadAttempted(false);
    loadSpellsData();
  }, [loadSpellsData]);

  // Сохраняем функцию перезагрузки в глобальном объекте для доступа из других компонентов
  useEffect(() => {
    (window as any).reloadSpellbook = handleRefresh;
  }, [handleRefresh]);

  console.log('SpellProvider: Рендеринг, количество заклинаний:', spells.length);
  
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
