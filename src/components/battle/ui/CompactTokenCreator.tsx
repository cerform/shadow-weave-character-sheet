// Компактный интерфейс создания токенов
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, X } from 'lucide-react';

interface CompactTokenCreatorProps {
  onCreateToken: (tokenData: { name: string; imageUrl: string }) => void;
}

export default function CompactTokenCreator({ onCreateToken }: CompactTokenCreatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleCreate = () => {
    if (tokenName.trim() && imageUrl.trim()) {
      onCreateToken({
        name: tokenName.trim(),
        imageUrl: imageUrl.trim()
      });
      setTokenName('');
      setImageUrl('');
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    setTokenName('');
    setImageUrl('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsExpanded(true)}
        className="h-8 px-3"
        title="Создать токен"
      >
        <Plus className="h-4 w-4 mr-1" />
        Токен
      </Button>
    );
  }

  return (
    <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg min-w-72">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm">Создать токен</h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium">Название</Label>
          <Input
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="Имя токена..."
            className="h-8 text-xs"
          />
        </div>

        <div>
          <Label className="text-xs font-medium">URL изображения</Label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="h-8 text-xs"
          />
        </div>

        {/* Предпросмотр */}
        {imageUrl && (
          <div className="border rounded p-2">
            <img
              src={imageUrl}
              alt="Предпросмотр"
              className="w-8 h-8 rounded mx-auto object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!tokenName.trim() || !imageUrl.trim()}
            className="flex-1 h-8 text-xs"
          >
            Создать
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-8 text-xs"
          >
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
}