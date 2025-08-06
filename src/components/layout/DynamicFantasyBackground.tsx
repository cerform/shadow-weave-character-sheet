import React, { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import fantasyBg1 from '@/assets/fantasy-bg-1.jpg';
import fantasyBg2 from '@/assets/fantasy-bg-2.jpg';
import fantasyBg3 from '@/assets/fantasy-bg-3.jpg';
import campfireForest from '@/assets/backgrounds/campfire-forest.jpg';

interface DynamicFantasyBackgroundProps {
  children: React.ReactNode;
  autoChange?: boolean;
  interval?: number;
}

const DynamicFantasyBackground: React.FC<DynamicFantasyBackgroundProps> = ({ 
  children, 
  autoChange = true,
  interval = 45000 // 45 секунд
}) => {
  const { theme } = useTheme();
  
  const backgrounds = [
    {
      id: 'campfire',
      name: 'Костер в лесу',
      image: campfireForest,
      overlay: 'linear-gradient(135deg, rgba(139, 69, 19, 0.3) 0%, rgba(101, 67, 33, 0.4) 50%, rgba(34, 34, 34, 0.6) 100%)',
      particles: 'fire'
    },
    {
      id: 'dragons',
      name: 'Драконы и битвы',
      image: fantasyBg1,
      overlay: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(75, 85, 99, 0.5) 50%, rgba(17, 24, 39, 0.7) 100%)',
      particles: 'magic'
    },
    {
      id: 'tavern',
      name: 'Фэнтези таверна',
      image: fantasyBg2,
      overlay: 'linear-gradient(135deg, rgba(92, 92, 92, 0.3) 0%, rgba(55, 48, 163, 0.4) 50%, rgba(15, 15, 35, 0.6) 100%)',
      particles: 'stars'
    },
    {
      id: 'dungeon',
      name: 'Подземелье',
      image: fantasyBg3,
      overlay: 'linear-gradient(135deg, rgba(75, 0, 130, 0.4) 0%, rgba(51, 51, 51, 0.5) 50%, rgba(0, 0, 0, 0.7) 100%)',
      particles: 'mystic'
    }
  ];

  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const currentBackground = backgrounds[currentBackgroundIndex];

  useEffect(() => {
    if (!autoChange) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
        setIsTransitioning(false);
      }, 500);
    }, interval);

    return () => clearInterval(timer);
  }, [autoChange, interval, backgrounds.length]);

  const renderParticles = (type: string) => {
    const particleCount = 8;
    const particles = [...Array(particleCount)].map((_, i) => {
      const delay = i * 0.5;
      const duration = 3 + Math.random() * 2;
      
      switch (type) {
        case 'fire':
          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-400 rounded-full opacity-70"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${60 + Math.random() * 30}%`,
                animation: `float ${duration}s ease-in-out infinite ${delay}s`,
                boxShadow: '0 0 6px rgba(251, 146, 60, 0.8)'
              }}
            />
          );
        case 'magic':
          return (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${20 + Math.random() * 60}%`,
                animation: `shimmer ${duration}s ease-in-out infinite ${delay}s`,
                boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)'
              }}
            />
          );
        case 'stars':
          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-80"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 50}%`,
                animation: `twinkle ${duration}s ease-in-out infinite ${delay}s`
              }}
            />
          );
        case 'mystic':
          return (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full opacity-50"
              style={{
                left: `${25 + Math.random() * 50}%`,
                top: `${30 + Math.random() * 40}%`,
                animation: `pulse ${duration}s ease-in-out infinite ${delay}s`,
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
              }}
            />
          );
        default:
          return null;
      }
    });

    return particles;
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
        
        @keyframes shimmer {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          33% { transform: translateY(-15px) rotate(120deg); opacity: 1; }
          66% { transform: translateY(-5px) rotate(240deg); opacity: 0.8; }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
      
      <div className="min-h-screen relative overflow-hidden">
        {/* Основной фоновый слой */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ${
            isTransitioning ? 'opacity-50 scale-110' : 'opacity-100 scale-100'
          }`}
          style={{ 
            backgroundImage: `url(${currentBackground.image})`,
            filter: isTransitioning ? 'blur(2px)' : 'blur(0px)'
          }}
        />
        
        {/* Тематическое наложение */}
        <div 
          className={`absolute inset-0 transition-all duration-1000 ${
            isTransitioning ? 'opacity-30' : 'opacity-80'
          }`}
          style={{ 
            background: currentBackground.overlay
          }}
        />
        
        {/* Дополнительный градиент для читаемости */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/20" />
        
        {/* Анимированные частицы */}
        <div className="absolute inset-0 pointer-events-none">
          {renderParticles(currentBackground.particles)}
        </div>
        
        {/* Индикатор текущего фона */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex space-x-2">
            {backgrounds.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentBackgroundIndex(index);
                    setIsTransitioning(false);
                  }, 500);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentBackgroundIndex 
                    ? 'bg-primary shadow-lg shadow-primary/50' 
                    : 'bg-background/50 hover:bg-background/70'
                }`}
                title={backgrounds[index].name}
              />
            ))}
          </div>
        </div>
        
        {/* Содержимое страницы */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </div>
    </>
  );
};

export default DynamicFantasyBackground;