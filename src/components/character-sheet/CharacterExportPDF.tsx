
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';

interface CharacterExportPDFProps {
  character: Character;
}

const CharacterExportPDF: React.FC<CharacterExportPDFProps> = ({ character }) => {
  const { toast } = useToast();
  
  const handleExport = () => {
    toast({
      title: "PDF Export",
      description: "Экспорт в PDF скоро будет доступен.",
    });
    
    // Вывод в консоль данных персонажа для отладки
    console.log('Экспорт персонажа в PDF:', character);
  };
  
  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <FileDown className="h-4 w-4 mr-2" />
      Экспорт в PDF
    </Button>
  );
};

export default CharacterExportPDF;
