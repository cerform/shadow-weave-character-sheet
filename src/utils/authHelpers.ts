import { auth } from "@/services/firebase";

// Функция для получения ID текущего авторизованного пользователя
export const getCurrentUid = (): string | undefined => {
  const user = auth.currentUser;
  return user ? user.uid : undefined;
};

// Функция для проверки, работает ли приложение в оффлайн-режиме
export const isOfflineMode = (): boolean => {
  const offlineModeEnabled = localStorage.getItem('offline-mode') === 'true';
  return offlineModeEnabled;
};

// Функция для установки оффлайн-режима
export const setOfflineMode = (enabled: boolean): void => {
  localStorage.setItem('offline-mode', enabled.toString());
};
