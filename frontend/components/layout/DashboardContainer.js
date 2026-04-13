"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ProtectedRoute from "./ProtectedRoute";
import { useState } from "react";

export default function DashboardContainer({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 w-full overflow-hidden min-h-screen pl-64 transition-all duration-300">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto pt-16 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
