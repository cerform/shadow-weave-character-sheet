
import React from 'react';
import { CharacterSpell } from '@/types/character';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { SpellDetailModal } from './SpellDetailModal';
import { useMediaQuery } from '@/hooks/use-media-query';

interface SpellCardProps {
  spell: CharacterSpell;
  compactMode?: boolean;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, compactMode }) => {
  const { themeStyles } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)") || compactMode;
  
  // Определяем класс школы заклинания для стилей
  const getSchoolColor = () => {
    const schools: Record<string, string> = {
      'Ограждение': 'bg-blue-700',
      'Вызов': 'bg-purple-700',
      'Прорицание': 'bg-cyan-700',
      'Очарование': 'bg-pink-700',
      'Воплощение': 'bg-red-700',
      'Иллюзия': 'bg-indigo-700',
      'Некромантия': 'bg-green-700',
      'Преобразование': 'bg-yellow-700',
      'Познание': 'bg-orange-700',
    };
    return schools[spell.school] || 'bg-gray-700';
  };

  // Геттер для отображения уровня заклинания
  const getLevelDisplay = () => {
    return spell.level === 0 ? 'Заговор' : `${spell.level} уровень`;
  };
  
  // Для мобильных устройств используем компактную карточку
  if (isMobile) {
    return (
      <SpellDetailModal spell={spell}>
        <Card 
          className="p-3 cursor-pointer hover:shadow-md transition-shadow flex justify-between items-center"
          style={{ 
            borderColor: themeStyles?.accent + '60',
            backgroundColor: themeStyles?.cardBackground || 'rgba(0, 0, 0, 0.7)'
          }}
        >
          <div>
            <h3 className="font-medium text-base">{spell.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`${getSchoolColor()} text-xs px-1 py-0`}>
                {spell.school}
              </Badge>
              <span className="text-xs opacity-70">{getLevelDisplay()}</span>
            </div>
          </div>
        </Card>
      </SpellDetailModal>
    );
  }

  // Полная версия карточки для десктопа
  return (
    <SpellDetailModal spell={spell}>
      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        style={{ 
          borderColor: themeStyles?.accent + '60',
          backgroundColor: themeStyles?.cardBackground || 'rgba(0, 0, 0, 0.7)'
        }}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{spell.name}</h3>
          <Badge variant="outline" className={getSchoolColor()}>
            {spell.school}
          </Badge>
        </div>
        
        <div className="mt-1 text-sm opacity-70">
          <span>{getLevelDisplay()}</span>
        </div>
        
        <div className="mt-2 space-y-1 text-sm">
          <div><strong>Время накладывания:</strong> {spell.castingTime}</div>
          <div><strong>Дистанция:</strong> {spell.range}</div>
          <div><strong>Компоненты:</strong> {spell.components}</div>
          <div><strong>Длительность:</strong> {spell.duration}</div>
          
          <div className="mt-2">
            <span className="text-xs opacity-70">Нажмите для подробностей</span>
          </div>
        </div>
      </Card>
    </SpellDetailModal>
  );
};

export default SpellCard;
