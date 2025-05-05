
import React from 'react';
import { Character } from '@/contexts/CharacterContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeaturesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({ character, onUpdate }) => {
  // Получаем все особенности персонажа или пустой массив, если их нет
  const features = Array.isArray(character.features) ? character.features : [];
  // Получаем все расовые особенности
  const racialTraits = Array.isArray(character.traits) ? character.traits : [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Особенности персонажа</h2>
      
      {/* Классовые особенности */}
      <Card>
        <CardHeader>
          <CardTitle>Классовые особенности</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {features.length > 0 ? (
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium">{feature}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Нет классовых особенностей
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Расовые особенности */}
      <Card>
        <CardHeader>
          <CardTitle>Расовые особенности</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {racialTraits.length > 0 ? (
              <div className="space-y-3">
                {racialTraits.map((trait, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium">{trait}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Нет расовых особенностей
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
