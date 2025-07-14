import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, Flame, TreePine, Crown, Zap,
  ChevronDown, Wand2 
} from 'lucide-react';

// Доступные фэнтезийные темы
const fantasyThemes = [
  {
    name: 'arcane',
    label: 'Аркана',
    description: 'Мистическая магия',
    icon: <Sparkles className="w-6 h-6" />,
    colors: { primary: '#9F7AEA', secondary: '#6366F1', accent: '#FBBF24' },
    orb: 'bg-gradient-to-br from-purple-500 to-blue-600'
  },
  {
    name: 'forest',
    label: 'Лес',
    description: 'Природная магия',
    icon: <TreePine className="w-6 h-6" />,
    colors: { primary: '#22C55E', secondary: '#65A30D', accent: '#FACC15' },
    orb: 'bg-gradient-to-br from-green-500 to-emerald-600'
  },
  {
    name: 'inferno',
    label: 'Преисподняя',
    description: 'Огонь и разрушение',
    icon: <Flame className="w-6 h-6" />,
    colors: { primary: '#EF4444', secondary: '#FB923C', accent: '#FBBF24' },
    orb: 'bg-gradient-to-br from-red-500 to-orange-600'
  },
  {
    name: 'underdark',
    label: 'Подземье',
    description: 'Тени и тайны',
    icon: <Zap className="w-6 h-6" />,
    colors: { primary: '#7C3AED', secondary: '#4338CA', accent: '#A855F7' },
    orb: 'bg-gradient-to-br from-violet-600 to-purple-800'
  },
  {
    name: 'divine',
    label: 'Божественная',
    description: 'Святой свет',
    icon: <Crown className="w-6 h-6" />,
    colors: { primary: '#FBBF24', secondary: '#F59E0B', accent: '#FFFFFF' },
    orb: 'bg-gradient-to-br from-yellow-400 to-amber-500'
  }
];

const FantasyThemeSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('arcane');

  const handleThemeChange = (themeName: string) => {
    setCurrentTheme(themeName);
    
    // Используем themeManager для применения темы
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('selected-theme', themeName);
    
    setIsOpen(false);
    console.log(`🎨 Тема изменена на: ${themeName}`);
  };

  // Загружаем сохраненную тему при инициализации
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('selected-theme') || 'default';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const currentThemeData = fantasyThemes.find(t => t.name === currentTheme) || fantasyThemes[0];

  return (
    <div className="relative">
      {/* Главная кнопка-орб */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="theme-orb flex items-center gap-2 px-3 py-2 h-auto border-primary/30 hover:border-primary/60"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${currentThemeData.colors.primary}, ${currentThemeData.colors.secondary})`
        }}
      >
        <Wand2 className="w-4 h-4 text-white" />
        <span className="text-white font-fantasy-body text-sm hidden sm:inline">
          {currentThemeData.label}
        </span>
        <ChevronDown className={`w-3 h-3 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Выпадающий список тем */}
      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-80 z-50 magic-card border-primary/30">
          <CardContent className="p-0">
            <div className="p-4">
              <h3 className="font-fantasy-heading text-lg mb-2 text-glow">
                ⚡ Выберите Магию
              </h3>
              <p className="text-sm text-muted-foreground mb-4 font-fantasy-body">
                Каждая тема меняет атмосферу и цвета интерфейса
              </p>
            </div>
            
            <div className="grid gap-2 p-4 pt-0">
              {fantasyThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name)}
                  className={`group relative p-3 rounded-lg border transition-all duration-300 text-left
                    ${currentTheme === theme.name 
                      ? 'border-primary/60 bg-primary/10' 
                      : 'border-border/30 hover:border-primary/40 hover:bg-primary/5'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Цветной орб темы */}
                    <div 
                      className={`w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center ${theme.orb} group-hover:scale-110 transition-transform`}
                      style={{
                        boxShadow: `0 0 15px ${theme.colors.primary}40`
                      }}
                    >
                      <div className="text-white">
                        {theme.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-fantasy-heading text-foreground">
                        {theme.label}
                      </div>
                      <div className="text-xs text-muted-foreground font-fantasy-body">
                        {theme.description}
                      </div>
                    </div>
                    
                    {currentTheme === theme.name && (
                      <div className="text-primary animate-pulse">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-4 pt-0">
              <div className="text-xs text-muted-foreground font-fantasy-body text-center">
                🔮 Темы сохраняются автоматически
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Закрытие при клике вне */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FantasyThemeSelector;