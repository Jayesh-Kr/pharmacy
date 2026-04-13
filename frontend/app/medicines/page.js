"use client";

import { useEffect, useState } from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import MedicineTable from "@/components/medicines/MedicineTable";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import axiosInstance from "@/lib/axios";
import { Plus, Search, Filter, Pill, FileDown } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/medicines");
      setMedicines(res.data);
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
      toast.error("Error loading medicines");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/categories");
      setCategories(res.data.map(cat => ({
        label: cat.category_name,
        value: cat.category_id.toString()
      })));
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/medicines/${id}`);
      toast.success("Medicine deleted successfully");
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete medicine");
    }
  };

  // Client-side filtering
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = 
      m.medicine_name.toLowerCase().includes(search.toLowerCase()) || 
      m.generic_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = 
      !categoryFilter || m.category_id.toString() === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Medicines</h1>
          <p className="text-gray-500 mt-1">Manage and track your pharmaceutical inventory</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" icon={FileDown} size="md">Export PDF</Button>
           <Link href="/medicines/add" className="no-underline">
              <Button variant="primary" icon={Plus} size="md">Add Medicine</Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
           <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                 <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search by name or generic name..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>
        <div>
           <Select 
             options={[{label: "All Categories", value: ""}, ...categories]} 
             value={categoryFilter}
             onChange={(e) => setCategoryFilter(e.target.value)}
           />
        </div>
      </div>

      <MedicineTable 
        data={filteredMedicines} 
        loading={loading} 
        onDelete={handleDelete} 
      />
    </DashboardContainer>
  );
}
