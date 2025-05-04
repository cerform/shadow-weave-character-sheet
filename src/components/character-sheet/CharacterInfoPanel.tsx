
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface CharacterInfoPanelProps {
  character: any;
}

const CharacterInfoPanel: React.FC<CharacterInfoPanelProps> = ({ character }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.textColor }}>
          Информация о персонаже
        </h3>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Раса</p>
            <p className="font-medium">{character?.race || 'Не указано'}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Класс</p>
            <p className="font-medium">{character?.class || character?.className || 'Не указано'}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Предыстория</p>
            <p className="font-medium">{character?.background || 'Не указано'}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Мировоззрение</p>
            <p className="font-medium">{character?.alignment || 'Не указано'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterInfoPanel;
