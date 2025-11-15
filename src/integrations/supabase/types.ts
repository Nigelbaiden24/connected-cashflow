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
          client_id: string
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
        }
        Insert: {
          action_items?: string[] | null
          agenda?: string[] | null
          client_id: string
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
        }
        Update: {
          action_items?: string[] | null
          agenda?: string[] | null
          client_id?: string
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
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          priority: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
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
        }
        Relationships: []
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
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          file_path: string
          id: string
          platform: string
          published_date: string | null
          report_type: string
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
          report_type: string
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
          report_type?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_cron_run: {
        Args: { cron_expr: string; tz?: string }
        Returns: string
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      user_role: "admin" | "manager" | "analyst" | "viewer"
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
      user_role: ["admin", "manager", "analyst", "viewer"],
    },
  },
} as const
