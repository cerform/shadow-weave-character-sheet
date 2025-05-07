
import React, { useEffect, useState } from 'react';
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import { useTheme } from '@/hooks/use-theme';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import SpellProvider from '@/components/spellbook/SpellProvider';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const SpellbookPage: React.FC = () => {
  const { themeStyles } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Показываем информационное сообщение при загрузке страницы
    toast.info("Загружаем книгу заклинаний D&D 5e");
  }, []);

  // Функция для принудительной перезагрузки заклинаний
  const handleRefreshSpells = () => {
    setIsRefreshing(true);
    // Используем глобальную функцию, которую создали в SpellProvider
    if ((window as any).reloadSpellbook) {
      (window as any).reloadSpellbook();
      toast.info("Перезагрузка книги заклинаний...");
      setTimeout(() => setIsRefreshing(false), 1000);
    } else {
      toast.error("Не удалось перезагрузить книгу заклинаний");
      setIsRefreshing(false);
    }
  };

  return (
    <BackgroundWrapper>
      <div className="min-h-screen py-4">
        <div className="container mx-auto px-4">
          <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-3xl font-bold mb-4 sm:mb-0" style={{ color: themeStyles?.textColor }}>
              Книга заклинаний D&D 5e
            </h1>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshSpells}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              <ThemeSelector />
              <NavigationButtons />
            </div>
          </header>
          
          <SpellProvider>
            <SpellBookViewer />
          </SpellProvider>
        </div>
      </div>
      <FloatingDiceButton />
    </BackgroundWrapper>
  );
};

export default SpellbookPage;
