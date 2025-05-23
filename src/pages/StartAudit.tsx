
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
import { CalendarCheck, ChevronLeft, ChevronRight, FileCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Mock COBIT domains
const cobitDomains = [
  { id: "EDM", name: "Evaluate, Direct and Monitor", desc: "Memastikan pengaturan dan pemeliharaan framework tata kelola" },
  { id: "APO", name: "Align, Plan and Organize", desc: "Mencakup strategi dan taktik TI" },
  { id: "BAI", name: "Build, Acquire and Implement", desc: "Memberikan solusi dan mengubahnya menjadi layanan" },
  { id: "DSS", name: "Deliver, Service and Support", desc: "Menerima solusi dan membuatnya bisa digunakan oleh pengguna akhir" },
  { id: "MEA", name: "Monitor, Evaluate and Assess", desc: "Memantau kinerja dan kesesuaian dengan tujuan" },
];

// Form schema - updated to include auditor information
const auditFormSchema = z.object({
  // Audit information
  title: z.string().min(3, {
    message: "Judul audit harus minimal 3 karakter.",
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
  
  // Auditor information
  auditorName: z.string().min(3, {
    message: "Nama auditor harus minimal 3 karakter.",
  }),
  auditorNik: z.string().min(16, {
    message: "NIK harus 16 digit.",
  }).max(16, {
    message: "NIK harus 16 digit."
  }).regex(/^\d+$/, {
    message: "NIK harus berupa angka."
  }),
  auditorPhone: z.string().min(10, {
    message: "Nomor telepon minimal 10 digit.",
  }).regex(/^\d+$/, {
    message: "Nomor telepon harus berupa angka."
  }),
  auditorCertification: z.string().optional(),
  auditorCompany: z.string().min(2, {
    message: "Perusahaan/instansi auditor diperlukan.",
  }),
  auditorPosition: z.string().min(2, {
    message: "Jabatan auditor diperlukan.",
  }),
  
  // Agreement
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form
  const form = useForm<z.infer<typeof auditFormSchema>>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      title: "",
      description: "",
      auditDate: format(new Date(), "yyyy-MM-dd"),
      organization: "",
      scope: "",
      auditorName: user?.name || "",
      auditorNik: "",
      auditorPhone: "",
      auditorCertification: "",
      auditorCompany: "",
      auditorPosition: "",
      agreeToTerms: false,
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof auditFormSchema>) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Anda harus login untuk membuat audit",
      });
      navigate("/login");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create a new audit in the database
      const { data, error } = await supabase
        .from("audits")
        .insert({
          title: values.title,
          description: values.description,
          audit_date: values.auditDate,
          organization: values.organization,
          scope: values.scope,
          user_id: user.id,
          status: 'in_progress',
          auditor_info: {
            name: values.auditorName,
            nik: values.auditorNik,
            phone: values.auditorPhone,
            certification: values.auditorCertification || null,
            company: values.auditorCompany,
            position: values.auditorPosition
          }
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating audit:", error);
        throw error;
      }
      
      toast({
        title: "Audit Dibuat",
        description: `Audit ${values.title} berhasil dibuat`,
      });
      
      // Redirect to the audit checklist page with the new audit ID
      navigate(`/audit-checklist/${data.id}`);
    } catch (error) {
      console.error("Error submitting audit:", error);
      toast({
        title: "Error",
        description: "Gagal membuat audit baru"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Function to validate current step before proceeding
  const validateStep = async () => {
    if (step === 1) {
      // Validate all fields in step 1
      const result = await form.trigger(['title', 'description', 'auditDate', 'organization', 'scope']);
      return result;
    } else if (step === 2) {
      // Validate auditor information fields
      const result = await form.trigger([
        'auditorName', 
        'auditorNik', 
        'auditorPhone', 
        'auditorCompany', 
        'auditorPosition'
      ]);
      return result;
    }
    return true;
  };

  // Handle next button click with validation
  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setStep(step + 1);
    }
  };

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
                  Data Auditor
                </p>
              </div>
              <div className={`flex-1 border-t-4 ${step >= 3 ? 'border-primary' : 'border-muted'} p-2`}>
                <p className={`text-sm font-medium ${step === 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Konfirmasi Domain COBIT
                </p>
              </div>
              <div className={`flex-1 border-t-4 ${step >= 4 ? 'border-primary' : 'border-muted'} p-2`}>
                <p className={`text-sm font-medium ${step === 4 ? 'text-primary' : 'text-muted-foreground'}`}>
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
                        <FormLabel>Judul Audit <span className="text-red-500">*</span></FormLabel>
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
                        <FormLabel>Deskripsi Audit <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel>Tanggal Audit <span className="text-red-500">*</span></FormLabel>
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
                          <FormLabel>Organisasi <span className="text-red-500">*</span></FormLabel>
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
                        <FormLabel>Ruang Lingkup <span className="text-red-500">*</span></FormLabel>
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
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-6">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Informasi Auditor</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="auditorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Nama lengkap auditor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="auditorNik"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="16 digit NIK" 
                              maxLength={16}
                              {...field} 
                              onChange={e => {
                                // Only allow numbers
                                const value = e.target.value.replace(/\D/g, '');
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            NIK 16 digit sesuai KTP
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="auditorPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nomor telepon aktif" 
                              {...field}
                              onChange={e => {
                                // Only allow numbers
                                const value = e.target.value.replace(/\D/g, '');
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="auditorCertification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sertifikasi</FormLabel>
                          <FormControl>
                            <Input placeholder="CISA, CISSP, dsb (opsional)" {...field} />
                          </FormControl>
                          <FormDescription>
                            Sertifikasi yang dimiliki (opsional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="auditorCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Perusahaan/Instansi <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Tempat auditor bekerja" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="auditorPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jabatan <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Jabatan auditor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Domain COBIT untuk Audit</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Semua domain COBIT 2019 telah dipilih untuk audit Anda.
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Audit akan mencakup semua domain berikut:
                    </p>
                  </div>

                  <div className="space-y-4">
                    {cobitDomains.map((domain) => (
                      <Card 
                        key={domain.id}
                        className="border-primary bg-primary/5"
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
                              checked={true}
                              disabled={true}
                            />
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Konfirmasi Audit</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Tinjau informasi audit sebelum membuat.
                    </p>
                  </div>

                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">Informasi Dasar</h4>
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
                              <p className="text-sm">Semua domain COBIT 2019</p>
                            </div>
                          </div>

                          <div className="mt-2">
                            <p className="text-sm font-medium">Deskripsi</p>
                            <p className="text-sm">{form.getValues("description")}</p>
                          </div>

                          <div className="mt-2">
                            <p className="text-sm font-medium">Ruang Lingkup</p>
                            <p className="text-sm">{form.getValues("scope")}</p>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Informasi Auditor</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Nama Lengkap</p>
                              <p className="text-sm">{form.getValues("auditorName")}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">NIK</p>
                              <p className="text-sm">{form.getValues("auditorNik")}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Nomor Telepon</p>
                              <p className="text-sm">{form.getValues("auditorPhone")}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Sertifikasi</p>
                              <p className="text-sm">{form.getValues("auditorCertification") || "-"}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Perusahaan/Instansi</p>
                              <p className="text-sm">{form.getValues("auditorCompany")}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Jabatan</p>
                              <p className="text-sm">{form.getValues("auditorPosition")}</p>
                            </div>
                          </div>
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
                            Saya menyetujui ketentuan penggunaan COBAIN dan memahami tujuan audit ini <span className="text-red-500">*</span>
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

          {step < 4 ? (
            <Button onClick={handleNext}>
              Selanjutnya
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <FileCheck className="mr-2 h-4 w-4" />
              {isSubmitting ? "Menyimpan..." : "Mulai Audit"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
