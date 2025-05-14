
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, Clock, Target, Component, Timer, Sparkles, Zap } from 'lucide-react';
import { SpellData } from '@/types/spells';

interface SpellCardProps {
  spell: SpellData;
  onClick: () => void;
  currentTheme: any;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, onClick, currentTheme }) => {
  const getLevelName = (level: number) => {
    return level === 0 ? 'Заговор' : `${level} уровень`;
  };

  // Получение цвета для уровня заклинания из текущей темы
  const getLevelColor = (level: number) => {
    if (currentTheme.spellLevels && currentTheme.spellLevels[level]) {
      return currentTheme.spellLevels[level];
    }
    // Запасные цвета, если в теме не определены
    const fallbackColors: Record<number, string> = {
      0: '#6b7280', // gray-500
      1: '#3b82f6', // blue-500
      2: '#8b5cf6', // violet-500
      3: '#ec4899', // pink-500
      4: '#f97316', // orange-500
      5: '#ef4444', // red-500
      6: '#14b8a6', // teal-500
      7: '#6366f1', // indigo-500
      8: '#ca8a04', // yellow-600
      9: '#059669'  // emerald-600
    };
    return fallbackColors[level] || '#6b7280';
  };

  return (
    <Card 
      onClick={onClick}
      className="cursor-pointer hover:scale-105 transition-all duration-200 overflow-hidden"
      style={{ 
        backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.7)', 
        border: `1px solid ${currentTheme.accent}30`,
        boxShadow: `0 5px 15px rgba(0, 0, 0, 0.3), 0 0 8px ${currentTheme.accent}40`,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: getLevelColor(spell.level) }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle 
            className="text-xl font-bold truncate"
            style={{ color: currentTheme.textColor }}
          >
            {spell.name}
          </CardTitle>
          
          <Badge 
            style={{ 
              backgroundColor: getLevelColor(spell.level),
              color: '#fff',
              boxShadow: `0 0 5px ${getLevelColor(spell.level)}80`
            }}
          >
            {getLevelName(spell.level)}
          </Badge>
        </div>
        <div className="text-sm" style={{ color: currentTheme.accent }}>
          {spell.school}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="flex items-center" style={{ color: currentTheme.textColor }}>
            <Clock className="h-4 w-4 mr-1" style={{ color: currentTheme.accent }} />
            <span className="text-xs">{spell.castingTime || 'Н/Д'}</span>
          </div>
          
          <div className="flex items-center" style={{ color: currentTheme.textColor }}>
            <Target className="h-4 w-4 mr-1" style={{ color: currentTheme.accent }} />
            <span className="text-xs">{spell.range || 'Н/Д'}</span>
          </div>
          
          <div className="flex items-center" style={{ color: currentTheme.textColor }}>
            <Component className="h-4 w-4 mr-1" style={{ color: currentTheme.accent }} />
            <span className="text-xs">{spell.components || 'Н/Д'}</span>
          </div>
          
          <div className="flex items-center" style={{ color: currentTheme.textColor }}>
            <Timer className="h-4 w-4 mr-1" style={{ color: currentTheme.accent }} />
            <span className="text-xs">{spell.duration || 'Н/Д'}</span>
          </div>
        </div>
        
        <div className="text-sm h-16 overflow-hidden relative" style={{ color: currentTheme.textColor }}>
          {(() => {
            const desc = Array.isArray(spell.description) 
              ? spell.description[0] 
              : typeof spell.description === 'string' 
                ? spell.description 
                : '';
            
            return desc && desc.length > 100 
              ? `${desc.substring(0, 100)}...` 
              : desc;
          })()}
          <div className="absolute bottom-0 left-0 right-0 h-8" style={{ 
            background: `linear-gradient(to top, ${currentTheme.cardBackground || 'rgba(0,0,0,0.8)'}, transparent)`
          }}></div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-2" style={{ borderColor: currentTheme.accent + '30' }}>
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-1">
            {spell.ritual && (
              <Badge variant="outline" className="px-1 flex items-center gap-1" style={{ borderColor: currentTheme.accent }}>
                <Book className="h-3 w-3" style={{ color: currentTheme.accent }} />
                <span style={{ color: currentTheme.accent }}>Ритуал</span>
              </Badge>
            )}
            
            {spell.concentration && (
              <Badge variant="outline" className="px-1 flex items-center gap-1" style={{ borderColor: currentTheme.accent }}>
                <Sparkles className="h-3 w-3" style={{ color: currentTheme.accent }} />
                <span style={{ color: currentTheme.accent }}>Концентрация</span>
              </Badge>
            )}
          </div>
          
          <Badge variant="secondary" className="transition-all duration-200" 
                style={{ backgroundColor: currentTheme.accent + '20', color: currentTheme.accent }}>
            <Zap className="h-3 w-3 mr-1" />
            {(() => {
              if (typeof spell.classes === 'string') return spell.classes;
              if (Array.isArray(spell.classes)) {
                return spell.classes.length > 1 
                  ? `${spell.classes.length} классов` 
                  : spell.classes[0];
              }
              return 'Н/Д';
            })()}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SpellCard;
