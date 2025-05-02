
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Steps } from '@/components/ui/steps';
import { BookOpen, CheckSquare, FileSpreadsheet, BarChart3, FileText, CircleHelp } from 'lucide-react';

export function GettingStartedGuide() {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 shadow-md">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-xl flex items-center">
          <BookOpen className="mr-2 h-5 w-5" />
          Panduan Penggunaan COBAIN
        </CardTitle>
        <CardDescription>Pelajari cara menggunakan platform audit COBIT 2019</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="start">
          <TabsList className="w-full mb-4 bg-muted/60">
            <TabsTrigger value="start" className="flex-1">Memulai</TabsTrigger>
            <TabsTrigger value="audit" className="flex-1">Proses Audit</TabsTrigger>
            <TabsTrigger value="report" className="flex-1">Laporan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="start" className="pt-2">
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <CircleHelp className="mr-2 h-5 w-5" />
                  Apa itu COBAIN?
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  COBAIN adalah platform audit berbasis COBIT 2019 yang membantu organisasi melakukan penilaian tata kelola TI secara terstruktur dan menghasilkan rekomendasi untuk peningkatan.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium mb-3">Langkah-langkah Memulai</h3>
                <Steps steps={[
                  {
                    title: 'Pendaftaran & Login',
                    description: 'Buat akun atau login ke aplikasi COBAIN'
                  },
                  {
                    title: 'Profil Organisasi',
                    description: 'Lengkapi data profil organisasi Anda'
                  },
                  {
                    title: 'Mulai Audit Baru',
                    description: 'Buat audit baru dengan mengisi informasi audit'
                  },
                  {
                    title: 'Pilih Domain',
                    description: 'Pilih domain COBIT yang relevan dengan kebutuhan organisasi'
                  }
                ]} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="audit" className="pt-2">
            <div className="space-y-4">
              <h3 className="text-base font-medium mb-2">Proses Pelaksanaan Audit</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border rounded-lg p-4 flex flex-col">
                  <div className="flex items-center mb-2">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <CheckSquare className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-sm font-medium">1. Jawab Pertanyaan Audit</h4>
                  </div>
                  <p className="text-xs text-muted-foreground ml-12">
                    Jawab setiap pertanyaan audit berdasarkan kondisi sebenarnya di organisasi Anda
                  </p>
                </div>
                
                <div className="bg-card border rounded-lg p-4 flex flex-col">
                  <div className="flex items-center mb-2">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-sm font-medium">2. Berikan Bukti & Catatan</h4>
                  </div>
                  <p className="text-xs text-muted-foreground ml-12">
                    Sertakan bukti pendukung dan catatan untuk setiap jawaban audit
                  </p>
                </div>
                
                <div className="bg-card border rounded-lg p-4 flex flex-col">
                  <div className="flex items-center mb-2">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-sm font-medium">3. Lihat Hasil Penilaian</h4>
                  </div>
                  <p className="text-xs text-muted-foreground ml-12">
                    Lihat hasil penilaian tingkat kematangan untuk setiap domain
                  </p>
                </div>
                
                <div className="bg-card border rounded-lg p-4 flex flex-col">
                  <div className="flex items-center mb-2">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-sm font-medium">4. Tinjau Rekomendasi</h4>
                  </div>
                  <p className="text-xs text-muted-foreground ml-12">
                    Tinjau rekomendasi yang dihasilkan berdasarkan hasil penilaian
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-lg p-4 mt-3">
                <p className="text-sm">
                  <span className="font-medium">Tip:</span> Pastikan untuk menjawab setiap pertanyaan dengan jujur dan objektif sesuai dengan kondisi aktual organisasi Anda untuk mendapatkan hasil yang akurat.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="report" className="pt-2">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Setelah menyelesaikan audit, Anda dapat menghasilkan berbagai laporan untuk analisis dan dokumentasi:
              </p>
              
              <div className="space-y-3">
                <div className="bg-card border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">1. Laporan Tingkat Kematangan</h4>
                  <p className="text-xs text-muted-foreground">
                    Menampilkan tingkat kematangan setiap domain COBIT dalam bentuk radar chart dan bar chart
                  </p>
                </div>
                
                <div className="bg-card border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">2. Analisis Kesenjangan (Gap Analysis)</h4>
                  <p className="text-xs text-muted-foreground">
                    Membandingkan tingkat kematangan saat ini dengan target yang diharapkan
                  </p>
                </div>
                
                <div className="bg-card border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">3. Rekomendasi Perbaikan</h4>
                  <p className="text-xs text-muted-foreground">
                    Daftar rekomendasi prioritas berdasarkan hasil analisis kesenjangan
                  </p>
                </div>
                
                <div className="bg-card border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">4. Laporan Komprehensif</h4>
                  <p className="text-xs text-muted-foreground">
                    Dokumen PDF lengkap yang mencakup semua temuan audit dan rekomendasi
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 dark:bg-green-950/50 border border-green-100 dark:border-green-900 rounded-lg mt-2">
                <p className="text-sm">
                  Untuk mengunduh laporan, klik tombol "View Results" pada audit yang telah selesai.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
