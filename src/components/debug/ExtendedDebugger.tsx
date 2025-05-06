
import React from 'react';
import DebugPanel from './DebugPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCharacter } from '@/contexts/CharacterContext';
import { getCurrentUid } from '@/utils/authHelpers';
import { useAuth } from '@/hooks/use-auth';

interface ExtendedDebuggerProps {
  title?: string;
}

const ExtendedDebugger: React.FC<ExtendedDebuggerProps> = ({
  title = 'Расширенный отладчик'
}) => {
  const { characters, loading, error } = useCharacter();
  const { isAuthenticated, user } = useAuth();
  
  // Получаем текущий userId
  const currentUid = getCurrentUid();
  
  // Собираем информацию об окружении
  const environmentInfo = {
    browser: navigator.userAgent,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };
  
  // Собираем информацию об аутентификации
  const authInfo = {
    isAuthenticated,
    user: user ? {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      // Удаляем обращение к отсутствующему свойству providerId
    } : null,
    currentUid,
    uidMatch: user && currentUid ? user.uid === currentUid : false,
  };
  
  // Проверка валидности персонажей
  const validationIssues = [];
  
  if (characters && characters.length > 0) {
    characters.forEach((char, index) => {
      const issues = [];
      
      if (!char.id) issues.push('Отсутствует ID');
      if (!char.name) issues.push('Отсутствует имя');
      if (!char.userId) issues.push('Отсутствует userId');
      if (char.userId && currentUid && char.userId !== currentUid) {
        issues.push(`Несоответствие userId: ${char.userId} vs ${currentUid}`);
      }
      
      // Проверка наличия дублирующих полей
      const charKeys = Object.keys(char);
      const duplicatedFields = charKeys.filter(key => 
        key !== key.toLowerCase() && charKeys.includes(key.toLowerCase())
      );
      
      if (duplicatedFields.length > 0) {
        issues.push(`Дублирующиеся поля: ${duplicatedFields.join(', ')}`);
      }
      
      if (issues.length > 0) {
        validationIssues.push({
          characterIndex: index,
          characterId: char.id || 'unknown',
          characterName: char.name || 'Безымянный',
          issues
        });
      }
    });
  }
  
  // Данные для отладки
  const debugData = {
    characterState: {
      charactersCount: characters ? characters.length : 0,
      isLoading: loading,
      error,
      firstCharacter: characters && characters.length > 0 ? {
        id: characters[0].id,
        name: characters[0].name,
        class: characters[0].class || characters[0].className,
        race: characters[0].race,
        userId: characters[0].userId,
      } : null,
    },
    auth: authInfo,
    validation: {
      hasIssues: validationIssues.length > 0,
      issuesCount: validationIssues.length,
      issues: validationIssues
    },
    environment: environmentInfo
  };
  
  return (
    <Card className="bg-black/30 backdrop-blur-sm border-yellow-500/30 mb-4">
      <CardHeader>
        <CardTitle className="text-yellow-400 flex items-center text-lg">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <DebugPanel 
          title="1. Состояние персонажей" 
          data={debugData.characterState}
          showByDefault={true}
          variant={error ? 'error' : loading ? 'warning' : 'info'}
        />
        
        <DebugPanel 
          title="2. Информация об аутентификации" 
          data={debugData.auth}
          variant={!isAuthenticated ? 'error' : authInfo.uidMatch ? 'info' : 'warning'}
        />
        
        {validationIssues.length > 0 && (
          <DebugPanel 
            title={`3. Проблемы валидации (${validationIssues.length})`}
            data={debugData.validation}
            showByDefault={true}
            variant="error"
          />
        )}
        
        <DebugPanel 
          title="4. Окружение" 
          data={debugData.environment}
        />

        {characters && characters.length > 0 && (
          <DebugPanel 
            title="5. Данные первого персонажа (сырые)" 
            data={characters[0]}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ExtendedDebugger;
