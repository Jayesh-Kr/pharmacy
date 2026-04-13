"use client";

import { useEffect, useState } from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import TopMedicinesChart from "@/components/dashboard/TopMedicinesChart";
import axiosInstance from "@/lib/axios";
import { 
  Pill, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topMedicines, setTopMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, salesRes, medicinesRes] = await Promise.all([
          axiosInstance.get("/dashboard/stats"),
          axiosInstance.get("/dashboard/sales-chart"),
          axiosInstance.get("/dashboard/top-medicines")
        ]);

        setStats(statsRes.data);
        setSalesData(salesRes.data);
        setTopMedicines(medicinesRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardContainer>
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Calendar size={16} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/sales" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-700 transition-colors no-underline">
              New Sale <ArrowRight size={18} />
           </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Medicines" 
          value={stats?.total_medicines || 0} 
          icon={Pill} 
          color="blue" 
          loading={loading}
        />
        <StatCard 
          title="Today's Revenue" 
          value={`$${parseFloat(stats?.today_revenue || 0).toFixed(2)}`} 
          icon={DollarSign} 
          color="green" 
          trend={12.5} 
          loading={loading}
        />
        <StatCard 
          title="Total Customers" 
          value={stats?.total_customers || 0} 
          icon={Users} 
          color="purple" 
          loading={loading}
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats?.low_stock_count || 0} 
          icon={AlertTriangle} 
          color="red" 
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <SalesChart data={salesData} loading={loading} />
        <TopMedicinesChart data={topMedicines} loading={loading} />
      </div>

      {/* Quick Action / Recent Activity Placeholder */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md">
               <h2 className="text-2xl font-bold mb-2">Inventory needs your attention</h2>
               <p className="text-blue-100 opacity-90">There are {stats?.low_stock_count || 0} medicines below the reorder level. Review and restock to avoid shortages.</p>
            </div>
            <Link href="/inventory" className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors no-underline">
               Check Inventory
            </Link>
         </div>
         {/* Abstract background shape */}
         <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
         <div className="absolute left-0 bottom-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>
      </div>
    </DashboardContainer>
  );
}
