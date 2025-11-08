import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Seeding automation rules...');

    // Check if rules already exist
    const { data: existingRules } = await supabase
      .from('automation_rules')
      .select('id')
      .limit(1);

    if (existingRules && existingRules.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Automation rules already seeded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Business Platform Automations
    const businessAutomations = [
      {
        rule_name: 'New Client Onboarding',
        module: 'CRM',
        description: 'Automatically create onboarding tasks and welcome email when new client is added',
        trigger_type: 'event',
        trigger_config: { event_type: 'client_created', event_source: 'clients' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'send_notification', step_config: { notification_type: 'email', title: 'Welcome', message_template: 'Welcome {{name}}!' } },
            { step_type: 'create_record', step_config: { table: 'audit_logs', data: { action: 'client_onboarded' } } }
          ]
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'Project Auto-Creation',
        module: 'Projects',
        description: 'Create project automatically when deal is closed in CRM',
        trigger_type: 'event',
        trigger_config: { event_type: 'deal_closed', event_source: 'crm_contacts' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'create_record', step_config: { table: 'audit_logs', data: { action: 'project_created' } } }
          ]
        },
        priority: 9,
        enabled: true
      },
      {
        rule_name: 'Daily Dashboard Sync',
        module: 'Dashboard',
        description: 'Sync analytics and KPI data every morning',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 8 * * *' },
        action_type: 'data_sync',
        action_config: {
          source_table: 'crm_contacts',
          target_table: 'audit_logs',
          sync_type: 'upsert',
          field_mappings: { id: 'resource_id', name: 'details' }
        },
        priority: 5,
        enabled: true
      },
      {
        rule_name: 'Revenue Anomaly Detection',
        module: 'Revenue',
        description: 'Alert when revenue deviates significantly from projections',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 */6 * * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Revenue Alert',
          message_template: 'Revenue metrics updated'
        },
        priority: 7,
        enabled: true
      },
      {
        rule_name: 'Payroll Calculation',
        module: 'Payroll',
        description: 'Calculate monthly payroll automatically',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 0 1 * *' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'create_record', step_config: { table: 'payroll_runs', data: { status: 'draft' } } }
          ]
        },
        priority: 10,
        enabled: false
      },
      {
        rule_name: 'Security Compliance Check',
        module: 'Security',
        description: 'Run daily security and compliance audits',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 2 * * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'compliance',
          format: 'json',
          data_sources: [
            { table: 'audit_logs', fields: '*', limit: 500 },
            { table: 'security_policies', fields: '*', limit: 100 }
          ]
        },
        priority: 9,
        enabled: true
      }
    ];

    // Finance Platform Automations
    const financeAutomations = [
      {
        rule_name: 'Portfolio Rebalancing Alert',
        module: 'Portfolio',
        description: 'Alert when portfolio drift exceeds threshold',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 * * 1' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Portfolio Rebalancing Required',
          message_template: 'Portfolio drift detected for client {{client_name}}'
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'Client Goal Progress Tracking',
        module: 'Goals',
        description: 'Track and report on client goal progress monthly',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 10 1 * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'goal_progress',
          format: 'pdf',
          data_sources: [
            { table: 'client_goals', fields: '*', limit: 1000 },
            { table: 'clients', fields: 'id,name,email', limit: 1000 }
          ]
        },
        priority: 7,
        enabled: true
      },
      {
        rule_name: 'Market Data Refresh',
        module: 'Market Data',
        description: 'Refresh market data and update watchlists',
        trigger_type: 'schedule',
        trigger_config: { cron: '*/15 * * * *' },
        action_type: 'data_sync',
        action_config: {
          source_table: 'portfolio_holdings',
          target_table: 'audit_logs',
          sync_type: 'insert',
          field_mappings: { id: 'resource_id', asset_name: 'details' }
        },
        priority: 6,
        enabled: true
      },
      {
        rule_name: 'Compliance Document Review',
        module: 'Compliance',
        description: 'Review and update compliance documents quarterly',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 1 */3 *' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'create_record', step_config: { table: 'audit_logs', data: { action: 'compliance_review' } } }
          ]
        },
        priority: 10,
        enabled: true
      }
    ];

    const allRules = [...businessAutomations, ...financeAutomations];

    // Insert rules
    const { data: rules, error: rulesError } = await supabase
      .from('automation_rules')
      .insert(allRules)
      .select();

    if (rulesError) throw rulesError;

    // Create schedules for scheduled rules
    const schedules = rules
      .filter((rule: any) => rule.trigger_type === 'schedule')
      .map((rule: any) => ({
        rule_id: rule.id,
        cron_expression: rule.trigger_config.cron,
        timezone: 'UTC',
        next_run_at: new Date(Date.now() + 3600000).toISOString(),
        enabled: rule.enabled
      }));

    if (schedules.length > 0) {
      const { error: schedulesError } = await supabase
        .from('automation_schedules')
        .insert(schedules);

      if (schedulesError) throw schedulesError;
    }

    // Create triggers for event-based rules
    const triggers = rules
      .filter((rule: any) => rule.trigger_type === 'event')
      .map((rule: any) => ({
        rule_id: rule.id,
        event_type: rule.trigger_config.event_type,
        event_source: rule.trigger_config.event_source
      }));

    if (triggers.length > 0) {
      const { error: triggersError } = await supabase
        .from('automation_triggers')
        .insert(triggers);

      if (triggersError) throw triggersError;
    }

    console.log(`Successfully seeded ${rules.length} automation rules`);

    return new Response(
      JSON.stringify({
        success: true,
        rules_created: rules.length,
        schedules_created: schedules.length,
        triggers_created: triggers.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Seed Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
