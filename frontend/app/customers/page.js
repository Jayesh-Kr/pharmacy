"use client";

import { useEffect, useState } from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import axiosInstance from "@/lib/axios";
import { Plus, Search, UserPlus, Phone, Mail, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function CustomersPage() {
  const emptyForm = {
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    date_of_birth: ""
  };

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

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

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingId(row.customer_id);
    setFormData({
      customer_name: row.customer_name || "",
      phone: row.phone || "",
      email: row.email || "",
      address: row.address || "",
      date_of_birth: row.date_of_birth ? new Date(row.date_of_birth).toISOString().slice(0, 10) : ""
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axiosInstance.put(`/customers/${editingId}`, formData);
        toast.success("Customer updated");
      } else {
        await axiosInstance.post("/customers", formData);
        toast.success("Customer created");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

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
          <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>Edit</Button>
          <Link href={`/sales?customer_id=${row.customer_id}`} className="no-underline">
            <Button variant="ghost" size="sm" className="text-blue-600 font-bold">Sales History</Button>
          </Link>
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
        <Button variant="primary" icon={Plus} size="md" onClick={openCreate}>Register Patient</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{editingId ? "Edit Patient" : "Register New Patient"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="customer_name" label="Customer Name *" value={formData.customer_name} onChange={(e) => setFormData((prev) => ({ ...prev, customer_name: e.target.value }))} required />
            <Input id="phone" label="Phone *" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} required />
            <Input id="email" label="Email" type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} />
            <Input id="date_of_birth" label="Date of Birth" type="date" value={formData.date_of_birth} onChange={(e) => setFormData((prev) => ({ ...prev, date_of_birth: e.target.value }))} />
            <div className="md:col-span-2">
              <Input id="address" label="Address" value={formData.address} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} />
            </div>
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
