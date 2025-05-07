import React from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FeaturesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Update the Feature interface if it doesn't exist
export interface Feature {
  name: string;
  description: string;
  level?: number;
  source?: string;
}

// Fix the mixed string and Feature[] issue by properly typing and handling both cases
const processFeatures = (features: string[] | Feature[] | (string | Feature)[]): (string | Feature)[] => {
  if (!features) return [];
  return features as (string | Feature)[];
};

const FeaturesTab: React.FC<FeaturesTabProps> = ({ character }) => {
  const features = processFeatures(character.features || []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Особенности</CardTitle>
          <Book className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="pl-2 pr-2">
        <ScrollArea className="h-[400px]">
          <div className="grid gap-4">
            {features.length > 0 ? (
              features.map((feature, index) => (
                <div key={index} className="border rounded-md p-4">
                  {typeof feature === 'string' ? (
                    <>
                      <h3 className="font-semibold">{feature}</h3>
                      <p className="text-sm text-muted-foreground">Описание отсутствует</p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold">{feature.name}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                      {feature.source && (
                        <Badge variant="secondary" className="mt-2">
                          Источник: {feature.source}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                У персонажа нет особенностей
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FeaturesTab;
