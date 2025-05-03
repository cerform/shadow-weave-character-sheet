
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/user';
import { Shield, Mail, User, Key, Github, Loader2 } from 'lucide-react';

interface RegistrationFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, redirectTo = '/' }) => {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  
  // Состояние формы
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isDM, setIsDM] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) newErrors.email = 'Email обязателен';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Некорректный формат email';
    
    if (!username) newErrors.username = 'Имя пользователя обязательно';
    else if (username.length < 3) newErrors.username = 'Имя должно содержать не менее 3 символов';
    
    if (!password) newErrors.password = 'Пароль обязателен';
    else if (password.length < 6) newErrors.password = 'Пароль должен содержать не менее 6 символов';
    
    if (password !== confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await register(email, password, username, isDM);
      toast.success('Регистрация успешно завершена!');
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(redirectTo);
      }
    } catch (error: any) {
      console.error('Ошибка при регистрации:', error);
      toast.error(error?.message || 'Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };
  
  // Вход через Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleLogin(isDM);
      toast.success('Вход выполнен успешно!');
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(redirectTo);
      }
    } catch (error: any) {
      console.error('Ошибка при входе через Google:', error);
      toast.error(error?.message || 'Не удалось войти через Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
        <CardDescription>
          Создайте новую учетную запись для доступа к D&D 5e
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Имя пользователя
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ваше имя в игре"
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Подтвердите пароль
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isDM" 
              checked={isDM}
              onCheckedChange={(checked) => setIsDM(checked === true)}
            />
            <Label htmlFor="isDM" className="flex items-center gap-2 cursor-pointer">
              <Shield className="h-4 w-4" />
              Я буду Мастером подземелий
            </Label>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              'Зарегистрироваться'
            )}
          </Button>
        </form>
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">
              или
            </span>
          </div>
        </div>
        
        <Button 
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <Github className="mr-2 h-4 w-4" />
          Продолжить с Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>
            Войти
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegistrationForm;
