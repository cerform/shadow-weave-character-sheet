
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character } from '@/types/character';

interface EquipmentTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const EquipmentTab: React.FC<EquipmentTabProps> = ({ character, onUpdate }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Снаряжение</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Раздел снаряжения находится в разработке</p>
        </CardContent>
      </Card>
    </div>
  );
};
