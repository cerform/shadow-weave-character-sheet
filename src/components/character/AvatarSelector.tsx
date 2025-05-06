
import React, { useState, useRef } from "react";
import { Camera, Dices } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Theme } from "@/lib/themes";

interface AvatarSelectorProps {
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  username: string;
  theme: Theme;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  avatarUrl,
  setAvatarUrl,
  username,
  theme
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [avatarStyle, setAvatarStyle] = useState<string>("adventurer");

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

  const generateRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 8);
    const newAvatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${seed}`;
    setAvatarUrl(newAvatarUrl);
    
    toast({
      title: "Новый аватар",
      description: `Сгенерирован аватар в стиле ${getStyleName(avatarStyle)}`,
    });
  };
  
  const getStyleName = (style: string): string => {
    const styles: Record<string, string> = {
      'adventurer': 'Авантюрист',
      'bottts': 'Механизм',
      'avataaars': 'Персонаж',
      'big-smile': 'Улыбка',
      'croodles': 'Кракозябры',
      'lorelei': 'Лорелея',
      'pixelart': 'Пиксельарт',
      'miniavs': 'Минималистичный',
      'open-peeps': 'Человечек',
      'personas': 'Персона'
    };
    
    return styles[style] || style;
  };
  
  const handleStyleChange = (value: string) => {
    setAvatarStyle(value);
    const seed = username || Math.random().toString(36).substring(2, 8);
    setAvatarUrl(`https://api.dicebear.com/7.x/${value}/svg?seed=${seed}`);
  };

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`h-32 w-32 rounded-full overflow-hidden border-4 transition-all duration-300 ${
          isDragging ? "border-primary ring-4" : "hover:ring-2"
        }`}
        style={{ 
          borderColor: theme.accent,
          boxShadow: `0 0 15px ${theme.accent}50`
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
          <AvatarFallback>{username?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
        </Avatar>

        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
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
      
      <div className="mt-4 w-full space-y-2">
        <Select value={avatarStyle} onValueChange={handleStyleChange}>
          <SelectTrigger 
            className="w-full" 
            style={{
              borderColor: theme.accent,
              background: "rgba(0, 0, 0, 0.3)",
              color: theme.textColor
            }}
          >
            <SelectValue placeholder="Выберите стиль" />
          </SelectTrigger>
          <SelectContent style={{ background: "rgba(0, 0, 0, 0.9)", borderColor: theme.accent }}>
            <SelectItem value="adventurer">Авантюрист</SelectItem>
            <SelectItem value="bottts">Механизм</SelectItem>
            <SelectItem value="avataaars">Персонаж</SelectItem>
            <SelectItem value="big-smile">Улыбка</SelectItem>
            <SelectItem value="croodles">Кракозябры</SelectItem>
            <SelectItem value="lorelei">Лорелея</SelectItem>
            <SelectItem value="open-peeps">Человечек</SelectItem>
            <SelectItem value="personas">Персона</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          onClick={generateRandomAvatar}
          size="sm"
          className="w-full flex items-center gap-2"
          style={{
            borderColor: theme.accent,
            color: theme.textColor,
          }}
        >
          <Dices size={16} />
          Случайный аватар
        </Button>
      </div>
    </div>
  );
};
