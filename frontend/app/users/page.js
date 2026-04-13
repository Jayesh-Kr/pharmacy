"use client";

import { useEffect, useState } from "react";
import DashboardContainer from "@/components/layout/DashboardContainer";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import axiosInstance from "@/lib/axios";
import { Plus, Search, Users, Shield, UserCheck, UserX } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
       toast.error("Unauthorized! Admin access only.");
       router.push("/dashboard");
    }
  }, [currentUser, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/users");
      setUsers(res.data);
    } catch (err) {
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
     try {
        await axiosInstance.put(`/users/${user.user_id}`, {
           ...user,
           is_active: !user.is_active
        });
        toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
        fetchUsers();
     } catch (err) {
        toast.error("failed to update user status");
     }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "System User",
      accessor: (row) => (
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-gray-100 text-gray-400 flex items-center justify-center rounded-xl font-bold">
              <Users size={18} />
           </div>
           <div>
              <p className="font-bold text-gray-900">{row.full_name}</p>
              <p className="text-xs text-gray-400">@{row.username}</p>
           </div>
        </div>
      )
    },
    {
      header: "Access Role",
      accessor: (row) => (
        <div className="flex items-center gap-2">
           <Shield size={14} className={cn(row.role === 'admin' ? "text-red-500" : "text-blue-500")} />
           <span className="text-sm font-bold capitalize">{row.role}</span>
        </div>
      )
    },
    {
      header: "Email Address",
      accessor: "email",
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge variant={row.is_active ? "green" : "red"}>
           {row.is_active ? "Active" : "Deactivated"}
        </Badge>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant={row.is_active ? "danger" : "success"} 
            size="sm" 
            icon={row.is_active ? UserX : UserCheck}
            onClick={() => handleToggleStatus(row)}
            disabled={row.user_id === currentUser?.user_id}
          >
            {row.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      )
    }
  ];

  if (currentUser?.role !== 'admin') return null;

  return (
    <DashboardContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
             <Shield className="text-blue-600" size={32} />
             User Management
          </h1>
          <p className="text-gray-500 mt-1">Control system access and user permissions</p>
        </div>
        <Button variant="primary" icon={Plus} size="md">Create Staff User</Button>
      </div>

      <div className="mb-6 relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
           <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search by name or username..." 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table 
        columns={columns} 
        data={filteredUsers} 
        loading={loading} 
        emptyMessage="No users found" 
      />
    </DashboardContainer>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}
