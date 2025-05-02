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
import { useToast } from "@/hooks/use-toast";
import { 
  Users, FileText, Plus, Trash, Edit, Search, 
  CheckCircle, CircleX, Filter, ListPlus, ListMinus 
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

// Mock data
const mockUsers = [
  { id: 1, name: "Admin User", email: "admin@cobain.com", role: "admin", status: "active" },
  { id: 2, name: "Auditor User", email: "auditor@cobain.com", role: "auditor", status: "active" },
  { id: 3, name: "John Doe", email: "john@example.com", role: "auditor", status: "inactive" },
  { id: 4, name: "Jane Smith", email: "jane@example.com", role: "auditor", status: "active" },
];

// Enhanced mock questions with subdomains
const mockQuestions = [
  { 
    id: 1, 
    text: "Is there a documented IT security policy approved by management?", 
    domain: "EDM", 
    process: "EDM01", 
    subdomain: "EDM01.01",
    practice: "EDM01.01", 
    maturityLevel: 1,
    enabled: true
  },
  { 
    id: 2, 
    text: "Is there a risk assessment process established for IT-related risks?", 
    domain: "EDM", 
    process: "EDM03", 
    subdomain: "EDM03.02",
    practice: "EDM03.02", 
    maturityLevel: 2,
    enabled: true
  },
  { 
    id: 3, 
    text: "Are IT service levels defined and monitored?", 
    domain: "APO", 
    process: "APO09", 
    subdomain: "APO09.03",
    practice: "APO09.03", 
    maturityLevel: 3,
    enabled: false
  },
  { 
    id: 4, 
    text: "Is there a process for managing IT changes?", 
    domain: "BAI", 
    process: "BAI06", 
    subdomain: "BAI06.01",
    practice: "BAI06.01", 
    maturityLevel: 2,
    enabled: true
  },
  {
    id: 5,
    text: "Are system security requirements documented and validated?",
    domain: "BAI",
    process: "BAI03",
    subdomain: "BAI03.04",
    practice: "BAI03.04",
    maturityLevel: 3,
    enabled: true
  },
  {
    id: 6,
    text: "Is there a formal process for managing third-party services?",
    domain: "APO",
    process: "APO10",
    subdomain: "APO10.01",
    practice: "APO10.01",
    maturityLevel: 2,
    enabled: false
  },
];

// Domain and subdomain structure
const domainStructure = [
  {
    id: "EDM",
    name: "Evaluate, Direct and Monitor",
    subdomains: [
      { id: "EDM01", name: "Ensured Governance Framework Setting and Maintenance" },
      { id: "EDM02", name: "Ensured Benefits Delivery" },
      { id: "EDM03", name: "Ensured Risk Optimization" },
    ]
  },
  {
    id: "APO",
    name: "Align, Plan and Organize",
    subdomains: [
      { id: "APO01", name: "Managed IT Management Framework" },
      { id: "APO09", name: "Managed Service Agreements" },
      { id: "APO10", name: "Managed Vendors" },
    ]
  },
  {
    id: "BAI",
    name: "Build, Acquire and Implement",
    subdomains: [
      { id: "BAI03", name: "Managed Solutions Identification and Build" },
      { id: "BAI06", name: "Managed IT Changes" },
    ]
  },
  {
    id: "DSS",
    name: "Deliver, Service and Support",
    subdomains: [
      { id: "DSS01", name: "Managed Operations" },
      { id: "DSS02", name: "Managed Service Requests and Incidents" },
    ]
  },
  {
    id: "MEA",
    name: "Monitor, Evaluate and Assess",
    subdomains: [
      { id: "MEA01", name: "Managed Performance and Conformance Monitoring" },
      { id: "MEA02", name: "Managed System of Internal Control" },
    ]
  }
];

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchUser, setSearchUser] = useState("");
  const [searchQuestion, setSearchQuestion] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          description: 'Gagal mengambil data pertanyaan audit'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [toast]);

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

  const handleAddUser = () => {
    toast({
      title: "User Added",
      description: `Added ${newUser.name} as ${newUser.role}`,
    });
    setIsAddUserDialogOpen(false);
    setNewUser({
      name: "",
      email: "",
      role: "auditor",
      password: "",
    });
  };

  const handleAddQuestion = async () => {
    try {
      if (!newQuestion.text || !newQuestion.domain_id || !newQuestion.subdomain_id) {
        toast({
          title: "Error",
          description: "Harap isi semua field yang diperlukan",
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
        title: "Question Added",
        description: "Pertanyaan audit baru berhasil ditambahkan",
      });
      
      setIsAddQuestionDialogOpen(false);
      setNewQuestion({
        text: "",
        domain_id: "",
        subdomain_id: "",
      });
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan pertanyaan"
      });
    }
  };

  const handleEditQuestion = async () => {
    try {
      if (!editQuestion.text || !editQuestion.domain_id || !editQuestion.subdomain_id) {
        toast({
          title: "Error",
          description: "Harap isi semua field yang diperlukan",
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
        title: "Question Updated",
        description: "Pertanyaan audit berhasil diperbarui",
      });
      
      setIsEditQuestionDialogOpen(false);
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui pertanyaan"
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
        title: "Question Deleted",
        description: "Pertanyaan audit berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus pertanyaan"
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
      <h1 className="text-3xl font-bold mb-6">{t("admin.title")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Overview Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Overview</CardTitle>
            <CardDescription>Audit platform statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Users</span>
                <span className="text-2xl font-bold">{mockUsers.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Questions</span>
                <span className="text-2xl font-bold">{questions.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Domains</span>
                <span className="text-2xl font-bold">{domainStructure.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Active Questions</span>
                <span className="text-2xl font-bold">{questions.filter(q => q.enabled).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account on the COBAIN platform.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
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
                      Role
                    </Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="auditor">Auditor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
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
                  <Button onClick={handleAddUser}>Add User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddQuestionDialogOpen} onOpenChange={setIsAddQuestionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Question
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Audit Question</DialogTitle>
                  <DialogDescription>
                    Create a new question for COBIT 2019 audits.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="question-text" className="text-right">
                      Question
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

            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View Audit Reports
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage User Roles
            </Button>
          </CardContent>
        </Card>

        {/* Welcome */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Welcome, {user?.name}!</CardTitle>
            <CardDescription>Admin Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                As an administrator, you can manage users, audit questions, and view reports.
                Use the tabs below to navigate through different management sections.
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
      <Tabs defaultValue="questions" className="w-full">
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
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                  />
                </div>
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">{user.role}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {user.status === "active" ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Active
                              </>
                            ) : (
                              <>
                                <CircleX className="mr-2 h-4 w-4 text-red-500" />
                                Inactive
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
                        <SelectItem value="all-domains">Semua Domain</SelectItem>
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
                        <SelectItem value="all-subdomains">Semua Subdomain</SelectItem>
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
      </Tabs>
    </div>
  );
}
