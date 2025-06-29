
import React, { useState } from "react";
import { UserType } from "@/types/auth";
import { Input } from "@/components/ui/input";
import { themes } from "@/lib/themes";
import { AvatarSelector } from "./AvatarSelector";
import { Shield, Mail } from "lucide-react";

interface ProfileCardProps {
  user: UserType;
  username: string;
  setUsername: (name: string) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  username,
  setUsername,
  avatarUrl,
  setAvatarUrl
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  
  // Use the appropriate theme based on user role
  const themeKey = (user?.isDM ? 'warlock' : 'default') as keyof typeof themes;
  const theme = themes[themeKey] || themes.default;
  
  return (
    <div 
      className="bg-[url('/lovable-uploads/43dc3cd0-ed20-4d92-8064-6ce14d96c90b.png')] bg-cover bg-center rounded-lg border-2 shadow-xl backdrop-blur-sm overflow-hidden"
      style={{ 
        borderColor: 'rgba(139, 90, 43, 0.6)',
        boxShadow: '0 8px 32px rgba(139, 90, 43, 0.3)'
      }}
    >
      <div className="bg-black/60 p-6 backdrop-blur-sm">
        <h2 className="font-cormorant text-3xl mb-6 text-center text-amber-100 drop-shadow-lg">
          Игрок
        </h2>
        
        <div className="flex flex-col items-center gap-6">
          {/* Аватар */}
          <AvatarSelector 
            avatarUrl={avatarUrl} 
            setAvatarUrl={setAvatarUrl} 
            username={username}
            theme={theme}
          />
          
          <div className="w-full space-y-4">
            {isEditingName ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-amber-200">Имя игрока</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/70 border-amber-900/50 text-amber-100"
                  onBlur={() => setIsEditingName(false)}
                  autoFocus
                />
              </div>
            ) : (
              <div 
                className="p-2 rounded cursor-pointer hover:bg-black/30 transition-all"
                onClick={() => setIsEditingName(true)}
              >
                <label className="block text-xs font-medium text-amber-200">Имя игрока</label>
                <p className="text-xl text-white font-bold font-cormorant">
                  {username || user?.displayName || "Безымянный герой"}
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-medium text-amber-200">Email</label>
              <div className="flex items-center gap-2 p-1">
                <Mail size={16} className="text-amber-300" />
                <p className="text-amber-100 opacity-70">{user?.email}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-amber-200">Статус</label>
              <div className="flex items-center gap-2 p-1">
                {user?.isDM ? (
                  <>
                    <Shield size={16} className="text-purple-400" />
                    <p className="text-purple-300">Мастер Подземелий</p>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-green-300">Искатель приключений</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-amber-900/20 border border-amber-900/30 rounded p-3 text-white/80 text-sm">
              <p>Игроки могут видеть ваш профиль и присоединяться к вашим сессиям.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
