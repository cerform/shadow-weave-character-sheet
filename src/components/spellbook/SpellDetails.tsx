
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Character } from '@/types/character';
import { SpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellDetailsProps {
  spell: SpellData | null;
  character?: Character;
}

const SpellDetails: React.FC<SpellDetailsProps> = ({ spell, character }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  if (!spell) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <p className="text-center text-muted-foreground">
            Выберите заклинание для просмотра деталей
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{
      backgroundColor: currentTheme.cardBackground,
      borderColor: currentTheme.accent,
      color: currentTheme.textColor
    }}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{spell.name}</span>
          <Badge>{spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}</Badge>
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline">{spell.school}</Badge>
          {spell.ritual && <Badge variant="outline">Ритуал</Badge>}
          {spell.concentration && <Badge variant="outline">Концентрация</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Время накладывания:</span>
            <div>{spell.castingTime || '1 действие'}</div>
          </div>
          <div>
            <span className="font-medium">Дистанция:</span>
            <div>{spell.range || 'На себя'}</div>
          </div>
          <div>
            <span className="font-medium">Компоненты:</span>
            <div>
              {[
                spell.verbal && 'В',
                spell.somatic && 'С',
                spell.material && 'М'
              ].filter(Boolean).join(', ') || 'Нет'}
            </div>
          </div>
          <div>
            <span className="font-medium">Длительность:</span>
            <div>{spell.duration || 'Мгновенная'}</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-1">Описание</h4>
          {typeof spell.description === 'string' ? (
            <p className="text-sm whitespace-pre-line">{spell.description}</p>
          ) : Array.isArray(spell.description) ? (
            <div className="space-y-2">
              {spell.description.map((paragraph, i) => (
                <p key={i} className="text-sm whitespace-pre-line">{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm">Нет описания</p>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-1">Классы</h4>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(spell.classes) ? (
              spell.classes.map((cls, i) => (
                <Badge key={i} variant="outline">{cls}</Badge>
              ))
            ) : typeof spell.classes === 'string' ? (
              <Badge variant="outline">{spell.classes}</Badge>
            ) : (
              <span className="text-sm">Все классы</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellDetails;
