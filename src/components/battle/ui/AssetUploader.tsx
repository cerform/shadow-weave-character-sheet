import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Link, Image } from 'lucide-react';

interface AssetUploaderProps {
  onAssetAdd: (name: string, url: string) => void;
  onMapAdd: (url: string) => void;
}

export default function AssetUploader({ onAssetAdd, onMapAdd }: AssetUploaderProps) {
  const [assetUrl, setAssetUrl] = useState('');
  const [assetName, setAssetName] = useState('');
  const [mapUrl, setMapUrl] = useState('');

  const handleAddAsset = () => {
    if (assetUrl && assetName) {
      onAssetAdd(assetName, assetUrl);
      setAssetUrl('');
      setAssetName('');
    }
  };

  const handleAddMap = () => {
    if (mapUrl) {
      onMapAdd(mapUrl);
      setMapUrl('');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Image className="w-4 h-4" />
            Добавить токен по ссылке
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="asset-name">Название токена</Label>
            <Input
              id="asset-name"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="Гоблин, Орк, Дракон..."
              className="text-xs"
            />
          </div>
          <div>
            <Label htmlFor="asset-url">Ссылка на изображение</Label>
            <Input
              id="asset-url"
              value={assetUrl}
              onChange={(e) => setAssetUrl(e.target.value)}
              placeholder="https://example.com/image.png"
              className="text-xs"
            />
          </div>
          <Button 
            onClick={handleAddAsset}
            disabled={!assetUrl || !assetName}
            size="sm"
            className="w-full"
          >
            <Upload className="w-3 h-3 mr-1" />
            Добавить токен
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Link className="w-4 h-4" />
            Загрузить карту по ссылке
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="map-url">Ссылка на карту</Label>
            <Input
              id="map-url"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="https://example.com/map.jpg"
              className="text-xs"
            />
          </div>
          <Button 
            onClick={handleAddMap}
            disabled={!mapUrl}
            size="sm"
            className="w-full"
          >
            <Upload className="w-3 h-3 mr-1" />
            Загрузить карту
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}