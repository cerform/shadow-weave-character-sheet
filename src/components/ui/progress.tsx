
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Безопасное значение для value
  const safeValue = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : 0;
  
  // Определяем цвет в зависимости от значения
  const getValueColor = (val: number) => {
    if (val <= 25) return '#ef4444'; // красный
    if (val <= 50) return '#f97316'; // оранжевый
    if (val <= 75) return '#eab308'; // жёлтый
    return '#22c55e'; // зелёный
  };
  
  const color = getValueColor(safeValue);
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      <motion.div
        className="h-full w-full flex-1"
        style={{ background: color }}
        initial={{ transform: `translateX(-${100 - safeValue}%)` }}
        animate={{ transform: `translateX(-${100 - safeValue}%)` }}
        transition={{ duration: 0.3 }}
      />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
