import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/SocketContext';
import CharacterSheet from '@/components/character-sheet/CharacterSheet';
import { getCharacterById } from '@/services/characterService'; // 🔥 Firestore

const CharacterSheetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { character, setCharacter } = useCharacter();
  const { toast } = useToast();
  const { isConnected, sessionData, connect } = useSocket();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Загрузка персонажа из Firestore
  useEffect(() => {
    if (!id) {
      setError("Не указан ID персонажа.");
      return;
    }

    const loadCharacterFromFirestore = async () => {
      setLoading(true);
      try {
        const data = await getCharacterById(id);
        if (!data) {
          setError(`Персонаж с ID ${id} не найден.`);
        } else {
          setCharacter(data as Character);
          console.log("Персонаж загружен:", data);
        }
      } catch (err) {
        console.error("Ошибка при загрузке персонажа:", err);
        setError("Ошибка при загрузке персонажа.");
      } finally {
        setLoading(false);
      }
    };

    loadCharacterFromFirestore();
  }, [id, setCharacter]);

  // Подключение к сессии если активна
  useEffect(() => {
    const savedSession = localStorage.getItem('active-session');
    if (savedSession && isConnected && character) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed?.sessionCode) connect(parsed.sessionCode);
      } catch (e) {
        console.error("Ошибка при подключении к сессии:", e);
      }
    }
  }, [isConnected, character]);

  const handleBack = () => {
    navigate('/characters');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Загрузка персонажа...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Ошибка</h2>
          <p>{error}</p>
          <Button onClick={handleBack} className="mt-4">
            Вернуться к списку персонажей
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Session indicator */}
      {isConnected && sessionData && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-2 mb-4 text-sm flex justify-between items-center">
          <div>
            <span className="font-medium">Подключено к сессии: </span>
            <span>{sessionData.name || sessionData.code}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-green-500 hover:text-green-400"
            onClick={() => navigate('/session')}
          >
            Перейти в сессию
          </Button>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <Button variant="outline" onClick={handleBack}>
          ← К списку персонажей
        </Button>
        {!isConnected ? (
          <Button onClick={() => navigate('/join-session')}>Присоединиться к сессии</Button>
        ) : (
          <Button onClick={() => navigate('/session')}>Вернуться в сессию</Button>
        )}
      </div>

      {/* Персонаж */}
      {character && <CharacterSheet character={character} />}
    </div>
  );
};

export default CharacterSheetPage;
