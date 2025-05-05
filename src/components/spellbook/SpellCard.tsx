
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellCardProps {
  spell: SpellData;
  onClick?: () => void;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, onClick }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const getSchoolBadgeColor = (school: string) => {
    // Цвета для школ магии
    const schoolColors: { [key: string]: string } = {
      'Преобразование': 'bg-blue-900 text-white',
      'Воплощение': 'bg-red-900 text-white',
      'Вызов': 'bg-orange-900 text-white',
      'Прорицание': 'bg-purple-900 text-white',
      'Очарование': 'bg-pink-900 text-white',
      'Иллюзия': 'bg-indigo-900 text-white',
      'Некромантия': 'bg-green-900 text-white',
      'Ограждение': 'bg-yellow-900 text-white',
    };

    return schoolColors[school] || "bg-gray-800 text-white";
  };

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
      className="spell-card border border-accent hover:shadow-lg cursor-pointer transition-all"
      style={{
        backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)'}`,
        borderColor: currentTheme.accent,
      }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold" style={{color: currentTheme.textColor || 'white'}}>
            {spell.name}
          </h3>
          <Badge
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.textColor || 'white',
            }}
          >
            {spell.level === 0 ? "Заговор" : `${spell.level}-й уровень`}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline" className={getSchoolBadgeColor(spell.school)}>
            {spell.school}
          </Badge>
          
          {(spell.ritual || spell.isRitual) && (
            <Badge variant="outline" className="bg-black/30">
              Ритуал
            </Badge>
          )}
          
          {(spell.concentration || spell.isConcentration) && (
            <Badge variant="outline" className="bg-black/30">
              Концентрация
            </Badge>
          )}
        </div>
        
        <Separator className="my-2" />
        
        <div className="grid grid-cols-2 gap-1 text-sm" style={{color: currentTheme.textColor || 'white'}}>
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
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-semibold">Классы:</span> {classesText}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpellCard;
