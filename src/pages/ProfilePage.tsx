
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Camera, Scroll, BookOpen, Shield, Crown, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import IconOnlyNavigation from "@/components/navigation/IconOnlyNavigation";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

import { AvatarSelector } from "@/components/character/AvatarSelector";
import { ProfileCard } from "@/components/character/ProfileCard";
import { CharacterInfoCard } from "@/components/character/CharacterInfoCard";
import { AchievementsCard } from "@/components/character/AchievementsCard";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { currentUser, updateProfile, isAuthenticated } = useAuth();

  const [username, setUsername] = useState<string>("");
  const [characterName, setCharacterName] = useState<string>("");
  const [characterClass, setCharacterClass] = useState<string>("Воин");
  const [characterRace, setCharacterRace] = useState<string>("Человек");
  const [characterLevel, setCharacterLevel] = useState<string>("1");
  const [characterBio, setCharacterBio] = useState<string>("");
  const [characterGuild, setCharacterGuild] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
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
      setCharacterName(currentUser.characterName || currentUser.username || "");
      
      // Используем аватар из URL или генерируем на основе имени пользователя
      if (currentUser.photoURL) {
        setAvatarUrl(currentUser.photoURL);
      } else {
        const seed = currentUser.username || currentUser.email || Math.random().toString();
        setAvatarUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`);
      }
    }
  }, [currentUser]);

  const handleSaveProfile = () => {
    if (currentUser && updateProfile) {
      updateProfile({
        username,
        photoURL: avatarUrl,
        // Добавляем данные о персонаже
        characterName,
        characterClass,
        characterRace,
        characterLevel,
        characterBio,
        characterGuild
      });
      
      toast({
        title: "Профиль обновлен",
        description: "Данные вашего персонажа успешно сохранены",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="ml-4 text-lg">Загрузка профиля...</p>
      </div>
    );
  }

  if (!currentUser && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-black/70 backdrop-blur-sm p-8 rounded-xl border border-red-500/50 max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Доступ ограничен</h2>
          <p className="text-gray-300 mb-6">
            Для доступа к этой странице необходимо войти в систему.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="w-full"
          >
            Войти в систему
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <IconOnlyNavigation />
            <h1 className="text-4xl font-bold text-primary">Профиль игрока</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Просто показываем сообщение о том, что страница находится в разработке */}
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">Профиль игрока</h2>
            <p className="text-muted-foreground">
              Эта страница находится в разработке. Используйте навигацию для доступа к другим функциям.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
