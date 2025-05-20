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
  CheckCircle, CircleX, Loader2
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
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Refresh users function
  const refreshUsers = async () => {
    try {
      setLoadingUsers(true);
      setApiError(null);
      
      // Special case for superadmin user - if it's the hardcoded superadmin
      if (user?.email === hardcodedSuperadminEmail) {
        console.log("Fetching users as superadmin");
        
        try {
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

  // Fetch users from database
  useEffect(() => {
    if (user && (user.role === "admin" || user.email === hardcodedSuperadminEmail)) {
      refreshUsers();
    }
  }, [session?.access_token, user, hardcodedSuperadminEmail]);

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
          <div className="flex items-center gap-2">
            <Button onClick={refreshUsers} variant="outline" size="icon" title="Refresh data">
              {loadingUsers ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
              )}
            </Button>
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
        </div>
        
        {apiError && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md mb-4">
            <p className="text-sm font-medium">Kesalahan mengambil data: {apiError}</p>
            <p className="text-xs mt-1">Silakan coba refresh halaman atau logout dan login kembali</p>
          </div>
        )}
        
        {loadingUsers ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
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
                      <TableCell className="font-medium">{user.id && typeof user.id === 'string' ? user.id.substring(0, 8) + '...' : 'N/A'}</TableCell>
                      <TableCell>{user.user_metadata?.name || "-"}</TableCell>
                      <TableCell>{user.email || 'No email'}</TableCell>
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
                    <TableCell colSpan={6} className="text-center">
                      {apiError ? 'Terjadi kesalahan saat memuat data' : 'Tidak ada data pengguna yang sesuai.'}
                    </TableCell>
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
