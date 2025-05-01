
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUp, Loader2 } from 'lucide-react';
import { extractCharacterDataFromPdf, convertExtractedDataToCharacter } from '@/utils/pdfImporter';
import { useToast } from '@/components/ui/use-toast';
import { CharacterContext } from '@/contexts/CharacterContext';
import { useTheme } from '@/contexts/ThemeContext';

const PdfCharacterImport: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { setCharacter } = React.useContext(CharacterContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, загрузите файл в формате PDF',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      setUploadProgress(10);

      // Имитация прогресса загрузки
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 300);

      // Извлекаем данные из PDF
      const extractedData = await extractCharacterDataFromPdf(file);
      setUploadProgress(95);
      
      clearInterval(progressInterval);

      // Преобразуем извлеченные данные в формат для нашего приложения
      const characterData = convertExtractedDataToCharacter(extractedData);
      
      // Сохраняем персонажа в контексте
      setCharacter(characterData);
      
      setUploadProgress(100);
      
      // Показываем уведомление об успешной загрузке
      toast({
        title: 'Персонаж импортирован',
        description: `${characterData.name} успешно импортирован из PDF!`,
      });
      
      // Переходим к листу персонажа
      navigate('/sheet');

    } catch (error) {
      console.error('Ошибка загрузки PDF:', error);
      toast({
        title: 'Ошибка импорта',
        description: `Не удалось импортировать персонажа из PDF: ${error}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <Card className={`bg-card/30 backdrop-blur-sm border-primary/20 theme-${theme}`}>
      <CardContent className="pt-6 pb-6">
        <h2 className="text-xl font-semibold mb-4 text-center">Импорт персонажа из PDF</h2>
        
        <div className="flex flex-col items-center">
          <p className="mb-4 text-center text-muted-foreground">
            Загрузите официальный лист персонажа D&D 5 редакции в формате PDF
          </p>
          
          <Button 
            onClick={() => document.getElementById("pdf-char-import")?.click()} 
            variant="outline" 
            className="gap-2 mb-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileUp className="h-4 w-4" /> 
            )}
            {isLoading ? "Импортируем..." : "Выбрать PDF файл"}
          </Button>
          
          <input
            type="file"
            id="pdf-char-import"
            accept=".pdf"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isLoading}
          />

          {isLoading && uploadProgress > 0 && (
            <div className="w-full max-w-xs mb-2">
              <div className="h-2 w-full bg-muted rounded overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-right mt-1 text-muted-foreground">
                {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
          
          <div className="text-xs text-center text-muted-foreground mt-4">
            <p>Поддерживаются официальные листы персонажа D&D 5e</p>
            <p>Некоторые поля могут быть не распознаны автоматически</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfCharacterImport;
