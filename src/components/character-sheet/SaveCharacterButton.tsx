
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Character } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';

interface SaveCharacterButtonProps {
  character: Character;
  onSave?: () => Promise<any>;
}

const SaveCharacterButton: React.FC<SaveCharacterButtonProps> = ({
  character,
  onSave
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { saveCurrentCharacter, setCharacter } = useCharacter();

  const handleSave = async () => {
    if (!character) return;
    
    setIsSaving(true);
    
    try {
      // If onSave callback is provided, use it
      if (onSave) {
        await onSave();
      } else {
        // Default save action: set character in context and save to Firestore
        setCharacter(character);
        await saveCurrentCharacter();
        
        // Also store to localStorage as backup
        localStorage.setItem(`character_${character.id}`, JSON.stringify(character));
        localStorage.setItem('last-selected-character', character.id);
      }
      
      // Show success toast
      toast({
        title: "Персонаж сохранен",
        description: "Персонаж успешно сохранен."
      });
      
    } catch (error) {
      // Show error toast
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить персонажа. Попробуйте еще раз.",
        variant: "destructive"
      });
      
      console.error('Error saving character:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      variant="default"
      size="sm"
      disabled={isSaving}
      className="flex items-center gap-2"
    >
      <Save className="h-4 w-4" />
      {isSaving ? "Сохранение..." : "Сохранить персонажа"}
    </Button>
  );
};

export default SaveCharacterButton;
