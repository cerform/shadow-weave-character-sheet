
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Character } from '@/types/character';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { useNavigate } from 'react-router-dom';
import { useCharacterOperations } from '@/hooks/useCharacterOperations';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CharacterInfoHeaderProps {
  character: Character;
}

const CharacterInfoHeader: React.FC<CharacterInfoHeaderProps> = ({ character }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { deleteCharacter } = useCharacterOperations();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  
  console.log('CharacterInfoHeader: Отображение персонажа', character);
  
  // Получаем класс персонажа с учетом различных форматов данных
  const getCharacterClass = (): string => {
    const classValue = character.className || character.class;
    return typeof classValue === 'string' && classValue.trim() !== ''
      ? classValue
      : '';
  };
  
  const getBgColor = () => {
    switch (theme) {
      case 'fantasy':
        return 'bg-amber-900/30';
      case 'cyberpunk':
        return 'bg-purple-900/30';
      case 'default':
      default:
        return 'bg-gray-800/50';
    }
  };
  
  const handleDeleteCharacter = async () => {
    if (!character.id) return;
    
    setDeleting(true);
    try {
      await deleteCharacter(character.id);
      toast({
        title: "Персонаж удален",
        description: "Персонаж был успешно удален.",
      });
      navigate('/characters');
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить персонажа.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <Card className={`mb-4 ${getBgColor()} border-0 shadow-lg`}>
      <CardContent className="pt-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold">{character.name || 'Безымянный герой'}</h2>
            <div className="text-sm text-muted-foreground mb-2">
              {character.race} {character.subrace && `(${character.subrace})`} &bull; {getCharacterClass()} &bull; Уровень {character.level || 1}
            </div>
            <div className="flex gap-2 flex-wrap">
              {character.background && (
                <Badge variant="secondary">{character.background}</Badge>
              )}
              {character.alignment && (
                <Badge variant="outline">{character.alignment}</Badge>
              )}
              <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                Опыт: {character.experience || 0}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/character-creation?edit=${character.id}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={deleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить персонажа?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Персонаж {character?.name || 'без имени'} будет удален навсегда.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteCharacter}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleting}
                  >
                    {deleting ? 'Удаление...' : 'Удалить'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterInfoHeader;
