// src/components/common/Sidebar.tsx
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Users,
  BarChart3,
  Settings,
  User,
  Shield,
  Building,
  FolderOpen,
  Heart,
  CheckCircle,
  Brain,
  Calendar,
  FileText,
  AlertCircle,
  BarChart2,
  Layers,
  MessageSquare,
  History,
  Grid,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/context/SidebarContext'

const navigation = [
  { name: 'Dashboard', icon: Home, href: '/' },
  { name: 'Users', icon: Users, href: '/users' },
  { name: 'Roles', icon: Shield, href: '/roles' },
  { name: 'Companies', icon: Building, href: '/companies' },
  { name: 'Customers', icon: Heart, href: '/customers' },
  { name: 'Contacts', icon: User, href: '/contacts' },
  { name: 'Leads', icon: Brain, href: '/leads' },
  { name: 'Deals', icon: CheckCircle, href: '/deals' },
  { name: 'Pipeline', icon: Layers, href: '/pipeline' },
  { name: 'Tasks', icon: Calendar, href: '/tasks' },
  { name: 'Notes', icon: FileText, href: '/notes' },
  { name: 'Activities', icon: Activity, href: '/activities' },
  { name: 'Reports', icon: BarChart2, href: '/reports' },
  { name: 'Notifications', icon: Bell, href: '/notifications' },
  { name: 'Settings', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  const { isExpanded } = useSidebar()
  const location = useLocation()

  return (
    <aside className={cn(
      'border-r border-white/10 bg-zinc-950/30 backdrop-blur-3xl glass-noise transition-all duration-300 relative z-40',
      isExpanded ? 'w-64' : 'w-16'
    )}>
      <nav className="flex flex-col gap-2 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all group border border-transparent',
              location.pathname === item.href 
                ? 'text-cyan-400 font-bold bg-cyan-950/30 shadow-[inset_4px_0_0_0_#22d3ee] border-zinc-800/40' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 hover:border-white/5',
              !isExpanded && 'justify-center px-2 shadow-none'
            )}
          >
            <item.icon className={cn("h-5 w-5 transition-colors", location.pathname === item.href ? "text-cyan-400" : "text-zinc-500 group-hover:text-zinc-300")} />
            {isExpanded && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

import Activity from 'lucide-react/dist/index.esm'
import Bell from 'lucide-react/dist/index.esm'
import { cn } from '@/lib/utils'
