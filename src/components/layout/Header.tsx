import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Ticket, Sparkles, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../utils';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { label: 'Events', href: '/events' },
  { label: 'Communities', href: '/communities' },
  { label: 'Organizers', href: '/organizers' },
  { label: 'About', href: '/about' },
];

export const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer & dropdown on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Click outside listener for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U';
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200',
          scrolled ? 'shadow-[0_1px_8px_rgba(0,0,0,0.08)]' : 'border-b border-[#E8EAED]'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile menu button + Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 rounded-lg text-[#5F6368] hover:bg-[#F8F9FA] transition"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                id="mobile-menu-btn"
              >
                <Menu size={22} />
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Kaizen Q Events Home">
                <img
                  src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465425/KAIZEN_Q_EVENTS_FAVICON_o8hwrj.png"
                  alt="KQE Logo"
                  className="h-8 w-auto object-contain"
                />
                <span className="hidden sm:block font-bold text-[#1A1A2E] text-base tracking-tight">
                  Kaizen Q Events
                </span>
              </Link>
            </div>

            {/* Center: Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive(link.href)
                      ? 'bg-[#EBF3FF] text-[#4285F4]'
                      : 'text-[#5F6368] hover:bg-[#F8F9FA] hover:text-[#1A1A2E]'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn && (
                <Link
                  to="/dashboard"
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5',
                    isActive('/dashboard')
                      ? 'bg-[#EBF3FF] text-[#4285F4]'
                      : 'text-[#5F6368] hover:bg-[#F8F9FA] hover:text-[#1A1A2E]'
                  )}
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Right: Auth / User Profile */}
            <div className="flex items-center gap-3">
              {isLoggedIn && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1 rounded-full hover:bg-[#F8F9FA] transition-all border border-[#E8EAED] cursor-pointer"
                    aria-label="User menu"
                  >
                    {user.photoURL && !avatarError ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        onError={() => setAvatarError(true)}
                        className="w-8 h-8 rounded-full object-cover border border-[#4285F4]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4285F4] to-[#34A853] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {getInitials(user.displayName)}
                      </div>
                    )}
                    <span className="hidden sm:block text-xs font-semibold text-[#1A1A2E] pr-2">
                      {user.displayName.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E8EAED] rounded-2xl shadow-xl py-2 z-50 fade-in">
                      <div className="px-4 py-3 border-b border-[#E8EAED] space-y-1">
                        <div className="flex items-center gap-3">
                          {user.photoURL && !avatarError ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName}
                              onError={() => setAvatarError(true)}
                              className="w-10 h-10 rounded-full object-cover border border-[#4285F4]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4285F4] to-[#34A853] text-white flex items-center justify-center font-bold text-sm">
                              {getInitials(user.displayName)}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-[#1A1A2E] truncate">{user.displayName}</p>
                            <p className="text-xs text-[#5F6368] truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#EBF3FF] text-[#4285F4] px-2.5 py-0.5 rounded-full">
                            <Sparkles size={10} />
                            Verified with {user.authProvider === 'google' ? 'Google' : 'Email'}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate('/dashboard');
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#1A1A2E] hover:bg-[#F8F9FA] flex items-center gap-2.5 cursor-pointer"
                        >
                          <LayoutDashboard size={15} className="text-[#4285F4]" />
                          My Bootcamps & Registered Tickets
                        </button>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate('/events');
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#5F6368] hover:bg-[#F8F9FA] flex items-center gap-2.5 cursor-pointer"
                        >
                          <Ticket size={15} className="text-[#34A853]" />
                          Explore Upcoming Events
                        </button>
                      </div>

                      <div className="border-t border-[#E8EAED] pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#EA4335] hover:bg-[#FFEBEE] flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/login')}
                    id="header-login-btn"
                  >
                    Login / Sign Up
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/login')}
                    id="header-getstarted-btn"
                    className="hidden sm:inline-flex"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl lg:hidden flex flex-col transition-transform duration-300 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[#E8EAED]">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <img
              src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465425/KAIZEN_Q_EVENTS_FAVICON_o8hwrj.png"
              alt="KQE Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold text-[#1A1A2E] text-sm">Kaizen Q Events</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-[#5F6368] hover:bg-[#F8F9FA]"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex flex-col gap-1 p-4 flex-1" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all',
                isActive(link.href)
                  ? 'bg-[#EBF3FF] text-[#4285F4]'
                  : 'text-[#1A1A2E] hover:bg-[#F8F9FA]'
              )}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link
              to="/dashboard"
              className={cn(
                'flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all text-[#4285F4]',
                isActive('/dashboard') ? 'bg-[#EBF3FF]' : 'hover:bg-[#F8F9FA]'
              )}
            >
              <LayoutDashboard size={18} className="mr-2" />
              My Dashboard & Tickets
            </Link>
          )}
        </nav>

        {/* Drawer footer */}
        <div className="p-4 border-t border-[#E8EAED]">
          {isLoggedIn && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {user.photoURL && !avatarError ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    onError={() => setAvatarError(true)}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#4285F4] text-white font-bold flex items-center justify-center text-xs">
                    {getInitials(user.displayName)}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-[#1A1A2E] truncate">{user.displayName}</p>
                  <p className="text-xs text-[#5F6368] truncate">{user.email}</p>
                </div>
              </div>
              <Button variant="outline" size="md" fullWidth onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                navigate('/login');
                setMobileOpen(false);
              }}
            >
              Get Started / Login
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
