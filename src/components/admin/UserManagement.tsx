
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, Plus, Trash, Edit, Search, 
  CheckCircle, CircleX 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserManagementProps {
  hardcodedSuperadminEmail: string;
}

export const UserManagement = ({ hardcodedSuperadminEmail }: UserManagementProps) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [searchUser, setSearchUser] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "auditor",
    password: "",
  });

  // Edit user form state
  const [editUser, setEditUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "auditor",
  });

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        
        // Special case for superadmin user - if it's the hardcoded superadmin
        if (user?.email === hardcodedSuperadminEmail) {
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
          
          const result = await response.json();
          
          if (response.ok) {
            setUsers(result.data?.users || []);
          } else {
            throw new Error(result.error || "Failed to fetch users");
          }
          
          setLoadingUsers(false);
          return;
        }

        if (!session?.access_token) {
          toast({
            title: "Error",
            description: "No access token available for admin operations",
            variant: 'destructive'
          });
          setUsers([]);
          return;
        }

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
        
        const result = await response.json();
        
        if (response.ok) {
          setUsers(result.data?.users || []);
        } else {
          throw new Error(result.error || "Failed to fetch users");
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: `Gagal mengambil data pengguna: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`,
          variant: 'destructive'
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    if (user && (user.role === "admin" || user.email === hardcodedSuperadminEmail)) {
      fetchUsers();
    }
  }, [toast, session?.access_token, user, hardcodedSuperadminEmail]);

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    (user.user_metadata?.name || "").toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleAddUser = async () => {
    try {
      if (!newUser.email || !newUser.password) {
        toast({
          title: "Error",
          description: "Email dan password harus diisi",
          variant: 'destructive'
        });
        return;
      }

      if (user?.email === hardcodedSuperadminEmail) {
        const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "createUser",
            userData: {
              email: newUser.email,
              password: newUser.password,
              name: newUser.name,
              role: newUser.role,
              emailConfirm: true
            },
            superadmin: true,
            superadminEmail: hardcodedSuperadminEmail
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "Failed to create user");
        }

        toast({
          title: "Pengguna Ditambahkan",
          description: `${newUser.name} telah ditambahkan sebagai ${newUser.role === 'admin' ? 'admin' : 'auditor'}`
        });

        const usersResponse = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
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
        
        const usersResult = await usersResponse.json();
        
        if (usersResponse.ok) {
          setUsers(usersResult.data?.users || []);
        }
        
        setIsAddUserDialogOpen(false);
        setNewUser({
          name: "",
          email: "",
          role: "auditor",
          password: "",
        });
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
          action: "createUser",
          userData: {
            email: newUser.email,
            password: newUser.password,
            name: newUser.name,
            role: newUser.role,
            emailConfirm: true
          }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create user");
      }

      toast({
        title: "Pengguna Ditambahkan",
        description: `${newUser.name} telah ditambahkan sebagai ${newUser.role === 'admin' ? 'admin' : 'auditor'}`
      });

      const usersResponse = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: "listUsers"
        })
      });
      
      const usersResult = await usersResponse.json();
      
      if (usersResponse.ok) {
        setUsers(usersResult.data?.users || []);
      }
      
      setIsAddUserDialogOpen(false);
      setNewUser({
        name: "",
        email: "",
        role: "auditor",
        password: "",
      });
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: `Gagal menambahkan pengguna: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`,
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = async () => {
    try {
      if (!editUser.id || !editUser.email) {
        toast({
          title: "Error",
          description: "Data pengguna tidak lengkap",
          variant: 'destructive'
        });
        return;
      }

      if (user?.email === hardcodedSuperadminEmail) {
        const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "updateUser",
            userId: editUser.id,
            userData: {
              email: editUser.email,
              name: editUser.name,
              role: editUser.role
            },
            superadmin: true,
            superadminEmail: hardcodedSuperadminEmail
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "Failed to update user");
        }

        toast({
          title: "Pengguna Diperbarui",
          description: `${editUser.name} telah diperbarui`
        });

        const usersResponse = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
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
        
        const usersResult = await usersResponse.json();
        
        if (usersResponse.ok) {
          setUsers(usersResult.data?.users || []);
        }
        
        setIsEditUserDialogOpen(false);
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
          action: "updateUser",
          userId: editUser.id,
          userData: {
            email: editUser.email,
            name: editUser.name,
            role: editUser.role
          }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to update user");
      }

      toast({
        title: "Pengguna Diperbarui",
        description: `${editUser.name} telah diperbarui`
      });

      const usersResponse = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: "listUsers"
        })
      });
      
      const usersResult = await usersResponse.json();
      
      if (usersResponse.ok) {
        setUsers(usersResult.data?.users || []);
      }
      
      setIsEditUserDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: `Gagal memperbarui pengguna: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`,
        variant: 'destructive'
      });
    }
  };

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
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "Failed to delete user");
        }

        toast({
          title: "Pengguna Dihapus",
          description: "Pengguna berhasil dihapus"
        });

        const usersResponse = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
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
        
        const usersResult = await usersResponse.json();
        
        if (usersResponse.ok) {
          setUsers(usersResult.data?.users || []);
        }
        
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
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      toast({
        title: "Pengguna Dihapus",
        description: "Pengguna berhasil dihapus"
      });

      const usersResponse = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: "listUsers"
        })
      });
      
      const usersResult = await usersResponse.json();
      
      if (usersResponse.ok) {
        setUsers(usersResult.data?.users || []);
      }
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Manajemen Pengguna</CardTitle>
        <CardDescription>Kelola pengguna dan peran mereka</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pengguna..."
              className="pl-8"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>
                  Buat akun pengguna baru pada platform COBAIN.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nama
                  </Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Peran
                  </Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Pilih peran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="auditor">Auditor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Kata Sandi
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddUser}>Tambah Pengguna</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {loadingUsers ? (
          <div className="text-center py-8">
            <p>Memuat data pengguna...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id.substring(0, 8)}...</TableCell>
                      <TableCell>{user.user_metadata?.name || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.user_metadata?.role || "auditor"}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {!user.banned_until ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <CircleX className="mr-2 h-4 w-4 text-red-500" />
                              Nonaktif
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditUserDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Tidak ada data pengguna yang sesuai.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit User Dialog */}
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pengguna</DialogTitle>
              <DialogDescription>
                Perbarui detail pengguna
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nama
                </Label>
                <Input
                  id="edit-name"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Peran
                </Label>
                <Select
                  value={editUser.role}
                  onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditUser}>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
