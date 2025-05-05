
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ProfilePage = () => {
  const { currentUser, updateUserProfile } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      displayName: currentUser?.displayName || '',
      photoURL: currentUser?.photoURL || '',
      username: currentUser?.username || '',
    }
  });
  
  const onSubmit = async (data: { displayName: string; photoURL: string; username: string }) => {
    try {
      await updateUserProfile({
        displayName: data.displayName,
        photoURL: data.photoURL,
        username: data.username,
      });
      
      toast.success('Профиль успешно обновлен');
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      toast.error('Ошибка при обновлении профиля');
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={currentUser?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser?.username || 'guest'}`} />
            <AvatarFallback>{currentUser?.displayName?.substring(0, 2) || 'ГП'}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4">{currentUser?.displayName || 'Профиль'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                type="text"
                placeholder="Введите имя пользователя"
                {...register('username', { required: 'Имя пользователя обязательно' })}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
            </div>
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
