import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { authService, type LoginWithEmailParams, type RegisterWithEmailParams } from '../services/auth';
import { AuthModal } from '../components/auth/AuthModal';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isLoggedIn: boolean;
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<UserProfile>;
  loginWithEmail: (params: LoginWithEmailParams) => Promise<UserProfile>;
  registerWithEmail: (params: RegisterWithEmailParams) => Promise<UserProfile>;
  sendOtp: (email: string) => Promise<{ success: boolean; message: string; otp?: string }>;
  verifyOtp: (payload: {
    email: string;
    otp: string;
    fullName?: string;
    college?: string;
    branch?: string;
    year?: string;
    phone?: string;
  }) => Promise<UserProfile>;
  logout: () => Promise<void>;
  openAuthModal: (mode?: 'login' | 'signup', redirectAfter?: string) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Global Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authModalRedirect, setAuthModalRedirect] = useState<string | undefined>(undefined);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const openAuthModal = (mode: 'login' | 'signup' = 'login', redirectAfter?: string) => {
    setAuthModalMode(mode);
    setAuthModalRedirect(redirectAfter);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalRedirect(undefined);
  };

  const loginWithGoogle = async (customEmail?: string, customName?: string) => {
    setLoading(true);
    const loggedInUser = await authService.loginWithGoogle(customEmail, customName);
    setUser(loggedInUser);
    setLoading(false);
    return loggedInUser;
  };

  const loginWithEmail = async (params: LoginWithEmailParams) => {
    setLoading(true);
    const loggedInUser = await authService.loginWithEmail(params);
    setUser(loggedInUser);
    setLoading(false);
    return loggedInUser;
  };

  const registerWithEmail = async (params: RegisterWithEmailParams) => {
    setLoading(true);
    const registeredUser = await authService.registerWithEmail(params);
    setUser(registeredUser);
    setLoading(false);
    return registeredUser;
  };

  const sendOtp = async (email: string) => {
    return authService.sendOtp(email);
  };

  const verifyOtp = async (payload: {
    email: string;
    otp: string;
    fullName?: string;
    college?: string;
    branch?: string;
    year?: string;
    phone?: string;
  }) => {
    setLoading(true);
    const verifiedUser = await authService.verifyOtp(payload);
    setUser(verifiedUser);
    setLoading(false);
    return verifiedUser;
  };

  const logout = async () => {
    setLoading(true);
    await authService.logout();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: !!user,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        sendOtp,
        verifyOtp,
        logout,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
        redirectUrl={authModalRedirect}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

