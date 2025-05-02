
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarCheck, ChevronLeft, ChevronRight, FileCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock COBIT domains
const cobitDomains = [
  { id: "EDM", name: "Evaluate, Direct and Monitor", desc: "Memastikan pengaturan dan pemeliharaan framework tata kelola" },
  { id: "APO", name: "Align, Plan and Organize", desc: "Mencakup strategi dan taktik TI" },
  { id: "BAI", name: "Build, Acquire and Implement", desc: "Memberikan solusi dan mengubahnya menjadi layanan" },
  { id: "DSS", name: "Deliver, Service and Support", desc: "Menerima solusi dan membuatnya bisa digunakan oleh pengguna akhir" },
  { id: "MEA", name: "Monitor, Evaluate and Assess", desc: "Memantau kinerja dan kesesuaian dengan tujuan" },
];

// Form schema
const auditFormSchema = z.object({
  title: z.string().min(5, {
    message: "Judul audit harus minimal 5 karakter.",
  }),
  description: z.string().min(10, {
    message: "Deskripsi audit harus minimal 10 karakter.",
  }),
  auditDate: z.string().min(1, {
    message: "Tanggal audit diperlukan.",
  }),
  organization: z.string().min(3, {
    message: "Nama organisasi diperlukan.",
  }),
  scope: z.string().min(5, {
    message: "Ruang lingkup audit diperlukan.",
  }),
  domains: z.array(z.string()).min(1, {
    message: "Pilih minimal satu domain COBIT.",
  }),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "Anda harus menyetujui syarat dan ketentuan.",
  }),
});

export default function StartAudit() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  // Initialize the form
  const form = useForm<z.infer<typeof auditFormSchema>>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      title: "",
      description: "",
      auditDate: format(new Date(), "yyyy-MM-dd"),
      organization: "",
      scope: "",
      domains: [],
      agreeToTerms: false,
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof auditFormSchema>) => {
    console.log(values);
    toast({
      title: "Audit Dibuat",
      description: `Audit ${values.title} berhasil dibuat`,
    });
    navigate("/auditor-dashboard");
  };

  // Fixed domain selection handling
  const handleDomainToggle = (domainId: string) => {
    // Use a callback function to avoid stale state issues
    setSelectedDomains((prevDomains) => {
      const isSelected = prevDomains.includes(domainId);
      const newDomains = isSelected 
        ? prevDomains.filter(d => d !== domainId) 
        : [...prevDomains, domainId];
      
      // Update form value outside of render cycle
      setTimeout(() => {
        form.setValue("domains", newDomains, { shouldValidate: true });
      }, 0);
      
      return newDomains;
    });
  };

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/auditor-dashboard")}
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Kembali ke Dasbor
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Mulai Audit Baru</CardTitle>
          <CardDescription>
            Buat dan konfigurasi audit berdasarkan kerangka kerja COBIT 2019
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between">
              <div className={`flex-1 border-t-4 ${step >= 1 ? 'border-primary' : 'border-muted'} p-2`}>
                <p className={`text-sm font-medium ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Informasi Dasar
                </p>
              </div>
              <div className={`flex-1 border-t-4 ${step >= 2 ? 'border-primary' : 'border-muted'} p-2`}>
                <p className={`text-sm font-medium ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Pilih Domain COBIT
                </p>
              </div>
              <div className={`flex-1 border-t-4 ${step >= 3 ? 'border-primary' : 'border-muted'} p-2`}>
                <p className={`text-sm font-medium ${step === 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Konfirmasi
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Audit</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Audit Tata Kelola TI Tahunan 2025" {...field} />
                        </FormControl>
                        <FormDescription>
                          Judul deskriptif untuk audit ini.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi Audit</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Jelaskan tujuan dan ruang lingkup audit" 
                            className="h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Detail singkat tentang tujuan audit.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="auditDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Audit</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            Tanggal mulai audit.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organisasi</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama organisasi yang diaudit" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="scope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ruang Lingkup</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tentukan ruang lingkup dan batasan audit" 
                            className="h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Area spesifik yang akan dicakup dalam audit ini.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Pilih Domain COBIT untuk Audit</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Pilih domain COBIT 2019 yang ingin dimasukkan dalam audit ini. Domain yang dipilih akan menentukan pertanyaan assessment yang akan digunakan.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="domains"
                    render={() => (
                      <FormItem>
                        <div className="space-y-4">
                          {cobitDomains.map((domain) => (
                            <Card 
                              key={domain.id}
                              className={`cursor-pointer transition-colors ${
                                selectedDomains.includes(domain.id) 
                                  ? 'border-primary bg-primary/5' 
                                  : ''
                              }`}
                              onClick={() => handleDomainToggle(domain.id)}
                            >
                              <CardHeader className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-base">
                                      {domain.id} - {domain.name}
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                      {domain.desc}
                                    </CardDescription>
                                  </div>
                                  <Checkbox 
                                    checked={selectedDomains.includes(domain.id)}
                                    onChange={(e) => {
                                      // Prevent event bubbling to avoid duplicate calls
                                      e.stopPropagation();
                                      handleDomainToggle(domain.id);
                                    }}
                                  />
                                </div>
                              </CardHeader>
                            </Card>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Konfirmasi Audit</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Tinjau informasi audit sebelum membuat.
                    </p>
                  </div>

                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Judul Audit</p>
                            <p className="text-sm">{form.getValues("title")}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Tanggal Audit</p>
                            <p className="text-sm">{form.getValues("auditDate")}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Organisasi</p>
                            <p className="text-sm">{form.getValues("organization")}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Domain COBIT</p>
                            <p className="text-sm">{selectedDomains.join(", ")}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Deskripsi</p>
                          <p className="text-sm">{form.getValues("description")}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Ruang Lingkup</p>
                          <p className="text-sm">{form.getValues("scope")}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Saya menyetujui ketentuan penggunaan COBAIN dan memahami tujuan audit ini
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Sebelumnya
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate('/auditor-dashboard')}>
              Batal
            </Button>
          )}

          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>
              Selanjutnya
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={form.handleSubmit(onSubmit)}>
              <FileCheck className="mr-2 h-4 w-4" />
              Mulai Audit
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
