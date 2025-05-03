
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Key, Shield, Github, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo = '/' }) => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  
  // Состояние формы
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDM, setIsDM] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) newErrors.email = 'Email обязателен';
    if (!password) newErrors.password = 'Пароль обязателен';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Вход выполнен успешно!');
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(redirectTo);
      }
    } catch (error: any) {
      console.error('Ошибка при входе:', error);
      toast.error(error?.message || 'Неверный email или пароль');
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
        <CardTitle className="text-2xl font-bold">Вход в систему</CardTitle>
        <CardDescription>
          Войдите в свою учетную запись D&D 5e
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isDM" 
              checked={isDM}
              onCheckedChange={(checked) => setIsDM(checked === true)}
            />
            <Label htmlFor="isDM" className="flex items-center gap-2 cursor-pointer">
              <Shield className="h-4 w-4" />
              Войти как Мастер подземелий
            </Label>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              'Войти'
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
          Нет учетной записи?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/register')}>
            Зарегистрироваться
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
