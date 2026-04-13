"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Button from "@/components/ui/Button";
import { Input, Select, TextArea } from "@/components/ui/Input";
import axiosInstance from "@/lib/axios";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

function newItem() {
  return {
    medicine_id: "",
    dosage: "",
    quantity: 1,
    duration_days: ""
  };
}

export default function AddPrescriptionPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [formData, setFormData] = useState({
    customer_id: "",
    doctor_id: "",
    prescription_date: new Date().toISOString().slice(0, 10),
    notes: "",
    items: [newItem()]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, doctorsRes, medicinesRes] = await Promise.all([
          axiosInstance.get("/customers"),
          axiosInstance.get("/doctors"),
          axiosInstance.get("/medicines")
        ]);

        setCustomers(customersRes.data);
        setDoctors(doctorsRes.data);
        setMedicines(medicinesRes.data);
      } catch (err) {
        toast.error("Failed to load prescription dependencies");
      }
    };

    fetchData();
  }, []);

  const updateItem = (index, field, value) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem()] }));
  };

  const removeItem = (index) => {
    setFormData((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: items.length > 0 ? items : [newItem()] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.doctor_id) {
      toast.error("Please select customer and doctor");
      return;
    }

    if (formData.items.some((item) => !item.medicine_id || Number(item.quantity) <= 0)) {
      toast.error("Please fill all prescription item details");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_id: Number(formData.customer_id),
        doctor_id: Number(formData.doctor_id),
        prescription_date: formData.prescription_date,
        notes: formData.notes || null,
        items: formData.items.map((item) => ({
          medicine_id: Number(item.medicine_id),
          dosage: item.dosage || null,
          quantity: Number(item.quantity),
          duration_days: item.duration_days ? Number(item.duration_days) : null
        }))
      };

      await axiosInstance.post("/prescriptions", payload);
      toast.success("Prescription created successfully");
      router.push("/prescriptions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContainer>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add Prescription</h1>
            <p className="text-gray-500 mt-1">Create a prescription and map all requested medicines</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => router.push("/prescriptions")}>Cancel</Button>
            <Button variant="primary" loading={loading} onClick={handleSubmit}>Save Prescription</Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Customer *"
                value={formData.customer_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, customer_id: e.target.value }))}
                options={customers.map((c) => ({ label: c.customer_name, value: c.customer_id }))}
                required
              />
              <Select
                label="Doctor *"
                value={formData.doctor_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, doctor_id: e.target.value }))}
                options={doctors.map((d) => ({ label: d.doctor_name, value: d.doctor_id }))}
                required
              />
              <Input
                label="Prescription Date"
                type="date"
                value={formData.prescription_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, prescription_date: e.target.value }))}
                required
              />
            </div>
            <TextArea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes from doctor"
            />
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Prescription Items</h2>
              <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addItem}>
                Add Item
              </Button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 border border-gray-100 rounded-xl p-3 items-end">
                <div className="md:col-span-4">
                  <Select
                    label="Medicine"
                    value={item.medicine_id}
                    onChange={(e) => updateItem(index, "medicine_id", e.target.value)}
                    options={medicines.map((m) => ({ label: m.medicine_name, value: m.medicine_id }))}
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    label="Dosage"
                    value={item.dosage}
                    onChange={(e) => updateItem(index, "dosage", e.target.value)}
                    placeholder="e.g. 1-0-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Duration (days)"
                    type="number"
                    min="1"
                    value={item.duration_days}
                    onChange={(e) => updateItem(index, "duration_days", e.target.value)}
                  />
                </div>
                <div className="md:col-span-1 flex md:justify-end">
                  <Button type="button" variant="ghost" size="sm" icon={Trash2} onClick={() => removeItem(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </section>
        </form>
      </div>
    </DashboardContainer>
  );
}
