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
  CheckCircle, CircleX, Filter, ListPlus, ListMinus,
  FileOutput, Download
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { PDFReport } from "@/components/PDFReport";

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
  const [searchQuestion, setSearchQuestion] = useState("");
  const [searchAudit, setSearchAudit] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAudits, setLoadingAudits] = useState(true);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "auditor",
    password: "",
  });

  // New question form state
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    domain_id: "",
    subdomain_id: "",
  });

  // Edit question form state
  const [editQuestion, setEditQuestion] = useState({
    id: "",
    text: "",
    domain_id: "",
    subdomain_id: "",
  });

  // Fetch questions from database
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('cobit_questions')
          .select('*');
        
        if (error) {
          throw error;
        }

        setQuestions(data || []);
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: 'Error',
          description: 'Gagal mengambil data pertanyaan audit',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [toast]);

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        
        if (!session?.access_token) {
          throw new Error("No access token available");
        }

        // Call our edge function to list users
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
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: `Gagal mengambil data pengguna: ${error.message}`,
          variant: 'destructive'
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [toast, session?.access_token]);

  // Fetch audits from database
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoadingAudits(true);
        
        // Use useAuditData hook with isAdmin=true to get all audits
        const { data, error } = await supabase
          .from('audits')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }

        // Get basic user info for each audit
        const auditsWithUserInfo = await Promise.all((data || []).map(async (audit) => {
          let userEmail = "Unknown";
          
          // Only attempt to get user info if there's a valid user_id
          if (audit.user_id) {
            try {
              // Call our edge function to get user info
              if (session?.access_token) {
                const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                  },
                  body: JSON.stringify({
                    action: "getUserInfo",
                    userId: audit.user_id
                  })
                });
                
                if (response.ok) {
                  const result = await response.json();
                  if (result.data?.user) {
                    userEmail = result.data.user.email;
                  }
                }
              }
            } catch (err) {
              console.error("Error fetching user info:", err);
            }
          }
          
          return {
            ...audit,
            user: { email: userEmail }
          };
        }));

        setAudits(auditsWithUserInfo);
      } catch (error) {
        console.error('Error fetching audits:', error);
        toast({
          title: 'Error',
          description: 'Gagal mengambil data audit',
          variant: 'destructive'
        });
      } finally {
        setLoadingAudits(false);
      }
    };

    fetchAudits();
  }, [toast, session?.access_token]);

  // Filtered questions based on search and domain/subdomain selection
  const filteredQuestions = questions.filter(
    (question) => {
      // Apply domain and subdomain filters first
      if (selectedDomain && question.domain_id !== selectedDomain) {
        return false;
      }
      if (selectedSubdomain && question.subdomain_id !== selectedSubdomain) {
        return false;
      }
      
      // Then apply search text filter
      return question.text.toLowerCase().includes(searchQuestion.toLowerCase()) ||
        question.domain_id.toLowerCase().includes(searchQuestion.toLowerCase()) ||
        question.subdomain_id.toLowerCase().includes(searchQuestion.toLowerCase());
    }
  );

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    (user.user_metadata?.name || "").toLowerCase().includes(searchUser.toLowerCase())
  );

  // Filter audits based on search
  const filteredAudits = audits.filter(audit => 
    audit.title.toLowerCase().includes(searchAudit.toLowerCase()) ||
    audit.organization.toLowerCase().includes(searchAudit.toLowerCase()) ||
    (audit.user?.email || "").toLowerCase().includes(searchAudit.toLowerCase())
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

      if (!session?.access_token) {
        throw new Error("No access token available");
      }

      // Call our edge function to create a user
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

      // Refresh users list by calling our edge function again
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
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: `Gagal menambahkan pengguna: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      if (!session?.access_token) {
        throw new Error("No access token available");
      }

      // Call our edge function to delete a user
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

      // Refresh users list
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
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: `Gagal menghapus pengguna: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleAddQuestion = async () => {
    try {
      if (!newQuestion.text || !newQuestion.domain_id || !newQuestion.subdomain_id) {
        toast({
          title: "Error",
          description: "Harap isi semua field yang diperlukan",
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('cobit_questions')
        .insert({
          text: newQuestion.text,
          domain_id: newQuestion.domain_id,
          subdomain_id: newQuestion.subdomain_id
        })
        .select();
      
      if (error) {
        throw error;
      }

      setQuestions([...questions, data[0]]);
      
      toast({
        title: "Pertanyaan Ditambahkan",
        description: "Pertanyaan audit baru berhasil ditambahkan",
      });
      
      setIsAddQuestionDialogOpen(false);
      setNewQuestion({
        text: "",
        domain_id: "",
        subdomain_id: "",
      });
    } catch (error: any) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: `Gagal menambahkan pertanyaan: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleEditQuestion = async () => {
    try {
      if (!editQuestion.text || !editQuestion.domain_id || !editQuestion.subdomain_id) {
        toast({
          title: "Error",
          description: "Harap isi semua field yang diperlukan",
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('cobit_questions')
        .update({
          text: editQuestion.text,
          domain_id: editQuestion.domain_id,
          subdomain_id: editQuestion.subdomain_id
        })
        .eq('id', editQuestion.id)
        .select();
      
      if (error) {
        throw error;
      }

      setQuestions(questions.map(q => q.id === editQuestion.id ? data[0] : q));
      
      toast({
        title: "Pertanyaan Diperbarui",
        description: "Pertanyaan audit berhasil diperbarui",
      });
      
      setIsEditQuestionDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: `Gagal memperbarui pertanyaan: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cobit_questions')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }

      setQuestions(questions.filter(q => q.id !== id));
      
      toast({
        title: "Pertanyaan Dihapus",
        description: "Pertanyaan audit berhasil dihapus",
      });
    } catch (error: any) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: `Gagal menghapus pertanyaan: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  // Open edit dialog and populate form
  const openEditDialog = (question: any) => {
    setEditQuestion({
      id: question.id,
      text: question.text,
      domain_id: question.domain_id,
      subdomain_id: question.subdomain_id,
    });
    setIsEditQuestionDialogOpen(true);
  };

  // Get available subdomains based on selected domain
  const getAvailableSubdomains = (domainId: string) => {
    if (!domainId) return [];
    const domain = domainStructure.find(d => d.id === domainId);
    return domain ? domain.subdomains : [];
  };

  // Reset subdomain when domain changes
  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    setSelectedSubdomain("");
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dasbor Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Overview Card */}
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
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Pertanyaan</span>
                <span className="text-2xl font-bold">{questions.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Domain</span>
                <span className="text-2xl font-bold">{domainStructure.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Audit</span>
                <span className="text-2xl font-bold">{audits.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
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

            <Dialog open={isAddQuestionDialogOpen} onOpenChange={setIsAddQuestionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pertanyaan Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Tambah Pertanyaan Audit Baru</DialogTitle>
                  <DialogDescription>
                    Buat pertanyaan baru untuk audit COBIT 2019.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="question-text" className="text-right">
                      Pertanyaan
                    </Label>
                    <Textarea
                      id="question-text"
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      className="col-span-3"
                      rows={3}
                      placeholder="Masukkan pertanyaan audit"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="domain" className="text-right">
                      Domain
                    </Label>
                    <Select
                      value={newQuestion.domain_id}
                      onValueChange={(value) => {
                        setNewQuestion({ 
                          ...newQuestion, 
                          domain_id: value,
                          subdomain_id: "" // Reset subdomain when domain changes
                        });
                      }}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {domainStructure.map(domain => (
                          <SelectItem key={domain.id} value={domain.id}>
                            {domain.id} - {domain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subdomain" className="text-right">
                      Subdomain
                    </Label>
                    <Select
                      value={newQuestion.subdomain_id}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, subdomain_id: value })}
                      disabled={!newQuestion.domain_id}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih subdomain" />
                      </SelectTrigger>
                      <SelectContent>
                        {newQuestion.domain_id && getAvailableSubdomains(newQuestion.domain_id).map(subdomain => (
                          <SelectItem key={subdomain.id} value={subdomain.id}>
                            {subdomain.id} - {subdomain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddQuestion}>Tambah Pertanyaan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button className="w-full justify-start" variant="outline" 
              onClick={() => document.getElementById('reports-tab')?.click()}>
              <FileText className="mr-2 h-4 w-4" />
              Lihat Laporan Audit
            </Button>
          </CardContent>
        </Card>

        {/* Welcome */}
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
          <TabsTrigger id="reports-tab" value="reports">
            <FileOutput className="mr-2 h-4 w-4" />
            Laporan Audit
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
                                  onClick={() => {
                                    toast({
                                      title: "Info",
                                      description: "Fitur edit pengguna akan segera hadir"
                                    });
                                  }}
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pertanyaan Audit</CardTitle>
              <CardDescription>Kelola pertanyaan audit COBIT 2019 untuk setiap subdomain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                    <Select
                      value={selectedDomain}
                      onValueChange={handleDomainChange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Semua Domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Semua Domain</SelectItem>
                        {domainStructure.map(domain => (
                          <SelectItem key={domain.id} value={domain.id}>
                            {domain.id} - {domain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={selectedSubdomain}
                      onValueChange={setSelectedSubdomain}
                      disabled={!selectedDomain}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Semua Subdomain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Semua Subdomain</SelectItem>
                        {selectedDomain && getAvailableSubdomains(selectedDomain).map(subdomain => (
                          <SelectItem key={subdomain.id} value={subdomain.id}>
                            {subdomain.id} - {subdomain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                    <div className="relative w-full md:w-[300px]">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari pertanyaan..."
                        className="pl-8"
                        value={searchQuestion}
                        onChange={(e) => setSearchQuestion(e.target.value)}
                      />
                    </div>
                    
                    <Dialog open={isAddQuestionDialogOpen} onOpenChange={setIsAddQuestionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Tambah Pertanyaan
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <p>Memuat data pertanyaan...</p>
                  </div>
                ) : filteredQuestions.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pertanyaan</TableHead>
                          <TableHead>Domain</TableHead>
                          <TableHead>Subdomain</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredQuestions.map((question) => (
                          <TableRow key={question.id}>
                            <TableCell className="max-w-[300px]">
                              {question.text}
                            </TableCell>
                            <TableCell>{question.domain_id}</TableCell>
                            <TableCell>{question.subdomain_id}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openEditDialog(question)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>Tidak ada pertanyaan yang sesuai dengan kriteria pencarian.</p>
                  </div>
                )}
              </div>

              {/* Edit Question Dialog */}
              <Dialog open={isEditQuestionDialogOpen} onOpenChange={setIsEditQuestionDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Edit Pertanyaan Audit</DialogTitle>
                    <DialogDescription>
                      Perbarui pertanyaan yang ada untuk audit COBIT 2019.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-question-text" className="text-right">
                        Pertanyaan
                      </Label>
                      <Textarea
                        id="edit-question-text"
                        value={editQuestion.text}
                        onChange={(e) => setEditQuestion({ ...editQuestion, text: e.target.value })}
                        className="col-span-3"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-domain" className="text-right">
                        Domain
                      </Label>
                      <Select
                        value={editQuestion.domain_id}
                        onValueChange={(value) => {
                          setEditQuestion({ 
                            ...editQuestion, 
                            domain_id: value,
                            subdomain_id: "" // Reset subdomain when domain changes
                          });
                        }}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Pilih domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {domainStructure.map(domain => (
                            <SelectItem key={domain.id} value={domain.id}>
                              {domain.id} - {domain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-subdomain" className="text-right">
                        Subdomain
                      </Label>
                      <Select
                        value={editQuestion.subdomain_id}
                        onValueChange={(value) => setEditQuestion({ ...editQuestion, subdomain_id: value })}
                        disabled={!editQuestion.domain_id}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Pilih subdomain" />
                        </SelectTrigger>
                        <SelectContent>
                          {editQuestion.domain_id && getAvailableSubdomains(editQuestion.domain_id).map(subdomain => (
                            <SelectItem key={subdomain.id} value={subdomain.id}>
                              {subdomain.id} - {subdomain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleEditQuestion}>Perbarui Pertanyaan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Laporan Audit</CardTitle>
              <CardDescription>Lihat dan ekspor laporan hasil audit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari laporan audit..."
                      className="pl-8"
                      value={searchAudit}
                      onChange={(e) => setSearchAudit(e.target.value)}
                    />
                  </div>
                </div>
                
                {loadingAudits ? (
                  <div className="text-center py-8">
                    <p>Memuat data audit...</p>
                  </div>
                ) : filteredAudits.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Judul</TableHead>
                          <TableHead>Organisasi</TableHead>
                          <TableHead>Tanggal Audit</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Auditor</TableHead>
                          <TableHead className="text-right">Tindakan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAudits.map((audit) => (
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
                            <TableCell>{audit.user?.email || '-'}</TableCell>
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
                                  label="Ekspor PDF"
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
                    <p>Tidak ada data audit yang tersedia.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
