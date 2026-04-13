"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function StatCard({ title, value, icon: Icon, trend, color = "blue", loading = false }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 ring-blue-500/10",
    green: "bg-green-50 text-green-600 ring-green-500/10",
    red: "bg-red-50 text-red-600 ring-red-500/10",
    yellow: "bg-yellow-50 text-yellow-600 ring-yellow-500/10",
    purple: "bg-purple-50 text-purple-600 ring-purple-500/10",
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 bg-gray-100 rounded-lg"></div>
          <div className="h-4 w-12 bg-gray-100 rounded-md"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-100 rounded-md"></div>
          <div className="h-8 w-16 bg-gray-100 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Decorative background element */}
      <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-110 transition-transform", colorClasses[color])}></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl border", colorClasses[color])}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          )}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
}
