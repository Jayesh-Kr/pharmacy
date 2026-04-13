"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Button from "@/components/ui/Button";
import axiosInstance from "@/lib/axios";
import { ArrowLeft, User, Stethoscope, Calendar, ClipboardList, Pill, Package, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PrescriptionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await axiosInstance.get(`/prescriptions/${id}`);
        setPrescription(res.data);
      } catch (err) {
        toast.error("Error loading prescription");
        router.push("/prescriptions");
      } finally {
        setLoading(false);
      }
    };
    fetchPrescription();
  }, [id, router]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
             <ClipboardList className="text-blue-600" size={32} />
             Prescription Details
          </h1>
          <p className="text-gray-500 mt-1">Detailed medical order for fulfillment</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" icon={ArrowLeft} onClick={() => router.back()}>Back</Button>
           <Button 
             variant="primary" 
             icon={ArrowRight} 
             onClick={() => router.push(`/sales/new?prescription_id=${id}&customer_id=${prescription.customer_id}`)}
           >
              Create Sale
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Side: Prescription Header Info */}
         <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
               <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-50">
                     <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Patient Information</p>
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl font-bold">
                           {prescription.customer_name?.charAt(0)}
                        </div>
                        <div>
                           <h2 className="text-lg font-bold text-gray-900">{prescription.customer_name}</h2>
                           <p className="text-sm text-gray-500">{prescription.customer_phone}</p>
                        </div>
                     </div>
                  </div>

                  <div className="pb-4 border-b border-gray-50">
                     <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Doctor Information</p>
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl font-bold">
                           DR
                        </div>
                        <div>
                           <h2 className="text-lg font-bold text-gray-900">{prescription.doctor_name}</h2>
                           <p className="text-xs font-black tracking-widest text-indigo-500 uppercase">{prescription.specialization}</p>
                           <p className="text-[10px] text-gray-400 mt-1">License: {prescription.license_number}</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-2">
                     <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Order Info</p>
                     <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                        <span className="text-xs font-bold text-gray-400">Date</span>
                        <span className="text-sm font-black text-gray-700">{new Date(prescription.prescription_date).toLocaleDateString()}</span>
                     </div>
                     <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl mt-2">
                        <span className="text-xs font-bold text-gray-400">Reference</span>
                        <span className="text-sm font-black text-gray-700">#PR-{prescription.prescription_id}</span>
                     </div>
                  </div>
               </div>
            </section>

            {/* Notes Section */}
            {prescription.notes && (
               <section className="bg-amber-50 p-8 rounded-2xl border border-amber-100 shadow-sm">
                  <h3 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                     <Package size={16} /> Clinical Notes
                  </h3>
                  <p className="text-sm text-amber-700 leading-relaxed italic">{prescription.notes}</p>
               </section>
            )}
         </div>

         {/* Right Side: Prescribed Medicines List */}
         <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                     <Pill className="text-blue-600" size={20} />
                     Medication Regimen
                  </h2>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="text-xs font-bold text-gray-400 uppercase bg-gray-50/30">
                        <tr>
                           <th className="px-8 py-4">Medicine Item</th>
                           <th className="px-8 py-4 text-center">Dosage</th>
                           <th className="px-8 py-4 text-center">Duration</th>
                           <th className="px-8 py-4 text-right">Qty</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {prescription.items.map((item, index) => (
                           <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-8 py-6">
                                 <div>
                                    <p className="font-bold text-gray-900 text-lg">{item.medicine_name}</p>
                                    <p className="text-xs text-gray-400 italic">Generic: {item.generic_name || 'N/A'}</p>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold text-xs border border-indigo-100 uppercase">
                                    {item.dosage || 'As directed'}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <span className="font-bold text-gray-600">
                                    {item.duration_days ? `${item.duration_days} Days` : '-'}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <span className="font-black text-gray-900 text-lg">
                                    {item.quantity} {item.unit}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               <div className="p-8 bg-gray-50/50 border-t border-gray-50">
                  <div className="flex items-center gap-4 text-sm text-gray-500 italic">
                     <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                     This prescription is valid for fulfillment. Use the "Create Sale" button to process this request in the POS system.
                  </div>
               </div>
            </div>
         </div>
      </div>
    </DashboardContainer>
  );
}
