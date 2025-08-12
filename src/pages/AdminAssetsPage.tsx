import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StorageModelsGallery from '@/components/admin/StorageModelsGallery';
import AssetsCategorizer from '@/components/admin/AssetsCategorizer';

const AdminAssetsPage: React.FC = () => {
  return (
    <main className="container mx-auto p-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Галерея ассетов (Storage models)</h1>
        <p className="text-muted-foreground">Просмотр загруженных в bucket "models" файлов, превью в 3D, копирование ссылок и удаление.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Файлы в bucket models</CardTitle>
        </CardHeader>
        <CardContent>
          <StorageModelsGallery />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Категоризация ассетов (БД)</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetsCategorizer />
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminAssetsPage;
