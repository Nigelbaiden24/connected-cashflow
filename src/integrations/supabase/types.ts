export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_planner_ai_history: {
        Row: {
          context_data: Json | null
          created_at: string
          id: string
          prompt: string
          response: string
          user_id: string | null
        }
        Insert: {
          context_data?: Json | null
          created_at?: string
          id?: string
          prompt: string
          response: string
          user_id?: string | null
        }
        Update: {
          context_data?: Json | null
          created_at?: string
          id?: string
          prompt?: string
          response?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_planner_items: {
        Row: {
          calendar_event_id: string | null
          created_at: string
          crm_contact_id: string | null
          description: string | null
          id: string
          item_name: string
          item_type: string
          outcome_notes: string | null
          priority: string
          status: string
          target_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          calendar_event_id?: string | null
          created_at?: string
          crm_contact_id?: string | null
          description?: string | null
          id?: string
          item_name: string
          item_type: string
          outcome_notes?: string | null
          priority?: string
          status?: string
          target_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          calendar_event_id?: string | null
          created_at?: string
          crm_contact_id?: string | null
          description?: string | null
          id?: string
          item_name?: string
          item_type?: string
          outcome_notes?: string | null
          priority?: string
          status?: string
          target_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_planner_items_crm_contact_id_fkey"
            columns: ["crm_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_planner_notes: {
        Row: {
          created_at: string
          id: string
          note_text: string
          planner_item_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          note_text: string
          planner_item_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          note_text?: string
          planner_item_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_planner_notes_planner_item_id_fkey"
            columns: ["planner_item_id"]
            isOneToOne: false
            referencedRelation: "admin_planner_items"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_productivity_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_target_updates: {
        Row: {
          created_at: string
          id: string
          new_value: number | null
          previous_value: number | null
          target_id: string
          update_text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          new_value?: number | null
          previous_value?: number | null
          target_id: string
          update_text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          new_value?: number | null
          previous_value?: number | null
          target_id?: string
          update_text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_target_updates_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "admin_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_targets: {
        Row: {
          category: string | null
          created_at: string
          current_value: number | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          target_type: string
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          target_type?: string
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          target_type?: string
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_time_block_schedules: {
        Row: {
          block_date: string
          block_type: string
          created_at: string
          custom_label: string | null
          end_hour: number
          id: string
          is_completed: boolean | null
          notes: string | null
          start_hour: number
          task_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          block_date: string
          block_type?: string
          created_at?: string
          custom_label?: string | null
          end_hour: number
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          start_hour: number
          task_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          block_date?: string
          block_type?: string
          created_at?: string
          custom_label?: string | null
          end_hour?: number
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          start_hour?: number
          task_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_time_block_schedules_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "admin_planner_items"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_time_daily: {
        Row: {
          created_at: string
          date: string
          id: string
          session_count: number
          total_seconds: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          session_count?: number
          total_seconds?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          session_count?: number
          total_seconds?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_time_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          end_time: string | null
          id: string
          is_active: boolean | null
          session_date: string
          start_time: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          session_date?: string
          start_time?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          session_date?: string
          start_time?: string
          user_id?: string | null
        }
        Relationships: []
      }
      advisor_activity: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      advisor_alerts: {
        Row: {
          action_url: string | null
          alert_type: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          severity: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          alert_type: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          alert_type?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      advisor_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          goal_type: string
          id: string
          period_end: string
          period_start: string
          status: string | null
          target_value: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          goal_type: string
          id?: string
          period_end: string
          period_start: string
          status?: string | null
          target_value: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          goal_type?: string
          id?: string
          period_end?: string
          period_start?: string
          status?: string | null
          target_value?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      advisor_tasks: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          task_type: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          task_type: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          task_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advisor_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      advisory_revenues: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          period_end: string
          period_start: string
          revenue_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          period_end: string
          period_start: string
          revenue_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          period_end?: string
          period_start?: string
          revenue_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advisory_revenues_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_research_reports: {
        Row: {
          asset_id: string
          asset_name: string
          asset_symbol: string | null
          asset_type: string
          confidence_level: string | null
          created_at: string
          data_as_of: string | null
          data_sources: string[] | null
          esg_analysis: Json | null
          esg_score: number | null
          fundamental_analysis: Json | null
          generated_at: string | null
          governance_analysis: Json | null
          id: string
          last_significant_change: string | null
          material_changes: string[] | null
          model_governance: Json | null
          overall_quality_score: number | null
          performance_analysis: Json | null
          portfolio_role: Json | null
          previous_version_id: string | null
          quality_analysis: Json | null
          risk_analysis: Json | null
          risk_score: number | null
          scenario_analysis: Json | null
          updated_at: string
          valuation_analysis: Json | null
          valuation_score: number | null
          version: number | null
        }
        Insert: {
          asset_id: string
          asset_name: string
          asset_symbol?: string | null
          asset_type: string
          confidence_level?: string | null
          created_at?: string
          data_as_of?: string | null
          data_sources?: string[] | null
          esg_analysis?: Json | null
          esg_score?: number | null
          fundamental_analysis?: Json | null
          generated_at?: string | null
          governance_analysis?: Json | null
          id?: string
          last_significant_change?: string | null
          material_changes?: string[] | null
          model_governance?: Json | null
          overall_quality_score?: number | null
          performance_analysis?: Json | null
          portfolio_role?: Json | null
          previous_version_id?: string | null
          quality_analysis?: Json | null
          risk_analysis?: Json | null
          risk_score?: number | null
          scenario_analysis?: Json | null
          updated_at?: string
          valuation_analysis?: Json | null
          valuation_score?: number | null
          version?: number | null
        }
        Update: {
          asset_id?: string
          asset_name?: string
          asset_symbol?: string | null
          asset_type?: string
          confidence_level?: string | null
          created_at?: string
          data_as_of?: string | null
          data_sources?: string[] | null
          esg_analysis?: Json | null
          esg_score?: number | null
          fundamental_analysis?: Json | null
          generated_at?: string | null
          governance_analysis?: Json | null
          id?: string
          last_significant_change?: string | null
          material_changes?: string[] | null
          model_governance?: Json | null
          overall_quality_score?: number | null
          performance_analysis?: Json | null
          portfolio_role?: Json | null
          previous_version_id?: string | null
          quality_analysis?: Json | null
          risk_analysis?: Json | null
          risk_score?: number | null
          scenario_analysis?: Json | null
          updated_at?: string
          valuation_analysis?: Json | null
          valuation_score?: number | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_research_reports_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "asset_research_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          severity: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          severity?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          severity?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_dependencies: {
        Row: {
          condition_config: Json | null
          created_at: string
          dependency_type: string | null
          depends_on_rule_id: string
          id: string
          rule_id: string
        }
        Insert: {
          condition_config?: Json | null
          created_at?: string
          dependency_type?: string | null
          depends_on_rule_id: string
          id?: string
          rule_id: string
        }
        Update: {
          condition_config?: Json | null
          created_at?: string
          dependency_type?: string | null
          depends_on_rule_id?: string
          id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_dependencies_depends_on_rule_id_fkey"
            columns: ["depends_on_rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_dependencies_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          error_stack: string | null
          execution_time_ms: number | null
          id: string
          result_data: Json | null
          rule_id: string
          started_at: string | null
          status: string
          trigger_data: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          error_stack?: string | null
          execution_time_ms?: number | null
          id?: string
          result_data?: Json | null
          rule_id: string
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          error_stack?: string | null
          execution_time_ms?: number | null
          id?: string
          result_data?: Json | null
          rule_id?: string
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          created_at: string
          execution_id: string | null
          id: string
          log_level: string
          message: string
          metadata: Json | null
          rule_id: string | null
        }
        Insert: {
          created_at?: string
          execution_id?: string | null
          id?: string
          log_level: string
          message: string
          metadata?: Json | null
          rule_id?: string | null
        }
        Update: {
          created_at?: string
          execution_id?: string | null
          id?: string
          log_level?: string
          message?: string
          metadata?: Json | null
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "automation_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_notifications: {
        Row: {
          created_at: string
          execution_id: string | null
          id: string
          message: string
          notification_type: string
          read_at: string | null
          sent_at: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          execution_id?: string | null
          id?: string
          message: string
          notification_type: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          execution_id?: string | null
          id?: string
          message?: string
          notification_type?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_notifications_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "automation_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean | null
          id: string
          module: string
          priority: number | null
          rule_name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          module: string
          priority?: number | null
          rule_name: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          module?: string
          priority?: number | null
          rule_name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      automation_schedules: {
        Row: {
          created_at: string
          cron_expression: string
          enabled: boolean | null
          id: string
          last_run_at: string | null
          next_run_at: string | null
          rule_id: string
          timezone: string | null
        }
        Insert: {
          created_at?: string
          cron_expression: string
          enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          rule_id: string
          timezone?: string | null
        }
        Update: {
          created_at?: string
          cron_expression?: string
          enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          rule_id?: string
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_schedules_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_triggers: {
        Row: {
          condition_query: Json | null
          created_at: string
          event_source: string
          event_type: string
          id: string
          rule_id: string
        }
        Insert: {
          condition_query?: Json | null
          created_at?: string
          event_source: string
          event_type: string
          id?: string
          rule_id: string
        }
        Update: {
          condition_query?: Json | null
          created_at?: string
          event_source?: string
          event_type?: string
          id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_triggers_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      benefits: {
        Row: {
          benefit_type: string
          coverage_end_date: string | null
          coverage_start_date: string | null
          created_at: string
          employee_contribution: number | null
          employee_id: string
          employer_contribution: number | null
          id: string
          plan_name: string | null
          provider: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          benefit_type: string
          coverage_end_date?: string | null
          coverage_start_date?: string | null
          created_at?: string
          employee_contribution?: number | null
          employee_id: string
          employer_contribution?: number | null
          id?: string
          plan_name?: string | null
          provider?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          benefit_type?: string
          coverage_end_date?: string | null
          coverage_start_date?: string | null
          created_at?: string
          employee_contribution?: number | null
          employee_id?: string
          employer_contribution?: number | null
          id?: string
          plan_name?: string | null
          provider?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "benefits_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      business_activity_feed: {
        Row: {
          activity_type: string
          actor_id: string | null
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          actor_id?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          actor_id?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      business_dashboard_preferences: {
        Row: {
          created_at: string | null
          id: string
          theme_config: Json | null
          updated_at: string | null
          user_id: string
          widget_config: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          theme_config?: Json | null
          updated_at?: string | null
          user_id: string
          widget_config?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          theme_config?: Json | null
          updated_at?: string | null
          user_id?: string
          widget_config?: Json | null
        }
        Relationships: []
      }
      business_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string | null
          file_path: string | null
          file_size: number | null
          id: string
          project_id: string | null
          requires_signature: boolean | null
          signed_at: string | null
          status: string | null
          updated_at: string | null
          uploaded_by: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          project_id?: string | null
          requires_signature?: boolean | null
          signed_at?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          project_id?: string | null
          requires_signature?: boolean | null
          signed_at?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "business_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string | null
          notification_type: string
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_type: string
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_type?: string
          severity?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      business_projects: {
        Row: {
          actual_cost: number | null
          assigned_team_members: string[] | null
          budget: number | null
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          health_status: string | null
          id: string
          priority: string | null
          project_name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_team_members?: string[] | null
          budget?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          health_status?: string | null
          id?: string
          priority?: string | null
          project_name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_team_members?: string[] | null
          budget?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          health_status?: string | null
          id?: string
          priority?: string | null
          project_name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          priority: string | null
          project_id: string | null
          sla_target_hours: number | null
          status: string | null
          tags: string[] | null
          task_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          project_id?: string | null
          sla_target_hours?: number | null
          status?: string | null
          tags?: string[] | null
          task_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          project_id?: string | null
          sla_target_hours?: number | null
          status?: string | null
          tags?: string[] | null
          task_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "business_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_time_tracking: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          project_id: string | null
          start_time: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          project_id?: string | null
          start_time: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          project_id?: string | null
          start_time?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_time_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "business_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_time_tracking_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "business_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      business_workflows: {
        Row: {
          action_config: Json | null
          created_at: string | null
          description: string | null
          execution_count: number | null
          failure_count: number | null
          id: string
          last_run_at: string | null
          status: string | null
          success_count: number | null
          time_saved_minutes: number | null
          trigger_config: Json | null
          trigger_type: string | null
          updated_at: string | null
          user_id: string | null
          workflow_name: string
        }
        Insert: {
          action_config?: Json | null
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          failure_count?: number | null
          id?: string
          last_run_at?: string | null
          status?: string | null
          success_count?: number | null
          time_saved_minutes?: number | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          workflow_name: string
        }
        Update: {
          action_config?: Json | null
          created_at?: string | null
          description?: string | null
          execution_count?: number | null
          failure_count?: number | null
          id?: string
          last_run_at?: string | null
          status?: string | null
          success_count?: number | null
          time_saved_minutes?: number | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          workflow_name?: string
        }
        Relationships: []
      }
      calendar_connections: {
        Row: {
          access_token: string
          connected_at: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          provider: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          connected_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          provider: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          connected_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          provider?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      candidates: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          cover_letter: string | null
          created_at: string
          current_employer: string | null
          current_job_title: string | null
          cv_file_path: string | null
          date_of_birth: string
          desired_salary_max: number | null
          desired_salary_min: number | null
          email: string
          employment_history: Json | null
          first_name: string
          id: string
          last_name: string
          linkedin_url: string | null
          nationality: string
          ni_number: string | null
          notice_period: string | null
          passport_number: string | null
          phone: string
          postcode: string
          qualifications: Json | null
          reference_contacts: Json | null
          right_to_work_uk: boolean | null
          skills: string[] | null
          status: string | null
          updated_at: string
          user_id: string | null
          visa_status: string | null
          years_experience: number | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          cover_letter?: string | null
          created_at?: string
          current_employer?: string | null
          current_job_title?: string | null
          cv_file_path?: string | null
          date_of_birth: string
          desired_salary_max?: number | null
          desired_salary_min?: number | null
          email: string
          employment_history?: Json | null
          first_name: string
          id?: string
          last_name: string
          linkedin_url?: string | null
          nationality: string
          ni_number?: string | null
          notice_period?: string | null
          passport_number?: string | null
          phone: string
          postcode: string
          qualifications?: Json | null
          reference_contacts?: Json | null
          right_to_work_uk?: boolean | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          visa_status?: string | null
          years_experience?: number | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          cover_letter?: string | null
          created_at?: string
          current_employer?: string | null
          current_job_title?: string | null
          cv_file_path?: string | null
          date_of_birth?: string
          desired_salary_max?: number | null
          desired_salary_min?: number | null
          email?: string
          employment_history?: Json | null
          first_name?: string
          id?: string
          last_name?: string
          linkedin_url?: string | null
          nationality?: string
          ni_number?: string | null
          notice_period?: string | null
          passport_number?: string | null
          phone?: string
          postcode?: string
          qualifications?: Json | null
          reference_contacts?: Json | null
          right_to_work_uk?: boolean | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          visa_status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          category: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          type: string
        }
        Insert: {
          category?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          type: string
        }
        Update: {
          category?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_compliance_documents: {
        Row: {
          client_id: string | null
          created_at: string | null
          document_name: string
          document_type: string
          expiry_date: string | null
          file_path: string | null
          id: string
          notes: string | null
          signed_date: string | null
          status: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          signed_date?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          signed_date?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_compliance_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string
          document_name: string
          document_type: string
          expiry_date: string | null
          file_path: string | null
          id: string
          notes: string | null
          upload_date: string
        }
        Insert: {
          client_id: string
          created_at?: string
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          upload_date?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_goals: {
        Row: {
          client_id: string
          created_at: string
          current_amount: number | null
          goal_name: string
          goal_type: string
          id: string
          monthly_contribution: number | null
          notes: string | null
          priority: string | null
          status: string | null
          target_amount: number | null
          target_date: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          current_amount?: number | null
          goal_name: string
          goal_type: string
          id?: string
          monthly_contribution?: number | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          target_amount?: number | null
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          current_amount?: number | null
          goal_name?: string
          goal_type?: string
          id?: string
          monthly_contribution?: number | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          target_amount?: number | null
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_meetings: {
        Row: {
          action_items: string[] | null
          agenda: string[] | null
          client_id: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          location: string | null
          meeting_date: string
          meeting_type: string
          next_meeting_date: string | null
          notes: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action_items?: string[] | null
          agenda?: string[] | null
          client_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_type: string
          next_meeting_date?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action_items?: string[] | null
          agenda?: string[] | null
          client_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_type?: string
          next_meeting_date?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_pipeline: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          stage: string
          stage_date: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          stage: string
          stage_date?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          stage?: string
          stage_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_pipeline_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_risk_assessments: {
        Row: {
          assessment_date: string | null
          client_id: string | null
          created_at: string | null
          factors: Json | null
          id: string
          notes: string | null
          risk_level: string
          risk_score: number
          updated_at: string | null
        }
        Insert: {
          assessment_date?: string | null
          client_id?: string | null
          created_at?: string | null
          factors?: Json | null
          id?: string
          notes?: string | null
          risk_level: string
          risk_score: number
          updated_at?: string | null
        }
        Update: {
          assessment_date?: string | null
          client_id?: string | null
          created_at?: string | null
          factors?: Json | null
          id?: string
          notes?: string | null
          risk_level?: string
          risk_score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_risk_assessments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          annual_income: number | null
          aum: number | null
          client_id: string
          created_at: string
          date_of_birth: string | null
          email: string
          id: string
          investment_experience: string | null
          investment_objectives: string[] | null
          last_contact_date: string | null
          liquidity_needs: string | null
          name: string
          net_worth: number | null
          notes: string | null
          occupation: string | null
          phone: string | null
          risk_profile: string | null
          status: string | null
          time_horizon: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          annual_income?: number | null
          aum?: number | null
          client_id: string
          created_at?: string
          date_of_birth?: string | null
          email: string
          id?: string
          investment_experience?: string | null
          investment_objectives?: string[] | null
          last_contact_date?: string | null
          liquidity_needs?: string | null
          name: string
          net_worth?: number | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          risk_profile?: string | null
          status?: string | null
          time_horizon?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          annual_income?: number | null
          aum?: number | null
          client_id?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string
          id?: string
          investment_experience?: string | null
          investment_objectives?: string[] | null
          last_contact_date?: string | null
          liquidity_needs?: string | null
          name?: string
          net_worth?: number | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          risk_profile?: string | null
          status?: string | null
          time_horizon?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      companies_house_scrapes: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          search_query: string
          search_type: string
          status: string
          total_pages_scraped: number | null
          total_records_found: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          search_query: string
          search_type: string
          status?: string
          total_pages_scraped?: number | null
          total_records_found?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          search_query?: string
          search_type?: string
          status?: string
          total_pages_scraped?: number | null
          total_records_found?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      compliance_audit_trail: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      compliance_case_comments: {
        Row: {
          case_id: string | null
          comment: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          case_id?: string | null
          comment: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          case_id?: string | null
          comment?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_case_comments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "compliance_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_cases: {
        Row: {
          ai_suggestions: Json | null
          assigned_to: string | null
          case_number: string
          check_id: string | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          rule_id: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_suggestions?: Json | null
          assigned_to?: string | null
          case_number: string
          check_id?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          rule_id?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_suggestions?: Json | null
          assigned_to?: string | null
          case_number?: string
          check_id?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          rule_id?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_cases_check_id_fkey"
            columns: ["check_id"]
            isOneToOne: false
            referencedRelation: "compliance_checks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_cases_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "compliance_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks: {
        Row: {
          check_date: string | null
          checked_by: string | null
          client_id: string | null
          created_at: string | null
          findings: Json | null
          id: string
          metadata: Json | null
          risk_score: number | null
          rule_id: string | null
          status: string
        }
        Insert: {
          check_date?: string | null
          checked_by?: string | null
          client_id?: string | null
          created_at?: string | null
          findings?: Json | null
          id?: string
          metadata?: Json | null
          risk_score?: number | null
          rule_id?: string | null
          status: string
        }
        Update: {
          check_date?: string | null
          checked_by?: string | null
          client_id?: string | null
          created_at?: string | null
          findings?: Json | null
          id?: string
          metadata?: Json | null
          risk_score?: number | null
          rule_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_checks_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "compliance_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          employee_id: string | null
          expiry_date: string | null
          file_path: string | null
          id: string
          notes: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          employee_id?: string | null
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          employee_id?: string | null
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_rules: {
        Row: {
          auto_check: boolean | null
          check_frequency: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          enabled: boolean | null
          id: string
          rule_config: Json | null
          rule_name: string
          rule_type: string
          severity: string
          threshold_config: Json | null
          updated_at: string | null
        }
        Insert: {
          auto_check?: boolean | null
          check_frequency?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          rule_config?: Json | null
          rule_name: string
          rule_type: string
          severity?: string
          threshold_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          auto_check?: boolean | null
          check_frequency?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          rule_config?: Json | null
          rule_name?: string
          rule_type?: string
          severity?: string
          threshold_config?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          source_page: string | null
          status: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          source_page?: string | null
          status?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          source_page?: string | null
          status?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_boards: {
        Row: {
          column_configs: Json | null
          columns: Json
          created_at: string
          display_order: number | null
          id: string
          is_collapsed: boolean | null
          name: string
          rows: Json
          updated_at: string
          user_id: string
          view_mode: string | null
        }
        Insert: {
          column_configs?: Json | null
          columns?: Json
          created_at?: string
          display_order?: number | null
          id?: string
          is_collapsed?: boolean | null
          name: string
          rows?: Json
          updated_at?: string
          user_id: string
          view_mode?: string | null
        }
        Update: {
          column_configs?: Json | null
          columns?: Json
          created_at?: string
          display_order?: number | null
          id?: string
          is_collapsed?: boolean | null
          name?: string
          rows?: Json
          updated_at?: string
          user_id?: string
          view_mode?: string | null
        }
        Relationships: []
      }
      crm_contact_data: {
        Row: {
          column_id: string
          contact_id: string
          created_at: string
          id: string
          updated_at: string
          value: string | null
        }
        Insert: {
          column_id: string
          contact_id: string
          created_at?: string
          id?: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          column_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contact_data_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "crm_custom_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contact_data_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          ai_recommendations: Json | null
          company: string | null
          conversion_probability: number | null
          created_at: string
          email: string | null
          engagement_score: number | null
          id: string
          last_ai_analysis: string | null
          lead_score: number | null
          lead_score_factors: Json | null
          name: string
          next_best_action: string | null
          notes: string | null
          phone: string | null
          position: string | null
          priority: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          upsell_opportunities: Json | null
          user_id: string | null
        }
        Insert: {
          ai_recommendations?: Json | null
          company?: string | null
          conversion_probability?: number | null
          created_at?: string
          email?: string | null
          engagement_score?: number | null
          id?: string
          last_ai_analysis?: string | null
          lead_score?: number | null
          lead_score_factors?: Json | null
          name: string
          next_best_action?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          upsell_opportunities?: Json | null
          user_id?: string | null
        }
        Update: {
          ai_recommendations?: Json | null
          company?: string | null
          conversion_probability?: number | null
          created_at?: string
          email?: string | null
          engagement_score?: number | null
          id?: string
          last_ai_analysis?: string | null
          lead_score?: number | null
          lead_score_factors?: Json | null
          name?: string
          next_best_action?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          upsell_opportunities?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      crm_custom_columns: {
        Row: {
          column_name: string
          column_options: Json | null
          column_order: number | null
          column_type: string
          created_at: string
          id: string
          is_required: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          column_name: string
          column_options?: Json | null
          column_order?: number | null
          column_type: string
          created_at?: string
          id?: string
          is_required?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          column_name?: string
          column_options?: Json | null
          column_order?: number | null
          column_type?: string
          created_at?: string
          id?: string
          is_required?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crm_follow_ups: {
        Row: {
          contact_id: string
          created_at: string
          follow_up_date: string
          id: string
          interaction_id: string | null
          notes: string | null
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          follow_up_date: string
          id?: string
          interaction_id?: string | null
          notes?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          follow_up_date?: string
          id?: string
          interaction_id?: string | null
          notes?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_follow_ups_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_follow_ups_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "crm_interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interactions: {
        Row: {
          contact_id: string
          created_at: string
          description: string | null
          id: string
          interaction_date: string
          interaction_type: string
          outcome: string | null
          subject: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          description?: string | null
          id?: string
          interaction_date?: string
          interaction_type: string
          outcome?: string | null
          subject?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          description?: string | null
          id?: string
          interaction_date?: string
          interaction_type?: string
          outcome?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notifications: {
        Row: {
          action_url: string | null
          contact_id: string | null
          created_at: string
          follow_up_id: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          contact_id?: string | null
          created_at?: string
          follow_up_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          contact_id?: string | null
          created_at?: string
          follow_up_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notifications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notifications_follow_up_id_fkey"
            columns: ["follow_up_id"]
            isOneToOne: false
            referencedRelation: "crm_follow_ups"
            referencedColumns: ["id"]
          },
        ]
      }
      cyber_risk_assessments: {
        Row: {
          assessment_name: string
          assigned_to: string | null
          category: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          impact_score: number | null
          likelihood_score: number | null
          mitigation_status: string | null
          risk_level: string | null
          updated_at: string
        }
        Insert: {
          assessment_name: string
          assigned_to?: string | null
          category: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          impact_score?: number | null
          likelihood_score?: number | null
          mitigation_status?: string | null
          risk_level?: string | null
          updated_at?: string
        }
        Update: {
          assessment_name?: string
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          impact_score?: number | null
          likelihood_score?: number | null
          mitigation_status?: string | null
          risk_level?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          account_number_encrypted: string | null
          address: string | null
          bank_name: string | null
          city: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          department: string | null
          email: string
          employee_id: string
          employment_type: string | null
          first_name: string
          hire_date: string
          id: string
          last_name: string
          pay_frequency: string | null
          pay_rate: number
          phone: string | null
          position: string | null
          routing_number_encrypted: string | null
          ssn_encrypted: string | null
          state: string | null
          status: string | null
          termination_date: string | null
          updated_at: string
          user_id: string | null
          zip: string | null
        }
        Insert: {
          account_number_encrypted?: string | null
          address?: string | null
          bank_name?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          department?: string | null
          email: string
          employee_id: string
          employment_type?: string | null
          first_name: string
          hire_date: string
          id?: string
          last_name: string
          pay_frequency?: string | null
          pay_rate: number
          phone?: string | null
          position?: string | null
          routing_number_encrypted?: string | null
          ssn_encrypted?: string | null
          state?: string | null
          status?: string | null
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
          zip?: string | null
        }
        Update: {
          account_number_encrypted?: string | null
          address?: string | null
          bank_name?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string
          employee_id?: string
          employment_type?: string | null
          first_name?: string
          hire_date?: string
          id?: string
          last_name?: string
          pay_frequency?: string | null
          pay_rate?: number
          phone?: string | null
          position?: string | null
          routing_number_encrypted?: string | null
          ssn_encrypted?: string | null
          state?: string | null
          status?: string | null
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          annual_amount: number
          category_name: string
          created_at: string
          frequency: string | null
          id: string
          inflation_adjusted: boolean | null
          is_essential: boolean | null
          notes: string | null
          plan_id: string
          updated_at: string
        }
        Insert: {
          annual_amount: number
          category_name: string
          created_at?: string
          frequency?: string | null
          id?: string
          inflation_adjusted?: boolean | null
          is_essential?: boolean | null
          notes?: string | null
          plan_id: string
          updated_at?: string
        }
        Update: {
          annual_amount?: number
          category_name?: string
          created_at?: string
          frequency?: string | null
          id?: string
          inflation_adjusted?: boolean | null
          is_essential?: boolean | null
          notes?: string | null
          plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_analyst_picks: {
        Row: {
          analyst_rating: string | null
          asset_id: string
          asset_name: string
          asset_symbol: string | null
          asset_type: string
          conviction_score: number | null
          created_at: string
          created_by: string | null
          current_price: number | null
          display_order: number | null
          id: string
          investment_thesis: string | null
          is_active: boolean | null
          key_catalysts: string[] | null
          market_cap: string | null
          price_target: number | null
          risk_factors: string[] | null
          sector: string | null
          time_horizon: string | null
          updated_at: string
          upside_potential: number | null
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          analyst_rating?: string | null
          asset_id: string
          asset_name: string
          asset_symbol?: string | null
          asset_type: string
          conviction_score?: number | null
          created_at?: string
          created_by?: string | null
          current_price?: number | null
          display_order?: number | null
          id?: string
          investment_thesis?: string | null
          is_active?: boolean | null
          key_catalysts?: string[] | null
          market_cap?: string | null
          price_target?: number | null
          risk_factors?: string[] | null
          sector?: string | null
          time_horizon?: string | null
          updated_at?: string
          upside_potential?: number | null
          week_end_date: string
          week_start_date: string
        }
        Update: {
          analyst_rating?: string | null
          asset_id?: string
          asset_name?: string
          asset_symbol?: string | null
          asset_type?: string
          conviction_score?: number | null
          created_at?: string
          created_by?: string | null
          current_price?: number | null
          display_order?: number | null
          id?: string
          investment_thesis?: string | null
          is_active?: boolean | null
          key_catalysts?: string[] | null
          market_cap?: string | null
          price_target?: number | null
          risk_factors?: string[] | null
          sector?: string | null
          time_horizon?: string | null
          updated_at?: string
          upside_potential?: number | null
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: []
      }
      financial_plan_sections: {
        Row: {
          created_at: string
          id: string
          plan_id: string
          section_data: Json
          section_name: string
          section_order: number | null
          section_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id: string
          section_data?: Json
          section_name: string
          section_order?: number | null
          section_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string
          section_data?: Json
          section_name?: string
          section_order?: number | null
          section_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_plan_sections_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_plans: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          current_net_worth: number | null
          end_date: string | null
          id: string
          notes: string | null
          plan_name: string
          plan_type: string
          primary_objectives: string[] | null
          risk_tolerance: string | null
          start_date: string
          status: string | null
          target_net_worth: number | null
          time_horizon: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          current_net_worth?: number | null
          end_date?: string | null
          id?: string
          notes?: string | null
          plan_name: string
          plan_type: string
          primary_objectives?: string[] | null
          risk_tolerance?: string | null
          start_date: string
          status?: string | null
          target_net_worth?: number | null
          time_horizon?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          current_net_worth?: number | null
          end_date?: string | null
          id?: string
          notes?: string | null
          plan_name?: string
          plan_type?: string
          primary_objectives?: string[] | null
          risk_tolerance?: string | null
          start_date?: string
          status?: string | null
          target_net_worth?: number | null
          time_horizon?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      fund_analyst_activity: {
        Row: {
          analyst_rating: string | null
          asset_class: string | null
          aum: number | null
          created_at: string | null
          created_by: string | null
          five_year_return: number | null
          fund_name: string
          fund_type: string | null
          id: string
          investment_thesis: string | null
          is_featured: boolean | null
          isin: string
          key_watchpoints: string | null
          last_updated_by: string | null
          ocf: number | null
          one_year_return: number | null
          overall_score: number | null
          provider: string | null
          rating_rationale: string | null
          risks: string | null
          score_cost: number | null
          score_esg: number | null
          score_fundamentals: number | null
          score_performance: number | null
          score_risk: number | null
          status: string | null
          strengths: string | null
          suitable_investor_type: string | null
          three_year_return: number | null
          updated_at: string | null
        }
        Insert: {
          analyst_rating?: string | null
          asset_class?: string | null
          aum?: number | null
          created_at?: string | null
          created_by?: string | null
          five_year_return?: number | null
          fund_name: string
          fund_type?: string | null
          id?: string
          investment_thesis?: string | null
          is_featured?: boolean | null
          isin: string
          key_watchpoints?: string | null
          last_updated_by?: string | null
          ocf?: number | null
          one_year_return?: number | null
          overall_score?: number | null
          provider?: string | null
          rating_rationale?: string | null
          risks?: string | null
          score_cost?: number | null
          score_esg?: number | null
          score_fundamentals?: number | null
          score_performance?: number | null
          score_risk?: number | null
          status?: string | null
          strengths?: string | null
          suitable_investor_type?: string | null
          three_year_return?: number | null
          updated_at?: string | null
        }
        Update: {
          analyst_rating?: string | null
          asset_class?: string | null
          aum?: number | null
          created_at?: string | null
          created_by?: string | null
          five_year_return?: number | null
          fund_name?: string
          fund_type?: string | null
          id?: string
          investment_thesis?: string | null
          is_featured?: boolean | null
          isin?: string
          key_watchpoints?: string | null
          last_updated_by?: string | null
          ocf?: number | null
          one_year_return?: number | null
          overall_score?: number | null
          provider?: string | null
          rating_rationale?: string | null
          risks?: string | null
          score_cost?: number | null
          score_esg?: number | null
          score_fundamentals?: number | null
          score_performance?: number | null
          score_risk?: number | null
          status?: string | null
          strengths?: string | null
          suitable_investor_type?: string | null
          three_year_return?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      income_sources: {
        Row: {
          annual_amount: number
          created_at: string
          end_date: string | null
          growth_rate: number | null
          id: string
          notes: string | null
          plan_id: string
          source_name: string
          source_type: string
          start_date: string | null
          tax_treatment: string | null
          updated_at: string
        }
        Insert: {
          annual_amount: number
          created_at?: string
          end_date?: string | null
          growth_rate?: number | null
          id?: string
          notes?: string | null
          plan_id: string
          source_name: string
          source_type: string
          start_date?: string | null
          tax_treatment?: string | null
          updated_at?: string
        }
        Update: {
          annual_amount?: number
          created_at?: string
          end_date?: string | null
          growth_rate?: number | null
          id?: string
          notes?: string | null
          plan_id?: string
          source_name?: string
          source_type?: string
          start_date?: string | null
          tax_treatment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_sources_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_watchlists: {
        Row: {
          category: string | null
          created_at: string | null
          created_by_admin: boolean | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          platform: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by_admin?: boolean | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          platform?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by_admin?: boolean | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          platform?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      investor_alert_notifications: {
        Row: {
          alert_id: string
          delivered_at: string | null
          delivery_method: string
          id: string
          is_read: boolean | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          alert_id: string
          delivered_at?: string | null
          delivery_method: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          alert_id?: string
          delivered_at?: string | null
          delivery_method?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_alert_notifications_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "investor_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_alert_preferences: {
        Row: {
          alert_type: string
          created_at: string | null
          email_enabled: boolean | null
          id: string
          phone_number: string | null
          platform_enabled: boolean | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          phone_number?: string | null
          platform_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          phone_number?: string | null
          platform_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investor_alerts: {
        Row: {
          alert_data: Json | null
          alert_type: string
          company: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          published_date: string | null
          severity: string | null
          ticker: string | null
          title: string
        }
        Insert: {
          alert_data?: Json | null
          alert_type: string
          company?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          published_date?: string | null
          severity?: string | null
          ticker?: string | null
          title: string
        }
        Update: {
          alert_data?: Json | null
          alert_type?: string
          company?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          published_date?: string | null
          severity?: string | null
          ticker?: string | null
          title?: string
        }
        Relationships: []
      }
      investor_videos: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          file_path: string
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          file_path: string
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          file_path?: string
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          candidate_email: string
          candidate_name: string
          candidate_phone: string | null
          cover_letter: string | null
          created_at: string | null
          id: string
          job_id: string | null
          resume_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_email: string
          candidate_name: string
          candidate_phone?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_email?: string
          candidate_name?: string
          candidate_phone?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          location: string
          requirements: string | null
          salary: string
          sector: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          requirements?: string | null
          salary: string
          sector: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          requirements?: string | null
          salary?: string
          sector?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      learning_content: {
        Row: {
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          duration: string | null
          file_path: string | null
          id: string
          is_published: boolean | null
          key_metrics: string[] | null
          major_players: string[] | null
          metadata: Json | null
          mitigation: string | null
          severity: string | null
          subcategory: string | null
          thumbnail_url: string | null
          title: string
          topics: string[] | null
          updated_at: string | null
          uploaded_by: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration?: string | null
          file_path?: string | null
          id?: string
          is_published?: boolean | null
          key_metrics?: string[] | null
          major_players?: string[] | null
          metadata?: Json | null
          mitigation?: string | null
          severity?: string | null
          subcategory?: string | null
          thumbnail_url?: string | null
          title: string
          topics?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration?: string | null
          file_path?: string | null
          id?: string
          is_published?: boolean | null
          key_metrics?: string[] | null
          major_players?: string[] | null
          metadata?: Json | null
          mitigation?: string | null
          severity?: string | null
          subcategory?: string | null
          thumbnail_url?: string | null
          title?: string
          topics?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          content_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          progress_percentage: number | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          content_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          content_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
        ]
      }
      market_commentary: {
        Row: {
          created_at: string | null
          description: string | null
          file_path: string
          id: string
          published_date: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_path: string
          id?: string
          published_date?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_path?: string
          id?: string
          published_date?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      market_trends: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          impact: string
          is_published: boolean | null
          timeframe: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          impact: string
          is_published?: boolean | null
          timeframe: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          impact?: string
          is_published?: boolean | null
          timeframe?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          category: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          type: string
        }
        Insert: {
          category?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          type: string
        }
        Update: {
          category?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          mfa_enabled: boolean | null
          mfa_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      model_portfolios: {
        Row: {
          created_at: string | null
          description: string | null
          file_path: string
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_path: string
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_path?: string
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          category: string
          content: string
          created_at: string | null
          edition: string | null
          file_path: string | null
          id: string
          preview: string | null
          published_date: string | null
          read_time: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          edition?: string | null
          file_path?: string | null
          id?: string
          preview?: string | null
          published_date?: string | null
          read_time?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          edition?: string | null
          file_path?: string | null
          id?: string
          preview?: string | null
          published_date?: string | null
          read_time?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          business_description: string | null
          business_highlights: string[] | null
          created_at: string
          financial_summary: string | null
          id: string
          image_url: string | null
          industry: string
          industry_overview: string | null
          location: string
          ref_number: string
          short_description: string
          status: string | null
          team_overview: string | null
          title: string
          updated_at: string
        }
        Insert: {
          business_description?: string | null
          business_highlights?: string[] | null
          created_at?: string
          financial_summary?: string | null
          id?: string
          image_url?: string | null
          industry: string
          industry_overview?: string | null
          location: string
          ref_number: string
          short_description: string
          status?: string | null
          team_overview?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          business_description?: string | null
          business_highlights?: string[] | null
          created_at?: string
          financial_summary?: string | null
          id?: string
          image_url?: string | null
          industry?: string
          industry_overview?: string | null
          location?: string
          ref_number?: string
          short_description?: string
          status?: string | null
          team_overview?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      opportunity_inquiries: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          opportunity_id: string
          phone: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          opportunity_id: string
          phone?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          opportunity_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_inquiries_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_products: {
        Row: {
          age_condition_commentary: string | null
          age_condition_score: number | null
          analyst_rating: string | null
          annual_revenue: number | null
          authenticity_verified: boolean | null
          bathrooms: number | null
          bedrooms: number | null
          business_stage: string | null
          category: string
          complexity_commentary: string | null
          complexity_score: number | null
          condition: string | null
          country: string | null
          created_at: string
          employee_count: number | null
          estimated_appreciation: number | null
          featured: boolean | null
          founding_year: number | null
          full_description: string | null
          gallery_images: string[] | null
          geographic_regulatory_commentary: string | null
          geographic_regulatory_score: number | null
          id: string
          industry: string | null
          investment_thesis: string | null
          key_watchpoints: string | null
          last_analyst_review_date: string | null
          liquidity_commentary: string | null
          liquidity_score: number | null
          location: string | null
          market_sentiment_commentary: string | null
          market_sentiment_score: number | null
          overall_conviction_score: number | null
          price: number | null
          price_currency: string | null
          product_details: Json | null
          property_type: string | null
          provenance: string | null
          quality_score: number | null
          rental_yield: number | null
          risk_commentary: string | null
          risk_score: number | null
          risks: string | null
          short_description: string | null
          square_footage: number | null
          status: string | null
          strengths: string | null
          sub_category: string
          suitable_investor_type: string | null
          thumbnail_url: string | null
          title: string
          transparency_commentary: string | null
          transparency_score: number | null
          updated_at: string
          uploaded_by: string | null
          value_score: number | null
          year_built: number | null
        }
        Insert: {
          age_condition_commentary?: string | null
          age_condition_score?: number | null
          analyst_rating?: string | null
          annual_revenue?: number | null
          authenticity_verified?: boolean | null
          bathrooms?: number | null
          bedrooms?: number | null
          business_stage?: string | null
          category: string
          complexity_commentary?: string | null
          complexity_score?: number | null
          condition?: string | null
          country?: string | null
          created_at?: string
          employee_count?: number | null
          estimated_appreciation?: number | null
          featured?: boolean | null
          founding_year?: number | null
          full_description?: string | null
          gallery_images?: string[] | null
          geographic_regulatory_commentary?: string | null
          geographic_regulatory_score?: number | null
          id?: string
          industry?: string | null
          investment_thesis?: string | null
          key_watchpoints?: string | null
          last_analyst_review_date?: string | null
          liquidity_commentary?: string | null
          liquidity_score?: number | null
          location?: string | null
          market_sentiment_commentary?: string | null
          market_sentiment_score?: number | null
          overall_conviction_score?: number | null
          price?: number | null
          price_currency?: string | null
          product_details?: Json | null
          property_type?: string | null
          provenance?: string | null
          quality_score?: number | null
          rental_yield?: number | null
          risk_commentary?: string | null
          risk_score?: number | null
          risks?: string | null
          short_description?: string | null
          square_footage?: number | null
          status?: string | null
          strengths?: string | null
          sub_category: string
          suitable_investor_type?: string | null
          thumbnail_url?: string | null
          title: string
          transparency_commentary?: string | null
          transparency_score?: number | null
          updated_at?: string
          uploaded_by?: string | null
          value_score?: number | null
          year_built?: number | null
        }
        Update: {
          age_condition_commentary?: string | null
          age_condition_score?: number | null
          analyst_rating?: string | null
          annual_revenue?: number | null
          authenticity_verified?: boolean | null
          bathrooms?: number | null
          bedrooms?: number | null
          business_stage?: string | null
          category?: string
          complexity_commentary?: string | null
          complexity_score?: number | null
          condition?: string | null
          country?: string | null
          created_at?: string
          employee_count?: number | null
          estimated_appreciation?: number | null
          featured?: boolean | null
          founding_year?: number | null
          full_description?: string | null
          gallery_images?: string[] | null
          geographic_regulatory_commentary?: string | null
          geographic_regulatory_score?: number | null
          id?: string
          industry?: string | null
          investment_thesis?: string | null
          key_watchpoints?: string | null
          last_analyst_review_date?: string | null
          liquidity_commentary?: string | null
          liquidity_score?: number | null
          location?: string | null
          market_sentiment_commentary?: string | null
          market_sentiment_score?: number | null
          overall_conviction_score?: number | null
          price?: number | null
          price_currency?: string | null
          product_details?: Json | null
          property_type?: string | null
          provenance?: string | null
          quality_score?: number | null
          rental_yield?: number | null
          risk_commentary?: string | null
          risk_score?: number | null
          risks?: string | null
          short_description?: string | null
          square_footage?: number | null
          status?: string | null
          strengths?: string | null
          sub_category?: string
          suitable_investor_type?: string | null
          thumbnail_url?: string | null
          title?: string
          transparency_commentary?: string | null
          transparency_score?: number | null
          updated_at?: string
          uploaded_by?: string | null
          value_score?: number | null
          year_built?: number | null
        }
        Relationships: []
      }
      orchestrated_reports: {
        Row: {
          asset_id: string | null
          asset_name: string | null
          asset_type: string | null
          created_at: string
          generated_at: string | null
          id: string
          report_content: Json
          report_title: string
          selected_modules: string[]
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          asset_id?: string | null
          asset_name?: string | null
          asset_type?: string | null
          created_at?: string
          generated_at?: string | null
          id?: string
          report_content: Json
          report_title: string
          selected_modules: string[]
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          asset_id?: string | null
          asset_name?: string | null
          asset_type?: string | null
          created_at?: string
          generated_at?: string | null
          id?: string
          report_content?: Json
          report_title?: string
          selected_modules?: string[]
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payroll_items: {
        Row: {
          created_at: string
          employee_id: string
          federal_tax: number | null
          gross_pay: number
          health_insurance: number | null
          hours_worked: number | null
          id: string
          medicare: number | null
          net_pay: number
          other_deductions: number | null
          payroll_run_id: string
          retirement_401k: number | null
          social_security: number | null
          state_tax: number | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          federal_tax?: number | null
          gross_pay: number
          health_insurance?: number | null
          hours_worked?: number | null
          id?: string
          medicare?: number | null
          net_pay: number
          other_deductions?: number | null
          payroll_run_id: string
          retirement_401k?: number | null
          social_security?: number | null
          state_tax?: number | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          federal_tax?: number | null
          gross_pay?: number
          health_insurance?: number | null
          hours_worked?: number | null
          id?: string
          medicare?: number | null
          net_pay?: number
          other_deductions?: number | null
          payroll_run_id?: string
          retirement_401k?: number | null
          social_security?: number | null
          state_tax?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_items_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          created_at: string
          id: string
          pay_period_end: string
          pay_period_start: string
          payment_date: string
          processed_at: string | null
          processed_by: string | null
          run_date: string
          status: string | null
          total_gross: number | null
          total_net: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          pay_period_end: string
          pay_period_start: string
          payment_date: string
          processed_at?: string | null
          processed_by?: string | null
          run_date: string
          status?: string | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          pay_period_end?: string
          pay_period_start?: string
          payment_date?: string
          processed_at?: string | null
          processed_by?: string | null
          run_date?: string
          status?: string | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pending_invitations: {
        Row: {
          completed_at: string | null
          email: string
          full_name: string
          id: string
          invited_at: string | null
          invited_by: string | null
          invited_role: string
          platform_business: boolean | null
          platform_finance: boolean | null
          platform_investor: boolean | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          email: string
          full_name: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          invited_role: string
          platform_business?: boolean | null
          platform_finance?: boolean | null
          platform_investor?: boolean | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          email?: string
          full_name?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          invited_role?: string
          platform_business?: boolean | null
          platform_finance?: boolean | null
          platform_investor?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      plan_alerts: {
        Row: {
          alert_type: string
          condition_config: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          last_triggered: string | null
          plan_id: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          condition_config: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          plan_id?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          condition_config?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          plan_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_alerts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          plan_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          plan_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          plan_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_comments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_milestones: {
        Row: {
          achievement_date: string | null
          created_at: string
          id: string
          milestone_name: string
          notes: string | null
          plan_id: string
          status: string | null
          target_amount: number | null
          target_date: string
          updated_at: string
        }
        Insert: {
          achievement_date?: string | null
          created_at?: string
          id?: string
          milestone_name: string
          notes?: string | null
          plan_id: string
          status?: string | null
          target_amount?: number | null
          target_date: string
          updated_at?: string
        }
        Update: {
          achievement_date?: string | null
          created_at?: string
          id?: string
          milestone_name?: string
          notes?: string | null
          plan_id?: string
          status?: string | null
          target_amount?: number | null
          target_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_milestones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_recommendations: {
        Row: {
          created_at: string
          description: string
          estimated_cost: number | null
          expected_benefit: string | null
          id: string
          implementation_timeline: string | null
          plan_id: string
          priority: string
          recommendation_type: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          estimated_cost?: number | null
          expected_benefit?: string | null
          id?: string
          implementation_timeline?: string | null
          plan_id: string
          priority: string
          recommendation_type: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          estimated_cost?: number | null
          expected_benefit?: string | null
          id?: string
          implementation_timeline?: string | null
          plan_id?: string
          priority?: string
          recommendation_type?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_recommendations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_saved_views: {
        Row: {
          created_at: string | null
          filter_config: Json
          id: string
          is_default: boolean | null
          updated_at: string | null
          user_id: string
          view_name: string
        }
        Insert: {
          created_at?: string | null
          filter_config: Json
          id?: string
          is_default?: boolean | null
          updated_at?: string | null
          user_id: string
          view_name: string
        }
        Update: {
          created_at?: string | null
          filter_config?: Json
          id?: string
          is_default?: boolean | null
          updated_at?: string | null
          user_id?: string
          view_name?: string
        }
        Relationships: []
      }
      plan_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          plan_id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          plan_id: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          plan_id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_system: boolean | null
          template_data: Json
          template_name: string
          template_type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_system?: boolean | null
          template_data: Json
          template_name: string
          template_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_system?: boolean | null
          template_data?: Json
          template_name?: string
          template_type?: string
        }
        Relationships: []
      }
      plan_versions: {
        Row: {
          change_notes: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          plan_data: Json
          plan_id: string
          version_number: number
        }
        Insert: {
          change_notes?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          plan_data: Json
          plan_id: string
          version_number: number
        }
        Update: {
          change_notes?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          plan_data?: Json
          plan_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_versions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "financial_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_permissions: {
        Row: {
          can_access_analytics: boolean | null
          can_access_automation: boolean | null
          can_access_business_platform: boolean | null
          can_access_calendar: boolean | null
          can_access_chat: boolean | null
          can_access_crm: boolean | null
          can_access_dashboard: boolean | null
          can_access_document_generator: boolean | null
          can_access_finance_platform: boolean | null
          can_access_investor_platform: boolean | null
          can_access_payroll: boolean | null
          can_access_projects: boolean | null
          can_access_revenue: boolean | null
          can_access_security: boolean | null
          can_access_tasks: boolean | null
          can_access_team_management: boolean | null
          created_at: string
          finance_ai_analyst: boolean | null
          finance_ai_chatbot: boolean | null
          finance_automation: boolean | null
          finance_benchmarking_trends: boolean | null
          finance_calendar: boolean | null
          finance_client_management: boolean | null
          finance_client_onboarding: boolean | null
          finance_compliance: boolean | null
          finance_crm: boolean | null
          finance_dashboard: boolean | null
          finance_document_generator: boolean | null
          finance_financial_planning: boolean | null
          finance_fund_database: boolean | null
          finance_goal_planning: boolean | null
          finance_investment_analysis: boolean | null
          finance_market_commentary: boolean | null
          finance_market_data: boolean | null
          finance_model_portfolios: boolean | null
          finance_opportunities: boolean | null
          finance_payroll: boolean | null
          finance_portfolio_management: boolean | null
          finance_practice_management: boolean | null
          finance_reports: boolean | null
          finance_risk_assessment: boolean | null
          finance_scenario_analysis: boolean | null
          finance_screeners: boolean | null
          finance_security: boolean | null
          finance_stocks_crypto: boolean | null
          finance_watchlists: boolean | null
          id: string
          investor_ai_analyst: boolean | null
          investor_analysis_reports: boolean | null
          investor_benchmarking_trends: boolean | null
          investor_dashboard: boolean | null
          investor_fund_database: boolean | null
          investor_learning_hub: boolean | null
          investor_market_commentary: boolean | null
          investor_market_data_hub: boolean | null
          investor_model_portfolios: boolean | null
          investor_newsletters: boolean | null
          investor_opportunities: boolean | null
          investor_research_reports: boolean | null
          investor_risk_compliance: boolean | null
          investor_screeners: boolean | null
          investor_signals_alerts: boolean | null
          investor_stocks_crypto: boolean | null
          investor_tasks: boolean | null
          investor_tools_calculators: boolean | null
          investor_watchlists: boolean | null
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          can_access_analytics?: boolean | null
          can_access_automation?: boolean | null
          can_access_business_platform?: boolean | null
          can_access_calendar?: boolean | null
          can_access_chat?: boolean | null
          can_access_crm?: boolean | null
          can_access_dashboard?: boolean | null
          can_access_document_generator?: boolean | null
          can_access_finance_platform?: boolean | null
          can_access_investor_platform?: boolean | null
          can_access_payroll?: boolean | null
          can_access_projects?: boolean | null
          can_access_revenue?: boolean | null
          can_access_security?: boolean | null
          can_access_tasks?: boolean | null
          can_access_team_management?: boolean | null
          created_at?: string
          finance_ai_analyst?: boolean | null
          finance_ai_chatbot?: boolean | null
          finance_automation?: boolean | null
          finance_benchmarking_trends?: boolean | null
          finance_calendar?: boolean | null
          finance_client_management?: boolean | null
          finance_client_onboarding?: boolean | null
          finance_compliance?: boolean | null
          finance_crm?: boolean | null
          finance_dashboard?: boolean | null
          finance_document_generator?: boolean | null
          finance_financial_planning?: boolean | null
          finance_fund_database?: boolean | null
          finance_goal_planning?: boolean | null
          finance_investment_analysis?: boolean | null
          finance_market_commentary?: boolean | null
          finance_market_data?: boolean | null
          finance_model_portfolios?: boolean | null
          finance_opportunities?: boolean | null
          finance_payroll?: boolean | null
          finance_portfolio_management?: boolean | null
          finance_practice_management?: boolean | null
          finance_reports?: boolean | null
          finance_risk_assessment?: boolean | null
          finance_scenario_analysis?: boolean | null
          finance_screeners?: boolean | null
          finance_security?: boolean | null
          finance_stocks_crypto?: boolean | null
          finance_watchlists?: boolean | null
          id?: string
          investor_ai_analyst?: boolean | null
          investor_analysis_reports?: boolean | null
          investor_benchmarking_trends?: boolean | null
          investor_dashboard?: boolean | null
          investor_fund_database?: boolean | null
          investor_learning_hub?: boolean | null
          investor_market_commentary?: boolean | null
          investor_market_data_hub?: boolean | null
          investor_model_portfolios?: boolean | null
          investor_newsletters?: boolean | null
          investor_opportunities?: boolean | null
          investor_research_reports?: boolean | null
          investor_risk_compliance?: boolean | null
          investor_screeners?: boolean | null
          investor_signals_alerts?: boolean | null
          investor_stocks_crypto?: boolean | null
          investor_tasks?: boolean | null
          investor_tools_calculators?: boolean | null
          investor_watchlists?: boolean | null
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          can_access_analytics?: boolean | null
          can_access_automation?: boolean | null
          can_access_business_platform?: boolean | null
          can_access_calendar?: boolean | null
          can_access_chat?: boolean | null
          can_access_crm?: boolean | null
          can_access_dashboard?: boolean | null
          can_access_document_generator?: boolean | null
          can_access_finance_platform?: boolean | null
          can_access_investor_platform?: boolean | null
          can_access_payroll?: boolean | null
          can_access_projects?: boolean | null
          can_access_revenue?: boolean | null
          can_access_security?: boolean | null
          can_access_tasks?: boolean | null
          can_access_team_management?: boolean | null
          created_at?: string
          finance_ai_analyst?: boolean | null
          finance_ai_chatbot?: boolean | null
          finance_automation?: boolean | null
          finance_benchmarking_trends?: boolean | null
          finance_calendar?: boolean | null
          finance_client_management?: boolean | null
          finance_client_onboarding?: boolean | null
          finance_compliance?: boolean | null
          finance_crm?: boolean | null
          finance_dashboard?: boolean | null
          finance_document_generator?: boolean | null
          finance_financial_planning?: boolean | null
          finance_fund_database?: boolean | null
          finance_goal_planning?: boolean | null
          finance_investment_analysis?: boolean | null
          finance_market_commentary?: boolean | null
          finance_market_data?: boolean | null
          finance_model_portfolios?: boolean | null
          finance_opportunities?: boolean | null
          finance_payroll?: boolean | null
          finance_portfolio_management?: boolean | null
          finance_practice_management?: boolean | null
          finance_reports?: boolean | null
          finance_risk_assessment?: boolean | null
          finance_scenario_analysis?: boolean | null
          finance_screeners?: boolean | null
          finance_security?: boolean | null
          finance_stocks_crypto?: boolean | null
          finance_watchlists?: boolean | null
          id?: string
          investor_ai_analyst?: boolean | null
          investor_analysis_reports?: boolean | null
          investor_benchmarking_trends?: boolean | null
          investor_dashboard?: boolean | null
          investor_fund_database?: boolean | null
          investor_learning_hub?: boolean | null
          investor_market_commentary?: boolean | null
          investor_market_data_hub?: boolean | null
          investor_model_portfolios?: boolean | null
          investor_newsletters?: boolean | null
          investor_opportunities?: boolean | null
          investor_research_reports?: boolean | null
          investor_risk_compliance?: boolean | null
          investor_screeners?: boolean | null
          investor_signals_alerts?: boolean | null
          investor_stocks_crypto?: boolean | null
          investor_tasks?: boolean | null
          investor_tools_calculators?: boolean | null
          investor_watchlists?: boolean | null
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_benchmarks: {
        Row: {
          ai_analysis: string | null
          benchmark_name: string
          comparison_data: Json
          created_at: string | null
          id: string
          portfolio_id: string | null
        }
        Insert: {
          ai_analysis?: string | null
          benchmark_name: string
          comparison_data: Json
          created_at?: string | null
          id?: string
          portfolio_id?: string | null
        }
        Update: {
          ai_analysis?: string | null
          benchmark_name?: string
          comparison_data?: Json
          created_at?: string | null
          id?: string
          portfolio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_benchmarks_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_holdings: {
        Row: {
          allocation_percentage: number | null
          asset_name: string
          asset_type: string
          client_id: string
          created_at: string
          current_value: number | null
          id: string
          purchase_date: string | null
          purchase_price: number | null
          quantity: number | null
          symbol: string | null
          updated_at: string
        }
        Insert: {
          allocation_percentage?: number | null
          asset_name: string
          asset_type: string
          client_id: string
          created_at?: string
          current_value?: number | null
          id?: string
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number | null
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          allocation_percentage?: number | null
          asset_name?: string
          asset_type?: string
          client_id?: string
          created_at?: string
          current_value?: number | null
          id?: string
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number | null
          symbol?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_watchlist: {
        Row: {
          affected_clients: number | null
          asset_name: string
          created_at: string | null
          current_price: number | null
          daily_change: number | null
          daily_change_percent: number | null
          id: string
          last_updated: string | null
          platform: string | null
          symbol: string
          user_id: string | null
        }
        Insert: {
          affected_clients?: number | null
          asset_name: string
          created_at?: string | null
          current_price?: number | null
          daily_change?: number | null
          daily_change_percent?: number | null
          id?: string
          last_updated?: string | null
          platform?: string | null
          symbol: string
          user_id?: string | null
        }
        Update: {
          affected_clients?: number | null
          asset_name?: string
          created_at?: string | null
          current_price?: number | null
          daily_change?: number | null
          daily_change_percent?: number | null
          id?: string
          last_updated?: string | null
          platform?: string | null
          symbol?: string
          user_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          assigned_to: string[] | null
          attachments: Json | null
          budget: number | null
          completed_date: string | null
          created_at: string | null
          deadline: string
          description: string | null
          id: string
          milestones: Json | null
          notes: string | null
          priority: string
          progress: number
          project_name: string
          start_date: string | null
          status: string
          tags: string[] | null
          team_size: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string[] | null
          attachments?: Json | null
          budget?: number | null
          completed_date?: string | null
          created_at?: string | null
          deadline: string
          description?: string | null
          id?: string
          milestones?: Json | null
          notes?: string | null
          priority?: string
          progress?: number
          project_name: string
          start_date?: string | null
          status?: string
          tags?: string[] | null
          team_size?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string[] | null
          attachments?: Json | null
          budget?: number | null
          completed_date?: string | null
          created_at?: string | null
          deadline?: string
          description?: string | null
          id?: string
          milestones?: Json | null
          notes?: string | null
          priority?: string
          progress?: number
          project_name?: string
          start_date?: string | null
          status?: string
          tags?: string[] | null
          team_size?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      purchasable_reports: {
        Row: {
          author_name: string | null
          author_title: string | null
          category: string | null
          charts_data: Json | null
          content_images: string[] | null
          created_at: string
          currency: string
          description: string | null
          download_count: number | null
          featured: boolean | null
          file_path: string
          id: string
          is_published: boolean | null
          key_insights: string[] | null
          page_count: number | null
          preview_images: string[] | null
          price_cents: number
          reading_time: string | null
          stripe_price_id: string | null
          tags: string[] | null
          teaser_content: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          author_name?: string | null
          author_title?: string | null
          category?: string | null
          charts_data?: Json | null
          content_images?: string[] | null
          created_at?: string
          currency?: string
          description?: string | null
          download_count?: number | null
          featured?: boolean | null
          file_path: string
          id?: string
          is_published?: boolean | null
          key_insights?: string[] | null
          page_count?: number | null
          preview_images?: string[] | null
          price_cents?: number
          reading_time?: string | null
          stripe_price_id?: string | null
          tags?: string[] | null
          teaser_content?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          author_name?: string | null
          author_title?: string | null
          category?: string | null
          charts_data?: Json | null
          content_images?: string[] | null
          created_at?: string
          currency?: string
          description?: string | null
          download_count?: number | null
          featured?: boolean | null
          file_path?: string
          id?: string
          is_published?: boolean | null
          key_insights?: string[] | null
          page_count?: number | null
          preview_images?: string[] | null
          price_cents?: number
          reading_time?: string | null
          stripe_price_id?: string | null
          tags?: string[] | null
          teaser_content?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      regulatory_updates: {
        Row: {
          ai_generated: boolean | null
          category: string
          content: string
          created_at: string | null
          file_path: string | null
          id: string
          source: string | null
          summary: string
          title: string
          update_date: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          category: string
          content: string
          created_at?: string | null
          file_path?: string | null
          id?: string
          source?: string | null
          summary: string
          title: string
          update_date?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          category?: string
          content?: string
          created_at?: string | null
          file_path?: string | null
          id?: string
          source?: string | null
          summary?: string
          title?: string
          update_date?: string | null
        }
        Relationships: []
      }
      report_purchases: {
        Row: {
          amount_paid: number
          currency: string
          email: string | null
          id: string
          purchased_at: string
          report_id: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_paid: number
          currency?: string
          email?: string | null
          id?: string
          purchased_at?: string
          report_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_paid?: number
          currency?: string
          email?: string | null
          id?: string
          purchased_at?: string
          report_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_purchases_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "purchasable_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          file_path: string
          id: string
          platform: string
          published_date: string | null
          report_category: string | null
          report_type: string
          target_user_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_path: string
          id?: string
          platform: string
          published_date?: string | null
          report_category?: string | null
          report_type: string
          target_user_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_path?: string
          id?: string
          platform?: string
          published_date?: string | null
          report_category?: string | null
          report_type?: string
          target_user_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      research_change_log: {
        Row: {
          asset_id: string
          asset_type: string
          change_summary: string
          change_type: string
          created_at: string
          id: string
          new_values: Json | null
          previous_values: Json | null
          report_id: string | null
          significance: string | null
        }
        Insert: {
          asset_id: string
          asset_type: string
          change_summary: string
          change_type: string
          created_at?: string
          id?: string
          new_values?: Json | null
          previous_values?: Json | null
          report_id?: string | null
          significance?: string | null
        }
        Update: {
          asset_id?: string
          asset_type?: string
          change_summary?: string
          change_type?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          previous_values?: Json | null
          report_id?: string | null
          significance?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_change_log_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "asset_research_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      research_generation_queue: {
        Row: {
          asset_data: Json | null
          asset_id: string
          asset_name: string
          asset_symbol: string | null
          asset_type: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          priority: number | null
          retry_count: number | null
          scheduled_for: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          asset_data?: Json | null
          asset_id: string
          asset_name: string
          asset_symbol?: string | null
          asset_type: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          priority?: number | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          asset_data?: Json | null
          asset_id?: string
          asset_name?: string
          asset_symbol?: string | null
          asset_type?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          priority?: number | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      risk_assessment_reports: {
        Row: {
          created_at: string | null
          id: string
          report_data: Json
          report_name: string
          report_type: string
          summary: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_data: Json
          report_name: string
          report_type: string
          summary?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          report_data?: Json
          report_name?: string
          report_type?: string
          summary?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          department: string
          id: string
          permissions_schema: Json
          role_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department: string
          id?: string
          permissions_schema?: Json
          role_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          id?: string
          permissions_schema?: Json
          role_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      scraped_companies: {
        Row: {
          company_name: string
          company_number: string
          company_status: string | null
          created_at: string
          id: string
          incorporation_date: string | null
          registered_address: string | null
          scrape_id: string | null
          sic_codes: string[] | null
        }
        Insert: {
          company_name: string
          company_number: string
          company_status?: string | null
          created_at?: string
          id?: string
          incorporation_date?: string | null
          registered_address?: string | null
          scrape_id?: string | null
          sic_codes?: string[] | null
        }
        Update: {
          company_name?: string
          company_number?: string
          company_status?: string | null
          created_at?: string
          id?: string
          incorporation_date?: string | null
          registered_address?: string | null
          scrape_id?: string | null
          sic_codes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "scraped_companies_scrape_id_fkey"
            columns: ["scrape_id"]
            isOneToOne: false
            referencedRelation: "companies_house_scrapes"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_officers: {
        Row: {
          appointed_date: string | null
          company_id: string | null
          correspondence_address: string | null
          created_at: string
          date_of_birth_month: number | null
          date_of_birth_year: number | null
          full_name: string
          id: string
          nationality: string | null
          officer_role: string
          resigned_date: string | null
          scrape_id: string | null
        }
        Insert: {
          appointed_date?: string | null
          company_id?: string | null
          correspondence_address?: string | null
          created_at?: string
          date_of_birth_month?: number | null
          date_of_birth_year?: number | null
          full_name: string
          id?: string
          nationality?: string | null
          officer_role: string
          resigned_date?: string | null
          scrape_id?: string | null
        }
        Update: {
          appointed_date?: string | null
          company_id?: string | null
          correspondence_address?: string | null
          created_at?: string
          date_of_birth_month?: number | null
          date_of_birth_year?: number | null
          full_name?: string
          id?: string
          nationality?: string | null
          officer_role?: string
          resigned_date?: string | null
          scrape_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraped_officers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "scraped_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraped_officers_scrape_id_fkey"
            columns: ["scrape_id"]
            isOneToOne: false
            referencedRelation: "companies_house_scrapes"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_vault: {
        Row: {
          access_count: number | null
          category: string | null
          created_at: string
          encrypted_data: string
          id: string
          last_accessed: string | null
          metadata: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_count?: number | null
          category?: string | null
          created_at?: string
          encrypted_data: string
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_count?: number | null
          category?: string | null
          created_at?: string
          encrypted_data?: string
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_policies: {
        Row: {
          compliance_frameworks: string[] | null
          created_at: string
          description: string | null
          id: string
          last_reviewed: string | null
          policy_name: string
          policy_type: string
          status: string | null
          updated_at: string
        }
        Insert: {
          compliance_frameworks?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          last_reviewed?: string | null
          policy_name: string
          policy_type: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          compliance_frameworks?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          last_reviewed?: string | null
          policy_name?: string
          policy_type?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stocks_crypto: {
        Row: {
          all_time_high: number | null
          all_time_low: number | null
          analyst_rating: string | null
          asset_type: string
          beta: number | null
          blockchain: string | null
          circulating_supply: number | null
          consensus_mechanism: string | null
          created_at: string
          created_by: string | null
          current_price: number | null
          description: string | null
          dividend_yield: number | null
          eps: number | null
          exchange: string | null
          fifty_two_week_high: number | null
          fifty_two_week_low: number | null
          id: string
          industry: string | null
          investment_thesis: string | null
          is_featured: boolean | null
          key_watchpoints: string | null
          last_updated_by: string | null
          launch_date: string | null
          logo_url: string | null
          market_cap: number | null
          name: string
          overall_score: number | null
          pe_ratio: number | null
          price_change_1y: number | null
          price_change_24h: number | null
          price_change_30d: number | null
          price_change_7d: number | null
          price_currency: string | null
          rating_rationale: string | null
          risks: string | null
          score_fundamentals: number | null
          score_momentum: number | null
          score_risk: number | null
          score_technicals: number | null
          sector: string | null
          status: string | null
          strengths: string | null
          suitable_investor_type: string | null
          symbol: string
          total_supply: number | null
          updated_at: string
          volume_24h: number | null
        }
        Insert: {
          all_time_high?: number | null
          all_time_low?: number | null
          analyst_rating?: string | null
          asset_type: string
          beta?: number | null
          blockchain?: string | null
          circulating_supply?: number | null
          consensus_mechanism?: string | null
          created_at?: string
          created_by?: string | null
          current_price?: number | null
          description?: string | null
          dividend_yield?: number | null
          eps?: number | null
          exchange?: string | null
          fifty_two_week_high?: number | null
          fifty_two_week_low?: number | null
          id?: string
          industry?: string | null
          investment_thesis?: string | null
          is_featured?: boolean | null
          key_watchpoints?: string | null
          last_updated_by?: string | null
          launch_date?: string | null
          logo_url?: string | null
          market_cap?: number | null
          name: string
          overall_score?: number | null
          pe_ratio?: number | null
          price_change_1y?: number | null
          price_change_24h?: number | null
          price_change_30d?: number | null
          price_change_7d?: number | null
          price_currency?: string | null
          rating_rationale?: string | null
          risks?: string | null
          score_fundamentals?: number | null
          score_momentum?: number | null
          score_risk?: number | null
          score_technicals?: number | null
          sector?: string | null
          status?: string | null
          strengths?: string | null
          suitable_investor_type?: string | null
          symbol: string
          total_supply?: number | null
          updated_at?: string
          volume_24h?: number | null
        }
        Update: {
          all_time_high?: number | null
          all_time_low?: number | null
          analyst_rating?: string | null
          asset_type?: string
          beta?: number | null
          blockchain?: string | null
          circulating_supply?: number | null
          consensus_mechanism?: string | null
          created_at?: string
          created_by?: string | null
          current_price?: number | null
          description?: string | null
          dividend_yield?: number | null
          eps?: number | null
          exchange?: string | null
          fifty_two_week_high?: number | null
          fifty_two_week_low?: number | null
          id?: string
          industry?: string | null
          investment_thesis?: string | null
          is_featured?: boolean | null
          key_watchpoints?: string | null
          last_updated_by?: string | null
          launch_date?: string | null
          logo_url?: string | null
          market_cap?: number | null
          name?: string
          overall_score?: number | null
          pe_ratio?: number | null
          price_change_1y?: number | null
          price_change_24h?: number | null
          price_change_30d?: number | null
          price_change_7d?: number | null
          price_currency?: string | null
          rating_rationale?: string | null
          risks?: string | null
          score_fundamentals?: number | null
          score_momentum?: number | null
          score_risk?: number | null
          score_technicals?: number | null
          sector?: string | null
          status?: string | null
          strengths?: string | null
          suitable_investor_type?: string | null
          symbol?: string
          total_supply?: number | null
          updated_at?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_name: string
          platform: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_name: string
          platform: string
          status?: string
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_name?: string
          platform?: string
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tax_settings: {
        Row: {
          created_at: string
          federal_rate: number | null
          id: string
          medicare_rate: number | null
          social_security_rate: number | null
          state: string | null
          state_rate: number | null
          unemployment_rate: number | null
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          federal_rate?: number | null
          id?: string
          medicare_rate?: number | null
          social_security_rate?: number | null
          state?: string | null
          state_rate?: number | null
          unemployment_rate?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          federal_rate?: number | null
          id?: string
          medicare_rate?: number | null
          social_security_rate?: number | null
          state?: string | null
          state_rate?: number | null
          unemployment_rate?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string
          email: string
          first_name: string
          id: string
          join_date: string
          last_name: string
          permissions: Json | null
          phone: string | null
          role_id: string | null
          role_title: string
          status: string
          updated_at: string | null
          user_id: string | null
          utilization_score: number | null
          workload_score: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department: string
          email: string
          first_name: string
          id?: string
          join_date?: string
          last_name: string
          permissions?: Json | null
          phone?: string | null
          role_id?: string | null
          role_title: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
          utilization_score?: number | null
          workload_score?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string
          email?: string
          first_name?: string
          id?: string
          join_date?: string
          last_name?: string
          permissions?: Json | null
          phone?: string | null
          role_id?: string | null
          role_title?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
          utilization_score?: number | null
          workload_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_role"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_message_threads: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participants: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participants: string[]
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participants?: string[]
        }
        Relationships: []
      }
      team_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_off_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          days_requested: number
          employee_id: string
          end_date: string
          id: string
          notes: string | null
          request_type: string
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_requested: number
          employee_id: string
          end_date: string
          id?: string
          notes?: string | null
          request_type: string
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_requested?: number
          employee_id?: string
          end_date?: string
          id?: string
          notes?: string | null
          request_type?: string
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_off_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_portfolio: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notes: string | null
          purchase_date: string
          purchase_price: number
          quantity: number
          symbol: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          purchase_date: string
          purchase_price: number
          quantity?: number
          symbol: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          purchase_date?: string
          purchase_price?: number
          quantity?: number
          symbol?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_portfolios: {
        Row: {
          created_at: string | null
          holdings: Json
          id: string
          metadata: Json | null
          platform: string | null
          portfolio_name: string
          total_value: number | null
          updated_at: string | null
          upload_date: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          holdings: Json
          id?: string
          metadata?: Json | null
          platform?: string | null
          portfolio_name: string
          total_value?: number | null
          updated_at?: string | null
          upload_date?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          holdings?: Json
          id?: string
          metadata?: Json | null
          platform?: string | null
          portfolio_name?: string
          total_value?: number | null
          updated_at?: string | null
          upload_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          language: string | null
          phone: string | null
          position: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          phone?: string | null
          position?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          phone?: string | null
          position?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_report_access: {
        Row: {
          granted_at: string | null
          id: string
          report_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          id?: string
          report_id: string
          user_id: string
        }
        Update: {
          granted_at?: string | null
          id?: string
          report_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_report_access_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          accent_color: string | null
          compact_view: boolean | null
          created_at: string
          dark_mode: boolean | null
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          push_notifications: boolean | null
          task_reminders: boolean | null
          updated_at: string
          user_id: string
          weekly_reports: boolean | null
        }
        Insert: {
          accent_color?: string | null
          compact_view?: boolean | null
          created_at?: string
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          task_reminders?: boolean | null
          updated_at?: string
          user_id: string
          weekly_reports?: boolean | null
        }
        Update: {
          accent_color?: string | null
          compact_view?: boolean | null
          created_at?: string
          dark_mode?: boolean | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          task_reminders?: boolean | null
          updated_at?: string
          user_id?: string
          weekly_reports?: boolean | null
        }
        Relationships: []
      }
      vacancies: {
        Row: {
          application_deadline: string | null
          benefits: string[] | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          id: string
          job_description: string
          job_location: string
          job_sector: string
          job_title: string
          job_type: string
          key_responsibilities: string[] | null
          number_of_positions: number | null
          preferred_qualifications: string[] | null
          remote_work: boolean | null
          required_qualifications: string[] | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          start_date: string | null
          status: string | null
          updated_at: string
          user_id: string | null
          visa_sponsorship: boolean | null
        }
        Insert: {
          application_deadline?: string | null
          benefits?: string[] | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          id?: string
          job_description: string
          job_location: string
          job_sector: string
          job_title: string
          job_type: string
          key_responsibilities?: string[] | null
          number_of_positions?: number | null
          preferred_qualifications?: string[] | null
          remote_work?: boolean | null
          required_qualifications?: string[] | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          visa_sponsorship?: boolean | null
        }
        Update: {
          application_deadline?: string | null
          benefits?: string[] | null
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          job_description?: string
          job_location?: string
          job_sector?: string
          job_title?: string
          job_type?: string
          key_responsibilities?: string[] | null
          number_of_positions?: number | null
          preferred_qualifications?: string[] | null
          remote_work?: boolean | null
          required_qualifications?: string[] | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          visa_sponsorship?: boolean | null
        }
        Relationships: []
      }
      watchlist_items: {
        Row: {
          added_at: string | null
          id: string
          name: string
          notes: string | null
          symbol: string
          watchlist_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          name: string
          notes?: string | null
          symbol: string
          watchlist_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          symbol?: string
          watchlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "investment_watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      workload_items: {
        Row: {
          created_at: string | null
          due_date: string | null
          hours_estimated: number | null
          hours_logged: number | null
          id: string
          member_id: string
          priority: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          hours_estimated?: number | null
          hours_logged?: number | null
          id?: string
          member_id: string
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          hours_estimated?: number | null
          hours_logged?: number | null
          id?: string
          member_id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workload_items_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_cron_run: {
        Args: { cron_expr: string; tz?: string }
        Returns: string
      }
      check_user_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      grant_platform_access: {
        Args: {
          _business?: boolean
          _finance?: boolean
          _investor?: boolean
          _user_id: string
        }
        Returns: undefined
      }
      has_platform_access: {
        Args: { _platform: string; _user_id: string }
        Returns: boolean
      }
      increment_learning_content_views: {
        Args: { content_id: string }
        Returns: undefined
      }
      increment_report_downloads: {
        Args: { report_id: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_hr_admin: { Args: { _user_id: string }; Returns: boolean }
      is_payroll_admin: { Args: { _user_id: string }; Returns: boolean }
      update_tab_permissions: {
        Args: { _permissions: Json; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role:
        | "admin"
        | "manager"
        | "analyst"
        | "viewer"
        | "hr_admin"
        | "payroll_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: [
        "admin",
        "manager",
        "analyst",
        "viewer",
        "hr_admin",
        "payroll_admin",
      ],
    },
  },
} as const
