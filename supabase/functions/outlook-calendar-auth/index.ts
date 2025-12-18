import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    // If we have a code, exchange it for tokens
    if (code) {
      const MICROSOFT_CLIENT_ID = Deno.env.get('MICROSOFT_CLIENT_ID');
      const MICROSOFT_CLIENT_SECRET = Deno.env.get('MICROSOFT_CLIENT_SECRET');
      const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/outlook-calendar-auth`;

      if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
        return new Response(JSON.stringify({ error: 'Microsoft credentials not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Exchange authorization code for tokens
      const MICROSOFT_TENANT_ID = Deno.env.get('MICROSOFT_TENANT_ID') || 'common';
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
        const error = await tokenResponse.text();
        console.error('Token exchange failed:', error);
        return new Response(JSON.stringify({ error: 'Failed to exchange code for tokens' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const tokens = await tokenResponse.json();

      // Get user info from Microsoft Graph
      const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const userInfo = await userInfoResponse.json();

      // Calculate token expiry
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

      // Store connection in database
      const { error: dbError } = await supabaseClient
        .from('calendar_connections')
        .upsert({
          user_id: user.id,
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
        return new Response(JSON.stringify({ error: 'Failed to save connection' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Return HTML that closes the popup and notifies parent window
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Outlook Calendar Connected</title>
          <style>
            body { font-family: system-ui; text-align: center; padding: 50px; }
            .success { color: #10b981; font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="success">✓ Outlook Calendar Connected!</div>
          <p>You can close this window now.</p>
          <script>
            window.opener?.postMessage({ type: 'outlook-calendar-connected', email: '${userInfo.mail || userInfo.userPrincipalName}' }, '*');
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      });
    }

    // If no code, return authorization URL
    const MICROSOFT_CLIENT_ID = Deno.env.get('MICROSOFT_CLIENT_ID');
    if (!MICROSOFT_CLIENT_ID) {
      return new Response(JSON.stringify({ error: 'Microsoft credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/outlook-calendar-auth`;
    const MICROSOFT_TENANT_ID = Deno.env.get('MICROSOFT_TENANT_ID') || 'common';
    const authUrl = new URL(`https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`);
    authUrl.searchParams.set('client_id', MICROSOFT_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'Calendars.Read User.Read offline_access');
    authUrl.searchParams.set('response_mode', 'query');

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
