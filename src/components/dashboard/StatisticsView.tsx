
import React from "react";
import { Progress } from "@/components/ui/progress";

interface StatisticsProps {
  audits: any[];
  mockAudits?: any[];
}

export const StatisticsView: React.FC<StatisticsProps> = ({ audits, mockAudits = [] }) => {
  // Use real audit data if available, otherwise use empty array for new users
  const auditsToUse = audits.length > 0 ? audits : [];
  
  // Calculate statistics
  const totalAudits = auditsToUse.length;
  const completedAudits = auditsToUse.filter(a => a.status === "completed").length;
  const inProgressAudits = auditsToUse.filter(a => a.status === "in-progress").length;
  
  // Calculate percentages safely to avoid division by zero
  const completedPercentage = totalAudits > 0 ? (completedAudits / totalAudits) * 100 : 0;
  const inProgressPercentage = totalAudits > 0 ? (inProgressAudits / totalAudits) * 100 : 0;
  
  // Domain data for visualization
  const domainCounts = ['EDM', 'APO', 'BAI', 'DSS', 'MEA'].map(domain => {
    const auditCount = auditsToUse.filter(a => a.domains?.includes(domain)).length;
    const percentage = totalAudits > 0 ? (auditCount / totalAudits) * 100 : 0;
    return { domain, count: auditCount, percentage };
  });
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="text-muted-foreground text-sm">Total Audit</div>
          <div className="text-2xl font-bold mt-1">{totalAudits}</div>
        </div>
        
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="text-muted-foreground text-sm">Audit Selesai</div>
          <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-500">
            {completedAudits}
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-4 border shadow-sm">
          <div className="text-muted-foreground text-sm">Sedang Berjalan</div>
          <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-500">
            {inProgressAudits}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Total Audits</span>
            <span className="font-medium">{totalAudits}</span>
          </div>
          <Progress value={100} className="h-2"/>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Completed</span>
            <span className="font-medium">
              {completedAudits} / {totalAudits}
            </span>
          </div>
          <Progress 
            value={completedPercentage}
            className="h-2 bg-muted"
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>In Progress</span>
            <span className="font-medium">
              {inProgressAudits} / {totalAudits}
            </span>
          </div>
          <Progress 
            value={inProgressPercentage}
            className="h-2 bg-amber-200 dark:bg-amber-900"
          />
        </div>
      </div>

      {/* Domain coverage chart */}
      <div className="mt-8 border rounded-lg p-6 bg-muted/10">
        <h3 className="text-sm font-medium mb-4">Domain Coverage</h3>
        <div className="grid grid-cols-5 gap-2 text-center">
          {domainCounts.map(({ domain, percentage }) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};
