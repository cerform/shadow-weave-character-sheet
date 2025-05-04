
import { useEffect, useState } from 'react';

// Возвращаемые типы устройств
type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Хук для определения типа устройства на основе ширины экрана
export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    // Функция для определения текущего типа устройства
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width <= 640) {
        setDeviceType('mobile');
      } else if (width <= 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    // Вызываем функцию сразу же для инициализации значения
    updateDeviceType();

    // Подписываемся на изменение размера окна
    window.addEventListener('resize', updateDeviceType);

    // Отписываемся при размонтировании компонента
    return () => {
      window.removeEventListener('resize', updateDeviceType);
    };
  }, []);

  return deviceType;
};

// Хук useMediaQuery для более точного контроля над брейкпоинтами
export const useMediaQuery = (query: string): boolean => {
  // Создаем медиа-запрос
  const getMatches = (): boolean => {
    // Проверка на наличие window для SSR
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches());

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Определяем начальное состояние
    setMatches(mediaQuery.matches);

    // Создаем слушатель изменений
    const handleChange = () => {
      setMatches(mediaQuery.matches);
    };

    // Слушаем события для modern browsers
    mediaQuery.addEventListener('change', handleChange);
    
    // Отписываемся при размонтировании
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

export default useDeviceType;
