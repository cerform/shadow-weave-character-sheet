
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X, ChevronDown, ChevronUp, Sparkles, Bookmark, BookmarkCheck, Book } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterSpell, Character } from '@/types/character';
import { SpellData } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useSpellbook } from '@/hooks/spellbook';
import SpellDescription from '../character-sheet/SpellDescription';
import SpellPanel from '../character-sheet/SpellPanel';

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
    searchTerm: filteredSpellsSearchTerm,
    setSearchTerm: setFilteredSpellsSearchTerm,
    activeLevel: filteredSpellsActiveLevel,
    convertCharacterSpellsToSpellData
  } = useSpellbook();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Книга Заклинаний</h1>
      
      <Input
        placeholder="Поиск заклинаний..."
        value={searchTerm}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      
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
