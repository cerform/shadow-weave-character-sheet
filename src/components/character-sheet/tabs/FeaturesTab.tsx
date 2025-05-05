
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Character } from '@/types/character';

interface FeaturesTabProps {
  character: Character | null;
}

// Add features type definition to handle current errors
interface Feature {
  name: string;
  description: string;
  level?: number;
  source?: string;
}

const FeaturesTab: React.FC<FeaturesTabProps> = ({ character }) => {
  const [activeTab, setActiveTab] = useState('class');
  
  // Safety check
  if (!character) {
    return <div>Нет данных персонажа</div>;
  }
  
  // Normalize features data
  const characterFeatures = character.features || [];
  const racialFeatures = character.racialFeatures || [];
  const backgroundFeatures = character.backgroundFeatures || [];
  
  // Function to render feature items
  const renderFeatureItem = (feature: Feature, index: number) => {
    return (
      <Card key={`${feature.name}-${index}`} className="mb-3 bg-card/40">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold">{feature.name}</h3>
          {feature.level && (
            <div className="text-xs text-muted-foreground mb-1">Уровень: {feature.level}</div>
          )}
          {feature.source && (
            <div className="text-xs text-muted-foreground mb-1">Источник: {feature.source}</div>
          )}
          <p className="text-sm mt-2">{feature.description}</p>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="class">Классовые</TabsTrigger>
          <TabsTrigger value="racial">Расовые</TabsTrigger>
          <TabsTrigger value="background">Предыстория</TabsTrigger>
        </TabsList>
        
        <TabsContent value="class">
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="pr-4">
              {characterFeatures.length > 0 ? (
                characterFeatures.map((feature, idx) => renderFeatureItem(feature, idx))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Нет доступных классовых умений
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="racial">
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="pr-4">
              {racialFeatures.length > 0 ? (
                racialFeatures.map((feature, idx) => renderFeatureItem(feature, idx))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Нет доступных расовых умений
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="background">
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="pr-4">
              {backgroundFeatures.length > 0 ? (
                backgroundFeatures.map((feature, idx) => renderFeatureItem(feature, idx))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Нет доступных умений предыстории
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeaturesTab;
