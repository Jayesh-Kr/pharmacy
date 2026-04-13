"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function TopMedicinesChart({ data = [], loading = false }) {
  if (loading) {
     return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] flex items-center justify-center animate-pulse">
           <div className="w-full h-full bg-gray-50 rounded-lg"></div>
        </div>
     );
  }

  // Pre-process data for the bar chart
  const processedData = data.map(item => ({
    ...item,
    total_sold: parseInt(item.total_sold),
    revenue: parseFloat(item.revenue)
  }));

  if (processedData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] min-w-0 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Top-Selling Medicines</h3>
            <p className="text-sm text-gray-500">Fastest moving items by units sold</p>
          </div>
        </div>
        <div className="flex-1 w-full min-h-[280px] min-w-0 flex items-center justify-center text-sm text-gray-500">
          No sales items available yet.
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] min-w-0 flex flex-col">
       <div className="flex items-center justify-between mb-6">
          <div>
             <h3 className="text-lg font-bold text-gray-900 tracking-tight">Top-Selling Medicines</h3>
             <p className="text-sm text-gray-500">Fastest moving items by units sold</p>
          </div>
       </div>

       <div className="flex-1 w-full min-h-[280px] min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280} debounce={80}>
            <BarChart 
              data={processedData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="medicine_name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }}
                width={100}
              />
              <Tooltip 
                 contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                 }}
              />
              <Bar 
                dataKey="total_sold" 
                radius={[0, 4, 4, 0]} 
                barSize={20}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
}
