import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, User, Heart, Shield, Zap, Swords } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnhancedToken } from '@/stores/enhancedBattleStore';

interface PlayerProfileProps {
  token?: EnhancedToken;
  sessionId: string;
  onAvatarUpdate?: (url: string) => void;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({
  token,
  sessionId,
  onAvatarUpdate
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, загрузите изображение",
          variant: "destructive"
        });
        return;
      }

      setUploading(true);

      // Генерируем уникальное имя файла
      const fileExt = file.name.split('.').pop();
      const fileName = `${sessionId}/${token?.id || 'temp'}-${Date.now()}.${fileExt}`;

      // Загружаем в Supabase Storage
      const { data, error } = await supabase.storage
        .from('vtt-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('vtt-assets')
        .getPublicUrl(fileName);

      // Обновляем токен с новым аватаром
      if (token) {
        await supabase
          .from('battle_tokens')
          .update({ image_url: publicUrl })
          .eq('id', token.id);

        onAvatarUpdate?.(publicUrl);
      }

      toast({
        title: "Успешно",
        description: "Аватар загружен",
      });
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аватар",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Персонаж
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p className="text-sm">Ожидание токена...</p>
        </CardContent>
      </Card>
    );
  }

  const hpPercent = (token.hp / token.maxHp) * 100;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="h-4 w-4" />
          Ваш персонаж
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Аватар */}
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={token.image_url || token.avatarUrl} alt={token.name} />
            <AvatarFallback className="text-2xl">
              {token.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <label htmlFor="avatar-upload">
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              asChild
            >
              <span className="cursor-pointer">
                <Upload className="h-3 w-3 mr-1" />
                {uploading ? 'Загрузка...' : 'Загрузить аватар'}
              </span>
            </Button>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        {/* Имя и класс */}
        <div className="text-center space-y-1">
          <h3 className="font-bold text-lg">{token.name}</h3>
          {token.class && (
            <Badge variant="secondary" className="text-xs">
              {token.class}
            </Badge>
          )}
          {token.level && (
            <Badge variant="outline" className="text-xs ml-1">
              Ур. {token.level}
            </Badge>
          )}
        </div>

        {/* HP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-500" />
              HP
            </span>
            <span className="font-mono font-bold">
              {token.hp}/{token.maxHp}
            </span>
          </div>
          <Progress 
            value={hpPercent} 
            className="h-2"
          />
        </div>

        {/* AC */}
        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
          <span className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-blue-500" />
            Класс брони
          </span>
          <span className="font-bold text-lg">{token.ac}</span>
        </div>

        {/* Скорость */}
        {token.speed && (
          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <span className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              Скорость
            </span>
            <span className="font-bold">{token.speed} фт</span>
          </div>
        )}

        {/* Инициатива */}
        {token.initiative !== undefined && (
          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <span className="flex items-center gap-2 text-sm">
              <Swords className="h-4 w-4 text-orange-500" />
              Инициатива
            </span>
            <span className="font-bold text-lg">{token.initiative}</span>
          </div>
        )}

        {/* Состояния */}
        {token.conditions && token.conditions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Состояния:</p>
            <div className="flex flex-wrap gap-1">
              {token.conditions.map((condition, idx) => (
                <Badge key={idx} variant="destructive" className="text-xs">
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
