import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Character } from '@/types/character';

interface FeaturesTabProps {
  character: Character;
}

const FeaturesTab: React.FC<FeaturesTabProps> = ({ character }) => {
  // Добавим проверку на массив перед использованием filter:
  
  // Вместо
  // character.proficiencies.filter(prof => prof.type === 'weapon')

  const weaponProficiencies = Array.isArray(character.proficiencies) 
    ? character.proficiencies.filter(prof => prof.type === 'weapon')
    : [];

  // Аналогично для других типов профессий
  const armorProficiencies = Array.isArray(character.proficiencies)
    ? character.proficiencies.filter(prof => prof.type === 'armor')
    : [];

  const toolProficiencies = Array.isArray(character.proficiencies)
    ? character.proficiencies.filter(prof => prof.type === 'tool')
    : [];

  return (
    <div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Особенности класса</CardTitle>
          <CardDescription>Особенности и умения, полученные от класса</CardDescription>
        </CardHeader>
        <CardContent>
          {character.classFeatures && character.classFeatures.length > 0 ? (
            <ul>
              {character.classFeatures.map((feature, index) => (
                <li key={index} className="mb-2">
                  <strong>{feature.name}</strong>: {feature.description}
                </li>
              ))}
            </ul>
          ) : (
            <p>Нет особенностей класса.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Языки</CardTitle>
          <CardDescription>Языки, которыми владеет персонаж</CardDescription>
        </CardHeader>
        <CardContent>
          {character.languages && character.languages.length > 0 ? (
            <ul>
              {character.languages.map((language, index) => (
                <li key={index}>{language}</li>
              ))}
            </ul>
          ) : (
            <p>Нет известных языков.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Владение оружием</CardTitle>
          <CardDescription>Оружие, которым владеет персонаж</CardDescription>
        </CardHeader>
        <CardContent>
          {weaponProficiencies.length > 0 ? (
            <ul>
              {weaponProficiencies.map((proficiency, index) => (
                <li key={index}>{proficiency.name}</li>
              ))}
            </ul>
          ) : (
            <p>Нет владений оружием.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Владение доспехами</CardTitle>
          <CardDescription>Доспехи, которыми владеет персонаж</CardDescription>
        </CardHeader>
        <CardContent>
          {armorProficiencies.length > 0 ? (
            <ul>
              {armorProficiencies.map((proficiency, index) => (
                <li key={index}>{proficiency.name}</li>
              ))}
            </ul>
          ) : (
            <p>Нет владений доспехами.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Владение инструментами</CardTitle>
          <CardDescription>Инструменты, которыми владеет персонаж</CardDescription>
        </CardHeader>
        <CardContent>
          {toolProficiencies.length > 0 ? (
            <ul>
              {toolProficiencies.map((proficiency, index) => (
                <li key={index}>{proficiency.name}</li>
              ))}
            </ul>
          ) : (
            <p>Нет владений инструментами.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturesTab;
