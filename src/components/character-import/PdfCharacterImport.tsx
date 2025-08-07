
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUp, Loader2, AlertCircle, Info } from 'lucide-react';
import { extractCharacterDataFromPdf, convertExtractedDataToCharacter } from '@/utils/pdfImporter';
import { useToast } from '@/hooks/use-toast';
import { useCharacter } from '@/contexts/CharacterContext';
import { useTheme } from '@/hooks/use-theme';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PdfCharacterImport: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importedData, setImportedData] = useState<any>(null);
  const { setCharacter } = useCharacter();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Сбрасываем ошибку при новой попытке
    setErrorMessage(null);
    setImportedData(null);

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
      
      // Сохраняем данные для проверки
      setImportedData(characterData);
      
      setUploadProgress(100);
      
      // Показываем уведомление об успешной загрузке
      toast({
        title: 'Персонаж проанализирован',
        description: `${characterData.name || 'Персонаж'} успешно импортирован. Проверьте данные перед продолжением.`,
      });
      
    } catch (error) {
      console.error('Ошибка загрузки PDF:', error);
      const errorMsg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setErrorMessage(errorMsg);
      toast({
        title: 'Ошибка импорта',
        description: `Не удалось импортировать персонажа из PDF`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };
  
  const handleConfirmImport = () => {
    if (importedData) {
      setCharacter(importedData);
      navigate('/sheet');
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
          
          {!importedData && (
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
          )}
          
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
          
          {errorMessage && (
            <div className="w-full p-3 my-2 bg-destructive/10 border border-destructive rounded-md">
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <h4 className="font-medium">Ошибка импорта</h4>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {importedData && (
            <div className="w-full mt-4">
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Проверьте данные персонажа перед импортом. Некоторые поля могли быть определены неточно.
                </AlertDescription>
              </Alert>
              
              <div className="mb-4 p-4 border rounded-md space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Имя:</div>
                  <div>{importedData.name}</div>
                  
                  <div className="font-semibold">Раса:</div>
                  <div>{importedData.race}</div>
                  
                  <div className="font-semibold">Класс:</div>
                  <div>{importedData.className}</div>
                  
                  <div className="font-semibold">Уровень:</div>
                  <div>{importedData.level}</div>
                  
                  <div className="font-semibold">Здоровье:</div>
                  <div>{importedData.maxHp}</div>
                  
                  <div className="font-semibold">Мировоззрение:</div>
                  <div>{importedData.alignment}</div>
                </div>
                
                <div className="font-semibold mt-2">Характеристики:</div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Object.entries(importedData.abilities).map(([key, value]: [string, any]) => (
                    <div key={key} className="text-center p-1 border rounded">
                      <div className="text-xs text-muted-foreground">{key}</div>
                      <div className="font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setImportedData(null);
                  }}
                >
                  Выбрать другой файл
                </Button>
                <Button 
                  onClick={handleConfirmImport}
                >
                  Продолжить с этим персонажем
                </Button>
              </div>
            </div>
          )}
          
          {!importedData && (
            <div className="text-xs text-center text-muted-foreground mt-4">
              <p>Поддерживаются официальные листы персонажа D&D 5e</p>
              <p>После импорта вы сможете проверить и отредактировать данные</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfCharacterImport;
