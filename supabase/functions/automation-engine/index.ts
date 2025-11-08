import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationRule {
  id: string;
  rule_name: string;
  module: string;
  enabled: boolean;
  trigger_type: string;
  trigger_config: any;
  action_type: string;
  action_config: any;
  priority: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, rule_id, trigger_data } = await req.json();

    console.log(`Automation Engine: ${action}`, { rule_id, trigger_data });

    switch (action) {
      case 'execute_rule':
        return await executeRule(supabase, rule_id, trigger_data);
      
      case 'execute_scheduled':
        return await executeScheduledRules(supabase);
      
      case 'trigger_event':
        return await triggerEventBasedRules(supabase, trigger_data);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Automation Engine Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function executeRule(supabase: any, ruleId: string, triggerData: any) {
  const startTime = Date.now();
  let executionId: string;

  try {
    // Get the rule
    const { data: rule, error: ruleError } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (ruleError) throw ruleError;
    if (!rule.enabled) {
      throw new Error('Rule is disabled');
    }

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('automation_executions')
      .insert({
        rule_id: ruleId,
        status: 'running',
        started_at: new Date().toISOString(),
        trigger_data: triggerData
      })
      .select()
      .single();

    if (execError) throw execError;
    executionId = execution.id;

    await logAutomation(supabase, executionId, ruleId, 'info', `Starting execution of ${rule.rule_name}`);

    // Execute action based on action_type
    const result = await executeAction(supabase, rule, triggerData, executionId);

    // Update execution as success
    const executionTime = Date.now() - startTime;
    await supabase
      .from('automation_executions')
      .update({
        status: 'success',
        completed_at: new Date().toISOString(),
        execution_time_ms: executionTime,
        result_data: result
      })
      .eq('id', executionId);

    await logAutomation(supabase, executionId, ruleId, 'info', `Completed successfully in ${executionTime}ms`);

    return new Response(
      JSON.stringify({ success: true, execution_id: executionId, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    if (executionId) {
      await supabase
        .from('automation_executions')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          execution_time_ms: executionTime,
          error_message: error.message,
          error_stack: error.stack
        })
        .eq('id', executionId);

      await logAutomation(supabase, executionId, ruleId, 'error', `Failed: ${error.message}`);
    }

    throw error;
  }
}

async function executeAction(supabase: any, rule: AutomationRule, triggerData: any, executionId: string) {
  const { action_type, action_config, module } = rule;

  await logAutomation(supabase, executionId, rule.id, 'info', `Executing ${action_type} action for ${module}`);

  switch (action_type) {
    case 'data_sync':
      return await executeDataSync(supabase, action_config, triggerData, executionId, rule.id);
    
    case 'notification':
      return await executeNotification(supabase, action_config, triggerData, executionId);
    
    case 'report_generation':
      return await executeReportGeneration(supabase, action_config, module, executionId, rule.id);
    
    case 'workflow':
      return await executeWorkflow(supabase, action_config, triggerData, executionId, rule.id);
    
    default:
      throw new Error(`Unknown action type: ${action_type}`);
  }
}

async function executeDataSync(supabase: any, config: any, triggerData: any, executionId: string, ruleId: string) {
  const { source_table, target_table, sync_type, field_mappings } = config;
  
  await logAutomation(supabase, executionId, ruleId, 'info', `Syncing data from ${source_table} to ${target_table}`);

  // Fetch source data
  const { data: sourceData, error: sourceError } = await supabase
    .from(source_table)
    .select('*')
    .limit(100);

  if (sourceError) throw sourceError;

  let syncedCount = 0;
  for (const record of sourceData) {
    const mappedData: any = {};
    
    for (const [sourceField, targetField] of Object.entries(field_mappings)) {
      mappedData[targetField] = record[sourceField];
    }

    if (sync_type === 'upsert') {
      await supabase.from(target_table).upsert(mappedData);
    } else {
      await supabase.from(target_table).insert(mappedData);
    }
    syncedCount++;
  }

  return { synced_records: syncedCount, source: source_table, target: target_table };
}

async function executeNotification(supabase: any, config: any, triggerData: any, executionId: string) {
  const { notification_type, recipients, title, message_template } = config;

  // Replace template variables
  let message = message_template;
  if (triggerData) {
    Object.keys(triggerData).forEach(key => {
      message = message.replace(`{{${key}}}`, triggerData[key]);
    });
  }

  // Create notifications for recipients
  const notifications = recipients.map((recipient: any) => ({
    execution_id: executionId,
    user_id: recipient.user_id || null,
    notification_type,
    title,
    message,
    status: 'pending'
  }));

  const { error } = await supabase
    .from('automation_notifications')
    .insert(notifications);

  if (error) throw error;

  return { notifications_created: notifications.length };
}

async function executeReportGeneration(supabase: any, config: any, module: string, executionId: string, ruleId: string) {
  const { report_type, data_sources, format } = config;

  await logAutomation(supabase, executionId, ruleId, 'info', `Generating ${report_type} report for ${module}`);

  // Fetch data from configured sources
  const reportData: any = {};
  for (const source of data_sources) {
    const { data, error } = await supabase
      .from(source.table)
      .select(source.fields || '*')
      .limit(source.limit || 100);

    if (error) throw error;
    reportData[source.table] = data;
  }

  // Generate report metadata
  const report = {
    type: report_type,
    module,
    generated_at: new Date().toISOString(),
    format,
    data: reportData,
    summary: {
      total_records: Object.values(reportData).reduce((sum: number, arr: any) => sum + arr.length, 0)
    }
  };

  return report;
}

async function executeWorkflow(supabase: any, config: any, triggerData: any, executionId: string, ruleId: string) {
  const { workflow_steps } = config;

  await logAutomation(supabase, executionId, ruleId, 'info', `Executing workflow with ${workflow_steps.length} steps`);

  const results = [];
  for (const step of workflow_steps) {
    const stepResult = await executeWorkflowStep(supabase, step, triggerData, executionId, ruleId);
    results.push(stepResult);
  }

  return { workflow_completed: true, steps: results };
}

async function executeWorkflowStep(supabase: any, step: any, triggerData: any, executionId: string, ruleId: string) {
  const { step_type, step_config } = step;

  switch (step_type) {
    case 'update_record':
      return await supabase
        .from(step_config.table)
        .update(step_config.updates)
        .eq('id', triggerData.record_id);
    
    case 'create_record':
      return await supabase
        .from(step_config.table)
        .insert(step_config.data);
    
    case 'send_notification':
      return await executeNotification(supabase, step_config, triggerData, executionId);
    
    default:
      throw new Error(`Unknown workflow step type: ${step_type}`);
  }
}

async function executeScheduledRules(supabase: any) {
  // Get all scheduled rules that need to run
  const { data: schedules, error } = await supabase
    .from('automation_schedules')
    .select('*, automation_rules(*)')
    .eq('enabled', true)
    .lte('next_run_at', new Date().toISOString());

  if (error) throw error;

  const results = [];
  for (const schedule of schedules) {
    try {
      const result = await executeRule(supabase, schedule.rule_id, { scheduled: true });
      
      // Update next run time
      await supabase
        .from('automation_schedules')
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: new Date(Date.now() + 3600000).toISOString() // +1 hour for now
        })
        .eq('id', schedule.id);

      results.push({ schedule_id: schedule.id, success: true });
    } catch (error) {
      results.push({ schedule_id: schedule.id, success: false, error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ executed_schedules: results.length, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function triggerEventBasedRules(supabase: any, eventData: any) {
  const { event_type, event_source, data } = eventData;

  // Find rules with matching triggers
  const { data: triggers, error } = await supabase
    .from('automation_triggers')
    .select('*, automation_rules(*)')
    .eq('event_type', event_type)
    .eq('event_source', event_source);

  if (error) throw error;

  const results = [];
  for (const trigger of triggers) {
    if (!trigger.automation_rules.enabled) continue;

    try {
      const result = await executeRule(supabase, trigger.rule_id, { event: event_type, ...data });
      results.push({ rule_id: trigger.rule_id, success: true });
    } catch (error) {
      results.push({ rule_id: trigger.rule_id, success: false, error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ triggered_rules: results.length, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function logAutomation(supabase: any, executionId: string, ruleId: string, level: string, message: string, metadata?: any) {
  await supabase
    .from('automation_logs')
    .insert({
      execution_id: executionId,
      rule_id: ruleId,
      log_level: level,
      message,
      metadata
    });
}
