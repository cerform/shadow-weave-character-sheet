
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { LogIn, UserPlus, AlertCircle, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useConsoleLogger } from '@/hooks/use-console-logger';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthFormProps {
  redirectTo?: string;
}

// Интерфейс для расширенной ошибки аутентификации
interface DetailedAuthError extends Error {
  code?: string;
  fullDetails?: any;
  customData?: {
    email?: string;
    phoneNumber?: string;
    tenantId?: string;
  };
}

const AuthForm: React.FC<AuthFormProps> = ({ redirectTo = '/' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isDM, setIsDM] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<DetailedAuthError | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [popupSupported, setPopupSupported] = useState<boolean | null>(null);
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const logger = useConsoleLogger({ maxPerCategory: 10, allowDuplicates: true });

  // Проверка поддержки всплывающих окон при загрузке
  useEffect(() => {
    checkPopupSupport();
  }, []);

  // Очистка сообщения об ошибке при смене вкладки или успешной аутентификации
  useEffect(() => {
    setAuthError(null);
    setDebugInfo('');
  }, [theme]);

  // Функция для отображения расширенных деталей ошибки
  const getErrorVariant = (error: DetailedAuthError | null) => {
    if (!error) return "default";
    
    // Определяем вариант алерта в зависимости от кода ошибки
    if (error.code?.includes('popup-blocked') || error.code?.includes('popup-closed')) {
      return "warning";
    }
    if (error.code?.includes('unauthorized-domain') || error.code?.includes('internal-error')) {
      return "destructive";
    }
    return "destructive"; // По умолчанию красный для ошибок
  };

  // Функция для получения иконки ошибки
  const getErrorIcon = (error: DetailedAuthError | null) => {
    if (!error) return null;
    
    if (error.code?.includes('popup-blocked') || error.code?.includes('popup-closed')) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    if (error.code?.includes('unauthorized-domain')) {
      return <XCircle className="h-4 w-4" />;
    }
    return <AlertCircle className="h-4 w-4" />;
  };

  // Функция для форматирования деталей ошибки для отображения
  const formatDebugInfo = (error: DetailedAuthError) => {
    let info = '';
    
    if (error.code) {
      info += `Код ошибки: ${error.code}\n`;
    }
    
    if (error.message) {
      info += `Сообщение: ${error.message}\n`;
    }
    
    if (error.fullDetails?.environment) {
      const env = error.fullDetails.environment;
      info += `\nОкружение:\n`;
      info += `Браузер: ${env.userAgent}\n`;
      info += `Домен: ${env.domain}\n`;
      info += `Разрешение: ${env.screenWidth}x${env.screenHeight}\n`;
      info += `Попапы: ${env.hasPopups ? 'разрешены' : 'заблокированы'}\n`;
    }
    
    return info;
  };

  // Функция для проверки поддержки всплывающих окон
  const checkPopupSupport = () => {
    try {
      logger.logInfo("Проверка поддержки всплывающих окон", "auth-env");
      const testPopup = window.open('about:blank', '_blank', 'width=100,height=100');
      if (testPopup) {
        testPopup.close();
        setPopupSupported(true);
        logger.logInfo("Всплывающие окна разрешены", "auth-env");
      } else {
        setPopupSupported(false);
        logger.logWarning("Всплывающие окна заблокированы!", "auth-env");
      }
    } catch (error) {
      logger.logError("Ошибка при проверке всплывающих окон", "auth-env", error);
      setPopupSupported(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setDebugInfo('');

    try {
      logger.logInfo("Начинаем вход по email", "auth-form");
      await login(email, password);
      logger.logInfo("Вход по email выполнен успешно", "auth-form");
      toast({
        title: "Вход выполнен",
        description: "Вы успешно вошли в систему"
      });
      navigate(redirectTo);
    } catch (error: any) {
      logger.logError("Ошибка при входе по email", "auth-form", error);
      setAuthError(error);
      if (error.fullDetails) {
        setDebugInfo(formatDebugInfo(error));
      }
      
      toast({
        title: "Ошибка входа",
        description: error.message || "Не удалось войти в систему",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите имя пользователя",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);
    setDebugInfo('');

    try {
      logger.logInfo("Начинаем регистрацию", "auth-form");
      await register(email, password, displayName, isDM);
      logger.logInfo("Регистрация выполнена успешно", "auth-form");
      toast({
        title: "Регистрация выполнена",
        description: "Вы успешно зарегистрировались"
      });
      navigate(redirectTo);
    } catch (error: any) {
      logger.logError("Ошибка при регистрации", "auth-form", error);
      setAuthError(error);
      if (error.fullDetails) {
        setDebugInfo(formatDebugInfo(error));
      }
      
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Не удалось зарегистрироваться",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Сначала проверяем поддержку попапов
    if (popupSupported === false) {
      const error = new Error("Всплывающие окна заблокированы. Разрешите всплывающие окна для этого сайта и обновите страницу.") as DetailedAuthError;
      error.code = "auth/popup-blocked-detected";
      setAuthError(error);
      toast({
        title: "Всплывающие окна заблокированы",
        description: "Разрешите всплывающие окна для этого сайта в настройках браузера и обновите страницу.",
        variant: "warning"
      });
      return;
    }
    
    // Если не знаем, поддерживаются ли попапы, проверим еще раз
    if (popupSupported === null) {
      checkPopupSupport();
      if (popupSupported === false) {
        return; // выходим, если попапы заблокированы
      }
    }
    
    setIsLoading(true);
    setAuthError(null);
    setDebugInfo('');

    try {
      logger.logInfo("Начинаем вход через Google из AuthForm", "auth-form");
      logger.logInfo(`Текущее окружение: ${window.location.origin}`, "auth-env");
      logger.logInfo(`User Agent: ${navigator.userAgent}`, "auth-env");
      
      // Логируем дополнительную информацию о состоянии браузера
      logger.logInfo(`Поддержка попапов: ${typeof window.open === 'function'}`, "auth-env");
      logger.logInfo(`Размер окна: ${window.innerWidth}x${window.innerHeight}`, "auth-env");
      logger.logInfo(`Экран: ${window.screen.width}x${window.screen.height}`, "auth-env");
      logger.logInfo(`Cookies включены: ${navigator.cookieEnabled}`, "auth-env");
      logger.logInfo(`Браузер мобильный: ${/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}`, "auth-env");
      
      logger.logInfo("Перед вызовом googleLogin()", "auth-form");
      
      const result = await googleLogin();
      
      logger.logInfo("Результат входа через Google:", "auth-form");
      logger.logInfo(JSON.stringify(result), "auth-form");
      
      if (result) {
        logger.logInfo("Google вход успешен, перенаправляем", "auth-form");
        toast({
          title: "Вход выполнен",
          description: "Вы успешно вошли через Google"
        });
        navigate(redirectTo);
      } else {
        logger.logWarning("Вход через Google вернул null результат", "auth-form");
        const nullError = new Error("Сервер вернул пустой ответ при аутентификации через Google. Это может быть связано с проблемами сети, блокировкой cookies или настройками безопасности браузера.") as DetailedAuthError;
        nullError.code = "auth/null-response";
        setAuthError(nullError);
        setDebugInfo("Google авторизация вернула null. Необходимо проверить:");
        setDebugInfo(prev => prev + "\n- Не блокирует ли ваш браузер cookies");
        setDebugInfo(prev => prev + "\n- Разрешены ли всплывающие окна");
        setDebugInfo(prev => prev + "\n- Не блокирует ли сеть запросы к Google");
        setDebugInfo(prev => prev + "\n- Авторизован ли домен в консоли Firebase");
        setDebugInfo(prev => prev + "\n- Включена ли авторизация через Google в Firebase");
        
        toast({
          title: "Вход не завершен",
          description: "Сервер вернул пустой ответ при аутентификации",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      logger.logError("Ошибка при входе через Google", "auth-form", error);
      setAuthError(error);
      
      // Сохраняем расширенную отладочную информацию
      if (error.fullDetails) {
        setDebugInfo(formatDebugInfo(error));
      } else {
        setDebugInfo(`Код ошибки: ${error.code || 'неизвестно'}\nСообщение: ${error.message || 'неизвестно'}`);
      }
      
      const errorMsg = error.message || "Не удалось войти через Google";
      toast({
        title: "Ошибка входа",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Стили для переключателя DM, меняем на более выразительные
  const dmSwitchStyle = {
    '--switch-thumb-color': isDM ? currentTheme.accent : 'white',
    '--switch-background-checked': isDM ? `${currentTheme.accent}50` : 'transparent',
    '--switch-border-checked': isDM ? currentTheme.accent : 'gray'
  } as React.CSSProperties;

  // Определение содержимого для уведомления о всплывающих окнах
  const renderPopupSupportAlert = () => {
    if (popupSupported === false) {
      return (
        <Alert 
          variant="warning"
          className="mb-4"
          icon={<AlertTriangle className="h-4 w-4" />}
        >
          <AlertTitle>Всплывающие окна заблокированы</AlertTitle>
          <AlertDescription>
            Для входа через Google необходимо разрешить всплывающие окна для этого сайта. 
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Найдите иконку блокировки в адресной строке браузера</li>
              <li>Нажмите на нее и выберите "Разрешить всплывающие окна"</li>
              <li>Обновите страницу</li>
            </ol>
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };
  
  // Определение рекомендаций для устранения проблем с Google аутентификацией
  const renderGoogleAuthTroubleshooting = () => {
    if (authError?.code === 'auth/null-response') {
      return (
        <Alert 
          variant="info" 
          className="mt-4"
          icon={<Info className="h-4 w-4" />}
        >
          <AlertTitle>Рекомендации по устранению проблемы</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Включите cookies в настройках браузера</li>
              <li>Убедитесь, что ваш браузер не блокирует Google аутентификацию</li>
              <li>Отключите VPN или прокси, если они используются</li>
              <li>Используйте режим инкогнито или другой браузер</li>
              <li>Очистите кэш и cookies вашего браузера</li>
              <li>Проверьте работу интернет-соединения</li>
              <li>Если вы используете корпоративную сеть, свяжитесь с администратором</li>
            </ul>
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <Card className="w-full shadow-lg border-primary/20 bg-black/60 backdrop-blur-md">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Вход</TabsTrigger>
          <TabsTrigger value="register">Регистрация</TabsTrigger>
        </TabsList>
        
        {/* Проверка поддержки всплывающих окон */}
        {renderPopupSupportAlert()}
        
        {/* Отображение ошибки аутентификации, если есть */}
        {authError && (
          <div className="p-4">
            <Alert 
              variant={getErrorVariant(authError)}
              icon={getErrorIcon(authError)}
              className="mb-4 text-left"
            >
              <AlertTitle className="text-md">
                {authError.code === 'auth/popup-blocked' || authError.code === 'auth/popup-blocked-detected'
                  ? 'Всплывающие окна заблокированы' 
                  : authError.code === 'auth/unauthorized-domain'
                    ? 'Неавторизованный домен'
                    : authError.code === 'auth/null-response'
                      ? 'Сервер вернул пустой ответ'
                      : 'Ошибка авторизации'}
              </AlertTitle>
              <AlertDescription className="mt-2">{authError.message}</AlertDescription>
              
              {/* Подробности ошибки для отладки */}
              {debugInfo && (
                <div className="mt-4 text-xs bg-black/30 p-2 rounded-md overflow-auto max-h-40">
                  <details>
                    <summary className="cursor-pointer font-medium">Подробная информация об ошибке</summary>
                    <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
                  </details>
                </div>
              )}
              
              {/* Советы по устранению ошибок */}
              {(authError.code === 'auth/popup-blocked' || authError.code === 'auth/popup-blocked-detected') && (
                <div className="mt-3 text-sm">
                  <strong>Рекомендации:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>Разрешите всплывающие окна для этого сайта</li>
                    <li>Отключите блокировщики рекламы для этого сайта</li>
                    <li>Попробуйте использовать режим инкогнито</li>
                    <li>После изменения настроек, обновите страницу</li>
                  </ul>
                </div>
              )}
              
              {authError.code === 'auth/unauthorized-domain' && (
                <div className="mt-3 text-sm">
                  <strong>Рекомендации:</strong>
                  <p>Домен {window.location.origin} не авторизован в Firebase. 
                  Администратору необходимо добавить этот домен в список авторизованных доменов в консоли Firebase.</p>
                </div>
              )}
              
              {renderGoogleAuthTroubleshooting()}
            </Alert>
          </div>
        )}
        
        {/* Вкладка входа */}
        <TabsContent value="login" className="space-y-4">
          <CardHeader>
            <CardTitle>Вход в аккаунт</CardTitle>
            <CardDescription>
              Войдите, чтобы получить доступ к своему профилю и персонажам
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Пароль</Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Забыли пароль?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={isLoading}
                style={{
                  backgroundColor: currentTheme.accent,
                  color: currentTheme.buttonText || '#FFFFFF'
                }}
              >
                <LogIn className="h-4 w-4" />
                {isLoading ? "Выполняется вход..." : "Войти"}
              </Button>
            </form>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  или войти через
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading || popupSupported === false}
              style={{
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="h-5 w-5 mr-2"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              {isLoading ? "Авторизация..." : "Войти с Google"}
            </Button>
            
            <Alert variant="info" className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                При использовании входа через Google:
                <ul className="list-disc list-inside mt-1">
                  <li>Разрешите всплывающие окна в браузере</li>
                  <li>Отключите блокировщики рекламы</li>
                  <li>Не закрывайте окно авторизации Google</li>
                  <li>Включите cookies в браузере</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </TabsContent>
        
        {/* Вкладка регистрации */}
        <TabsContent value="register" className="space-y-4">
          <CardHeader>
            <CardTitle>Создание аккаунта</CardTitle>
            <CardDescription>
              Зарегистрируйтесь, чтобы создавать персонажей и присоединяться к игровым сессиям
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Имя пользователя</Label>
                <Input 
                  id="displayName" 
                  type="text" 
                  placeholder="GandalfTheGrey" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input 
                  id="register-email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Пароль</Label>
                <Input 
                  id="register-password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is-dm" 
                  checked={isDM}
                  onCheckedChange={setIsDM}
                  style={dmSwitchStyle}
                  className={`${isDM ? 'border-accent bg-accent/30' : ''} transition-colors`}
                />
                <Label 
                  htmlFor="is-dm" 
                  className={`${isDM ? 'text-accent font-medium' : ''} cursor-pointer transition-colors`}
                  style={{ color: isDM ? currentTheme.accent : undefined }}
                >
                  Я буду Мастером Подземелий
                </Label>
              </div>
              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={isLoading}
                style={{
                  backgroundColor: currentTheme.accent,
                  color: currentTheme.buttonText || '#FFFFFF'
                }}
              >
                <UserPlus className="h-4 w-4" />
                {isLoading ? "Регистрация..." : "Зарегистрироваться"}
              </Button>
            </form>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  или зарегистрироваться через
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading || popupSupported === false}
              style={{
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="h-5 w-5 mr-2"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              {isLoading ? "Авторизация..." : "Регистрация с Google"}
            </Button>
            
            {/* Информация о возможных причинах ошибок */}
            <Alert variant="info" className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Если у вас возникают проблемы с входом через Google:
                <ul className="list-disc list-inside mt-1">
                  <li>Убедитесь, что в вашем браузере разрешены всплывающие окна</li>
                  <li>Отключите блокировщики рекламы</li>
                  <li>Попробуйте использовать другой браузер</li>
                  <li>При входе не закрывайте всплывающее окно Google</li>
                  <li>Убедитесь, что cookies включены в настройках браузера</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </TabsContent>
        
        <CardFooter className="flex flex-col space-y-4 mt-4">
          <p className="px-8 text-center text-sm text-muted-foreground">
            Регистрируясь, вы соглашаетесь с нашими{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Условиями использования
            </a>{" "}
            и{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Политикой конфиденциальности
            </a>
            .
          </p>
        </CardFooter>
      </Tabs>
    </Card>
  );
};

export default AuthForm;
