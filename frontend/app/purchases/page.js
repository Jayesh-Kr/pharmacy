"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { Plus, Trash2, ShoppingCart, Package, CheckCircle2, XCircle } from "lucide-react";

function buildEmptyItem(prefilledMedicineId = "") {
  return {
    medicine_id: prefilledMedicineId,
    quantity: 1,
    unit_price: 0,
    expiry_date: ""
  };
}

export default function PurchasesPage() {
  const [prefilledMedicineId, setPrefilledMedicineId] = useState("");
  const { user } = useAuth();

  const canManagePurchases = user?.role === "admin" || user?.role === "pharmacist";

  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    supplier_id: "",
    invoice_number: "",
    items: [buildEmptyItem(prefilledMedicineId)]
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const medicineId = params.get("medicine_id") || "";
    setPrefilledMedicineId(medicineId);
  }, []);

  useEffect(() => {
    if (!prefilledMedicineId) return;
    setFormData((prev) => ({
      ...prev,
      items: [buildEmptyItem(prefilledMedicineId)]
    }));
  }, [prefilledMedicineId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliersRes, medicinesRes, purchasesRes] = await Promise.all([
        axiosInstance.get("/suppliers"),
        axiosInstance.get("/medicines"),
        axiosInstance.get("/purchases")
      ]);

      setSuppliers(suppliersRes.data);
      setMedicines(medicinesRes.data);
      setPurchases(purchasesRes.data);
    } catch (err) {
      toast.error("Failed to load purchases data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, buildEmptyItem("")]
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      return {
        ...prev,
        items: items.length > 0 ? items : [buildEmptyItem("")]
      };
    });
  };

  const updateItem = (index, field, value) => {
    setFormData((prev) => {
      const nextItems = [...prev.items];
      const nextItem = { ...nextItems[index] };

      if (field === "medicine_id") {
        const med = medicines.find((m) => m.medicine_id.toString() === value.toString());
        nextItem.medicine_id = value;
        nextItem.unit_price = med ? Number(med.purchase_price) : 0;
      } else if (field === "quantity") {
        nextItem.quantity = Number(value) || 1;
      } else if (field === "unit_price") {
        nextItem.unit_price = Number(value) || 0;
      } else if (field === "expiry_date") {
        nextItem.expiry_date = value;
      }

      nextItems[index] = nextItem;
      return { ...prev, items: nextItems };
    });
  };

  const totalAmount = useMemo(
    () =>
      formData.items.reduce((sum, item) => {
        const lineTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
        return sum + lineTotal;
      }, 0),
    [formData.items]
  );

  const handleCreatePurchase = async (e) => {
    e.preventDefault();

    if (!formData.supplier_id) {
      toast.error("Select a supplier");
      return;
    }

    if (formData.items.some((item) => !item.medicine_id || Number(item.quantity) <= 0 || Number(item.unit_price) <= 0)) {
      toast.error("Please fill all item details correctly");
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.post("/purchases", {
        supplier_id: Number(formData.supplier_id),
        invoice_number: formData.invoice_number || null,
        total_amount: totalAmount,
        items: formData.items.map((item) => ({
          medicine_id: Number(item.medicine_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          subtotal: Number(item.quantity) * Number(item.unit_price),
          expiry_date: item.expiry_date || null
        }))
      });

      toast.success("Purchase created successfully");
      setFormData({
        supplier_id: "",
        invoice_number: "",
        items: [buildEmptyItem(prefilledMedicineId)]
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create purchase");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (purchaseId, status) => {
    try {
      await axiosInstance.put(`/purchases/${purchaseId}/status`, { status });
      toast.success(`Purchase marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update purchase status");
    }
  };

  const columns = [
    {
      header: "Purchase",
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">#PUR-{row.purchase_id}</span>
          <span className="text-xs text-gray-400">{new Date(row.purchase_date).toLocaleString()}</span>
        </div>
      )
    },
    {
      header: "Supplier",
      accessor: "supplier_name"
    },
    {
      header: "Invoice",
      accessor: (row) => row.invoice_number || "-"
    },
    {
      header: "Amount",
      accessor: (row) => <span className="font-bold">${Number(row.total_amount).toFixed(2)}</span>
    },
    {
      header: "Status",
      accessor: (row) => {
        if (row.status === "Received") return <Badge variant="green">Received</Badge>;
        if (row.status === "Cancelled") return <Badge variant="red">Cancelled</Badge>;
        return <Badge variant="yellow">Pending</Badge>;
      }
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          {canManagePurchases && row.status === "Pending" && (
            <>
              <Button size="sm" variant="success" icon={CheckCircle2} onClick={() => updateStatus(row.purchase_id, "Received")}>
                Receive
              </Button>
              <Button size="sm" variant="danger" icon={XCircle} onClick={() => updateStatus(row.purchase_id, "Cancelled")}>
                Cancel
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <DashboardContainer>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="text-blue-600" size={30} /> Purchases
          </h1>
          <p className="text-gray-500 mt-1">Create purchase orders and receive stock into inventory</p>
        </div>

        {canManagePurchases && (
          <form onSubmit={handleCreatePurchase} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart size={18} className="text-blue-600" /> New Purchase Order
              </h2>
              <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addItem}>
                Add Item
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Supplier *"
                id="supplier_id"
                value={formData.supplier_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, supplier_id: e.target.value }))}
                options={suppliers.map((s) => ({ label: s.supplier_name, value: s.supplier_id }))}
                required
              />
              <Input
                label="Invoice Number"
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData((prev) => ({ ...prev, invoice_number: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
                return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-100 rounded-xl p-3">
                    <div className="md:col-span-4">
                      <Select
                        label="Medicine"
                        value={item.medicine_id}
                        onChange={(e) => updateItem(index, "medicine_id", e.target.value)}
                        options={medicines.map((m) => ({ label: m.medicine_name, value: m.medicine_id }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Qty"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Unit Price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        label="Expiry Date"
                        type="date"
                        value={item.expiry_date}
                        onChange={(e) => updateItem(index, "expiry_date", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-1 flex md:justify-end">
                      <Button type="button" variant="ghost" size="sm" icon={Trash2} onClick={() => removeItem(index)}>
                        Remove
                      </Button>
                    </div>
                    <div className="md:col-span-12 text-right text-sm font-semibold text-gray-700">
                      Line Total: ${lineTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 pt-4">
              <p className="text-lg font-bold text-gray-900">Total: ${totalAmount.toFixed(2)}</p>
              <Button type="submit" variant="primary" loading={saving}>
                Create Purchase
              </Button>
            </div>
          </form>
        )}

        <Table
          columns={columns}
          data={purchases}
          loading={loading}
          emptyMessage="No purchase orders found"
        />
      </div>
    </DashboardContainer>
  );
}
