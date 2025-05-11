import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Camera, Scroll, BookOpen, Shield, Crown, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import IconOnlyNavigation from "@/components/navigation/IconOnlyNavigation";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import BackgroundWrapper from "@/components/layout/BackgroundWrapper";
import { AvatarSelector } from "@/components/character/AvatarSelector";
import { UserProfileCard } from "@/components/character/UserProfileCard";
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
      <div className="min-h-screen px-4 py-8 md:p-6">
        <div className="max-w-6xl mx-auto">
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
            <h1 
              className="text-3xl md:text-4xl font-bold text-center font-cormorant"
              style={{
                color: currentTheme.accent,
                textShadow: `0 0 10px ${currentTheme.accent}40`
              }}
            >
              Профиль искателя приключений
            </h1>
            <IconOnlyNavigation includeThemeSelector={true} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Используем новый компонент UserProfileCard вместо ProfileCard */}
            <UserProfileCard 
              user={currentUser} 
              username={username}
              setUsername={setUsername}
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
            />
            
            {/* Карточка персонажа */}
            <CharacterInfoCard
              characterName={characterName}
              setCharacterName={setCharacterName}
              characterClass={characterClass}
              setCharacterClass={setCharacterClass}
              characterRace={characterRace}
              setCharacterRace={setCharacterRace}
              characterLevel={characterLevel}
              setCharacterLevel={setCharacterLevel}
              characterGuild={characterGuild}
              setCharacterGuild={setCharacterGuild}
              characterBio={characterBio}
              setCharacterBio={setCharacterBio}
              theme={currentTheme}
            />
            
            {/* Карточка достижений */}
            <AchievementsCard currentUser={currentUser} theme={currentTheme} />
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSaveProfile} 
              className="flex items-center gap-2 animate-pulse"
              style={{
                backgroundColor: currentTheme.accent,
                color: '#FFFFFF',
                boxShadow: `0 0 15px ${currentTheme.accent}80`,
              }}
            >
              <Save className="h-4 w-4" />
              Сохранить изменения
            </Button>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default ProfilePage;
