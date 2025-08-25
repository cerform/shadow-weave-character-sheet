import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, ImagePlus, RefreshCw } from 'lucide-react';

interface MonsterImageGeneratorProps {
  onImagesGenerated?: (images: any[]) => void;
}

const MONSTER_CATEGORIES = [
  {
    name: 'Aberration',
    monsters: [
      { name: 'Beholder', description: 'Large floating orb with many eyes and magical beams' },
      { name: 'Mind Flayer', description: 'Tentacle-faced psionic humanoid with purple skin' },
      { name: 'Aboleth', description: 'Ancient aquatic creature with tentacles and slime' },
      { name: 'Rust Monster', description: 'Insectoid creature that rusts metal' }
    ]
  },
  {
    name: 'Beast',
    monsters: [
      { name: 'Dire Wolf', description: 'Large predatory wolf with fierce appearance' },
      { name: 'Owlbear', description: 'Bear-like creature with owl head and feathers' },
      { name: 'Giant Spider', description: 'Massive arachnid with venomous fangs' },
      { name: 'Saber-toothed Tiger', description: 'Prehistoric big cat with large fangs' }
    ]
  },
  {
    name: 'Celestial',
    monsters: [
      { name: 'Solar Angel', description: 'Radiant winged humanoid with golden armor' },
      { name: 'Planetar', description: 'Powerful angel with silver skin and wings' },
      { name: 'Deva Angel', description: 'Beautiful celestial with white wings' },
      { name: 'Unicorn', description: 'Pure white horse with a spiral horn' }
    ]
  },
  {
    name: 'Dragon',
    monsters: [
      { name: 'Ancient Red Dragon', description: 'Massive crimson dragon breathing fire' },
      { name: 'Adult Blue Dragon', description: 'Large blue dragon with lightning breath' },
      { name: 'Young Green Dragon', description: 'Forest dragon with poison breath' },
      { name: 'White Dragon Wyrmling', description: 'Small ice dragon with frost breath' }
    ]
  },
  {
    name: 'Elemental',
    monsters: [
      { name: 'Fire Elemental', description: 'Living flame humanoid with burning body' },
      { name: 'Water Elemental', description: 'Flowing water creature in humanoid shape' },
      { name: 'Earth Elemental', description: 'Rock and stone creature with massive fists' },
      { name: 'Air Elemental', description: 'Swirling wind and cloud formation' }
    ]
  },
  {
    name: 'Fiend',
    monsters: [
      { name: 'Balor Demon', description: 'Massive winged demon with fire whip and sword' },
      { name: 'Pit Fiend Devil', description: 'Large red devil with horns and wings' },
      { name: 'Succubus', description: 'Seductive demon with dark wings' },
      { name: 'Imp', description: 'Small red devil with stinger tail' }
    ]
  },
  {
    name: 'Giant',
    monsters: [
      { name: 'Storm Giant', description: 'Massive humanoid with blue skin and lightning' },
      { name: 'Fire Giant', description: 'Large humanoid with red skin and armor' },
      { name: 'Frost Giant', description: 'Huge humanoid with blue skin and ice weapons' },
      { name: 'Hill Giant', description: 'Primitive giant with club and animal hides' }
    ]
  },
  {
    name: 'Undead',
    monsters: [
      { name: 'Lich', description: 'Skeletal wizard in dark robes with glowing eyes' },
      { name: 'Vampire Lord', description: 'Pale aristocrat with fangs and dark cape' },
      { name: 'Death Knight', description: 'Undead warrior in black plate armor' },
      { name: 'Banshee', description: 'Ghostly woman with flowing hair and mournful wail' }
    ]
  }
];

export function MonsterImageGenerator({ onImagesGenerated }: MonsterImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const generateImagesForCategory = async (categoryName: string) => {
    const category = MONSTER_CATEGORIES.find(c => c.name === categoryName);
    if (!category) return;

    setIsGenerating(true);
    setProgress(0);
    setSelectedCategory(categoryName);

    try {
      toast.info(`Начинаю генерацию изображений для категории "${categoryName}"...`);

      const { data, error } = await supabase.functions.invoke('generate-monster-images', {
        body: {
          monsters: category.monsters,
          category: categoryName
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Ошибка генерации изображений');
      }

      setGeneratedImages(data.images);
      onImagesGenerated?.(data.images);
      
      toast.success(`Успешно сгенерировано ${data.totalGenerated} из ${data.totalRequested} изображений для категории "${categoryName}"`);

    } catch (error: any) {
      console.error('Error generating images:', error);
      toast.error(`Ошибка генерации изображений: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setProgress(100);
    }
  };

  const downloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${fileName.toLowerCase().replace(/\s+/g, '_')}.webp`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Изображение ${fileName} скачано`);
    } catch (error) {
      toast.error('Ошибка скачивания изображения');
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="w-5 h-5" />
            Генерация изображений монстров
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MONSTER_CATEGORIES.map((category) => (
              <Button
                key={category.name}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => generateImagesForCategory(category.name)}
                disabled={isGenerating}
              >
                <span className="font-medium">{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.monsters.length} монстров
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Генерация изображений для категории "{selectedCategory}"
                </span>
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Сгенерированные изображения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {generatedImages.map((image, index) => (
                <div key={index} className="border rounded-lg p-3">
                  {image.imageUrl ? (
                    <div className="space-y-2">
                      <img
                        src={image.imageUrl}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded"
                      />
                      <div className="text-sm font-medium">{image.name}</div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => downloadImage(image.imageUrl, image.name)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Скачать
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-full h-32 bg-red-100 border border-red-300 rounded flex items-center justify-center">
                        <span className="text-red-600 text-sm">Ошибка</span>
                      </div>
                      <div className="text-sm font-medium">{image.name}</div>
                      <div className="text-xs text-red-600">{image.error}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Инструкции:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Выберите категорию монстров для генерации изображений</li>
              <li>Изображения будут сгенерированы с помощью OpenAI GPT Image модели</li>
              <li>Скачайте понравившиеся изображения в локальную папку</li>
              <li>Сохраните изображения в папке <code>src/assets/tokens/</code></li>
              <li>Обновите файлы импорта для использования новых изображений</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}