import React, { useEffect, useState } from 'react';
import { userService } from '../../services/crmServices';
import { Role, Permission } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Shield, Check, Lock, Plus, Users } from 'lucide-react';

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRBAC() {
      setIsLoading(true);
      try {
        const [rList, pList] = await Promise.all([
          userService.getRoles(),
          userService.getPermissions()
        ]);
        setRoles(rList);
        setPermissions(pList);
        if (rList.length > 0) setSelectedRole(rList[0]);
      } finally {
        setIsLoading(false);
      }
    }
    loadRBAC();
  }, []);

  // Group permissions by module
  const modules = Array.from(new Set(permissions.map(p => p.module)));

  const hasPermission = (role: Role, code: string) => {
    return role.permissions.includes(code) || role.permissions.includes(`${code.split(':')[0]}:all`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Roles & Permissions Matrix</h2>
          <p className="text-xs text-slate-500">Define fine-grained access control permissions across CRM modules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List Panel */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Configured System Roles</h3>
          {roles.map(role => (
            <Card
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`cursor-pointer transition-all ${
                selectedRole?.id === role.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20'
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-xl">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{role.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">{role.code}</span>
                  </div>
                </div>
                <Badge variant="neutral" className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {role.userCount}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                {role.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Permission Matrix Grid Panel */}
        <Card className="lg:col-span-2 space-y-6">
          {selectedRole ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Permissions Matrix for <span className="text-blue-600 dark:text-blue-400">{selectedRole.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedRole.description}</p>
                </div>
                <Button size="sm" leftIcon={<Lock className="w-4 h-4" />}>
                  Save Policy Matrix
                </Button>
              </div>

              {/* Modules Permission Matrix */}
              <div className="space-y-6">
                {modules.map(mod => {
                  const modPerms = permissions.filter(p => p.module === mod);

                  return (
                    <div key={mod} className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1">
                        Module: <span className="text-blue-600 dark:text-blue-400">{mod}</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {modPerms.map(perm => {
                          const active = hasPermission(selectedRole, perm.code);

                          return (
                            <div
                              key={perm.id}
                              className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                                active
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                                  : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                              }`}
                            >
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{perm.name}</div>
                                <div className="text-[10px] text-slate-500">{perm.description}</div>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                  active ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">Select a role to inspect permission policies</div>
          )}
        </Card>
      </div>
    </div>
  );
};
