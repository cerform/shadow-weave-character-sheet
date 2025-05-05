import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import type { CharacterSheet } from "@/utils/characterImports";
import { setCharacter } from '@/services/database';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '@/contexts/CharacterContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CharacterReviewProps {
  character: CharacterSheet;
  prevStep: () => void;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  setCurrentStep: (step: number) => void;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({ character, prevStep, updateCharacter, setCurrentStep }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { setCharacter: setContextCharacter } = useCharacter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCharacter = async () => {
    setIsSaving(true);
    try {
      if (!currentUser) {
        toast({
          title: "Ошибка",
          description: "Необходимо войти в аккаунт, чтобы сохранить персонажа.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Ensure the character has a userId
      if (!character.userId) {
        updateCharacter({ userId: currentUser.uid });
      }

      // Ensure the character has an ID
      if (!character.id) {
        updateCharacter({ id: Date.now().toString() });
      }

      // Save the character to Firestore
      await setCharacter(character);

      // Update the character context
      setContextCharacter(character);

      toast({
        title: "Успех",
        description: "Персонаж успешно сохранен!",
      });

      navigate('/sheet');
    } catch (error: any) {
      console.error("Ошибка при сохранении персонажа:", error);
      toast({
        title: "Ошибка",
        description: `Не удалось сохранить персонажа: ${error.message || 'Неизвестная ошибка'}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Обзор персонажа</CardTitle>
          <CardDescription>Просмотрите детали вашего персонажа перед сохранением.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-primary/20">
              <CardContent className="flex items-center space-x-4 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${character.name}`} />
                  <AvatarFallback>{character.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{character.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {character.race}, {character.class}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Уровень</h4>
                <p className="text-sm text-muted-foreground">
                  {character.level}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Раса</h4>
                <p className="text-sm text-muted-foreground">
                  {character.race}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Класс</h4>
                <p className="text-sm text-muted-foreground">
                  {character.class}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Сила</h4>
                <p className="text-sm text-muted-foreground">
                  {character.abilities?.strength}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Ловкость</h4>
                <p className="text-sm text-muted-foreground">
                  {character.abilities?.dexterity}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Телосложение</h4>
                <p className="text-sm text-muted-foreground">
                  {character.abilities?.constitution}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Интеллект</h4>
                <p className="text-sm text-muted-foreground">
                  {character.abilities?.intelligence}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Мудрость</h4>
                <p className="text-sm text-muted-foreground">
                  {character.abilities?.wisdom}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Харизма</h4>
                <p className="text-sm text-muted-foreground">
                  {character.abilities?.charisma}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Предыстория</h4>
                <p className="text-sm text-muted-foreground">
                  {character.background}
                </p>
              </CardContent>
            </Card>

             <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Мировоззрение</h4>
                <p className="text-sm text-muted-foreground">
                  {character.alignment}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Очки здоровья (HP)</h4>
                <p className="text-sm text-muted-foreground">
                  {character.maxHp}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="space-y-1 p-4">
                <h4 className="font-semibold">Имя игрока</h4>
                <p className="text-sm text-muted-foreground">
                  {character.playerName}
                </p>
              </CardContent>
            </Card>
          </div>

          {character.spells && character.spells.length > 0 && (
            <>
              <Separator />
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle>Заклинания</CardTitle>
                  <CardDescription>Список выбранных заклинаний</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 p-4">
                  {character.spells.map((spell, index) => (
                    <Badge key={index} variant="secondary">
                      {spell.name}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={prevStep}>
          Назад
        </Button>
        <Button onClick={handleSaveCharacter} disabled={isSaving}>
          {isSaving ? "Сохранение..." : "Сохранить персонажа"}
        </Button>
      </div>
    </div>
  );
};

export default CharacterReview;
