
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
  banned_until: string | null;
}

export const useUserManagement = (hardcodedSuperadminEmail: string) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  
  // Edit user form state
  const [editUser, setEditUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "auditor",
  });

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    (user.user_metadata?.name || "").toLowerCase().includes(searchUser.toLowerCase())
  );

  // Refresh users function
  const refreshUsers = async () => {
    try {
      setLoadingUsers(true);
      setApiError(null);
      
      // Special case for superadmin user - if it's the hardcoded superadmin
      if (user?.email === hardcodedSuperadminEmail) {
        console.log("Fetching users as superadmin");
        
        try {
          // Call the edge function with superadmin credentials
          const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              action: "listUsers",
              superadmin: true,
              superadminEmail: hardcodedSuperadminEmail
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error! Status: ${response.status}`, errorText);
            throw new Error(`Kesalahan server: ${response.status}`);
          }
          
          const result = await response.json();
          console.log("User data received:", result);
          
          if (result.data?.users) {
            setUsers(result.data.users);
          } else if (result.users) {
            // Alternative format
            setUsers(result.users);
          } else {
            throw new Error("Format data tidak valid");
          }
        } catch (error) {
          console.error('Error fetching users:', error);
          setApiError(error instanceof Error ? error.message : 'Kesalahan tidak diketahui');
          setUsers([]);
        }
        
        setLoadingUsers(false);
        return;
      }

      if (!session?.access_token) {
        setApiError("Token akses tidak tersedia untuk operasi admin");
        setUsers([]);
        setLoadingUsers(false);
        return;
      }

      console.log("Fetching users with access token");
      const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: "listUsers"
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! Status: ${response.status}`, errorText);
        throw new Error(`Kesalahan server: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("User data received:", result);
      
      if (result.data?.users) {
        setUsers(result.data.users);
      } else if (result.users) {
        // Alternative format
        setUsers(result.users);
      } else {
        throw new Error("Format data tidak valid");
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setApiError(error instanceof Error ? error.message : 'Kesalahan tidak diketahui');
      toast({
        title: 'Error',
        description: `Gagal mengambil data pengguna: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`,
        variant: 'destructive'
      });
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Delete user function
  const handleDeleteUser = async (userId: string) => {
    try {
      if (user?.email === hardcodedSuperadminEmail) {
        const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "deleteUser",
            userId: userId,
            superadmin: true,
            superadminEmail: hardcodedSuperadminEmail
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP error! Status: ${response.status}`, errorText);
          throw new Error(`Kesalahan server: ${response.status}`);
        }
        
        const result = await response.json();
        
        toast({
          title: "Pengguna Dihapus",
          description: "Pengguna berhasil dihapus"
        });

        refreshUsers();
        return;
      }
        
      if (!session?.access_token) {
        toast({
          title: "Error",
          description: "No access token available. Silakan logout dan login kembali.",
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: "deleteUser",
          userId: userId
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! Status: ${response.status}`, errorText);
        throw new Error(`Kesalahan server: ${response.status}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "Pengguna Dihapus",
        description: "Pengguna berhasil dihapus"
      });

      refreshUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: `Gagal menghapus pengguna: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`,
        variant: 'destructive'
      });
    }
  };

  // Open edit user dialog and populate form
  const openEditUserDialog = (userData: any) => {
    setEditUser({
      id: userData.id,
      name: userData.user_metadata?.name || "",
      email: userData.email,
      role: userData.user_metadata?.role || "auditor",
    });
    setIsEditUserDialogOpen(true);
  };

  // Fetch users when mounted
  useEffect(() => {
    if (user && (user.role === "admin" || user.email === hardcodedSuperadminEmail)) {
      refreshUsers();
    }
  }, [session?.access_token, user, hardcodedSuperadminEmail]);

  return {
    users,
    loadingUsers,
    apiError,
    searchUser,
    setSearchUser,
    isAddUserDialogOpen,
    setIsAddUserDialogOpen,
    isEditUserDialogOpen,
    setIsEditUserDialogOpen,
    editUser,
    setEditUser,
    filteredUsers,
    refreshUsers,
    handleDeleteUser,
    openEditUserDialog
  };
};
