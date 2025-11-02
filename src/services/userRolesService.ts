import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'dm' | 'player';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export class UserRolesService {
  // Получить роли текущего пользователя
  static async getCurrentUserRoles(): Promise<AppRole[]> {
    try {
      console.log('🔍 UserRolesService: получаем текущего пользователя');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ UserRolesService: пользователь не найден');
        return [];
      }

      console.log('✅ UserRolesService: пользователь найден:', user.id);

      // Сначала пробуем безопасную функцию БД (SECURITY DEFINER)
      console.log('📡 UserRolesService: вызываем RPC get_user_roles');
      const { data: rpcRoles, error: rpcError } = await supabase
        .rpc('get_user_roles', { _user_id: user.id });

      if (!rpcError && Array.isArray(rpcRoles)) {
        console.log('✅ UserRolesService: роли получены через RPC:', rpcRoles);
        return (rpcRoles as any[]).map((r) => r as AppRole);
      }

      if (rpcError) {
        console.warn('⚠️ UserRolesService: ошибка RPC, пробуем прямой запрос:', rpcError);
      }

      // Фолбэк на прямое чтение таблицы (может быть заблокировано RLS)
      console.log('📡 UserRolesService: прямой запрос к user_roles');
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ UserRolesService: ошибка получения ролей из таблицы:', error);
        return [];
      }

      const roles = data?.map(item => item.role as AppRole) || [];
      console.log('✅ UserRolesService: роли получены из таблицы:', roles);
      return roles;
    } catch (error) {
      console.error('❌ UserRolesService: критическая ошибка:', error);
      return [];
    }
  }

  // Проверить, есть ли у пользователя определенная роль
  static async hasRole(role: AppRole): Promise<boolean> {
    const roles = await this.getCurrentUserRoles();
    return roles.includes(role);
  }

  // Проверить, является ли пользователь админом
  static async isAdmin(): Promise<boolean> {
    return this.hasRole('admin');
  }

  // Проверить, является ли пользователь DM
  static async isDM(): Promise<boolean> {
    const roles = await this.getCurrentUserRoles();
    return roles.includes('dm') || roles.includes('admin');
  }

  // Проверить, является ли пользователь игроком
  static async isPlayer(): Promise<boolean> {
    const roles = await this.getCurrentUserRoles();
    return roles.includes('player') || roles.length === 0; // если нет ролей, считаем игроком
  }

  // Назначить роль пользователю (только для админов)
  static async assignRole(userId: string, role: AppRole): Promise<{ success: boolean; error?: string }> {
    try {
      // SECURITY FIX: Verify current user has admin role before allowing role assignment
      const isCurrentUserAdmin = await this.isAdmin();
      if (!isCurrentUserAdmin) {
        return { success: false, error: 'Access denied: Only administrators can assign roles' };
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  // Удалить роль у пользователя (только для админов)
  static async removeRole(userId: string, role: AppRole): Promise<{ success: boolean; error?: string }> {
    try {
      // SECURITY FIX: Verify current user has admin role before allowing role removal
      const isCurrentUserAdmin = await this.isAdmin();
      if (!isCurrentUserAdmin) {
        return { success: false, error: 'Access denied: Only administrators can remove roles' };
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Unexpected error occurred' };
    }
  }

  // Получить всех пользователей с их ролями (только для админов)
  static async getAllUsersWithRoles(): Promise<UserRole[]> {
    try {
      // SECURITY FIX: Verify current user has admin role before returning all user roles
      const isCurrentUserAdmin = await this.isAdmin();
      if (!isCurrentUserAdmin) {
        console.warn('Access denied: Only administrators can view all user roles');
        return [];
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all user roles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllUsersWithRoles:', error);
      return [];
    }
  }
}