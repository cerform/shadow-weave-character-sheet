
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import ProfilePreview from '@/components/home/ProfilePreview';
import ThemeSelector from '@/components/ThemeSelector';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { 
  UsersRound, 
  PlusCircle, 
  BookOpen, 
  Scroll, 
  Gamepad2, 
  BookMarked 
} from 'lucide-react';

const Home: React.FC = () => {
  const { theme } = useTheme();
  
  // Получаем текущую тему для стилизации
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  return (
    <BackgroundWrapper>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 
            className="text-4xl sm:text-5xl font-bold font-philosopher"
            style={{
              color: currentTheme.accent,
              textShadow: `0 0 10px ${currentTheme.accent}70`
            }}
          >
            Dungeons & Dragons 5e
            <div 
              className="h-1 w-3/4 mt-2 rounded"
              style={{
                background: `linear-gradient(90deg, ${currentTheme.accent}, transparent)`,
                boxShadow: `0 0 8px ${currentTheme.accent}70`
              }}
            />
          </h1>
          <IconOnlyNavigation includeThemeSelector={true} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="md:col-span-2 lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Персонажи */}
              <div 
                className="bg-black/60 backdrop-blur-sm border rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
                style={{
                  borderColor: '#47A5FF',
                  boxShadow: `0 4px 20px rgba(71, 165, 255, 0.2)`
                }}
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mb-4 border-2 border-blue-400">
                    <UsersRound className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 
                    className="text-2xl font-bold mb-2 font-philosopher"
                    style={{ color: '#47A5FF' }}
                  >
                    Персонажи
                  </h2>
                  <p className="mb-6 text-gray-300 text-sm">
                    Управление персонажами
                  </p>
                  
                  <Button 
                    asChild
                    className="w-full"
                    style={{ backgroundColor: '#47A5FF' }}
                  >
                    <Link to="/characters">ПЕРЕЙТИ</Link>
                  </Button>
                </div>
              </div>

              {/* Создать персонажа */}
              <div 
                className="bg-black/60 backdrop-blur-sm border rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
                style={{
                  borderColor: '#22D3AE',
                  boxShadow: `0 4px 20px rgba(34, 211, 174, 0.2)`
                }}
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-teal-900/50 flex items-center justify-center mb-4 border-2 border-teal-400">
                    <PlusCircle className="w-6 h-6 text-teal-400" />
                  </div>
                  <h2 
                    className="text-2xl font-bold mb-2 font-philosopher"
                    style={{ color: '#22D3AE' }}
                  >
                    Создать персонажа
                  </h2>
                  <p className="mb-6 text-gray-300 text-sm">
                    Создание нового персонажа
                  </p>
                  
                  <Button 
                    asChild
                    className="w-full"
                    style={{ backgroundColor: '#22D3AE' }}
                  >
                    <Link to="/character-creation">ПЕРЕЙТИ</Link>
                  </Button>
                </div>
              </div>

              {/* Лист персонажа */}
              <div 
                className="bg-black/60 backdrop-blur-sm border rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
                style={{
                  borderColor: '#FFC024',
                  boxShadow: `0 4px 20px rgba(255, 192, 36, 0.2)`
                }}
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-yellow-900/50 flex items-center justify-center mb-4 border-2 border-yellow-400">
                    <BookOpen className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h2 
                    className="text-2xl font-bold mb-2 font-philosopher"
                    style={{ color: '#FFC024' }}
                  >
                    Лист персонажа
                  </h2>
                  <p className="mb-6 text-gray-300 text-sm">
                    Просмотр и редактирование
                  </p>
                  
                  <Button 
                    asChild
                    className="w-full"
                    style={{ backgroundColor: '#FFC024' }}
                  >
                    <Link to="/characters">ПЕРЕЙТИ</Link>
                  </Button>
                </div>
              </div>

              {/* Книга заклинаний */}
              <div 
                className="bg-black/60 backdrop-blur-sm border rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
                style={{
                  borderColor: '#B469FF',
                  boxShadow: `0 4px 20px rgba(180, 105, 255, 0.2)`
                }}
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center mb-4 border-2 border-purple-400">
                    <Scroll className="w-6 h-6 text-purple-400" />
                  </div>
                  <h2 
                    className="text-2xl font-bold mb-2 font-philosopher"
                    style={{ color: '#B469FF' }}
                  >
                    Книга заклинаний
                  </h2>
                  <p className="mb-6 text-gray-300 text-sm">
                    Изучение и поиск заклинаний
                  </p>
                  
                  <Button 
                    asChild
                    className="w-full"
                    style={{ backgroundColor: '#B469FF' }}
                  >
                    <Link to="/spellbook">ПЕРЕЙТИ</Link>
                  </Button>
                </div>
              </div>

              {/* Игра */}
              <div 
                className="bg-black/60 backdrop-blur-sm border rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
                style={{
                  borderColor: '#FF4D4F',
                  boxShadow: `0 4px 20px rgba(255, 77, 79, 0.2)`
                }}
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center mb-4 border-2 border-red-400">
                    <Gamepad2 className="w-6 h-6 text-red-400" />
                  </div>
                  <h2 
                    className="text-2xl font-bold mb-2 font-philosopher"
                    style={{ color: '#FF4D4F' }}
                  >
                    Игра
                  </h2>
                  <p className="mb-6 text-gray-300 text-sm">
                    Присоединиться к сессии
                  </p>
                  
                  <Button 
                    asChild
                    className="w-full"
                    style={{ backgroundColor: '#FF4D4F' }}
                  >
                    <Link to="/join-game">ПЕРЕЙТИ</Link>
                  </Button>
                </div>
              </div>

              {/* Справочник */}
              <div 
                className="bg-black/60 backdrop-blur-sm border rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
                style={{
                  borderColor: '#FF85A0',
                  boxShadow: `0 4px 20px rgba(255, 133, 160, 0.2)`
                }}
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-pink-900/50 flex items-center justify-center mb-4 border-2 border-pink-400">
                    <BookMarked className="w-6 h-6 text-pink-400" />
                  </div>
                  <h2 
                    className="text-2xl font-bold mb-2 font-philosopher"
                    style={{ color: '#FF85A0' }}
                  >
                    Справочник
                  </h2>
                  <p className="mb-6 text-gray-300 text-sm">
                    Расы, классы, предыстории
                  </p>
                  
                  <Button 
                    asChild
                    className="w-full"
                    style={{ backgroundColor: '#FF85A0' }}
                  >
                    <Link to="/handbook">ПЕРЕЙТИ</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Боковая панель для профиля */}
          <div>
            <ProfilePreview />
            
            <div 
              className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border mt-6"
              style={{ 
                borderColor: `${currentTheme.accent}50`,
                boxShadow: `0 4px 20px ${currentTheme.accent}20`
              }}
            >
              <h3 
                className="text-lg font-bold mb-3"
                style={{ color: currentTheme.accent }}
              >
                Подсказка
              </h3>
              <p 
                className="text-sm"
                style={{ color: `${currentTheme.textColor}90` }}
              >
                Вы можете загрузить свои фоновые изображения, добавив их в папку 
                <code className="bg-black/60 px-1.5 mx-1.5 py-0.5 rounded text-xs">
                  public/lovable-uploads
                </code>
              </p>
              <p 
                className="text-sm mt-2"
                style={{ color: `${currentTheme.textColor}90` }}
              >
                Фон можно настроить в файле 
                <code className="bg-black/60 px-1.5 mx-1.5 py-0.5 rounded text-xs">
                  BackgroundWrapper.tsx
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default Home;
