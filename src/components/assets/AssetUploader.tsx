import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileUp, CheckCircle, AlertCircle, Box } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AssetUploaderProps {
  onAssetUploaded?: (asset: any) => void;
}

const AssetUploader: React.FC<AssetUploaderProps> = ({ onAssetUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);

  const supportedFormats = ['.glb', '.gltf', '.fbx', '.obj'];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!supportedFormats.includes(fileExtension)) {
        toast({
          title: "Неподдерживаемый формат",
          description: `Поддерживаемые форматы: ${supportedFormats.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      setFile(selectedFile);
      if (!assetName) {
        setAssetName(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
      setUploadResult(null);
    }
  }, [assetName]);

  const uploadAsset = async () => {
    if (!file || !assetName || !assetCategory) {
      toast({
        title: "Заполните все поля",
        description: "Выберите файл, укажите название и категорию",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      // Создаем уникальное имя файла
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${assetCategory}/${timestamp}_${assetName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
      
      // Загружаем файл в Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('models')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Ошибка загрузки файла: ${uploadError.message}`);
      }

      setUploadProgress(70);

      // Получаем категорию
      const { data: categories } = await supabase
        .from('asset_categories')
        .select('id')
        .eq('key', assetCategory)
        .single();

      if (!categories) {
        throw new Error('Категория не найдена');
      }

      setUploadProgress(85);

      // Создаем запись в базе данных
      const { data: assetData, error: assetError } = await supabase
        .from('assets')
        .insert({
          name: assetName,
          category_id: categories.id,
          storage_path: fileName,
          size_bytes: file.size,
          meta: {
            bucket: 'models',
            original_name: file.name,
            file_type: fileExtension
          },
          approved: true
        })
        .select()
        .single();

      if (assetError) {
        throw new Error(`Ошибка создания записи: ${assetError.message}`);
      }

      setUploadProgress(100);
      setUploadResult({ success: true, message: 'Ассет успешно загружен!' });

      toast({
        title: "Успешно загружено",
        description: `Ассет "${assetName}" добавлен в библиотеку`
      });

      // Очищаем форму
      setFile(null);
      setAssetName('');
      setAssetCategory('');

      if (onAssetUploaded) {
        onAssetUploaded(assetData);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      });
      
      toast({
        title: "Ошибка загрузки",
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5" />
          Загрузка 3D Ассетов
        </CardTitle>
        <CardDescription>
          Загрузите 3D модели для монстров. Поддерживаемые форматы: {supportedFormats.join(', ')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Выберите 3D модель</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              type="file"
              accept={supportedFormats.join(',')}
              onChange={handleFileSelect}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground cursor-pointer"
            />
            <FileUp className="h-4 w-4 text-muted-foreground" />
          </div>
          {file && (
            <div className="text-sm text-muted-foreground">
              Выбран файл: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="asset-name">Название ассета</Label>
          <Input
            id="asset-name"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="Введите название модели"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="asset-category">Категория</Label>
          <Select value={assetCategory} onValueChange={setAssetCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monster">Монстры</SelectItem>
              <SelectItem value="boss">Босы</SelectItem>
              <SelectItem value="character">Персонажи</SelectItem>
              <SelectItem value="structure">Строения</SelectItem>
              <SelectItem value="weapon">Оружие</SelectItem>
              <SelectItem value="armor">Броня</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Загрузка...</span>
              <span className="text-sm">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {uploadResult && (
          <Alert className={uploadResult.success ? "border-green-500" : "border-red-500"}>
            <div className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                {uploadResult.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <Button 
          onClick={uploadAsset}
          disabled={isUploading || !file || !assetName || !assetCategory}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Загрузка...' : 'Загрузить ассет'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AssetUploader;