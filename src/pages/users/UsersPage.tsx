import React, { useEffect, useState } from 'react';
import { userService } from '../../services/crmServices';
import { User, UserRole } from '../../types';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/button';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { UserStatusBadge } from '../../components/common/StatusBadge';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { UserPlus, RotateCcw, Trash2, Edit } from 'lucide-react';
import { UserDetailPage } from './UserDetailPage';
import { Switch } from '../../components/ui/switch';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Role filter
  const [roleFilter, setRoleFilter] = useState('all');

  // Edit User state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('sales_rep');
  const [editIsActive, setEditIsActive] = useState(true);

  // Delete Confirmation Modal state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('sales_rep');
  const [formDept, setFormDept] = useState('Sales & Revenue');
  const [formPhone, setFormPhone] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers(true);
      const mappedData = data.map(u => ({
        ...u,
        name: u.name || `${u.fname || ''} ${u.lname || ''}`.trim() || u.email || 'Unknown',
        role: u.role || 'user'
      }));
      setUsers(mappedData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await userService.createUser({
      name: formName,
      email: formEmail,
      role: formRole,
      status: 'active',
      department: formDept,
      phone: formPhone
    });
    setShowCreateDrawer(false);
    setFormName('');
    setFormEmail('');
    loadUsers();
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await userService.updateUser(editingUser.id, {
        roleId: editRole,
        is_active: editIsActive
      });
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id, true);
      setUserToDelete(null);
      await loadUsers();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (id: string) => {
    await userService.restoreUser(id);
    loadUsers();
  };

  const filteredUsers = users.filter(u => roleFilter === 'all' || u.role === roleFilter);

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User Name',
      sortable: true,
      accessor: user => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={user.avatarUrl} size="sm" />
          <div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">{user.name}</div>
            <div className="text-xs text-zinc-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      accessor: user => <Badge variant="primary">{user.role.replace('_', ' ').toUpperCase()}</Badge>
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: user => <UserStatusBadge status={user.status} isDeleted={user.isDeleted} />
    },
    {
      key: 'createdAt',
      header: 'Joined Date',
      sortable: true,
      accessor: user => new Date(user.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: user => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setEditRole(user.role as UserRole);
              setEditIsActive(user.status === 'active');
              setEditingUser(user);
            }} 
            className="text-zinc-400 hover:text-blue-400"
          >
            <Edit className="w-4 h-4" />
          </Button>

          {user.isDeleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestore(user.id)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-emerald-500" />}
            >
              Restore
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserToDelete(user)}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/40"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  if (selectedUser) {
    return (
      <UserDetailPage
        userId={selectedUser.id}
        initialUser={selectedUser}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">User Directory</h2>
          <p className="text-xs text-zinc-500">Manage team members, roles, permissions, and soft-delete statuses</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)} 
            options={[
              { label: 'All Roles', value: 'all' },
              { label: 'System Admin', value: 'admin' },
              { label: 'Sales Rep', value: 'sales_rep' },
              { label: 'Manager', value: 'sales_manager' },
              { label: 'Account Exec', value: 'account_executive' }
            ]} 
          />
          <Button onClick={() => setShowCreateDrawer(true)} leftIcon={<UserPlus className="w-4 h-4" />}>
            Invite User
          </Button>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        searchPlaceholder="Search users by name, email, or department..."
        onRowClick={user => setSelectedUser(user)}
        renderMobileCard={(user: User) => (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={user.name} src={user.avatarUrl} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{user.name}</div>
                  <div className="text-xs text-zinc-500 truncate mt-0.5 flex items-center gap-1">
                    <span className="truncate">{user.department || 'No department'}</span>
                  </div>
                </div>
              </div>
              <UserStatusBadge status={user.status} isDeleted={user.isDeleted} />
            </div>
            <div className="flex flex-col gap-1.5 text-[11px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-2 truncate">
                <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">📧</span> {user.email}
              </div>
              <div className="flex items-center gap-2 truncate">
                <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">📅</span> Joined: {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <Badge variant="primary">{user.role.replace('_', ' ').toUpperCase()}</Badge>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setEditRole(user.role as UserRole);
                    setEditIsActive(user.status === 'active');
                    setEditingUser(user);
                  }} 
                  className="h-7 text-zinc-400 hover:text-blue-400 px-2"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                {user.isDeleted ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(user.id)}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5 text-emerald-500" />}
                    className="h-7 text-[10px] px-2"
                  >
                    Restore
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUserToDelete(user)}
                    className="h-7 text-red-400 hover:text-red-300 hover:bg-red-950/40 px-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      />

      {/* Reusable Delete Confirmation Modal */}
      {userToDelete && (
        <ConfirmationModal
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          variant="danger"
          title="Delete User Account"
          confirmText="Delete Account"
          message={
            <span>
              Are you sure you want to delete <strong className="text-white">{userToDelete.name}</strong> ({userToDelete.email})? This user account will be soft-deleted from the SpireCRM workspace.
            </span>
          }
        />
      )}

      {/* Create User Drawer */}
      <Drawer
        isOpen={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        title="Invite New Team Member"
        description="Provision access to the Enterprise CRM workspace"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input label="Full Name" required value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Rachel Adams" />
          <Input label="Work Email" type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="rachel@enterprise.com" />
          <Input label="Phone Number" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+1 (555) 000-1122" />
          <Input label="Department" value={formDept} onChange={e => setFormDept(e.target.value)} placeholder="e.g. Sales Engineering" />

          <Select
            label="System Role"
            value={formRole}
            onChange={e => setFormRole(e.target.value as UserRole)}
            options={[
              { label: 'Sales Representative', value: 'sales_rep' },
              { label: 'Account Executive', value: 'account_executive' },
              { label: 'Sales Manager', value: 'sales_manager' },
              { label: 'System Administrator', value: 'admin' },
              { label: 'Read Only Auditor', value: 'read_only' }
            ]}
          />

          <div className="pt-4 flex gap-3">
            <Button type="submit" className="w-full">
              Send Invite & Provision Access
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Edit User Role & Status Drawer */}
      <Drawer
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User Role"
        description={`Modify access permissions for ${editingUser?.name}`}
      >
        <form onSubmit={handleUpdateUser} className="space-y-6">
          <Select
            label="System Role"
            value={editRole}
            onChange={e => setEditRole(e.target.value as UserRole)}
            options={[
              { label: 'Sales Representative', value: 'sales_rep' },
              { label: 'Account Executive', value: 'account_executive' },
              { label: 'Sales Manager', value: 'sales_manager' },
              { label: 'System Administrator', value: 'admin' },
              { label: 'Read Only Auditor', value: 'read_only' }
            ]}
          />

          <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
             <div>
               <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Account Active</h4>
               <p className="text-xs text-zinc-500">Allow user to log in and use the CRM.</p>
             </div>
             <Switch checked={editIsActive} onChange={(c) => setEditIsActive(c)} />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
