import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  adminName: string;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    // Check session storage on mount
    const token = sessionStorage.getItem('kaizen_admin_session');
    if (token === 'active_session') {
      setIsAdminLoggedIn(true);
      setAdminName('kaizen');
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Hardcoded credentials for frontend-only demo
    if (username === 'kaizen' && password === 'googlemanoj') {
      setIsAdminLoggedIn(true);
      setAdminName('kaizen');
      sessionStorage.setItem('kaizen_admin_session', 'active_session');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
    setAdminName('');
    sessionStorage.removeItem('kaizen_admin_session');
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, login, logout, isLoading, adminName }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
