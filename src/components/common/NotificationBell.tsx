// src/components/common/NotificationBell.tsx
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuNotification,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function NotificationBell() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuNotification>
          <div className="flex items-start gap-3">
            <div className="bg-primary h-2 w-2 rounded-full" />
            <div className="flex-1">
              <p className="text-sm font-medium">New user registered</p>
              <p className="text-xs text-muted-foreground">2 minutes ago</p>
            </div>
          </div>
        </DropdownMenuNotification>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
