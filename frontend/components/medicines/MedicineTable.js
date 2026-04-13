"use client";

import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Edit, Trash2, Eye, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function MedicineTable({ data = [], loading = false, onDelete }) {
  const columns = [
    {
      header: "Medicine Name",
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{row.medicine_name}</span>
          <span className="text-xs text-gray-400 italic">{row.generic_name || 'No generic name'}</span>
        </div>
      )
    },
    {
      header: "Category",
      accessor: "category_name",
    },
    {
      header: "Price",
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Sell: ${parseFloat(row.selling_price).toFixed(2)}</span>
          <span className="text-xs text-gray-500 line-through">Buy: ${parseFloat(row.purchase_price).toFixed(2)}</span>
        </div>
      )
    },
    {
      header: "Stock",
      accessor: (row) => {
        const isLow = row.stock_quantity <= row.reorder_level;
        return (
          <div className="flex items-center gap-2">
            <span className={cn("font-bold", isLow ? "text-red-600" : "text-gray-900")}>
              {row.stock_quantity} {row.unit}
            </span>
            {isLow && (
               <Badge variant="red" className="animate-pulse">
                  Low Stock
               </Badge>
            )}
          </div>
        );
      }
    },
    {
      header: "Expiry",
      accessor: (row) => {
        if (!row.expiry_date) return <span className="text-gray-400">-</span>;
        const date = new Date(row.expiry_date);
        const today = new Date();
        const diff = (date - today) / (1000 * 60 * 60 * 24);
        
        return (
          <span className={cn(
            "text-sm font-medium",
            diff < 0 ? "text-red-600 font-bold" : diff < 30 ? "text-yellow-600" : "text-gray-600"
          )}>
            {date.toLocaleDateString()}
            {diff < 0 && " (Expired)"}
          </span>
        );
      }
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/medicines/${row.medicine_id}/edit`}>
            <Button variant="secondary" size="sm" icon={Edit}>Edit</Button>
          </Link>
          <Button 
            variant="danger" 
            size="sm" 
            icon={Trash2}
            onClick={(e) => {
               e.stopPropagation();
               if (confirm("Are you sure you want to delete this medicine?")) {
                 onDelete(row.medicine_id);
               }
            }}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <Table 
      columns={columns} 
      data={data} 
      loading={loading} 
      emptyMessage="No medicines found in the inventory"
    />
  );
}

// Utility function for conditional classes inside the component file
function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}
