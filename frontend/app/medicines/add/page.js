"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Button from "@/components/ui/Button";
import { Input, Select, TextArea } from "@/components/ui/Input";
import axiosInstance from "@/lib/axios";
import { Save, X, Pill, Info } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AddMedicinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
        const [catRes, supRes] = await Promise.all([
          axiosInstance.get("/categories"),
          axiosInstance.get("/suppliers")
        ]);
        setCategories(catRes.data.map(c => ({ label: c.category_name, value: c.category_id })));
        setSuppliers(supRes.data.map(s => ({ label: s.supplier_name, value: s.supplier_id })));
      } catch (err) {
        toast.error("Error loading categories/suppliers");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post("/medicines", formData);
      toast.success("Medicine added successfully");
      router.push("/medicines");
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach(msg => toast.error(msg));
      } else {
        toast.error(err.response?.data?.message || "Error adding medicine");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add New Medicine</h1>
          <p className="text-gray-500 mt-1">Register a new product in your pharmacy catalog</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" icon={X} onClick={() => router.back()}>Cancel</Button>
           <Button variant="primary" icon={Save} onClick={handleSubmit} loading={loading}>Save Medicine</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Basic Information */}
           <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                 <Pill size={18} strokeWidth={2.5} />
                 <h2 className="text-lg font-bold">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input 
                   label="Medicine Name *" 
                   id="medicine_name" 
                   value={formData.medicine_name} 
                   onChange={handleChange} 
                   placeholder="e.g. Paracetamol"
                   required
                 />
                 <Input 
                   label="Generic Name" 
                   id="generic_name" 
                   value={formData.generic_name} 
                   onChange={handleChange}
                   placeholder="e.g. Acetaminophen"
                 />
                 <Select 
                   label="Category *" 
                   id="category_id" 
                   value={formData.category_id} 
                   onChange={handleChange}
                   options={categories}
                   required
                 />
                 <Select 
                   label="Supplier *" 
                   id="supplier_id" 
                   value={formData.supplier_id} 
                   onChange={handleChange}
                   options={suppliers}
                   required
                 />
                 <Select 
                   label="Unit Type" 
                   id="unit" 
                   value={formData.unit} 
                   onChange={handleChange}
                   options={[
                      {label: "Tablet", value: "Tablet"},
                      {label: "Capsule", value: "Capsule"},
                      {label: "Syrup", value: "Syrup"},
                      {label: "Injection", value: "Injection"},
                      {label: "Cream", value: "Cream"},
                      {label: "Vial", value: "Vial"}
                   ]}
                 />
                 <Input 
                   label="Expiry Date" 
                   id="expiry_date" 
                   type="date"
                   value={formData.expiry_date} 
                   onChange={handleChange}
                 />
              </div>
              <TextArea 
                 label="Description / Storage Notes" 
                 id="description" 
                 value={formData.description} 
                 onChange={handleChange} 
                 placeholder="Enter any specific storage or usage instructions..."
              />
           </section>

           {/* Pricing & Stock */}
           <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-green-600 mb-4">
                 <Info size={18} strokeWidth={2.5} />
                 <h2 className="text-lg font-bold">Pricing & Inventory</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input 
                   label="Purchase Price ($) *" 
                   id="purchase_price" 
                   type="number"
                   step="0.01"
                   value={formData.purchase_price} 
                   onChange={handleChange}
                   required
                 />
                 <Input 
                   label="Selling Price ($) *" 
                   id="selling_price" 
                   type="number"
                   step="0.01"
                   value={formData.selling_price} 
                   onChange={handleChange}
                   required
                 />
                 <Input 
                   label="Initial Stock *" 
                   id="stock_quantity" 
                   type="number"
                   value={formData.stock_quantity} 
                   onChange={handleChange}
                   required
                 />
                 <Input 
                   label="Reorder Level *" 
                   id="reorder_level" 
                   type="number"
                   value={formData.reorder_level} 
                   onChange={handleChange}
                   required
                 />
              </div>
           </section>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
           <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <h3 className="text-xl font-bold mb-4 relative z-10">Smart Reordering</h3>
              <p className="text-blue-100 opacity-90 text-sm relative z-10">
                 The <strong>Reorder Level</strong> helps you maintain optimal stock. When stock falls below this number, it will appear on your dashboard alerts.
              </p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
           </div>

           <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-400">Inventory Tips</h3>
              <ul className="space-y-4 text-sm text-gray-400">
                 <li className="flex gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    Always check the generic name to help customers with alternatives.
                 </li>
                 <li className="flex gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    Setting accurate expiry dates ensures patient safety.
                 </li>
                 <li className="flex gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    Profit margins are calculated automatically from buy/sell prices.
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </DashboardContainer>
  );
}
