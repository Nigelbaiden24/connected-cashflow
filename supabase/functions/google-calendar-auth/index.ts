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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // If we have a code, this is the OAuth callback from Google
    if (code) {
      console.log('Processing OAuth callback with code');
      
      // Decode the user ID from state parameter
      let userId: string;
      try {
        const stateData = JSON.parse(atob(state || ''));
        userId = stateData.userId;
        if (!userId) throw new Error('No user ID in state');
      } catch (e) {
        console.error('Failed to parse state:', e);
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Error</title></head>
          <body>
            <h1>Authentication Error</h1>
            <p>Invalid state parameter. Please try connecting again.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
      const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
      const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-auth`;

      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Error</title></head>
          <body>
            <h1>Configuration Error</h1>
            <p>Google credentials not configured.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Token exchange failed:', error);
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Error</title></head>
          <body>
            <h1>Token Exchange Failed</h1>
            <p>Failed to exchange code for tokens. Please try again.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      const tokens = await tokenResponse.json();
      console.log('Token exchange successful');

      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const userInfo = await userInfoResponse.json();
      console.log('Got user info for:', userInfo.email);

      // Calculate token expiry
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

      // Store connection in database using service role
      const { error: dbError } = await supabaseAdmin
        .from('calendar_connections')
        .upsert({
          user_id: userId,
          provider: 'google',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt.toISOString(),
          email: userInfo.email,
          is_active: true,
          last_synced_at: new Date().toISOString(),
        }, { onConflict: 'user_id,provider' });

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Error</title></head>
          <body>
            <h1>Database Error</h1>
            <p>Failed to save connection. Please try again.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      console.log('Calendar connection saved successfully');

      // Return HTML that closes the popup and notifies parent window
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google Calendar Connected</title>
          <style>
            body { font-family: system-ui; text-align: center; padding: 50px; background: #f9fafb; }
            .success { color: #10b981; font-size: 24px; margin-bottom: 16px; }
            .email { color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="success">✓ Google Calendar Connected!</div>
          <p class="email">Connected as ${userInfo.email}</p>
          <p>You can close this window now.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'google-calendar-connected', email: '${userInfo.email}' }, '*');
            }
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // If no code, this is a request to get the authorization URL
    // Requires authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message || 'No user found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
    if (!GOOGLE_CLIENT_ID) {
      return new Response(JSON.stringify({ error: 'Google credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Encode user ID in state parameter for the callback
    const stateData = btoa(JSON.stringify({ userId: user.id }));

    const REDIRECT_URI = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-auth`;
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', stateData);

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
