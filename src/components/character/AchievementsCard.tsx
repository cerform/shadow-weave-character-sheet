
import React from "react";
import { UserType } from "@/types/auth";
import { Theme } from "@/lib/themes";
import { Award, Scroll, Book, Shield, Crown, Check } from "lucide-react";
import { RibbonBadge } from "@/components/ui/RibbonBadge";
import { Button } from "@/components/ui/button";

interface AchievementsCardProps {
  currentUser: UserType;
  theme: Theme;
}

export const AchievementsCard: React.FC<AchievementsCardProps> = ({
  currentUser,
  theme
}) => {
  // Имитируем данные о достижениях
  const achievements = [
    { 
      id: 'dragon_slayer', 
      name: 'Драконоборец', 
      description: 'Победил древнего дракона', 
      icon: 'crown', 
      unlocked: true,
      rarity: 'legendary' 
    },
    { 
      id: 'quest_complete', 
      name: 'Свиток Судьбы', 
      description: 'Завершил первую кампанию', 
      icon: 'scroll', 
      unlocked: true,
      rarity: 'rare' 
    },
    { 
      id: 'level_10', 
      name: 'Путь героя', 
      description: 'Достиг 10 уровня', 
      icon: 'award', 
      unlocked: false,
      rarity: 'uncommon' 
    },
    { 
      id: 'dm_first', 
      name: 'Мастер рассказчик', 
      description: 'Провел первую игру как ДМ', 
      icon: 'book', 
      unlocked: currentUser?.isDM || false,
      rarity: 'rare' 
    },
    { 
      id: 'party_friend', 
      name: 'Верный соратник', 
      description: 'Участвовал в 5 сессиях', 
      icon: 'check', 
      unlocked: true,
      rarity: 'common' 
    },
  ];

  // Статистика игрока
  const stats = {
    sessionsPlayed: 7,
    lastSession: '2023-05-01',
    charactersCreated: 3,
    role: currentUser?.isDM ? 'Мастер Подземелий' : 'Игрок',
    daysActive: 42,
  };
  
  // Определяем иконку по названию
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'crown': return <Crown className="h-5 w-5" />;
      case 'scroll': return <Scroll className="h-5 w-5" />;
      case 'award': return <Award className="h-5 w-5" />;
      case 'book': return <Book className="h-5 w-5" />;
      case 'shield': return <Shield className="h-5 w-5" />;
      case 'check': return <Check className="h-5 w-5" />;
      default: return <Award className="h-5 w-5" />;
    }
  };
  
  // Определяем цвет по редкости
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#a5a5a5';
      case 'uncommon': return '#1eff00';
      case 'rare': return '#0070dd';
      case 'epic': return '#a335ee';
      case 'legendary': return '#ff8000';
      default: return '#a5a5a5';
    }
  };
  
  // Форматируем дату
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div 
      className="bg-[url('/lovable-uploads/f42db994-ba63-4160-b476-3ec2bb95c207.png')] bg-cover bg-center rounded-lg border-2 shadow-xl backdrop-blur-sm"
      style={{ 
        borderColor: 'rgba(139, 90, 43, 0.6)',
        boxShadow: '0 8px 32px rgba(139, 90, 43, 0.3)'
      }}
    >
      <div className="bg-black/70 p-6 backdrop-blur-sm h-full">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Award className="h-6 w-6 text-amber-300" />
          <h2 className="font-cormorant text-3xl text-center text-amber-100 drop-shadow-lg">
            Достижения
          </h2>
        </div>
        
        <div className="space-y-6">
          {/* Статистика */}
          <div className="bg-black/50 rounded-lg p-4 border border-amber-900/40">
            <h3 className="text-amber-200 font-semibold mb-3 text-lg">Статистика</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-xs text-amber-100/70">Сыграно сессий</p>
                <p className="text-lg text-amber-100">{stats.sessionsPlayed}</p>
              </div>
              <div>
                <p className="text-xs text-amber-100/70">Персонажей создано</p>
                <p className="text-lg text-amber-100">{stats.charactersCreated}</p>
              </div>
              <div>
                <p className="text-xs text-amber-100/70">Роль</p>
                <p className="text-lg text-amber-100">{stats.role}</p>
              </div>
              <div>
                <p className="text-xs text-amber-100/70">Дней активности</p>
                <p className="text-lg text-amber-100">{stats.daysActive}</p>
              </div>
            </div>
            
            <div className="mt-3">
              <p className="text-xs text-amber-100/70">Последняя сессия</p>
              <p className="text-md text-amber-100">{formatDate(stats.lastSession)}</p>
            </div>
          </div>
          
          {/* Значки достижений */}
          <div>
            <h3 className="text-amber-200 font-semibold mb-3 text-lg">Значки и награды</h3>
            <div className="grid grid-cols-3 gap-2">
              {achievements.map((achievement) => (
                <RibbonBadge
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  icon={getIcon(achievement.icon)}
                  unlocked={achievement.unlocked}
                  color={getRarityColor(achievement.rarity)}
                />
              ))}
            </div>
          </div>
          
          {/* Кнопки действий */}
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start bg-black/40"
              style={{
                borderColor: theme.accent + '50',
                color: theme.textColor
              }}
              onClick={() => {}}
            >
              <Scroll className="mr-2 h-4 w-4" />
              Перейти к листу персонажа
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start bg-black/40"
              style={{
                borderColor: theme.accent + '50',
                color: theme.textColor
              }}
              onClick={() => {}}
            >
              <Shield className="mr-2 h-4 w-4" />
              Создать нового персонажа
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
