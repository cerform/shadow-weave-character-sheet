
import React from 'react';
import CreateSessionForm from './CreateSessionForm';
import { useNavigate } from 'react-router-dom';

const CreateSessionPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSubmit = (data: { name: string, description: string }) => {
    // Обработка отправки формы
    console.log('Session created:', data);
    // Например, перенаправление после создания
    navigate('/sessions');
  };

  return (
    <div className="container mx-auto p-4">
      <CreateSessionForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateSessionPage;
