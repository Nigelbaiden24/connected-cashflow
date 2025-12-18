import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple encoding for state parameter (user_id)
function encodeState(userId: string): string {
  return btoa(JSON.stringify({ userId, timestamp: Date.now() }));
}

function decodeState(state: string): { userId: string; timestamp: number } | null {
  try {
    return JSON.parse(atob(state));
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    // If we have a code, this is the OAuth callback from Microsoft
    if (code) {
      console.log('Processing OAuth callback with code');
      
      // Decode state to get user ID
      if (!state) {
        console.error('No state parameter in callback');
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Error</title></head>
          <body style="font-family: system-ui; text-align: center; padding: 50px;">
            <div style="color: #ef4444; font-size: 24px;">✗ Connection Failed</div>
            <p>Missing state parameter. Please try again.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>
        `, { headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
      }

      const stateData = decodeState(state);
      if (!stateData || !stateData.userId) {
        console.error('Invalid state parameter');
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Error</title></head>
          <body style="font-family: system-ui; text-align: center; padding: 50px;">
            <div style="color: #ef4444; font-size: 24px;">✗ Connection Failed</div>
            <p>Invalid state parameter. Please try again.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>
        `, { headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
      }

      // Check state is not too old (5 minutes)
      if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
        console.error('State parameter expired');
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Error</title></head>
          <body style="font-family: system-ui; text-align: center; padding: 50px;">
            <div style="color: #ef4444; font-size: 24px;">✗ Connection Expired</div>
            <p>The authorization request expired. Please try again.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>
        `, { headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
      }

      const MICROSOFT_CLIENT_ID = Deno.env.get('MICROSOFT_CLIENT_ID');
      const MICROSOFT_CLIENT_SECRET = Deno.env.get('MICROSOFT_CLIENT_SECRET');
      const MICROSOFT_TENANT_ID = Deno.env.get('MICROSOFT_TENANT_ID') || 'common';
      const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/outlook-calendar-auth`;

      if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
        console.error('Microsoft credentials not configured');
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Error</title></head>
          <body style="font-family: system-ui; text-align: center; padding: 50px;">
            <div style="color: #ef4444; font-size: 24px;">✗ Configuration Error</div>
            <p>Microsoft credentials not configured.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>
        `, { headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
      }

      // Exchange authorization code for tokens
      console.log('Exchanging code for tokens with tenant:', MICROSOFT_TENANT_ID);
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: MICROSOFT_CLIENT_ID,
          client_secret: MICROSOFT_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Error</title></head>
          <body style="font-family: system-ui; text-align: center; padding: 50px;">
            <div style="color: #ef4444; font-size: 24px;">✗ Authentication Failed</div>
            <p>Failed to complete authentication with Microsoft.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>
        `, { headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
      }

      const tokens = await tokenResponse.json();
      console.log('Token exchange successful');

      // Get user info from Microsoft Graph
      const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const userInfo = await userInfoResponse.json();
      console.log('Got user info:', userInfo.mail || userInfo.userPrincipalName);

      // Calculate token expiry
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

      // Use service role to save connection (since we don't have user auth on callback)
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Store connection in database
      const { error: dbError } = await supabaseAdmin
        .from('calendar_connections')
        .upsert({
          user_id: stateData.userId,
          provider: 'outlook',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt.toISOString(),
          email: userInfo.mail || userInfo.userPrincipalName,
          is_active: true,
          last_synced_at: new Date().toISOString(),
        }, { onConflict: 'user_id,provider' });

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Error</title></head>
          <body style="font-family: system-ui; text-align: center; padding: 50px;">
            <div style="color: #ef4444; font-size: 24px;">✗ Save Failed</div>
            <p>Failed to save calendar connection.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>
        `, { headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
      }

      console.log('Calendar connection saved successfully for user:', stateData.userId);

      // Return HTML that closes the popup and notifies parent window
      const email = userInfo.mail || userInfo.userPrincipalName || '';
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Outlook Calendar Connected</title>
          <style>
            body { font-family: system-ui; text-align: center; padding: 50px; background: #f9fafb; }
            .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
            .success { color: #10b981; font-size: 48px; margin-bottom: 16px; }
            h1 { color: #111827; font-size: 24px; margin-bottom: 8px; }
            p { color: #6b7280; margin-bottom: 4px; }
            .email { color: #3b82f6; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓</div>
            <h1>Outlook Calendar Connected!</h1>
            <p>Successfully connected as:</p>
            <p class="email">${email}</p>
            <p style="margin-top: 20px; font-size: 14px;">This window will close automatically...</p>
          </div>
          <script>
            window.opener?.postMessage({ type: 'outlook-calendar-connected', email: '${email}' }, '*');
            setTimeout(() => window.close(), 2500);
          </script>
        </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      });
    }

    // No code - this is the initial request to get auth URL
    // User must be authenticated for this request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const MICROSOFT_CLIENT_ID = Deno.env.get('MICROSOFT_CLIENT_ID');
    if (!MICROSOFT_CLIENT_ID) {
      return new Response(JSON.stringify({ error: 'Microsoft credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/outlook-calendar-auth`;
    const MICROSOFT_TENANT_ID = Deno.env.get('MICROSOFT_TENANT_ID') || 'common';
    
    // Encode user ID in state parameter
    const stateParam = encodeState(user.id);
    
    const authUrl = new URL(`https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`);
    authUrl.searchParams.set('client_id', MICROSOFT_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'Calendars.Read User.Read offline_access');
    authUrl.searchParams.set('response_mode', 'query');
    authUrl.searchParams.set('state', stateParam);

    console.log('Generated auth URL for user:', user.id);

    return new Response(JSON.stringify({ authUrl: authUrl.toString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
