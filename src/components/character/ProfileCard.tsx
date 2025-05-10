
import React from 'react';
import { Character } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface ProfileCardProps {
  character: Character;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ character }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Get initials from character name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Custom theme for the profile card
  const cardTheme = {
    accent: currentTheme.accent,
    textColor: currentTheme.textColor,
    background: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.7)',
    foreground: currentTheme.foreground,
    primary: currentTheme.primary,
    cardBackground: currentTheme.cardBackground || 'rgba(0, 0, 0, 0.7)',
    secondary: currentTheme.secondary,
    mutedTextColor: currentTheme.mutedTextColor || '#888888',
    name: 'profile'
  };
  
  return (
    <Card className="overflow-hidden border" style={{ borderColor: cardTheme.accent + '60', background: cardTheme.background }}>
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2" style={{ borderColor: cardTheme.accent }}>
            <AvatarImage src={character.avatar} alt={character.name} />
            <AvatarFallback className="text-lg" style={{ backgroundColor: cardTheme.primary, color: cardTheme.textColor }}>
              {getInitials(character.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: cardTheme.textColor }}>{character.name}</h1>
            <p className="text-sm" style={{ color: cardTheme.mutedTextColor }}>
              {character.race} {character.class || character.className}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Export both as named and default export
export { ProfileCard };
export default ProfileCard;
