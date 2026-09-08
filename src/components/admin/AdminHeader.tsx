import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

interface AdminHeaderProps {
  setIsOpen: (isOpen: boolean) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ setIsOpen }) => {
  return (
    <header className="h-16 bg-white/40 backdrop-blur-md border-b border-white/50 shadow-sm flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(true)}
          className="lg:hidden text-gray-500 hover:text-gray-900 p-1.5 rounded-lg hover:bg-white/60 transition-colors"
        >
          <Menu size={20} />
        </button>
        
        {/* Optional Global Search in Header */}
        <div className="hidden md:flex items-center bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 w-72 border border-white/60 focus-within:border-blue-400 focus-within:bg-white/80 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all duration-300">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text"
            placeholder="Global search..."
            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-blue-600 relative p-2 rounded-full bg-white/50 hover:bg-white/80 border border-white/60 shadow-sm hover:shadow transition-all duration-300 transform hover:scale-105">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </div>
    </header>
  );
};
