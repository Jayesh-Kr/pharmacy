"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Pill, 
  Settings, 
  Users, 
  ShoppingCart, 
  ClipboardList, 
  Truck, 
  UserPlus, 
  AlertCircle, 
  Stethoscope, 
  ChevronLeft, 
  ChevronRight,
  Menu
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ href, icon: Icon, label, collapsed }) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group no-underline",
        isActive 
          ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
          : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
      )}
    >
      <div className={cn("flex-shrink-0", isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600")}>
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      {!collapsed && (
        <span className={cn("font-medium whitespace-nowrap overflow-hidden transition-all duration-300", 
          isActive ? "opacity-100" : "opacity-90")}>
          {label}
        </span>
      )}
    </Link>
  );
};

export default function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Role-based navigation logic
  const navigation = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/medicines", label: "Medicines", icon: Pill },
    { href: "/inventory", label: "Inventory", icon: AlertCircle },
    { href: "/sales", label: "Sales & POS", icon: ShoppingCart },
    { href: "/prescriptions", label: "Prescriptions", icon: ClipboardList },
    { href: "/customers", label: "Customers", icon: UserPlus },
    { href: "/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/suppliers", label: "Suppliers", icon: Truck },
    { href: "/purchases", label: "Purchases", icon: ShoppingCart },
  ];

  // Admin only items
  const adminItems = [
    { href: "/users", label: "User Management", icon: Users },
  ];

  const displayNavigation = user?.role === 'admin' 
    ? [...navigation, ...adminItems] 
    : navigation;

  return (
    <aside 
      className={cn(
        "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm fixed top-0 left-0 z-40",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2">
            <Pill className="text-blue-600 w-6 h-6" />
            <span className="font-bold text-lg text-gray-800 tracking-tight">Pharmacy</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors mx-auto",
            !collapsed && "mr-0"
          )}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
        {displayNavigation.map((item) => (
          <SidebarItem 
            key={item.href} 
            {...item} 
            collapsed={collapsed} 
          />
        ))}
      </div>

      {/* Sidebar Footer/Support */}
      <div className="p-4 border-t border-gray-100">
         <div className={cn("flex flex-col gap-2", collapsed && "items-center")}>
            <SidebarItem href="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
         </div>
      </div>
    </aside>
  );
}
