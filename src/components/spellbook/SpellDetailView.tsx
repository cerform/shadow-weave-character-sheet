
import React from 'react';
import { SpellData } from '@/types/spells';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Plus, Minus, BookOpen } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { componentsToString } from '@/utils/spellProcessors';

interface SpellDetailViewProps {
  spell: SpellData | null;
  onPrepareSpell?: (spell: SpellData) => void;
  onAddSpell?: (spell: SpellData) => void;
  onRemoveSpell?: (spell: SpellData) => void;
  isOwned?: boolean;
  isPrepared?: boolean;
  canPrepareMore?: boolean;
}

const SpellDetailView: React.FC<SpellDetailViewProps> = ({
  spell,
  onPrepareSpell,
  onAddSpell,
  onRemoveSpell,
  isOwned = false,
  isPrepared = false,
  canPrepareMore = true
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  if (!spell) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center p-6">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Выберите заклинание для просмотра деталей</p>
        </CardContent>
      </Card>
    );
  }

  const getLevelName = (level: number) => {
    if (level === 0) return 'Заговор';
    if (level === 1) return '1-й уровень';
    if (level === 2) return '2-й уровень';
    if (level === 3) return '3-й уровень';
    return `${level}-й уровень`;
  };
  
  const formatSchool = (school: string = 'Универсальная') => {
    // Отображаем русское название школы магии
    const schoolMap: Record<string, string> = {
      'abjuration': 'Ограждение',
      'conjuration': 'Вызов',
      'divination': 'Прорицание',
      'enchantment': 'Очарование',
      'evocation': 'Воплощение',
      'illusion': 'Иллюзия',
      'necromancy': 'Некромантия',
      'transmutation': 'Преобразование',
    };
    
    return schoolMap[school.toLowerCase()] || school;
  };
  
  const formatDescription = (description: string | string[]) => {
    if (!description) return ['Нет описания'];
    
    if (Array.isArray(description)) {
      return description;
    }
    
    // Разбиваем длинное описание на абзацы
    return description.split('\n\n');
  };
  
  const formatClasses = (classes: string[] | string | undefined) => {
    if (!classes) return '';
    
    if (typeof classes === 'string') {
      return classes;
    }
    
    return classes.join(', ');
  };

  return (
    <Card
      className="h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.borderColor }}
    >
      <div
        className="p-4 border-b"
        style={{ borderColor: currentTheme.borderColor }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-medium" style={{ color: currentTheme.textColor }}>
              {spell.name}
            </h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline" style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}>
                {getLevelName(spell.level)}
              </Badge>
              <Badge variant="outline" style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}>
                {formatSchool(spell.school)}
              </Badge>
              {spell.ritual && (
                <Badge variant="outline" style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}>
                  Ритуал
                </Badge>
              )}
              {spell.concentration && (
                <Badge variant="outline" style={{ borderColor: currentTheme.accent, color: currentTheme.accent }}>
                  Концентрация
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {onPrepareSpell && spell.level > 0 && (
              <Button
                size="sm"
                variant={isPrepared ? "default" : "outline"}
                onClick={() => onPrepareSpell(spell)}
                disabled={!isPrepared && !canPrepareMore}
                style={{
                  backgroundColor: isPrepared ? currentTheme.accent : 'transparent',
                  borderColor: currentTheme.accent,
                  color: isPrepared ? 'white' : currentTheme.accent
                }}
              >
                <Star className="h-4 w-4" />
              </Button>
            )}
            
            {!isOwned && onAddSpell && (
              <Button
                size="sm"
                onClick={() => onAddSpell(spell)}
                style={{
                  backgroundColor: currentTheme.accent,
                  color: 'white'
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Добавить
              </Button>
            )}
            
            {isOwned && onRemoveSpell && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRemoveSpell(spell)}
              >
                <Minus className="h-4 w-4 mr-1" /> Удалить
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 overflow-auto flex-grow">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="font-medium" style={{ color: currentTheme.textColor }}>
                Время накладывания
              </div>
              <div style={{ color: currentTheme.mutedTextColor }}>
                {spell.castingTime || '1 действие'}
              </div>
            </div>
            
            <div>
              <div className="font-medium" style={{ color: currentTheme.textColor }}>
                Дистанция
              </div>
              <div style={{ color: currentTheme.mutedTextColor }}>
                {spell.range || 'На себя'}
              </div>
            </div>
            
            <div>
              <div className="font-medium" style={{ color: currentTheme.textColor }}>
                Компоненты
              </div>
              <div style={{ color: currentTheme.mutedTextColor }}>
                {spell.components || 
                 componentsToString({
                   verbal: spell.verbal,
                   somatic: spell.somatic,
                   material: spell.material,
                   materials: spell.materials
                 })}
              </div>
            </div>
            
            <div>
              <div className="font-medium" style={{ color: currentTheme.textColor }}>
                Длительность
              </div>
              <div style={{ color: currentTheme.mutedTextColor }}>
                {spell.duration || 'Мгновенная'}
              </div>
            </div>
            
            {spell.classes && (
              <div className="col-span-2">
                <div className="font-medium" style={{ color: currentTheme.textColor }}>
                  Классы
                </div>
                <div style={{ color: currentTheme.mutedTextColor }}>
                  {formatClasses(spell.classes)}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <div className="font-medium mb-2" style={{ color: currentTheme.textColor }}>
              Описание
            </div>
            <div className="space-y-2 text-sm" style={{ color: currentTheme.mutedTextColor }}>
              {formatDescription(spell.description || '').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          {spell.higherLevels && (
            <div>
              <div className="font-medium mb-2" style={{ color: currentTheme.textColor }}>
                На более высоких уровнях
              </div>
              <div className="text-sm" style={{ color: currentTheme.mutedTextColor }}>
                {spell.higherLevels}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellDetailView;
