import type { UserProfile } from '../types';
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from './firebase';

const STORAGE_KEY = 'kqe_current_user';
const USERS_DB_KEY = 'kqe_registered_users';
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

export interface LoginWithEmailParams {
  email: string;
  password?: string;
  otp?: string; // Kept for backwards compatibility in types
}

export interface RegisterWithEmailParams {
  displayName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  college?: string;
  branch?: string;
  phone?: string;
  year?: string;
}

export const authService = {
  getCurrentUser: (): UserProfile | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to get user from localStorage', e);
      return null;
    }
  },

  logActionToSheets: async (payload: any) => {
    if (APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
      console.warn('Google Apps Script URL not configured. Skipping sheets logging.');
      return;
    }
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        // Note: Using text/plain to avoid CORS preflight issues with Google Apps Script
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to log to Google Sheets', err);
    }
  },

  loginWithGoogle: async (): Promise<UserProfile> => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = userCredential.user;

      const userProfile: UserProfile = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
        email: fbUser.email || 'user@gmail.com',
        photoURL: fbUser.photoURL || `https://lh3.googleusercontent.com/a/ACg8ocL${Math.random().toString(36).substring(7)}=s96-c`,
        authProvider: 'google',
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
      authService.saveUserToDb(userProfile);
      
      authService.logActionToSheets({
        action: 'login',
        userId: fbUser.uid,
        email: fbUser.email,
        device: navigator.userAgent
      });

      return userProfile;
    } catch (popupError: any) {
      console.warn('Google popup error / cancelled:', popupError.message);
      throw popupError;
    }
  },

  loginWithEmail: async ({ email, password }: LoginWithEmailParams): Promise<UserProfile> => {
    if (!password) throw new Error('Password is required');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      const users = authService.getRegisteredUsers();
      const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      const userProfile: UserProfile = existingUser || {
        uid: fbUser.uid,
        displayName: fbUser.displayName || email.split('@')[0],
        email: email,
        authProvider: 'email',
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
      
      authService.logActionToSheets({
        action: 'login',
        userId: fbUser.uid,
        email: email,
        device: navigator.userAgent
      });

      return userProfile;
    } catch (error: any) {
      console.error('Login error:', error.message);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw new Error(error.message || 'Failed to login with email and password');
    }
  },

  registerWithEmail: async (params: RegisterWithEmailParams): Promise<UserProfile> => {
    if (!params.password) throw new Error('Password is required');
    if (params.password !== params.confirmPassword) throw new Error('Passwords do not match');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, params.email, params.password);
      const fbUser = userCredential.user;

      const newProfile: UserProfile = {
        uid: fbUser.uid,
        displayName: params.displayName,
        email: params.email,
        authProvider: 'email',
        college: params.college,
        branch: params.branch,
        phone: params.phone,
        year: params.year,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      authService.saveUserToDb(newProfile);

      authService.logActionToSheets({
        action: 'register',
        userId: fbUser.uid,
        fullName: params.displayName,
        email: params.email,
        password: params.password,
        confirmPassword: params.confirmPassword,
        phone: params.phone,
        year: params.year,
        college: params.college,
        branch: params.branch,
        provider: 'Email/Password'
      });

      return newProfile;
    } catch (error: any) {
      console.error('Registration error:', error.message);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account already exists with this email address.');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      }
      throw new Error(error.message || 'Failed to register with email and password');
    }
  },

  logout: async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase logout issue:', err);
    }
    localStorage.removeItem(STORAGE_KEY);
  },

  saveUserToDb: (user: UserProfile) => {
    try {
      const users = authService.getRegisteredUsers();
      const index = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
      if (index >= 0) {
        users[index] = { ...users[index], ...user };
      } else {
        users.push(user);
      }
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to update users db', e);
    }
  },

  getRegisteredUsers: (): UserProfile[] => {
    try {
      const stored = localStorage.getItem(USERS_DB_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
};
