
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth Admin API key
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse the request body first
    const requestData = await req.json();
    const { action, userData, userId } = requestData;
    
    // Check for superadmin case from the request body
    const isSuperAdminRequest = requestData.superadmin === true;
    const superadminEmail = requestData.superadminEmail;
    
    let isAdmin = false;
    let user = null;
    
    // Get the authorization header from the request (if available)
    const authHeader = req.headers.get('Authorization');
    
    // If there's an auth header, verify the user
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
      
      if (!userError && userData?.user) {
        user = userData.user;
        // Check if user is an admin
        isAdmin = user.email === 'navazputra@students.amikom.ac.id' || 
                 user.user_metadata?.role === 'admin';
      }
    }
    
    // Allow operations for superadmin requests or verified admins
    if (!isAdmin && !isSuperAdminRequest) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // For superadmin email verification
    if (isSuperAdminRequest && superadminEmail !== 'navazputra@students.amikom.ac.id') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Superadmin email mismatch' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let data, error;

    // Perform the requested admin action
    switch (action) {
      case 'createUser':
        const { email, password, name, role, emailConfirm = true } = userData;
        const response = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          user_metadata: { name, role },
          email_confirm: emailConfirm
        });
        data = response.data;
        error = response.error;
        break;

      case 'deleteUser':
        // Verify if target user is not an admin before deletion
        const targetUserResponse = await supabaseAdmin.auth.admin.getUserById(userId);
        if (targetUserResponse.error) {
          return new Response(
            JSON.stringify({ error: targetUserResponse.error.message }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        
        const targetUser = targetUserResponse.data.user;
        const isTargetAdmin = targetUser.user_metadata?.role === 'admin' || 
                             targetUser.email === 'navazputra@students.amikom.ac.id';
        
        // If attempting to delete an admin, block it
        if (isTargetAdmin) {
          return new Response(
            JSON.stringify({ error: 'Cannot delete admin users' }),
            {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        
        // Delete audits associated with the user first
        const { error: auditDeleteError } = await supabaseAdmin
          .from('audits')
          .delete()
          .eq('user_id', userId);
          
        if (auditDeleteError) {
          console.error("Error deleting user's audits:", auditDeleteError);
        }
          
        // Proceed with user deletion
        const deleteResponse = await supabaseAdmin.auth.admin.deleteUser(userId);
        data = deleteResponse.data;
        error = deleteResponse.error;
        break;

      case 'listUsers':
        const listResponse = await supabaseAdmin.auth.admin.listUsers();
        data = listResponse.data;
        error = listResponse.error;
        break;
        
      case 'getUserInfo':
        // Get a single user's info
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        const userResponse = await supabaseAdmin.auth.admin.getUserById(userId);
        data = { user: userResponse.data.user };
        error = userResponse.error;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
