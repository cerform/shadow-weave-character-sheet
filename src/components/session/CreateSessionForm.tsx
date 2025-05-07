import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createGameSession } from '@/services/sessionService';

const CreateSessionForm: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название сессии',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const session = await createGameSession(name, description);
      
      toast({
        title: 'Успешно',
        description: 'Игровая сессия создана',
      });
      
      // Переходим на страницу DM для управления сессией
      navigate(`/dm-session/${session.id}`);
    } catch (error) {
      console.error('Ошибка при создании сессии:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при создании сессии',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Создать игровую сессию</CardTitle>
        <CardDescription>
          Создайте новую сессию и пригласите игроков присоединиться
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-name">Название сессии</Label>
            <Input
              id="session-name"
              placeholder="Введите название сессии"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="session-description">Описание (опционально)</Label>
            <Textarea
              id="session-description"
              placeholder="Введите описание сессии"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isCreating}
          >
            {isCreating ? 'Создание...' : 'Создать сессию'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="ghost" onClick={() => navigate('/dm')}>
          Вернуться
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateSessionForm;
