import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../utils';

const navLinks = [
  { label: 'Events', href: '/events' },
  { label: 'Communities', href: '/communities' },
  { label: 'Organizers', href: '/organizers' },
  { label: 'About', href: '/about' },
];

export const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => location.pathname === href;

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
            </nav>

            {/* Right: Login */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                id="header-login-btn"
              >
                Login
              </Button>
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
        </nav>

        {/* Drawer footer */}
        <div className="p-4 border-t border-[#E8EAED]">
          <Button variant="primary" size="md" fullWidth onClick={() => { navigate('/login'); setMobileOpen(false); }}>
            Login
          </Button>
        </div>
      </div>
    </>
  );
};
