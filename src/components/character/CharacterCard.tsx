
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Character } from '@/types/character';
import { BadgeCheck, User, Book, Star, Scroll, Flag, Dna } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
}

const CharacterCard = ({ character, onClick }: CharacterCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (character.id) {
      navigate(`/character/${character.id}`);
    }
  };

  // Безопасное получение названия класса
  const getClassName = (): string => {
    if (character.className && typeof character.className === 'string') 
      return character.className;
    if (character.class && typeof character.class === 'string') 
      return character.class;
    return '—';
  };

  // Безопасное получение имени персонажа
  const getCharacterName = (): string => {
    return character.name || 'Безымянный герой';
  };

  return (
    <Card 
      className="bg-gradient-to-br from-gray-800 to-black text-white hover:scale-[1.02] transition cursor-pointer border border-primary/20"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span className="text-primary flex items-center gap-1.5">
            <User size={16} />
            {getCharacterName()}
          </span>
          <span className="text-xs bg-primary/20 px-2 py-1 rounded-full flex items-center gap-1">
            <Star size={14} className="text-amber-400" />
            {character.level || 1}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Book size={16} className="text-blue-400" />
          <span>Класс: {getClassName()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Dna size={16} className="text-green-400" />
          <span>Раса: {character.race || '—'}{character.subrace ? ` (${character.subrace})` : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <Scroll size={16} className="text-amber-400" />
          <span>Предыстория: {character.background || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Flag size={16} className="text-red-400" />
          <span>Мировоззрение: {character.alignment || '—'}</span>
        </div>
        {character.subclass && (
          <div className="flex items-center gap-2">
            <BadgeCheck size={16} className="text-purple-400" />
            <span>Архетип: {character.subclass}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CharacterCard;
