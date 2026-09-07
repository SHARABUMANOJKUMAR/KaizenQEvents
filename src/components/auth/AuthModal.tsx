import React, { useState, useEffect } from 'react';
import {
  X, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle,
  RefreshCw, KeyRound, User
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

const YEAR_OPTIONS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Postgraduate / Masters',
  'Working Professional',
  'Other',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  redirectUrl,
  onSuccess,
}) => {
  const { sendOtp, verifyOtp, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signedInSuccess, setSignedInSuccess] = useState(false);
  const [signedInUserName, setSignedInUserName] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpMessage, setOtpMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Registration Extra Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('3rd Year');

  useEffect(() => {
    setMode(initialMode);
    setOtpSent(false);
    setOtp('');
    setOtpMessage(null);
    setSignedInSuccess(false);
  }, [initialMode, isOpen]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

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

  const handleSendOtp = async () => {
    const emailToUse = email.trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      setOtpMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setOtpMessage({ type: 'error', text: 'Please enter your full name.' });
      return;
    }

    setOtpSending(true);
    setOtpMessage(null);

    try {
      const res = await sendOtp(emailToUse);
      if (res.success) {
        setOtpSent(true);
        setResendTimer(60);
        setOtpMessage({
          type: 'success',
          text: `Verification OTP sent to ${emailToUse}! Check your inbox.`,
        });
      } else {
        setOtpMessage({ type: 'error', text: res.message || 'Failed to send OTP.' });
      }
    } catch (err: any) {
      setOtpMessage({ type: 'error', text: err.message || 'Error communicating with server.' });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim()) {
      setOtpMessage({ type: 'error', text: 'Please enter both your email and the 6-digit OTP.' });
      return;
    }

    setLoading(true);
    setOtpMessage(null);

    try {
      const user = await verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
        fullName: fullName.trim() || undefined,
        college: college.trim() || undefined,
        branch: branch.trim() || undefined,
        year: year || undefined,
        phone: phone.trim() || undefined,
      });

      handleAuthSuccess(user);
    } catch (err: any) {
      setOtpMessage({ type: 'error', text: err.message || 'Invalid or expired OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (user: any) => {
    setSignedInUserName(user.displayName || 'Developer');
    setSignedInSuccess(true);
    if (onSuccess) {
      onSuccess(user);
    }
    setTimeout(() => {
      onClose();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }, 1000);
  };

  return (
    <>
      <GoogleOAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSuccess={(name) => handleAuthSuccess({ displayName: name })}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#DADCE0] overflow-hidden flex flex-col my-auto relative transform transition-all duration-200 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top 4-Color GDG Google Accent Strip */}
          <div className="h-1.5 w-full flex">
            <div className="h-full w-1/4 bg-[#4285F4]" />
            <div className="h-full w-1/4 bg-[#EA4335]" />
            <div className="h-full w-1/4 bg-[#FBBC04]" />
            <div className="h-full w-1/4 bg-[#34A853]" />
          </div>

          {/* Modal Header */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465425/KAIZEN_Q_EVENTS_FAVICON_o8hwrj.png"
                  alt="KQE Logo"
                  className="h-8 w-auto object-contain"
                />
                <span className="font-bold text-[#1A1A2E] text-base tracking-tight">Kaizen Q Events</span>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-1.5 rounded-full text-[#5F6368] hover:bg-[#F1F3F4] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-1">
              <h2 className="text-xl font-bold text-[#1A1A2E] tracking-tight">
                {mode === 'login' ? 'Sign in to KQE' : 'Create your KQE Account'}
              </h2>
              <p className="text-xs text-[#5F6368]">
                One account for developer bootcamps, workshops, and free verified certificates.
              </p>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {signedInSuccess ? (
              <div className="py-8 space-y-3 text-center fade-in">
                <div className="w-14 h-14 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={32} className="text-[#34A853]" />
                </div>
                <p className="font-bold text-[#1A1A2E] text-lg">Welcome, {signedInUserName}!</p>
                <p className="text-xs text-[#34A853] font-semibold">✓ Successfully authenticated</p>
              </div>
            ) : (
              <>
                {/* 1-Click Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={googleLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-[#F8F9FA] text-[#3C4043] font-semibold text-sm rounded-xl border border-[#DADCE0] shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 active:bg-[#F1F3F4] cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
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
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-1">
                  <div className="border-t border-[#E8EAED] w-full" />
                  <span className="bg-white px-3 text-[11px] uppercase font-bold text-[#9AA0A6] tracking-wider shrink-0">
                    or with email
                  </span>
                  <div className="border-t border-[#E8EAED] w-full" />
                </div>

                {/* Tab Switcher */}
                <div className="flex rounded-xl bg-[#F1F3F4] p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setOtpMessage(null);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                      mode === 'login'
                        ? 'bg-white text-[#1A1A2E] shadow-sm'
                        : 'text-[#5F6368] hover:text-[#1A1A2E]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setOtpMessage(null);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                      mode === 'signup'
                        ? 'bg-white text-[#1A1A2E] shadow-sm'
                        : 'text-[#5F6368] hover:text-[#1A1A2E]'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Alert message */}
                {otpMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                      otpMessage.type === 'success'
                        ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                        : 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
                    }`}
                  >
                    {otpMessage.type === 'success' ? (
                      <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium leading-tight">{otpMessage.text}</span>
                  </div>
                )}

                {/* Auth Form */}
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6368] mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                          <User size={15} />
                        </div>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-[#DADCE0] rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6368] mb-1">
                      Email Address
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                          <Mail size={15} />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-[#DADCE0] rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpSending || resendTimer > 0}
                        className="px-3 py-2 bg-[#EBF3FF] text-[#4285F4] hover:bg-[#D2E3FC] disabled:opacity-50 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {otpSending ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : resendTimer > 0 ? (
                          `${resendTimer}s`
                        ) : otpSent ? (
                          'Resend'
                        ) : (
                          'Send OTP'
                        )}
                      </button>
                    </div>
                  </div>

                  {otpSent && (
                    <div className="fade-in space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
                        Enter 6-Digit OTP
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                          <KeyRound size={15} />
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-[#DADCE0] rounded-xl text-base tracking-widest font-mono font-bold text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15"
                        />
                      </div>
                    </div>
                  )}

                  {mode === 'signup' && (
                    <>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#5F6368] mb-0.5">
                            College / Org
                          </label>
                          <input
                            type="text"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            placeholder="e.g. JNTU / SVCE"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DADCE0] rounded-lg text-[#1A1A2E]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#5F6368] mb-0.5">
                            Year / Role
                          </label>
                          <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-[#DADCE0] rounded-lg text-[#1A1A2E]"
                          >
                            {YEAR_OPTIONS.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#5F6368] mb-0.5">
                            Branch / Stream
                          </label>
                          <input
                            type="text"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            placeholder="e.g. CSE / AI"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DADCE0] rounded-lg text-[#1A1A2E]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#5F6368] mb-0.5">
                            Phone / WhatsApp
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DADCE0] rounded-lg text-[#1A1A2E]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !otpSent}
                    className="w-full py-2.5 px-4 bg-[#4285F4] hover:bg-[#3367D6] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {loading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <>
                        <span>{mode === 'login' ? 'Sign In' : 'Complete Registration'}</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Footer Note */}
          <div className="px-6 py-3 bg-[#F8F9FA] border-t border-[#E8EAED] text-[11px] text-[#5F6368] flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#34A853] font-medium">
              <ShieldCheck size={13} />
              Secure Firebase Authentication
            </span>
            <span className="text-[#9AA0A6]">100% Free Developer Community</span>
          </div>
        </div>
      </div>
    </>
  );
};
