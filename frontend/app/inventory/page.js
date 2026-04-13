"use client";

import { useEffect, useState } from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import axiosInstance from "@/lib/axios";
import { AlertTriangle, Hourglass, Pill, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lowRes, expireRes] = await Promise.all([
          axiosInstance.get("/inventory/low-stock"),
          axiosInstance.get("/inventory/expiring")
        ]);
        setLowStock(lowRes.data);
        setExpiring(expireRes.data);
      } catch (err) {
        console.error("Failed to fetch inventory data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const lowStockColumns = [
    {
      header: "Medicine",
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{row.medicine_name}</span>
          <span className="text-xs text-gray-400">ID: #{row.medicine_id}</span>
        </div>
      )
    },
    {
      header: "Current Stock",
      accessor: (row) => (
        <span className="font-bold text-red-600">{row.stock_quantity}</span>
      )
    },
    {
      header: "Reorder Level",
      accessor: "reorder_level",
    },
    {
      header: "Supplier",
      accessor: "supplier_name",
    },
    {
      header: "Action",
      className: "text-right",
      accessor: (row) => (
        <Link href={`/purchases/add?medicine_id=${row.medicine_id}`} className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline no-underline">
           Create Purchase <ArrowRight size={14} />
        </Link>
      )
    }
  ];

  const expiringColumns = [
    {
      header: "Medicine",
      accessor: "medicine_name",
    },
    {
      header: "Expiry Date",
      accessor: (row) => {
        const date = new Date(row.expiry_date);
        return (
          <span className="font-bold text-orange-600">
             {date.toLocaleDateString()}
          </span>
        );
      }
    },
    {
      header: "Current Qty",
      accessor: "stock_quantity",
    },
    {
      header: "Status",
      className: "text-right",
      accessor: (row) => (
        <Badge variant="yellow">Expiring Soon</Badge>
      )
    }
  ];

  return (
    <DashboardContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inventory Alerts</h1>
        <p className="text-gray-500 mt-1">Monitor critical stock levels and upcoming expirations</p>
      </div>

      <div className="space-y-12">
        {/* Low Stock Section */}
        <section className="space-y-4">
           <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-xl">
                 <AlertTriangle size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-bold">Low Stock Items</h2>
                 <p className="text-sm text-gray-500">Items that need immediate restocking</p>
              </div>
              <Badge variant="red" className="ml-2">{lowStock.length}</Badge>
           </div>
           <Table 
             columns={lowStockColumns} 
             data={lowStock} 
             loading={loading} 
             emptyMessage="No medicines are currently running low on stock" 
           />
        </section>

        {/* Expiring Soon Section */}
        <section className="space-y-4">
           <div className="flex items-center gap-3 text-orange-600">
              <div className="p-2 bg-orange-50 rounded-xl">
                 <Hourglass size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-bold">Expiring Soon</h2>
                 <p className="text-sm text-gray-500">Items expiring within the next 30 days</p>
              </div>
              <Badge variant="yellow" className="ml-2">{expiring.length}</Badge>
           </div>
           <Table 
             columns={expiringColumns} 
             data={expiring} 
             loading={loading} 
             emptyMessage="No medicines are expiring within the next 30 days" 
           />
        </section>
      </div>
    </DashboardContainer>
  );
}
