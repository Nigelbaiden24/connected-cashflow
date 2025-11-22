import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
  const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return null;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) return null;

  const tokens = await response.json();
  return tokens.access_token;
}

async function refreshOutlookToken(refreshToken: string): Promise<string | null> {
  const MICROSOFT_CLIENT_ID = Deno.env.get('MICROSOFT_CLIENT_ID');
  const MICROSOFT_CLIENT_SECRET = Deno.env.get('MICROSOFT_CLIENT_SECRET');

  if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
    return null;
  }

  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      client_secret: MICROSOFT_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) return null;

  const tokens = await response.json();
  return tokens.access_token;
}

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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message || 'No user found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all active calendar connections
    const { data: connections, error: connectionsError } = await supabaseClient
      .from('calendar_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (connectionsError) {
      console.error('Error fetching connections:', connectionsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch connections' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!connections || connections.length === 0) {
      return new Response(JSON.stringify({ events: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const allEvents = [];

    // Fetch events from each provider
    for (const connection of connections) {
      let accessToken = connection.access_token;

      // Check if token is expired and refresh if needed
      const expiresAt = new Date(connection.token_expires_at);
      if (expiresAt < new Date() && connection.refresh_token) {
        const newToken = connection.provider === 'google'
          ? await refreshGoogleToken(connection.refresh_token)
          : await refreshOutlookToken(connection.refresh_token);

        if (newToken) {
          accessToken = newToken;
          const newExpiresAt = new Date();
          newExpiresAt.setHours(newExpiresAt.getHours() + 1);

          await supabaseClient
            .from('calendar_connections')
            .update({
              access_token: newToken,
              token_expires_at: newExpiresAt.toISOString(),
            })
            .eq('id', connection.id);
        }
      }

      // Fetch events based on provider
      if (connection.provider === 'google') {
        const timeMin = new Date().toISOString();
        const timeMax = new Date();
        timeMax.setMonth(timeMax.getMonth() + 3);

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax.toISOString()}&maxResults=50&singleEvents=true&orderBy=startTime`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (response.ok) {
          const data = await response.json();
          const events = data.items?.map((event: any) => ({
            id: `google-${event.id}`,
            title: event.summary || 'Untitled',
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            location: event.location || null,
            provider: 'google',
            email: connection.email,
          })) || [];
          allEvents.push(...events);
        }
      } else if (connection.provider === 'outlook') {
        const startDate = new Date().toISOString();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);

        const response = await fetch(
          `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${startDate}&endDateTime=${endDate.toISOString()}&$top=50&$orderby=start/dateTime`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (response.ok) {
          const data = await response.json();
          const events = data.value?.map((event: any) => ({
            id: `outlook-${event.id}`,
            title: event.subject || 'Untitled',
            start: event.start.dateTime,
            end: event.end.dateTime,
            location: event.location?.displayName || null,
            provider: 'outlook',
            email: connection.email,
          })) || [];
          allEvents.push(...events);
        }
      }

      // Update last synced timestamp
      await supabaseClient
        .from('calendar_connections')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', connection.id);
    }

    // Sort events by start date
    allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return new Response(JSON.stringify({ events: allEvents }), {
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
