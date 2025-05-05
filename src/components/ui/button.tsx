
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/UserThemeContext"
import { themes } from "@/lib/themes"

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
    const { activeTheme } = useTheme();
    // Добавляем защиту от undefined
    const themeKey = (activeTheme || 'default') as keyof typeof themes;
    const currentTheme = themes[themeKey] || themes.default;
    
    // Получаем базовые классы кнопки
    const baseClasses = cn(buttonVariants({ variant, size, className }));
    
    // Исправляем проверку класса Details - без обращения к props.className
    const hasDetailsClass = className ? className.includes('Details') : false;
    
    // Проверяем, содержит ли текст кнопки текст "книга" или "руководство"
    const isBookButton = props.children && 
      (typeof props.children === 'string' ? 
        props.children.toLowerCase().includes('книга') || props.children.toLowerCase().includes('руководство') : 
        false);
    
    // Улучшаем подсветку для всех кнопок
    const style = {
      ...props.style,
      color: variant === 'ghost' && hasDetailsClass
        ? '#FFFFFF' 
        : variant === 'default' 
          ? currentTheme.buttonText || '#FFFFFF' 
          : props.style?.color || currentTheme.buttonText || '#FFFFFF',
      borderColor: (variant === 'outline' || isBookButton)
        ? props.style?.borderColor || currentTheme.accent 
        : props.style?.borderColor,
      backgroundColor: variant === 'default' && !props.style?.backgroundColor 
        ? currentTheme.accent 
        : props.style?.backgroundColor,
      textShadow: "0px 1px 2px rgba(0, 0, 0, 0.5)", // Добавляем тень для всех кнопок
      // Добавим эффекты при наведении через CSS переменные
      '--hover-glow': `0 0 10px ${currentTheme.accent}80`,
      '--hover-border-color': currentTheme.accent,
      '--hover-bg-color': `${currentTheme.accent}30`,
    };
    
    // Проверяем, является ли это кнопкой для книги заклинаний или руководства игрока
    // и добавляем дополнительные стили для кнопок книги заклинаний или руководства
    let enhancedClasses = baseClasses;
    
    if (isBookButton || (className && (className.includes('book') || className.includes('руководство')))) {
      enhancedClasses = cn(
        baseClasses,
        "border border-accent/60 hover:shadow-[var(--hover-glow)] focus:shadow-[var(--hover-glow)]",
        "hover:border-[var(--hover-border-color)] hover:bg-[var(--hover-bg-color)]"
      );
    } else {
      // Добавляем дополнительные классы для всех остальных кнопок
      enhancedClasses = cn(
        baseClasses,
        "hover:shadow-[var(--hover-glow)] focus:shadow-[var(--hover-glow)]",
        variant === 'outline' && "hover:border-[var(--hover-border-color)] hover:bg-[var(--hover-bg-color)]"
      );
    }
    
    return (
      <Comp
        className={enhancedClasses}
        ref={ref}
        style={style}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
