import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Home, Shield } from 'lucide-react';
import { useProtectedRoute } from '@/hooks/use-auth';
import { UserRolesService, AppRole, UserRole } from '@/services/userRolesService';
import { useToast } from '@/hooks/use-toast';

const AdminPage: React.FC = () => {
  console.log('AdminPage: компонент загружается');
  const navigate = useNavigate();
  const { isAdmin, loading } = useProtectedRoute();
  const { toast } = useToast();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [newUserId, setNewUserId] = useState('');
  const [newUserRole, setNewUserRole] = useState<AppRole>('player');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/unauthorized');
      return;
    }
    
    if (isAdmin) {
      loadUserRoles();
    }
  }, [isAdmin, loading, navigate]);

  const loadUserRoles = async () => {
    setIsLoading(true);
    const roles = await UserRolesService.getAllUsersWithRoles();
    setUserRoles(roles);
    setIsLoading(false);
  };

  const handleAddRole = async () => {
    if (!newUserId.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ID пользователя",
        variant: "destructive"
      });
      return;
    }

    const result = await UserRolesService.assignRole(newUserId, newUserRole);
    
    if (result.success) {
      toast({
        title: "Успех",
        description: `Роль ${newUserRole} назначена пользователю`,
      });
      setNewUserId('');
      setNewUserRole('player');
      loadUserRoles();
    } else {
      toast({
        title: "Ошибка",
        description: result.error || "Не удалось назначить роль",
        variant: "destructive"
      });
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    const result = await UserRolesService.removeRole(userId, role);
    
    if (result.success) {
      toast({
        title: "Успех",
        description: `Роль ${role} удалена у пользователя`,
      });
      loadUserRoles();
    } else {
      toast({
        title: "Ошибка",
        description: result.error || "Не удалось удалить роль",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'dm': return 'default';
      case 'player': return 'secondary';
      default: return 'outline';
    }
  };

  const groupedRoles = userRoles.reduce((acc, userRole) => {
    if (!acc[userRole.user_id]) {
      acc[userRole.user_id] = [];
    }
    acc[userRole.user_id].push(userRole);
    return acc;
  }, {} as Record<string, UserRole[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Перенаправление произойдет в useEffect
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Панель администратора
            </h1>
            <Badge variant="destructive">Admin Only</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Назначение ролей */}
          <Card>
            <CardHeader>
              <CardTitle>Назначить роль пользователю</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">ID пользователя</label>
                <Input
                  placeholder="ae24e6bb-5dcf-4ccf-a692-5d562b443144"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Роль</label>
                <Select value={newUserRole} onValueChange={(value: AppRole) => setNewUserRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">Player (Игрок)</SelectItem>
                    <SelectItem value="dm">DM (Мастер)</SelectItem>
                    <SelectItem value="admin">Admin (Администратор)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleAddRole} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Назначить роль
              </Button>
            </CardContent>
          </Card>

          {/* Список пользователей и их ролей */}
          <Card>
            <CardHeader>
              <CardTitle>Пользователи и роли</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Загрузка...</div>
              ) : Object.keys(groupedRoles).length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Пользователи с ролями не найдены
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedRoles).map(([userId, roles]) => (
                    <div key={userId} className="border rounded p-4">
                      <div className="font-mono text-sm text-muted-foreground mb-2">
                        {userId}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {roles.map((userRole) => (
                          <div key={userRole.id} className="flex items-center gap-2">
                            <Badge variant={getRoleBadgeVariant(userRole.role)}>
                              {userRole.role}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveRole(userId, userRole.role)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Информация о ролях */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Описание ролей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">Player</Badge>
                <p className="text-sm text-muted-foreground">
                  Обычный игрок. Может создавать персонажей и присоединяться к сессиям.
                </p>
              </div>
              <div className="text-center">
                <Badge variant="default" className="mb-2">DM</Badge>
                <p className="text-sm text-muted-foreground">
                  Мастер игры. Может создавать сессии, управлять боевыми картами и инициативой.
                </p>
              </div>
              <div className="text-center">
                <Badge variant="destructive" className="mb-2">Admin</Badge>
                <p className="text-sm text-muted-foreground">
                  Администратор. Полный доступ ко всем функциям, включая управление ролями.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;