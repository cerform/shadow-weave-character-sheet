
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from 'lucide-react';

const CharactersList = () => {
  const { characters } = useCharacter();
  const [localCharacters, setLocalCharacters] = useState<Character[]>([]);
  
  // Initialize with characters from context
  useEffect(() => {
    if (characters && Array.isArray(characters)) {
      setLocalCharacters(characters);
    }
  }, [characters]);

  // Функция для обновления списка персонажей
  const refreshCharacters = async () => {
    // This should be implemented in your CharacterContext
    console.log("Character refresh requested");
    // If characters is available, update local state
    if (characters && Array.isArray(characters)) {
      setLocalCharacters(characters);
    }
  };
  
  // Функция для удаления персонажа
  const deleteCharacter = async (id: string) => {
    // This should be implemented in your CharacterContext
    console.log(`Delete character requested for id: ${id}`);
    // Filter out the deleted character locally
    setLocalCharacters(localCharacters.filter(char => char.id !== id));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить этого персонажа?')) {
      deleteCharacter(id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {localCharacters && localCharacters.length > 0 ? (
        localCharacters.map(char => (
          <Link to={`/character/${char.id}`} key={char.id} className="no-underline">
            <Card className="h-full hover:bg-secondary/10 transition-colors">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold">{char.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {char.race} {char.class}, уровень {char.level}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-xs text-muted-foreground">
                  Обновлено: {new Date(char.updatedAt || Date.now()).toLocaleDateString()}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive" 
                  onClick={(e) => handleDelete(char.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center p-12">
          <p className="text-muted-foreground mb-4">У вас пока нет персонажей</p>
          <Link to="/character/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Создать персонажа
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CharactersList;
