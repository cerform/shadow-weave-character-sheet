import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dice6, 
  Scroll, 
  Users, 
  Menu, 
  X,
  Swords,
  BookOpen,
  Home,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const FloatingActionWidget: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Скрываем виджет на определенных страницах
  useEffect(() => {
    const hiddenPaths = ['/auth', '/unauthorized'];
    setIsVisible(!hiddenPaths.includes(location.pathname));
  }, [location.pathname]);

  const quickActions = [
    {
      icon: Home,
      label: 'Главная',
      path: '/',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: User,
      label: 'Персонажи',
      path: '/characters',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      icon: Scroll,
      label: 'Заклинания',
      path: '/spellbook',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      icon: BookOpen,
      label: 'Справочник',
      path: '/handbook',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      icon: Swords,
      label: 'Битва',
      path: '/battle',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    {
      icon: Users,
      label: 'Сессии',
      path: '/dm-dashboard',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20'
    }
  ];

  const handleActionClick = (path: string) => {
    navigate(path);
    setIsExpanded(false);
  };

  if (!isVisible || !isAuthenticated) return null;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-16 right-0 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className={`
                    ${action.bgColor} ${action.color}
                    backdrop-blur-sm border-white/20
                    hover:scale-105 transition-all duration-200
                    shadow-lg hover:shadow-xl
                    min-w-[120px] justify-start gap-2
                  `}
                  onClick={() => handleActionClick(action.path)}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="outline"
        size="sm"
        className={`
          w-12 h-12 rounded-full
          bg-gradient-to-r from-primary/80 to-primary-variant/80
          backdrop-blur-sm border-white/20
          hover:scale-110 transition-all duration-200
          shadow-lg hover:shadow-xl
          ${isExpanded ? 'rotate-45' : 'rotate-0'}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: 45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
};

export default FloatingActionWidget;