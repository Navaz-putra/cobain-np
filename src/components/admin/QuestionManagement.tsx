
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, Edit, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Domain structure definition
interface Subdomain {
  id: string;
  name: string;
}

interface Domain {
  id: string;
  name: string;
  subdomains: Subdomain[];
}

interface Question {
  id: string;
  text: string;
  domain_id: string;
  subdomain_id: string;
}

const domainStructure: Domain[] = [
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

export const QuestionManagement = () => {
  const { toast } = useToast();
  const [searchQuestion, setSearchQuestion] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false);
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] = useState(false);

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

  // Filtered questions based on search and domain/subdomain selection
  const filteredQuestions = questions.filter(
    (question) => {
      if (selectedDomain && question.domain_id !== selectedDomain) {
        return false;
      }
      if (selectedSubdomain && question.subdomain_id !== selectedSubdomain) {
        return false;
      }
      
      return question.text.toLowerCase().includes(searchQuestion.toLowerCase()) ||
        question.domain_id.toLowerCase().includes(searchQuestion.toLowerCase()) ||
        question.subdomain_id.toLowerCase().includes(searchQuestion.toLowerCase());
    }
  );

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
  const openEditDialog = (question: Question) => {
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
  );
};
