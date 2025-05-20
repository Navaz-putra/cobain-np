
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
    console.log("Admin operation request received");
    
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
    
    console.log("Requested action:", action);
    
    // Special handling for superadmin
    const isSuperAdmin = requestData.superadmin === true;
    const superadminEmail = requestData.superadminEmail || '';
    const hardcodedSuperadminEmail = 'navazputra@students.amikom.ac.id';
    
    let isAdmin = false;
    let user = null;
    
    // Get the authorization header from the request (if available)
    const authHeader = req.headers.get('Authorization');
    console.log("Auth header present:", !!authHeader);
    
    // Verify superadmin first if that's the claim
    if (isSuperAdmin && superadminEmail === hardcodedSuperadminEmail) {
      isAdmin = true;
      console.log("Superadmin access granted");
    }
    // If there's an auth header, verify the user
    else if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        console.log("Token length:", token.length);
        
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
        
        if (userError) {
          console.error("Error verifying user with token:", userError);
          return new Response(
            JSON.stringify({ error: 'Authentication error: ' + userError.message }),
            {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        if (userData?.user) {
          user = userData.user;
          console.log("Authenticated user:", user.email);
          // Check if user is an admin
          isAdmin = user.email === hardcodedSuperadminEmail || 
                   user.user_metadata?.role === 'admin';
                   
          console.log("Is admin:", isAdmin);
        } else {
          console.log("No user data returned from getUser call");
        }
      } catch (tokenError) {
        console.error("Error processing token:", tokenError);
        return new Response(
          JSON.stringify({ error: 'Token processing error' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } else {
      console.log("No authentication provided");
    }
    
    // Allow operations only for verified admins
    if (!isAdmin) {
      console.log("Unauthorized - Admin access required");
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let data = null, error = null;

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

      case 'updateUser':
        // Extract user data fields
        const { name: updateName, role: updateRole } = userData;
        
        // Verify if target user exists before updating
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
        
        // Update user metadata
        const updateResponse = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          {
            user_metadata: { 
              name: updateName,
              role: updateRole
            }
          }
        );
        
        data = updateResponse.data;
        error = updateResponse.error;
        break;

      case 'deleteUser':
        // Verify if target user is not an admin before deletion
        const userToDeleteResponse = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userToDeleteResponse.error) {
          return new Response(
            JSON.stringify({ error: userToDeleteResponse.error.message }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        
        const targetUser = userToDeleteResponse.data.user;
        const isTargetAdmin = targetUser.user_metadata?.role === 'admin' || 
                             targetUser.email === hardcodedSuperadminEmail;
        
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

        // Also delete audit answers and domains associated with user's audits
        const { data: userAudits, error: fetchAuditsError } = await supabaseAdmin
          .from('audits')
          .select('id')
          .eq('user_id', userId);

        if (!fetchAuditsError && userAudits && userAudits.length > 0) {
          const auditIds = userAudits.map(audit => audit.id);
          
          // Delete audit answers
          const { error: answersDeleteError } = await supabaseAdmin
            .from('audit_answers')
            .delete()
            .in('audit_id', auditIds);
            
          if (answersDeleteError) {
            console.error("Error deleting audit answers:", answersDeleteError);
          }
          
          // Delete audit domains
          const { error: domainsDeleteError } = await supabaseAdmin
            .from('audit_domains')
            .delete()
            .in('audit_id', auditIds);
            
          if (domainsDeleteError) {
            console.error("Error deleting audit domains:", domainsDeleteError);
          }
        }
          
        // Proceed with user deletion
        const deleteResponse = await supabaseAdmin.auth.admin.deleteUser(userId);
        data = deleteResponse.data;
        error = deleteResponse.error;
        break;

      case 'listUsers':
        console.log("Listing users, isAdmin:", isAdmin);
        try {
          const listResponse = await supabaseAdmin.auth.admin.listUsers();
          console.log("List users response:", listResponse);
          
          if (listResponse.error) {
            error = listResponse.error;
            console.error("Error listing users:", error);
          } else {
            // Always return users in a consistent format
            data = { 
              users: listResponse.data.users || [] 
            };
            console.log(`Found ${data.users.length} users`);
          }
        } catch (listError) {
          console.error("Exception when listing users:", listError);
          error = { message: listError.toString() };
        }
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
        
        try {
          const userResponse = await supabaseAdmin.auth.admin.getUserById(userId);
          
          if (userResponse.error) {
            error = userResponse.error;
          } else {
            data = { user: userResponse.data.user };
          }
        } catch (getUserError) {
          console.error("Exception when getting user info:", getUserError);
          error = { message: getUserError.toString() };
        }
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
      console.error("Error in admin operation:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log("Admin operation completed successfully");
    return new Response(
      JSON.stringify({ data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error("Admin operation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
