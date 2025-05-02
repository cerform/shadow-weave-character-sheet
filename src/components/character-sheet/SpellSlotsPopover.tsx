
import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Magic, Sparkles } from 'lucide-react';

interface SpellSlotsProps {
  spellSlots: Record<number, { max: number; used: number }>;
  onUseSlot: (level: number) => void;
  onRestoreSlot: (level: number) => void;
}

export const SpellSlotsPopover: React.FC<SpellSlotsProps> = ({ 
  spellSlots, 
  onUseSlot,
  onRestoreSlot
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const orderedLevels = Object.keys(spellSlots)
    .map(Number)
    .sort((a, b) => a - b)
    .filter(level => spellSlots[level] && spellSlots[level].max > 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline"
          className="relative group"
          style={{
            backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)'}`,
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        >
          <Magic className="w-5 h-5 mr-2" />
          Слоты заклинаний
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {orderedLevels.length}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0"
        style={{
          backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'}`,
          borderColor: currentTheme.accent,
          boxShadow: `0 0 10px ${currentTheme.glow}`
        }}
      >
        <div className="p-4 border-b border-border"
             style={{ borderColor: `${currentTheme.accent}50` }}>
          <h4 className="text-lg font-semibold" style={{ color: currentTheme.textColor }}>
            Слоты заклинаний
          </h4>
          <p className="text-sm" style={{ color: currentTheme.mutedTextColor }}>
            Используйте слоты для сотворения заклинаний
          </p>
        </div>
        
        <ScrollArea className="h-72">
          <div className="p-4 space-y-4">
            {orderedLevels.map(level => {
              const { max, used } = spellSlots[level];
              const remaining = max - used;
              const percentage = (remaining / max) * 100;
              
              return (
                <div key={level} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: currentTheme.textColor }}>
                      Уровень {level}
                    </span>
                    <span className="text-sm" style={{ color: currentTheme.textColor }}>
                      {remaining}/{max}
                    </span>
                  </div>
                  
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden"
                       style={{ backgroundColor: `${currentTheme.accent}30` }}>
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: currentTheme.accent
                      }}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    {[...Array(max)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all`}
                        style={{
                          backgroundColor: i < used ? `${currentTheme.accent}40` : currentTheme.accent,
                          color: currentTheme.buttonText
                        }}
                        onClick={() => i >= used ? onUseSlot(level) : onRestoreSlot(level)}
                      >
                        {i < used ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onUseSlot(level)}
                      disabled={used >= max}
                      style={{
                        borderColor: currentTheme.accent,
                        color: used >= max ? `${currentTheme.mutedTextColor}80` : currentTheme.textColor
                      }}
                    >
                      Использовать
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onRestoreSlot(level)}
                      disabled={used <= 0}
                      style={{
                        borderColor: currentTheme.accent,
                        color: used <= 0 ? `${currentTheme.mutedTextColor}80` : currentTheme.textColor
                      }}
                    >
                      Восстановить
                    </Button>
                  </div>
                </div>
              );
            })}

            {orderedLevels.length === 0 && (
              <div className="py-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p style={{ color: currentTheme.mutedTextColor }}>
                  Нет доступных слотов заклинаний
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
