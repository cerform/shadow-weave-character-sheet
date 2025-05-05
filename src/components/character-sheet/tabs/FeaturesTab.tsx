
import React from 'react';
import { Character, Feature } from '@/types/character';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeaturesTabProps {
  character: Character | null;
}

const FeaturesTab: React.FC<FeaturesTabProps> = ({ character }) => {
  // Получаем все особенности персонажа
  const getAllFeatures = (): Feature[] => {
    const features: Feature[] = [];
    
    if (character?.features) features.push(...character.features);
    if (character?.racialFeatures) features.push(...character.racialFeatures);
    if (character?.backgroundFeatures) features.push(...character.backgroundFeatures);
    
    return features;
  };
  
  const features = getAllFeatures();
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Умения и особенности</h2>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        {features.length > 0 ? (
          <div className="space-y-4">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card">
                <CardContent className="p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-semibold">{feature.name}</h3>
                    {feature.source && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        {feature.source}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>У персонажа пока нет особенностей</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default FeaturesTab;
