
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { CharacterSpell, Character } from '@/types/character';
import { SpellData } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useSpellbook } from '@/hooks/spellbook';
import { adaptToSpellData, adaptToCharacterSpell } from '@/utils/spellHelper';

const SpellBookViewer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLevel, setActiveLevel] = useState<number[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  const [character, setCharacter] = useState<Character | null>(null);

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    setCharacter(updatedCharacter);
  };

  const handleSelectSpell = (spell: SpellData) => {
    setSelectedSpell(spell);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSpell(null);
  };

  const { 
    filteredSpells, 
    searchTerm: hookSearchTerm, 
    setSearchTerm: setHookSearchTerm,
    activeLevel: hookActiveLevel,
    convertCharacterSpellsToSpellData
  } = useSpellbook();
  
  // Use the imported adapter functions instead of trying to access them from useSpellbook
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Книга Заклинаний</h1>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск заклинаний..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpells.map((spell) => (
          <Card key={spell.id} className="bg-card/90">
            <CardHeader>
              <CardTitle>{spell.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Уровень: {spell.level}</p>
              <p>Школа: {spell.school}</p>
              <Button onClick={() => handleSelectSpell(spell)}>Подробнее</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SpellBookViewer;
