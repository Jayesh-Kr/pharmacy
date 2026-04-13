"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Button from "@/components/ui/Button";
import { Input, Select, TextArea } from "@/components/ui/Input";
import axiosInstance from "@/lib/axios";
import { Save, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditMedicinePage() {
  const params = useParams();
  const router = useRouter();
  const medicineId = params.id;

  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [formData, setFormData] = useState({
    medicine_name: "",
    generic_name: "",
    category_id: "",
    supplier_id: "",
    unit: "Tablet",
    purchase_price: "",
    selling_price: "",
    stock_quantity: 0,
    reorder_level: 10,
    expiry_date: "",
    description: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, supRes, medicineRes] = await Promise.all([
          axiosInstance.get("/categories"),
          axiosInstance.get("/suppliers"),
          axiosInstance.get(`/medicines/${medicineId}`)
        ]);

        setCategories(catRes.data.map((c) => ({ label: c.category_name, value: c.category_id })));
        setSuppliers(supRes.data.map((s) => ({ label: s.supplier_name, value: s.supplier_id })));

        const med = medicineRes.data;
        setFormData({
          medicine_name: med.medicine_name || "",
          generic_name: med.generic_name || "",
          category_id: med.category_id || "",
          supplier_id: med.supplier_id || "",
          unit: med.unit || "Tablet",
          purchase_price: med.purchase_price || "",
          selling_price: med.selling_price || "",
          stock_quantity: med.stock_quantity ?? 0,
          reorder_level: med.reorder_level ?? 10,
          expiry_date: med.expiry_date ? new Date(med.expiry_date).toISOString().slice(0, 10) : "",
          description: med.description || ""
        });
      } catch (err) {
        toast.error("Failed to load medicine details");
        router.push("/medicines");
      } finally {
        setBootLoading(false);
      }
    };

    if (medicineId) {
      fetchData();
    }
  }, [medicineId, router]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.put(`/medicines/${medicineId}`, formData);
      toast.success("Medicine updated successfully");
      router.push("/medicines");
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((msg) => toast.error(msg));
      } else {
        toast.error(err.response?.data?.message || "Failed to update medicine");
      }
    } finally {
      setLoading(false);
    }
  };

  if (bootLoading) {
    return (
      <DashboardContainer>
        <div className="bg-white rounded-2xl border border-gray-100 p-8">Loading medicine details...</div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Medicine</h1>
            <p className="text-gray-500 mt-1">Update medicine details and stock settings</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={X} onClick={() => router.push("/medicines")}>Cancel</Button>
            <Button variant="primary" icon={Save} loading={loading} onClick={handleSubmit}>Save Changes</Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Medicine Name *" id="medicine_name" value={formData.medicine_name} onChange={handleChange} required />
            <Input label="Generic Name" id="generic_name" value={formData.generic_name} onChange={handleChange} />
            <Select label="Category" id="category_id" value={formData.category_id} onChange={handleChange} options={categories} />
            <Select label="Supplier" id="supplier_id" value={formData.supplier_id} onChange={handleChange} options={suppliers} />
            <Select
              label="Unit"
              id="unit"
              value={formData.unit}
              onChange={handleChange}
              options={[
                { label: "Tablet", value: "Tablet" },
                { label: "Capsule", value: "Capsule" },
                { label: "Syrup", value: "Syrup" },
                { label: "Injection", value: "Injection" },
                { label: "Cream", value: "Cream" },
                { label: "Vial", value: "Vial" }
              ]}
            />
            <Input label="Expiry Date" id="expiry_date" type="date" value={formData.expiry_date} onChange={handleChange} />
            <Input label="Purchase Price *" id="purchase_price" type="number" step="0.01" value={formData.purchase_price} onChange={handleChange} required />
            <Input label="Selling Price *" id="selling_price" type="number" step="0.01" value={formData.selling_price} onChange={handleChange} required />
            <Input label="Stock Quantity *" id="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleChange} required />
            <Input label="Reorder Level *" id="reorder_level" type="number" value={formData.reorder_level} onChange={handleChange} required />
          </div>
          <TextArea label="Description" id="description" value={formData.description} onChange={handleChange} />
        </form>
      </div>
    </DashboardContainer>
  );
}
