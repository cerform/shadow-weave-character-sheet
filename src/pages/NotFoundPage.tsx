
import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';

const NotFoundPage: React.FC = () => {
  const { themeStyles } = useTheme();
  
  return (
    <BackgroundWrapper>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 
          className="text-6xl font-bold mb-4" 
          style={{ color: themeStyles?.accent }}
        >
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-6">Страница не найдена</h2>
        <p className="text-lg mb-8 max-w-md">
          Похоже, вы забрели в неизведанные земли. Даже опытные искатели приключений иногда теряются.
        </p>
        <Button asChild>
          <Link to="/" className="flex items-center gap-2">
            <Home size={18} />
            <span>Вернуться на главную</span>
          </Link>
        </Button>
      </div>
    </BackgroundWrapper>
  );
};

export default NotFoundPage;
