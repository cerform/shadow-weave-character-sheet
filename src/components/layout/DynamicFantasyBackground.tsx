import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Shuffle, Palette } from 'lucide-react';

// Конфигурация фэнтезийных сцен
const fantasyScenes = [
  {
    id: 'tavern',
    name: '🍺 Таверна',
    description: 'Уютная таверна с теплым светом и дружественной атмосферой',
    background: 'linear-gradient(135deg, #2D1B0E 0%, #4A2C17 30%, #5C3317 70%, #6B4226 100%)',
    overlay: 'radial-gradient(circle at 30% 40%, rgba(255, 140, 0, 0.3) 0%, transparent 50%), linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8))',
    particles: '🕯️',
    mood: 'warm'
  },
  {
    id: 'dragon_lair',
    name: '🐉 Логово дракона',
    description: 'Темная пещера с сокровищами и опасностью',
    background: 'linear-gradient(135deg, #1A0E1A 0%, #2D1B2D 30%, #4A2C4A 70%, #5C3A5C 100%)',
    overlay: 'radial-gradient(ellipse at 60% 30%, rgba(220, 20, 60, 0.4) 0%, transparent 50%), linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9))',
    particles: '💎',
    mood: 'dark'
  },
  {
    id: 'enchanted_forest',
    name: '🌲 Волшебный лес',
    description: 'Мистический лес с магическими огоньками',
    background: 'linear-gradient(135deg, #0D2818 0%, #1A4D32 30%, #2D5B47 70%, #3A6B5C 100%)',
    overlay: 'radial-gradient(circle at 70% 20%, rgba(144, 238, 144, 0.3) 0%, transparent 50%), linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7))',
    particles: '✨',
    mood: 'mystical'
  },
  {
    id: 'castle_hall',
    name: '🏰 Замковый зал',
    description: 'Величественный зал с высокими колоннами',
    background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D5F 30%, #404080 70%, #5555A1 100%)',
    overlay: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6))',
    particles: '👑',
    mood: 'royal'
  },
  {
    id: 'dungeon',
    name: '⛓️ Подземелье',
    description: 'Мрачные подземные коридоры',
    background: 'linear-gradient(135deg, #0F0F0F 0%, #1F1F1F 30%, #2F2F2F 70%, #3F3F3F 100%)',
    overlay: 'radial-gradient(circle at 50% 0%, rgba(139, 69, 19, 0.3) 0%, transparent 50%), linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9))',
    particles: '🔥',
    mood: 'ominous'
  },
  {
    id: 'magic_tower',
    name: '🔮 Башня мага',
    description: 'Мистическая башня полная магической энергии',
    background: 'linear-gradient(135deg, #1E0A3E 0%, #3D1A78 30%, #5B2FB3 70%, #7B45ED 100%)',
    overlay: 'radial-gradient(circle at 50% 50%, rgba(123, 69, 237, 0.3) 0%, transparent 60%), linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7))',
    particles: '⭐',
    mood: 'arcane'
  }
];

interface DynamicFantasyBackgroundProps {
  children: React.ReactNode;
  autoRotate?: boolean;
  rotateInterval?: number; // в секундах
}

const DynamicFantasyBackground: React.FC<DynamicFantasyBackgroundProps> = ({
  children,
  autoRotate = true,
  rotateInterval = 30
}) => {
  const [currentScene, setCurrentScene] = useState(fantasyScenes[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  // Автоматическая смена сцен
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      changeScene();
    }, rotateInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, currentScene]);

  // Генерация частиц для текущей сцены
  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, [currentScene]);

  const changeScene = (sceneId?: string) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (sceneId) {
        const scene = fantasyScenes.find(s => s.id === sceneId);
        if (scene) setCurrentScene(scene);
      } else {
        // Случайная смена
        const currentIndex = fantasyScenes.findIndex(s => s.id === currentScene.id);
        const nextIndex = (currentIndex + 1) % fantasyScenes.length;
        setCurrentScene(fantasyScenes[nextIndex]);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const randomizeScene = () => {
    const randomScene = fantasyScenes[Math.floor(Math.random() * fantasyScenes.length)];
    if (randomScene.id !== currentScene.id) {
      changeScene(randomScene.id);
    } else {
      // Если выпала та же сцена, берем следующую
      changeScene();
    }
  };

  return (
    <div 
      className={`min-h-screen relative overflow-hidden transition-all duration-700 ${
        isTransitioning ? 'opacity-50' : 'opacity-100'
      }`}
      style={{
        background: currentScene.background,
      }}
    >
      {/* Overlay для создания глубины */}
      <div 
        className="absolute inset-0 w-full h-full transition-all duration-700"
        style={{
          background: currentScene.overlay,
        }}
      />

      {/* Анимированные частицы */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute text-2xl animate-pulse opacity-60"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: '3s'
            }}
          >
            {currentScene.particles}
          </div>
        ))}
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
        <div className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ top: '60%', left: '80%', animationDelay: '1s' }} />
        <div className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ top: '80%', left: '30%', animationDelay: '2s' }} />
        <div className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ top: '40%', left: '70%', animationDelay: '1.5s' }} />
      </div>

      {/* Scene Controls */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-black/50 backdrop-blur-md border-white/20 text-white hover:bg-black/70"
            >
              <Palette className="h-4 w-4 mr-2" />
              {currentScene.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="bg-black/80 backdrop-blur-md border-white/20 text-white"
          >
            {fantasyScenes.map((scene) => (
              <DropdownMenuItem
                key={scene.id}
                onClick={() => changeScene(scene.id)}
                className="hover:bg-white/10 focus:bg-white/10"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{scene.name}</span>
                  <span className="text-xs text-white/70">{scene.description}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={randomizeScene}
          className="bg-black/50 backdrop-blur-md border-white/20 text-white hover:bg-black/70"
        >
          <Shuffle className="h-4 w-4" />
        </Button>
      </div>

      {/* Scene Info */}
      <div className="fixed bottom-4 left-4 z-40 max-w-xs">
        <div className="bg-black/50 backdrop-blur-md rounded-lg p-3 border border-white/20 text-white">
          <h3 className="font-fantasy-header text-sm font-semibold mb-1">
            {currentScene.name}
          </h3>
          <p className="text-xs text-white/80">
            {currentScene.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>

      {/* Enhanced particle effects with CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DynamicFantasyBackground;