
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CharactersTable } from '@/components/characters/CharactersTable';
import { Character } from '@/types/character';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCharacter } from '@/contexts/CharacterContext';

const CharactersListPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const { toast } = useToast();
  const { getUserCharacters } = useCharacter();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const userCharacters = await getUserCharacters('current-user');
        setCharacters(userCharacters || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching characters:', err);
        setError('Не удалось загрузить персонажей');
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить персонажей',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [getUserCharacters, toast]);

  const handleCreateCharacter = () => {
    navigate('/character-creation');
  };

  const handleViewCharacter = (id: string) => {
    navigate(`/character/${id}`);
  };

  const handleEditCharacter = (id: string) => {
    navigate(`/character/${id}/edit`);
  };

  const handleDeleteCharacter = async (id: string) => {
    try {
      const updatedCharacters = characters.filter(char => char.id !== id);
      setCharacters(updatedCharacters);
      toast({
        title: 'Успешно',
        description: 'Персонаж удален',
      });
    } catch (err) {
      console.error('Error deleting character:', err);
      setError('Не удалось удалить персонажа');
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить персонажа',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full border rounded-lg shadow-sm bg-card mb-6 transition-all duration-200"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <h2 className="text-2xl font-semibold">Мои персонажи</h2>
          </div>
          <Button onClick={handleCreateCharacter} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Создать персонажа
          </Button>
        </div>
        
        <CollapsibleContent>
          <div className="p-4">
            <CharactersTable 
              characters={characters}
              loading={loading}
              error={error}
              onView={handleViewCharacter}
              onEdit={handleEditCharacter}
              onDelete={handleDeleteCharacter}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {!isOpen && (
        <div className="mb-4">
          <Button 
            onClick={handleCreateCharacter}
            variant="outline"
            className="w-full flex justify-between items-center py-2"
          >
            <span>Создать нового персонажа</span>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className={`space-y-4 transition-opacity ${isOpen ? 'opacity-0 hidden' : 'opacity-100'}`}>
        <h2 className="text-xl font-semibold">Возможности игры</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Создание персонажа</h3>
              <p className="text-sm text-muted-foreground">
                Создавайте персонажей с разными классами, расами и характеристиками
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Присоединение к сессии</h3>
              <p className="text-sm text-muted-foreground">
                Присоединяйтесь к игровым сессиям с другими игроками
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">Справочник правил</h3>
              <p className="text-sm text-muted-foreground">
                Доступ к базовым правилам D&D 5e
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CharactersListPage;
