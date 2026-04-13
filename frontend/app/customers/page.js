"use client";

import { useEffect, useState } from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import axiosInstance from "@/lib/axios";
import { Plus, Search, UserPlus, Phone, Mail, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      toast.error("Error loading customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const columns = [
    {
      header: "Customer Name",
      accessor: (row) => (
        <div className="flex items-center gap-3">
           <div className="h-9 w-9 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lg font-bold text-sm">
              {row.customer_name?.charAt(0)}
           </div>
           <span className="font-bold text-gray-900">{row.customer_name}</span>
        </div>
      )
    },
    {
      header: "Contact Info",
      accessor: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
             <Phone size={12} className="text-gray-400" /> {row.phone}
          </div>
          {row.email && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
               <Mail size={12} className="text-gray-400" /> {row.email}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Birth Date",
      accessor: (row) => row.date_of_birth ? new Date(row.date_of_birth).toLocaleDateString() : 'N/A',
    },
    {
      header: "Member Since",
      accessor: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm">Edit</Button>
          <Button variant="ghost" size="sm" className="text-blue-600 font-bold">Sales History</Button>
        </div>
      )
    }
  ];

  return (
    <DashboardContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
             <UserPlus className="text-blue-600" size={32} />
             Patients / Customers
          </h1>
          <p className="text-gray-500 mt-1">Manage patient records and clinical history</p>
        </div>
        <Button variant="primary" icon={Plus} size="md">Register Patient</Button>
      </div>

      <div className="mb-6 relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
           <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search by name or phone number..." 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table 
        columns={columns} 
        data={filteredCustomers} 
        loading={loading} 
        emptyMessage="No customer records found" 
      />
    </DashboardContainer>
  );
}
