// src/components/common/Header.tsx
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { NotificationBell } from '@/components/common/NotificationBell'

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Enterprise CRM</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationBell />
        <ThemeToggle />
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

import Settings from 'lucide-react/dist/index.esm'
