
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Character } from '@/types/character';
import CharacterSheet from '@/components/character-sheet/CharacterSheet';
import MobileCharacterSheet from '@/components/character-sheet/MobileCharacterSheet';
import { useToast } from '@/hooks/use-toast';

// Correct import from service
import { getCharacter } from '@/services/characterService';

interface CharacterSheetPageProps {
  // No renderMobileVersion prop here
}

const CharacterSheetPage: React.FC<CharacterSheetPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Determine if the device is mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    const loadCharacter = async () => {
      if (!id) {
        setError('No character ID provided');
        setLoading(false);
        return;
      }
      
      try {
        // Use the correct function
        const data = await getCharacter(id);
        setCharacter(data);
      } catch (error) {
        setError('Error loading character');
        console.error('Error loading character:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить персонажа",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCharacter();
  }, [id, toast]);
  
  const handleUpdateCharacter = (updates: Partial<Character>) => {
    if (character) {
      const updatedCharacter = { ...character, ...updates };
      setCharacter(updatedCharacter);
      
      // Here you would typically save the character to the backend
      console.log('Character updated:', updatedCharacter);
    }
  };
  
  if (loading) {
    return <div className="p-8 text-center">Загрузка персонажа...</div>;
  }
  
  if (error || !character) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Ошибка</h2>
        <p>{error || 'Персонаж не найден'}</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      {isMobile ? (
        <MobileCharacterSheet character={character} onUpdate={handleUpdateCharacter} />
      ) : (
        <CharacterSheet character={character} onUpdate={handleUpdateCharacter} />
      )}
    </div>
  );
};

export default CharacterSheetPage;
