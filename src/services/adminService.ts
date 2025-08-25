import { supabase } from '@/integrations/supabase/client';
import { AppRole, UserRolesService } from '@/services/userRolesService';

export interface AdminUserProfile {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  roles: AppRole[];
}

export class AdminService {
  // Загрузить всех пользователей (profiles) и их роли
  static async getAllProfilesWithRoles(): Promise<AdminUserProfile[]> {
    // Получаем профили
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url');

    if (profilesError) {
      console.error('Ошибка загрузки profiles:', profilesError);
      return [];
    }

    // Получаем роли
    const { data: rolesRows, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Ошибка загрузки user_roles:', rolesError);
      return (profiles || []).map((p) => ({
        id: p.id,
        display_name: (p as any).display_name ?? null,
        avatar_url: (p as any).avatar_url ?? null,
        roles: [],
      }));
    }

    const rolesMap = new Map<string, AppRole[]>();
    (rolesRows || []).forEach((r) => {
      const arr = rolesMap.get(r.user_id) || [];
      arr.push(r.role as AppRole);
      rolesMap.set(r.user_id, arr);
    });

    return (profiles || []).map((p) => ({
      id: p.id,
      display_name: (p as any).display_name ?? null,
      avatar_url: (p as any).avatar_url ?? null,
      roles: rolesMap.get(p.id) || [],
    }));
  }

  // Быстрые помощники для назначения/удаления ролей
  static async addRole(userId: string, role: AppRole) {
    return UserRolesService.assignRole(userId, role);
  }
  static async removeRole(userId: string, role: AppRole) {
    return UserRolesService.removeRole(userId, role);
  }
}
