import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Shield, User, Mail, KeyRound, Building,
  GraduationCap, Phone, CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthModal } from '../components/auth/GoogleOAuthModal';
import { SEO } from '../components/SEO';

const YEAR_OPTIONS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Postgraduate / Masters',
  'Working Professional',
  'Other',
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

  const [authMode, setAuthMode] = useState<'email-login' | 'email-register'>('email-login');
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signedInSuccess, setSignedInSuccess] = useState(false);
  const [signedInUserName, setSignedInUserName] = useState('');

  const handleGoogleClick = async () => {
    setGoogleLoading(true);
    setAuthMessage(null);
    try {
      const user = await loginWithGoogle();
      handleGoogleSuccess(user.displayName);
    } catch (err: any) {
      setAuthMessage({ type: 'error', text: err.message });
      // Only open fallback modal if it's not a generic error that we handled with a friendly message
      if (!err.message.includes('Google sign-in could not be completed') && !err.message.includes('was blocked')) {
         setGoogleModalOpen(true);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Manual Register State
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('3rd Year');

  const fromPath = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);

    if (authMode === 'email-login') {
      if (!email.trim() || !password) {
        setAuthMessage({ type: 'error', text: 'Please enter both email and password.' });
        return;
      }

      setLoading(true);
      try {
        const user = await loginWithEmail({ email: email.trim(), password });
        setSignedInUserName(user.displayName || email.split('@')[0]);
        setSignedInSuccess(true);
        setTimeout(() => navigate(fromPath, { replace: true }), 1200);
      } catch (err: any) {
        setAuthMessage({ type: 'error', text: err.message || 'Login failed.' });
      } finally {
        setLoading(false);
      }
    } else {
      // Registration Mode
      if (!email.trim() || !password || !confirmPassword || !displayName.trim()) {
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
          displayName: displayName.trim(),
          phone: phone.trim(),
          college: college.trim(),
          branch: branch.trim(),
          year: year
        });
        
        setSignedInUserName(user.displayName || email.split('@')[0]);
        setSignedInSuccess(true);
        setTimeout(() => navigate(fromPath, { replace: true }), 1200);
      } catch (err: any) {
        setAuthMessage({ type: 'error', text: err.message || 'Registration failed.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSuccess = (name: string) => {
    setSignedInUserName(name);
    setSignedInSuccess(true);
    setTimeout(() => navigate(fromPath, { replace: true }), 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 py-12">
      <SEO 
        title="Log In | Kaizen Q Events" 
        description="Sign in to your Kaizen Q Events account" 
        noindex={true} 
      />
      <GoogleOAuthModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
      />

      <div className="w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#5F6368] hover:text-[#1A1A2E] mb-6 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <img
                src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465425/KAIZEN_Q_EVENTS_FAVICON_o8hwrj.png"
                alt="KQE Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Welcome to Kaizen Q Events</h1>
              <p className="text-[#5F6368] text-xs sm:text-sm mt-1">
                Join India's premier community of developers, builders & students.
              </p>
            </div>
          </div>

          {signedInSuccess ? (
            <div className="py-6 space-y-3 text-center fade-in">
              <div className="w-14 h-14 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto shadow-inner">
                <Shield size={30} className="text-[#34A853]" />
              </div>
              <p className="font-bold text-[#1A1A2E] text-lg">Welcome, {signedInUserName}!</p>
              <p className="text-xs text-[#34A853] font-semibold">✓ Authenticated successfully</p>
              <p className="text-xs text-[#5F6368]">Redirecting you now...</p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={googleLoading}
                className="w-full py-3 px-4 bg-white hover:bg-[#F8F9FA] text-[#3C4043] font-semibold text-sm rounded-full border border-[#DADCE0] shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-3 active:bg-[#F1F3F4] cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-[#E8EAED] w-full" />
                <span className="bg-white px-3 text-xs uppercase font-medium text-[#5F6368] tracking-wider shrink-0">
                  or
                </span>
                <div className="border-t border-[#E8EAED] w-full" />
              </div>

              <div className="flex rounded-xl bg-[#F1F3F4] p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('email-login');
                    setAuthMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                    authMode === 'email-login'
                      ? 'bg-white text-[#1A1A2E] shadow-sm'
                      : 'text-[#5F6368] hover:text-[#1A1A2E]'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('email-register');
                    setAuthMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                    authMode === 'email-register'
                      ? 'bg-white text-[#1A1A2E] shadow-sm'
                      : 'text-[#5F6368] hover:text-[#1A1A2E]'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {authMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                    authMessage.type === 'success'
                      ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                      : 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
                  }`}
                >
                  {authMessage.type === 'success' ? (
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium leading-relaxed">{authMessage.text}</span>
                </div>
              )}

              {/* 1. EMAIL LOGIN MODE */}
              {authMode === 'email-login' && (
                <form onSubmit={handleSubmit} className="space-y-4 pt-1 fade-in">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                        <KeyRound size={16} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9AA0A6] hover:text-[#5F6368]"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    type="submit"
                  >
                    Log In
                  </Button>
                </form>
              )}

              {/* 2. FULL REGISTRATION MODE */}
              {authMode === 'email-register' && (
                <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 fade-in">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] focus:outline-none focus:border-[#4285F4]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] focus:outline-none focus:border-[#4285F4]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                          <KeyRound size={16} />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] focus:outline-none focus:border-[#4285F4]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9AA0A6] hover:text-[#5F6368]"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                          <KeyRound size={16} />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] focus:outline-none focus:border-[#4285F4]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9AA0A6] hover:text-[#5F6368]"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                          <Phone size={16} />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] focus:outline-none focus:border-[#4285F4]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1">
                        Year / Status
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                          <GraduationCap size={16} />
                        </div>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] focus:outline-none focus:border-[#4285F4]"
                        >
                          {YEAR_OPTIONS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1">
                        College / Org
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                          <Building size={16} />
                        </div>
                        <input
                          type="text"
                          value={college}
                          onChange={(e) => setCollege(e.target.value)}
                          placeholder="College name"
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] focus:outline-none focus:border-[#4285F4]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1">
                        Branch / Dept
                      </label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="CSE / IT / ECE"
                        className="w-full px-3 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] focus:outline-none focus:border-[#4285F4]"
                      />
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    type="submit"
                  >
                    Create Profile
                  </Button>
                </form>
              )}
            </>
          )}

          <p className="text-center text-xs text-[#9AA0A6] leading-relaxed pt-2 border-t border-[#E8EAED]">
            By signing in, you agree to KQE's{' '}
            <a href="#" className="text-[#4285F4] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#4285F4] hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
