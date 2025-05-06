
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { CharacterProvider } from './contexts/CharacterContext';
import { SpellbookProvider } from './contexts/SpellbookContext';
import { UserThemeProvider } from '@/hooks/use-user-theme';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Placeholder pages for now - these will be created later
const HomePage = () => <div>Home Page</div>;
const LoginPage = () => <div>Login Page</div>;
const RegisterPage = () => <div>Register Page</div>;
const CharacterPage = () => <div>Character Page</div>;
const CreateCharacterPage = () => <div>Create Character Page</div>;
const CharactersListPage = () => <div>Characters List Page</div>;
const DMPage = () => <div>DM Page</div>;
const NotFoundPage = () => <div>Not Found Page</div>;

// Компонент для применения темы глобально
const ThemeApplier = () => {
  const { theme, themeStyles } = useTheme();
  
  useEffect(() => {
    // Проверяем localStorage на наличие сохраненной темы
    const savedTheme = localStorage.getItem('userTheme') || 
                       localStorage.getItem('dnd-theme') || 
                       localStorage.getItem('theme') || 
                       'default';
    
    // Устанавливаем атрибуты для темы на корневом элементе
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Добавляем класс темы к body
    document.body.className = '';
    document.body.classList.add(`theme-${savedTheme}`);
    
    // Устанавливаем CSS-переменные для темы
    const currentTheme = themes[savedTheme as keyof typeof themes] || themes.default;
    document.documentElement.style.setProperty('--background', currentTheme.background);
    document.documentElement.style.setProperty('--foreground', currentTheme.foreground);
    document.documentElement.style.setProperty('--primary', currentTheme.primary);
    document.documentElement.style.setProperty('--accent', currentTheme.accent);
    document.documentElement.style.setProperty('--text', currentTheme.textColor);
    document.documentElement.style.setProperty('--card-bg', currentTheme.cardBackground);
  }, [theme, themeStyles]);
  
  return null;
};

function App() {
  return (
    <UserThemeProvider>
      <ThemeProvider>
        <AuthProvider>
          <CharacterProvider>
            <SpellbookProvider>
              <Router>
                <ThemeApplier />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/characters" element={<CharactersListPage />} />
                  <Route path="/characters/:id" element={<CharacterPage />} />
                  <Route path="/create" element={<CreateCharacterPage />} />
                  <Route path="/dm" element={<DMPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                <Toaster />
              </Router>
            </SpellbookProvider>
          </CharacterProvider>
        </AuthProvider>
      </ThemeProvider>
    </UserThemeProvider>
  );
}

export default App;
