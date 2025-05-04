
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Функция для определения мобильного устройства
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Проверяем сразу при загрузке
    checkMobile()
    
    // И добавляем слушатель события для изменения размера окна
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Расширенный хук для определения типа устройства (телефон, планшет, десктоп)
export function useDeviceType() {
  const [deviceType, setDeviceType] = React.useState<"mobile" | "tablet" | "desktop">("desktop")

  React.useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType("mobile")
      } else if (width >= 768 && width < 1024) {
        setDeviceType("tablet")
      } else {
        setDeviceType("desktop")
      }
    }
    
    checkDeviceType()
    
    // Добавляем слушатель события для изменения размера окна
    const resizeHandler = () => {
      checkDeviceType()
    }
    
    window.addEventListener("resize", resizeHandler)
    return () => window.removeEventListener("resize", resizeHandler)
  }, [])

  return deviceType
}

// Хук для проверки ориентации устройства
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">(
    typeof window !== "undefined" 
      ? window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      : "portrait"
  )

  React.useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      )
    }

    // Проверяем ориентацию при монтировании
    handleOrientationChange()
    
    window.addEventListener("resize", handleOrientationChange)
    
    // В современных браузерах событие orientationchange устарело
    if (typeof window.orientation !== 'undefined') {
      window.addEventListener("orientationchange", handleOrientationChange)
    }

    return () => {
      window.removeEventListener("resize", handleOrientationChange)
      if (typeof window.orientation !== 'undefined') {
        window.removeEventListener("orientationchange", handleOrientationChange)
      }
    }
  }, [])

  return orientation
}
