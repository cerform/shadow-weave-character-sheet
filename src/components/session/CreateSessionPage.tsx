
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CreateSessionForm from '@/components/session/CreateSessionForm';

const CreateSessionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Создание игровой сессии</h1>
        <Button variant="outline" onClick={() => navigate('/dm')}>
          Назад
        </Button>
      </div>
      
      <CreateSessionForm />
    </div>
  );
};

export default CreateSessionPage;
