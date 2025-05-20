
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, ClipboardCheck, BarChart, Activity, Trash2, Download, UserCog, FilePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface RecentActivitiesProps {
  activities?: any[];
  userId?: string;
}

interface ActivityItem {
  id: string;
  action: string;
  date: string;
  icon: any;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ 
  activities: initialActivities,
  userId 
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's audit activity
  useEffect(() => {
    const fetchUserAudits = async () => {
      try {
        setLoading(true);
        const currentUserId = userId || user?.id;
        
        if (!currentUserId) {
          setLoading(false);
          return;
        }

        // Get user's audits
        const { data, error } = await supabase
          .from('audits')
          .select('*')
          .eq('user_id', currentUserId)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        // Get user's other activities from the user_activities table if it exists
        let activityData: any[] = [];
        try {
          // Use a direct query instead of accessing user_activities through .from()
          const { data: activityLogs, error: activityError } = await supabase
            .rpc('get_user_activities', { p_user_id: currentUserId })
            .limit(10);
            
          if (!activityError && activityLogs) {
            activityData = activityLogs;
          }
        } catch (activityFetchError) {
          // If the table doesn't exist yet or other errors, just continue with audit data
          console.log("Note: user_activities table may not exist yet or other error:", activityFetchError);
        }

        // Convert the audit data to activity items
        const auditActivities: ActivityItem[] = (data || []).map(audit => {
          let action = '';
          let icon = Activity;
          
          if (audit.status === 'completed') {
            action = `Menyelesaikan audit "${audit.title}"`;
            icon = FileCheck;
          } else {
            action = `Mengerjakan audit "${audit.title}"`;
            icon = ClipboardCheck;
          }
          
          return {
            id: audit.id,
            action,
            date: formatTimeAgo(audit.updated_at),
            icon
          };
        });

        // Process other activity logs if they exist
        const otherActivities: ActivityItem[] = activityData.map(activity => {
          let icon = Activity;
          
          // Set appropriate icon based on activity type
          switch(activity.activity_type) {
            case 'create_audit':
              icon = FilePlus;
              break;
            case 'delete_audit':
              icon = Trash2;
              break;
            case 'export_report':
              icon = Download;
              break;
            case 'update_profile':
            case 'change_password':
              icon = UserCog;
              break;
            default:
              icon = Activity;
          }
          
          return {
            id: activity.id,
            action: activity.description,
            date: formatTimeAgo(activity.created_at),
            icon
          };
        });

        // Combine all activities and sort by date (most recent first)
        const combinedActivities = [...auditActivities, ...otherActivities]
          .sort((a, b) => {
            // This simple sort assumes the date strings are comparable
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          })
          .slice(0, 10); // Limit to 10 most recent activities
          
        setActivities(combinedActivities);
      } catch (error) {
        console.error("Error fetching audit activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAudits();
  }, [user, userId]);

  // Helper function to format the date
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: id });
    } catch (error) {
      return dateString;
    }
  };

  // If we have no activities and we're not loading, show mock data
  const displayActivities = activities.length > 0 ? activities : initialActivities || [
    {
      id: 1,
      action: "Belum ada aktivitas audit",
      date: "Mulai audit baru",
      icon: Activity,
    }
  ];

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Memuat aktivitas...</p>
        </div>
      ) : displayActivities.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Belum ada aktivitas audit</p>
        </div>
      ) : (
        displayActivities.map((activity) => (
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
        ))
      )}
    </div>
  );
};

export const RecentActivitiesFooter: React.FC = () => {
  return (
    <Button variant="ghost" className="text-sm" onClick={() => window.location.href = "/start-audit"}>
      Mulai Audit Baru
    </Button>
  );
};
