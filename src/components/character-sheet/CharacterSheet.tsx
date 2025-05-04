import React, { useState, useEffect, useRef } from 'react';
import { CharacterSheet as CharacterSheetType } from '@/types/character';
import CharacterInfoPanel from './CharacterInfoPanel';
import AbilityScoresPanel from './AbilityScoresPanel';
import SkillsPanel from './SkillsPanel';
import CombatStatsPanel from './CombatStatsPanel';
import FeaturesTab from './FeaturesTab';
import EquipmentPanel from './EquipmentPanel';
import SpellsPanel from './SpellsPanel';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useWindowSize } from '@/hooks/useWindowSize';
import { CharacterContext } from '@/contexts/CharacterContext';
import { SessionContext } from '@/contexts/SessionContext';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { socket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton"
import { ModeToggle } from "@/components/ModeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit, UserPlus, Save, Download, Trash2 } from 'lucide-react';
import CharacterEditModal from './CharacterEditModal';
import PDFGenerator from './PDFGenerator';
import EnhancedResourcePanel from './EnhancedResourcePanel';
import EnhancedLevelUpPanel from './EnhancedLevelUpPanel';

const CharacterSheet = ({ character, isDM = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { width } = useWindowSize();
  const { updateCharacter } = React.useContext(CharacterContext);
  const { session, addCharacterToSession, removeCharacterFromSession } = React.useContext(SessionContext);
  const { toast } = useToast();
  const { currentUser, isOfflineMode } = useAuth();
  const router = useRouter();
  
  // Состояние для хранения информации о персонаже в формате PDF
  const [pdfData, setPdfData] = useState<CharacterSheetType | null>(null);
  
  // Функция для обновления информации о персонаже
  const handleUpdateCharacter = (updates: Partial<CharacterSheetType>) => {
    if (!character) return;
    
    const updatedCharacter = { ...character, ...updates };
    updateCharacter(updatedCharacter);
    
    // Отправляем изменения на сервер, если мы в сессии и не в автономном режиме
    if (session && !isOfflineMode) {
      socket?.emit('updateCharacter', {
        characterId: character.id,
        updates: updates
      });
    }
  };
  
  // Функция для добавления персонажа в сессию
  const handleAddCharacterToSession = async () => {
    if (!character) return;
    
    try {
      // Вызываем функцию добавления персонажа в сессию
      await addCharacterToSession(character);
      
      toast({
        title: "Персонаж добавлен в сессию",
        description: `Персонаж ${character.name} успешно добавлен в текущую сессию.`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка при добавлении персонажа",
        description: error.message || "Не удалось добавить персонажа в сессию.",
        variant: "destructive",
      });
    }
  };
  
  // Функция для удаления персонажа из сессии
  const handleRemoveCharacterFromSession = async () => {
    if (!character) return;
    
    try {
      // Вызываем функцию удаления персонажа из сессии
      await removeCharacterFromSession(character.id);
      
      toast({
        title: "Персонаж удален из сессии",
        description: `Персонаж ${character.name} успешно удален из текущей сессии.`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка при удалении персонажа",
        description: error.message || "Не удалось удалить персонажа из сессии.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-4 px-4 md:px-0">
      {/* Шапка */}
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
          {/* Кнопка редактирования (только для DM или в автономном режиме) */}
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
          
          {/* Кнопка сохранения (только для DM или в автономном режиме) */}
          {(isDM || isOfflineMode) && (
            <Button 
              variant="outline" 
              size="icon"
              style={{ color: currentTheme.accent, borderColor: currentTheme.accent }}
            >
              <Save className="h-4 w-4" />
            </Button>
          )}
          
          {/* Кнопка генерации PDF */}
          <PDFGenerator character={character} setPdfData={setPdfData}>
            <Button variant="outline" size="icon" style={{ color: currentTheme.accent, borderColor: currentTheme.accent }}>
              <Download className="h-4 w-4" />
            </Button>
          </PDFGenerator>
          
          {/* Кнопка удаления (только для DM или в автономном режиме) */}
          {(isDM || isOfflineMode) && (
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => {
                if (confirm("Вы уверены, что хотите удалить этого персонажа?")) {
                  localStorage.removeItem('dnd-characters');
                  router.push('/');
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          {/* Кнопка добавления/удаления из сессии */}
          {session && (
            character?.id === session.characterId ? (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleRemoveCharacterFromSession}
              >
                Удалить из сессии
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleAddCharacterToSession}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Добавить в сессию
              </Button>
            )
          )}
          
          {/* Переключатель темы */}
          <ModeToggle />
        </div>
      </div>
      
      {/* Модальное окно редактирования */}
      <CharacterEditModal 
        open={isEditing} 
        onOpenChange={setIsEditing} 
        character={character} 
        updateCharacter={handleUpdateCharacter} 
      />
      
      {/* ContentWrapper с обновленными компонентами */}
      <ContentWrapper>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Левая колонка */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="space-y-4">
              {/* Информация о персонаже */}
              <CharacterInfoPanel character={character} />
              
              {/* Характеристики */}
              <AbilityScoresPanel character={character} />
              
              {/* Используем улучшенную панель ресурсов */}
              <EnhancedResourcePanel />
              
              {/* Используем улучшенную панель повышения уровня */}
              <EnhancedLevelUpPanel />
              
              {/* Навыки */}
              <SkillsPanel character={character} />
            </div>
          </div>
          
          {/* Средняя колонка (Features/Equipment) */}
          <div className="md:col-span-8 lg:col-span-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="features">Особенности</TabsTrigger>
                <TabsTrigger value="equipment">Снаряжение</TabsTrigger>
              </TabsList>
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
            </Tabs>
          </div>
          
          {/* Правая колонка (Spells) */}
          <div className="md:col-span-12 lg:col-span-3">
            {character?.class === 'Волшебник' || character?.class === 'Жрец' || character?.class === 'Друид' || character?.class === 'Бард' || character?.class === 'Колдун' || character?.class === 'Чернокнижник' || character?.class === 'Чародей' ? (
              <SpellsPanel character={character} isDM={isDM || isOfflineMode} />
            ) : (
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground">
                    Этот класс не использует заклинания.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ContentWrapper>
      
      {/* Подвал */}
      <footer className="py-6 text-center text-muted-foreground">
        {width < 768 ? (
          <>
            <p className="text-sm">
              DnD Character Sheet App
            </p>
            <p className="text-xs">
              Created by Foxik
            </p>
          </>
        ) : (
          <>
            <p className="text-sm">
              DnD Character Sheet App - Created by Foxik
            </p>
          </>
        )}
      </footer>
    </div>
  );
};

// Обертка контента для стилизации
const ContentWrapper = ({ children }) => (
  <div className="bg-secondary rounded-md p-4">
    {children}
  </div>
);

export default CharacterSheet;
