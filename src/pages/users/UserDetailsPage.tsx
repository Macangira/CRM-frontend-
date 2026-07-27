// src/pages/users/UserDetailsPage.tsx
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Shield, Mail, User as UserIcon } from 'lucide-react'

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>()

  // Placeholder - in real app, fetch user by ID
  const user = {
    id: id || '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active' as const,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Details</h2>
          <p className="text-muted-foreground">
            View user information
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-10 w-10 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                <p className="text-sm text-muted-foreground">{user.role}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to={`/users/${id}/edit`}>
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
