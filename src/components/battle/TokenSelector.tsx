
import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Skull, Crown, Upload, Image as ImageIcon } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';

// Предопределенные аватары для различных типов токенов
const predefinedAvatars = {
  player: [
    "/avatars/player1.png",
    "/avatars/player2.png",
    "/avatars/player3.png",
    "/avatars/player4.png",
    // Используем изображения из загруженных
    "/lovable-uploads/f42db994-ba63-4160-b476-3ec2bb95c207.png",
    "/lovable-uploads/05efd541-6ce2-40b2-9b33-09af3c59e3d5.png"
  ],
  monster: [
    "/avatars/monster1.png",
    "/avatars/monster2.png",
    "/avatars/monster3.png",
    "/avatars/monster4.png",
    "/lovable-uploads/7a062655-27cc-43a9-bc21-fb65a1c04538.png",
    "/lovable-uploads/181e96b3-24be-423e-b0cb-5814a8f72172.png"
  ],
  boss: [
    "/avatars/boss1.png",
    "/avatars/boss2.png",
    "/avatars/boss3.png",
    "/avatars/boss4.png"
  ],
  // Запасные аватары
  fallback: [
    "https://picsum.photos/id/237/200/200",
    "https://picsum.photos/id/238/200/200",
    "https://picsum.photos/id/239/200/200",
    "https://picsum.photos/id/240/200/200",
  ]
};

interface TokenSelectorProps {
  open: boolean;
  onClose: () => void;
  onTokenSelect: (tokenData: {name: string; type: string; img: string}) => void;
  tokenType: "player" | "monster" | "boss";
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ 
  open, 
  onClose, 
  onTokenSelect,
  tokenType = "player" 
}) => {
  const [tokenName, setTokenName] = useState("");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Обработчик выбора файла через input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработчик для drag-n-drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (e.dataTransfer.getData('text').includes('data:image')) {
      // Поддержка drag-n-drop из других источников
      setCustomImage(e.dataTransfer.getData('text'));
    }
  }, []);

  // Предотвращаем стандартное поведение
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-primary');
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-primary');
    }
  }, []);

  // Обработчик клика по кнопке загрузки
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Выбор предопределенного аватара
  const handleAvatarSelect = (avatar: string) => {
    onTokenSelect({
      name: tokenName || `Новый ${tokenType === 'player' ? 'персонаж' : tokenType === 'boss' ? 'босс' : 'монстр'}`,
      type: tokenType,
      img: avatar
    });
    resetForm();
  };

  // Выбор загруженного аватара
  const handleCustomImageSelect = () => {
    if (customImage) {
      onTokenSelect({
        name: tokenName || `Новый ${tokenType === 'player' ? 'персонаж' : tokenType === 'boss' ? 'босс' : 'монстр'}`,
        type: tokenType,
        img: customImage
      });
      resetForm();
    }
  };

  const resetForm = () => {
    setTokenName("");
    setCustomImage(null);
    onClose();
  };

  // Получаем подходящий набор аватаров
  const getAvatars = () => {
    const typeAvatars = predefinedAvatars[tokenType] || [];
    return typeAvatars.length > 0 ? typeAvatars : predefinedAvatars.fallback;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background/95 backdrop-blur sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {tokenType === 'player' ? 'Выберите аватар персонажа' : 
             tokenType === 'boss' ? 'Выберите аватар босса' : 
             'Выберите аватар монстра'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="token-name" className="text-sm font-medium text-foreground">Имя токена</label>
            <Input 
              id="token-name"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="Введите имя токена"
              className="text-foreground"
            />
          </div>

          {/* Зона для drag-n-drop */}
          <div 
            ref={dropZoneRef}
            className="border-2 border-dashed border-border hover:border-primary rounded-md p-6 transition-colors cursor-pointer"
            onClick={handleUploadClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center text-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">
                Перетащите изображение сюда или нажмите для загрузки
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF до 10MB</p>
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Предпросмотр загруженного изображения */}
          {customImage && (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-2">Загруженное изображение:</p>
              <div className="flex justify-center">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={customImage} alt="Загруженный токен" />
                  <AvatarFallback>{tokenType[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="mt-4">
                <Button onClick={handleCustomImageSelect} className="w-full">
                  Выбрать это изображение
                </Button>
              </div>
            </div>
          )}

          {/* Предопределенные аватары */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Или выберите готовый аватар:</p>
            <div className="grid grid-cols-4 gap-2">
              {getAvatars().map((avatar, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className="p-0 h-auto aspect-square overflow-hidden"
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <Avatar className="w-full h-full">
                    <AvatarImage src={avatar} alt={`Аватар ${idx + 1}`} />
                    <AvatarFallback>
                      {tokenType === 'player' ? <User /> : tokenType === 'boss' ? <Crown /> : <Skull />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} className="mt-2 sm:mt-0">
            Отмена
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TokenSelector;
