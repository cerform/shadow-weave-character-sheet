import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character } from '@/types/character';

interface InfoPanelProps {
  character: Character | null;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ character }) => {
  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Информация</CardTitle>
      </CardHeader>
      <CardContent>
        {character ? (
          <div className="space-y-2">
            <p><span className="font-medium">Имя:</span> {character.name}</p>
            <p><span className="font-medium">Раса:</span> {character.race} {character.subrace ? `(${character.subrace})` : ''}</p>
            <p><span className="font-medium">Класс:</span> {character.class} {character.subclass ? `(${character.subclass})` : ''}</p>
            <p><span className="font-medium">Предыстория:</span> {character.background}</p>
            <p><span className="font-medium">Мировоззрение:</span> {character.alignment}</p>
            <p><span className="font-medium">Пол:</span> {character.gender}</p>
          </div>
        ) : (
          <p className="text-muted-foreground">Не удалось загрузить информацию о персонаже.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default InfoPanel;
