
import React from "react";
import { Progress } from "@/components/ui/progress";

interface StatisticsProps {
  audits: any[];
  mockAudits?: any[];
}

export const StatisticsView: React.FC<StatisticsProps> = ({ audits, mockAudits = [] }) => {
  const auditsToUse = audits.length > 0 ? audits : mockAudits;
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="text-muted-foreground text-sm">Total Audit</div>
          <div className="text-2xl font-bold mt-1">{auditsToUse.length}</div>
        </div>
        
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="text-muted-foreground text-sm">Audit Selesai</div>
          <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-500">
            {auditsToUse.filter(a => a.status === "completed").length}
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="text-muted-foreground text-sm">Sedang Berjalan</div>
          <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-500">
            {auditsToUse.filter(a => a.status === "in-progress").length}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Total Audits</span>
            <span className="font-medium">{mockAudits.length}</span>
          </div>
          <Progress value={100} className="h-2"/>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Completed</span>
            <span className="font-medium">
              {mockAudits.filter((a) => a.status === "completed").length} / {mockAudits.length}
            </span>
          </div>
          <Progress 
            value={
              (mockAudits.filter((a) => a.status === "completed").length / 
              mockAudits.length) * 100
            }
            className="h-2 bg-muted"
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>In Progress</span>
            <span className="font-medium">
              {mockAudits.filter((a) => a.status === "in-progress").length} / {mockAudits.length}
            </span>
          </div>
          <Progress 
            value={
              (mockAudits.filter((a) => a.status === "in-progress").length / 
              mockAudits.length) * 100
            }
            className="h-2 bg-amber-200 dark:bg-amber-900"
          />
        </div>
      </div>

      {/* Domain coverage chart */}
      <div className="mt-8 border rounded-lg p-6 bg-muted/10">
        <h3 className="text-sm font-medium mb-4">Domain Coverage</h3>
        <div className="grid grid-cols-5 gap-2 text-center">
          {['EDM', 'APO', 'BAI', 'DSS', 'MEA'].map((domain) => {
            const auditCount = mockAudits.filter(a => a.domains?.includes(domain)).length;
            const percentage = (auditCount / mockAudits.length) * 100;
            
            return (
              <div key={domain} className="flex flex-col items-center">
                <div className="text-sm font-medium mb-1">{domain}</div>
                <div className="w-full bg-muted rounded-full h-16 flex items-end overflow-hidden">
                  <div 
                    className="bg-cobain-blue dark:bg-cobain-blue/80 w-full" 
                    style={{ height: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-1">{Math.round(percentage)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
