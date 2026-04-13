"use client";

import { useEffect, useState } from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import axiosInstance from "@/lib/axios";
import { Plus, Search, Stethoscope, Phone, Award } from "lucide-react";
import { toast } from "react-hot-toast";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/doctors");
      setDoctors(res.data);
    } catch (err) {
      toast.error("Error loading doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(d => 
    d.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Doctor Name",
      accessor: (row) => (
        <div className="flex items-center gap-3">
           <div className="h-9 w-9 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg font-bold text-sm">
              DR
           </div>
           <span className="font-bold text-gray-900">{row.doctor_name}</span>
        </div>
      )
    },
    {
      header: "Specialization",
      accessor: (row) => (
        <div className="flex items-center gap-2">
           <Award size={14} className="text-orange-400" />
           <span className="text-sm font-semibold text-gray-700">{row.specialization || 'General'}</span>
        </div>
      )
    },
    {
      header: "License Number",
      accessor: (row) => <span className="font-mono text-xs text-blue-600 font-bold">{row.license_number || 'N/A'}</span>,
    },
    {
      header: "Phone",
      accessor: (row) => (
        <div className="flex items-center gap-2 text-xs text-gray-600">
           <Phone size={12} className="text-gray-400" /> {row.phone || 'N/A'}
        </div>
      )
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
             <Stethoscope className="text-blue-600" size={32} />
             Doctors
          </h1>
          <p className="text-gray-500 mt-1">Manage prescribing physicians and medical partners</p>
        </div>
        <Button variant="primary" icon={Plus} size="md">Add Doctor</Button>
      </div>

      <div className="mb-6 relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
           <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search by name or specialization..." 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table 
        columns={columns} 
        data={filteredDoctors} 
        loading={loading} 
        emptyMessage="No doctors found" 
      />
    </DashboardContainer>
  );
}
