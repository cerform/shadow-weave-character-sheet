
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Character } from "@/types/character";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import CharacterTabs from "./CharacterTabs";
import CharacterContent from "./CharacterContent";
import CharacterSpells from "./CharacterSpells";
import { useToast } from "@/hooks/use-toast";
import SpellDialog from "./SpellDialog";
import { SpellData } from "@/types/spells";
import { Home, ArrowUp, ArrowDown, BookOpen, Save, FileText, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CharacterInfoHeader from "./CharacterInfoHeader";
import { SaveCharacterButton } from "./SaveCharacterButton";
import { CharacterExportPDF } from "./CharacterExportPDF";
import { createDefaultCharacter } from "@/utils/characterUtils";
import { useSocket } from "@/contexts/SocketContext";

interface CharacterSheetProps {
  character?: Character;
  isDM?: boolean;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ 
  character: initialCharacter, 
  isDM = false 
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { sendUpdate } = useSocket();
  
  const [activeTab, setActiveTab] = useState<string>("характеристики");
  const [character, setCharacter] = useState<Character>(initialCharacter || createDefaultCharacter());
  const [spellDialogOpen, setSpellDialogOpen] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);
  
  // Обновляем character при изменении initialCharacter
  useEffect(() => {
    if (initialCharacter) {
      setCharacter(initialCharacter);
    }
  }, [initialCharacter]);
  
  // Текущая тема
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Функция для обновления персонажа
  const handleUpdateCharacter = (updates: Partial<Character>) => {
    const updatedCharacter = { ...character, ...updates };
    setCharacter(updatedCharacter);
    
    // Отправляем обновления через сокет, если подключен
    sendUpdate(updatedCharacter);
  };
  
  // Обработчик нажатия на заклинание
  const handleSpellClick = (spell: SpellData) => {
    setSelectedSpell(spell);
    setSpellDialogOpen(true);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Верхняя навигация */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/')}
                  style={{
                    borderColor: currentTheme.accent,
                    color: currentTheme.textColor
                  }}
                >
                  <Home className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>На главную</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/handbook')}
                  style={{
                    borderColor: currentTheme.accent,
                    color: currentTheme.textColor
                  }}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Руководство игрока</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex gap-2">
          <SaveCharacterButton character={character} />
          <CharacterExportPDF character={character} />
          
          {isDM && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/dm')}
                    style={{
                      borderColor: currentTheme.accent,
                      color: currentTheme.textColor
                    }}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Панель Мастера</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {/* Информация о персонаже */}
      <CharacterInfoHeader 
        character={character} 
        onUpdate={handleUpdateCharacter} 
      />
      
      {/* Основное содержимое */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Левая колонка */}
        <div className="space-y-6">
          {/* Ресурсы и характеристики */}
          <CharacterContent 
            character={character} 
            onUpdate={handleUpdateCharacter}
            section="resources"
          />
        </div>
        
        {/* Центральная колонка */}
        <div className="space-y-6">
          {/* Вкладки с основным контентом */}
          <CharacterTabs 
            active={activeTab} 
            onChange={setActiveTab}
            character={character}
            onUpdate={handleUpdateCharacter}
          />
          
          {/* Заклинания персонажа */}
          <CharacterSpells 
            character={character}
            onUpdate={handleUpdateCharacter}
            onSpellClick={handleSpellClick}
          />
        </div>
        
        {/* Правая колонка */}
        <div className="space-y-6">
          {/* Навыки */}
          <CharacterContent 
            character={character} 
            onUpdate={handleUpdateCharacter}
            section="skills"
          />
        </div>
      </div>
      
      {/* Диалог с деталями заклинания */}
      {selectedSpell && (
        <SpellDialog 
          open={spellDialogOpen} 
          onOpenChange={setSpellDialogOpen} 
          spell={selectedSpell}
          character={character}
          onUpdate={handleUpdateCharacter}
        />
      )}
    </div>
  );
};

export default CharacterSheet;
