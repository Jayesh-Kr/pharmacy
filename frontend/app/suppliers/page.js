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
  const emptyForm = {
    supplier_name: "",
    contact_person: "",
    phone: "",
    email: "",
    city: "",
    address: ""
  };

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

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

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingId(row.supplier_id);
    setFormData({
      supplier_name: row.supplier_name || "",
      contact_person: row.contact_person || "",
      phone: row.phone || "",
      email: row.email || "",
      city: row.city || "",
      address: row.address || ""
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axiosInstance.put(`/suppliers/${editingId}`, formData);
        toast.success("Supplier updated");
      } else {
        await axiosInstance.post("/suppliers", formData);
        toast.success("Supplier added");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save supplier");
    } finally {
      setSaving(false);
    }
  };

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
          <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>Edit</Button>
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
        <Button variant="primary" icon={Plus} size="md" onClick={openCreate}>Add Supplier</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{editingId ? "Edit Supplier" : "Add New Supplier"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="supplier_name" label="Supplier Name *" value={formData.supplier_name} onChange={(e) => setFormData((prev) => ({ ...prev, supplier_name: e.target.value }))} required />
            <Input id="contact_person" label="Contact Person" value={formData.contact_person} onChange={(e) => setFormData((prev) => ({ ...prev, contact_person: e.target.value }))} />
            <Input id="phone" label="Phone *" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} required />
            <Input id="email" label="Email" type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} />
            <Input id="city" label="City" value={formData.city} onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))} />
            <Input id="address" label="Address" value={formData.address} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" loading={saving}>{editingId ? "Update" : "Create"}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

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
