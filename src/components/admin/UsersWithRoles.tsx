import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminService, AdminUserProfile } from '@/services/adminService';
import { AppRole } from '@/services/userRolesService';
import { Trash2, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export const UsersWithRoles: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await AdminService.getAllProfilesWithRoles();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return users;
    return users.filter((u) =>
      (u.display_name || '').toLowerCase().includes(f) ||
      u.id.toLowerCase().includes(f)
    );
  }, [users, filter]);

  const onAddRole = async (userId: string, role: AppRole) => {
    const res = await AdminService.addRole(userId, role);
    if (res.success) {
      toast({ title: 'Роль назначена', description: `${role}` });
      load();
    } else {
      toast({ title: 'Ошибка', description: res.error, variant: 'destructive' });
    }
  };

  const onRemoveRole = async (userId: string, role: AppRole) => {
    const res = await AdminService.removeRole(userId, role);
    if (res.success) {
      toast({ title: 'Роль удалена', description: `${role}` });
      load();
    } else {
      toast({ title: 'Ошибка', description: res.error, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Все пользователи</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input placeholder="Поиск по имени или ID" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-4">Загрузка...</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((u) => (
              <div key={u.id} className="border rounded p-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{u.display_name || 'Без имени'}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">{u.id}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(['admin','dm','player'] as AppRole[]).map((role) => {
                      const has = u.roles.includes(role);
                      return has ? (
                        <Badge key={role} variant={role === 'admin' ? 'destructive' : role === 'dm' ? 'default' : 'secondary'}>
                          {role}
                        </Badge>
                      ) : (
                        <Button key={role} size="sm" variant="outline" onClick={() => onAddRole(u.id, role)}>
                          <UserPlus className="h-3 w-3 mr-1" />{role}
                        </Button>
                      );
                    })}
                    {u.roles.map((r) => (
                      <Button key={`rm-${r}`} size="sm" variant="ghost" className="text-destructive" onClick={() => onRemoveRole(u.id, r)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-sm text-muted-foreground">Ничего не найдено</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
