import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LogIn, 
  Bot, 
  TerminalSquare, 
  GitBranch, 
  Coffee, 
  BarChart3, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
  const { logout, adminName } = useAdminAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Login Activity', path: '/admin/logins', icon: LogIn },
    { type: 'divider', name: 'BootCamps' },
    { name: 'Generative AI', path: '/admin/generative-ai', icon: Bot },
    { name: 'Python with AI', path: '/admin/python-ai', icon: TerminalSquare },
    { name: 'Git & GitHub', path: '/admin/git-github', icon: GitBranch },
    { name: 'Java with AI', path: '/admin/java-ai', icon: Coffee },
    { type: 'divider', name: 'Management' },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white/40 backdrop-blur-2xl border-r border-white/40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/20">
              K
            </div>
            <span className="font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent tracking-tight">KAIZEN Q</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800 bg-white/50 rounded-lg p-1">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1.5 px-3">
            {navItems.map((item, index) => {
              if (item.type === 'divider') {
                return (
                  <div key={`divider-${index}`} className="pt-5 pb-2 px-3">
                    <p className="text-[10px] font-extrabold text-indigo-400/60 uppercase tracking-widest">{item.name}</p>
                  </div>
                );
              }

              const Icon = item.icon!;
              return (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.03)] text-blue-600 border border-white/60 scale-[1.02]' 
                        : 'text-gray-600 hover:bg-white/50 hover:text-gray-900 hover:shadow-sm hover:scale-[1.01]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
                      {item.name}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/40">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/50 border border-white/40 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-700 flex items-center justify-center font-bold uppercase shadow-inner">
              {adminName.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">Admin Profile</p>
              <p className="text-xs text-indigo-500/80 font-medium truncate">@{adminName}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 border border-transparent hover:border-red-100 hover:shadow-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
