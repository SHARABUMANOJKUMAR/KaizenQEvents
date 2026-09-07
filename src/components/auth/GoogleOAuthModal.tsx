import React, { useState } from 'react';
import { X, User, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (displayName: string) => void;
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogle } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const defaultAccounts = [
    {
      name: 'Shaivika AI',
      email: 'shaivika@gmail.com',
      avatar: 'https://lh3.googleusercontent.com/a/ACg8ocLkm1yhk=s96-c',
    },
    {
      name: 'Google Developer',
      email: 'developer@gmail.com',
      avatar: 'https://lh3.googleusercontent.com/a/ACg8ocLnw796=s96-c',
    },
  ];

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      onSuccess(user.displayName);
      onClose();
    } catch (err) {
      console.error('Google Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) return;

    await handleGoogleSignIn();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-[450px] bg-white rounded-3xl shadow-2xl border border-[#DADCE0] overflow-hidden flex flex-col transform transition-all duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Google OAuth Top Bar */}
        <div className="px-7 pt-7 pb-4">
          <div className="flex items-center justify-between">
            {/* Google Logo */}
            <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1.5 rounded-full text-[#5F6368] hover:bg-[#F1F3F4] transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 space-y-1">
            <h2 className="text-xl font-medium text-[#202124] tracking-tight">Sign in with Google</h2>
            <p className="text-sm text-[#5F6368]">
              Choose an account to continue to <span className="font-semibold text-[#1A1A2E]">Kaizen Q Events</span>
            </p>
          </div>
        </div>

        {/* Account Selector List */}
        <div className="px-4 py-2 flex-1 border-t border-b border-[#F1F3F4]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-[#4285F4]/30 border-t-[#4285F4] rounded-full animate-spin" />
              <p className="text-xs font-medium text-[#5F6368]">Signing in to Kaizen Q Events via Firebase...</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F1F3F4]">
              {defaultAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={handleGoogleSignIn}
                  className="w-full px-3 py-3.5 flex items-center justify-between text-left hover:bg-[#F8F9FA] rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#DADCE0] group-hover:border-[#4285F4] transition-colors"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#202124] group-hover:text-[#1A73E8] transition-colors">
                        {acc.name}
                      </p>
                      <p className="text-xs text-[#5F6368]">{acc.email}</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#EBF3FF] text-[#4285F4] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Check size={14} />
                  </div>
                </button>
              ))}

              {/* Use Another Account Button / Form */}
              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full px-3 py-3.5 flex items-center gap-3.5 text-left hover:bg-[#F8F9FA] rounded-2xl transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F1F3F4] flex items-center justify-center text-[#5F6368] group-hover:bg-[#EBF3FF] group-hover:text-[#4285F4] transition-colors">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#202124] group-hover:text-[#1A73E8] transition-colors">
                      Use another account
                    </p>
                    <p className="text-xs text-[#5F6368]">Enter any Google Account email</p>
                  </div>
                </button>
              ) : (
                <form onSubmit={handleCustomSubmit} className="p-3 space-y-3 bg-[#F8F9FA] rounded-2xl mt-1">
                  <label className="block text-xs font-semibold text-[#202124]">
                    Enter your Google Account email:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      autoFocus
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="flex-1 px-3 py-2 text-sm bg-white border border-[#DADCE0] rounded-xl focus:outline-none focus:border-[#4285F4]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                    >
                      Next <ArrowRight size={12} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Security & Disclaimer Footer */}
        <div className="px-7 py-4 bg-[#FAFAFA] text-[11px] text-[#5F6368] leading-relaxed">
          <div className="flex items-center gap-1.5 mb-1 text-[#1A73E8] font-medium">
            <ShieldCheck size={14} />
            <span>Secure Firebase OAuth Integration</span>
          </div>
          To continue, Google will share your name, email address, language preference, and profile picture with
          Kaizen Q Events. Before using this app, review Kaizen Q Events's{' '}
          <a href="#" className="text-[#1A73E8] hover:underline">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="#" className="text-[#1A73E8] hover:underline">
            Terms of Service
          </a>
          .
        </div>
      </div>
    </div>
  );
};
