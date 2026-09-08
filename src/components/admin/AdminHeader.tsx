import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

interface AdminHeaderProps {
  setIsOpen: (isOpen: boolean) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ setIsOpen }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(true)}
          className="lg:hidden text-gray-500 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        
        {/* Optional Global Search in Header */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-colors">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text"
            placeholder="Global search..."
            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-gray-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-900 relative p-1 rounded-full hover:bg-gray-100">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
};
