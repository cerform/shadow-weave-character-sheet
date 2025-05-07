
import { useState, useEffect } from 'react';
import { getCharacters } from '@/services/characterService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import JoinSessionForm from '@/components/session/JoinSessionForm';

const JoinSessionPage: React.FC = () => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const loadCharacters = async () => {
      try {
        setIsLoading(true);
        const userCharacters = await getCharacters(currentUser.uid);
        setCharacters(userCharacters);
      } catch (error) {
        console.error('Ошибка при загрузке персонажей:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить персонажей',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, [currentUser, toast]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Присоединение к игровой сессии</h1>
      
      <JoinSessionForm 
        characters={characters}
        isLoading={isLoading}
      />
    </div>
  );
};

export default JoinSessionPage;
