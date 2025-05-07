
import React from 'react';
import CreateSessionForm from './CreateSessionForm';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';

const CreateSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { createSession } = useSession();
  
  const handleSubmit = (data: { name: string, description: string }) => {
    try {
      // Создание сессии через контекст
      const newSession = createSession(data.name, data.description);
      console.log('Session created:', newSession);
      
      // Перенаправление на страницу сессии
      navigate(`/dm-session/${newSession.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Создать новую сессию</h1>
      <div className="max-w-md">
        <CreateSessionForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateSessionPage;
