
import { useState } from "react";
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
];

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchUser, setSearchUser] = useState("");
  const [searchQuestion, setSearchQuestion] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>("");
  const [questions, setQuestions] = useState(mockQuestions);

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
    domain: "",
    process: "",
    subdomain: "",
    practice: "",
    maturityLevel: "1",
    enabled: true,
  });

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredQuestions = questions.filter(
    (question) => {
      // Apply domain and subdomain filters first
      if (selectedDomain && question.domain !== selectedDomain) {
        return false;
      }
      if (selectedSubdomain && question.subdomain.split(".")[0] !== selectedSubdomain) {
        return false;
      }
      
      // Then apply search text filter
      return question.text.toLowerCase().includes(searchQuestion.toLowerCase()) ||
        question.domain.toLowerCase().includes(searchQuestion.toLowerCase()) ||
        question.process.toLowerCase().includes(searchQuestion.toLowerCase());
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

  const handleAddQuestion = () => {
    const newId = Math.max(...questions.map(q => q.id)) + 1;
    const questionToAdd = {
      id: newId,
      text: newQuestion.text,
      domain: newQuestion.domain,
      process: newQuestion.process,
      subdomain: newQuestion.subdomain,
      practice: newQuestion.practice,
      maturityLevel: parseInt(newQuestion.maturityLevel),
      enabled: true
    };
    
    setQuestions([...questions, questionToAdd]);
    
    toast({
      title: "Question Added",
      description: "The audit question has been added successfully",
    });
    
    setIsAddQuestionDialogOpen(false);
    setNewQuestion({
      text: "",
      domain: "",
      process: "",
      subdomain: "",
      practice: "",
      maturityLevel: "1",
      enabled: true,
    });
  };

  // Toggle question enabled status
  const toggleQuestionStatus = (id: number) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q.id === id ? { ...q, enabled: !q.enabled } : q
      )
    );
    
    const question = questions.find(q => q.id === id);
    toast({
      title: question?.enabled ? "Question Disabled" : "Question Enabled",
      description: `The question has been ${question?.enabled ? "removed from" : "added to"} the audit checklist`,
    });
  };

  // Get available subdomains based on selected domain
  const getAvailableSubdomains = () => {
    if (!selectedDomain) return [];
    const domain = domainStructure.find(d => d.id === selectedDomain);
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
                    <Input
                      id="question-text"
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="domain" className="text-right">
                      Domain
                    </Label>
                    <Select
                      value={newQuestion.domain}
                      onValueChange={(value) => {
                        setNewQuestion({ 
                          ...newQuestion, 
                          domain: value,
                          process: "", // Reset process when domain changes
                          subdomain: "", // Reset subdomain when domain changes
                          practice: "" // Reset practice when domain changes
                        });
                      }}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EDM">EDM</SelectItem>
                        <SelectItem value="APO">APO</SelectItem>
                        <SelectItem value="BAI">BAI</SelectItem>
                        <SelectItem value="DSS">DSS</SelectItem>
                        <SelectItem value="MEA">MEA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="process" className="text-right">
                      Process
                    </Label>
                    <Select
                      value={newQuestion.process}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, process: value })}
                      disabled={!newQuestion.domain}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select process" />
                      </SelectTrigger>
                      <SelectContent>
                        {newQuestion.domain === "EDM" && (
                          <>
                            <SelectItem value="EDM01">EDM01</SelectItem>
                            <SelectItem value="EDM02">EDM02</SelectItem>
                            <SelectItem value="EDM03">EDM03</SelectItem>
                          </>
                        )}
                        {newQuestion.domain === "APO" && (
                          <>
                            <SelectItem value="APO01">APO01</SelectItem>
                            <SelectItem value="APO09">APO09</SelectItem>
                            <SelectItem value="APO10">APO10</SelectItem>
                          </>
                        )}
                        {newQuestion.domain === "BAI" && (
                          <>
                            <SelectItem value="BAI03">BAI03</SelectItem>
                            <SelectItem value="BAI06">BAI06</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="practice" className="text-right">
                      Practice
                    </Label>
                    <Input
                      id="practice"
                      value={newQuestion.practice}
                      onChange={(e) => setNewQuestion({ ...newQuestion, practice: e.target.value, subdomain: e.target.value })}
                      placeholder="e.g., EDM01.01"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="maturity" className="text-right">
                      Maturity Level
                    </Label>
                    <Select
                      value={newQuestion.maturityLevel}
                      onValueChange={(value) =>
                        setNewQuestion({ ...newQuestion, maturityLevel: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 - Incomplete</SelectItem>
                        <SelectItem value="1">1 - Performed</SelectItem>
                        <SelectItem value="2">2 - Managed</SelectItem>
                        <SelectItem value="3">3 - Established</SelectItem>
                        <SelectItem value="4">4 - Predictable</SelectItem>
                        <SelectItem value="5">5 - Optimizing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddQuestion}>Add Question</Button>
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
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="questions">
            <FileText className="mr-2 h-4 w-4" />
            Audit Questions
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
                    {filteredUsers.map((user) => (
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
              <CardTitle>Audit Questions</CardTitle>
              <CardDescription>Manage COBIT 2019 audit questions and checklists for each subdomain</CardDescription>
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
                        <SelectValue placeholder="All Domains" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Domains</SelectItem>
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
                        <SelectValue placeholder="All Processes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Processes</SelectItem>
                        {getAvailableSubdomains().map(subdomain => (
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
                        placeholder="Search questions..."
                        className="pl-8"
                        value={searchQuestion}
                        onChange={(e) => setSearchQuestion(e.target.value)}
                      />
                    </div>
                    
                    <Dialog open={isAddQuestionDialogOpen} onOpenChange={setIsAddQuestionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Question
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Process</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions.map((question) => (
                        <TableRow key={question.id} className={!question.enabled ? "bg-muted/30" : ""}>
                          <TableCell className="font-medium">{question.id}</TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {question.text}
                          </TableCell>
                          <TableCell>{question.domain}</TableCell>
                          <TableCell>{question.process}</TableCell>
                          <TableCell>{question.maturityLevel}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {question.enabled ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center text-green-600"
                                  onClick={() => toggleQuestionStatus(question.id)}
                                >
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Aktif
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center text-red-600"
                                  onClick={() => toggleQuestionStatus(question.id)}
                                >
                                  <CircleX className="mr-1 h-4 w-4" />
                                  Nonaktif
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              {question.enabled ? (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => toggleQuestionStatus(question.id)}
                                  title="Remove from checklist"
                                >
                                  <ListMinus className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => toggleQuestionStatus(question.id)}
                                  title="Add to checklist"
                                >
                                  <ListPlus className="h-4 w-4" />
                                </Button>
                              )}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
