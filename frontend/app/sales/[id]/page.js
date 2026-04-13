"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Button from "@/components/ui/Button";
import axiosInstance from "@/lib/axios";
import { Printer, ArrowLeft, Pill, User, Calendar, FileText } from "lucide-react";
import { toast } from "react-hot-toast";

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const res = await axiosInstance.get(`/sales/${id}`);
        setSale(res.data);
      } catch (err) {
        toast.error("Error loading invoice");
        router.push("/sales");
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [id, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div className="flex items-center justify-center p-20">
           <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Invoice Details</h1>
          <p className="text-gray-500 mt-1">Transaction record for Sale #SAL-{sale?.sale_id}</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" icon={ArrowLeft} onClick={() => router.back()}>Back</Button>
           <Button variant="primary" icon={Printer} onClick={handlePrint}>Print Invoice</Button>
        </div>
      </div>

      {/* Invoice Document */}
      <div 
        ref={printRef}
        className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0"
      >
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 border-b border-gray-100 pb-8">
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                 <Pill size={32} strokeWidth={2.5} />
                 <span className="text-2xl font-black tracking-tighter uppercase">Pharmacy DBMS</span>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                 <p>123 Medical Avenue, Healthcare City</p>
                 <p>Tax ID: PH-2024-001 | Phone: +1 (555) 001-2345</p>
              </div>
           </div>
           <div className="text-right flex flex-col justify-end">
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">INVOICE</h1>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">#SAL-{sale?.sale_id}</p>
           </div>
        </div>

        {/* Customer & Date Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
           <div className="space-y-4">
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Billed To</p>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-1">
                 <h2 className="text-xl font-bold text-gray-900">{sale?.customer_name}</h2>
                 <p className="text-sm text-gray-500">{sale?.address || "No address provided"}</p>
                 <p className="text-sm text-gray-500 font-mono mt-2">{sale?.phone}</p>
              </div>
           </div>
           <div className="space-y-4 md:text-right flex flex-col items-end">
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Transaction Info</p>
              <div className="space-y-2">
                 <div className="flex gap-4 justify-end">
                    <span className="text-sm text-gray-400 font-bold uppercase tracking-tight">Date:</span>
                    <span className="text-sm text-gray-700 font-black tracking-tight">{new Date(sale?.sale_date).toLocaleDateString()}</span>
                 </div>
                 <div className="flex gap-4 justify-end">
                    <span className="text-sm text-gray-400 font-bold uppercase tracking-tight">Payment:</span>
                    <span className="text-sm text-gray-700 font-black tracking-tight uppercase">{sale?.payment_method}</span>
                 </div>
                 <div className="flex gap-4 justify-end">
                    <span className="text-sm text-gray-400 font-bold uppercase tracking-tight">Handled By:</span>
                    <span className="text-sm text-gray-700 font-black tracking-tight underline decoration-blue-500/30 decoration-2">{sale?.created_by}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-12">
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b-2 border-gray-900 text-xs font-black uppercase tracking-widest text-gray-400">
                    <th className="py-4 pr-6">#</th>
                    <th className="py-4 pr-6">Medicine Description</th>
                    <th className="py-4 pr-6 text-center">Qty</th>
                    <th className="py-4 pr-6 text-right">Unit Price</th>
                    <th className="py-4 text-right">Total</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {sale?.items.map((item, index) => (
                    <tr key={index} className="group">
                       <td className="py-5 text-gray-400 font-bold">{index + 1}</td>
                       <td className="py-5">
                          <p className="font-black text-gray-900 tracking-tight">{item.medicine_name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{item.unit}</p>
                       </td>
                       <td className="py-5 text-center font-bold text-gray-700">{item.quantity}</td>
                       <td className="py-5 text-right font-mono text-gray-500">${parseFloat(item.unit_price).toFixed(2)}</td>
                       <td className="py-5 text-right font-black text-gray-900">${parseFloat(item.subtotal).toFixed(2)}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end pt-8 border-t-2 border-gray-900">
           <div className="w-full md:w-64 space-y-4">
              <div className="flex justify-between items-center text-gray-500 font-bold">
                 <span className="text-xs uppercase tracking-widest">Subtotal</span>
                 <span className="text-lg">${(parseFloat(sale?.total_amount) + parseFloat(sale?.discount)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-red-500 font-black">
                 <span className="text-xs uppercase tracking-widest">Discount</span>
                 <span className="text-lg">-${parseFloat(sale?.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-900 text-white p-6 rounded-2xl shadow-xl shadow-gray-200">
                 <span className="text-xs font-black uppercase tracking-widest opacity-60">Total Paid</span>
                 <span className="text-3xl font-black tracking-tighter">${parseFloat(sale?.total_amount).toFixed(2)}</span>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-12 border-t border-gray-100 text-center">
           <p className="text-sm font-bold text-gray-400 italic">Thank you for choosing Pharmacy DBMS. Take care of your health!</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
          }
          aside, header, footer, .print\\:hidden {
             display: none !important;
          }
          main {
             padding: 0 !important;
             margin: 0 !important;
          }
          .animate-in {
             animation: none !important;
          }
        }
      `}</style>
    </DashboardContainer>
  );
}
