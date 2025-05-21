
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Star } from 'lucide-react';
import { SpellData } from '@/types/spells';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { getSpellSchoolColor } from '@/utils/spellProcessors';
import { formatDuration, formatRange, componentsToString } from '@/utils/spellProcessors';

interface SpellDetailViewProps {
  spell: SpellData | null;
  onPrepareSpell?: (spell: SpellData) => void;
  onAddSpell?: (spell: SpellData) => void;
  onRemoveSpell?: (spell: SpellData) => void;
  isOwned?: boolean;
  isPrepared?: boolean;
}

const SpellDetailView: React.FC<SpellDetailViewProps> = ({
  spell,
  onPrepareSpell,
  onAddSpell,
  onRemoveSpell,
  isOwned = false,
  isPrepared = false
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  if (!spell) {
    return (
      <Card className="h-full flex items-center justify-center" style={{ backgroundColor: currentTheme.background }}>
        <CardContent className="text-center p-8">
          <h3 className="font-medium text-xl mb-2" style={{ color: currentTheme.textColor }}>
            Выберите заклинание
          </h3>
          <p className="text-sm" style={{ color: currentTheme.mutedTextColor }}>
            Выберите заклинание из списка слева для просмотра подробной информации
          </p>
        </CardContent>
      </Card>
    );
  }

  // Extract components from the string format (В, С, М)
  const parseComponents = (componentsStr: string) => {
    const verbal = componentsStr.includes('В');
    const somatic = componentsStr.includes('С');
    const material = componentsStr.includes('М');
    
    // Extract material components if available
    let materials = '';
    if (material && componentsStr.includes('(')) {
      const match = componentsStr.match(/М\s*\((.*?)\)/);
      materials = match ? match[1] : '';
    }
    
    return { verbal, somatic, material, materials };
  };

  const components = typeof spell.components === 'string' 
    ? parseComponents(spell.components) 
    : spell.components || { verbal: false, somatic: false, material: false, materials: '' };

  // Format description
  const formattedDescription = Array.isArray(spell.description) 
    ? spell.description.join('\n\n') 
    : spell.description || '';

  const handlePrepareToggle = () => {
    if (onPrepareSpell && spell) {
      onPrepareSpell(spell);
    }
  };

  const handleAddSpell = () => {
    if (onAddSpell && spell) {
      onAddSpell(spell);
    }
  };

  const handleRemoveSpell = () => {
    if (onRemoveSpell && spell) {
      onRemoveSpell(spell);
    }
  };

  return (
    <Card className="h-full" style={{ backgroundColor: currentTheme.background }}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: currentTheme.textColor }}>
              {spell.name}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <Badge 
                style={{
                  backgroundColor: getSpellSchoolColor(spell.school),
                  color: '#ffffff'
                }}
              >
                {spell.school || 'Универсальная'}
              </Badge>
              <Badge 
                style={{
                  backgroundColor: getSpellSchoolColor(spell.school),
                  color: '#ffffff'
                }}
              >
                {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
              </Badge>
              {spell.ritual && (
                <Badge 
                  variant="outline" 
                  style={{
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.textColor
                  }}
                >
                  Ритуал
                </Badge>
              )}
              {spell.concentration && (
                <Badge 
                  variant="outline" 
                  style={{
                    borderColor: currentTheme.borderColor,
                    color: currentTheme.textColor
                  }}
                >
                  Концентрация
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isOwned ? (
              <>
                {spell.level > 0 && onPrepareSpell && (
                  <Button 
                    size="sm" 
                    variant={isPrepared ? "default" : "outline"}
                    onClick={handlePrepareToggle}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    {isPrepared ? 'Подготовлено' : 'Подготовить'}
                  </Button>
                )}
                {onRemoveSpell && (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={handleRemoveSpell}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Удалить
                  </Button>
                )}
              </>
            ) : (
              onAddSpell && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleAddSpell}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              )
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium" style={{ color: currentTheme.mutedTextColor }}>Время накладывания:</span>
              <span className="ml-2" style={{ color: currentTheme.textColor }}>{spell.castingTime || '1 действие'}</span>
            </div>
            <div>
              <span className="text-sm font-medium" style={{ color: currentTheme.mutedTextColor }}>Дистанция:</span>
              <span className="ml-2" style={{ color: currentTheme.textColor }}>{formatRange(spell.range)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium" style={{ color: currentTheme.mutedTextColor }}>Компоненты:</span>
              <span className="ml-2" style={{ color: currentTheme.textColor }}>
                {typeof spell.components === 'string' 
                  ? spell.components
                  : componentsToString(components)
                }
              </span>
            </div>
            <div>
              <span className="text-sm font-medium" style={{ color: currentTheme.mutedTextColor }}>Длительность:</span>
              <span className="ml-2" style={{ color: currentTheme.textColor }}>{formatDuration(spell.duration)}</span>
            </div>
          </div>
        </div>
        
        {components.materials && (
          <div className="mb-6">
            <span className="text-sm font-medium" style={{ color: currentTheme.mutedTextColor }}>Материальные компоненты:</span>
            <p style={{ color: currentTheme.textColor }}>{components.materials}</p>
          </div>
        )}
        
        <div className="mb-6">
          <span className="text-sm font-medium" style={{ color: currentTheme.mutedTextColor }}>Классы:</span>
          <span className="ml-2" style={{ color: currentTheme.textColor }}>
            {Array.isArray(spell.classes) ? spell.classes.join(', ') : spell.classes}
          </span>
        </div>
        
        <div className="border-t pt-4" style={{ borderColor: currentTheme.borderColor }}>
          <h3 className="text-lg font-medium mb-2" style={{ color: currentTheme.textColor }}>Описание</h3>
          <div className="whitespace-pre-wrap" style={{ color: currentTheme.textColor }}>
            {formattedDescription}
          </div>
        </div>
        
        {spell.higherLevels && (
          <div className="border-t mt-4 pt-4" style={{ borderColor: currentTheme.borderColor }}>
            <h3 className="text-lg font-medium mb-2" style={{ color: currentTheme.textColor }}>На более высоких уровнях</h3>
            <div style={{ color: currentTheme.textColor }}>
              {spell.higherLevels}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpellDetailView;
