"use client";

import DashboardContainer from "@/components/layout/DashboardContainer";
import SaleForm from "@/components/sales/SaleForm";
import { ShoppingCart } from "lucide-react";

export default function NewSalePage() {
  return (
    <DashboardContainer>
      <div className="mb-8">
        <div className="flex items-center gap-3 text-blue-600 mb-2">
           <ShoppingCart size={28} strokeWidth={2.5} />
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Point of Sale (POS)</h1>
        </div>
        <p className="text-gray-500">Create a new sale transaction and generate an invoice</p>
      </div>

      <SaleForm />
    </DashboardContainer>
  );
}
