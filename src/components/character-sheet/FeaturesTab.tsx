
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface FeaturesTabProps {
  character: any;
  isDM?: boolean;
}

const FeaturesTab: React.FC<FeaturesTabProps> = ({ character, isDM = false }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDescription, setNewFeatureDescription] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Get character features
  const features = character?.features || [];

  // Add a new feature
  const addFeature = () => {
    // This is just a placeholder, actual implementation would update the character
    console.log('Add feature:', { name: newFeatureName, description: newFeatureDescription });
    setNewFeatureName('');
    setNewFeatureDescription('');
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold" style={{ color: currentTheme.textColor }}>
          Особенности и черты
        </h2>
        
        {isDM && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить особенность</DialogTitle>
                <DialogDescription>
                  Создайте новую особенность или черту для персонажа
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Название
                  </label>
                  <Input
                    id="name"
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    placeholder="Название особенности"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Описание
                  </label>
                  <Textarea
                    id="description"
                    value={newFeatureDescription}
                    onChange={(e) => setNewFeatureDescription(e.target.value)}
                    placeholder="Описание особенности"
                    rows={5}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={addFeature}>Добавить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {features.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          Особенностей не добавлено
        </div>
      ) : (
        <div className="space-y-3">
          {features.map((feature: string, index: number) => (
            <Card key={index}>
              <CardHeader className="py-3">
                <CardTitle className="text-md">{feature}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturesTab;
