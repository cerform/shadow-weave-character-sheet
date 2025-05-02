
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { LucideIcon } from "lucide-react"

interface NavProps {
  items: {
    title: string
    href: string
    icon: LucideIcon
    description?: string
  }[]
  className?: string
}

export function DashboardNav({ items, className }: NavProps) {
  return (
    <nav className={cn("grid gap-2", className)}>
      {items.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          className={cn(
            "justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          asChild
        >
          <Link to={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
