
import React from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatsTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const FeatsTab: React.FC<FeatsTabProps> = ({ character, onUpdate }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Умения и черты</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {character.feats && character.feats.length > 0 ? (
          character.feats.map((feat, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle>{feat.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{feat.description}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">У персонажа пока нет умений</p>
        )}
      </div>
      
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Классовые особенности</h3>
        <div className="grid grid-cols-1 gap-4">
          {character.classFeatures && character.classFeatures.length > 0 ? (
            character.classFeatures.map((feature, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle>{feature.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground">Нет доступных классовых особенностей</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatsTab;
