
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
  CheckCircle, CircleX 
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

// Mock data
const mockUsers = [
  { id: 1, name: "Admin User", email: "admin@cobain.com", role: "admin", status: "active" },
  { id: 2, name: "Auditor User", email: "auditor@cobain.com", role: "auditor", status: "active" },
  { id: 3, name: "John Doe", email: "john@example.com", role: "auditor", status: "inactive" },
  { id: 4, name: "Jane Smith", email: "jane@example.com", role: "auditor", status: "active" },
];

const mockQuestions = [
  { 
    id: 1, 
    text: "Is there a documented IT security policy approved by management?", 
    domain: "EDM", 
    process: "EDM01", 
    practice: "EDM01.01", 
    maturityLevel: 1 
  },
  { 
    id: 2, 
    text: "Is there a risk assessment process established for IT-related risks?", 
    domain: "EDM", 
    process: "EDM03", 
    practice: "EDM03.02", 
    maturityLevel: 2 
  },
  { 
    id: 3, 
    text: "Are IT service levels defined and monitored?", 
    domain: "APO", 
    process: "APO09", 
    practice: "APO09.03", 
    maturityLevel: 3 
  },
  { 
    id: 4, 
    text: "Is there a process for managing IT changes?", 
    domain: "BAI", 
    process: "BAI06", 
    practice: "BAI06.01", 
    maturityLevel: 2 
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
    practice: "",
    maturityLevel: "1",
  });

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredQuestions = mockQuestions.filter(
    (question) =>
      question.text.toLowerCase().includes(searchQuestion.toLowerCase()) ||
      question.domain.toLowerCase().includes(searchQuestion.toLowerCase()) ||
      question.process.toLowerCase().includes(searchQuestion.toLowerCase())
  );

  const handleAddUser = () => {
    // In a real app, this would be an API call
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
    // In a real app, this would be an API call
    toast({
      title: "Question Added",
      description: "The audit question has been added successfully",
    });
    setIsAddQuestionDialogOpen(false);
    setNewQuestion({
      text: "",
      domain: "",
      process: "",
      practice: "",
      maturityLevel: "1",
    });
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
                <span className="text-2xl font-bold">{mockQuestions.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Domains</span>
                <span className="text-2xl font-bold">3</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Processes</span>
                <span className="text-2xl font-bold">4</span>
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
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, domain: value })}
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
                    <Input
                      id="process"
                      value={newQuestion.process}
                      onChange={(e) => setNewQuestion({ ...newQuestion, process: e.target.value })}
                      placeholder="e.g., EDM01"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="practice" className="text-right">
                      Practice
                    </Label>
                    <Input
                      id="practice"
                      value={newQuestion.practice}
                      onChange={(e) => setNewQuestion({ ...newQuestion, practice: e.target.value })}
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
              <CardDescription>Manage COBIT 2019 audit questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-sm">
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
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Process</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">{question.id}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {question.text}
                        </TableCell>
                        <TableCell>{question.domain}</TableCell>
                        <TableCell>{question.process}</TableCell>
                        <TableCell>{question.maturityLevel}</TableCell>
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
      </Tabs>
    </div>
  );
}
