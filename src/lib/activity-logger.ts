
import { supabase } from "@/integrations/supabase/client";

// Function to log user activity (can be called from any component)
export const logUserActivity = async (
  userId: string, 
  activityType: 'create_audit' | 'delete_audit' | 'export_report' | 'update_profile' | 'change_password', 
  description: string
) => {
  try {
    // Direct insert to user_activities table
    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        description: description
      });
        
    if (error) {
      console.error("Failed to log user activity:", error);
    }
  } catch (err) {
    console.error("Error logging user activity:", err);
  }
};
