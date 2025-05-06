
import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Проверяем при монтировании
    checkMobile();
    
    // Добавляем слушатель изменения размера
    window.addEventListener('resize', checkMobile);
    
    // Удаляем слушатель при размонтировании
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
