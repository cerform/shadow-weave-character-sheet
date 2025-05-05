
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Book, ScrollText, UserPlus, Shield, Swords } from 'lucide-react';
import MainNavigation from '@/components/main-navigation';
import { useTheme } from '@/hooks/use-theme';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';
import { adaptFirebaseUser } from '@/types/user';

const Index = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { activeTheme, currentThemeStyles } = useUserTheme();
  
  // Безопасно получаем тему
  let currentTheme = themes.default; // Устанавливаем дефолтное значение
  try {
    // Сначала пробуем использовать тему из UserThemeContext
    if (activeTheme && themes[activeTheme as keyof typeof themes]) {
      currentTheme = themes[activeTheme as keyof typeof themes];
    }
    // Затем из ThemeContext, если activeTheme не определен
    else if (theme && themes[theme as keyof typeof themes]) {
      currentTheme = themes[theme as keyof typeof themes];
    }
  } catch (error) {
    console.error('Ошибка при получении темы:', error);
  }
  
  // Адаптируем Firebase User для получения правильных полей
  const adaptedUser = currentUser ? adaptFirebaseUser(currentUser) : null;

  const handleNavigateToAuth = () => {
    navigate('/auth');
  };

  const handleNavigateToCharacterCreation = () => {
    navigate('/character-creation');
  };

  const handleNavigateToSheet = () => {
    navigate('/sheet');
  };

  const handleNavigateToJoin = () => {
    navigate('/join');
  };

  const handleNavigateToDM = () => {
    navigate('/dm-dashboard');
  };

  const renderMainContent = () => {
    if (isAuthenticated) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="bg-card/80 p-6 rounded-lg shadow-lg flex flex-col items-center text-center border border-border/50">
            <Button 
              variant="ghost" 
              size="lg" 
              className="h-24 w-24 rounded-full mb-4 bg-primary/10 hover:bg-primary/20"
              onClick={handleNavigateToCharacterCreation}
            >
              <UserPlus size={36} />
            </Button>
            <h3 className="text-xl font-bold mb-2">Создать персонажа</h3>
            <p className="text-muted-foreground">
              Создайте нового персонажа, выбрав расу, класс и предысторию
            </p>
          </div>
          
          <div className="bg-card/80 p-6 rounded-lg shadow-lg flex flex-col items-center text-center border border-border/50">
            <Button 
              variant="ghost" 
              size="lg" 
              className="h-24 w-24 rounded-full mb-4 bg-primary/10 hover:bg-primary/20"
              onClick={handleNavigateToSheet}
            >
              <ScrollText size={36} />
            </Button>
            <h3 className="text-xl font-bold mb-2">Лист персонажа</h3>
            <p className="text-muted-foreground">
              Просмотр и редактирование вашего активного персонажа
            </p>
          </div>
          
          <div className="bg-card/80 p-6 rounded-lg shadow-lg flex flex-col items-center text-center border border-border/50">
            <Button 
              variant="ghost" 
              size="lg" 
              className="h-24 w-24 rounded-full mb-4 bg-primary/10 hover:bg-primary/20"
              onClick={adaptedUser?.isDM ? handleNavigateToDM : handleNavigateToJoin}
            >
              {adaptedUser?.isDM ? <Shield size={36} /> : <Swords size={36} />}
            </Button>
            <h3 className="text-xl font-bold mb-2">
              {adaptedUser?.isDM ? "Панель Мастера" : "Присоединиться к игре"}
            </h3>
            <p className="text-muted-foreground">
              {adaptedUser?.isDM 
                ? "Управляйте своими кампаниями и создавайте новые сессии" 
                : "Присоединитесь к существующей игровой сессии с вашим персонажем"
              }
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card/80 p-6 rounded-lg shadow-lg text-center border border-border/50">
          <h3 className="text-xl font-bold mb-4">Для игроков</h3>
          <p className="text-muted-foreground mb-6">
            Создавайте персонажей, управляйте их характеристиками и участвуйте в приключениях вместе с друзьями.
          </p>
          <Button onClick={handleNavigateToAuth}>Начать игру</Button>
        </div>
        <div className="bg-card/80 p-6 rounded-lg shadow-lg text-center border border-border/50">
          <h3 className="text-xl font-bold mb-4">Для Мастеров</h3>
          <p className="text-muted-foreground mb-6">
            Создавайте и проводите игровые сессии, управляйте NPC, монстрами и многим другим.
          </p>
          <Button onClick={handleNavigateToAuth}>Стать Мастером</Button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-background to-background/80"
      style={{ 
        backgroundImage: `url(/lovable-uploads/d90bff13-0557-4a8e-b175-08ef1d5bffa8.png)`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="container mx-auto px-4 py-6">
        <header className="mb-10">
          <div className="rounded-lg shadow-md p-4 bg-background/80 backdrop-blur-sm">
            <MainNavigation />
          </div>
        </header>

        <main>
          <section className="text-center max-w-3xl mx-auto">
            <h1 
              className="text-4xl md:text-5xl font-extrabold mb-4"
              style={{ 
                color: currentTheme.accent || '#6366f1', 
                textShadow: `0 0 10px ${currentTheme.glow || 'rgba(99, 102, 241, 0.5)'}` 
              }}
            >
              D&D 5e Лист персонажа
            </h1>
            <p className="text-xl text-foreground/80 mb-8">
              Создавайте персонажей, управляйте характеристиками и участвуйте в захватывающих приключениях вместе с друзьями
            </p>
            
            {renderMainContent()}
          </section>
          
          <section className="mt-20 py-10 rounded-lg bg-card/50 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-center mb-12">Особенности приложения</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <ScrollText size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Интерактивный лист персонажа</h3>
                  <p className="text-muted-foreground">
                    Полностью интерактивный лист персонажа с автоматическим расчётом всех характеристик и бонусов
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Book size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Справочник заклинаний</h3>
                  <p className="text-muted-foreground">
                    Полный справочник заклинаний D&D 5e с удобной системой фильтрации и поиска
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Shield size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Режим Мастера</h3>
                  <p className="text-muted-foreground">
                    Инструменты для Мастера подземелий, включая управление кампаниями, NPC и монстрами
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Swords size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Игровые сессии</h3>
                  <p className="text-muted-foreground">
                    Присоединяйтесь к игровым сессиям вместе с друзьями и отслеживайте ход боя в реальном времени
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-20 py-6 text-center text-muted-foreground">
          <p>© 2025 D&D 5e Character Sheet. Все права защищены.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
