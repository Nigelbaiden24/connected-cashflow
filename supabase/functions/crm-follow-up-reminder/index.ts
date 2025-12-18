import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FollowUp {
  id: string;
  contact_id: string;
  user_id: string;
  follow_up_date: string;
  title: string;
  notes: string | null;
  contact: {
    name: string;
    company: string | null;
    email: string | null;
  } | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('CRM Follow-up Reminder: Starting check for upcoming follow-ups...');

    // Get current time and calculate reminder window (30 minutes before)
    const now = new Date();
    const reminderWindow = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
    
    console.log(`Checking for follow-ups between ${now.toISOString()} and ${reminderWindow.toISOString()}`);

    // Find pending follow-ups that are due within the next 30 minutes and haven't had reminders sent
    const { data: followUps, error: followUpsError } = await supabase
      .from('crm_follow_ups')
      .select(`
        id,
        contact_id,
        user_id,
        follow_up_date,
        title,
        notes,
        contact:crm_contacts(name, company, email)
      `)
      .eq('status', 'pending')
      .eq('reminder_sent', false)
      .lte('follow_up_date', reminderWindow.toISOString())
      .gte('follow_up_date', now.toISOString());

    if (followUpsError) {
      console.error('Error fetching follow-ups:', followUpsError);
      throw followUpsError;
    }

    console.log(`Found ${followUps?.length || 0} follow-ups requiring reminders`);

    if (!followUps || followUps.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No upcoming follow-ups to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let notificationsCreated = 0;
    const errors: string[] = [];

    for (const followUp of followUps as FollowUp[]) {
      try {
        const contactName = followUp.contact?.name || 'Unknown Contact';
        const company = followUp.contact?.company ? ` at ${followUp.contact.company}` : '';
        const followUpTime = new Date(followUp.follow_up_date).toLocaleString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });

        // Create notification
        const { error: notificationError } = await supabase
          .from('crm_notifications')
          .insert({
            user_id: followUp.user_id,
            follow_up_id: followUp.id,
            contact_id: followUp.contact_id,
            title: `Reminder: ${followUp.title}`,
            message: `You have a scheduled follow-up with ${contactName}${company} at ${followUpTime}`,
            notification_type: 'follow_up_reminder',
            action_url: `/finance-crm/${followUp.contact_id}`
          });

        if (notificationError) {
          console.error(`Error creating notification for follow-up ${followUp.id}:`, notificationError);
          errors.push(`Follow-up ${followUp.id}: ${notificationError.message}`);
          continue;
        }

        // Mark the follow-up as reminder sent
        const { error: updateError } = await supabase
          .from('crm_follow_ups')
          .update({
            reminder_sent: true,
            reminder_sent_at: new Date().toISOString()
          })
          .eq('id', followUp.id);

        if (updateError) {
          console.error(`Error updating follow-up ${followUp.id}:`, updateError);
          errors.push(`Follow-up ${followUp.id} update: ${updateError.message}`);
          continue;
        }

        notificationsCreated++;
        console.log(`Created notification for follow-up ${followUp.id} - Contact: ${contactName}`);
      } catch (err) {
        console.error(`Error processing follow-up ${followUp.id}:`, err);
        errors.push(`Follow-up ${followUp.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    console.log(`CRM Follow-up Reminder complete. Created ${notificationsCreated} notifications.`);

    return new Response(
      JSON.stringify({
        message: 'Follow-up reminder check complete',
        total: followUps.length,
        processed: notificationsCreated,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('CRM Follow-up Reminder Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to process follow-up reminders'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});