import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';

export function ImportMonstersButton() {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    toast.info('Начинаем импорт монстров из D&D API...');

    try {
      const { data, error } = await supabase.functions.invoke('import-dnd-monsters');
      
      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success(`Импорт завершен! ${data.message}`);
      } else {
        throw new Error(data?.error || 'Неизвестная ошибка');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Ошибка импорта: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Button
      onClick={handleImport}
      disabled={isImporting}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isImporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isImporting ? 'Импорт...' : 'Загрузить Монстров'}
    </Button>
  );
}