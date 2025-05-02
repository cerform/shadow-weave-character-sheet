
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellCardProps {
  spell: any;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const getBadgeColor = (level: number) => {
    // Используем цвета в зависимости от выбранной темы
    return level === 0 
      ? "bg-stone-800 text-white" 
      : "bg-primary text-white";
  };

  const getSchoolBadgeColor = (school: string) => {
    // Используем цвета в зависимости от выбранной темы
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

  return (
    <Card 
      className="spell-card border border-accent" 
      style={{
        backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)'}`,
        borderColor: currentTheme.accent,
        color: currentTheme.textColor
      }}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4">
          <h2 className="text-2xl font-bold">{spell.name}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={getBadgeColor(spell.level)}
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.textColor,
                borderColor: currentTheme.accent
              }}
            >
              {spell.level === 0 ? "Заговор" : `${spell.level}-й уровень`}
            </Badge>
            <Badge
              className={getSchoolBadgeColor(spell.school)}
              style={{
                borderColor: currentTheme.accent
              }}
            >
              {spell.school}
            </Badge>
            {spell.isRitual && (
              <Badge variant="outline" className="border-accent">
                Ритуал
              </Badge>
            )}
            {spell.isConcentration && (
              <Badge variant="outline" className="border-accent">
                Концентрация
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <span className="font-semibold">Время накладывания:</span> {spell.castingTime}
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

        <Separator className="my-4 bg-accent/30" />

        <div className="space-y-4">
          <div 
            className="spell-description text-base" 
            style={{color: currentTheme.textColor}}
          >
            {spell.description.split('\n').map((paragraph: string, index: number) => (
              <p key={index} className="mb-2">{paragraph}</p>
            ))}
          </div>
        </div>

        {spell.classes && (
          <div className="mt-4">
            <span className="font-semibold">Классы:</span> {spell.classes}
          </div>
        )}
        
        {spell.source && (
          <div className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold">Источник:</span> {spell.source}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-accent/30 p-4 bg-card/60">
        <div className="text-sm text-muted-foreground w-full">
          Заклинания D&D 5e
        </div>
      </CardFooter>
    </Card>
  );
};

export default SpellCard;
