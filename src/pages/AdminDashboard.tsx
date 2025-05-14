import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  Users, FileText, Plus, Trash, Edit, Search, 
  CheckCircle, CircleX, UserCircle
} from "lucide-react";
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
import { PDFReport } from "@/components/PDFReport";
import { supabase } from "@/integrations/supabase/client";

// Domain and subdomain structure in Indonesian
const domainStructure = [
  {
    id: "EDM",
    name: "Evaluasi, Arahkan dan Pantau",
    subdomains: [
      { id: "EDM01", name: "Memastikan Pengaturan dan Pemeliharaan Kerangka Tata Kelola" },
      { id: "EDM02", name: "Memastikan Penyampaian Manfaat" },
      { id: "EDM03", name: "Memastikan Optimalisasi Risiko" },
    ]
  },
  {
    id: "APO",
    name: "Selaraskan, Rencanakan dan Organisasikan",
    subdomains: [
      { id: "APO01", name: "Mengelola Kerangka Manajemen TI" },
      { id: "APO09", name: "Mengelola Perjanjian Layanan" },
      { id: "APO10", name: "Mengelola Vendor" },
    ]
  },
  {
    id: "BAI",
    name: "Bangun, Peroleh dan Implementasikan",
    subdomains: [
      { id: "BAI03", name: "Mengelola Identifikasi dan Pembuatan Solusi" },
      { id: "BAI06", name: "Mengelola Perubahan TI" },
    ]
  },
  {
    id: "DSS",
    name: "Kirim, Layani dan Dukung",
    subdomains: [
      { id: "DSS01", name: "Mengelola Operasi" },
      { id: "DSS02", name: "Mengelola Permintaan Layanan dan Insiden" },
    ]
  },
  {
    id: "MEA",
    name: "Pantau, Evaluasi dan Nilai",
    subdomains: [
      { id: "MEA01", name: "Mengelola Pemantauan Kinerja dan Kesesuaian" },
      { id: "MEA02", name: "Mengelola Sistem Pengendalian Internal" },
    ]
  }
];

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [searchUser, setSearchUser] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isViewUserAuditsDialogOpen, setIsViewUserAuditsDialogOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [userAudits, setUserAudits] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingUserAudits, setLoadingUserAudits] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

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
    password: "",
  });

  // Fetch users from database via edge function
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        
        const { data: { users }, error } = await fetch(
          `https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
              operation: 'getUsers',
              superadmin: true,
              email: 'navazputra@students.amikom.ac.id'
            })
          }
        ).then(res => res.json());
        
        if (error) {
          throw new Error(error);
        }

        setUsers(users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Gagal mengambil data pengguna',
          variant: 'destructive'
        });
        
        // If there's an authorization error, set token error
        if (error.message && error.message.includes('Unauthorized')) {
          setTokenError('Tidak diizinkan mengakses data pengguna. Verifikasi bahwa Anda memiliki akses admin yang valid.');
        }
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [toast, session]);

  // Fetch user audits when selectedUserId changes
  useEffect(() => {
    const fetchUserAudits = async () => {
      if (!selectedUserId) return;
      
      try {
        setLoadingUserAudits(true);
        
        const { data: { audits }, error } = await fetch(
          `https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
              operation: 'getUserAudits',
              superadmin: true,
              email: 'navazputra@students.amikom.ac.id',
              userId: selectedUserId
            })
          }
        ).then(res => res.json());
        
        if (error) {
          throw new Error(error);
        }

        setUserAudits(audits || []);
      } catch (error) {
        console.error('Error fetching user audits:', error);
        toast({
          title: 'Error',
          description: 'Gagal mengambil data audit pengguna',
          variant: 'destructive'
        });
      } finally {
        setLoadingUserAudits(false);
      }
    };

    fetchUserAudits();
  }, [selectedUserId, toast, session]);

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

      const { data: { user }, error } = await fetch(
        `https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            operation: 'addUser',
            superadmin: true,
            email: 'navazputra@students.amikom.ac.id',
            name: newUser.name,
            email: newUser.email, // This is the duplicate property causing the error
            password: newUser.password,
            role: newUser.role
          })
        }
      ).then(res => res.json());

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Pengguna Ditambahkan",
        description: `${newUser.name} telah ditambahkan sebagai ${newUser.role === 'admin' ? 'admin' : 'auditor'}`
      });

      setUsers([...users, user]);
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

  // Open edit user dialog
  const openEditUserDialog = (user: any) => {
    setEditUser({
      id: user.id,
      name: user.user_metadata?.name || "",
      email: user.email,
      role: user.user_metadata?.role || "auditor",
      password: "",
    });
    setIsEditUserDialogOpen(true);
  };

  // Handle edit user
  const handleEditUser = async () => {
    try {
      if (!editUser.id) {
        toast({
          title: "Error",
          description: "ID pengguna tidak valid",
          variant: 'destructive'
        });
        return;
      }

      const { data: { user }, error } = await fetch(
        `https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            operation: 'updateUser',
            superadmin: true,
            email: 'navazputra@students.amikom.ac.id',
            userId: editUser.id,
            name: editUser.name,
            password: editUser.password || undefined,
            role: editUser.role
          })
        }
      ).then(res => res.json());

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Pengguna Diperbarui",
        description: `${editUser.name} telah diperbarui`
      });

      setUsers(users.map(u => u.id === editUser.id ? { ...u, user_metadata: { name: editUser.name, role: editUser.role } } : u));
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

  // Open view user audits dialog
  const openViewUserAuditsDialog = (userId: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setIsViewUserAuditsDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await fetch(
        `https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            operation: 'deleteUser',
            superadmin: true,
            email: 'navazputra@students.amikom.ac.id',
            userId: userId
          })
        }
      ).then(res => res.json());

      if (error) {
        throw new Error(error);
      }

      setUsers(users.filter(u => u.id !== userId));
      toast({
        title: "Pengguna Dihapus",
        description: "Pengguna berhasil dihapus"
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: `Gagal menghapus pengguna: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`,
        variant: 'destructive'
      });
    }
  };

  // If there's a token error, show a message
  if (tokenError) {
    return (
      <div className="p-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Error Akses Admin</CardTitle>
            <CardDescription>Terjadi kesalahan saat mengakses fitur admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-destructive">{tokenError}</p>
              <p>
                Pastikan Anda telah login dengan akun admin yang valid. Jika masalah berlanjut,
                coba logout dan login kembali.
              </p>
              <div className="flex justify-center">
                <Button 
                  variant="default" 
                  onClick={() => {
                    const { useAuth } = require("@/contexts/AuthContext");
                    const auth = useAuth();
                    auth.logout();
                    window.location.href = "/login";
                  }}
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  Logout dan Coba Lagi
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dasbor Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Ringkasan</CardTitle>
            <CardDescription>Statistik platform audit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Pengguna</span>
                <span className="text-2xl font-bold">{users.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tindakan Cepat</CardTitle>
            <CardDescription>Tugas admin umum</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pengguna Baru
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Selamat Datang, {user?.name || user?.email}!</CardTitle>
            <CardDescription>Dasbor Admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sebagai administrator, Anda dapat mengelola pengguna, pertanyaan audit, dan melihat laporan.
                Gunakan tab di bawah ini untuk menavigasi melalui berbagai bagian manajemen.
              </p>
              <div className="flex justify-center">
                <img 
                  src="/lovable-uploads/81c0d83a-211c-4ccb-95b8-199c8fe9a8b4.png" 
                  alt="COBAIN Logo" 
                  className="h-16 w-16" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Manajemen Pengguna
          </TabsTrigger>
          <TabsTrigger value="questions">
            <FileText className="mr-2 h-4 w-4" />
            Pertanyaan Audit
          </TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users">
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
                      {users.length > 0 ? (
                        users.map((user) => (
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
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openViewUserAuditsDialog(user.id, user.email)}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Audit
                                </Button>
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
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Questions Tab */}
        <TabsContent value="questions">
          {/* Questions tab content goes here */}
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
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

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>
              Perbarui informasi akun pengguna.
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
                type="email"
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                Kata Sandi Baru
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={editUser.password}
                onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                className="col-span-3"
                placeholder="Biarkan kosong jika tidak ingin mengubah"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditUser}>Perbarui Pengguna</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Audits Dialog */}
      <Dialog open={isViewUserAuditsDialogOpen} onOpenChange={setIsViewUserAuditsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Audit oleh {selectedUserEmail}</DialogTitle>
            <DialogDescription>
              Daftar laporan audit yang dibuat oleh pengguna ini
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingUserAudits ? (
              <div className="text-center py-8">
                <p>Memuat data audit...</p>
              </div>
            ) : userAudits.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul</TableHead>
                      <TableHead>Organisasi</TableHead>
                      <TableHead>Tanggal Audit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userAudits.map((audit) => (
                      <TableRow key={audit.id}>
                        <TableCell className="font-medium">{audit.title}</TableCell>
                        <TableCell>{audit.organization}</TableCell>
                        <TableCell>{new Date(audit.audit_date).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {audit.status === "completed" ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Selesai
                              </>
                            ) : audit.status === "in_progress" ? (
                              <>
                                <CircleX className="mr-2 h-4 w-4 text-yellow-500" />
                                Dalam Proses
                              </>
                            ) : (
                              <>
                                <CircleX className="mr-2 h-4 w-4 text-gray-500" />
                                {audit.status}
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                window.open(`/audit-checklist/${audit.id}`, '_blank');
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Lihat
                            </Button>
                            <PDFReport 
                              auditId={audit.id} 
                              size="sm"
                              label="Ekspor"
                              showIcon={true}
                              variant="outline"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCircle className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2">Pengguna ini belum membuat audit apapun.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewUserAuditsDialogOpen(false)}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
