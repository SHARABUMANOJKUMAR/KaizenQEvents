import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mockDone, setMockDone] = useState(false);

  const handleGoogleSignIn = () => {
    setLoading(true);
    // Phase 1: Mock interaction. Phase 2: Firebase Auth integration.
    setTimeout(() => {
      setLoading(false);
      setMockDone(true);
      setTimeout(() => navigate('/'), 1500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-[#5F6368] hover:text-[#1A1A2E] mb-6 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Card */}
        <div className="bg-white border border-[#E8EAED] rounded-2xl p-8 shadow-sm text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465425/KAIZEN_Q_EVENTS_FAVICON_o8hwrj.png"
              alt="KQE Logo"
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Header text */}
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Welcome to KQE</h1>
            <p className="text-[#5F6368] text-sm mt-2">
              Sign in to register for events, join communities and connect with the KQE network.
            </p>
          </div>

          {mockDone ? (
            <div className="py-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto">
                <Shield size={24} className="text-[#34A853]" />
              </div>
              <p className="font-semibold text-[#34A853]">Signed in successfully!</p>
              <p className="text-sm text-[#5F6368]">Redirecting you to the homepage…</p>
            </div>
          ) : (
            <>
              {/* Google sign-in */}
              <Button
                variant="outline"
                size="lg"
                fullWidth
                loading={loading}
                onClick={handleGoogleSignIn}
                id="google-signin-btn"
                leftIcon={
                  !loading ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  ) : undefined
                }
              >
                Continue with Google
              </Button>

              <div className="relative">
                <div className="border-t border-[#E8EAED]" />
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-3 text-xs text-[#9AA0A6]">
                  or
                </span>
              </div>

              {/* Email placeholder */}
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-[#E8EAED] bg-white py-2.5 px-4 text-sm text-[#1A1A2E] placeholder:text-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-[#4285F4] transition-all"
                  id="login-email"
                  disabled
                />
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled
                  id="email-signin-btn"
                >
                  Continue with Email
                </Button>
                <p className="text-xs text-[#9AA0A6]">
                  Email sign-in available in Phase 2.
                </p>
              </div>
            </>
          )}

          {/* Privacy note */}
          <p className="text-xs text-[#9AA0A6] leading-relaxed">
            By signing in, you agree to KQE's{' '}
            <a href="#" className="text-[#4285F4] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#4285F4] hover:underline">Privacy Policy</a>.
          </p>
        </div>

        {/* Phase note */}
        <p className="text-center text-xs text-[#9AA0A6] mt-4">
          Firebase Authentication will be integrated in Phase 2.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
