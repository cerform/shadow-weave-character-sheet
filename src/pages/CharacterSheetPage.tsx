import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/SocketContext';
import CharacterSheet from '@/components/character-sheet/CharacterSheet';
import { getCharacterById } from '@/services/characterService'; // 🔥 Firestore
import { useCharacterOperations } from '@/hooks/useCharacterOperations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';

const CharacterSheetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { character, setCharacter } = useCharacter();
  const { toast } = useToast();
  const { isConnected, sessionData, connect } = useSocket();
  const { deleteCharacter } = useCharacterOperations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteCharacter = async () => {
    if (!id) return;
    
    setDeleting(true);
    try {
      await deleteCharacter(id);
      toast({
        title: "Персонаж удален",
        description: "Персонаж был успешно удален.",
      });
      navigate('/characters');
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить персонажа.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button variant="outline" onClick={handleBack} className="shrink-0">
          ← К списку персонажей
        </Button>
        
        <div className="flex flex-wrap gap-2 justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleting} className="shrink-0">
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить персонажа
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить персонажа?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие нельзя отменить. Персонаж {character?.name || 'без имени'} будет удален навсегда.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteCharacter}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleting}
                >
                  {deleting ? 'Удаление...' : 'Удалить'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {!isConnected ? (
            <Button onClick={() => navigate('/join-session')} className="shrink-0">
              Присоединиться к сессии
            </Button>
          ) : (
            <Button onClick={() => navigate('/session')} className="shrink-0">
              Вернуться в сессию
            </Button>
          )}
        </div>
      </div>

      {/* Персонаж */}
      {character && <CharacterSheet character={character} />}
    </div>
  );
};

export default CharacterSheetPage;
