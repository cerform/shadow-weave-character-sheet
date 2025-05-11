
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character } from '@/types/character';

interface FeaturesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({ character, onUpdate }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Особенности и черты</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Раздел особенностей находится в разработке</p>
        </CardContent>
      </Card>
    </div>
  );
};
