
import React from 'react';
import { SpellData } from '@/types/spells';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Target, Box, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

interface SpellDescriptionProps {
  spell: SpellData;
  isPrepared?: boolean;
  isKnown?: boolean;
}

const SpellDescription: React.FC<SpellDescriptionProps> = ({
  spell,
  isPrepared = false,
  isKnown = false
}) => {
  // Helper function to format the spell level
  const getSpellLevelText = (level: number): string => {
    if (level === 0) return 'Заговор';
    if (level === 1) return '1-й уровень';
    if (level === 2) return '2-й уровень';
    if (level === 3) return '3-й уровень';
    if (level === 4) return '4-й уровень';
    if (level === 5) return '5-й уровень';
    if (level === 6) return '6-й уровень';
    if (level === 7) return '7-й уровень';
    if (level === 8) return '8-й уровень';
    if (level === 9) return '9-й уровень';
    return `${level}-й уровень`;
  };

  // Helper function for badge color based on spell school
  const getSchoolColor = (school: string): string => {
    const schoolLower = school.toLowerCase();
    
    switch (schoolLower) {
      case 'воплощение':
      case 'evocation':
        return '#f44336'; // Red
      case 'вызов':
      case 'conjuration':
        return '#9c27b0'; // Purple
      case 'иллюзия':
      case 'illusion':
        return '#9e9e9e'; // Gray
      case 'некромантия':
      case 'necromancy':
        return '#000000'; // Black
      case 'ограждение':
      case 'abjuration':
        return '#2196f3'; // Blue
      case 'очарование':
      case 'enchantment':
        return '#ff9800'; // Orange
      case 'преобразование':
      case 'transmutation':
        return '#4caf50'; // Green
      case 'прорицание':
      case 'divination':
        return '#ffeb3b'; // Yellow
      default:
        return '#607d8b'; // Blue Gray
    }
  };

  // Render components based on spell data
  return (
    <div className="space-y-4">
      {/* Spell header with level, school and status */}
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Badge variant="outline">
            {getSpellLevelText(spell.level)}
          </Badge>
          <Badge style={{backgroundColor: getSchoolColor(spell.school), color: 'white'}}>
            {spell.school}
          </Badge>
          {spell.ritual && (
            <Badge variant="secondary">Ритуал</Badge>
          )}
          {spell.concentration && (
            <Badge variant="secondary">Концентрация</Badge>
          )}
        </div>
        
        {/* Show if spell is prepared or known */}
        {isPrepared ? (
          <div className="flex items-center text-xs text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" /> Подготовлено
          </div>
        ) : isKnown ? (
          <div className="flex items-center text-xs text-yellow-600">
            <BookOpen className="w-4 h-4 mr-1" /> Известно
          </div>
        ) : null}
      </div>
      
      <Separator />
      
      {/* Spell mechanics */}
      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-muted-foreground">Время накладывания:</span>
        </div>
        <div>{spell.castingTime}</div>
        
        <div className="flex items-center">
          <Target className="w-4 h-4 mr-2" />
          <span className="text-muted-foreground">Дистанция:</span>
        </div>
        <div>{spell.range}</div>
        
        <div className="flex items-center">
          <Box className="w-4 h-4 mr-2" />
          <span className="text-muted-foreground">Компоненты:</span>
        </div>
        <div>{spell.components}</div>
        
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-muted-foreground">Длительность:</span>
        </div>
        <div>
          {spell.concentration ? 'Концентрация, до ' : ''}{spell.duration}
        </div>
      </div>
      
      {/* Classes that can use this spell */}
      {spell.classes && (
        <div className="text-sm">
          <span className="text-muted-foreground">Доступно классам: </span>
          {Array.isArray(spell.classes) ? spell.classes.join(', ') : spell.classes}
        </div>
      )}
      
      <Separator />
      
      {/* Spell description */}
      <div className="space-y-2">
        {Array.isArray(spell.description) ? (
          spell.description.map((paragraph, index) => (
            <p key={index} className="text-sm">{paragraph}</p>
          ))
        ) : (
          <p className="text-sm">{spell.description}</p>
        )}
      </div>
      
      {/* Higher level effects */}
      {(spell.higherLevel || spell.higherLevels) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium mb-1">На больших уровнях:</h4>
          <p className="text-sm">{spell.higherLevel || spell.higherLevels}</p>
        </div>
      )}
      
      {/* Source information */}
      {spell.source && (
        <div className="text-xs text-muted-foreground mt-4">
          Источник: {spell.source}
        </div>
      )}
    </div>
  );
};

export default SpellDescription;
