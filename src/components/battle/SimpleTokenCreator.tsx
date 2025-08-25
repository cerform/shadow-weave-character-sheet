import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Link, Image, Users, User } from "lucide-react";
import { toast } from "sonner";

interface SimpleTokenCreatorProps {
  onCreateToken: (tokenData: {
    name: string;
    type: 'PC' | 'NPC' | 'monster';
    imageUrl?: string;
    hp: number;
    maxHp: number;
    ac: number;
    speed: number;
  }) => void;
  onClose?: () => void;
}

export default function SimpleTokenCreator({ onCreateToken, onClose }: SimpleTokenCreatorProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'PC' | 'NPC' | 'monster'>('NPC');
  const [imageUrl, setImageUrl] = useState('');
  const [hp, setHp] = useState(10);
  const [maxHp, setMaxHp] = useState(10);
  const [ac, setAc] = useState(10);
  const [speed, setSpeed] = useState(30);
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    try {
      // Создаём URL для файла
      const imageUrl = URL.createObjectURL(file);
      setImageUrl(imageUrl);
      toast.success('Изображение загружено');
    } catch (error) {
      toast.error('Ошибка загрузки изображения');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Введите имя токена');
      return;
    }

    if (hp <= 0 || maxHp <= 0) {
      toast.error('HP должно быть больше 0');
      return;
    }

    onCreateToken({
      name: name.trim(),
      type,
      imageUrl: imageUrl || undefined,
      hp,
      maxHp,
      ac,
      speed
    });

    // Сброс формы
    setName('');
    setImageUrl('');
    setHp(10);
    setMaxHp(10);
    setAc(10);
    setSpeed(30);
    
    toast.success('Токен создан');
    onClose?.();
  };

  const getTypeIcon = (tokenType: string) => {
    switch (tokenType) {
      case 'PC':
        return <User className="w-4 h-4" />;
      case 'NPC':
        return <Users className="w-4 h-4" />;
      case 'monster':
        return <span className="w-4 h-4 text-red-500">👹</span>;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Создать токен
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Имя токена */}
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите имя персонажа"
              required
            />
          </div>

          {/* Тип токена */}
          <div className="space-y-2">
            <Label>Тип</Label>
            <Select value={type} onValueChange={(value: 'PC' | 'NPC' | 'monster') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PC">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('PC')} Игрок (PC)
                  </div>
                </SelectItem>
                <SelectItem value="NPC">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('NPC')} НИП (NPC)
                  </div>
                </SelectItem>
                <SelectItem value="monster">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('monster')} Монстр
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Изображение */}
          <div className="space-y-2">
            <Label>Изображение</Label>
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant={imageSource === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageSource('url')}
              >
                <Link className="w-4 h-4 mr-1" />
                URL
              </Button>
              <Button
                type="button"
                variant={imageSource === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageSource('upload')}
              >
                <Upload className="w-4 h-4 mr-1" />
                Файл
              </Button>
            </div>

            {imageSource === 'url' ? (
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            ) : (
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            )}

            {/* Превью изображения */}
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Превью токена"
                  className="w-16 h-16 object-cover rounded border"
                  onError={() => {
                    toast.error('Не удалось загрузить изображение');
                    setImageUrl('');
                  }}
                />
              </div>
            )}
          </div>

          {/* Характеристики */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hp">HP</Label>
              <Input
                id="hp"
                type="number"
                min="1"
                value={hp}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setHp(value);
                  if (value > maxHp) setMaxHp(value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxHp">Макс HP</Label>
              <Input
                id="maxHp"
                type="number"
                min="1"
                value={maxHp}
                onChange={(e) => setMaxHp(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ac">AC</Label>
              <Input
                id="ac"
                type="number"
                min="1"
                value={ac}
                onChange={(e) => setAc(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speed">Скорость</Label>
              <Input
                id="speed"
                type="number"
                min="0"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Создать токен
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}