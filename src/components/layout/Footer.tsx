import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = {
  Platform: [
    { label: 'Events', href: '/events' },
    { label: 'Communities', href: '/communities' },
    { label: 'Organizers', href: '/organizers' },
    { label: 'About KQE', href: '/about' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Code of Conduct', href: '#' },

  ],
};

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);



const socialLinks = [
  { icon: <InstagramIcon />, href: 'https://www.instagram.com/kaizenq_lms/', label: 'Instagram' },
  { icon: <YouTubeIcon />, href: 'https://www.youtube.com/@KaizenQLMS', label: 'YouTube' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F8F9FA] border-t border-[#E8EAED] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img
                src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465425/KAIZEN_Q_EVENTS_FAVICON_o8hwrj.png"
                alt="KQE Logo"
                className="h-9 w-auto object-contain"
              />
              <span className="font-bold text-[#1A1A2E] text-base">Kaizen Q Events</span>
            </Link>
            <p className="text-sm text-[#5F6368] leading-relaxed max-w-xs">
              Building India's most vibrant technology community through impactful events, bootcamps and workshops.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-[#E8EAED] bg-white text-[#5F6368] hover:text-[#4285F4] hover:border-[#4285F4] transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="font-semibold text-[#1A1A2E] text-sm mb-4">{group}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-[#5F6368] hover:text-[#4285F4] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div>
            <h3 className="font-semibold text-[#1A1A2E] text-sm mb-4">Get Started</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/events" className="text-sm text-[#5F6368] hover:text-[#4285F4] transition-colors">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link to="/communities" className="text-sm text-[#5F6368] hover:text-[#4285F4] transition-colors">
                  Find a Community
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-[#5F6368] hover:text-[#4285F4] transition-colors">
                  Join KQE
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#E8EAED] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#9AA0A6]">
            © 2026 Kaizen Q Events. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
            <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
            <span className="w-2 h-2 rounded-full bg-[#FBBC04]" />
            <span className="w-2 h-2 rounded-full bg-[#34A853]" />
          </div>
        </div>
      </div>
    </footer>
  );
};
