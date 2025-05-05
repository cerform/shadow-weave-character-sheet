
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/SocketContext';
import { createDefaultCharacter } from '@/utils/characterUtils';
import CharacterSheet from '@/components/character-sheet/CharacterSheet';

const CharacterSheetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { character, setCharacter } = useCharacter();
  const { toast } = useToast();
  const { isConnected, sessionData, connect } = useSocket();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Загружаем персонажа при инициализации
  useEffect(() => {
    if (!character || (id && character.id !== id)) {
      loadCharacter(id);
    }
    
    // Проверяем, есть ли активная сессия
    const savedSession = localStorage.getItem('active-session');
    if (savedSession && isConnected) {
      try {
        const parsedSession = JSON.parse(savedSession);
        if (parsedSession && parsedSession.sessionCode) {
          // Если есть сессия и персонаж, подключаемся к сессии
          if (character) {
            connect(parsedSession.sessionCode, parsedSession.playerName, character.id);
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных сессии:", error);
      }
    }
  }, [id, character, isConnected]);

  const loadCharacter = async (characterId?: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Если указан ID, загружаем конкретного персонажа
      if (characterId) {
        const savedCharacter = localStorage.getItem(`character_${characterId}`);
        
        if (savedCharacter) {
          const loadedCharacter = JSON.parse(savedCharacter);
          setCharacter(loadedCharacter);
          localStorage.setItem('last-selected-character', characterId);
          console.log(`Загружен персонаж: ${loadedCharacter.name}`);
        } else {
          setError(`Персонаж с ID ${characterId} не найден.`);
          setCharacter(createDefaultCharacter());
        }
      } 
      // Иначе проверяем, есть ли сохраненный последний персонаж
      else {
        const lastCharacterId = localStorage.getItem('last-selected-character');
        if (lastCharacterId) {
          loadCharacter(lastCharacterId);
        } else {
          // Создаем нового персонажа, если нет сохраненных
          const newCharacter = createDefaultCharacter();
          setCharacter(newCharacter);
          console.log('Создан новый персонаж');
        }
      }
    } catch (err) {
      console.error('Ошибка при загрузке персонажа:', err);
      setError('Не удалось загрузить персонажа. Пожалуйста, попробуйте еще раз.');
      setCharacter(createDefaultCharacter());
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCharacter = (updates: Partial<Character>) => {
    if (!character) return;
    
    const updatedCharacter = { ...character, ...updates };
    setCharacter(updatedCharacter);
    
    // Сохраняем персонажа в localStorage
    localStorage.setItem(`character_${character.id}`, JSON.stringify(updatedCharacter));
    localStorage.setItem('last-selected-character', character.id);
    
    console.log('Персонаж обновлен:', updatedCharacter);
  };

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
          <Button onClick={handleBack} className="mt-4">Вернуться к списку персонажей</Button>
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
      
      {/* Navigation buttons */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="mb-2 sm:mb-0"
        >
          ← К списку персонажей
        </Button>
        
        {/* Conditional session buttons */}
        {!isConnected ? (
          <Button onClick={() => navigate('/join-session')}>Присоединиться к сессии</Button>
        ) : (
          <Button onClick={() => navigate('/session')}>Вернуться в сессию</Button>
        )}
      </div>
      
      {/* Character sheet */}
      {character && (
        <CharacterSheet 
          character={character} 
          onUpdate={handleUpdateCharacter}
        />
      )}
    </div>
  );
};

export default CharacterSheetPage;
