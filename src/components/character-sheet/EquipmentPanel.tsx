
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character, Equipment } from '@/types/character';

interface EquipmentPanelProps {
  character: Character | null;
}

export const EquipmentPanel: React.FC<EquipmentPanelProps> = ({ character }) => {
  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Снаряжение</CardTitle>
      </CardHeader>
      <CardContent>
        {character && character.equipment && character.equipment.length > 0 ? (
          <div className="space-y-2">
            <ul className="list-disc pl-5">
              {character.equipment.map((item, index) => (
                <li key={index}>
                  {typeof item === 'string' 
                    ? item 
                    : `${item.name} (${item.quantity})`}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-muted-foreground">Нет снаряжения для отображения.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentPanel;
