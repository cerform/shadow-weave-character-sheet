
import React, { useState, useEffect } from 'react';
import { auth } from '@/services/firebase';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/services/firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';

const FirebaseDebugger: React.FC = () => {
  const [userInfo, setUserInfo] = useState<string | null>(null);
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем информацию о текущем пользователе
  useEffect(() => {
    const getCurrentUser = () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUserInfo(
          JSON.stringify(
            {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName
            },
            null,
            2
          )
        );
      } else {
        setUserInfo('Пользователь не авторизован');
      }
    };

    getCurrentUser();
    
    // Определяем доступные коллекции для тестирования
    setCollections(['characters', 'users', 'spells', 'sessions']);
  }, [isAuthenticated]);

  // Загружаем документы из выбранной коллекции
  const loadDocuments = async (collectionName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      setSelectedCollection(collectionName);
      
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDocuments(docs);
      console.log(`Loaded ${docs.length} documents from ${collectionName}`, docs);
    } catch (error) {
      console.error(`Error loading ${collectionName}:`, error);
      setError(`Ошибка при загрузке коллекции ${collectionName}: ${error}`);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-black/70 text-white">
      <h2 className="text-xl font-bold mb-4">Firebase Debugger</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Текущий пользователь</h3>
        <pre className="bg-black/50 p-3 rounded overflow-auto max-h-40 text-xs">
          {userInfo || 'Загрузка...'}
        </pre>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Коллекции</h3>
        <div className="flex flex-wrap gap-2">
          {collections.map(coll => (
            <button
              key={coll}
              onClick={() => loadDocuments(coll)}
              className={`px-3 py-1 rounded ${
                selectedCollection === coll 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {coll}
            </button>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="my-4 p-2 bg-red-900/50 border border-red-700 rounded">
          {error}
        </div>
      )}
      
      {selectedCollection && documents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Документы в коллекции {selectedCollection} ({documents.length})
          </h3>
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <details 
                key={doc.id || index} 
                className="bg-black/40 rounded border border-gray-700"
              >
                <summary className="p-2 cursor-pointer hover:bg-black/60">
                  ID: {doc.id} 
                  {doc.name && ` | Имя: ${doc.name}`}
                </summary>
                <pre className="p-3 overflow-auto max-h-60 text-xs">
                  {JSON.stringify(doc, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        </div>
      )}
      
      {selectedCollection && documents.length === 0 && !loading && !error && (
        <div className="my-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded">
          В коллекции {selectedCollection} не найдено документов.
        </div>
      )}
    </div>
  );
};

export default FirebaseDebugger;
