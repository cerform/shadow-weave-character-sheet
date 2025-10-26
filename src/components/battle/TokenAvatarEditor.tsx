import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { EnhancedToken } from '@/stores/enhancedBattleStore';

interface TokenAvatarEditorProps {
  token: EnhancedToken;
  onUpdate: (updates: Partial<EnhancedToken>) => void;
  trigger?: React.ReactNode;
}

export const TokenAvatarEditor: React.FC<TokenAvatarEditorProps> = ({ 
  token, 
  onUpdate,
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(token.avatarUrl || '');
  const [color, setColor] = useState(token.color || '#22c55e');
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive"
      });
      return;
    }

    // Проверка размера (макс 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 2MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      // Загружаем в Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${token.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vtt-assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('vtt-assets')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      toast({
        title: "Успешно",
        description: "Аватар загружен"
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

  const handleSave = async () => {
    try {
      // Обновляем токен в БД
      const { error } = await supabase
        .from('battle_tokens')
        .update({
          image_url: avatarUrl || null,
          color: color
        })
        .eq('id', token.id);

      if (error) throw error;

      // Обновляем локальный стор
      onUpdate({
        avatarUrl: avatarUrl || undefined,
        color: color
      });

      toast({
        title: "Сохранено",
        description: "Внешний вид токена обновлен"
      });

      setOpen(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Изменить аватар
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Настройка токена: {token.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Предпросмотр */}
          <div className="flex justify-center">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center border-2 overflow-hidden"
              style={{ 
                backgroundColor: avatarUrl ? 'transparent' : color,
                borderColor: color 
              }}
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={token.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl text-white font-bold">
                  {token.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Загрузка изображения */}
          <div className="space-y-2">
            <Label>Аватар</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                disabled={uploading}
                onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {avatarUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAvatarUrl('')}
                className="w-full"
              >
                Удалить аватар
              </Button>
            )}
          </div>

          {/* URL изображения */}
          <div className="space-y-2">
            <Label htmlFor="avatar-url">Или введите URL изображения</Label>
            <Input
              id="avatar-url"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
          </div>

          {/* Цвет токена */}
          <div className="space-y-2">
            <Label htmlFor="token-color">Цвет токена</Label>
            <div className="flex gap-2">
              <Input
                id="token-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#22c55e"
                className="flex-1"
              />
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={uploading}>
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
