
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus } from 'lucide-react';

const CharacterNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <Tabs
        value={currentPath}
        onValueChange={(value) => navigate(value)}
        className="w-full sm:w-auto"
      >
        <TabsList className="grid grid-cols-2 w-full sm:w-auto">
          <TabsTrigger value="/characters" className="flex gap-2 items-center">
            <FileText size={16} />
            <span className="hidden sm:inline">Все персонажи</span>
            <span className="sm:hidden">Все</span>
          </TabsTrigger>
          <TabsTrigger value="/recent-characters" className="flex gap-2 items-center">
            <FileText size={16} />
            <span className="hidden sm:inline">Недавние</span>
            <span className="sm:hidden">Недавние</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Button
        onClick={() => navigate('/character-creation')}
        className="w-full sm:w-auto"
      >
        <Plus size={16} className="mr-2" />
        Создать персонажа
      </Button>
    </div>
  );
};

export default CharacterNavigation;
