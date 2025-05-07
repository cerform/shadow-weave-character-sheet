
// Этот файл просто содержит необходимые изменения для AppRoutes.tsx

// Добавьте импорты новых страниц
import DMSessionManager from './pages/DMSessionManager';
import JoinGameSession from './pages/JoinGameSession';

// Добавьте эти маршруты в массив routes внутри функции AppRoutes
{
  path: "/dm-session",
  element: <DMSessionManager />
},
{
  path: "/join-game",
  element: <JoinGameSession />
},
