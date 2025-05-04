import React, { useState } from "react";
import CharacterInfoPanel from './CharacterInfoPanel';
import AbilityScoresPanel from './AbilityScoresPanel';
import SkillsPanel from './SkillsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useWindowSize } from '@/hooks/useWindowSize';
import { CharacterContext } from '@/contexts/CharacterContext';
import { SessionContext } from '@/contexts/SessionContext';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { socket } from '@/lib/socket';
import { useNavigate } from 'react-router-dom'; // Using react-router-dom
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, UserPlus, Save, Download, Trash2, BookOpen } from 'lucide-react';
import CharacterEditModal from './CharacterEditModal';
import PDFGenerator from './PDFGenerator';
import EnhancedResourcePanel from './EnhancedResourcePanel';
import EnhancedLevelUpPanel from './EnhancedLevelUpPanel';
import FeaturesTab from './FeaturesTab';
import EquipmentPanel from './EquipmentPanel';
import SpellsPanel from './SpellsPanel';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { CharacterTabs } from './CharacterTabs';

const CharacterSheet = ({ character, isDM = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('abilities');
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { width } = useWindowSize();
  const { updateCharacter } = React.useContext(CharacterContext);
  const { session, addCharacterToSession, removeCharacterFromSession } = React.useContext(SessionContext);
  const { toast } = useToast();
  const { currentUser, isOfflineMode } = useAuth();
  const navigate = useNavigate();
  
  // State for storing PDF data
  const [pdfData, setPdfData] = useState(null);
  
  // Function to update character information
  const handleUpdateCharacter = (updates) => {
    if (!character) return;
    
    const updatedCharacter = {
      ...character,
      ...updates
    };
    updateCharacter(updatedCharacter);
    
    // Send changes to server if in session and not in offline mode
    if (session && !isOfflineMode) {
      socket?.emit('updateCharacter', {
        characterId: character.id,
        updates: updates
      });
    }
  };
  
  // Function to add character to session
  const handleAddCharacterToSession = async () => {
    if (!character) return;
    
    try {
      // Call function to add character to session
      await addCharacterToSession(character);
      
      toast({
        title: "Character added to session",
        description: `Character ${character.name} successfully added to the current session.`,
      });
    } catch (error) {
      toast({
        title: "Error adding character",
        description: error.message || "Failed to add character to the session.",
        variant: "destructive",
      });
    }
  };
  
  // Function to remove character from session
  const handleRemoveCharacterFromSession = async () => {
    if (!character) return;
    
    try {
      // Call function to remove character from session
      await removeCharacterFromSession(character.id);
      
      toast({
        title: "Character removed from session",
        description: `Character ${character.name} successfully removed from the current session.`,
      });
    } catch (error) {
      toast({
        title: "Error removing character",
        description: error.message || "Failed to remove character from the session.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-4 px-4 md:px-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {character?.image ? (
            <Avatar>
              <AvatarImage src={character.image} alt={character?.name} />
              <AvatarFallback>{character?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar>
              <AvatarFallback>{character?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          
          <div>
            <h1 className="text-2xl font-bold" style={{ color: currentTheme.textColor }}>
              {character?.name || <Skeleton />}
            </h1>
            <p className="text-sm text-muted-foreground">
              {character?.race} {character?.class} ({character?.level} уровень)
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Edit button (only for DM or in offline mode) */}
          {(isDM || isOfflineMode) && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsEditing(true)}
              style={{ color: currentTheme.accent, borderColor: currentTheme.accent }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          {/* Save button (only for DM or in offline mode) */}
          {(isDM || isOfflineMode) && (
            <Button 
              variant="outline" 
              size="icon"
              style={{ color: currentTheme.accent, borderColor: currentTheme.accent }}
            >
              <Save className="h-4 w-4" />
            </Button>
          )}
          
          {/* PDF generation button */}
          <PDFGenerator character={character} setPdfData={setPdfData}>
            <Button variant="outline" size="icon" style={{ color: currentTheme.accent, borderColor: currentTheme.accent }}>
              <Download className="h-4 w-4" />
            </Button>
          </PDFGenerator>
          
          {/* Delete button (only for DM or in offline mode) */}
          {(isDM || isOfflineMode) && (
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => {
                if (confirm("Are you sure you want to delete this character?")) {
                  localStorage.removeItem('dnd-characters');
                  navigate('/');
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          {/* Add/remove from session button */}
          {session && (
            character?.id === session.characterId ? (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleRemoveCharacterFromSession}
              >
                Remove from session
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleAddCharacterToSession}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add to session
              </Button>
            )
          )}
          
          {/* Theme toggle */}
          <ModeToggle />
        </div>
      </div>
      
      {/* Edit modal */}
      <CharacterEditModal 
        open={isEditing} 
        onOpenChange={setIsEditing} 
        character={character} 
        updateCharacter={handleUpdateCharacter} 
      />
      
      {/* Main content with three-column layout */}
      <div className="bg-secondary rounded-md p-4">
        {/* Tabs for mobile view */}
        {width < 768 && (
          <CharacterTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
        
        {/* Three-column layout for desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left column: Resources, Rest, Magic */}
          <div className="md:col-span-3 space-y-4">
            <EnhancedResourcePanel />
            
            {/* Show spell panel only for magical classes */}
            {character?.class && ['Волшебник', 'Жрец', 'Друид', 'Бард', 'Колдун', 'Чернокнижник', 'Чародей', 'Паладин', 'Следопыт'].includes(character.class) && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Spells</h3>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between mb-1">
                      <span>1st level:</span>
                      <span>3/3</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>2nd level:</span>
                      <span>2/2</span>
                    </div>
                    <Button size="sm" className="w-full mt-2">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Spellbook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Middle column: Characteristics, Saving Throws, Leadership Tabs */}
          <div className="md:col-span-6 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="abilities">Characteristics</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
              </TabsList>
              
              <div className="mt-4">
                <TabsContent value="abilities">
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Characteristics</h3>
                          <div className="grid grid-cols-3 gap-3">
                            {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability, index) => (
                              <div key={ability} className="text-center p-2 border border-primary/20 rounded-md hover:bg-primary/5">
                                <div className="text-sm text-muted-foreground">{ability}</div>
                                <div className="text-xl font-bold">
                                  {character?.abilities ? 
                                    (character.abilities[Object.keys(character.abilities)[index]] || 10) : 10}
                                </div>
                                <div className="text-sm font-medium">
                                  {character?.abilities ? 
                                    (Math.floor((character.abilities[Object.keys(character.abilities)[index]] - 10) / 2) >= 0 ? 
                                      `+${Math.floor((character.abilities[Object.keys(character.abilities)[index]] - 10) / 2)}` : 
                                      Math.floor((character.abilities[Object.keys(character.abilities)[index]] - 10) / 2)) : '+0'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Saving Throws</h3>
                          <div className="space-y-2">
                            {['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'].map((save) => (
                              <div key={save} className="flex justify-between items-center p-2 border border-primary/10 rounded-md hover:bg-primary/5">
                                <span>{save}</span>
                                <span>+2</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-3">Combat Characteristics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="text-center p-3 border border-primary/20 rounded-md bg-primary/5">
                            <div className="text-sm text-muted-foreground">AC</div>
                            <div className="text-xl font-bold">14</div>
                          </div>
                          <div className="text-center p-3 border border-primary/20 rounded-md bg-primary/5">
                            <div className="text-sm text-muted-foreground">Initiative</div>
                            <div className="text-xl font-bold">+2</div>
                          </div>
                          <div className="text-center p-3 border border-primary/20 rounded-md bg-primary/5">
                            <div className="text-sm text-muted-foreground">Speed</div>
                            <div className="text-xl font-bold">30 ft</div>
                          </div>
                          <div className="text-center p-3 border border-primary/20 rounded-md bg-primary/5">
                            <div className="text-sm text-muted-foreground">Bonus to Skill Checks</div>
                            <div className="text-xl font-bold">+2</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="features">
                  <Card>
                    <CardContent className="p-4">
                      <FeaturesTab character={character} isDM={isDM || isOfflineMode} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="equipment">
                  <Card>
                    <CardContent className="p-4">
                      <EquipmentPanel character={character} isDM={isDM || isOfflineMode} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
            
            <CharacterInfoPanel character={character} />
          </div>
          
          {/* Right column: Skills, Level Up */}
          <div className="md:col-span-3 space-y-4">
            <SkillsPanel character={character} />
            <EnhancedLevelUpPanel />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 text-center text-muted-foreground">
        <p className="text-sm">
          DnD Character Sheet App - Created by Foxik
        </p>
      </footer>
    </div>
  );
};

export default CharacterSheet;
