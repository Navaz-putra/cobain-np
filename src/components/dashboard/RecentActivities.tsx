
import React from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, ClipboardCheck, BarChart } from "lucide-react";

// Mock data (this would come from props in a real implementation)
const mockActivities = [
  {
    id: 1,
    action: "Completed security controls assessment",
    date: "2025-03-01 14:25",
    icon: FileCheck,
  },
  {
    id: 2,
    action: "Started annual IT governance audit",
    date: "2025-02-15 09:12",
    icon: ClipboardCheck,
  },
  {
    id: 3,
    action: "Generated maturity report for Q1",
    date: "2025-02-01 11:45",
    icon: BarChart,
  },
];

interface RecentActivitiesProps {
  activities?: any[];
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ 
  activities = mockActivities 
}) => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start space-x-4 py-3 px-2 border-b last:border-0 hover:bg-muted/10 rounded-md transition-colors"
        >
          <div className="bg-primary/10 rounded-full p-2.5">
            <activity.icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{activity.action}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activity.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const RecentActivitiesFooter: React.FC = () => {
  return (
    <Button variant="ghost" className="text-sm">
      Lihat Semua Aktivitas
    </Button>
  );
};
