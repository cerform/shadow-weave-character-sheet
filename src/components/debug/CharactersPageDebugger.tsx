import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { normalizeCharacter } from '@/utils/characterNormalizer';

const CharactersPageDebugger: React.FC = () => {
  const { characters, setCharacter, createCharacter, updateCharacter, deleteCharacter } = useCharacter();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Characters Debugger</h1>
      
      <div className="mb-4">
        <Button onClick={() => createCharacter(normalizeCharacter({ name: `New Character ${Date.now()}` }))}>
          Create New Character
        </Button>
      </div>
      
      <ScrollArea className="h-[400px] w-full">
        <div className="grid gap-4">
          {characters && characters.map((char) => (
            <Card key={char.id}>
              <CardHeader>
                <CardTitle>{char.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre>{JSON.stringify(char, null, 2)}</pre>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button onClick={() => updateCharacter({ ...char, name: `${char.name} Updated` })}>
                  Update
                </Button>
                <Button variant="destructive" onClick={() => deleteCharacter(char.id || '')}>
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CharactersPageDebugger;
