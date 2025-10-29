import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminService, AdminUserProfile } from '@/services/adminService';
import { AppRole } from '@/services/userRolesService';
import { Trash2, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const UsersWithRoles: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const USERS_PER_PAGE = 20;

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

  // Пагинация
  const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [filtered, currentPage]);

  // Сброс на первую страницу при изменении фильтра
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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

  const onDeleteUser = async (userId: string, userName: string) => {
    setDeletingUserId(userId);
    try {
      const res = await AdminService.deleteUser(userId);
      if (res.success) {
        toast({ 
          title: 'Пользователь удалён', 
          description: `${userName} был полностью удалён из системы` 
        });
        load();
      } else {
        toast({ 
          title: 'Ошибка удаления', 
          description: res.error, 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось удалить пользователя', 
        variant: 'destructive' 
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Все пользователи ({filtered.length})</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Страница {currentPage} из {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input placeholder="Поиск по имени или ID" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-4">Загрузка...</div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {paginatedUsers.map((u) => (
                <div key={u.id} className="border rounded p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
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
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            disabled={deletingUserId === u.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Это действие нельзя отменить. Пользователь <strong>{u.display_name || 'Без имени'}</strong> будет полностью удалён из системы вместе со всеми его данными (персонажи, роли, профиль).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteUser(u.id, u.display_name || 'Без имени')}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingUserId === u.id ? 'Удаление...' : 'Удалить пользователя'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">Ничего не найдено</div>
              )}
            </div>
          </ScrollArea>
        )}
        
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Страница {currentPage} из {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Вперёд
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
