
// Импортируем из нового местоположения
import { app } from '@/lib/firebase';

// Экспортируем приложение для внутренних сервисов
export { app };

// Реэкспортируем инициализацию аналитики из нового модуля
export { initializeAnalytics, analyticsPromise } from '@/lib/firebase';
