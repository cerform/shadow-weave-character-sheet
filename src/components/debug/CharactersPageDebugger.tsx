import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCharacter } from '@/contexts/CharacterContext';
import { getCharacterById, getAllCharacters, saveCharacterToFirestore, deleteCharacterById } from '@/services/characterService';
import { getCurrentUid } from '@/utils/authHelpers';
import { createDefaultCharacter } from '@/utils/characterUtils';

interface CharactersPageDebuggerProps {
  onCharacterLoad?: (character: Character) => void;
  onCharacterCreate?: (character: Character) => void;
}

const CharactersPageDebugger: React.FC<CharactersPageDebuggerProps> = ({ 
  onCharacterLoad,
  onCharacterCreate
}) => {
  const [characterId, setCharacterId] = useState<string>('');
  const [characterJson, setCharacterJson] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { character, updateCharacter } = useCharacter();
  
  // Загрузка персонажа по ID
  const handleLoadCharacter = async () => {
    if (!characterId) {
      setErrorMessage('Введите ID персонажа');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const loadedCharacter = await getCharacterById(characterId);
      if (loadedCharacter) {
        setCharacterJson(JSON.stringify(loadedCharacter, null, 2));
        toast({
          title: 'Персонаж загружен',
          description: `Загружен персонаж: ${loadedCharacter.name}`
        });
        
        if (onCharacterLoad) {
          onCharacterLoad(loadedCharacter);
        }
      } else {
        setErrorMessage('Персонаж не найден');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Загрузка всех персонажей пользователя
  const handleLoadAllCharacters = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const userCharacters = await getAllCharacters();
      setCharacters(userCharacters);
      toast({
        title: 'Персонажи загружены',
        description: `Загружено ${userCharacters.length} персонажей`
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Создание нового персонажа
  const handleCreateCharacter = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const newCharacter = createDefaultCharacter();
      newCharacter.userId = getCurrentUid();
      
      await saveCharacterToFirestore(newCharacter);
      
      toast({
        title: 'Персонаж создан',
        description: `Создан новый персонаж с ID: ${newCharacter.id}`
      });
      
      setCharacterId(newCharacter.id);
      setCharacterJson(JSON.stringify(newCharacter, null, 2));
      
      if (onCharacterCreate) {
        onCharacterCreate(newCharacter);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Сохранение изменений в персонаже
  const handleSaveCharacter = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      let characterToSave: Character;
      
      try {
        characterToSave = JSON.parse(characterJson);
      } catch (e) {
        setErrorMessage('Ошибка парсинга JSON');
        setIsLoading(false);
        return;
      }
      
      await saveCharacterToFirestore(characterToSave);
      
      toast({
        title: 'Персонаж сохранен',
        description: `Персонаж ${characterToSave.name} успешно сохранен`
      });
      
      // Обновляем текущего персонажа, если он загружен
      if (character && character.id === characterToSave.id) {
        updateCharacter(characterToSave);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Удаление персонажа
  const handleDeleteCharacter = async (id: string) => {
    if (!confirm(`Вы уверены, что хотите удалить персонажа с ID ${id}?`)) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await deleteCharacterById(id);
      
      toast({
        title: 'Персонаж удален',
        description: `Персонаж с ID ${id} успешно удален`
      });
      
      // Обновляем список персонажей
      const updatedCharacters = characters.filter(c => c.id !== id);
      setCharacters(updatedCharacters);
      
      // Очищаем поля, если удаляемый персонаж был выбран
      if (characterId === id) {
        setCharacterId('');
        setCharacterJson('');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обработка ошибок
  const handleError = (error: string | Error): void => {
    if (error instanceof Error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage(error);
    }
    
    toast({
      title: 'Ошибка',
      description: typeof error === 'string' ? error : error.message,
      variant: 'destructive'
    });
  };
  
  // Загрузка текущего персонажа из контекста
  const handleLoadCurrentCharacter = () => {
    if (!character) {
      setErrorMessage('Нет загруженного персонажа в контексте');
      return;
    }
    
    setCharacterId(character.id);
    setCharacterJson(JSON.stringify(character, null, 2));
    
    toast({
      title: 'Персонаж загружен из контекста',
      description: `Загружен персонаж: ${character.name}`
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Отладка персонажей</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="load">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="load">Загрузка</TabsTrigger>
            <TabsTrigger value="edit">Редактирование</TabsTrigger>
            <TabsTrigger value="list">Список</TabsTrigger>
          </TabsList>
          
          <TabsContent value="load" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="ID персонажа"
                value={characterId}
                onChange={(e) => setCharacterId(e.target.value)}
              />
              <Button onClick={handleLoadCharacter} disabled={isLoading}>
                Загрузить
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleCreateCharacter} disabled={isLoading} variant="outline">
                Создать нового
              </Button>
              <Button onClick={handleLoadCurrentCharacter} disabled={isLoading || !character} variant="outline">
                Загрузить текущего
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-4">
            <Textarea
              placeholder="JSON персонажа"
              value={characterJson}
              onChange={(e) => setCharacterJson(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            
            <div className="flex justify-end">
              <Button onClick={handleSaveCharacter} disabled={isLoading}>
                Сохранить изменения
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="space-y-4">
            <div className="flex justify-between">
              <Button onClick={handleLoadAllCharacters} disabled={isLoading}>
                Загрузить всех персонажей
              </Button>
              <span className="text-sm text-muted-foreground">
                {characters.length > 0 ? `Найдено: ${characters.length}` : 'Нет загруженных персонажей'}
              </span>
            </div>
            
            <div className="space-y-2">
              {characters.map((char) => (
                <div key={char.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{char.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {char.race} {char.class}, Уровень {char.level}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCharacterId(char.id);
                        setCharacterJson(JSON.stringify(char, null, 2));
                      }}
                    >
                      Выбрать
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteCharacter(char.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {errorMessage && (
          <div className="mt-4 p-2 bg-destructive/10 text-destructive rounded">
            {errorMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CharactersPageDebugger;
