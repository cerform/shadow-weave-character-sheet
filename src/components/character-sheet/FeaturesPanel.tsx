
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character, Feature } from '@/types/character';

interface FeaturesPanelProps {
  character: Character | null;
}

export const FeaturesPanel: React.FC<FeaturesPanelProps> = ({ character }) => {
  const renderFeature = (feature: Feature | string, index: number) => {
    if (typeof feature === 'string') {
      return (
        <div key={index} className="border-b pb-2 last:border-b-0">
          <h4 className="font-medium">{feature}</h4>
        </div>
      );
    }
    
    return (
      <div key={index} className="border-b pb-2 last:border-b-0">
        <h4 className="font-medium">{feature.name}</h4>
        {feature.description && (
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        )}
        {feature.source && (
          <p className="text-xs text-muted-foreground">Источник: {feature.source}</p>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Особенности</CardTitle>
      </CardHeader>
      <CardContent>
        {character && character.features && character.features.length > 0 ? (
          <div className="space-y-4">
            {character.features.map((feature, index) => renderFeature(feature, index))}
          </div>
        ) : (
          <p className="text-muted-foreground">Нет особенностей для отображения.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FeaturesPanel;
