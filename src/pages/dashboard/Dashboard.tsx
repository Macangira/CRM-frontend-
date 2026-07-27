// src/pages/dashboard/DashboardPage.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, TrendingUp, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const stats = [
    { title: 'Total Users', value: '1,234', change: '+12.5%', icon: Users },
    { title: 'Active Users', value: '987', change: '+8.3%', icon: UserCheck },
    { title: 'Growth', value: '15.2%', change: '+2.1%', icon: TrendingUp },
    { title: 'Activity', value: '342', change: '+15.6%', icon: Activity },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your Enterprise CRM dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
