
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { adaptFirebaseUser } from '@/types/user';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from 'react-router-dom';
import HomeButton from '@/components/navigation/HomeButton';
import { Badge } from '@/components/ui/badge';
import { Scroll, Shield, Sword, BookText, Users, Wand } from 'lucide-react';

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Use adaptFirebaseUser to convert Firebase User to our User type
  const adaptedUser = currentUser ? adaptFirebaseUser(currentUser) : null;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      displayName: currentUser?.displayName || '',
      photoURL: currentUser?.photoURL || '',
    }
  });
  
  const onSubmit = async (data: { displayName: string; photoURL: string }) => {
    try {
      // Update only displayName and photoURL through Firebase Auth
      await updateProfile({
        displayName: data.displayName,
        photoURL: data.photoURL
      });
      
      // Here you can add logic for updating additional fields in Firestore
      
      toast.success('Профиль успешно обновлен');
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      toast.error('Ошибка при обновлении профиля');
    }
  };
  
  // Use username from adaptedUser
  const username = adaptedUser?.username || '';

  // Данные о классах D&D 5e из книги игрока
  const dndClasses = [
    { 
      name: "Бард", 
      description: "Вдохновители, целители, использующие силу музыки и магии.", 
      primaryAbility: "Харизма",
      saves: "Ловкость, Харизма",
      icon: <Wand className="h-6 w-6" />
    },
    { 
      name: "Варвар", 
      description: "Свирепые воины с первобытной яростью и нечеловеческой выносливостью.", 
      primaryAbility: "Сила",
      saves: "Сила, Телосложение",
      icon: <Sword className="h-6 w-6" />
    },
    { 
      name: "Воин", 
      description: "Мастера оружия и боевых стилей.", 
      primaryAbility: "Сила или Ловкость",
      saves: "Сила, Телосложение",
      icon: <Shield className="h-6 w-6" />
    },
    { 
      name: "Волшебник", 
      description: "Ученые магии, овладевающие всеми школами заклинаний.", 
      primaryAbility: "Интеллект",
      saves: "Интеллект, Мудрость",
      icon: <BookText className="h-6 w-6" />
    },
    { 
      name: "Друид", 
      description: "Хранители природы с доступом к силам стихий и способностью менять облик.", 
      primaryAbility: "Мудрость",
      saves: "Интеллект, Мудрость",
      icon: <Scroll className="h-6 w-6" />
    },
    { 
      name: "Жрец", 
      description: "Служители божеств, владеющие божественной магией.", 
      primaryAbility: "Мудрость",
      saves: "Мудрость, Харизма",
      icon: <Users className="h-6 w-6" />
    }
  ];
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Личный кабинет</h1>
        <HomeButton />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Мой профиль</TabsTrigger>
          <TabsTrigger value="classes">Классы D&D</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="flex flex-col items-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={currentUser?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username || 'guest'}`} />
                <AvatarFallback>{currentUser?.displayName?.substring(0, 2) || 'ГП'}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{currentUser?.displayName || 'Профиль'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Отображаемое имя</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Введите отображаемое имя"
                    {...register('displayName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photoURL">URL аватара</Label>
                  <Input
                    id="photoURL"
                    type="url"
                    placeholder="URL изображения профиля"
                    {...register('photoURL')}
                  />
                </div>
                <Button disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Обновление...' : 'Обновить профиль'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="classes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dndClasses.map((dndClass) => (
              <Card key={dndClass.name} className="overflow-hidden">
                <CardHeader className="bg-slate-900 text-white pb-2">
                  <div className="flex items-center gap-3">
                    {dndClass.icon}
                    <CardTitle>{dndClass.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-muted-foreground mb-3">{dndClass.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline" className="flex items-center gap-1">
                      Основная характеристика: {dndClass.primaryAbility}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      Спасброски: {dndClass.saves}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
