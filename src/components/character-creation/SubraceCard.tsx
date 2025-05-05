
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export interface SubraceProps {
  name: string;
  description: string;
  traits?: string[];
  abilityScoreIncrease?: Record<string, number>;
  selected: boolean;
  onClick: () => void;
}

const SubraceCard: React.FC<SubraceProps> = ({
  name,
  description,
  traits,
  abilityScoreIncrease,
  selected,
  onClick
}) => {
  // Get current theme
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;

  // Safe renderer helper function to prevent object rendering errors
  const renderSafely = (content: any): string => {
    if (typeof content === 'string') {
      return content;
    } else if (typeof content === 'number') {
      return content.toString();
    } else if (content === null || content === undefined) {
      return '';
    } else if (typeof content === 'object') {
      return JSON.stringify(content);
    }
    return String(content);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 ${
        selected ? 'ring-2' : 'hover:bg-accent/10'
      }`}
      style={{ 
        background: selected
          ? `${currentTheme.cardBackground}`
          : 'rgba(0, 0, 0, 0.6)',
        // Используем borderColor вместо border для избежания конфликтов
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: selected
          ? currentTheme.accent
          : 'rgba(255, 255, 255, 0.1)',
        boxShadow: selected
          ? `0 0 12px ${currentTheme.accent}80`
          : 'none',
        color: currentTheme.textColor
      }}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle style={{ color: currentTheme.accent }}>{renderSafely(name)}</CardTitle>
        <CardDescription style={{ color: `${currentTheme.textColor}90` }}>
          {renderSafely(description)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {traits && traits.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-semibold mb-2" style={{ color: currentTheme.accent }}>
              Особенности:
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm" style={{ color: `${currentTheme.textColor}80` }}>
              {traits.map((trait, idx) => (
                <li key={idx}>{renderSafely(trait)}</li>
              ))}
            </ul>
          </div>
        )}
        
        {abilityScoreIncrease && Object.keys(abilityScoreIncrease).length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold mb-2" style={{ color: currentTheme.accent }}>
              Увеличение характеристик:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(abilityScoreIncrease).map(([key, value]) => (
                <div 
                  key={key} 
                  className="flex justify-between items-center p-1 text-xs rounded"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.3)', 
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: `${currentTheme.accent}30`
                  }}
                >
                  <span>
                    {key === 'strength' && 'Сила'}
                    {key === 'dexterity' && 'Ловкость'}
                    {key === 'constitution' && 'Телосложение'}
                    {key === 'intelligence' && 'Интеллект'}
                    {key === 'wisdom' && 'Мудрость'}
                    {key === 'charisma' && 'Харизма'}
                    {key === 'all' && 'Все характеристики'}
                    {key === 'custom' && 'Выбор игрока'}
                  </span>
                  <span style={{ color: currentTheme.accent }}>
                    {typeof value === 'number' ? `+${value}` : renderSafely(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubraceCard;
