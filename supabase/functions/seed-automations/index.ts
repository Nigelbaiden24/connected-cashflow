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

    // Business Platform Automations - Comprehensive Coverage
    const businessAutomations = [
      // Dashboard Automations
      {
        rule_name: 'Real-time KPI Dashboard Sync',
        module: 'Dashboard',
        description: 'Auto-refresh all KPI metrics and generate executive summary every 15 minutes',
        trigger_type: 'schedule',
        trigger_config: { cron: '*/15 * * * *' },
        action_type: 'data_sync',
        action_config: {
          source_table: 'crm_contacts',
          target_table: 'audit_logs',
          sync_type: 'upsert',
          field_mappings: { id: 'resource_id', name: 'details' }
        },
        priority: 9,
        enabled: true
      },
      {
        rule_name: 'Daily Executive Summary Report',
        module: 'Dashboard',
        description: 'Generate comprehensive daily dashboard report with AI insights',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 8 * * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'executive_summary',
          format: 'pdf',
          data_sources: [
            { table: 'audit_logs', fields: '*', limit: 100 },
            { table: 'crm_contacts', fields: '*', limit: 50 }
          ]
        },
        priority: 8,
        enabled: true
      },

      // Projects Automations
      {
        rule_name: 'Auto-Create Project from CRM Deal',
        module: 'Projects',
        description: 'Automatically create project with tasks when CRM deal is closed',
        trigger_type: 'event',
        trigger_config: { event_type: 'deal_closed', event_source: 'crm_contacts' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'create_record', step_config: { table: 'audit_logs', data: { action: 'project_created' } } },
            { step_type: 'send_notification', step_config: { notification_type: 'email', title: 'New Project Created', message_template: 'Project for {{client_name}} has been created' } }
          ]
        },
        priority: 10,
        enabled: true
      },
      {
        rule_name: 'Project Milestone Alerts',
        module: 'Projects',
        description: 'Alert team when project milestones are approaching or overdue',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 * * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Project Milestone Alert',
          message_template: 'Milestone {{milestone_name}} is approaching'
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'Project Status Auto-Update',
        module: 'Projects',
        description: 'Automatically update project status based on task completion',
        trigger_type: 'event',
        trigger_config: { event_type: 'task_completed', event_source: 'tasks' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'update_record', step_config: { table: 'audit_logs', updates: { action: 'project_updated' } } }
          ]
        },
        priority: 7,
        enabled: true
      },

      // Tasks Automations
      {
        rule_name: 'Smart Task Assignment',
        module: 'Tasks',
        description: 'Auto-assign tasks based on team workload and expertise',
        trigger_type: 'event',
        trigger_config: { event_type: 'task_created', event_source: 'tasks' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'create_record', step_config: { table: 'audit_logs', data: { action: 'task_assigned' } } }
          ]
        },
        priority: 9,
        enabled: true
      },
      {
        rule_name: 'Task Deadline Reminders',
        module: 'Tasks',
        description: 'Send escalating reminders as task deadlines approach',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 */4 * * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Task Deadline Reminder',
          message_template: 'Task {{task_name}} is due in {{hours}} hours'
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'Dependency Chain Automation',
        module: 'Tasks',
        description: 'Auto-trigger dependent tasks when prerequisites complete',
        trigger_type: 'event',
        trigger_config: { event_type: 'task_completed', event_source: 'tasks' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'create_record', step_config: { table: 'audit_logs', data: { action: 'dependent_task_triggered' } } }
          ]
        },
        priority: 9,
        enabled: true
      },

      // CRM Automations
      {
        rule_name: 'New Client Onboarding Workflow',
        module: 'CRM',
        description: 'Complete onboarding sequence: welcome email, tasks, document requests',
        trigger_type: 'event',
        trigger_config: { event_type: 'client_created', event_source: 'crm_contacts' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'send_notification', step_config: { notification_type: 'email', title: 'Welcome', message_template: 'Welcome {{name}}!' } },
            { step_type: 'create_record', step_config: { table: 'audit_logs', data: { action: 'client_onboarded' } } }
          ]
        },
        priority: 10,
        enabled: true
      },
      {
        rule_name: 'Lead Scoring & Prioritization',
        module: 'CRM',
        description: 'Auto-score and prioritize leads based on engagement and value',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 */6 * * *' },
        action_type: 'data_sync',
        action_config: {
          source_table: 'crm_contacts',
          target_table: 'audit_logs',
          sync_type: 'upsert',
          field_mappings: { id: 'resource_id', priority: 'details' }
        },
        priority: 7,
        enabled: true
      },
      {
        rule_name: 'Client Communication Tracking',
        module: 'CRM',
        description: 'Log all interactions and suggest follow-up actions',
        trigger_type: 'event',
        trigger_config: { event_type: 'interaction_logged', event_source: 'crm_interactions' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'create_record', step_config: { table: 'audit_logs', data: { action: 'interaction_tracked' } } }
          ]
        },
        priority: 6,
        enabled: true
      },

      // Calendar & Scheduling
      {
        rule_name: 'Meeting Conflict Detection',
        module: 'Calendar',
        description: 'Prevent double-booking and suggest alternative times',
        trigger_type: 'event',
        trigger_config: { event_type: 'meeting_scheduled', event_source: 'client_meetings' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Schedule Conflict',
          message_template: 'Meeting conflicts with {{conflicting_event}}'
        },
        priority: 9,
        enabled: true
      },
      {
        rule_name: 'Auto Meeting Preparation',
        module: 'Calendar',
        description: 'Generate meeting briefs and gather relevant documents 1 hour before',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 * * * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'meeting_brief',
          format: 'pdf',
          data_sources: [
            { table: 'client_meetings', fields: '*', limit: 10 },
            { table: 'crm_contacts', fields: '*', limit: 10 }
          ]
        },
        priority: 7,
        enabled: true
      },

      // Analytics Automations
      {
        rule_name: 'Real-time Analytics Processing',
        module: 'Analytics',
        description: 'Process and aggregate analytics data every 30 minutes',
        trigger_type: 'schedule',
        trigger_config: { cron: '*/30 * * * *' },
        action_type: 'data_sync',
        action_config: {
          source_table: 'audit_logs',
          target_table: 'audit_logs',
          sync_type: 'upsert',
          field_mappings: { id: 'resource_id', timestamp: 'details' }
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'Anomaly Detection Alerts',
        module: 'Analytics',
        description: 'AI-powered anomaly detection with instant alerts',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 */2 * * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Analytics Anomaly Detected',
          message_template: 'Unusual pattern detected in {{metric_name}}'
        },
        priority: 9,
        enabled: true
      },
      {
        rule_name: 'Weekly Business Intelligence Report',
        module: 'Analytics',
        description: 'Comprehensive weekly BI report with trends and predictions',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 * * 1' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'weekly_bi',
          format: 'pdf',
          data_sources: [
            { table: 'audit_logs', fields: '*', limit: 500 },
            { table: 'crm_contacts', fields: '*', limit: 200 }
          ]
        },
        priority: 8,
        enabled: true
      },

      // Revenue Tracking
      {
        rule_name: 'Revenue Anomaly Detection',
        module: 'Revenue',
        description: 'Alert when revenue deviates from forecasts or shows unusual patterns',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 */6 * * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Revenue Alert',
          message_template: 'Revenue deviation detected: {{variance}}%'
        },
        priority: 10,
        enabled: true
      },
      {
        rule_name: 'Invoice Follow-up Automation',
        module: 'Revenue',
        description: 'Auto-send payment reminders for overdue invoices',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 10 * * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'email',
          recipients: [],
          title: 'Payment Reminder',
          message_template: 'Invoice {{invoice_number}} is overdue'
        },
        priority: 9,
        enabled: true
      },
      {
        rule_name: 'Revenue Forecasting Update',
        module: 'Revenue',
        description: 'Update revenue forecasts based on current pipeline and trends',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 0 1 * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'revenue_forecast',
          format: 'pdf',
          data_sources: [
            { table: 'crm_contacts', fields: '*', limit: 100 }
          ]
        },
        priority: 8,
        enabled: true
      },

      // HR & Payroll
      {
        rule_name: 'Automated Payroll Calculation',
        module: 'Payroll',
        description: 'Calculate payroll with tax deductions and benefits on schedule',
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
        rule_name: 'Time-off Balance Alerts',
        module: 'Payroll',
        description: 'Notify employees of time-off balance and expiring days',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 1 * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'email',
          recipients: [],
          title: 'Time-off Balance Update',
          message_template: 'You have {{days}} days remaining'
        },
        priority: 6,
        enabled: true
      },
      {
        rule_name: 'Compliance Document Expiry Alerts',
        module: 'Payroll',
        description: 'Alert when employee compliance documents are expiring',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 * * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Document Expiring',
          message_template: 'Document {{document_name}} expires in {{days}} days'
        },
        priority: 9,
        enabled: true
      },

      // Security
      {
        rule_name: 'Daily Security Audit',
        module: 'Security',
        description: 'Comprehensive daily security scan and compliance check',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 2 * * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'security_audit',
          format: 'json',
          data_sources: [
            { table: 'audit_logs', fields: '*', limit: 1000 },
            { table: 'security_policies', fields: '*', limit: 100 }
          ]
        },
        priority: 10,
        enabled: true
      },
      {
        rule_name: 'Failed Login Alert',
        module: 'Security',
        description: 'Instant alerts on suspicious login attempts',
        trigger_type: 'event',
        trigger_config: { event_type: 'failed_login', event_source: 'audit_logs' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Security Alert',
          message_template: 'Multiple failed login attempts from {{ip_address}}'
        },
        priority: 10,
        enabled: true
      },
      {
        rule_name: 'GDPR Compliance Check',
        module: 'Security',
        description: 'Monthly GDPR compliance verification and reporting',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 1 * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'gdpr_compliance',
          format: 'pdf',
          data_sources: [
            { table: 'security_policies', fields: '*', limit: 100 }
          ]
        },
        priority: 10,
        enabled: true
      }
    ];

    // Finance Platform Automations - Comprehensive Coverage
    const financeAutomations = [
      // Dashboard Automations
      {
        rule_name: 'AUM Real-time Tracking',
        module: 'Dashboard',
        description: 'Monitor Assets Under Management with live updates and alerts',
        trigger_type: 'schedule',
        trigger_config: { cron: '*/15 * * * *' },
        action_type: 'data_sync',
        action_config: {
          source_table: 'portfolio_holdings',
          target_table: 'audit_logs',
          sync_type: 'upsert',
          field_mappings: { id: 'resource_id', current_value: 'details' }
        },
        priority: 9,
        enabled: true
      },
      {
        rule_name: 'Client Financial Health Score',
        module: 'Dashboard',
        description: 'Calculate and update client financial health scores daily',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 7 * * *' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'create_record', step_config: { table: 'audit_logs', data: { action: 'health_score_updated' } } }
          ]
        },
        priority: 8,
        enabled: true
      },

      // Portfolio Management
      {
        rule_name: 'Portfolio Rebalancing Alert',
        module: 'Portfolio',
        description: 'Alert when portfolio drift exceeds predefined thresholds',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 * * 1' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Portfolio Rebalancing Required',
          message_template: 'Portfolio for {{client_name}} has drifted {{percentage}}% from target'
        },
        priority: 9,
        enabled: true
      },
      {
        rule_name: 'Performance Benchmark Comparison',
        module: 'Portfolio',
        description: 'Compare portfolio performance against benchmarks weekly',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 8 * * 1' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'performance_benchmark',
          format: 'pdf',
          data_sources: [
            { table: 'portfolio_holdings', fields: '*', limit: 500 },
            { table: 'clients', fields: 'id,name,risk_profile', limit: 200 }
          ]
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'Tax-loss Harvesting Opportunities',
        module: 'Portfolio',
        description: 'Identify and alert on tax-loss harvesting opportunities quarterly',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 1 */3 *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Tax-loss Harvesting Opportunity',
          message_template: 'Potential tax savings of {{amount}} for {{client_name}}'
        },
        priority: 7,
        enabled: true
      },

      // Financial Planning
      {
        rule_name: 'Plan Progress Tracking',
        module: 'Financial Planning',
        description: 'Track financial plan progress and update projections monthly',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 8 1 * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'plan_progress',
          format: 'pdf',
          data_sources: [
            { table: 'financial_plans', fields: '*', limit: 100 },
            { table: 'clients', fields: '*', limit: 100 }
          ]
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'Retirement Readiness Check',
        module: 'Financial Planning',
        description: 'Assess retirement readiness and provide recommendations quarterly',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 1 */3 *' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'create_record', step_config: { table: 'audit_logs', data: { action: 'retirement_check_completed' } } }
          ]
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'Cash Flow Projection Update',
        module: 'Financial Planning',
        description: 'Update cash flow projections based on actual spending patterns',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 10 1 * *' },
        action_type: 'data_sync',
        action_config: {
          source_table: 'expense_categories',
          target_table: 'audit_logs',
          sync_type: 'upsert',
          field_mappings: { id: 'resource_id', annual_amount: 'details' }
        },
        priority: 7,
        enabled: true
      },

      // Goal Planning
      {
        rule_name: 'Goal Progress Tracking',
        module: 'Goals',
        description: 'Track client goal progress and send monthly updates',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 10 1 * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'goal_progress',
          format: 'pdf',
          data_sources: [
            { table: 'client_goals', fields: '*', limit: 500 },
            { table: 'clients', fields: 'id,name,email', limit: 200 }
          ]
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'Goal Milestone Celebrations',
        module: 'Goals',
        description: 'Auto-celebrate when clients reach financial milestones',
        trigger_type: 'event',
        trigger_config: { event_type: 'goal_milestone_reached', event_source: 'client_goals' },
        action_type: 'notification',
        action_config: {
          notification_type: 'email',
          recipients: [],
          title: 'Congratulations on Your Milestone!',
          message_template: 'You have reached {{milestone_name}}!'
        },
        priority: 6,
        enabled: true
      },
      {
        rule_name: 'Goal At-Risk Alerts',
        module: 'Goals',
        description: 'Alert when goals are at risk of not being met',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 15 * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Goal At Risk',
          message_template: 'Goal {{goal_name}} may not be achieved without adjustments'
        },
        priority: 9,
        enabled: true
      },

      // Investment Analysis
      {
        rule_name: 'AI-Powered Investment Insights',
        module: 'Investment Analysis',
        description: 'Generate AI-driven investment recommendations daily',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 6 * * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'investment_insights',
          format: 'json',
          data_sources: [
            { table: 'portfolio_holdings', fields: '*', limit: 500 }
          ]
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'Sector Allocation Analysis',
        module: 'Investment Analysis',
        description: 'Analyze sector allocation and suggest rebalancing weekly',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 8 * * 1' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'sector_analysis',
          format: 'pdf',
          data_sources: [
            { table: 'portfolio_holdings', fields: '*', limit: 500 }
          ]
        },
        priority: 7,
        enabled: true
      },
      {
        rule_name: 'ESG Compliance Monitoring',
        module: 'Investment Analysis',
        description: 'Monitor ESG criteria compliance for all holdings',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 1 * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'ESG Compliance Report',
          message_template: 'ESG review completed for {{portfolio_count}} portfolios'
        },
        priority: 6,
        enabled: true
      },

      // Risk Assessment
      {
        rule_name: 'Dynamic Risk Scoring',
        module: 'Risk Assessment',
        description: 'Update risk scores based on market volatility and holdings',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 */4 * * *' },
        action_type: 'data_sync',
        action_config: {
          source_table: 'portfolio_holdings',
          target_table: 'audit_logs',
          sync_type: 'upsert',
          field_mappings: { id: 'resource_id', asset_type: 'details' }
        },
        priority: 9,
        enabled: true
      },
      {
        rule_name: 'Concentration Risk Alerts',
        module: 'Risk Assessment',
        description: 'Alert when portfolio concentration exceeds safe thresholds',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 * * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Concentration Risk Alert',
          message_template: '{{asset_name}} exceeds {{percentage}}% of portfolio'
        },
        priority: 10,
        enabled: true
      },
      {
        rule_name: 'Market Stress Testing',
        module: 'Risk Assessment',
        description: 'Run stress tests on portfolios weekly',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 7 * * 1' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'stress_test',
          format: 'pdf',
          data_sources: [
            { table: 'portfolio_holdings', fields: '*', limit: 500 }
          ]
        },
        priority: 8,
        enabled: true
      },

      // Scenario Analysis
      {
        rule_name: 'Monte Carlo Simulations',
        module: 'Scenario Analysis',
        description: 'Run Monte Carlo simulations for retirement planning monthly',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 8 1 * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'monte_carlo',
          format: 'pdf',
          data_sources: [
            { table: 'financial_plans', fields: '*', limit: 100 },
            { table: 'portfolio_holdings', fields: '*', limit: 500 }
          ]
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'What-if Scenario Updates',
        module: 'Scenario Analysis',
        description: 'Update scenario projections when market conditions change',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 */6 * * *' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'create_record', step_config: { table: 'audit_logs', data: { action: 'scenario_updated' } } }
          ]
        },
        priority: 7,
        enabled: true
      },

      // Market Data
      {
        rule_name: 'Real-time Market Data Sync',
        module: 'Market Data',
        description: 'Sync market data for watchlist securities every 15 minutes',
        trigger_type: 'schedule',
        trigger_config: { cron: '*/15 * * * *' },
        action_type: 'data_sync',
        action_config: {
          source_table: 'portfolio_holdings',
          target_table: 'audit_logs',
          sync_type: 'insert',
          field_mappings: { id: 'resource_id', symbol: 'details' }
        },
        priority: 9,
        enabled: true
      },
      {
        rule_name: 'Price Alert Notifications',
        module: 'Market Data',
        description: 'Alert when securities reach target prices',
        trigger_type: 'schedule',
        trigger_config: { cron: '*/5 * * * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Price Alert',
          message_template: '{{symbol}} has reached {{price}}'
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'Economic Calendar Updates',
        module: 'Market Data',
        description: 'Alert on important economic events and earnings releases',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 8 * * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'Economic Calendar',
          message_template: 'Important events today: {{events}}'
        },
        priority: 7,
        enabled: true
      },

      // CRM & Client Management
      {
        rule_name: 'Client Review Scheduling',
        module: 'CRM',
        description: 'Auto-schedule annual/quarterly client reviews',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 1 * *' },
        action_type: 'workflow',
        action_config: {
          workflow_steps: [
            { step_type: 'create_record', step_config: { table: 'client_meetings', data: { meeting_type: 'review' } } },
            { step_type: 'send_notification', step_config: { notification_type: 'email', title: 'Review Scheduled', message_template: 'Your review is scheduled for {{date}}' } }
          ]
        },
        priority: 8,
        enabled: true
      },
      {
        rule_name: 'Birthday & Anniversary Recognition',
        module: 'CRM',
        description: 'Send personalized messages on client birthdays and anniversaries',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 * * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'email',
          recipients: [],
          title: 'Happy Birthday!',
          message_template: 'Wishing you a wonderful birthday, {{client_name}}!'
        },
        priority: 5,
        enabled: true
      },
      {
        rule_name: 'Client Satisfaction Surveys',
        module: 'CRM',
        description: 'Send quarterly satisfaction surveys and track NPS',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 10 1 */3 *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'email',
          recipients: [],
          title: 'We Value Your Feedback',
          message_template: 'Please take a moment to share your experience'
        },
        priority: 6,
        enabled: true
      },

      // Compliance
      {
        rule_name: 'Regulatory Compliance Check',
        module: 'Compliance',
        description: 'Daily compliance verification across all portfolios',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 3 * * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'compliance_check',
          format: 'json',
          data_sources: [
            { table: 'portfolio_holdings', fields: '*', limit: 1000 },
            { table: 'clients', fields: '*', limit: 500 }
          ]
        },
        priority: 10,
        enabled: true
      },
      {
        rule_name: 'Trade Blotter Review',
        module: 'Compliance',
        description: 'Generate and review daily trade blotter',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 18 * * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'trade_blotter',
          format: 'pdf',
          data_sources: [
            { table: 'audit_logs', fields: '*', limit: 500 }
          ]
        },
        priority: 9,
        enabled: true
      },
      {
        rule_name: 'AML Transaction Monitoring',
        module: 'Compliance',
        description: 'Monitor transactions for anti-money laundering compliance',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 */6 * * *' },
        action_type: 'notification',
        action_config: {
          notification_type: 'in_app',
          recipients: [],
          title: 'AML Alert',
          message_template: 'Transaction requires review: {{transaction_id}}'
        },
        priority: 10,
        enabled: true
      },

      // Security
      {
        rule_name: 'Client Data Access Audit',
        module: 'Security',
        description: 'Audit all access to sensitive client data',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 2 * * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'access_audit',
          format: 'json',
          data_sources: [
            { table: 'audit_logs', fields: '*', limit: 1000 }
          ]
        },
        priority: 10,
        enabled: true
      },
      {
        rule_name: 'SEC Cybersecurity Compliance',
        module: 'Security',
        description: 'Monthly SEC cybersecurity compliance verification',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 1 * *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'sec_cyber_compliance',
          format: 'pdf',
          data_sources: [
            { table: 'security_policies', fields: '*', limit: 100 },
            { table: 'audit_logs', fields: '*', limit: 500 }
          ]
        },
        priority: 10,
        enabled: true
      },

      // Document Generation
      {
        rule_name: 'Quarterly Client Reports',
        module: 'Document Generator',
        description: 'Auto-generate comprehensive quarterly client reports',
        trigger_type: 'schedule',
        trigger_config: { cron: '0 9 1 */3 *' },
        action_type: 'report_generation',
        action_config: {
          report_type: 'quarterly_client',
          format: 'pdf',
          data_sources: [
            { table: 'portfolio_holdings', fields: '*', limit: 500 },
            { table: 'clients', fields: '*', limit: 200 },
            { table: 'client_goals', fields: '*', limit: 500 }
          ]
        },
        priority: 9,
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
