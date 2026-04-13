"use client";

import { useEffect, useState } from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import axiosInstance from "@/lib/axios";
import { Plus, Search, Truck, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/suppliers");
      setSuppliers(res.data);
    } catch (err) {
      toast.error("Error loading suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(s => 
    s.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Supplier Info",
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{row.supplier_name}</span>
          <span className="text-xs text-gray-400">Contact: {row.contact_person || 'N/A'}</span>
        </div>
      )
    },
    {
      header: "Contact Details",
      accessor: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
             <Phone size={12} className="text-blue-500" /> {row.phone}
          </div>
          {row.email && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
               <Mail size={12} className="text-blue-500" /> {row.email}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Location",
      accessor: (row) => (
        <div className="flex items-center gap-2 text-xs text-gray-500 max-w-xs truncate">
           <MapPin size={12} className="text-red-400" /> {row.city || 'N/A'}
        </div>
      )
    },
    {
      header: "Joined On",
      accessor: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm">Edit</Button>
        </div>
      )
    }
  ];

  return (
    <DashboardContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
             <Truck className="text-blue-600" size={32} />
             Suppliers
          </h1>
          <p className="text-gray-500 mt-1">Manage your medical supply chain partners</p>
        </div>
        <Button variant="primary" icon={Plus} size="md">Add Supplier</Button>
      </div>

      <div className="mb-6 relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
           <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search by company or contact person..." 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table 
        columns={columns} 
        data={filteredSuppliers} 
        loading={loading} 
        emptyMessage="No suppliers found" 
      />
    </DashboardContainer>
  );
}
