
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import NavigationButtons from '@/components/ui/NavigationButtons';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import ThemeSelector from '@/components/ThemeSelector';

const HandbookCategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { themeStyles } = useTheme();
  
  return (
    <BackgroundWrapper>
      <div className="min-h-screen py-4">
        <div className="container mx-auto px-4">
          <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-3xl font-bold mb-4 sm:mb-0" style={{ color: themeStyles?.textColor }}>
              {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Категория'} - Справочник
            </h1>
            <div className="flex items-center space-x-4">
              <ThemeSelector />
              <NavigationButtons />
            </div>
          </header>
          
          <div className="bg-black/50 rounded-lg p-8 backdrop-blur-sm">
            <h2 className="text-2xl mb-6">Категория: {category}</h2>
            <p className="text-lg">Эта категория находится в разработке.</p>
          </div>
        </div>
      </div>
      <FloatingDiceButton />
    </BackgroundWrapper>
  );
};

export default HandbookCategoryPage;
