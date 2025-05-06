
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Theme } from "@/lib/themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scroll } from "lucide-react";

interface CharacterInfoCardProps {
  characterName: string;
  setCharacterName: (name: string) => void;
  characterClass: string;
  setCharacterClass: (characterClass: string) => void;
  characterRace: string;
  setCharacterRace: (race: string) => void;
  characterLevel: string;
  setCharacterLevel: (level: string) => void;
  characterGuild: string;
  setCharacterGuild: (guild: string) => void;
  characterBio: string;
  setCharacterBio: (bio: string) => void;
  theme: Theme;
}

export const CharacterInfoCard: React.FC<CharacterInfoCardProps> = ({
  characterName,
  setCharacterName,
  characterClass,
  setCharacterClass,
  characterRace,
  setCharacterRace,
  characterLevel,
  setCharacterLevel,
  characterGuild,
  setCharacterGuild,
  characterBio,
  setCharacterBio,
  theme
}) => {
  // Классы D&D
  const classes = [
    "Бард", "Варвар", "Воин", "Волшебник", "Друид", "Жрец", 
    "Изобретатель", "Колдун", "Монах", "Паладин", "Плут", "Следопыт"
  ];
  
  // Расы D&D
  const races = [
    "Человек", "Эльф", "Дварф", "Полурослик", "Гном", "Полуорк", 
    "Полуэльф", "Тифлинг", "Драконорожденный", "Табакси", "Голиаф", "Аасимар"
  ];
  
  // Уровни персонажа
  const levels = Array.from({ length: 20 }, (_, i) => (i + 1).toString());
  
  // Гильдии
  const guilds = [
    "Арфисты", "Изумрудный Анклав", "Жентарим", "Орден Перчатки", 
    "Альянс Лордов", "Культ Дракона", "Арканум Магов", "Гильдия Воров"
  ];
  
  return (
    <div 
      className="bg-[url('/lovable-uploads/05efd541-6ce2-40b2-9b33-09af3c59e3d5.png')] bg-cover bg-center rounded-lg border-2 shadow-xl backdrop-blur-sm"
      style={{ 
        borderColor: 'rgba(139, 90, 43, 0.6)',
        boxShadow: '0 8px 32px rgba(139, 90, 43, 0.3)'
      }}
    >
      <div className="bg-black/60 p-6 backdrop-blur-sm h-full">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Scroll className="h-6 w-6 text-amber-300" />
          <h2 className="font-cormorant text-3xl text-center text-amber-100 drop-shadow-lg">
            Персонаж
          </h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-1">Имя персонажа</label>
            <Input 
              value={characterName} 
              onChange={(e) => setCharacterName(e.target.value)}
              className="w-full bg-black/70 border-amber-900/50 text-amber-100"
              placeholder="Введите имя персонажа"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-200 mb-1">Класс</label>
              <Select value={characterClass} onValueChange={setCharacterClass}>
                <SelectTrigger className="bg-black/70 border-amber-900/50 text-amber-100">
                  <SelectValue placeholder="Выберите класс" />
                </SelectTrigger>
                <SelectContent style={{ background: "rgba(0, 0, 0, 0.9)", borderColor: theme.accent }}>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-amber-200 mb-1">Раса</label>
              <Select value={characterRace} onValueChange={setCharacterRace}>
                <SelectTrigger className="bg-black/70 border-amber-900/50 text-amber-100">
                  <SelectValue placeholder="Выберите расу" />
                </SelectTrigger>
                <SelectContent style={{ background: "rgba(0, 0, 0, 0.9)", borderColor: theme.accent }}>
                  {races.map(race => (
                    <SelectItem key={race} value={race}>{race}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-200 mb-1">Уровень</label>
              <Select value={characterLevel} onValueChange={setCharacterLevel}>
                <SelectTrigger className="bg-black/70 border-amber-900/50 text-amber-100">
                  <SelectValue placeholder="Выберите уровень" />
                </SelectTrigger>
                <SelectContent style={{ background: "rgba(0, 0, 0, 0.9)", borderColor: theme.accent }}>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-amber-200 mb-1">Гильдия/Фракция</label>
              <Select value={characterGuild} onValueChange={setCharacterGuild}>
                <SelectTrigger className="bg-black/70 border-amber-900/50 text-amber-100">
                  <SelectValue placeholder="Выберите гильдию" />
                </SelectTrigger>
                <SelectContent style={{ background: "rgba(0, 0, 0, 0.9)", borderColor: theme.accent }}>
                  {guilds.map(guild => (
                    <SelectItem key={guild} value={guild}>{guild}</SelectItem>
                  ))}
                  <SelectItem value="custom">Другое...</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-1">Биография персонажа</label>
            <Textarea 
              value={characterBio} 
              onChange={(e) => setCharacterBio(e.target.value)}
              className="w-full bg-black/70 border-amber-900/50 text-amber-100 min-h-[150px]"
              placeholder="Опишите историю вашего героя..."
            />
          </div>
          
          <div className="p-3 bg-amber-900/30 border border-amber-900/50 rounded-md">
            <p className="text-amber-200 text-sm">
              Используйте эту информацию для создания ролевого образа вашего персонажа. 
              Эти данные будут видны другим игрокам во время игровых сессий.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
