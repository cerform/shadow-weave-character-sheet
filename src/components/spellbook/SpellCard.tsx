
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SpellData } from '@/types/spells';
import { Sparkles, BookOpen } from 'lucide-react';

interface SpellCardProps {
  spell: SpellData;
  onClick?: () => void;
  currentTheme: any;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, onClick, currentTheme }) => {
  // Подготовка описания для отображения
  const description = typeof spell.description === 'string' 
    ? spell.description 
    : Array.isArray(spell.description) 
      ? spell.description.join('\n') 
      : '';

  // Форматирование классов для отображения
  const classesText = typeof spell.classes === 'string' 
    ? spell.classes 
    : Array.isArray(spell.classes) 
      ? spell.classes.join(', ') 
      : '';

  return (
    <Card 
      className="spell-card hover:shadow-lg cursor-pointer transition-all hover:translate-y-[-2px] overflow-hidden"
      style={{
        backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'}`,
        borderColor: currentTheme.accent,
        boxShadow: `0 4px 15px ${currentTheme.accent}30`,
        border: `1px solid ${currentTheme.accent}80`,
      }}
      onClick={onClick}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: currentTheme.accent }}></div>
      <CardContent className="p-5 relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold" style={{ color: currentTheme.textColor || 'white' }}>
            {spell.name}
          </h3>
          <Badge
            className="shadow-sm"
            style={{
              backgroundColor: currentTheme.accent,
              color: '#fff',
            }}
          >
            {spell.level === 0 ? "Заговор" : `${spell.level}-й уровень`}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge 
            variant="outline" 
            className="shadow-sm border flex items-center"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderColor: currentTheme.accent,
              color: currentTheme.textColor
            }}
          >
            <BookOpen className="h-3 w-3 mr-1" />
            {spell.school}
          </Badge>
          
          {(spell.ritual || spell.isRitual) && (
            <Badge 
              variant="outline" 
              className="shadow-sm border flex items-center"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Ритуал
            </Badge>
          )}
          
          {(spell.concentration || spell.isConcentration) && (
            <Badge 
              variant="outline" 
              className="shadow-sm border flex items-center"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              Концентрация
            </Badge>
          )}
        </div>
        
        <Separator className="my-3" style={{ backgroundColor: `${currentTheme.accent}40` }} />
        
        <div className="grid grid-cols-2 gap-1 text-sm" style={{ color: currentTheme.textColor || 'white' }}>
          <div>
            <span className="font-semibold">Время:</span> {spell.castingTime}
          </div>
          <div>
            <span className="font-semibold">Дистанция:</span> {spell.range}
          </div>
          <div>
            <span className="font-semibold">Компоненты:</span> {spell.components}
          </div>
          <div>
            <span className="font-semibold">Длительность:</span> {spell.duration}
          </div>
        </div>

        {classesText && (
          <div className="mt-3 text-xs" style={{ color: `${currentTheme.textColor}90` || 'rgba(255, 255, 255, 0.7)' }}>
            <span className="font-semibold">Классы:</span> {classesText}
          </div>
        )}
        
        <div 
          className="absolute top-0 right-0 w-16 h-16 opacity-5"
          style={{ 
            backgroundImage: `radial-gradient(circle, ${currentTheme.accent} 0%, transparent 70%)` 
          }}
        ></div>
      </CardContent>
    </Card>
  );
};

export default SpellCard;
