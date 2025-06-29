
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Пользователи
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    throw error;
  }
};

export const updateUserData = async (userId: string, data: any) => {
  try {
    await updateDoc(doc(db, 'users', userId), data);
  } catch (error) {
    console.error('Ошибка обновления данных пользователя:', error);
    throw error;
  }
};

// Персонажи
export const getUserCharacters = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'characters'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Ошибка получения персонажей:', error);
    throw error;
  }
};

export const saveCharacter = async (characterData: any) => {
  try {
    const charRef = doc(collection(db, 'characters'));
    await setDoc(charRef, {
      ...characterData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return charRef.id;
  } catch (error) {
    console.error('Ошибка сохранения персонажа:', error);
    throw error;
  }
};
