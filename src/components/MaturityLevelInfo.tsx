
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export function MaturityLevelInfo() {
  return (
    <Card className="p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 shadow-md">
      <h3 className="text-lg font-semibold mb-2">Tingkat Kematangan COBIT 2019</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Penilaian tingkat kematangan proses TI mengacu pada model COBIT 2019 dengan skala 0-5 sebagai berikut:
      </p>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="level-0" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="text-sm font-medium py-2">
            <div className="flex items-center">
              <div className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-bold">0</span>
              </div>
              <span>Incomplete Process</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm pb-4 pl-8">
            Proses tidak diimplementasikan atau gagal mencapai tujuannya. Pada level ini, ada sedikit atau tidak ada bukti pencapaian tujuan proses.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="level-1" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="text-sm font-medium py-2">
            <div className="flex items-center">
              <div className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-bold">1</span>
              </div>
              <span>Performed Process</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm pb-4 pl-8">
            Proses diimplementasikan dan mencapai tujuannya. Aktivitas dasar sudah dilakukan tetapi belum terstandarisasi dan sangat tergantung pada individu.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="level-2" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="text-sm font-medium py-2">
            <div className="flex items-center">
              <div className="bg-yellow-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-bold">2</span>
              </div>
              <span>Managed Process</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm pb-4 pl-8">
            Proses diimplementasikan secara terkelola (direncanakan, dipantau, disesuaikan) dan hasil kerja ditetapkan, dikendalikan, dan dipelihara dengan tepat.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="level-3" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="text-sm font-medium py-2">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-bold">3</span>
              </div>
              <span>Established Process</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm pb-4 pl-8">
            Proses diimplementasikan menggunakan proses yang ditentukan dan mampu mencapai hasil prosesnya. Terdapat kebijakan dan prosedur yang jelas serta pemantauan kepatuhan.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="level-4" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="text-sm font-medium py-2">
            <div className="flex items-center">
              <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-bold">4</span>
              </div>
              <span>Predictable Process</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm pb-4 pl-8">
            Proses beroperasi dalam batas-batas yang ditentukan untuk mencapai hasil prosesnya. Proses diukur secara kuantitatif dan beroperasi secara stabil dan dapat diprediksi.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="level-5" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="text-sm font-medium py-2">
            <div className="flex items-center">
              <div className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-bold">5</span>
              </div>
              <span>Optimizing Process</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm pb-4 pl-8">
            Proses terus ditingkatkan untuk memenuhi tujuan bisnis saat ini dan masa depan. Terdapat inovasi dan optimisasi berkelanjutan terhadap proses.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
