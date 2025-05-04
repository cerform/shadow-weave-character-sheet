
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EditCharacterButtonProps {
  characterId: string;
}

export const EditCharacterButton: React.FC<EditCharacterButtonProps> = ({ characterId }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/character/edit/${characterId}`);
  };

  return (
    <Button onClick={handleEdit} variant="outline" className="flex items-center gap-2">
      <Edit className="h-4 w-4" />
      <span>Редактировать персонажа</span>
    </Button>
  );
};

export default EditCharacterButton;
