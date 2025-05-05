
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"
import { themes } from "@/lib/themes"
import { useUserTheme } from "@/hooks/use-user-theme"

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
    const { activeTheme } = useUserTheme();
    // Добавляем защиту от undefined
    const themeKey = (activeTheme || 'default') as keyof typeof themes;
    const currentTheme = themes[themeKey] || themes.default;
    
    // Получаем базовые классы кнопки
    const baseClasses = cn(buttonVariants({ variant, size, className }));
    
    // Определяем, имеет ли класс Details
    const hasDetailsClass = className ? className.includes('Details') : false;
    
    // Создаем стили для градиента и свечения
    const style = {
      ...props.style,
      color: variant === 'ghost' && hasDetailsClass
        ? '#FFFFFF' 
        : variant === 'default' 
          ? currentTheme.buttonText || '#FFFFFF' 
          : props.style?.color || currentTheme.buttonText || '#FFFFFF',
      borderColor: variant === 'outline' 
        ? `${currentTheme.accent}80` 
        : props.style?.borderColor || `${currentTheme.accent}80`,
      backgroundColor: variant === 'default' && !props.style?.backgroundColor 
        ? currentTheme.accent 
        : props.style?.backgroundColor,
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
      // Добавляем переменные для гибкой настройки эффектов в CSS
      '--theme-accent': currentTheme.accent,
      '--theme-accent-rgb': currentTheme.accent.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(','),
      '--theme-glow': `0 0 10px ${currentTheme.accent}50`,
    } as React.CSSProperties;
    
    // Улучшенные классы для CSS эффектов без постоянного свечения
    const enhancedClasses = cn(
      baseClasses,
      "transition-all duration-300",
      variant === 'default' && !className?.includes('Details') && "bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent)]",
      variant === 'outline' && "border border-[var(--theme-accent)] hover:border-opacity-100 hover:border-[var(--theme-accent)]",
      // Убрано постоянное свечение, добавлено только при наведении
      variant !== 'ghost' && variant !== 'link' && "hover:shadow-[var(--theme-glow)]"
    );
    
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
