
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle, Bug } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { getCurrentUid } from '@/utils/authHelpers';
import { validateCharacters } from '@/utils/debugUtils';
import { normalizeCharacterData } from '@/utils/characterNormalizer';
import DebugPanel from './DebugPanel';

interface CharactersPageDebuggerProps {
  title?: string;
}

const CharactersPageDebugger: React.FC<CharactersPageDebuggerProps> = ({
  title = 'Диагностика страницы персонажей'
}) => {
  const [validationReport, setValidationReport] = useState<any>(null);
  const [debugData, setDebugData] = useState<any>({});
  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);
  
  // Получаем данные из контекста персонажей
  const { characters, loading, error, getUserCharacters } = useCharacter();
  
  // Собираем информацию для отладки
  useEffect(() => {
    // Получаем текущий userId
    const currentUid = getCurrentUid();
    
    // Анализируем данные персонажей
    if (characters) {
      const validation = validateCharacters(characters);
      setValidationReport(validation);
      
      // Создаем более детальные данные для отладки
      const debugInfo = {
        page: {
          route: '/characters',
          timestamp: new Date().toISOString(),
        },
        characters: {
          total: Array.isArray(characters) ? characters.length : 'не массив',
          isArray: Array.isArray(characters),
          firstCharacterId: Array.isArray(characters) && characters.length > 0 ? characters[0]?.id : 'нет',
          emptyOrInvalid: !Array.isArray(characters) || characters.length === 0
        },
        firebaseAuth: {
          currentUid,
          isAuthenticated: !!currentUid
        },
        context: {
          loading,
          error: error || 'нет ошибок',
          charactersCount: Array.isArray(characters) ? characters.length : 0
        }
      };
      
      // Если есть персонажи, добавляем информацию о первом
      if (Array.isArray(characters) && characters.length > 0 && characters[0]) {
        const firstChar = characters[0];
        
        // Применяем нормализацию к первому персонажу для анализа
        const normalizedChar = normalizeCharacterData(firstChar);
        
        // Добавляем данные для отладки
        debugInfo.firstCharacter = {
          id: firstChar.id || 'отсутствует',
          name: firstChar.name || 'без имени',
          userId: firstChar.userId || 'отсутствует',
          userIdMatches: firstChar.userId === currentUid,
          hasMissingFields: !firstChar.id || !firstChar.userId || !firstChar.name,
          normalized: {
            hadChanges: JSON.stringify(normalizedChar) !== JSON.stringify(firstChar),
            nameNormalized: normalizedChar.name !== firstChar.name,
            userIdNormalized: normalizedChar.userId !== firstChar.userId
          }
        };
      }
      
      setDebugData(debugInfo);
    }
  }, [characters, loading, error]);
  
  // Собираем ошибки консоли
  useEffect(() => {
    const originalConsoleError = console.error;
    const errors: string[] = [];
    
    console.error = (...args) => {
      // Вызываем оригинальный метод
      originalConsoleError.apply(console, args);
      
      // Добавляем ошибку в массив
      const errorMessage = args.map(arg => 
        typeof arg === 'string' ? arg : 
        arg instanceof Error ? arg.message : 
        JSON.stringify(arg)
      ).join(' ');
      
      errors.push(errorMessage);
      setConsoleErrors([...errors]);
    };
    
    // Восстанавливаем оригинальный метод при размонтировании
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
  
  // Если нет никаких проблем, не отображаем компонент
  if (!error && !validationReport?.issues?.length && consoleErrors.length === 0) {
    return null;
  }
  
  return (
    <Card className="bg-black/30 backdrop-blur-sm border-yellow-500/30 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-yellow-400 flex items-center text-lg gap-2">
          <Bug size={18} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {/* Информация о странице */}
        <DebugPanel 
          title="1. Данные страницы /characters" 
          data={debugData.page || { route: '/characters' }}
          showByDefault={true}
          variant="info"
        />
        
        {/* Состояние контекста */}
        <DebugPanel 
          title="2. Состояние контекста персонажей" 
          data={debugData.context || { loading }}
          variant={error ? 'error' : loading ? 'warning' : 'info'}
          showByDefault={!!error}
        />
        
        {/* Данные авторизации */}
        <DebugPanel 
          title="3. Firebase авторизация" 
          data={debugData.firebaseAuth || {}}
          showByDefault={false}
          variant={debugData.firebaseAuth?.isAuthenticated ? 'info' : 'warning'}
        />
        
        {/* Проблемы с персонажами */}
        {validationReport && !validationReport.valid && (
          <DebugPanel 
            title={`4. Проблемы данных (${validationReport.issues?.length || 0})`}
            data={validationReport}
            showByDefault={true}
            variant="error"
          />
        )}
        
        {/* Ошибки консоли */}
        {consoleErrors.length > 0 && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-md p-3 overflow-auto">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-400" />
              <h4 className="font-medium text-red-300">
                Перехвачено {consoleErrors.length} ошибок консоли
              </h4>
            </div>
            <ul className="space-y-1">
              {consoleErrors.map((err, idx) => (
                <li key={idx} className="text-xs bg-red-950/50 p-2 rounded">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Данные о персонажах */}
        <DebugPanel 
          title="5. Данные о персонажах" 
          data={debugData.characters || {}}
          showByDefault={!!debugData.characters?.emptyOrInvalid}
          variant={
            !debugData.characters?.isArray ? 'error' : 
            debugData.characters?.total === 0 ? 'warning' : 'info'
          }
        />
        
        {/* Данные первого персонажа */}
        {debugData.firstCharacter && (
          <DebugPanel 
            title="6. Первый персонаж" 
            data={debugData.firstCharacter}
            showByDefault={debugData.firstCharacter.hasMissingFields || !debugData.firstCharacter.userIdMatches}
            variant={
              debugData.firstCharacter.hasMissingFields ? 'error' :
              !debugData.firstCharacter.userIdMatches ? 'warning' : 'info'
            }
          />
        )}
        
        {/* Кнопка обновить персонажей */}
        {getUserCharacters && (
          <div className="pt-2">
            <button
              onClick={() => getUserCharacters()}
              className="px-3 py-1 bg-yellow-800/50 hover:bg-yellow-700/50 text-yellow-300 text-xs rounded-md transition-colors"
            >
              Обновить данные персонажей
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CharactersPageDebugger;
