import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectionCardProps {
  title: string
  description?: string
  selected?: boolean
  onClick?: () => void
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  children?: React.ReactNode
  badges?: React.ReactNode 
  actionButtons?: React.ReactNode // Добавляем поддержку кнопок действий
  style?: React.CSSProperties 
}

export function SelectionCard({
  title,
  description,
  selected = false,
  onClick,
  className,
  titleClassName,
  descriptionClassName,
  children,
  badges,
  actionButtons, // Добавляем поддержку кнопок действий
  style
}: SelectionCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border p-4 cursor-pointer transition-all",
        selected 
          ? "border-primary/80 bg-primary/10 shadow-[0_0_10px] shadow-primary/30" 
          : "border-muted bg-card/30 hover:border-primary/40 hover:bg-primary/5",
        className
      )}
      onClick={onClick}
      style={style}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className={cn(
          "text-lg font-medium",
          selected ? "text-white" : "text-white/90", 
          titleClassName
        )}>
          {title}
        </h3>
        
        {badges && (
          <div className="flex flex-wrap gap-1">
            {badges}
          </div>
        )}
      </div>
      
      {description && (
        <p className={cn(
          "text-sm", 
          selected ? "text-white/90" : "text-white/80",
          descriptionClassName
        )}>
          {description}
        </p>
      )}
      
      {children}

      {/* Отображаем кнопки действий, если они предоставлены */}
      {actionButtons && (
        <div className="flex justify-end mt-2">
          {actionButtons}
        </div>
      )}

      {selected && (
        <div className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse pointer-events-none" />
      )}
    </div>
  )
}

// Adding SelectionCardBadge component
export function SelectionCardBadge({ 
  children, 
  className,
  style // Добавляем поддержку для стилей
}: { 
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties; // Добавляем поддержку для стилей
}) {
  return (
    <div 
      className={cn(
        "inline-flex px-2 py-1 rounded-md text-xs font-medium bg-primary/20 text-white",
        className
      )}
      style={style} // Применяем стили
    >
      {children}
    </div>
  );
}

// Adding SelectionSubOptionsContainer component
export function SelectionSubOptionsContainer({ children, className }: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {children}
    </div>
  );
}

// Adding SelectionSubOption component
export function SelectionSubOption({ 
  label, 
  selected, 
  onClick,
  className,
  style
}: { 
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded text-sm font-medium transition-all",
        selected 
          ? "bg-primary text-white" 
          : "bg-black/30 text-white hover:bg-white/10",
        className
      )}
      style={style}
    >
      {label}
    </button>
  );
}

export function SelectionCardGrid({ children, className, cols = 3 }: { 
  children: React.ReactNode;
  className?: string;
  cols?: number; // Adding optional cols prop
}) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  }[cols] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn(`grid ${gridCols} gap-3`, className)}>
      {children}
    </div>
  );
}
