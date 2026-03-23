import { useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  role: '管理者' | '従業員';
}

// 仮ログイン認証情報（プロトタイプ用）
const USERS: Record<string, { password: string; name: string; role: '管理者' | '従業員' }> = {
  'admin':   { password: 'rafatility2025', name: '管理者',      role: '管理者' },
  'staff1':  { password: 'grape2025',      name: '圃場スタッフA', role: '従業員' },
  'staff2':  { password: 'grape2025',      name: '圃場スタッフB', role: '従業員' },
};

const STORAGE_KEY = 'rafatility_auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (id: string, password: string): boolean => {
    const found = USERS[id];
    if (found && found.password === password) {
      setUser({ id, name: found.name, role: found.role });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return { user, login, logout };
}
