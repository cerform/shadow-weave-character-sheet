import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  redirectTo?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ redirectTo = '/' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();
  const { login, register, resetPassword } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
        toast({
          title: "Вход выполнен",
          description: "Вы успешно вошли в систему.",
        });
        navigate(redirectTo);
      } else {
        await register(email, password);
        toast({
          title: "Регистрация успешна",
          description: "Вы успешно зарегистрировались. Теперь можете войти.",
        });
        setIsLogin(true); // Automatically switch to login after registration
      }
    } catch (error: any) {
      toast({
        title: "Ошибка аутентификации",
        description: error.message || "Не удалось войти или зарегистрироваться.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(email);
      toast({
        title: "Сброс пароля",
        description: "Инструкции по сбросу пароля отправлены на вашу электронную почту.",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка сброса пароля",
        description: error.message || "Не удалось сбросить пароль.",
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue={isLogin ? "login" : "register"} className="w-[400px]" onValueChange={(value) => setIsLogin(value === "login")}>
      <TabsList>
        <TabsTrigger value="login">Войти</TabsTrigger>
        <TabsTrigger value="register">Зарегистрироваться</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Войти</Button>
          <Button type="button" variant="link" onClick={handleResetPassword}>
            Забыли пароль?
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="register">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="register-password">Пароль</Label>
            <Input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="display-name">Имя пользователя</Label>
            <Input
              id="display-name"
              type="text"
              placeholder="Имя пользователя"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <Button type="submit">Зарегистрироваться</Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};

export default AuthForm;
