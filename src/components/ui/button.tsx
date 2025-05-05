
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary/80 text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background/30 hover:bg-accent/30 hover:text-accent-foreground",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary/90",
        ghost: "hover:bg-accent/30 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Получаем текущую тему
    const { theme } = useTheme();
    const themeKey = (theme || 'default') as keyof typeof themes;
    const currentTheme = themes[themeKey] || themes.default;
    
    // Определяем базовые классы
    const baseClasses = cn(buttonVariants({ variant, size, className }));
    
    // Проверяем класс и содержание кнопки
    const hasDetailsClass = className ? className.includes('Details') : false;
    const isBookButton = props.children &&
      (typeof props.children === 'string' ?
        props.children.toString().toLowerCase().includes('книга') || 
        props.children.toString().toLowerCase().includes('руководство') ||
        props.children.toString().toLowerCase().includes('справочник') : 
        false);
    
    // Проверяем, если это кнопка перейти
    const isNavigateButton = props.children && 
      (typeof props.children === 'string' ? 
        props.children.toString().toLowerCase().includes('перейти') : 
        false);
    
    // Определяем стили с учетом темы
    let buttonStyle: React.CSSProperties = {
      ...props.style
    };
    
    // Устанавливаем цвет текста в зависимости от варианта кнопки
    if (variant === 'default' && !props.style?.color) {
      buttonStyle.color = currentTheme.buttonText || '#FFFFFF';
    }
    
    // Для кнопок с вариантом outline или ghost устанавливаем цвет
    if ((variant === 'outline' || variant === 'ghost')) {
      buttonStyle.color = props.style?.color || currentTheme.textColor || '#FFFFFF';
      buttonStyle.borderColor = props.style?.borderColor || `${currentTheme.accent}`;
    }
    
    // Для кнопок типа "книга" или "руководство"
    if (isBookButton) {
      buttonStyle.borderColor = props.style?.borderColor || currentTheme.accent;
      buttonStyle.color = props.style?.color || currentTheme.textColor || '#FFFFFF';
    }
    
    // Для кнопок "Перейти"
    if (isNavigateButton) {
      buttonStyle.borderColor = props.style?.borderColor || currentTheme.accent;
      buttonStyle.color = props.style?.color || currentTheme.textColor || '#FFFFFF';
    }
    
    // Для кнопок variant=default устанавливаем фон в цвет акцента
    if (variant === 'default' && !props.style?.backgroundColor) {
      buttonStyle.backgroundColor = currentTheme.accent;
    }
    
    // Добавляем тень для текста
    buttonStyle.textShadow = props.style?.textShadow || "0px 1px 2px rgba(0, 0, 0, 0.5)";
    
    // Переменные для hover и focus эффектов
    const hoverGlow = `0 0 10px ${currentTheme.accent}80`;
    const hoverBorderColor = currentTheme.accent;
    const hoverBgColor = `${currentTheme.accent}30`;
    
    // Определяем улучшенные классы для различных типов кнопок
    let enhancedClasses = baseClasses;
    
    if (isBookButton || className?.includes('book') || className?.includes('руководство') || className?.includes('справочник')) {
      enhancedClasses = cn(
        baseClasses,
        "border border-accent/60 hover:shadow-[var(--hover-glow)] focus:shadow-[var(--hover-glow)]",
        "hover:border-[var(--hover-border-color)] hover:bg-[var(--hover-bg-color)]"
      );
    } else if (isNavigateButton) {
      enhancedClasses = cn(
        baseClasses,
        "hover:shadow-[var(--hover-glow)] focus:shadow-[var(--hover-glow)]",
        "hover:border-[var(--hover-border-color)] hover:bg-[var(--hover-bg-color)]"
      );
    } else {
      enhancedClasses = cn(
        baseClasses,
        "hover:shadow-[var(--hover-glow)] focus:shadow-[var(--hover-glow)]",
        variant === 'outline' && "hover:border-[var(--hover-border-color)] hover:bg-[var(--hover-bg-color)]"
      );
    }
    
    // Добавляем CSS переменные для hover эффектов
    buttonStyle['--hover-glow' as any] = hoverGlow;
    buttonStyle['--hover-border-color' as any] = hoverBorderColor;
    buttonStyle['--hover-bg-color' as any] = hoverBgColor;
    
    return (
      <Comp
        className={enhancedClasses}
        ref={ref}
        style={buttonStyle}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
