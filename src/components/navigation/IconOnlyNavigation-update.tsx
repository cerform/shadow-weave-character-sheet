
// Этот файл просто содержит необходимые изменения для IconOnlyNavigation.tsx

// Добавьте импорты новых иконок
import { Users, UserPlus } from 'lucide-react';

// Добавьте новые элементы меню в массив menuItems
{
  icon: <Users className="h-5 w-5" />,
  label: "Вести игру",
  href: "/dm-session",
},
{
  icon: <UserPlus className="h-5 w-5" />,
  label: "Присоединиться",
  href: "/join-game",
},
