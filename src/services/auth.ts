import type { UserProfile } from '../types';
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from './firebase';

const STORAGE_KEY = 'kqe_current_user';
const USERS_DB_KEY = 'kqe_registered_users';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwxsNaSEYmr4ZIKh3R9GZi70uDHhJ0dB99w8yNafKUzdy27vytz8GkuqH6QS-1wq1lu_Q/exec';

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
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      // With no-cors, we can't read res.ok, but if it doesn't throw a network error, it's sent.
    } catch (err) {
      console.warn('Failed to log to Google Sheets, but continuing...', err);
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
      
      await authService.logActionToSheets({
        action: 'login',
        userId: fbUser.uid,
        email: fbUser.email,
        device: navigator.userAgent
      });

      return userProfile;
    } catch (popupError: any) {
      console.warn('Google popup error:', popupError.code, popupError.message);
      let friendlyMessage = 'Google sign-in could not be completed. Please try again.';
      
      switch (popupError.code) {
        case 'auth/popup-blocked':
          friendlyMessage = 'Google sign-in was blocked by your browser. Please allow pop-ups and try again.';
          break;
        case 'auth/popup-closed-by-user':
          friendlyMessage = 'Google sign-in was cancelled. Please try again.';
          break;
        case 'auth/unauthorized-domain':
          friendlyMessage = 'This application domain is not yet authorized for Google sign-in. Please check Firebase configuration.';
          break;
        case 'auth/internal-error':
        case 'auth/network-request-failed':
          friendlyMessage = 'Unable to connect to Google. Please check your internet connection or Firebase setup.';
          break;
      }
      
      throw new Error(friendlyMessage);
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
      
      await authService.logActionToSheets({
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

      await authService.logActionToSheets({
        action: 'register',
        userId: fbUser.uid,
        fullName: params.displayName,
        email: params.email,
        password: params.password,
        confirmPassword: params.confirmPassword,
        phone: params.phone || '',
        year: params.year || '',
        college: params.college || '',
        branch: params.branch || '',
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
