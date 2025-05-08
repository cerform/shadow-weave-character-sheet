
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CharacterViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="ghost"
        onClick={() => navigate('/characters')}
        className="mb-4"
      >
        <ArrowLeft size={16} className="mr-2" />
        Назад к списку персонажей
      </Button>
      
      <div className="bg-card p-6 rounded-lg border">
        <h1 className="text-2xl font-bold mb-4">Просмотр персонажа</h1>
        <p className="text-muted-foreground">ID персонажа: {id}</p>
        
        <div className="mt-8">
          <p>Страница в разработке</p>
          <Button 
            onClick={() => navigate(`/character/${id}/edit`)}
            className="mt-4"
          >
            Редактировать персонажа
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CharacterViewPage;
