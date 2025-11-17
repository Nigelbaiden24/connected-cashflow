import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClientData {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone: string | null;
  risk_profile: string | null;
  investment_experience: string | null;
  annual_income: number | null;
  net_worth: number | null;
  user_id: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { client_id } = await req.json();

    console.log(`Starting onboarding automation for client: ${client_id}`);

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single();

    if (clientError) throw clientError;
    if (!client) throw new Error('Client not found');

    const automationResults = {
      client_id: client.id,
      client_name: client.name,
      steps_completed: [] as string[],
      errors: [] as string[],
    };

    // Step 1: Create initial financial plan
    try {
      const planName = `Initial Financial Plan - ${client.name}`;
      const { data: plan, error: planError } = await supabase
        .from('financial_plans')
        .insert({
          client_id: client.id,
          plan_name: planName,
          plan_type: 'comprehensive',
          start_date: new Date().toISOString().split('T')[0],
          status: 'draft',
          risk_tolerance: client.risk_profile || 'moderate',
          current_net_worth: client.net_worth || 0,
          notes: 'Initial financial plan created during onboarding',
          created_by: client.user_id,
        })
        .select()
        .single();

      if (planError) throw planError;
      automationResults.steps_completed.push('financial_plan_created');
      console.log(`Created financial plan: ${plan.id}`);

      // Create initial plan milestones
      const milestones = [
        {
          plan_id: plan.id,
          milestone_name: 'Emergency Fund',
          target_amount: (client.annual_income || 0) * 0.5, // 6 months expenses
          target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          notes: 'Build emergency fund covering 6 months of expenses'
        },
        {
          plan_id: plan.id,
          milestone_name: 'Initial Investment Review',
          target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          notes: 'Review initial investment strategy and asset allocation'
        }
      ];

      await supabase.from('plan_milestones').insert(milestones);
      automationResults.steps_completed.push('milestones_created');
    } catch (error) {
      console.error('Error creating financial plan:', error);
      automationResults.errors.push(`financial_plan: ${error.message}`);
    }

    // Step 2: Create initial client goals
    try {
      const defaultGoals = [
        {
          client_id: client.id,
          goal_type: 'Retirement',
          goal_name: 'Retirement Planning',
          target_amount: (client.annual_income || 100000) * 10,
          current_amount: 0,
          priority: 'High',
          status: 'On Track',
          notes: 'Long-term retirement savings goal'
        },
        {
          client_id: client.id,
          goal_type: 'Investment',
          goal_name: 'Wealth Accumulation',
          target_amount: (client.net_worth || 100000) * 1.5,
          current_amount: client.net_worth || 0,
          priority: 'Medium',
          status: 'On Track',
          notes: 'General wealth building objective'
        }
      ];

      await supabase.from('client_goals').insert(defaultGoals);
      automationResults.steps_completed.push('client_goals_created');
      console.log('Created default client goals');
    } catch (error) {
      console.error('Error creating client goals:', error);
      automationResults.errors.push(`client_goals: ${error.message}`);
    }

    // Step 3: Schedule initial consultation meeting
    try {
      const meetingDate = new Date();
      meetingDate.setDate(meetingDate.getDate() + 7); // 1 week from now

      const { error: meetingError } = await supabase
        .from('client_meetings')
        .insert({
          client_id: client.id,
          meeting_date: meetingDate.toISOString(),
          meeting_type: 'Initial Consultation',
          duration_minutes: 60,
          status: 'Scheduled',
          location: 'Office / Virtual',
          agenda: [
            'Introduction and relationship building',
            'Review financial profile and goals',
            'Discuss risk tolerance and investment preferences',
            'Present initial strategy recommendations',
            'Address questions and concerns'
          ],
          notes: 'Initial consultation meeting scheduled during onboarding'
        });

      if (meetingError) throw meetingError;
      automationResults.steps_completed.push('initial_meeting_scheduled');
      console.log('Scheduled initial consultation meeting');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      automationResults.errors.push(`meeting_schedule: ${error.message}`);
    }

    // Step 4: Create document checklist entries
    try {
      const requiredDocuments = [
        {
          client_id: client.id,
          document_name: 'Government-issued Photo ID',
          document_type: 'identification',
          notes: 'Passport or Driving Licence required for KYC compliance'
        },
        {
          client_id: client.id,
          document_name: 'Proof of Address',
          document_type: 'identification',
          notes: 'Recent utility bill or council tax statement (within 3 months)'
        },
        {
          client_id: client.id,
          document_name: 'Bank Statements',
          document_type: 'financial',
          notes: 'Last 3 months of bank statements'
        },
        {
          client_id: client.id,
          document_name: 'Investment Account Statements',
          document_type: 'financial',
          notes: 'Current holdings and performance statements (if applicable)'
        }
      ];

      await supabase.from('client_documents').insert(requiredDocuments);
      automationResults.steps_completed.push('document_checklist_created');
      console.log('Created document checklist');
    } catch (error) {
      console.error('Error creating document checklist:', error);
      automationResults.errors.push(`documents: ${error.message}`);
    }

    // Step 5: Create welcome notification/note
    try {
      const welcomeNote = `Welcome to FlowPulse Finance, ${client.name}!

Your account has been successfully created. Here's what happens next:

✓ Initial Financial Plan - Created and ready for review
✓ First Consultation - Scheduled for ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
✓ Document Checklist - Available in your client portal

We look forward to helping you achieve your financial goals.

Best regards,
The FlowPulse Finance Team`;

      const { error: noteError } = await supabase
        .from('clients')
        .update({
          notes: welcomeNote,
          last_contact_date: new Date().toISOString()
        })
        .eq('id', client.id);

      if (noteError) throw noteError;
      automationResults.steps_completed.push('welcome_note_added');
      console.log('Added welcome note to client');
    } catch (error) {
      console.error('Error adding welcome note:', error);
      automationResults.errors.push(`welcome_note: ${error.message}`);
    }

    // Log automation execution
    console.log('Onboarding automation completed:', automationResults);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Client onboarding automation completed',
        results: automationResults
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Client onboarding automation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
