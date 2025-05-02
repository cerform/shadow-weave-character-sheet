
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import SpellDatabaseManager from '@/components/spellbook/SpellDatabaseManager';

const SpellbookPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('viewer');

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">D&D 5e Книга заклинаний</h1>
      
      <Tabs defaultValue="viewer" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList>
            <TabsTrigger value="viewer">Просмотр заклинаний</TabsTrigger>
            <TabsTrigger value="manager">Управление базой</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="viewer" className="mt-0">
          <SpellBookViewer />
        </TabsContent>
        
        <TabsContent value="manager" className="mt-0">
          <SpellDatabaseManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpellbookPage;
