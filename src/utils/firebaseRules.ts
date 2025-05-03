
/**
 * Утилиты для работы с правилами доступа Firebase
 * 
 * Эти функции помогают отслеживать и соблюдать правила безопасности Firebase
 * для обеспечения правильного доступа к данным.
 */

import { auth } from "@/services/firebase";

/**
 * Проверяет, имеет ли текущий пользователь доступ к указанному ресурсу персонажа
 * @param characterOwnerId ID владельца персонажа
 * @returns true если текущий пользователь имеет доступ
 */
export const canAccessCharacter = (characterOwnerId: string | undefined): boolean => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) return false;
  if (!characterOwnerId) return false;
  
  // Проверяем, является ли текущий пользователь владельцем персонажа
  return currentUser.uid === characterOwnerId;
};

/**
 * Проверяет, имеет ли текущий пользователь доступ к указанной сессии мастера
 * @param dmId ID мастера подземелий для сессии
 * @returns true если текущий пользователь имеет доступ
 */
export const canAccessDMSession = (dmId: string | undefined): boolean => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) return false;
  if (!dmId) return false;
  
  // Проверяем, является ли текущий пользователь мастером для этой сессии
  return currentUser.uid === dmId;
};

/**
 * Добавляет текущего пользователя как владельца для нового объекта
 * @param obj Объект для модификации
 * @returns Объект с добавленным полем userId (если пользователь авторизован)
 */
export const addOwnership = <T extends object>(obj: T): T & { userId?: string } => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) return obj;
  
  return {
    ...obj,
    userId: currentUser.uid
  };
};

/**
 * Получает ID текущего пользователя или null, если пользователь не авторизован
 * @returns ID пользователя или null
 */
export const getCurrentUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};
