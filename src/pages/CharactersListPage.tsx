
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CharacterSheet } from '@/utils/characterImports';
import { getAllCharacters, deleteCharacter } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash2, Edit, Eye } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import ThemeSelector from '@/components/ThemeSelector';

const CharactersListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [characters, setCharacters] = useState<CharacterSheet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    const fetchCharacters = async () => {
      setLoading(true);
      if (currentUser) {
        try {
          const fetchedCharacters = await getAllCharacters(currentUser.id);
          
          // Сортируем персонажей: сначала по уровню (по убыванию), затем по имени
          const sortedCharacters = fetchedCharacters.sort((a, b) => {
            // Сначала сравниваем по уровню (по убыванию)
            if ((b.level || 1) !== (a.level || 1)) {
              return (b.level || 1) - (a.level || 1);
            }
            // Если уровни равны, сортируем по имени
            return (a.name || '').localeCompare(b.name || '');
          });
          
          setCharacters(sortedCharacters);
        } catch (error) {
          console.error("Failed to fetch characters:", error);
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить список персонажей.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [currentUser, toast]);

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      setLoading(true);
      await deleteCharacter(characterId);
      setCharacters(characters.filter(char => char.id !== characterId));
      toast({
        title: "Персонаж удален",
        description: "Персонаж успешно удален.",
      });
      setConfirmDelete(false);
    } catch (error) {
      console.error("Failed to delete character:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить персонажа.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCharacterImageUrl = (character: CharacterSheet) => {
    // Если у персонажа есть изображение, используем его
    if (character.image) return character.image;
    
    // Иначе используем изображение по умолчанию на основе класса
    const classIcons: Record<string, string> = {
      'Бард': '/class-icons/bard.svg',
      'Варвар': '/class-icons/barbarian.svg',
      'Воин': '/class-icons/fighter.svg',
      'Волшебник': '/class-icons/wizard.svg',
      'Друид': '/class-icons/druid.svg',
      'Жрец': '/class-icons/cleric.svg',
      'Колдун': '/class-icons/warlock.svg',
      'Монах': '/class-icons/monk.svg',
      'Паладин': '/class-icons/paladin.svg',
      'Плут': '/class-icons/rogue.svg',
      'Следопыт': '/class-icons/ranger.svg',
      'Чародей': '/class-icons/sorcerer.svg',
    };
    
    return classIcons[character.class || ''] || '/class-icons/default.svg';
  };

  return (
    <BackgroundWrapper>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 
            className="text-4xl font-bold font-philosopher" 
            style={{color: currentTheme.accent, textShadow: `0 0 10px ${currentTheme.accent}60`}}
          >
            Ваши персонажи
            <div
              className="h-1 w-3/4 mt-2 rounded"
              style={{
                background: `linear-gradient(90deg, transparent, ${currentTheme.accent}, transparent)`,
                boxShadow: `0 0 8px ${currentTheme.accent}70`
              }}
            />
          </h1>
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <Button 
              className="btn-magic shadow-lg"
              onClick={() => navigate('/character-creation')}
              style={{ backgroundColor: currentTheme.accent, color: currentTheme.buttonText }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Создать персонажа
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="overflow-hidden" style={{backgroundColor: currentTheme.cardBackground, borderColor: `${currentTheme.accent}30`}}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between w-full">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : characters.length === 0 ? (
          <div 
            className="bg-black/50 rounded-lg p-10 text-center"
            style={{borderLeft: `4px solid ${currentTheme.accent}`, backdropFilter: 'blur(10px)'}}
          >
            <h2 className="text-2xl font-bold mb-4" style={{color: currentTheme.textColor}}>У вас пока нет персонажей</h2>
            <p className="mb-6 text-muted-foreground" style={{color: `${currentTheme.textColor}90`}}>
              Создайте своего первого персонажа, чтобы начать приключение!
            </p>
            <Button 
              size="lg"
              className="btn-magic shadow-lg"
              onClick={() => navigate('/character-creation')}
              style={{ backgroundColor: currentTheme.accent, color: currentTheme.buttonText }}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Создать персонажа
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <Card 
                key={character.id} 
                className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                style={{
                  backgroundColor: `${currentTheme.cardBackground}`,
                  borderLeft: `4px solid ${currentTheme.accent}`,
                  boxShadow: `0 4px 12px ${currentTheme.accent}20`,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-philosopher" style={{color: currentTheme.textColor}}>
                    {character.name || "Безымянный персонаж"}
                  </CardTitle>
                  <CardDescription style={{color: `${currentTheme.textColor}80`}}>
                    {character.race} {character.background ? `• ${character.background}` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div 
                      className="rounded-full bg-muted h-16 w-16 flex-shrink-0 flex items-center justify-center overflow-hidden border-2"
                      style={{
                        borderColor: currentTheme.accent,
                        backgroundImage: `url(${getCharacterImageUrl(character)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <div>
                      <p className="text-sm" style={{color: currentTheme.textColor}}>
                        <span className="font-semibold">Класс:</span> {character.class} {character.subclass ? `(${character.subclass})` : ''}
                      </p>
                      <p className="text-sm" style={{color: currentTheme.textColor}}>
                        <span className="font-semibold">Уровень:</span> {character.level || 1}
                      </p>
                      <p className="text-sm" style={{color: currentTheme.textColor}}>
                        <span className="font-semibold">HP:</span> {character.currentHp || 0}/{character.maxHp || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/character/${character.id}`)}
                    style={{ backgroundColor: currentTheme.primary, color: currentTheme.buttonText }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Просмотр
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/character-sheet/${character.id}`)}
                      style={{ borderColor: currentTheme.accent, color: currentTheme.textColor }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Dialog open={confirmDelete && selectedCharacter === character.id} onOpenChange={(open) => {
                      setConfirmDelete(open);
                      if (!open) setSelectedCharacter(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setSelectedCharacter(character.id || '');
                            setConfirmDelete(true);
                          }}
                          style={{ backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent style={{backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor}}>
                        <DialogHeader>
                          <DialogTitle>Удаление персонажа</DialogTitle>
                          <DialogDescription style={{color: `${currentTheme.textColor}90`}}>
                            Вы уверены, что хотите удалить персонажа "{character.name}"? Это действие нельзя отменить.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setConfirmDelete(false)}
                            style={{ borderColor: currentTheme.accent, color: currentTheme.textColor }}
                          >
                            Отмена
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => handleDeleteCharacter(character.id || '')}
                          >
                            Удалить
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </BackgroundWrapper>
  );
};

export default CharactersListPage;
