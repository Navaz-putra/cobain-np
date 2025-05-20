
import { supabase } from "@/integrations/supabase/client";

// Function to log user activity (can be called from any component)
export const logUserActivity = async (
  userId: string, 
  activityType: 'create_audit' | 'delete_audit' | 'export_report' | 'update_profile' | 'change_password', 
  description: string
) => {
  try {
    // Using raw insert to avoid TypeScript errors until Supabase types are regenerated
    const { error } = await supabase.rpc('insert_user_activity', {
      p_user_id: userId,
      p_activity_type: activityType,
      p_description: description
    });
        
    if (error) {
      console.error("Failed to log user activity:", error);
    }
  } catch (err) {
    console.error("Error logging user activity:", err);
  }
};
