
import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import NavigationButtons from '@/components/ui/NavigationButtons';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import ThemeSelector from '@/components/ThemeSelector';

const DmPage: React.FC = () => {
  const { themeStyles } = useTheme();
  
  return (
    <BackgroundWrapper>
      <div className="min-h-screen py-4">
        <div className="container mx-auto px-4">
          <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-3xl font-bold mb-4 sm:mb-0" style={{ color: themeStyles?.textColor }}>
              Экран Мастера
            </h1>
            <div className="flex items-center space-x-4">
              <ThemeSelector />
              <NavigationButtons />
            </div>
          </header>
          
          <div className="bg-black/50 rounded-lg p-8 backdrop-blur-sm">
            <h2 className="text-2xl mb-6">Инструменты Мастера Подземелий</h2>
            <p className="text-lg">Этот раздел находится в разработке.</p>
          </div>
        </div>
      </div>
      <FloatingDiceButton />
    </BackgroundWrapper>
  );
};

export default DmPage;
