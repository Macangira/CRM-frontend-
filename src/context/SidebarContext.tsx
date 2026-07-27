// src/context/SidebarContext.tsx
import React, { createContext, useContext, useState } from 'react'

type SidebarContextType = {
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleSidebar = () => setIsExpanded(!isExpanded)

  return (
    <SidebarContext.Provider value={{ isExpanded, setIsExpanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
