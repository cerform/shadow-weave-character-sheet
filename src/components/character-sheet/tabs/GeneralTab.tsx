
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Character } from '@/types/character';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GeneralTabProps {
  character: Character | null;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ character }) => {
  // Safety check
  if (!character) {
    return <div>Нет данных персонажа</div>;
  }
  
  // Helper function to calculate ability modifier
  const calculateModifier = (abilityScore: number): string => {
    const modifier = Math.floor((abilityScore - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  // Function to render a stat block
  const renderAbilityScore = (name: string, score: number, abbreviation: string) => (
    <div className="flex flex-col items-center p-3 bg-card/50 rounded-lg border border-border">
      <div className="text-sm text-muted-foreground">{name}</div>
      <div className="text-2xl font-bold my-1">{score}</div>
      <Badge variant="outline">{calculateModifier(score)}</Badge>
      <div className="text-xs text-muted-foreground mt-1">{abbreviation}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Общая информация</h2>
      
      {/* Character basics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Класс</h3>
            <p className="text-lg">{character.class || character.className}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Раса</h3>
            <p className="text-lg">{character.race}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Уровень</h3>
            <p className="text-lg">{character.level}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Мировоззрение</h3>
            <p className="text-lg">{character.alignment || "Не указано"}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Ability Scores */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Характеристики</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {renderAbilityScore("Сила", character.abilities?.strength || character.STR || 10, "СИЛ")}
          {renderAbilityScore("Ловкость", character.abilities?.dexterity || character.DEX || 10, "ЛОВ")}
          {renderAbilityScore("Телосложение", character.abilities?.constitution || character.CON || 10, "ТЕЛ")}
          {renderAbilityScore("Интеллект", character.abilities?.intelligence || character.INT || 10, "ИНТ")}
          {renderAbilityScore("Мудрость", character.abilities?.wisdom || character.WIS || 10, "МДР")}
          {renderAbilityScore("Харизма", character.abilities?.charisma || character.CHA || 10, "ХАР")}
        </div>
      </div>
      
      {/* Proficiencies */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Владения</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Навыки</h4>
              <ScrollArea className="h-40">
                <div className="space-y-1">
                  {character.proficiencies?.skills?.map((skill, index) => (
                    <Badge key={index} className="mr-2 mb-2">{skill}</Badge>
                  ))}
                  {(!character.proficiencies?.skills || character.proficiencies.skills.length === 0) && (
                    <p className="text-sm text-muted-foreground">Нет навыков</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Языки</h4>
              <ScrollArea className="h-40">
                <div className="space-y-1">
                  {character.proficiencies?.languages?.map((language, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">{language}</Badge>
                  ))}
                  {(!character.proficiencies?.languages || character.proficiencies.languages.length === 0) && (
                    <p className="text-sm text-muted-foreground">Нет языков</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Background */}
      {character.background && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Предыстория</h3>
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium">{character.background}</h4>
              <p className="mt-2 text-sm">{character.backstory || "Нет предыстории"}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GeneralTab;
