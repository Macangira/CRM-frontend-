// src/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import { Sidebar } from '@/components/common/Sidebar'
import { Footer } from '@/components/common/Footer'

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-muted">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
