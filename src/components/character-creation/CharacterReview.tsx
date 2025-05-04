
import React from 'react';
import { CharacterSheet, Equipment, Feature, CharacterSpell } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Sword, Book, Heart } from 'lucide-react';
import { getNumericModifier } from '@/utils/abilityScoreUtils';

interface CharacterReviewProps {
  character: CharacterSheet;
  onUpdate?: (updates: Partial<CharacterSheet>) => void;
}

export const CharacterReview: React.FC<CharacterReviewProps> = ({ character, onUpdate }) => {
  // Функция для форматирования названий
  const formatName = (text: string = ''): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };
  
  // Функция для получения строкового представления способностей и модификаторов
  const getAbilityDisplay = (abilityName: string): string => {
    const score = character.abilities?.[abilityName.toLowerCase() as keyof typeof character.abilities] || 10;
    const modifier = getNumericModifier(score);
    const sign = modifier >= 0 ? '+' : '';
    return `${score} (${sign}${modifier})`;
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader className="bg-secondary/10">
          <CardTitle className="text-center">Обзор персонажа</CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-lg mb-2">{character.name || "Безымянный герой"}</h3>
              
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Раса:</span> {formatName(character.race)}
                </p>
                <p>
                  <span className="font-semibold">Класс:</span> {formatName(character.class)}
                  {character.subclass && ` (${formatName(character.subclass)})`}
                </p>
                <p>
                  <span className="font-semibold">Предыстория:</span> {formatName(character.background)}
                </p>
                <p>
                  <span className="font-semibold">Мировоззрение:</span> {formatName(character.alignment)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Heart size={24} className="text-red-500" />
                </div>
                <h3 className="font-bold text-xl">
                  {character.hitPoints?.current || 0} / {character.hitPoints?.maximum || character.hitPoints?.current || 0}
                </h3>
                <p className="text-sm text-muted-foreground">Хиты</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatBlock name="СИЛ" value={getAbilityDisplay('strength')} />
            <StatBlock name="ЛОВ" value={getAbilityDisplay('dexterity')} />
            <StatBlock name="ТЕЛ" value={getAbilityDisplay('constitution')} />
            <StatBlock name="ИНТ" value={getAbilityDisplay('intelligence')} />
            <StatBlock name="МДР" value={getAbilityDisplay('wisdom')} />
            <StatBlock name="ХАР" value={getAbilityDisplay('charisma')} />
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={20} />
                <h3 className="font-semibold">Владения</h3>
              </div>
              
              <div className="space-y-2">
                {character.proficiencies && typeof character.proficiencies === 'object' && (
                  <div>
                    {Object.entries(character.proficiencies).map(([category, profs]) => (
                      <div key={category} className="mb-2">
                        <p className="text-sm font-medium mb-1">{formatName(category)}:</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(profs) && profs.map((prof, i) => (
                            <Badge key={i} variant="outline">{prof}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {character.languages && character.languages.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium mb-1">Языки:</p>
                    <div className="flex flex-wrap gap-1">
                      {character.languages.map((lang, i) => (
                        <Badge key={i} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
            
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Sword size={20} />
                <h3 className="font-semibold">Снаряжение</h3>
              </div>
              
              <div className="space-y-1">
                {character.equipment && Array.isArray(character.equipment) && character.equipment.map((item, i) => (
                  <div key={i} className="text-sm py-1 border-b border-gray-200 dark:border-gray-800">
                    {typeof item === 'string' 
                      ? item 
                      : `${item.name}${item.quantity > 1 ? ` (${item.quantity})` : ''}`
                    }
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          <Separator className="my-4" />
          
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Book size={20} />
              <h3 className="font-semibold">Умения и особенности</h3>
            </div>
            
            <div className="space-y-2">
              {character.features && Array.isArray(character.features) && character.features.map((feature, i) => {
                const featureName = typeof feature === 'string' ? feature : feature.name;
                const featureDescription = typeof feature !== 'string' ? feature.description : '';
                
                return (
                  <div key={i} className="mb-2">
                    <p className="font-medium">{featureName}</p>
                    {featureDescription && (
                      <p className="text-sm text-muted-foreground">{featureDescription}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
          
          {character.spells && character.spells.length > 0 && (
            <>
              <Separator className="my-4" />
              
              <section>
                <h3 className="font-semibold mb-3">Заклинания</h3>
                <div className="flex flex-wrap gap-1">
                  {character.spells.map((spell, i) => {
                    const spellName = typeof spell === 'string' ? spell : spell.name;
                    return (
                      <Badge key={i}>{spellName}</Badge>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface StatBlockProps {
  name: string;
  value: string;
}

const StatBlock: React.FC<StatBlockProps> = ({ name, value }) => (
  <div className="flex flex-col items-center justify-center p-2 bg-primary/5 rounded-md">
    <span className="text-xs font-semibold">{name}</span>
    <span className="text-lg font-bold">{value}</span>
  </div>
);

export default CharacterReview;
