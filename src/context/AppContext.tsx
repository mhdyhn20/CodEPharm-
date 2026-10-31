import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AppContextType, Settings, User } from '@/types';

const Ctx = createContext<AppContextType | null>(null);

const DEFAULT_SETTINGS: Settings = {
  pharmacy_name: 'داروخانه',
  paper_size: 'A5',
  sidebar_collapsed: false,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('cp_user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem('cp_settings');
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [hasAnyUser, setHasAnyUser] = useState<boolean>(true);

  const refreshHasAnyUser = useCallback(async () => {
    try {
      const v = await window.api.hasAnyUser();
      setHasAnyUser(v);
    } catch {
      setHasAnyUser(false);
    }
  }, []);

  useEffect(() => {
    refreshHasAnyUser();
    window.api.getSettings().then(s => {
      setSettings(prev => ({ ...prev, ...s }));
    }).catch(() => {});
  }, [refreshHasAnyUser]);

  useEffect(() => {
    localStorage.setItem('cp_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('cp_user', JSON.stringify(currentUser));
    else localStorage.removeItem('cp_user');
  }, [currentUser]);

  const login = async (username: string, password: string) => {
    const r = await window.api.login(username, password);
    if (r.ok && r.user) {
      setCurrentUser(r.user);
      return true;
    }
    return false;
  };

  const createAdmin = async (username: string, password: string) => {
    const r = await window.api.createAdmin(username, password);
    if (r.ok) {
      await refreshHasAnyUser();
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const updateSettings = (s: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...s };
      // Persist known keys to DB via IPC
      for (const [k, v] of Object.entries(s)) {
        window.api.setSetting(k, String(v)).catch(() => {});
      }
      return next;
    });
  };

  return (
    <Ctx.Provider
      value={{
        currentUser,
        settings,
        login,
        logout,
        createAdmin,
        updateSettings,
        hasAnyUser,
        refreshHasAnyUser,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export function useApp(): AppContextType {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('AppContext missing');
  return ctx;
}
