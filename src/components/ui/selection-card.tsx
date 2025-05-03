
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
}

export function SelectionCard({
  title,
  description,
  selected = false,
  onClick,
  className,
  titleClassName,
  descriptionClassName,
  children
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
    >
      <h3 className={cn(
        "text-lg font-medium mb-1",
        selected ? "text-white" : "text-white/90", 
        titleClassName
      )}>
        {title}
      </h3>
      
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

      {selected && (
        <div className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse pointer-events-none" />
      )}
    </div>
  )
}

export function SelectionCardGrid({ children, className }: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", className)}>
      {children}
    </div>
  )
}
