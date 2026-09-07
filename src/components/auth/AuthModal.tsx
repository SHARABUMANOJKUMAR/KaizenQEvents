import React, { useState, useEffect } from 'react';
import {
  X, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle,
  KeyRound, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleOAuthModal } from './GoogleOAuthModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  redirectUrl?: string;
  onSuccess?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  redirectUrl,
  onSuccess,
}) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signedInSuccess, setSignedInSuccess] = useState(false);
  const [signedInUserName, setSignedInUserName] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Registration Extra Fields
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setAuthMessage(null);
    setSignedInSuccess(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      handleAuthSuccess(user);
    } catch (err: any) {
      console.log('Firebase popup fallback:', err.message);
      setGoogleModalOpen(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setAuthMessage({ type: 'error', text: 'Please enter both email and password.' });
        return;
      }

      setLoading(true);
      try {
        const user = await loginWithEmail({ email: email.trim(), password });
        handleAuthSuccess(user);
      } catch (err: any) {
        setAuthMessage({ type: 'error', text: err.message || 'Login failed.' });
      } finally {
        setLoading(false);
      }
    } else {
      if (!email.trim() || !password || !confirmPassword || !fullName.trim()) {
        setAuthMessage({ type: 'error', text: 'Please fill in all required fields.' });
        return;
      }
      
      if (password !== confirmPassword) {
        setAuthMessage({ type: 'error', text: 'Passwords do not match.' });
        return;
      }

      if (password.length < 6) {
        setAuthMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
        return;
      }

      setLoading(true);
      try {
        const user = await registerWithEmail({
          email: email.trim(),
          password,
          confirmPassword,
          displayName: fullName.trim()
        });
        
        handleAuthSuccess(user);
      } catch (err: any) {
        setAuthMessage({ type: 'error', text: err.message || 'Registration failed.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAuthSuccess = (user: any) => {
    setSignedInUserName(user.displayName || email.split('@')[0]);
    setSignedInSuccess(true);
    
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess(user);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={!loading && !signedInSuccess ? onClose : undefined}
      />
      
      <GoogleOAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl w-full max-w-[440px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[#E8EAED]">
        
        {/* Close Button */}
        {!loading && !signedInSuccess && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-[#5F6368] hover:bg-[#F1F3F4] hover:text-[#1A1A2E] transition-colors z-10"
          >
            <X size={20} />
          </button>
        )}

        {signedInSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto shadow-inner animate-in zoom-in duration-300">
              <ShieldCheck size={40} className="text-[#34A853]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#1A1A2E] mb-1">Welcome back,</h3>
              <p className="text-lg font-semibold text-[#4285F4]">{signedInUserName}</p>
            </div>
            <p className="text-sm text-[#5F6368]">Securely authenticated. Redirecting...</p>
          </div>
        ) : (
          <div className="p-8">
            <div className="text-center mb-8">
              <img 
                src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465425/KAIZEN_Q_EVENTS_FAVICON_o8hwrj.png" 
                alt="KQE Logo" 
                className="h-10 mx-auto mb-4"
              />
              <h2 className="text-2xl font-extrabold text-[#1A1A2E]">
                {mode === 'login' ? 'Sign In to KQE' : 'Join the Community'}
              </h2>
              <p className="text-[#5F6368] text-sm mt-1.5">
                {mode === 'login' 
                  ? 'Welcome back! Please enter your details.' 
                  : 'Create an account to register for exclusive events.'}
              </p>
            </div>

            <div className="space-y-5">
              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={googleLoading}
                className="w-full py-3 px-4 bg-white hover:bg-[#F8F9FA] text-[#3C4043] font-semibold text-sm rounded-xl border border-[#DADCE0] shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-3 active:bg-[#F1F3F4]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-[#E8EAED] w-full"></div>
                <span className="bg-white px-3 text-[10px] uppercase font-bold text-[#9AA0A6] tracking-widest shrink-0">
                  Or Email
                </span>
                <div className="border-t border-[#E8EAED] w-full"></div>
              </div>

              {authMessage && (
                <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                  authMessage.type === 'success' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#C62828]'
                }`}>
                  {authMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span className="font-medium mt-0.5">{authMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-transparent rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:bg-white focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15 transition-all"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-transparent rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:bg-white focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-transparent rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:bg-white focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15 transition-all"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                        <KeyRound size={18} />
                      </div>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-transparent rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:bg-white focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15 transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-sm rounded-xl shadow-md shadow-[#4285F4]/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-8 text-center text-sm font-medium text-[#5F6368]">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setAuthMessage(null);
                }}
                className="text-[#4285F4] hover:underline font-bold"
              >
                {mode === 'login' ? 'Sign up for free' : 'Sign in instead'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
