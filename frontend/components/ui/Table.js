"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No data found",
  rowClassName,
  onRowClick,
}) => {
  return (
    <div className="w-full h-full overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm relative">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-bold text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map((col, index) => (
                <th 
                   key={index} 
                   className={cn("px-6 py-4 font-semibold tracking-wider", col.className)}
                   style={col.width ? { width: col.width } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-3">
                 <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
                 <p className="text-sm font-semibold text-gray-500">Loading data...</p>
              </div>
            )}
            
            {data.length === 0 && !loading && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-gray-500 italic">
                   {emptyMessage}
                </td>
              </tr>
            )}

            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                   "group transition-all hover:bg-blue-50/50 cursor-pointer",
                   onRowClick && "cursor-pointer",
                   rowClassName && rowClassName(row)
                )}
              >
                {columns.map((col, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={cn("px-6 py-4 whitespace-nowrap text-gray-700 font-medium", col.cellClassName)}
                  >
                    {col.accessor ? (
                       typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
