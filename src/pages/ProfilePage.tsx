
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import IconOnlyNavigation from "@/components/navigation/IconOnlyNavigation";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import BackgroundWrapper from "@/components/layout/BackgroundWrapper";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { currentUser, updateProfile, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Получаем текущую тему для стилизации
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    // Добавляем задержку для проверки состояния авторизации
    const checkAuth = setTimeout(() => {
      setLoading(false);
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to auth page");
        navigate('/auth', { state: { returnPath: '/profile' } });
      }
    }, 1000);

    return () => clearTimeout(checkAuth);
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    console.log("ProfilePage - Current user:", currentUser);
    if (currentUser) {
      setUsername(currentUser.username || currentUser.displayName || "");
      setEmail(currentUser.email || "");
      
      // Используем аватар из URL или генерируем на основе имени пользователя
      if (currentUser.photoURL) {
        setAvatarUrl(currentUser.photoURL);
      } else {
        const seed = currentUser.username || currentUser.email || Math.random().toString();
        setAvatarUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`);
      }
    }
  }, [currentUser]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAvatarUpload = (file: File) => {
    // В реальном приложении здесь будет загрузка на сервер
    // Для примера используем FileReader для отображения превью
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        toast({
          title: "Аватар обновлен",
          description: "Ваш аватар успешно загружен",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (currentUser && updateProfile) {
      updateProfile({
        username,
        photoURL: avatarUrl,
      });
      
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
    }
  };

  // Функция для генерации случайного аватара
  const generateRandomAvatar = () => {
    const styles = ['adventurer', 'big-ears-neutral', 'big-smile', 'bottts', 'croodles', 'lorelei'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const seed = Math.random().toString(36).substring(2, 8);
    const newAvatarUrl = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`;
    
    setAvatarUrl(newAvatarUrl);
    
    toast({
      title: "Новый аватар",
      description: "Случайный аватар сгенерирован",
    });
  };

  if (loading) {
    return (
      <BackgroundWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="ml-4 text-lg">Загрузка профиля...</p>
        </div>
      </BackgroundWrapper>
    );
  }

  if (!currentUser && !loading) {
    return (
      <BackgroundWrapper>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="bg-black/70 backdrop-blur-sm p-8 rounded-xl border border-red-500/50 max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Доступ ограничен</h2>
            <p className="mb-6">Для просмотра профиля необходимо войти в систему</p>
            <Button 
              onClick={() => navigate('/auth', { state: { returnPath: '/profile' } })}
              style={{
                backgroundColor: currentTheme.accent,
              }}
            >
              Войти в систему
            </Button>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button 
              onClick={() => navigate("/")} 
              variant="outline" 
              className="flex items-center gap-2"
              style={{
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              На главную
            </Button>
            <IconOnlyNavigation includeThemeSelector={true} />
          </div>

          <div 
            className="bg-card/30 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 transition-all border"
            style={{
              borderColor: `${currentTheme.accent}50`,
              boxShadow: `0 0 15px ${currentTheme.accent}30`,
              backgroundColor: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.7)'
            }}
          >
            <h1 
              className="text-3xl font-bold mb-6" 
              style={{
                color: currentTheme.accent,
                textShadow: `0 0 10px ${currentTheme.accent}40`
              }}
            >
              Профиль пользователя
            </h1>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
              {/* Аватар с возможностью drag-n-drop */}
              <div className="relative group">
                <div
                  className={`h-32 w-32 rounded-full overflow-hidden border-4 transition-all duration-300 ${
                    isDragging ? "border-primary ring-4" : "hover:ring-2"
                  }`}
                  style={{ 
                    borderColor: currentTheme.accent,
                    boxShadow: `0 0 10px ${currentTheme.accent}50`
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Avatar className="h-full w-full">
                    <AvatarImage src={avatarUrl} className="object-cover" />
                    <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white h-8 w-8" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-xs text-center mt-2 text-muted-foreground">
                    Нажмите или перетащите изображение
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={generateRandomAvatar}
                    size="sm"
                    style={{
                      borderColor: currentTheme.accent,
                      color: currentTheme.textColor
                    }}
                  >
                    Сгенерировать аватар
                  </Button>
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: currentTheme.textColor}}>Имя пользователя</label>
                    <Input 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full"
                      style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', color: currentTheme.textColor}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: currentTheme.textColor}}>Email</label>
                    <Input 
                      type="email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                      disabled
                      style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', color: currentTheme.textColor}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{color: currentTheme.textColor}}>Роль</label>
                    <Input 
                      type="text"
                      value={currentUser?.isDM ? "Мастер Подземелий" : "Игрок"} 
                      className="w-full"
                      disabled
                      style={{backgroundColor: 'rgba(0, 0, 0, 0.3)', color: currentTheme.textColor}}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveProfile} 
                className="flex items-center gap-2"
                style={{
                  backgroundColor: currentTheme.accent,
                  color: '#FFFFFF'
                }}
              >
                <Save className="h-4 w-4" />
                Сохранить изменения
              </Button>
            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default ProfilePage;
