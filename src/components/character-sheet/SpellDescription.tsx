
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SpellDescriptionProps {
  spell: SpellData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SpellDescription: React.FC<SpellDescriptionProps> = ({ spell, open, onOpenChange }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Функция для преобразования названий школ магии
  const getSchoolTranslation = (school: string): string => {
    const schools: Record<string, string> = {
      'Abjuration': 'Ограждение',
      'Conjuration': 'Вызов',
      'Divination': 'Прорицание',
      'Enchantment': 'Очарование',
      'Evocation': 'Воплощение',
      'Illusion': 'Иллюзия',
      'Necromancy': 'Некромантия',
      'Transmutation': 'Преобразование',
      'Universal': 'Универсальная'
    };
    
    return schools[school] || school;
  };
  
  // Функция для красивого отображения уровня заклинания
  const formatSpellLevel = (level: number): string => {
    if (level === 0) return 'Заговор';
    return `${level}-й уровень`;
  };
  
  // Функция для отображения компонентов заклинания
  const formatComponents = (components: string): string => {
    const componentMap: Record<string, string> = {
      'В': 'Вербальный',
      'С': 'Соматический',
      'М': 'Материальный'
    };
    
    return components.split('').map(c => componentMap[c] || c).join(', ');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-xl"
        style={{
          backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'}`,
          borderColor: currentTheme.accent,
          color: currentTheme.textColor
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ color: currentTheme.textColor }}>
            {spell.name}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" style={{ borderColor: currentTheme.accent, color: currentTheme.textColor }}>
              {formatSpellLevel(spell.level)}
            </Badge>
            <Badge variant="outline" style={{ borderColor: currentTheme.accent, color: currentTheme.textColor }}>
              {getSchoolTranslation(spell.school)}
            </Badge>
            {spell.ritual && (
              <Badge variant="outline" style={{ borderColor: currentTheme.accent, color: currentTheme.textColor }}>
                Ритуал
              </Badge>
            )}
            {spell.concentration && (
              <Badge variant="outline" style={{ borderColor: currentTheme.accent, color: currentTheme.textColor }}>
                Концентрация
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>Время накладывания</p>
            <p style={{ color: currentTheme.textColor }}>{spell.castingTime}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>Дистанция</p>
            <p style={{ color: currentTheme.textColor }}>{spell.range}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>Компоненты</p>
            <p style={{ color: currentTheme.textColor }}>{formatComponents(spell.components)}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: currentTheme.mutedTextColor }}>Длительность</p>
            <p style={{ color: currentTheme.textColor }}>{spell.duration}</p>
          </div>
        </div>
        
        <div className="pt-4 border-t" style={{ borderColor: `${currentTheme.accent}60` }}>
          <h3 className="font-medium mb-2" style={{ color: currentTheme.textColor }}>Описание</h3>
          <p className="text-sm whitespace-pre-line" style={{ color: currentTheme.textColor }}>{spell.description}</p>
        </div>
        
        {(spell.higherLevel) && (
          <div className="pt-4 border-t mt-4" style={{ borderColor: `${currentTheme.accent}60` }}>
            <h3 className="font-medium mb-2" style={{ color: currentTheme.textColor }}>На более высоких уровнях</h3>
            <p className="text-sm" style={{ color: currentTheme.textColor }}>{spell.higherLevel}</p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t" style={{ borderColor: `${currentTheme.accent}60` }}>
          <p className="text-sm" style={{ color: currentTheme.mutedTextColor }}>
            Классы: {Array.isArray(spell.classes) ? spell.classes.join(', ') : spell.classes || 'Не указано'}
          </p>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="default"
            onClick={() => onOpenChange(false)}
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.buttonText
            }}
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpellDescription;
