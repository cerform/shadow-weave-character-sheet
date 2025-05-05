
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Save, User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BackgroundWrapper from "@/components/layout/BackgroundWrapper";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import IconOnlyNavigation from "@/components/navigation/IconOnlyNavigation";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { currentUser, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Получаем текущую тему для стилизации
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || currentUser.displayName || "");
      setEmail(currentUser.email || "");
      setBio(""); // Био можно добавить в будущем в профиль пользователя
      
      // Если у пользователя нет аватара, генерируем на основе имени
      // Используем DiceBear API для генерации аватаров в стиле D&D
      if (!currentUser.photoURL) {
        const seed = currentUser.username || currentUser.email || Math.random().toString();
        setAvatarUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`);
      } else {
        setAvatarUrl(currentUser.photoURL);
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
    if (currentUser) {
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

  // Функция для выбора случайного аватара из набора
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

  return (
    <BackgroundWrapper>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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
            <h1 
              className="text-3xl font-bold font-philosopher"
              style={{color: currentTheme.accent, textShadow: `0 0 10px ${currentTheme.accent}60`}}
            >
              Профиль игрока
            </h1>
          </div>
          <IconOnlyNavigation includeThemeSelector={true} />
        </div>

        <div 
          className="bg-black/50 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-6 border"
          style={{
            borderColor: `${currentTheme.accent}50`,
            boxShadow: `0 0 15px ${currentTheme.accent}30`
          }}
        >
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Аватар с возможностью drag-n-drop */}
            <div className="relative group mx-auto md:mx-0">
              <div
                className={`h-40 w-40 rounded-full overflow-hidden border-4 transition-all duration-300 ${
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
              <div className="flex flex-col gap-2 mt-4 text-center">
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

            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{color: currentTheme.textColor}}>Имя пользователя</label>
                  <Input 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/50"
                    placeholder="Введите имя пользователя"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{color: currentTheme.textColor}}>Email</label>
                  <Input 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{color: currentTheme.textColor}}>О себе</label>
                  <Textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-black/50"
                    placeholder="Расскажите о своих приключениях..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 mt-6">
            <h2 className="text-xl font-semibold mb-4" style={{color: currentTheme.accent}}>Настройки учетной записи</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium" style={{color: currentTheme.textColor}}>Оповещения</label>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input type="checkbox" className="sr-only" />
                    <div className="w-12 h-6 bg-gray-700 rounded-full"></div>
                    <div className="absolute w-6 h-6 bg-white rounded-full transform -translate-y-1/2 top-1/2 left-1"></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Получать уведомления о событиях</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium" style={{color: currentTheme.textColor}}>Публичный профиль</label>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input type="checkbox" className="sr-only" />
                    <div className="w-12 h-6 bg-gray-700 rounded-full"></div>
                    <div className="absolute w-6 h-6 bg-white rounded-full transform -translate-y-1/2 top-1/2 left-1"></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Сделать профиль видимым для других</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSaveProfile} 
              className="flex items-center gap-2"
              style={{
                backgroundColor: currentTheme.accent
              }}
            >
              <Save className="h-4 w-4" />
              Сохранить изменения
            </Button>
          </div>
        </div>

        <div 
          className="bg-black/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border"
          style={{
            borderColor: `${currentTheme.accent}50`,
            boxShadow: `0 0 15px ${currentTheme.accent}30`
          }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{color: currentTheme.accent}}>Информация</h2>
          <div className="space-y-4 text-sm">
            <p style={{color: currentTheme.textColor}}>
              Здесь вы можете изменить настройки своего профиля, выбрать аватар и настроить тему отображения.
            </p>
            <p style={{color: currentTheme.textColor}}>
              Для загрузки собственного изображения фона перейдите в директорию <code className="bg-black/60 px-2 py-1 rounded">public/lovable-uploads</code> и загрузите изображение. 
              После загрузки вы можете использовать его путь в <code className="bg-black/60 px-2 py-1 rounded">BackgroundWrapper.tsx</code>.
            </p>
            <p style={{color: currentTheme.textColor}}>
              Настройка темы интерфейса доступна через панель в правом верхнем углу.
            </p>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default UserProfilePage;
