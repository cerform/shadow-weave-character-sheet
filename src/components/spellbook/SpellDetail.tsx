
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SpellData } from '@/hooks/spellbook/types';
import { useSpellTheme } from '@/hooks/spellbook/themeUtils';
import { safeJoin } from '@/hooks/spellbook/filterUtils';

interface SpellDetailProps {
  spell: SpellData;
  isDrawer?: boolean;
}

const SpellDetail: React.FC<SpellDetailProps> = ({ spell, isDrawer = false }) => {
  const { getBadgeColor, getSchoolBadgeColor, currentTheme } = useSpellTheme();
  
  // Функция для форматирования описания заклинания
  const formatDescription = (description: string | string[]): JSX.Element[] => {
    if (Array.isArray(description)) {
      return description.map((paragraph, idx) => (
        <p key={idx} className="mb-2">{paragraph}</p>
      ));
    } else {
      return description.split('\n').map((paragraph, idx) => (
        <p key={idx} className="mb-2">{paragraph}</p>
      ));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold mb-1" style={{ color: currentTheme.textColor }}>
            {spell.name}
          </h2>
          <Badge
            style={{ 
              backgroundColor: getBadgeColor(spell.level),
              color: "white"
            }}
          >
            {spell.level === 0 ? "Заговор" : `${spell.level} круг`}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          <Badge
            variant="outline"
            style={{ 
              backgroundColor: `${getSchoolBadgeColor(spell.school)}30`,
              color: currentTheme.textColor,
              borderColor: getSchoolBadgeColor(spell.school)
            }}
          >
            {spell.school}
          </Badge>
          {spell.ritual && (
            <Badge
              variant="outline"
              style={{ 
                backgroundColor: `${currentTheme.accent}20`,
                color: currentTheme.textColor,
                borderColor: currentTheme.accent
              }}
            >
              Ритуал
            </Badge>
          )}
          {spell.concentration && (
            <Badge
              variant="outline"
              style={{ 
                backgroundColor: `${currentTheme.accent}20`,
                color: currentTheme.textColor,
                borderColor: currentTheme.accent
              }}
            >
              Концентрация
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
        <div>
          <h3 className="text-xs font-medium" style={{ color: currentTheme.mutedTextColor }}>
            Время накладывания
          </h3>
          <p style={{ color: currentTheme.textColor }}>{spell.castingTime}</p>
        </div>
        <div>
          <h3 className="text-xs font-medium" style={{ color: currentTheme.mutedTextColor }}>
            Дистанция
          </h3>
          <p style={{ color: currentTheme.textColor }}>{spell.range}</p>
        </div>
        <div>
          <h3 className="text-xs font-medium" style={{ color: currentTheme.mutedTextColor }}>
            Компоненты
          </h3>
          <p style={{ color: currentTheme.textColor }}>{spell.components}</p>
        </div>
        <div>
          <h3 className="text-xs font-medium" style={{ color: currentTheme.mutedTextColor }}>
            Длительность
          </h3>
          <p style={{ color: currentTheme.textColor }}>{spell.duration}</p>
        </div>
        <div className={`${isDrawer ? "" : "md:col-span-2"}`}>
          <h3 className="text-xs font-medium" style={{ color: currentTheme.mutedTextColor }}>
            Классы
          </h3>
          <p style={{ color: currentTheme.textColor }}>{safeJoin(spell.classes)}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2" style={{ color: currentTheme.textColor }}>
          Описание
        </h3>
        <div className="prose prose-sm max-w-none dark:prose-invert" style={{ color: currentTheme.textColor }}>
          {formatDescription(spell.description)}
        </div>
      </div>
      
      {(spell.higherLevel || spell.higherLevels) && (
        <div>
          <h3 className="text-sm font-medium mb-2" style={{ color: currentTheme.textColor }}>
            На более высоких уровнях
          </h3>
          <div className="prose prose-sm max-w-none dark:prose-invert" style={{ color: currentTheme.textColor }}>
            {spell.higherLevel && (<p>{spell.higherLevel}</p>)}
            {spell.higherLevels && (<p>{spell.higherLevels}</p>)}
          </div>
        </div>
      )}
      
      {spell.source && (
        <div className="text-xs" style={{ color: currentTheme.mutedTextColor }}>
          <strong>Источник:</strong> {spell.source}
        </div>
      )}
    </div>
  );
};

export default SpellDetail;
