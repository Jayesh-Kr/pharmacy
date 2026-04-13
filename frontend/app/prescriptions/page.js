"use client";

import { useEffect, useState } from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import axiosInstance from "@/lib/axios";
import { Search, Eye, Plus, ClipboardList, Calendar, User, Stethoscope } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/prescriptions");
      setPrescriptions(res.data);
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
      toast.error("Error loading prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter(p => 
    p.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    p.doctor_name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "ID",
      accessor: (row) => <span className="font-bold text-gray-400">#PR-{row.prescription_id}</span>,
      width: "100px"
    },
    {
      header: "Prescription Date",
      accessor: (row) => (
        <div className="flex items-center gap-2">
           <Calendar size={14} className="text-gray-400" />
           <span className="font-medium">{new Date(row.prescription_date).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      header: "Patient / Customer",
      accessor: (row) => (
        <div className="flex items-center gap-2">
           <User size={14} className="text-gray-400" />
           <span className="font-bold text-gray-900">{row.customer_name}</span>
        </div>
      )
    },
    {
      header: "Prescribed By",
      accessor: (row) => (
        <div className="flex items-center gap-2">
           <Stethoscope size={14} className="text-gray-400" />
           <div className="flex flex-col">
              <span className="font-bold text-gray-700">{row.doctor_name}</span>
              <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{row.specialization}</span>
           </div>
        </div>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/prescriptions/${row.prescription_id}`}>
            <Button variant="secondary" size="sm" icon={Eye}>View Items</Button>
          </Link>
          <Link href={`/sales/new?prescription_id=${row.prescription_id}&customer_id=${row.customer_id}`}>
            <Button variant="primary" size="sm" icon={Plus}>Sell Meds</Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <DashboardContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Prescriptions</h1>
          <p className="text-gray-500 mt-1">Manage and fulfillment of medical prescriptions</p>
        </div>
        <Link href="/prescriptions/add" className="no-underline">
           <Button variant="primary" icon={Plus} size="md">Add Prescription</Button>
        </Link>
      </div>

      <div className="mb-6 relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
           <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search by patient or doctor..." 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table 
        columns={columns} 
        data={filteredPrescriptions} 
        loading={loading} 
        emptyMessage="No prescriptions found" 
      />
    </DashboardContainer>
  );
}
