
import React, { useState, useEffect, useCallback } from "react";
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
import { useNavigate } from 'react-router-dom'; // Используем react-router-dom вместо next/navigation
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
  
  // Состояние для хранения информации о персонаже в формате PDF
  const [pdfData, setPdfData] = useState(null);
  
  // Функция для обновления информации о персонаже
  const handleUpdateCharacter = (updates) => {
    if (!character) return;
    
    const updatedCharacter = {
      ...character,
      ...updates
    };
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
    } catch (error) {
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
    } catch (error) {
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
                  navigate('/');
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
      
      {/* Основное содержимое с трехколоночной структурой */}
      <div className="bg-secondary rounded-md p-4">
        {/* Табы для мобильного отображения */}
        {width < 768 && (
          <CharacterTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
        
        {/* Трехколоночный макет для десктопа */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Левая колонка: Ресурсы, Отдых, Магия */}
          <div className="md:col-span-3 space-y-4">
            <EnhancedResourcePanel />
            
            {/* Показываем панель заклинаний только для магических классов */}
            {character?.class && ['Волшебник', 'Жрец', 'Друид', 'Бард', 'Колдун', 'Чернокнижник', 'Чародей', 'Паладин', 'Следопыт'].includes(character.class) && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Заклинания</h3>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between mb-1">
                      <span>1-й уровень:</span>
                      <span>3/3</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>2-й уровень:</span>
                      <span>2/2</span>
                    </div>
                    <Button size="sm" className="w-full mt-2">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Книга заклинаний
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Средняя колонка: Характеристики, Спасброски, Табы руководства */}
          <div className="md:col-span-6 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="abilities">Характеристики</TabsTrigger>
                <TabsTrigger value="features">Особенности</TabsTrigger>
                <TabsTrigger value="equipment">Снаряжение</TabsTrigger>
              </TabsList>
              
              <div className="mt-4">
                <TabsContent value="abilities">
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Характеристики</h3>
                          <div className="grid grid-cols-3 gap-3">
                            {['СИЛ', 'ЛОВ', 'ТЕЛ', 'ИНТ', 'МДР', 'ХАР'].map((ability, index) => (
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
                          <h3 className="text-lg font-semibold mb-3">Спасброски</h3>
                          <div className="space-y-2">
                            {['Сила', 'Ловкость', 'Телосложение', 'Интеллект', 'Мудрость', 'Харизма'].map((save) => (
                              <div key={save} className="flex justify-between items-center p-2 border border-primary/10 rounded-md hover:bg-primary/5">
                                <span>{save}</span>
                                <span>+2</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-3">Боевые характеристики</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="text-center p-3 border border-primary/20 rounded-md bg-primary/5">
                            <div className="text-sm text-muted-foreground">КБ</div>
                            <div className="text-xl font-bold">14</div>
                          </div>
                          <div className="text-center p-3 border border-primary/20 rounded-md bg-primary/5">
                            <div className="text-sm text-muted-foreground">Инициатива</div>
                            <div className="text-xl font-bold">+2</div>
                          </div>
                          <div className="text-center p-3 border border-primary/20 rounded-md bg-primary/5">
                            <div className="text-sm text-muted-foreground">Скорость</div>
                            <div className="text-xl font-bold">30 фт</div>
                          </div>
                          <div className="text-center p-3 border border-primary/20 rounded-md bg-primary/5">
                            <div className="text-sm text-muted-foreground">Бонус мастерства</div>
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
          
          {/* Правая колонка: Навыки, Повышение уровня */}
          <div className="md:col-span-3 space-y-4">
            <SkillsPanel character={character} />
            <EnhancedLevelUpPanel />
          </div>
        </div>
      </div>
      
      {/* Подвал */}
      <footer className="py-6 text-center text-muted-foreground">
        <p className="text-sm">
          DnD Character Sheet App - Created by Foxik
        </p>
      </footer>
    </div>
  );
};

export default CharacterSheet;
