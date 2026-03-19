import { useState } from 'react';
import type { UserRole } from '../types';

const ROLE_KEY = 'rafatility_user_role';

export function useUserRole() {
  const [role, setRoleState] = useState<UserRole>(
    () => (localStorage.getItem(ROLE_KEY) as UserRole) ?? '従業員'
  );

  const setRole = (r: UserRole) => {
    localStorage.setItem(ROLE_KEY, r);
    setRoleState(r);
  };

  const isAdmin = role === '管理者';

  return { role, isAdmin, setRole };
}
