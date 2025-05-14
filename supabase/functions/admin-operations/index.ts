
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { operation, superadmin, userId, userData, superadminEmail, password, role, name, email } = await req.json();

    // Special case for the superadmin user
    if (superadmin && superadminEmail === 'navazputra@students.amikom.ac.id') {
      switch(operation) {
        case 'getUsers':
          const { data: users, error: usersError } = await supabaseClient
            .from('auth.users')
            .select('*');
          
          if (usersError) throw usersError;
          
          return new Response(JSON.stringify({ users }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        
        case 'addUser':
          const { data: newUser, error: addError } = await supabaseClient.auth.admin
            .createUser({
              email: email,
              password: password,
              user_metadata: { name, role },
              email_confirm: true
            });
            
          if (addError) throw addError;
          
          return new Response(JSON.stringify({ user: newUser }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
          
        case 'updateUser':
          const { data: updatedUser, error: updateError } = await supabaseClient.auth.admin
            .updateUserById(userId, {
              user_metadata: { name, role },
              password: password || undefined,
            });
            
          if (updateError) throw updateError;
          
          return new Response(JSON.stringify({ user: updatedUser }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
          
        case 'deleteUser':
          const { error: deleteError } = await supabaseClient.auth.admin
            .deleteUser(userId);
            
          if (deleteError) throw deleteError;
          
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
          
        case 'getUserAudits':
          const { data: userAudits, error: auditsError } = await supabaseClient
            .from('audits')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
            
          if (auditsError) throw auditsError;
          
          return new Response(JSON.stringify({ audits: userAudits }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
      }
    }

    return new Response(JSON.stringify({ error: "Unauthorized access" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
