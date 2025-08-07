import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, Flame, TreePine, Crown, Zap,
  ChevronDown, Wand2, Palette, Shield, Sword, Music
} from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Доступные фэнтезийные темы с правильным маппингом
const fantasyThemes = [
  {
    name: 'default',
    label: 'По умолчанию',
    description: 'Классический D&D стиль',
    icon: <Sparkles className="w-6 h-6" />,
    colors: { primary: '#8B5CF6', secondary: '#6366F1', accent: '#FBBF24' },
    orb: 'bg-gradient-to-br from-purple-500 to-blue-600'
  },
  {
    name: 'shadow',
    label: 'Колдун',
    description: 'Темная магия и тени',
    icon: <Zap className="w-6 h-6" />,
    colors: { primary: '#9F7AEA', secondary: '#6B46C1', accent: '#B794F6' },
    orb: 'bg-gradient-to-br from-violet-600 to-purple-800'
  },
  {
    name: 'frost',
    label: 'Волшебник',
    description: 'Ледяная магия',
    icon: <Sparkles className="w-6 h-6" />,
    colors: { primary: '#0284C7', secondary: '#0369A1', accent: '#0EA5E9' },
    orb: 'bg-gradient-to-br from-blue-500 to-cyan-600'
  },
  {
    name: 'emerald',
    label: 'Друид',
    description: 'Природная сила',
    icon: <TreePine className="w-6 h-6" />,
    colors: { primary: '#059669', secondary: '#047857', accent: '#10B981' },
    orb: 'bg-gradient-to-br from-green-500 to-emerald-600'
  },
  {
    name: 'flame',
    label: 'Воин',
    description: 'Огонь битвы',
    icon: <Sword className="w-6 h-6" />,
    colors: { primary: '#EA580C', secondary: '#DC2626', accent: '#F97316' },
    orb: 'bg-gradient-to-br from-red-500 to-orange-600'
  },
  {
    name: 'mystic',
    label: 'Бард',
    description: 'Магия музыки',
    icon: <Music className="w-6 h-6" />,
    colors: { primary: '#DB2777', secondary: '#BE185D', accent: '#EC4899' },
    orb: 'bg-gradient-to-br from-pink-500 to-rose-600'
  },
  {
    name: 'steel',
    label: 'Монах',
    description: 'Дисциплина стали',
    icon: <Shield className="w-6 h-6" />,
    colors: { primary: '#475569', secondary: '#334155', accent: '#64748B' },
    orb: 'bg-gradient-to-br from-slate-500 to-gray-600'
  },
  {
    name: 'bronze',
    label: 'Следопыт',
    description: 'Мудрость земли',
    icon: <TreePine className="w-6 h-6" />,
    colors: { primary: '#D97706', secondary: '#B45309', accent: '#F59E0B' },
    orb: 'bg-gradient-to-br from-amber-500 to-orange-600'
  },
  {
    name: 'dark',
    label: 'Чародей',
    description: 'Первозданная магия',
    icon: <Crown className="w-6 h-6" />,
    colors: { primary: '#8B5CF6', secondary: '#6366F1', accent: '#A855F7' },
    orb: 'bg-gradient-to-br from-violet-500 to-purple-600'
  }
];

const FantasyThemeSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
    setIsOpen(false);
    console.log(`🎨 Тема изменена на: ${themeName}`);
  };

  const currentThemeData = fantasyThemes.find(t => t.name === theme) || fantasyThemes[0];

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
        <Palette className="w-4 h-4 text-white" />
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
                ⚡ Выберите тему
              </h3>
              <p className="text-sm text-muted-foreground mb-4 font-fantasy-body">
                Каждая тема меняет атмосферу и цвета интерфейса
              </p>
            </div>
            
            <div className="grid gap-2 p-4 pt-0">
              {fantasyThemes.map((themeOption) => (
                <button
                  key={themeOption.name}
                  onClick={() => handleThemeChange(themeOption.name)}
                  className={`group relative p-3 rounded-lg border transition-all duration-300 text-left
                    ${theme === themeOption.name 
                      ? 'border-primary/60 bg-primary/10' 
                      : 'border-border/30 hover:border-primary/40 hover:bg-primary/5'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Цветной орб темы */}
                    <div 
                      className={`w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center ${themeOption.orb} group-hover:scale-110 transition-transform`}
                      style={{
                        boxShadow: `0 0 15px ${themeOption.colors.primary}40`
                      }}
                    >
                      <div className="text-white">
                        {themeOption.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-fantasy-heading text-foreground">
                        {themeOption.label}
                      </div>
                      <div className="text-xs text-muted-foreground font-fantasy-body">
                        {themeOption.description}
                      </div>
                    </div>
                    
                    {theme === themeOption.name && (
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