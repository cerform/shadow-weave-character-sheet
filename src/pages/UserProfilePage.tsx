
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Save, User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

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
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <IconOnlyNavigation />
          <h1 className="text-3xl font-bold" style={{color: currentTheme.textColor}}>
            Профиль пользователя
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - Основная информация */}
        <div className="space-y-6">
          {/* Основная информация профиля */}
          <div 
            className="rpg-panel p-6"
            style={{ 
              backgroundColor: currentTheme.cardBackground,
              borderColor: currentTheme.borderColor 
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{color: currentTheme.textColor}}>
              Информация профиля
            </h2>
            
            <div className="flex items-center space-x-6 mb-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={currentUser?.photoURL || avatarUrl || ''} alt="Аватар" />
                <AvatarFallback>
                  {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="text-xl font-semibold" style={{color: currentTheme.textColor}}>
                  {currentUser?.displayName || 'Имя не указано'}
                </h3>
                <p style={{color: currentTheme.mutedTextColor}}>
                  {currentUser?.email}
                </p>
                <p className="text-sm" style={{color: currentTheme.mutedTextColor}}>
                  Роль: {currentUser?.role || 'Игрок'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="display_name" style={{color: currentTheme.textColor}}>
                  Отображаемое имя
                </Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  placeholder="Введите ваше имя"
                />
              </div>

              <div>
                <Label htmlFor="bio" style={{color: currentTheme.textColor}}>
                  О себе
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Расскажите о себе..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="avatar_url" style={{color: currentTheme.textColor}}>
                  URL аватара
                </Label>
                <Input
                  id="avatar_url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <Button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    toast({ title: "Профиль сохранен" });
                  }, 1000);
                }}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </div>
          </div>
        </div>

        {/* Правая колонка - Дополнительная информация */}
        <div className="space-y-6">
          {/* Статистика */}
          <div 
            className="rpg-panel p-6"
            style={{ 
              backgroundColor: currentTheme.cardBackground,
              borderColor: currentTheme.borderColor 
            }}
          >
            <h3 className="text-xl font-bold mb-4" style={{color: currentTheme.textColor}}>
              Статистика
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{color: currentTheme.mutedTextColor}}>Дата регистрации:</span>
                <span style={{color: currentTheme.textColor}}>
                  Неизвестно
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{color: currentTheme.mutedTextColor}}>Последнее обновление:</span>
                <span style={{color: currentTheme.textColor}}>
                  Неизвестно
                </span>
              </div>
            </div>
          </div>

          {/* Настройки темы */}
          <div 
            className="rpg-panel p-6"
            style={{ 
              backgroundColor: currentTheme.cardBackground,
              borderColor: currentTheme.borderColor 
            }}
          >
            <h3 className="text-xl font-bold mb-4" style={{color: currentTheme.textColor}}>
              Настройки интерфейса
            </h3>
            <p style={{color: currentTheme.textColor}}>
              Настройка темы доступна через переключатель в правом верхнем углу экрана.
            </p>
            <p style={{color: currentTheme.textColor}}>
              Для загрузки собственного изображения фона перейдите в директорию <code className="bg-black/60 px-2 py-1 rounded">public/lovable-uploads</code> и загрузите изображение. 
              После загрузки вы можете использовать его путь в компоненте фона.
            </p>
            <p style={{color: currentTheme.textColor}}>
              Настройка темы интерфейса доступна через панель в правом верхнем углу.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
