import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface InviteRequest {
  action: "invite" | "list" | "delete" | "update_role" | "update_platform_access";
  email?: string;
  fullName?: string;
  role?: string;
  platforms?: {
    finance: boolean;
    business: boolean;
    investor: boolean;
  };
  userId?: string;
  platform?: string;
  hasAccess?: boolean;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verify caller is admin using the user's JWT
    const userToken = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: callerError } = await createClient(
      SUPABASE_URL, 
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${userToken}` } } }
    ).auth.getUser();

    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if caller has admin role
    const { data: callerRoles } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const isAdmin = callerRoles?.some(r => r.role === "admin") || false;
    
    // Allow if email is admin email (for initial setup)
    const isAdminEmail = caller.email === "theodore.humphrey@flowpulse.co.uk" || 
                         caller.email === "admin@flowpulse.com";

    if (!isAdmin && !isAdminEmail) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body: InviteRequest = await req.json();

    switch (body.action) {
      case "list":
        return await listUsers(supabaseClient);
      case "invite":
        return await inviteUser(supabaseClient, body, caller.id);
      case "delete":
        return await deleteUser(supabaseClient, body.userId!);
      case "update_role":
        return await updateRole(supabaseClient, body.userId!, body.role!);
      case "update_platform_access":
        return await updatePlatformAccess(supabaseClient, body.userId!, body.platform!, body.hasAccess!);
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }
  } catch (error: any) {
    console.error("Admin user management error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

async function listUsers(supabase: any): Promise<Response> {
  // Fetch all users from auth.users using admin API
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error("Error fetching auth users:", authError);
    throw authError;
  }

  // Fetch user profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("*");

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
  }

  // Fetch user roles
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*");

  if (rolesError) {
    console.error("Error fetching roles:", rolesError);
  }

  // Fetch platform permissions
  const { data: permissions, error: permsError } = await supabase
    .from("platform_permissions")
    .select("*");

  if (permsError) {
    console.error("Error fetching permissions:", permsError);
  }

  // Fetch pending invitations
  const { data: pendingInvites, error: invitesError } = await supabase
    .from("pending_invitations")
    .select("*")
    .is("completed_at", null);

  if (invitesError) {
    console.error("Error fetching pending invitations:", invitesError);
  }

  // Combine data from all sources
  const users = (authUsers?.users || []).map((authUser: any) => {
    const profile = profiles?.find((p: any) => p.user_id === authUser.id);
    const userRoles = roles?.filter((r: any) => r.user_id === authUser.id).map((r: any) => r.role) || [];
    const userPerms = permissions?.find((p: any) => p.user_id === authUser.id);
    const pendingInvite = pendingInvites?.find((i: any) => i.user_id === authUser.id);

    // Determine user status
    let status = "active";
    if (!authUser.email_confirmed_at) {
      status = "pending";
    } else if (userRoles.length === 0) {
      status = "pending";
    }

    return {
      user_id: authUser.id,
      email: authUser.email || profile?.email || pendingInvite?.email || "",
      full_name: profile?.full_name || authUser.user_metadata?.full_name || pendingInvite?.full_name || "",
      created_at: profile?.created_at || authUser.created_at,
      email_confirmed: !!authUser.email_confirmed_at,
      last_sign_in: authUser.last_sign_in_at,
      roles: userRoles,
      status,
      platforms: {
        finance: userPerms?.can_access_finance_platform || false,
        business: userPerms?.can_access_business_platform || false,
        investor: userPerms?.can_access_investor_platform || false,
      },
      pending_invite: pendingInvite ? {
        invited_role: pendingInvite.invited_role,
        platform_finance: pendingInvite.platform_finance,
        platform_business: pendingInvite.platform_business,
        platform_investor: pendingInvite.platform_investor,
        invited_at: pendingInvite.invited_at,
      } : null,
    };
  });

  return new Response(JSON.stringify({ users }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function inviteUser(supabase: any, body: InviteRequest, invitedBy: string): Promise<Response> {
  const { email, fullName, role, platforms } = body;

  if (!email || !fullName) {
    return new Response(JSON.stringify({ error: "Email and full name are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

  if (existingUser) {
    return new Response(JSON.stringify({ error: "User with this email already exists" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Generate secure temporary password
  const tempPassword = generateSecurePassword();

  // Create user with admin API
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true, // Auto-confirm for admin-invited users
    user_metadata: {
      full_name: fullName,
    },
  });

  if (createError) {
    console.error("Error creating user:", createError);
    throw createError;
  }

  // Create user profile
  const { error: profileError } = await supabase
    .from("user_profiles")
    .upsert({
      user_id: newUser.user.id,
      email,
      full_name: fullName,
    }, { onConflict: "user_id" });

  if (profileError) {
    console.error("Error creating profile:", profileError);
  }

  // Assign role
  if (role) {
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: newUser.user.id,
        role,
      });

    if (roleError) {
      console.error("Error assigning role:", roleError);
    }
  }

  // Set platform permissions
  if (platforms) {
    const { error: permsError } = await supabase
      .from("platform_permissions")
      .upsert({
        user_id: newUser.user.id,
        can_access_finance_platform: platforms.finance,
        can_access_business_platform: platforms.business,
        can_access_investor_platform: platforms.investor,
      }, { onConflict: "user_id" });

    if (permsError) {
      console.error("Error setting permissions:", permsError);
    }
  }

  // Store invitation record
  const { error: inviteError } = await supabase
    .from("pending_invitations")
    .insert({
      user_id: newUser.user.id,
      email,
      full_name: fullName,
      invited_role: role || "viewer",
      platform_finance: platforms?.finance || false,
      platform_business: platforms?.business || false,
      platform_investor: platforms?.investor || false,
      invited_by: invitedBy,
      completed_at: new Date().toISOString(), // Mark as completed since we auto-confirm
    });

  if (inviteError) {
    console.error("Error storing invitation:", inviteError);
  }

  // Log audit entry
  await supabase.from("audit_logs").insert({
    user_id: invitedBy,
    action: "user_invited",
    resource_type: "user",
    resource_id: newUser.user.id,
    details: { email, role, platforms },
    severity: "info",
  });

  // Send welcome email
  let emailSent = false;
  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      const platformsList = Object.entries(platforms || {})
        .filter(([_, hasAccess]) => hasAccess)
        .map(([platform]) => platform.charAt(0).toUpperCase() + platform.slice(1))
        .join(", ") || "None";

      await resend.emails.send({
        from: "FlowPulse Support <support@flowpulse.co.uk>",
        to: [email],
        subject: "Welcome to FlowPulse - Your Account Details",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">Welcome to FlowPulse!</h1>
            </div>
            
            <p style="font-size: 16px; color: #374151;">Hi ${fullName},</p>
            
            <p style="font-size: 16px; color: #374151;">You have been invited to join FlowPulse. Your account is now active.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937;">Your Access Details</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 120px;">Role:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${(role || "viewer").replace("_", " ").toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Platform Access:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${platformsList}</td>
                </tr>
              </table>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #92400e;">🔐 Login Credentials</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #78350f; width: 120px;">Email:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #78350f;">Password:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600; font-family: monospace;">${tempPassword}</td>
                </tr>
              </table>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #92400e;">
                ⚠️ <strong>Important:</strong> Please change your password after your first login.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://connected-cashflow.lovable.app/auth" 
                 style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Login to FlowPulse →
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} FlowPulse. All rights reserved.<br/>
              If you have any questions, contact our support team.
            </p>
          </div>
        `,
      });
      emailSent = true;
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
    }
  }

  return new Response(JSON.stringify({ 
    success: true, 
    user: newUser.user,
    emailSent,
    message: emailSent 
      ? `User ${email} created and welcome email sent` 
      : `User ${email} created (email not sent - check RESEND_API_KEY)`,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function deleteUser(supabase: any, userId: string): Promise<Response> {
  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Delete from all related tables first
  await supabase.from("user_roles").delete().eq("user_id", userId);
  await supabase.from("platform_permissions").delete().eq("user_id", userId);
  await supabase.from("user_tab_permissions").delete().eq("user_id", userId);
  await supabase.from("pending_invitations").delete().eq("user_id", userId);
  await supabase.from("user_profiles").delete().eq("user_id", userId);

  // Delete from auth.users
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

  if (deleteError) {
    console.error("Error deleting user:", deleteError);
    throw deleteError;
  }

  return new Response(JSON.stringify({ success: true, message: "User deleted successfully" }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function updateRole(supabase: any, userId: string, role: string): Promise<Response> {
  if (!userId || !role) {
    return new Response(JSON.stringify({ error: "User ID and role are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Check if role already exists
  const { data: existingRole } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", role)
    .single();

  if (existingRole) {
    return new Response(JSON.stringify({ success: true, message: "User already has this role" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const { error } = await supabase.from("user_roles").insert({
    user_id: userId,
    role,
  });

  if (error) {
    console.error("Error updating role:", error);
    throw error;
  }

  return new Response(JSON.stringify({ success: true, message: `Role ${role} added` }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

async function updatePlatformAccess(supabase: any, userId: string, platform: string, hasAccess: boolean): Promise<Response> {
  if (!userId || !platform) {
    return new Response(JSON.stringify({ error: "User ID and platform are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Get current permissions
  const { data: currentPerms } = await supabase
    .from("platform_permissions")
    .select("*")
    .eq("user_id", userId)
    .single();

  const updateData: any = {
    user_id: userId,
    can_access_finance_platform: currentPerms?.can_access_finance_platform || false,
    can_access_business_platform: currentPerms?.can_access_business_platform || false,
    can_access_investor_platform: currentPerms?.can_access_investor_platform || false,
  };

  // Update the specific platform
  switch (platform) {
    case "finance":
      updateData.can_access_finance_platform = hasAccess;
      break;
    case "business":
      updateData.can_access_business_platform = hasAccess;
      break;
    case "investor":
      updateData.can_access_investor_platform = hasAccess;
      break;
  }

  const { error } = await supabase
    .from("platform_permissions")
    .upsert(updateData, { onConflict: "user_id" });

  if (error) {
    console.error("Error updating platform access:", error);
    throw error;
  }

  return new Response(JSON.stringify({ 
    success: true, 
    message: `${platform} access ${hasAccess ? "granted" : "revoked"}` 
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function generateSecurePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const specialChars = "!@#$%^&*";
  let password = "";
  
  // Ensure at least one of each type
  password += chars.charAt(Math.floor(Math.random() * 26)); // Uppercase
  password += chars.charAt(26 + Math.floor(Math.random() * 26)); // Lowercase
  password += chars.charAt(52 + Math.floor(Math.random() * 8)); // Number
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length)); // Special
  
  // Fill rest randomly
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Shuffle
  return password.split("").sort(() => Math.random() - 0.5).join("");
}
