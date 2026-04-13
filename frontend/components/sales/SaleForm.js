"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Trash2, Plus, Search, User, CreditCard, ShoppingBag, Percent } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SaleForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [items, setItems] = useState([
    { medicine_id: "", quantity: 1, unit_price: 0, subtotal: 0, max_stock: 0 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, medRes] = await Promise.all([
          axiosInstance.get("/customers"),
          axiosInstance.get("/medicines")
        ]);
        setCustomers(custRes.data.map(c => ({ label: c.customer_name, value: c.customer_id })));
        setMedicines(medRes.data);
      } catch (err) {
        toast.error("Error loading sales data");
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { medicine_id: "", quantity: 1, unit_price: 0, subtotal: 0, max_stock: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length ? newItems : [{ medicine_id: "", quantity: 1, unit_price: 0, subtotal: 0, max_stock: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === "medicine_id") {
      const selectedMed = medicines.find(m => m.medicine_id.toString() === value);
      if (selectedMed) {
        item.medicine_id = value;
        item.unit_price = parseFloat(selectedMed.selling_price);
        item.max_stock = selectedMed.stock_quantity;
        item.subtotal = item.unit_price * item.quantity;
      }
    } else if (field === "quantity") {
      item.quantity = parseInt(value) || 0;
      if (item.quantity > item.max_stock) {
        toast.error(`Low stock! Only ${item.max_stock} units available.`);
        item.quantity = item.max_stock;
      }
      item.subtotal = item.unit_price * item.quantity;
    }
    
    setItems(newItems);
  };

  const rawTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const finalTotal = Math.max(0, rawTotal - discount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) return toast.error("Please select a customer");
    if (items.some(item => !item.medicine_id)) return toast.error("Please select medicines for all rows");

    setLoading(true);
    try {
      const saleData = {
        customer_id: selectedCustomerId,
        total_amount: finalTotal,
        discount: discount,
        paid_amount: finalTotal, // Simple version: assuming full payment
        payment_method: paymentMethod,
        items: items.map(({ medicine_id, quantity, unit_price, subtotal }) => ({
          medicine_id, quantity, unit_price, subtotal
        }))
      };

      const res = await axiosInstance.post("/sales", saleData);
      toast.success("Sale completed successfully!");
      router.push(`/sales/${res.data.sale_id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error processing sale");
    } finally {
      setLoading(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Medicine Selection Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2 text-blue-600 font-bold">
               <ShoppingBag size={20} />
               <span>Cart Items</span>
            </div>
            <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={handleAddItem}>
              Add Item
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-gray-400 uppercase bg-gray-50/30">
                <tr>
                  <th className="px-6 py-3">Medicine</th>
                  <th className="px-6 py-3 w-32">Qty</th>
                  <th className="px-6 py-3 w-32 text-right">Unit Price</th>
                  <th className="px-6 py-3 w-32 text-right">Subtotal</th>
                  <th className="px-6 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <Select 
                        value={item.medicine_id}
                        onChange={(e) => handleItemChange(index, "medicine_id", e.target.value)}
                        options={medicines.map(m => ({ 
                           label: `${m.medicine_name} (${m.stock_quantity} avail)`, 
                           value: m.medicine_id 
                        }))}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input 
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-gray-500">
                      ${item.unit_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ${item.subtotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Checkout Sidebar */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-4">Checkout</h2>
          
          <div className="space-y-4">
            <Select 
              label="Select Customer *" 
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              options={customers}
            />
            
            <Select 
              label="Payment Method" 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                {label: "Cash", value: "Cash"},
                {label: "Card", value: "Card"},
                {label: "UPI", value: "UPI"},
                {label: "Insurance", value: "Insurance"}
              ]}
            />

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Discount ($)</label>
              <div className="absolute inset-y-0 left-0 pl-3 pt-6 pointer-events-none text-gray-400">
                <Percent size={14} />
              </div>
              <input 
                 type="number" 
                 className="block w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 value={discount}
                 onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
            <div className="flex justify-between text-gray-500 text-sm font-medium">
              <span>Subtotal</span>
              <span>${rawTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-500 text-sm font-medium border-b border-gray-200 pb-3">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-900">
              <span className="font-bold text-lg">Total</span>
              <span className="font-black text-2xl tracking-tighter text-blue-600">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button 
             type="submit" 
             variant="primary" 
             className="w-full py-4 text-lg font-bold" 
             loading={loading}
             icon={CreditCard}
          >
             Complete Sale
          </Button>
        </div>
      </div>
    </form>
  );
}
