
// src/pages/DmPage.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';

// Placeholder component until actual implementations
const PlaceholderComponent = ({ title }: { title: string }) => (
  <Card className="h-64">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Компонент в разработке</p>
    </CardContent>
  </Card>
);

const DMDashboardPage: React.FC = () => {
  return (
    <OBSLayout
      topPanelContent={
        <div className="flex justify-between items-center p-3">
          <h1 className="text-xl font-bold text-yellow-400">DM Dashboard</h1>
          <IconOnlyNavigation includeThemeSelector />
        </div>
      }
    >
      <div className="container mx-auto p-4 space-y-6">
        <Tabs defaultValue="session" className="w-full">
          <TabsList className="grid grid-cols-4 gap-2">
            <TabsTrigger value="session">🎲 Сессия</TabsTrigger>
            <TabsTrigger value="map">🗺️ Карта</TabsTrigger>
            <TabsTrigger value="combat">⚔️ Бой</TabsTrigger>
            <TabsTrigger value="narrative">📖 Сюжет</TabsTrigger>
          </TabsList>

          {/* Session Control */}
          <TabsContent value="session">
            <div className="grid md:grid-cols-2 gap-4">
              <PlaceholderComponent title="Управление сессией" />
              <PlaceholderComponent title="Мониторинг игроков" />
              <PlaceholderComponent title="Кости" />
            </div>
          </TabsContent>

          {/* Map Control */}
          <TabsContent value="map">
            <PlaceholderComponent title="Управление картой" />
            <PlaceholderComponent title="Видеосетка" />
          </TabsContent>

          {/* Combat Tracker */}
          <TabsContent value="combat">
            <div className="grid md:grid-cols-2 gap-4">
              <PlaceholderComponent title="Конструктор сражений" />
              <PlaceholderComponent title="Трекер инициативы" />
              <PlaceholderComponent title="Управление эффектами" />
            </div>
          </TabsContent>

          {/* Narrative Tools */}
          <TabsContent value="narrative">
            <PlaceholderComponent title="Заметки сюжета" />
            <PlaceholderComponent title="Управление таймлайном" />
          </TabsContent>
        </Tabs>
      </div>
    </OBSLayout>
  );
};

export default DMDashboardPage;
