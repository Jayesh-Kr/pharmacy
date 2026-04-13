"use client";

import { useEffect, useState } from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import axiosInstance from "@/lib/axios";
import { Search, Eye, ShoppingCart, Plus, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function SalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/sales");
      setSales(res.data);
    } catch (err) {
      console.error("Failed to fetch sales:", err);
      toast.error("Error loading sales history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const filteredSales = sales.filter(s => 
    s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    s.sale_id.toString().includes(search)
  );

  const columns = [
    {
      header: "Sale ID",
      accessor: (row) => <span className="font-bold">#SAL-{row.sale_id}</span>,
    },
    {
      header: "Date & Time",
      accessor: (row) => new Date(row.sale_date).toLocaleString(),
    },
    {
      header: "Customer",
      accessor: "customer_name",
    },
    {
      header: "Total Amount",
      accessor: (row) => <span className="font-bold text-gray-900">${parseFloat(row.total_amount).toFixed(2)}</span>,
    },
    {
      header: "Method",
      accessor: (row) => (
         <Badge variant={row.payment_method === 'Cash' ? 'green' : 'blue'}>
            {row.payment_method}
         </Badge>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/sales/${row.sale_id}`}>
            <Button variant="secondary" size="sm" icon={Eye}>View Invoice</Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <DashboardContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sales History</h1>
          <p className="text-gray-500 mt-1">Review and manage past transactions</p>
        </div>
        <Link href="/sales/new" className="no-underline">
           <Button variant="primary" icon={Plus} size="md">New Sale (POS)</Button>
        </Link>
      </div>

      <div className="mb-6 relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
           <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search by customer name or ID..." 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table 
        columns={columns} 
        data={filteredSales} 
        loading={loading} 
        emptyMessage="No sales transactions found" 
      />
    </DashboardContainer>
  );
}
