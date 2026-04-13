"use client";

import { useEffect, useState } from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import axiosInstance from "@/lib/axios";
import { Plus, Search, Tags, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/categories");
      setCategories(res.data);
    } catch (err) {
      toast.error("Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/categories/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  const filteredCategories = categories.filter(c => 
    c.category_name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Category Name",
      accessor: (row) => <span className="font-bold text-gray-900">{row.category_name}</span>,
    },
    {
      header: "Description",
      accessor: "description",
      className: "max-w-xs truncate"
    },
    {
      header: "Created On",
      accessor: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" icon={Edit}>Edit</Button>
          <Button 
            variant="ghost" 
            size="sm" 
            icon={Trash2} 
            className="text-red-400 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
               if (confirm("Delete this category?")) handleDelete(row.category_id);
            }}
          >
             Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
             <Tags className="text-blue-600" size={32} />
             Medicine Categories
          </h1>
          <p className="text-gray-500 mt-1">Organize your medicines by therapeutic class</p>
        </div>
        <Button variant="primary" icon={Plus} size="md">New Category</Button>
      </div>

      <div className="mb-6 relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
           <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search categories..." 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table 
        columns={columns} 
        data={filteredCategories} 
        loading={loading} 
        emptyMessage="No medicine categories found" 
      />
    </DashboardContainer>
  );
}
