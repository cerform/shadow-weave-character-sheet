import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { getCurrentUid } from '@/utils/authHelpers';
import { checkExistingCharacter } from '@/services/characterService';
import { toast } from 'sonner';

const CharactersPageDebugger: React.FC = () => {
  const { getUserCharacters, loading, error, characters } = useCharacter();
  const [userUid, setUserUid] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [checkId, setCheckId] = useState<string>('');

  useEffect(() => {
    const uid = getCurrentUid();
    setUserUid(uid);

    // Проверка на "админские" права (в реальности должно быть по-другому)
    setIsAdmin(uid === "admin_uid_here" || true); // В демо режиме всегда true
  }, []);

  useEffect(() => {
    if (userUid && isAdmin) {
      getUserCharacters();
    }
  }, [userUid, isAdmin, getUserCharacters]);

  const checkCharacterExistence = async () => {
    if (!checkId.trim()) {
      toast.error("Пожалуйста, введите ID для проверки");
      return;
    }

    try {
      const exists = await checkExistingCharacter(checkId);
      setCheckResult(exists ? "Персонаж найден в базе данных" : "Персонаж НЕ найден в базе данных");
    } catch (error) {
      console.error("Error checking character:", error);
      // Исправляем преобразование error для отображения
      const errorMessage = error instanceof Error ? error.message : String(error);
      setCheckResult(`Ошибка: ${errorMessage}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Characters Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p>Current User UID: {userUid || 'N/A'}</p>
            <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
          </div>

          <div>
            <label htmlFor="characterId">Check Character Existence:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="characterId"
                className="border rounded px-2 py-1"
                value={checkId}
                onChange={(e) => setCheckId(e.target.value)}
              />
              <Button onClick={checkCharacterExistence}>Check</Button>
            </div>
            {checkResult && <p>{checkResult}</p>}
          </div>

          <div>
            {loading ? (
              <p>Loading characters...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
              <>
                <h3>Characters List:</h3>
                <ScrollArea className="h-[200px] w-full">
                  {characters.length > 0 ? (
                    <ul>
                      {characters.map((char) => (
                        <li key={char.id}>{char.name} (ID: {char.id})</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No characters found.</p>
                  )}
                </ScrollArea>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharactersPageDebugger;
