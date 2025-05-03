
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CreateSessionPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Перенаправляем на новую страницу создания сессий
    toast.info('Перенаправление на панель мастера...');
    navigate('/dm-dashboard');
  }, [navigate]);

  return (
    <div className="container p-4 mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Перенаправление...</h1>
    </div>
  );
};

export default CreateSessionPage;
