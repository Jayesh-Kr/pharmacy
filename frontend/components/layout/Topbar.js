"use client";

import { useAuth } from "@/context/AuthContext";
import { 
  Bell, 
  Search, 
  LogOut, 
  User, 
  Settings, 
  HelpCircle,
  Menu
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-0 z-30 transition-all duration-300">
      <div className="h-full px-4 flex items-center justify-between ml-0 lg:ml-0">
        
        {/* Search Bar section */}
        <div className="flex-1 max-w-md hidden sm:block pl-64">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm"
              placeholder="Search medicines, patients..."
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User Profile */}
          <div className="relative ml-2" ref={profileMenuRef}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition-colors pr-2"
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{user?.full_name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-bold text-gray-800">{user?.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.username}</p>
                </div>
                
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <User size={16} /> Profile Settings
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <Settings size={16} /> Preferences
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <HelpCircle size={16} /> Help Center
                </button>
                
                <div className="my-1 border-t border-gray-100"></div>
                
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
