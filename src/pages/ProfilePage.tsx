
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { adaptFirebaseUser } from '@/types/user';

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  
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
  
  return (
    <div className="container mx-auto py-10">
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
    </div>
  );
};

export default ProfilePage;
