
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        warning: 
          "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-500",
        info:
          "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400 [&>svg]:text-blue-500",
        success:
          "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 [&>svg]:text-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}

const Alert = React.forwardRef<
  HTMLDivElement,
  AlertProps
>(({ className, variant, children, icon, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  >
    {icon && icon}
    {!icon && variant === "destructive" && <XCircle className="h-4 w-4" />}
    {!icon && variant === "info" && <Info className="h-4 w-4" />}
    {!icon && variant === "warning" && <AlertTriangle className="h-4 w-4" />}
    {!icon && variant === "success" && <CheckCircle className="h-4 w-4" />}
    {children}
  </div>
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
