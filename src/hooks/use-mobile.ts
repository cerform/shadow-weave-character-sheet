
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

export default useIsMobile;
