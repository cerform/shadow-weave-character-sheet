
import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Проверяем при первой загрузке
    checkMobile();
    
    // Добавляем слушатель для изменения размера окна
    window.addEventListener('resize', checkMobile);
    
    // Удаляем слушатель при размонтировании
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
};

// Добавляем вспомогательную функцию определения типа устройства
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    // Проверяем при первой загрузке
    checkDeviceType();
    
    // Добавляем слушатель для изменения размера окна
    window.addEventListener('resize', checkDeviceType);
    
    // Удаляем слушатель при размонтировании
    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  return deviceType;
};

export default useIsMobile;
