
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Character, CharacterSpell } from '@/types/character';
import { SpellData, convertSpellDataToCharacterSpell } from '@/types/spells';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface SpellSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SpellSelectionModal: React.FC<SpellSelectionModalProps> = ({
  open,
  onOpenChange,
  character,
  onUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch spells from your data source here
    // For example, you can use a local JSON file or an API endpoint
    // Replace this with your actual data fetching logic
    const fetchSpells = async () => {
      try {
        const response = await fetch('/data/spells.json');
        const data = await response.json();
        setAvailableSpells(data);
      } catch (error) {
        console.error("Failed to fetch spells:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список заклинаний.",
          variant: "destructive",
        });
      }
    };
    
    fetchSpells();
  }, [toast]);
  
  // Filter spells based on search term
  const filteredSpells = availableSpells.filter(spell =>
    spell.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Function to add a spell to the character's spell list
  const addSpellToCharacter = (spell: SpellData) => {
    if (!character.spells) {
      character.spells = [];
    }
    
    // Check if the spell is already in the character's spell list
    const spellExists = character.spells.some(s => {
      return typeof s === 'string' ? s === spell.name : s.name === spell.name;
    });
    
    if (spellExists) {
      toast({
        title: "Заклинание уже добавлено",
        description: "Это заклинание уже есть в вашем списке.",
      });
      return;
    }
    
    // Add the spell to the character's spell list
    const newSpell: CharacterSpell = convertSpellDataToCharacterSpell(spell);
    const updatedSpells = [...character.spells, newSpell];
    
    onUpdate({ spells: updatedSpells });
    
    toast({
      title: "Заклинание добавлено",
      description: `Заклинание "${spell.name}" добавлено в ваш список.`,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выбор заклинаний</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Поиск заклинаний..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[200px]"
          />
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4 mr-2" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(80vh-150px)] w-full">
          <div className="flex flex-col space-y-2">
            {filteredSpells.map((spell) => (
              <Button
                key={spell.id || spell.name}
                variant="secondary"
                className="w-full justify-start"
                onClick={() => addSpellToCharacter(spell)}
              >
                {spell.name} ({spell.level} уровень)
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SpellSelectionModal;
