
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Save, User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { currentUser, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Получаем текущую тему для стилизации
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setEmail(currentUser.email || "");
      // Используем аватар из URL или генерируем на основе имени пользователя
      setAvatarUrl(
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser?.username}`
      );
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
      updateUser({
        ...currentUser,
        username,
        email
      });
      
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
    }
  };

  return (
    <div 
      className="min-h-screen p-6 bg-gradient-to-br from-background to-background/80"
      style={{ 
        background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`,
        color: currentTheme.textColor
      }}
    >
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
          <ThemeSelector />
        </div>

        <div 
          className="bg-card/30 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 transition-all border"
          style={{
            borderColor: `${currentTheme.accent}50`,
            boxShadow: `0 0 15px ${currentTheme.accent}30`
          }}
        >
          <h1 className="text-2xl font-bold mb-6">Профиль пользователя</h1>
          
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
              <p className="text-xs text-center mt-2 text-muted-foreground">
                Нажмите или перетащите изображение
              </p>
            </div>

            <div className="flex-1 w-full">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Имя пользователя</label>
                  <Input 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
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
                backgroundColor: currentTheme.accent
              }}
            >
              <Save className="h-4 w-4" />
              Сохранить изменения
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
